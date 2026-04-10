import { Collapse } from 'antd';
import {
  LikeOutlined,
  DislikeOutlined,
  UserOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';

import guideVideo from '@/assets/guide.mp4';

const STEPS = [
  {
    icon: <UserOutlined style={{ fontSize: 20, color: '#1565c0' }} />,
    title: 'Tizimga kiring',
    desc: "@geonomlar_bot Telegram botini ishga tushiring, telefon raqamingizni ulashing va login sahifasida tasdiqlash kodini kiriting.",
  },
  {
    icon: <CheckCircleOutlined style={{ fontSize: 20, color: '#1565c0' }} />,
    title: "Muhokamani tanlang",
    desc: "Bosh sahifa yoki \"Muhokamalar\" bo'limida faol muhokamalar ro'yxatini ko'ring va sizni qiziqtirganini tanlang.",
  },
  {
    icon: <LikeOutlined style={{ fontSize: 20, color: '#16a34a' }} />,
    title: "Qo'llayman",
    desc: "Taklif etilgan nom sizga to'g'ri kelsa, yashil \"Qo'llayman\" tugmasini bosing. Ovozingiz darhol qayd etiladi.",
  },
  {
    icon: <DislikeOutlined style={{ fontSize: 20, color: '#dc2626' }} />,
    title: "Qo'llamayman",
    desc: "Nom nomuvofiq deb hisoblasangiz, qizil \"Qo'llamayman\" tugmasini bosib qarshi ovoz bering.",
  },
];

const FAQS = [
  {
    key: '1',
    label: 'Kim ovoz bera oladi?',
    children:
      "O'zbekiston Respublikasi fuqarolari Telegram bot orqali ro'yxatdan o'tib ovoz bera oladi. Har bir fuqaro bitta muhokamaga faqat bir marta ovoz berishi mumkin (ovozni o'zgartirish mumkin).",
  },
  {
    key: '2',
    label: 'Muhokama qancha davom etadi?',
    children:
      "Har bir ommaviy muhokama 10 kun davom etadi. Muddat tugagandan so'ng ovoz berish yopiladi va natijalar tuman komissiyasiga yuboriladi.",
  },
  {
    key: '3',
    label: "Ovozimni o'zgartirsam bo'ladimi?",
    children:
      "Ha. Muhokama faol davomida istalgan vaqt ovozingizni o'zgartirishingiz mumkin — qayta bosish avvalgi ovozni almashtiradi.",
  },
  {
    key: '4',
    label: "Reyestrga qanday ma'lumotlar kiritiladi?",
    children:
      "Davlat reyestriga faqat belgilangan jarayondan o'tgan va komissiya tomonidan tasdiqlangan geografik obyekt nomlari kiritiladi: ko'cha, mahalla, ko'l, tog', daryo va boshqa joy nomlari.",
  },
  {
    key: '5',
    label: "Natijalar qayerda ko'rsatiladi?",
    children:
      "Muhokama sahifasida real vaqtda ovozlar soni ko'rsatiladi. Muhokama tugagandan keyin natijalar ham ommaviy ko'rinishda saqlanib qoladi.",
  },
  {
    key: '6',
    label: 'Telegram bot ishlamasa nima qilaman?',
    children:
      "@geonomlar_bot botiga /start buyrug'ini qayta yuboring. Agar muammo davom etsa, info@geonomlar.uz manziliga yoki +998 90 004 81 14 raqamiga murojaat qiling.",
  },
];

export default function GuidePage() {
  return (
    <>
      {/* ─── Foydalanish bo'yicha qo'llanma ─────────────────────────────────── */}
      <section className='max-w-7xl mx-auto px-4 sm:px-6 py-12'>
        <div className='text-xs font-bold text-[#1565c0] tracking-widest uppercase mb-1.5'>
          Boshlash uchun
        </div>
        <div className='h-1 w-10 bg-[#1565c0] rounded-full mb-4' />
        <h1 className='text-2xl font-extrabold text-[#0f1f3d] mb-10'>
          Foydalanish bo'yicha qo'llanma
        </h1>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-10 items-start'>
          {/* Left — steps */}
          <div className='flex flex-col gap-5'>
            {STEPS.map((step, i) => (
              <div
                key={i}
                className='flex gap-4 p-5 rounded-2xl border border-[#e3e8f0] bg-white'
              >
                <div className='w-10 h-10 rounded-xl bg-[#f0f4ff] flex items-center justify-center shrink-0'>
                  {step.icon}
                </div>
                <div>
                  <div className='font-bold text-[#0f1f3d] text-sm mb-1'>
                    <span className='text-[#1565c0] mr-1.5'>{i + 1}.</span>
                    {step.title}
                  </div>
                  <p className='text-sm text-gray-500 leading-relaxed m-0'>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right — video */}
          <div className='sticky top-24'>
            <video
              src={guideVideo}
              controls
              className='w-full rounded-2xl'
              style={{ display: 'block' }}
            />
            <p className='text-xs text-gray-400 text-center mt-3'>
              Ovoz berish jarayoni haqida qisqacha video
            </p>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className='max-w-7xl mx-auto px-4 sm:px-6 pb-16'>
        <div className='text-xs font-bold text-[#1565c0] tracking-widest uppercase mb-1.5'>
          Yordam
        </div>
        <div className='h-1 w-10 bg-[#1565c0] rounded-full mb-4' />
        <h2 className='text-2xl font-extrabold text-[#0f1f3d] mb-6 flex items-center gap-2'>
          <QuestionCircleOutlined style={{ fontSize: 22, color: '#1565c0' }} />
          Ko'pincha beriladigan savollar
        </h2>

        <Collapse
          accordion
          bordered={false}
          expandIconPosition='end'
          items={FAQS}
          style={{ background: 'transparent' }}
          className='faq-collapse'
        />
      </section>
    </>
  );
}
