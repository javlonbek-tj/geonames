import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { Select, Pagination, Spin } from 'antd';
import {
  SearchOutlined,
  ClearOutlined,
  LikeOutlined,
  DislikeOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { publicApi, type DiscussionItem } from '@/api/public.api';
import dayjs from 'dayjs';

const DEFAULT_LIMIT = 10;

export default function DiscussionsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [regionId, setRegionId] = useState<number | undefined>();
  const [districtId, setDistrictId] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const { data: discussions, isFetching } = useQuery({
    queryKey: ['public-discussions', regionId, districtId],
    queryFn: () => publicApi.listDiscussions({ regionId, districtId }).then((r) => r.data.data),
    placeholderData: (prev) => prev,
  });

  const { data: regionsRes } = useQuery({
    queryKey: ['public-regions'],
    queryFn: () => publicApi.getRegions().then((r) => r.data.data),
    staleTime: Infinity,
  });

  const { data: districtsRes } = useQuery({
    queryKey: ['public-districts', regionId],
    queryFn: () => publicApi.getDistricts(regionId).then((r) => r.data.data),
    enabled: !!regionId,
  });

  const regions = regionsRes ?? [];
  const districts = districtsRes ?? [];

  const applySearch = useCallback(() => {
    setSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setRegionId(undefined);
    setDistrictId(undefined);
    setPage(1);
  };

  const hasFilters = !!search || !!regionId || !!districtId;

  const allRows = discussions ?? [];
  const filtered = allRows.filter((d) =>
    !search ||
    d.proposedNameUz.toLowerCase().includes(search.toLowerCase()) ||
    d.districtName?.toLowerCase().includes(search.toLowerCase()) ||
    d.regionName?.toLowerCase().includes(search.toLowerCase()),
  );

  const total = filtered.length;
  const rows = filtered.slice((page - 1) * limit, page * limit);

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 py-10'>
      <div className='text-xs font-bold text-[#1565c0] tracking-widest uppercase mb-1.5'>
        Jamoatchilikka e'lon qilingan
      </div>
      <div className='h-1 w-10 bg-[#1565c0] rounded-full mb-4' />
      <h1 className='text-2xl font-extrabold text-[#0f1f3d] mb-6'>Ommaviy muhokamalar</h1>

      {/* Filters */}
      <div className='bg-white rounded-2xl border border-[#e3e8f0] p-4 mb-4'>
        <div className='flex flex-wrap gap-3 items-end'>
          {/* Search */}
          <div className='relative flex-1' style={{ minWidth: 220 }}>
            <div className='text-xs text-gray-500 mb-1'>Qidirish (nomi)</div>
            <div className='relative'>
              <SearchOutlined
                className='absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400'
                style={{ fontSize: 14 }}
              />
              <input
                className='w-full h-9 pl-8 pr-3 rounded-lg border border-[#d1d9e8] text-sm bg-white outline-none focus:border-blue-500 transition-colors'
                placeholder="Nom bo'yicha qidirish..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              />
            </div>
          </div>

          {/* Viloyat */}
          <div style={{ minWidth: 160 }}>
            <div className='text-xs text-gray-500 mb-1'>Viloyat</div>
            <Select
              placeholder='Barchasi'
              allowClear
              style={{ width: '100%' }}
              value={regionId}
              options={regions.map((r) => ({ value: r.id, label: r.nameUz }))}
              onChange={(v) => {
                setRegionId(v);
                setDistrictId(undefined);
                setPage(1);
              }}
            />
          </div>

          {/* Tuman */}
          <div style={{ minWidth: 160 }}>
            <div className='text-xs text-gray-500 mb-1'>Tuman</div>
            <Select
              placeholder='Barchasi'
              allowClear
              style={{ width: '100%' }}
              disabled={!regionId}
              value={districtId}
              options={districts.map((d) => ({ value: d.id, label: d.nameUz }))}
              onChange={(v) => { setDistrictId(v); setPage(1); }}
            />
          </div>

          <div className='flex gap-2'>
            <button
              className='inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1565c0] text-white text-sm font-semibold cursor-pointer border-0 hover:bg-[#0d47a1] transition-colors'
              onClick={applySearch}
            >
              <SearchOutlined /> Qidirish
            </button>
            {hasFilters && (
              <button
                className='inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-[#d1d9e8] bg-white text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors'
                onClick={clearFilters}
              >
                <ClearOutlined /> Tozalash
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-2xl border border-[#e3e8f0] overflow-hidden'>
        <div className='relative overflow-x-auto'>
          {isFetching && (
            <div className='absolute inset-0 bg-white/60 z-10 flex items-center justify-center'>
              <Spin />
            </div>
          )}

          <table className='w-full text-sm' style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className='bg-[#f8faff]'>
                {[
                  { label: 'Ariza raqami', w: 130, cls: 'hidden lg:table-cell' },
                  { label: 'Hudud', w: 160, cls: '' },
                  { label: 'Taklif etilgan nom', w: 180, cls: '' },
                  { label: 'Obyekt turi', w: 140, cls: '' },
                  { label: 'Ovozlar', w: 120, cls: '' },
                  { label: "Qo'yilgan sana", w: 120, cls: '' },
                  { label: 'Muddat', w: 110, cls: '' },
                ].map((h) => (
                  <th
                    key={h.label}
                    className={`text-left px-3 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap ${h.cls}`}
                    style={{ border: '1px solid #e3e8f0', width: h.w }}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !isFetching ? (
                <tr>
                  <td
                    colSpan={7}
                    className='text-center px-4 py-12 text-gray-400'
                    style={{ border: '1px solid #e3e8f0' }}
                  >
                    <EnvironmentOutlined style={{ fontSize: 28, display: 'block', margin: '0 auto 8px' }} />
                    Muhokamalar mavjud emas
                  </td>
                </tr>
              ) : (
                rows.map((d) => <DiscRow key={d.id} d={d} onClick={() => void navigate(`/discussions/${d.id}`)} />)
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className='flex items-center justify-between px-4 py-3 border-t border-[#e3e8f0] bg-[#f8faff]'>
            <span className='text-sm text-gray-500'>
              Jami: <span className='font-semibold text-[#1565c0]'>{total}</span> ta
            </span>
            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              showSizeChanger
              pageSizeOptions={['10', '20', '50']}
              size='small'
              onChange={(p, ps) => { setPage(p); setLimit(ps); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function DiscRow({ d, onClick }: { d: DiscussionItem; onClick: () => void }) {
  const left = dayjs(d.endsAt).diff(dayjs(), 'day');
  const active = left >= 0;

  return (
    <tr
      onClick={onClick}
      className='hover:bg-blue-50/40 cursor-pointer transition-colors'
    >
      {/* Ariza raqami — lg dan kichikda yashirin */}
      <td className='px-3 py-2 hidden lg:table-cell' style={{ border: '1px solid #e3e8f0' }}>
        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#e8efff] text-[#1565c0]'>
          GEO-{String(d.applicationId).padStart(5, '0')}
        </span>
      </td>

      {/* Hudud — viloyat + tuman bitta ustunda */}
      <td className='px-3 py-2' style={{ border: '1px solid #e3e8f0' }}>
        {d.regionName && (
          <div className='text-sm text-gray-700 leading-tight'>{d.regionName}</div>
        )}
        {d.districtName && (
          <div className='text-xs text-gray-400'>{d.districtName}</div>
        )}
        {!d.regionName && !d.districtName && (
          <span className='text-gray-400 text-xs'>—</span>
        )}
      </td>

      {/* Nom */}
      <td className='px-3 py-2' style={{ border: '1px solid #e3e8f0' }}>
        <div className='font-semibold text-gray-900 text-sm leading-tight'>{d.proposedNameUz}</div>
        {d.proposedNameKrill && (
          <div className='text-xs text-gray-400 mt-0.5'>{d.proposedNameKrill}</div>
        )}
      </td>

      {/* Obyekt turi */}
      <td className='px-3 py-2 text-sm text-gray-600' style={{ border: '1px solid #e3e8f0' }}>
        {d.objectType}
      </td>

      {/* Ovozlar */}
      <td className='px-3 py-2' style={{ border: '1px solid #e3e8f0' }}>
        <div className='flex gap-1.5 flex-wrap'>
          <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700'>
            <LikeOutlined /> {d.supportCount ?? 0}
          </span>
          <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700'>
            <DislikeOutlined /> {d.opposeCount ?? 0}
          </span>
        </div>
      </td>

      {/* Qo'yilgan sana */}
      <td className='px-3 py-2 text-xs text-gray-500 whitespace-nowrap' style={{ border: '1px solid #e3e8f0' }}>
        {d.createdAt ? dayjs(d.createdAt).format('DD.MM.YYYY') : '—'}
      </td>

      {/* Muddat */}
      <td className='px-3 py-2' style={{ border: '1px solid #e3e8f0' }}>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
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
