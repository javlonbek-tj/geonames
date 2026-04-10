import { randomBytes } from 'crypto';
import TelegramBot from 'node-telegram-bot-api';
import { ENV } from '../../config';
import { db } from '../../db/db';
import { citizens, citizenOtps } from '../../db/schema';
import { eq } from 'drizzle-orm';

let bot: TelegramBot | null = null;

export function getBot(): TelegramBot | null {
  return bot;
}

export async function sendOtp(telegramId: string, code: string): Promise<void> {
  if (!bot) throw new Error('Telegram bot ishga tushmagan');
  await bot.sendMessage(
    telegramId,
    `🔐 Geonames tasdiqlash kodi:\n\n*${code}*\n\n_Kod 5 daqiqa davomida amal qiladi._`,
    { parse_mode: 'Markdown' },
  );
}


export function startBot(): void {
  if (!ENV.TELEGRAM_BOT_TOKEN) {
    console.warn('[Bot] TELEGRAM_BOT_TOKEN mavjud emas, bot ishga tushmadi');
    return;
  }

  bot = new TelegramBot(ENV.TELEGRAM_BOT_TOKEN, { polling: true });

  bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const telegramId = String(chatId);
    const param = match?.[1]?.trim();

    // Foydalanuvchini saqlash yoki yangilash
    await db
      .insert(citizens)
      .values({
        telegramId,
        fullName: [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ') || null,
        username: msg.from?.username ?? null,
      })
      .onConflictDoUpdate({
        target: citizens.telegramId,
        set: {
          fullName: [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ') || null,
          username: msg.from?.username ?? null,
          updatedAt: new Date(),
        },
      });

    // Login deep-link: /start login_<sessionId>
    if (param?.startsWith('login_')) {
      const sessionId = param.slice('login_'.length);

      const citizen = await db.query.citizens.findFirst({
        where: eq(citizens.telegramId, telegramId),
      });

      if (!citizen) {
        await bot!.sendMessage(chatId, "Siz hali ro'yxatdan o'tmagansiz. Avval telefon raqamingizni ulashing:", {
          reply_markup: {
            keyboard: [[{ text: '📱 Telefon raqamni ulashish', request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
        return;
      }

      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await db.insert(citizenOtps).values({ sessionId, telegramId, code, expiresAt });

      await bot!.sendMessage(
        chatId,
        `🔐 Geonames tasdiqlash kodi:\n\n*${code}*\n\n_Kod 5 daqiqa davomida amal qiladi._`,
        { parse_mode: 'Markdown' },
      );
      return;
    }

    // Oddiy /start — telefon so'rash
    await bot!.sendMessage(
      chatId,
      `Salom! Geonames portaliga xush kelibsiz.\n\nTizimga kirish uchun telefon raqamingizni ulashing:`,
      {
        reply_markup: {
          keyboard: [
            [{ text: '📱 Telefon raqamni ulashish', request_contact: true }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      },
    );
  });

  bot.on('contact', async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = String(chatId);
    const phone = msg.contact?.phone_number;

    if (!phone) return;

    // Normalize phone: ensure + prefix
    const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    await db
      .update(citizens)
      .set({ phone: normalizedPhone, updatedAt: new Date() })
      .where(eq(citizens.telegramId, telegramId));

    await bot!.sendMessage(
      chatId,
      `✅ Telefon raqamingiz saqlandi: *${normalizedPhone}*\n\nEndi ommaviy muhokama portaliga kirishingiz mumkin.`,
      { parse_mode: 'Markdown', reply_markup: { remove_keyboard: true } },
    );
  });

  bot.on('polling_error', (err) => {
    console.error('[Bot] Polling xatolik:', err.message);
  });

  console.log('[Bot] Telegram bot polling rejimida ishga tushdi');
}
