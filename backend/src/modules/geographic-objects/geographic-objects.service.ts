import { eq, and, count, inArray, ilike, SQL } from 'drizzle-orm';
import { db } from '../../db/db';
import {
  geographicObjects,
  applications,
  applicationHistory,
  districts,
  objectTypes,
} from '../../db/schema';
import { AppError } from '../../utils/appError';
import type { JwtPayload } from '../auth/auth.service';
import type {
  CreateGeographicObjectInput,
  UpdateGeometryInput,
  UpdateObjectNamesInput,
  UpdateRegistryObjectInput,
} from './geographic-objects.schema';

function generateApplicationNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `GEO-${year}-${random}`;
}

function generateRegistryNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `REG-${year}-${random}`;
}

export async function getMyObjects(
  user: JwtPayload,
  query: { page: number; limit: number },
) {
  const { page, limit } = query;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [eq(geographicObjects.createdBy, user.userId)];
  if (user.districtId) {
    conditions.push(eq(geographicObjects.districtId, user.districtId));
  }
  const where = and(...conditions);

  const [data, [{ total }]] = await Promise.all([
    db.query.geographicObjects.findMany({
      where,
      with: {
        objectType: { with: { category: true } },
        region: true,
        district: true,
        application: {
          columns: { id: true, applicationNumber: true, currentStatus: true },
        },
      },
      limit,
      offset,
      orderBy: (o, { desc }) => desc(o.createdAt),
    }),
    db.select({ total: count() }).from(geographicObjects).where(where),
  ]);

  return {
    data,
    meta: { total: Number(total), page, limit, totalPages: Math.ceil(Number(total) / limit) },
  };
}

export async function getObjectById(id: number) {
  const obj = await db.query.geographicObjects.findFirst({
    where: eq(geographicObjects.id, id),
    with: {
      objectType: { with: { category: true } },
      region: true,
      district: true,
      creator: {
        columns: { id: true, username: true, fullName: true, role: true },
      },
      application: {
        with: {
          history: {
            with: {
              performer: { columns: { id: true, username: true, fullName: true, role: true } },
            },
            orderBy: (h: { createdAt: unknown }, { asc }: { asc: (col: unknown) => unknown }) => asc(h.createdAt),
          },
        },
      },
    },
  });

  if (!obj) throw new AppError("Geografik ob'yekt topilmadi", 404);
  return obj;
}

export async function createGeographicObjects(
  input: CreateGeographicObjectInput,
  user: JwtPayload,
) {
  const [district] = await db
    .select()
    .from(districts)
    .where(and(eq(districts.id, input.districtId), eq(districts.regionId, input.regionId)));
  if (!district) throw new AppError("Tuman yoki viloyat noto'g'ri", 400);

  if (input.existsInRegistry) {
    const missingReg = input.objects.some((o) => !o.registryNumber?.trim());
    if (missingReg) {
      throw new AppError("Reestrdа mavjud ob'yektlar uchun reyestr raqami kiritilishi shart", 400);
    }
    const missingType = input.objects.some((o) => !o.objectTypeId);
    if (missingType) {
      throw new AppError("Reestrdа mavjud ob'yektlar uchun ob'yekt turi (object_type_id) kiritilishi shart", 400);
    }
  }

  return db.transaction(async (tx) => {
    const [app] = await tx
      .insert(applications)
      .values({
        applicationNumber: generateApplicationNumber(),
        currentStatus: 'step_1_geometry_uploaded',
        createdBy: user.userId,
      })
      .returning();

    const geoObjs = await tx
      .insert(geographicObjects)
      .values(
        input.objects.map((obj) => ({
          applicationId: app.id,
          nameUz: obj.nameUz ?? null,
          nameKrill: obj.nameKrill ?? null,
          objectTypeId: obj.objectTypeId ?? null,
          regionId: input.regionId,
          districtId: input.districtId,
          geometry: obj.geometry,
          existsInRegistry: input.existsInRegistry,
          registryNumber: input.existsInRegistry ? (obj.registryNumber ?? null) : null,
          createdBy: user.userId,
        })),
      )
      .returning();

    await tx.insert(applicationHistory).values({
      applicationId: app.id,
      fromStatus: null,
      toStatus: 'step_1_geometry_uploaded',
      actionType: 'submit',
      performedBy: user.userId,
      comment: `${geoObjs.length} ta geografik ob'yekt geometriyasi yuklandi`,
    });

    return { application: app, geographicObjects: geoObjs };
  });
}

