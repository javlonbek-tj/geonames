import { useNavigate } from 'react-router';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useCitizenStore } from '@/store/citizenStore';
import heroPng from '@/assets/hero.png';
import RegistrySection from '@/components/RegistrySection';

export default function HomePage() {
  const navigate = useNavigate();
  const citizen = useCitizenStore((s) => s.citizen);

  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-10 items-center'>
            <div>
              <h1 className='text-3xl font-extrabold text-[#0f1f3d] leading-tight mb-4'>
                Geografik obyektlar
                <br />
                nomlari <span className='text-[#1565c0]'>davlat reyestri</span>
              </h1>
              <p className='text-base text-gray-600 leading-relaxed mb-8 max-w-md'>
                O'zbekiston Respublikasi geografik obyektlarning rasmiy nomlari,
                ommaviy muhokamalar va fuqarolarning ovozlari — bir platformada.
              </p>
              <div className='flex flex-wrap gap-3'>
                {!citizen && (
                  <button
                    onClick={() => void navigate('/login')}
                    className='inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs text-white cursor-pointer border border-transparent transition-opacity hover:opacity-90 bg-[#1565c0]'
                  >
                    Kirish
                    <ArrowRightOutlined style={{ fontSize: 12 }} />
                  </button>
                )}
                <button
                  onClick={() => void navigate('/registry')}
                  className='inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs text-gray-700 cursor-pointer bg-white border border-[#d1d9e8] transition-colors hover:bg-gray-50'
                >
                  Reyestrni ko'rish
                </button>
              </div>
            </div>
            <div className='hidden lg:flex justify-center opacity-60'>
              <img
                src={heroPng}
                alt='Geografik nomlar reestri'
                className='w-full max-w-lg object-contain'
                style={{ maxHeight: 340 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Registry ──────────────────────────────────────────────────────── */}
      <section className='max-w-7xl mx-auto px-4 sm:px-6 py-8'>
        <div className='text-xs font-bold text-[#1565c0] tracking-widest uppercase mb-1.5'>
          Rasmiy ma'lumotlar bazasi
        </div>
        <div className='h-1 w-10 bg-[#1565c0] rounded-full mb-4' />
        <h2 className='text-2xl font-extrabold text-[#0f1f3d] mb-6'>
          Geografik obyektlar reyestri
        </h2>
        <RegistrySection />
      </section>

      {/* ─── Bosqichlar ────────────────────────────────────────────────────── */}
      <section>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 py-14'>
          <div className='text-xs font-bold text-[#1565c0] tracking-widest uppercase mb-1.5'>
            Jarayon
          </div>
          <div className='h-1 w-10 bg-[#1565c0] rounded-full mb-4' />
          <h2 className='text-2xl font-extrabold text-[#0f1f3d] mb-8'>
            Nom berish jarayoni
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-[#f8faff] rounded-2xl p-8 border border-[#e3e8f0] flex flex-col'>
              <span className='inline-block self-start px-2.5 py-0.5 rounded text-xs font-bold tracking-widest text-[#1565c0] bg-[#e8efff] mb-4'>
                1-BOSQICH
              </span>
              <h3 className='text-xl font-bold text-[#0f1f3d] mb-3'>
                Ariza va geometriya yuklash
              </h3>
              <p className='text-sm text-gray-500 leading-[1.75] flex-1'>
                Davlat kadastrlari palatasi tuman/shahar filiali xodimi geonomlar
                axborot tizimiga geografik obyektning geometriyasini yuklaydi va
                ushbu obyektga nom taklif qilish uchun tuman/shahar
                hokimliklariga yuboradi. Tuman hokimligi obyektga nom taklif
                etadi va ommaviy muhokamaga chiqaradi.
              </p>
              <button
                className='inline-flex items-center gap-1.5 mt-5 text-[#1565c0] text-sm font-semibold cursor-pointer border-0 bg-transparent p-0 self-start hover:text-blue-800 transition-colors'
                onClick={() => void navigate('/about')}
              >
                Batafsil <ArrowRightOutlined style={{ fontSize: 11 }} />
              </button>
            </div>

            <div className='bg-[#f8faff] rounded-2xl p-8 border border-[#e3e8f0] flex flex-col'>
              <span className='inline-block self-start px-2.5 py-0.5 rounded text-xs font-bold tracking-widest text-[#1565c0] bg-[#e8efff] mb-4'>
                2-BOSQICH
              </span>
              <h3 className='text-xl font-bold text-[#0f1f3d] mb-3'>
                Jamoatchilik muhokamasi
              </h3>
              <p className='text-sm text-gray-500 leading-[1.75] flex-1'>
                Taklif etilgan nom 10 kun davomida ushbu portaldа fuqarolar
                tomonidan muhokama qilinadi va ovoz beriladi. Natijalar tuman
                komissiyasiga yetkaziladi hamda keyingi bosqichlar uchun asos
                bo'ladi.
              </p>
              <button
                className='inline-flex items-center gap-1.5 mt-5 text-[#1565c0] text-sm font-semibold cursor-pointer border-0 bg-transparent p-0 self-start hover:text-blue-800 transition-colors'
                onClick={() => void navigate('/discussions')}
              >
                Muhokamalarni ko'rish <ArrowRightOutlined style={{ fontSize: 11 }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA banner ────────────────────────────────────────────────────── */}
      <section className='max-w-7xl mx-auto px-4 sm:px-6 pb-16'>
        <div
          className='rounded-2xl px-8 sm:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-6'
          style={{ background: 'linear-gradient(135deg,#0d47a1,#1565c0,#1976d2)' }}
        >
          <div>
            <h3 className='text-xl font-extrabold text-white mb-1.5'>
              Muhokamada ishtirok eting
            </h3>
            <p className='text-sm text-white/70 max-w-[400px]'>
              {citizen
                ? "O'z hududingizdagi nom berish jarayoniga ovozingizni qo'shing."
                : "Telegram orqali kiring va o'z hududingizdagi nom berish jarayoniga ovozingizni qo'shing."}
            </p>
          </div>
          <button
            onClick={() => void navigate(citizen ? '/discussions' : '/login')}
            className='inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-[#1565c0] bg-white cursor-pointer border-0 shrink-0 transition-opacity hover:opacity-90'
          >
            {citizen ? "Muhokamani ko'rish" : 'Kirish'}
            <ArrowRightOutlined style={{ fontSize: 12 }} />
          </button>
        </div>
      </section>
    </>
  );
}
