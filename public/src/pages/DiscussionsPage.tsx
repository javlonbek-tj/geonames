import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import {
  SearchOutlined,
  EnvironmentOutlined,
  LikeOutlined,
  DislikeOutlined,
} from '@ant-design/icons';
import { publicApi, type DiscussionItem } from '@/api/public.api';
import dayjs from 'dayjs';

function daysLeft(endsAt: string) {
  return dayjs(endsAt).diff(dayjs(), 'day');
}

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className='px-4 py-3'>
          <div
            className={`h-4 rounded animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 ${i === 2 ? 'w-full' : 'w-20'}`}
          />
        </td>
      ))}
    </tr>
  );
}

function DiscRow({ d, onClick }: { d: DiscussionItem; onClick: () => void }) {
  const left = daysLeft(d.endsAt);
  const active = left >= 0;
  return (
    <tr
      onClick={onClick}
      className='border-b border-gray-100 hover:bg-blue-50/40 cursor-pointer transition-colors'
    >
      <td className='px-4 py-3'>
        <span className='inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#e8efff] text-[#1565c0]'>
          GEO-{String(d.applicationId).padStart(5, '0')}
        </span>
      </td>
      <td className='px-4 py-3'>
        <div className='font-semibold text-gray-900 text-sm'>{d.proposedNameUz}</div>
        {d.proposedNameKrill && (
          <div className='text-xs text-gray-400 mt-0.5'>{d.proposedNameKrill}</div>
        )}
      </td>
      <td className='px-4 py-3'>
        <div className='text-sm text-gray-600'>{d.objectType}</div>
        {d.category && <div className='text-xs text-gray-400'>{d.category}</div>}
      </td>
      <td className='px-4 py-3'>
        <div className='flex gap-1.5 flex-wrap'>
          <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700'>
            <LikeOutlined /> {d.voteCount}
          </span>
          <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700'>
            <DislikeOutlined /> 0
          </span>
        </div>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-gray-400'}`} />
          {active ? (left === 0 ? 'Bugun tugaydi' : `${left} kun`) : 'Tugagan'}
        </span>
      </td>
    </tr>
  );
}

export default function DiscussionsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: discussions, isLoading } = useQuery({
    queryKey: ['public-discussions'],
    queryFn: () => publicApi.listDiscussions().then((r) => r.data.data),
  });

  const filtered = (discussions ?? []).filter(
    (d) =>
      !search ||
      d.proposedNameUz.toLowerCase().includes(search.toLowerCase()) ||
      d.districtName?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 py-10'>
      <div className='text-xs font-bold text-[#1565c0] tracking-widest uppercase mb-1.5'>
        Jamoatchilikka e'lon qilingan
      </div>
      <div className='h-1 w-10 bg-[#1565c0] rounded-full mb-4' />
      <h1 className='text-2xl font-extrabold text-[#0f1f3d] mb-6'>Ommaviy muhokamalar</h1>

      <div className='bg-white rounded-2xl border border-[#e3e8f0] overflow-hidden'>
        {/* Filters */}
        <div className='flex flex-wrap gap-3 p-4 border-b border-[#e3e8f0] bg-[#f8faff]'>
          <div className='relative flex-1' style={{ minWidth: 200 }}>
            <SearchOutlined
              className='absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400'
              style={{ fontSize: 14 }}
            />
            <input
              className='w-full h-9 pl-8 pr-3 rounded-lg border border-[#d1d9e8] text-sm bg-white outline-none focus:border-blue-500 transition-colors'
              placeholder="Nom yoki manzil bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className='h-9 px-3 rounded-lg border border-[#d1d9e8] text-sm bg-white outline-none focus:border-blue-500'
            style={{ minWidth: 140 }}
          >
            <option value=''>Barcha viloyat</option>
          </select>
          <select
            className='h-9 px-3 rounded-lg border border-[#d1d9e8] text-sm bg-white outline-none focus:border-blue-500'
            style={{ minWidth: 130 }}
          >
            <option value=''>Holati</option>
            <option>Faol</option>
            <option>Tugagan</option>
          </select>
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-sm'>
            <thead>
              <tr className='bg-[#f8faff] border-b border-[#e3e8f0]'>
                <th className='text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide w-32'>Ariza raqami</th>
                <th className='text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide'>Taklif etilgan nom</th>
                <th className='text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide w-40'>Obyekt turi</th>
                <th className='text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide w-40'>Ovozlar</th>
                <th className='text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide w-32'>Muddat</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className='text-center px-4 py-12 text-gray-400'>
                    <EnvironmentOutlined style={{ fontSize: 32, display: 'block', margin: '0 auto 10px' }} />
                    Muhokamalar mavjud emas
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <DiscRow
                    key={d.id}
                    d={d}
                    onClick={() => void navigate(`/discussions/${d.id}`)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
