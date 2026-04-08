import { eq, and, count, SQL } from 'drizzle-orm';
import { db } from '../../db/db';
import {
  geographicObjects,
  applications,
  applicationHistory,
  objectTypes,
  districts,
} from '../../db/schema';
import { AppError } from '../../utils/appError';
import type { JwtPayload } from '../auth/auth.service';
import type { CreateGeographicObjectInput, UpdateGeometryInput } from './geographic-objects.schema';

function generateApplicationNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `GEO-${year}-${random}`;
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
      application: true,
    },
  });

  if (!obj) throw new AppError("Geografik ob'yekt topilmadi", 404);
  return obj;
}

export async function createGeographicObjects(
  input: CreateGeographicObjectInput,
  user: JwtPayload,
) {
  // Tuman va viloyat tekshiruvi
  const [district] = await db
    .select()
    .from(districts)
    .where(
      and(
        eq(districts.id, input.districtId),
        eq(districts.regionId, input.regionId),
      ),
    );
  if (!district) throw new AppError("Tuman yoki viloyat noto'g'ri", 400);

  // Ob'yekt turi tekshiruvi
  const [objType] = await db
    .select()
    .from(objectTypes)
    .where(eq(objectTypes.id, input.objectTypeId));
  if (!objType) throw new AppError("Ob'yekt turi topilmadi", 404);

  // Reestr raqami tekshiruvi
  if (input.existsInRegistry) {
    const missingRegistry = input.objects.some((o) => !o.registryNumber);
    if (missingRegistry) {
      throw new AppError("Reestrdа mavjud ob'yektlar uchun reyestr raqami kiritilishi shart", 400);
    }
  }

  return db.transaction(async (tx) => {
    // 1) Ariza yaratish
    const [app] = await tx
      .insert(applications)
      .values({
        applicationNumber: generateApplicationNumber(),
        currentStatus: 'step_1_geometry_uploaded',
        createdBy: user.userId,
      })
      .returning();

    // 2) Barcha geografik ob'yektlarni yaratish
    const geoObjs = await tx
      .insert(geographicObjects)
      .values(
        input.objects.map((obj) => ({
          applicationId: app.id,
          nameUz: obj.nameUz,
          nameKrill: obj.nameKrill,
          objectTypeId: input.objectTypeId,
          regionId: input.regionId,
          districtId: input.districtId,
          geometry: obj.geometry,
          existsInRegistry: input.existsInRegistry,
          registryNumber: obj.registryNumber,
          createdBy: user.userId,
        })),
      )
      .returning();

    // 3) Dastlabki tarix yozuvi
    await tx.insert(applicationHistory).values({
      applicationId: app.id,
      fromStatus: null,
      toStatus: 'step_1_geometry_uploaded',
      actionType: 'submit',
      performedBy: user.userId,
      comment: `${geoObjs.length} ta geografik ob'yekt yaratildi`,
    });

    return { application: app, geographicObjects: geoObjs };
  });
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
