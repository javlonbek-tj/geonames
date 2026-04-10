import { eq, inArray, and, count } from 'drizzle-orm';
import { db } from '../../db/db';
import { applications, applicationHistory, geographicObjects, commissionApprovals } from '../../db/schema';
import { REQUIRED_POSITIONS } from '../commission/commission.service';
import { createDiscussion } from '../public/public.service';
import { AppError } from '../../utils/appError';
import { resolveTransition, getAvailableActions } from './workflow';
import type { JwtPayload } from '../auth/auth.service';
import type { PerformActionInput } from './applications.schema';

// Har bir rol uchun tegishli holatlar
const ROLE_STATUSES: Record<string, string[]> = {
  dkp_filial:          ['step_1_geometry_uploaded'],
  dkp_regional:        ['step_1_1_dkp_regional'],
  dkp_central:         ['step_1_2_dkp_coordination', 'step_5_dkp_central'],
  district_hokimlik:   ['step_2_district_hokimlik', 'step_2_public_discussion', 'step_2_1_district_commission', 'step_8_district_hokimlik'],
  district_commission: ['step_2_1_district_commission'],
  regional_commission: ['step_2_2_regional_commission'],
  regional_hokimlik:   ['step_3_regional_hokimlik', 'step_7_regional_hokimlik'],
  kadastr_agency:      ['step_4_kadastr_agency', 'step_6_kadastr_agency_final'],
  peoples_council:     ['step_9_peoples_council'],
};

const GEO_WITH = {
  with: {
    region: true,
    district: true,
    objectType: { with: { category: true } },
  },
} as const;

