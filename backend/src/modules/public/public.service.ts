import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { and, eq, gt } from 'drizzle-orm';
import { db } from '../../db/db';
import {
  citizens,
  citizenOtps,
  publicDiscussions,
  publicVotes,
} from '../../db/schema';
import { AppError } from '../../utils/appError';
import { ENV } from '../../config';
import { sendOtp } from '../telegram-bot/bot';

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function requestOtp(
  phone: string,
): Promise<{ sessionId: string }> {
  const citizen = await db.query.citizens.findFirst({
    where: eq(citizens.phone, phone),
  });

  if (!citizen) {
    throw new AppError(
      "Bu telefon raqam tizimda yo'q. Avval @geonomlar_bot botini ishga tushiring.",
      404,
    );
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const sessionId = randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await db.insert(citizenOtps).values({ sessionId, phone, code, expiresAt });
  await sendOtp(citizen.telegramId, code);

  return { sessionId };
}

export async function verifyOtp(
  sessionId: string,
  code: string,
): Promise<{
  accessToken: string;
  citizen: {
    id: number;
    telegramId: string;
    fullName: string | null;
    phone: string | null;
  };
}> {
  const otp = await db.query.citizenOtps.findFirst({
    where: and(
      eq(citizenOtps.sessionId, sessionId),
      eq(citizenOtps.used, false),
      gt(citizenOtps.expiresAt, new Date()),
    ),
  });

  if (!otp) throw new AppError("Kod noto'g'ri yoki muddati o'tgan", 400);
  if (otp.code !== code) throw new AppError("Noto'g'ri tasdiqlash kodi", 400);

  await db
    .update(citizenOtps)
    .set({ used: true })
    .where(eq(citizenOtps.id, otp.id));

  const citizen = await db.query.citizens.findFirst({
    where: otp.telegramId
      ? eq(citizens.telegramId, otp.telegramId)
      : eq(citizens.phone, otp.phone!),
  });
  if (!citizen) throw new AppError('Fuqaro topilmadi', 404);

  const accessToken = jwt.sign(
    { citizenId: citizen.id, telegramId: citizen.telegramId },
    ENV.JWT_CITIZEN_SECRET,
    { expiresIn: '30d' },
  );

  return {
    accessToken,
    citizen: {
      id: citizen.id,
      telegramId: citizen.telegramId,
      fullName: citizen.fullName,
      phone: citizen.phone,
    },
  };
}

// ─── Discussions ─────────────────────────────────────────────────────────────

export async function listDiscussions(citizenId: number | null) {
  const rows = await db.query.publicDiscussions.findMany({
    with: {
      application: {
        with: {
          geographicObjects: {
            with: {
              objectType: { with: { category: true } },
              district: true,
            },
            limit: 1,
          },
        },
      },
      votes: {
        where: citizenId
          ? eq(publicVotes.citizenId, citizenId)
          : eq(publicVotes.citizenId, -1),
      },
    },
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  return rows.map((d) => {
    const geo = d.application.geographicObjects[0];
    return {
      id: d.id,
      applicationId: d.applicationId,
      proposedNameUz: geo?.nameUz ?? '—',
      proposedNameKrill: geo?.nameKrill ?? null,
      objectType: geo?.objectType?.nameUz ?? '—',
      category: geo?.objectType?.category?.nameUz ?? null,
      districtName: geo?.district?.nameUz ?? null,
      endsAt: d.endsAt.toISOString(),
      voteCount: 0, // vote count computed in getDiscussion
      myVote: (d.votes[0]?.vote ?? null) as 'support' | 'oppose' | null,
    };
  });
}

export async function getDiscussion(id: number, citizenId: number | null) {
  const d = await db.query.publicDiscussions.findFirst({
    where: eq(publicDiscussions.id, id),
    with: {
      application: {
        with: {
          geographicObjects: {
            with: {
              objectType: { with: { category: true } },
              district: true,
            },
            limit: 1,
          },
        },
      },
      votes: {
        where: citizenId
          ? eq(publicVotes.citizenId, citizenId)
          : eq(publicVotes.citizenId, -1),
      },
    },
  });

  if (!d) throw new AppError('Muhokama topilmadi', 404);

  // Count all votes
  const allVotes = await db.query.publicVotes.findMany({
    where: eq(publicVotes.discussionId, id),
  });

  const geo = d.application.geographicObjects[0];

  return {
    id: d.id,
    applicationId: d.applicationId,
    proposedNameUz: geo?.nameUz ?? '—',
    proposedNameKrill: geo?.nameKrill ?? null,
    objectType: geo?.objectType?.nameUz ?? '—',
    category: geo?.objectType?.category?.nameUz ?? null,
    districtName: geo?.district?.nameUz ?? null,
    endsAt: d.endsAt.toISOString(),
    voteCount: allVotes.length,
    myVote: (d.votes[0]?.vote ?? null) as 'support' | 'oppose' | null,
  };
}

export async function submitVote(
  discussionId: number,
  citizenId: number,
  vote: 'support' | 'oppose',
) {
  const discussion = await db.query.publicDiscussions.findFirst({
    where: eq(publicDiscussions.id, discussionId),
  });
  if (!discussion) throw new AppError('Muhokama topilmadi', 404);
  if (discussion.endsAt < new Date())
    throw new AppError('Muhokama muddati tugagan', 400);

  await db
    .insert(publicVotes)
    .values({ discussionId, citizenId, vote })
    .onConflictDoUpdate({
      target: [publicVotes.discussionId, publicVotes.citizenId],
      set: { vote, updatedAt: new Date() },
    });
}

// ─── Used by applications service when submitting to public discussion ────────

export async function createDiscussion(applicationId: number): Promise<void> {
  const endsAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days
  await db
    .insert(publicDiscussions)
    .values({ applicationId, endsAt })
    .onConflictDoUpdate({
      target: publicDiscussions.applicationId,
      set: { endsAt, createdAt: new Date() },
    });
}

export async function getDiscussionResults(applicationId: number) {
  const discussion = await db.query.publicDiscussions.findFirst({
    where: eq(publicDiscussions.applicationId, applicationId),
    with: { votes: true },
  });
  if (!discussion) return null;

  const support = discussion.votes.filter((v) => v.vote === 'support').length;
  const oppose = discussion.votes.filter((v) => v.vote === 'oppose').length;

  return {
    id: discussion.id,
    endsAt: discussion.endsAt.toISOString(),
    supportCount: support,
    opposeCount: oppose,
    total: discussion.votes.length,
  };
}
