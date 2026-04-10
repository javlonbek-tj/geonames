import RegistrySection from '@/components/RegistrySection';

export default function RegistryPage() {
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 py-10'>
      <div className='text-xs font-bold text-[#1565c0] tracking-widest uppercase mb-1.5'>
        Rasmiy ma'lumotlar bazasi
      </div>
      <div className='h-1 w-10 bg-[#1565c0] rounded-full mb-4' />
      <h1 className='text-2xl font-extrabold text-[#0f1f3d] mb-6'>
        Geografik obyektlar reyestri
      </h1>
      <RegistrySection />
    </div>
  );
}
