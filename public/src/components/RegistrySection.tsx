import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, Pagination, Spin, Tooltip } from 'antd';
import { SearchOutlined, ClearOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { publicApi, type RegistryParams } from '@/api/public.api';

const DEFAULT_LIMIT = 10;

function CopyableNumber({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <Tooltip title={copied ? 'Nusxalandi!' : 'Nusxalash'}>
      <span
        onClick={copy}
        className='inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold cursor-pointer select-none transition-colors'
        style={{
          background: copied ? '#dcfce7' : '#e8efff',
          color: copied ? '#166534' : '#1565c0',
        }}
      >
        {value}
        {copied
          ? <CheckOutlined style={{ fontSize: 10 }} />
          : <CopyOutlined style={{ fontSize: 10 }} />}
      </span>
    </Tooltip>
  );
}

interface GeoObject {
  id: number;
  nameUz: string | null;
  nameKrill: string | null;
  registryNumber: string | null;
  objectType?: { nameUz: string; category?: { nameUz: string } | null } | null;
  region?: { nameUz: string } | null;
  district?: { nameUz: string } | null;
}

export default function RegistrySection() {
  const [filters, setFilters] = useState<RegistryParams>({ page: 1, limit: DEFAULT_LIMIT });
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();

  const { data, isFetching } = useQuery({
    queryKey: ['public-registry', filters],
    queryFn: () => publicApi.getRegistry(filters).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const { data: regionsRes } = useQuery({
    queryKey: ['public-regions'],
    queryFn: () => publicApi.getRegions().then((r) => r.data.data),
    staleTime: Infinity,
  });

  const { data: districtsRes } = useQuery({
    queryKey: ['public-districts', filters.regionId],
    queryFn: () => publicApi.getDistricts(filters.regionId).then((r) => r.data.data),
    enabled: !!filters.regionId,
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['public-categories'],
    queryFn: () => publicApi.getCategories().then((r) => r.data.data),
    staleTime: Infinity,
  });

  const regions = regionsRes ?? [];
  const districts = districtsRes ?? [];
  const categories = categoriesRes ?? [];
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const typeOptions = selectedCategory?.objectTypes ?? [];

  const applySearch = useCallback(() => {
    setFilters((f) => ({ ...f, page: 1, search: searchInput || undefined }));
  }, [searchInput]);

  const clearFilters = () => {
    setFilters({ page: 1, limit: DEFAULT_LIMIT });
    setSearchInput('');
    setSelectedCategoryId(undefined);
  };

  const hasFilters =
    !!filters.search || !!filters.regionId || !!filters.districtId ||
    !!filters.categoryId || !!filters.objectTypeId;

  const rows = (data?.data ?? []) as GeoObject[];
  const total = data?.meta?.total ?? 0;

  return (
    <div>
      {/* Filters */}
      <div className='bg-white rounded-2xl border border-[#e3e8f0] p-4 mb-4'>
        <div className='flex flex-wrap gap-3 items-end'>
          <div className='relative flex-1' style={{ minWidth: 220 }}>
            <div className='text-xs text-gray-500 mb-1'>Qidirish (nomi)</div>
            <div className='relative'>
              <SearchOutlined
                className='absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400'
                style={{ fontSize: 14 }}
              />
              <input
                className='w-full h-9 pl-8 pr-3 rounded-lg border border-[#d1d9e8] text-sm bg-white outline-none focus:border-blue-500 transition-colors'
                placeholder="Nom yoki reyestr raqami bo'yicha..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              />
            </div>
          </div>

          <div style={{ minWidth: 160 }}>
            <div className='text-xs text-gray-500 mb-1'>Viloyat</div>
            <Select
              placeholder='Barchasi'
              allowClear
              style={{ width: '100%' }}
              value={filters.regionId}
              options={regions.map((r) => ({ value: r.id, label: r.nameUz }))}
              onChange={(v) =>
                setFilters((f) => ({ ...f, page: 1, regionId: v, districtId: undefined }))
              }
            />
          </div>

          <div style={{ minWidth: 160 }}>
            <div className='text-xs text-gray-500 mb-1'>Tuman</div>
            <Select
              placeholder='Barchasi'
              allowClear
              style={{ width: '100%' }}
              disabled={!filters.regionId}
              value={filters.districtId}
              options={districts.map((d) => ({ value: d.id, label: d.nameUz }))}
              onChange={(v) => setFilters((f) => ({ ...f, page: 1, districtId: v }))}
            />
          </div>

          <div style={{ minWidth: 180 }}>
            <div className='text-xs text-gray-500 mb-1'>Guruh</div>
            <Select
              placeholder='Barchasi'
              allowClear
              style={{ width: '100%' }}
              value={selectedCategoryId}
              options={categories.map((c) => ({
                value: c.id,
                label: c.code ? `[${c.code}] ${c.nameUz}` : c.nameUz,
              }))}
              onChange={(v) => {
                setSelectedCategoryId(v);
                setFilters((f) => ({ ...f, page: 1, categoryId: v, objectTypeId: undefined }));
              }}
            />
          </div>

          <div style={{ minWidth: 160 }}>
            <div className='text-xs text-gray-500 mb-1'>Tur</div>
            <Select
              placeholder='Barchasi'
              allowClear
              style={{ width: '100%' }}
              disabled={!selectedCategoryId}
              value={filters.objectTypeId}
              options={typeOptions.map((t) => ({ value: t.id, label: t.nameUz }))}
              onChange={(v) => setFilters((f) => ({ ...f, page: 1, objectTypeId: v }))}
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
          {/* Loading overlay — keeps table stable, no layout shift */}
          {isFetching && (
            <div className='absolute inset-0 bg-white/60 z-10 flex items-center justify-center'>
              <Spin />
            </div>
          )}

          <table className='w-full text-sm' style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className='bg-[#f8faff]'>
                {['№', 'Nomi', 'Guruh', 'Tur', 'Hudud', 'Reyestr raqami'].map((h, i) => (
                  <th
                    key={h}
                    className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap'
                    style={{
                      border: '1px solid #e3e8f0',
                      width: i === 0 ? 44 : i === 1 ? 180 : i === 2 ? 170 : i === 3 ? 150 : i === 4 ? 160 : 150,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !isFetching ? (
                <tr>
                  <td
                    colSpan={6}
                    className='text-center px-4 py-12 text-gray-400 text-sm'
                    style={{ border: '1px solid #e3e8f0' }}
                  >
                    Ma'lumot topilmadi
                  </td>
                </tr>
              ) : (
                rows.map((obj, idx) => (
                  <tr
                    key={obj.id}
                    className='hover:bg-blue-50/40 transition-colors'
                  >
                    <td
                      className='px-3 py-2 text-gray-400 text-xs text-center'
                      style={{ border: '1px solid #e3e8f0' }}
                    >
                      {((filters.page ?? 1) - 1) * (filters.limit ?? DEFAULT_LIMIT) + idx + 1}
                    </td>
                    <td className='px-3 py-2' style={{ border: '1px solid #e3e8f0' }}>
                      <div className='font-medium text-gray-900 text-sm leading-tight'>{obj.nameUz ?? '—'}</div>
                      {obj.nameKrill && (
                        <div className='text-xs text-gray-400 mt-0.5'>{obj.nameKrill}</div>
                      )}
                    </td>
                    <td
                      className='px-3 py-2 text-sm text-gray-600'
                      style={{ border: '1px solid #e3e8f0' }}
                    >
                      {obj.objectType?.category?.nameUz ?? '—'}
                    </td>
                    <td
                      className='px-3 py-2 text-sm text-gray-600'
                      style={{ border: '1px solid #e3e8f0' }}
                    >
                      {obj.objectType?.nameUz ?? '—'}
                    </td>
                    <td className='px-3 py-2' style={{ border: '1px solid #e3e8f0' }}>
                      <div className='text-sm text-gray-700'>{obj.region?.nameUz ?? '—'}</div>
                      {obj.district?.nameUz && (
                        <div className='text-xs text-gray-400'>{obj.district.nameUz}</div>
                      )}
                    </td>
                    <td className='px-3 py-2' style={{ border: '1px solid #e3e8f0' }}>
                      {obj.registryNumber
                        ? <CopyableNumber value={obj.registryNumber} />
                        : <span className='text-gray-400 text-xs'>—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className='flex items-center justify-between px-4 py-3 border-t border-[#e3e8f0] bg-[#f8faff]'>
            <span className='text-sm text-gray-500'>
              Jami:{' '}
              <span className='font-semibold text-[#1565c0]'>{total}</span> ta
            </span>
            <Pagination
              current={filters.page ?? 1}
              pageSize={filters.limit ?? DEFAULT_LIMIT}
              total={total}
              showSizeChanger
              pageSizeOptions={['10', '20', '50']}
              size='small'
              onChange={(page, pageSize) =>
                setFilters((f) => ({ ...f, page, limit: pageSize }))
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
