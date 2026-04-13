import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Button, Dropdown } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  DownOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useCitizenStore } from '@/store/citizenStore';
import logoSvg from '@/assets/logo.svg';

const NAV_ITEMS = [
  { key: '/', label: 'Bosh sahifa' },
  { key: '/discussions', label: 'Muhokamalar' },
  { key: '/registry', label: 'Reyestr' },
  { key: '/guide', label: "Qo'llanmalar" },
];

export default function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { citizen, clearAuth } = useCitizenStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    void navigate('/');
  };

  const isActive = (key: string) =>
    key === '/' ? location.pathname === '/' : location.pathname.startsWith(key);

  return (
    <div className='min-h-screen flex flex-col bg-[#f9fafc]'>
      {/* Navbar */}
      <header className='sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4'>
          {/* Logo */}
          <button
            className='flex items-center gap-3 cursor-pointer border-0 bg-transparent p-0 shrink-0'
            onClick={() => void navigate('/')}
          >
            <img src={logoSvg} alt='Geonames' className='h-5 block' />
          </button>

          {/* Desktop nav */}
          <nav className='hidden md:flex items-center gap-1 flex-1 ml-4'>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => void navigate(item.key)}
                className={`px-3.5 py-1.5 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer border-0 whitespace-nowrap ${
                  isActive(item.key)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 bg-transparent hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Auth */}
          <div className='flex items-center gap-2'>
            {citizen ? (
              <Dropdown
                trigger={['click']}
                menu={{
                  items: [
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: 'Chiqish',
                      danger: true,
                      onClick: handleLogout,
                    },
                  ],
                }}
              >
                <button className='hidden sm:flex items-center gap-2 h-9 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer text-sm font-medium text-gray-700'>
                  <div className='w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center shrink-0'>
                    <UserOutlined style={{ color: '#fff', fontSize: 11 }} />
                  </div>
                  <span className='max-w-[120px] truncate'>
                    {citizen.fullName ?? citizen.telegramId}
                  </span>
                  <DownOutlined style={{ fontSize: 10, color: '#9ca3af' }} />
                </button>
              </Dropdown>
            ) : (
              <Button
                type='primary'
                icon={<LoginOutlined />}
                onClick={() => void navigate('/login')}
                style={{
                  background: '#1565c0',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  height: 32,
                  paddingInline: 14,
                  fontSize: 12,
                }}
              >
                Kirish
              </Button>
            )}

            <button
              className='md:hidden w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center bg-white cursor-pointer'
              onClick={() => setMobileOpen((v) => !v)}
            >
              <MenuOutlined style={{ fontSize: 15 }} />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className='md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1'>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                className={`text-left px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-0 ${
                  isActive(item.key)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 bg-transparent hover:bg-gray-100'
                }`}
                onClick={() => {
                  void navigate(item.key);
                  setMobileOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <main className='flex-1'>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className='bg-[#0f1f3d] text-gray-400'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 py-12'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10'>
            {/* About */}
            <div>
              <div className='mb-4'>
                <img
                  src={logoSvg}
                  alt='Geonames'
                  className='h-[18px]'
                  style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }}
                />
              </div>
              <p className='text-sm text-white/50 leading-relaxed max-w-[220px]'>
                O'zbekiston Respublikasi geografik obyektlar nomlari davlat
                reyestri.
              </p>
            </div>

            {/* Links */}
            <div>
              <div className='text-white font-bold text-sm mb-4 pb-2.5 border-b-2 border-blue-600 inline-block'>
                Havolalar
              </div>
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => void navigate(item.key)}
                  className='block text-white/60 text-sm mb-2.5 cursor-pointer border-0 bg-transparent p-0 text-left hover:text-blue-300 transition-colors'
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Docs */}
            <div>
              <div className='text-white font-bold text-sm mb-4 pb-2.5 border-b-2 border-blue-600 inline-block'>
                Hujjatlar
              </div>
              {[
                'Foydalanish qoidalari',
                'Maxfiylik siyosati',
                'Qonuniy asos',
                "Yo'riqnoma",
              ].map((l) => (
                <span
                  key={l}
                  className='block text-white/60 text-sm mb-2.5 cursor-pointer hover:text-blue-300 transition-colors'
                >
                  {l}
                </span>
              ))}
            </div>

            {/* Contact */}
            <div>
              <div className='text-white font-bold text-sm mb-4 pb-2.5 border-b-2 border-blue-600 inline-block'>
                Bog'lanish
              </div>
              <p className='text-sm text-white/55 leading-[1.8]'>
                Toshkent shahar, Chilonzor tumani, Bunyodkor shoh ko'chasi, 28
                <br />
                <a
                  href='tel:+998900048114'
                  className='text-white/55 hover:text-blue-300'
                >
                  +998 90 004 81 14
                </a>
                <br />
                <a
                  href='mailto:tjmr1996@gmail.com'
                  className='text-white/55 hover:text-blue-300'
                >
                  tjmr1996@gmail.com
                </a>
              </p>
            </div>
          </div>

          <div className='border-t border-white/10 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/40'>
            <span>
              © {new Date().getFullYear()} Geonomlar. Barcha huquqlar
              himoyalangan.
            </span>
            <span>Davlat kadastrlari palatasi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