// Tuman hokimligi: nomlarni kiritadi va reyestr raqamlarini avtomatik shakllantiradi
export async function updateObjectNames(
  applicationId: number,
  input: UpdateObjectNamesInput,
  user: JwtPayload,
) {
  // Barcha ob'yektlar shu arizaga tegishliligini tekshiramiz
  const objectIds = input.objects.map((o) => o.id);
  const existing = await db.query.geographicObjects.findMany({
    where: and(
      eq(geographicObjects.applicationId, applicationId),
      inArray(geographicObjects.id, objectIds),
    ),
  });

  if (existing.length !== objectIds.length) {
    throw new AppError("Bir yoki bir nechta ob'yekt bu arizaga tegishli emas", 400);
  }

  await db.transaction(async (tx) => {
    for (const obj of input.objects) {
      const current = existing.find((e) => e.id === obj.id)!;
      await tx
        .update(geographicObjects)
        .set({
          nameUz: obj.nameUz,
          nameKrill: obj.nameKrill ?? null,
          objectTypeId: obj.objectTypeId,
          registryNumber: current.existsInRegistry
            ? current.registryNumber
            : generateRegistryNumber(),
          updatedAt: new Date(),
        })
        .where(eq(geographicObjects.id, obj.id));
    }
  });
}

export async function getRegistry(query: {
  page: number;
  limit: number;
  search?: string;
  regionId?: number;
  districtId?: number;
  objectTypeId?: number;
  categoryId?: number;
}) {
  const { page, limit, search, regionId, districtId, objectTypeId, categoryId } = query;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [];
  if (regionId) conditions.push(eq(geographicObjects.regionId, regionId));
  if (districtId) conditions.push(eq(geographicObjects.districtId, districtId));
  if (objectTypeId) {
    conditions.push(eq(geographicObjects.objectTypeId, objectTypeId));
  } else if (categoryId) {
    const typeIds = (
      await db
        .select({ id: objectTypes.id })
        .from(objectTypes)
        .where(eq(objectTypes.categoryId, categoryId))
    ).map((t) => t.id);
    if (typeIds.length > 0) {
      conditions.push(inArray(geographicObjects.objectTypeId, typeIds));
    }
  }
  if (search) {
    conditions.push(ilike(geographicObjects.nameUz, `%${search}%`));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, [{ total }]] = await Promise.all([
    db.query.geographicObjects.findMany({
      where,
      with: {
        objectType: { with: { category: true } },
        region: true,
        district: true,
      },
      limit,
      offset,
      orderBy: (o, { asc }) => asc(o.nameUz),
    }),
    db.select({ total: count() }).from(geographicObjects).where(where),
  ]);

  return {
    data,
    meta: { total: Number(total), page, limit, totalPages: Math.ceil(Number(total) / limit) },
  };
}

export async function updateRegistryObject(
  id: number,
  input: UpdateRegistryObjectInput,
) {
  const obj = await db.query.geographicObjects.findFirst({
    where: eq(geographicObjects.id, id),
  });
  if (!obj) throw new AppError("Geografik ob'yekt topilmadi", 404);

  const [updated] = await db
    .update(geographicObjects)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(geographicObjects.id, id))
    .returning();

  return updated;
}

export async function deleteRegistryObject(id: number) {
  const obj = await db.query.geographicObjects.findFirst({
    where: eq(geographicObjects.id, id),
  });
  if (!obj) throw new AppError("Geografik ob'yekt topilmadi", 404);

  await db.delete(geographicObjects).where(eq(geographicObjects.id, id));
}

export async function updateGeometry(
  id: number,
  input: UpdateGeometryInput,
  user: JwtPayload,
) {
  const obj = await db.query.geographicObjects.findFirst({
    where: eq(geographicObjects.id, id),
  });
  if (!obj) throw new AppError("Geografik ob'yekt topilmadi", 404);
  if (obj.createdBy !== user.userId) {
    throw new AppError("Siz faqat o'z ob'yektlaringizni tahrirlashingiz mumkin", 403);
  }

  const [updated] = await db
    .update(geographicObjects)
    .set({ geometry: input.geometry, updatedAt: new Date() })
    .where(eq(geographicObjects.id, id))
    .returning();

  return updated;
}