export async function getApplications(
  user: JwtPayload,
  query: { page: number; limit: number; status?: string; tab?: string },
) {
  const { page, limit, status, tab } = query;
  const offset = (page - 1) * limit;

  if (tab === 'history' && user.role !== 'admin') {
    return getHistoricalApplications(user, { page, limit, offset });
  }

  if (user.role === 'admin') {
    const [data, [{ total }]] = await Promise.all([
      db.query.applications.findMany({
        with: {
          geographicObjects: GEO_WITH,
          creator: { columns: { id: true, username: true, fullName: true } },
        },
        where: status ? eq(applications.currentStatus, status as any) : undefined,
        limit,
        offset,
        orderBy: (a, { desc }) => desc(a.updatedAt),
      }),
      db.select({ total: count() }).from(applications).where(
        status ? eq(applications.currentStatus, status as any) : undefined,
      ),
    ]);
    return { data, meta: { total: Number(total), page, limit, totalPages: Math.ceil(Number(total) / limit) } };
  }

  const allowedStatuses = ROLE_STATUSES[user.role] ?? [];
  if (allowedStatuses.length === 0) {
    return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
  }

  const statusFilter = status && allowedStatuses.includes(status)
    ? [status]
    : allowedStatuses;

  const allApps = await db.query.applications.findMany({
    where: inArray(applications.currentStatus, statusFilter as any[]),
    with: {
      geographicObjects: GEO_WITH,
      creator: { columns: { id: true, username: true, fullName: true } },
    },
    orderBy: (a, { desc }) => desc(a.updatedAt),
  });

  const filtered = allApps.filter((app) => {
    // Barcha ob'yektlar bir tuman/viloyatda bo'ladi, birinchisini tekshirish yetarli
    const geo = app.geographicObjects?.[0];
    if (!geo) return false;

    const isDistrictRole = ['dkp_filial', 'district_commission', 'district_hokimlik'].includes(user.role);
    const isRegionalRole = ['dkp_regional', 'regional_commission', 'regional_hokimlik'].includes(user.role);

    if (isDistrictRole && user.districtId) return geo.districtId === user.districtId;
    if (isRegionalRole && user.regionId) return geo.regionId === user.regionId;
    return true;
  });

  const total = filtered.length;
  const data = filtered.slice(offset, offset + limit);

  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

async function getHistoricalApplications(
  user: JwtPayload,
  { page, limit, offset }: { page: number; limit: number; offset: number },
) {
  const activeStatuses = ROLE_STATUSES[user.role] ?? [];

  const historyEntries = await db.query.applicationHistory.findMany({
    with: {
      application: {
        with: {
          geographicObjects: GEO_WITH,
          creator: { columns: { id: true, username: true, fullName: true } },
        },
      },
    },
    where: inArray(applicationHistory.fromStatus, activeStatuses as any[]),
  });

  const seen = new Set<number>();
  const allApps = historyEntries
    .map((h) => h.application)
    .filter((app) => {
      if (!app || seen.has(app.id)) return false;
      if (activeStatuses.includes(app.currentStatus)) return false;
      seen.add(app.id);
      return true;
    });

  const filtered = allApps.filter((app) => {
    const geo = app.geographicObjects?.[0];
    if (!geo) return false;
    const isDistrictRole = ['dkp_filial', 'district_commission', 'district_hokimlik'].includes(user.role);
    const isRegionalRole = ['dkp_regional', 'regional_commission', 'regional_hokimlik'].includes(user.role);
    if (isDistrictRole && user.districtId) return geo.districtId === user.districtId;
    if (isRegionalRole && user.regionId) return geo.regionId === user.regionId;
    return true;
  });

  const total = filtered.length;
  const data = filtered.slice(offset, offset + limit);
  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function getApplicationById(id: number) {
  const app = await db.query.applications.findFirst({
    where: eq(applications.id, id),
    with: {
      geographicObjects: {
        with: { region: true, district: true, objectType: { with: { category: true } } },
      },
      creator: { columns: { id: true, username: true, fullName: true, role: true } },
      history: {
        with: {
          performer: { columns: { id: true, username: true, fullName: true, role: true } },
        },
        orderBy: (h, { asc }) => asc(h.createdAt),
      },
    },
  });

  if (!app) throw new AppError('Ariza topilmadi', 404);
  return app;
}

export async function performAction(
  id: number,
  input: PerformActionInput,
  user: JwtPayload,
) {
  const app = await db.query.applications.findFirst({
    where: eq(applications.id, id),
    with: { geographicObjects: true },
  });

  if (!app) throw new AppError('Ariza topilmadi', 404);

  if (app.currentStatus === 'completed' || app.currentStatus === 'rejected') {
    throw new AppError('Bu ariza allaqachon yakunlangan', 400);
  }

  let transition;
  try {
    transition = resolveTransition(app.currentStatus, input.action, user.role);
  } catch (err: any) {
    throw new AppError(err.message, 403);
  }

  // Tuman komissiyasi bosqichida: barchasi kelishganini tekshirish
  if (app.currentStatus === 'step_2_1_district_commission') {
    const approvals = await db.query.commissionApprovals.findMany({
      where: eq(commissionApprovals.applicationId, id),
      columns: { position: true, approved: true },
    });
    const notAllApproved = REQUIRED_POSITIONS.some(
      (p) => !approvals.find((a) => a.position === p && a.approved),
    );
    if (notAllApproved) {
      throw new AppError("Tuman komissiyasi barcha a'zolari hali kelishmagan", 400);
    }
  }

  // Barcha ob'yektlar bir tuman/viloyatda, birinchisini tekshirish yetarli
  const geo = app.geographicObjects?.[0];
  if (!geo) throw new AppError("Arizada geografik ob'yekt topilmadi", 400);

  const isDistrictRole = ['dkp_filial', 'district_commission', 'district_hokimlik'].includes(user.role);
  const isRegionalRole = ['dkp_regional', 'regional_commission', 'regional_hokimlik'].includes(user.role);

  if (isDistrictRole && user.districtId && geo.districtId !== user.districtId) {
    throw new AppError("Bu ariza sizning tumaningizga tegishli emas", 403);
  }
  if (isRegionalRole && user.regionId && geo.regionId !== user.regionId) {
    throw new AppError("Bu ariza sizning viloyatingizga tegishli emas", 403);
  }

  const fromStatus = app.currentStatus;
  const toStatus = transition.nextStatus;

  await db.transaction(async (tx) => {
    await tx
      .update(applications)
      .set({ currentStatus: toStatus as any, updatedAt: new Date() })
      .where(eq(applications.id, id));

    await tx.insert(applicationHistory).values({
      applicationId: id,
      fromStatus: fromStatus as any,
      toStatus: toStatus as any,
      actionType: transition.actionType as any,
      performedBy: user.userId,
      comment: input.comment,
      attachments: input.attachments ?? [],
    });
  });

  // Ommaviy muhokama bosqichiga o'tganda avtomatik muhokama yaratish
  if (toStatus === 'step_2_public_discussion') {
    await createDiscussion(id);
  }

  return getApplicationById(id);
}

export function getAvailableActionsForUser(
  status: string,
  userRole: string,
  existsInRegistry?: boolean | null,
) {
  const transitions = getAvailableActions(status);

  return Object.entries(transitions)
    .filter(([, t]) => t.allowedRole === userRole)
    .map(([action, t]) => ({ action, label: t.label, nextStatus: t.nextStatus }));
}
