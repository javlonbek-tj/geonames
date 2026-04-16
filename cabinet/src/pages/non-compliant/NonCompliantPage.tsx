import { useState, useMemo } from 'react';
import { Card, Table, Tag, Typography, Input, Select, Spin, Empty } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { useNonCompliantList } from '@/hooks/geo-flags/useGeoFlags';
import { useRegions, useDistricts } from '@/hooks/locations/useLocations';
import type { NonCompliantItem } from '@/api/geo-flags.api';

const { Title, Text } = Typography;
const { Search } = Input;

export default function NonCompliantPage() {
  const { data = [], isLoading } = useNonCompliantList();
  const { data: regions = [] } = useRegions();
  const [search, setSearch] = useState('');
  const [regionId, setRegionId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);

  const { data: districts = [] } = useDistricts(regionId ?? undefined);

  const filtered = useMemo(() => {
    let rows = data;
    if (regionId) {
      const regionName = regions.find((r) => r.id === regionId)?.nameUz;
      rows = rows.filter((r) => r.regionName === regionName);
    }
    if (districtId) {
      const districtName = districts.find((d) => d.id === districtId)?.nameUz;
      rows = rows.filter((r) => r.districtName === districtName);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.nameUz.toLowerCase().includes(q) ||
          r.applicationNumber.toLowerCase().includes(q) ||
          r.objectType.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [data, regionId, districtId, search, regions, districts]);

  // Group by region + district for display
  const grouped = useMemo(() => {
    const map = new Map<string, NonCompliantItem[]>();
    for (const row of filtered) {
      const key = `${row.regionName ?? '—'} · ${row.districtName ?? '—'}`;
      const arr = map.get(key) ?? [];
      arr.push(row);
      map.set(key, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const columns = [
    {
      title: '#',
      width: 40,
      render: (_: unknown, __: NonCompliantItem, i: number) => (
        <Text type='secondary'>{i + 1}</Text>
      ),
    },
    {
      title: 'Ariza raqami',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
    },
    {
      title: 'Taklif etilgan nom',
      dataIndex: 'nameUz',
      key: 'nameUz',
      render: (v: string) => v || <Text type='secondary'>Nomsiz</Text>,
    },
    {
      title: 'Obyekt turi',
      dataIndex: 'objectType',
      key: 'objectType',
    },
    {
      title: 'Izoh',
      dataIndex: 'comment',
      key: 'comment',
      render: (v: string | null) =>
        v ? (
          <Text type='secondary' className='italic text-xs'>
            "{v}"
          </Text>
        ) : (
          <Text type='secondary'>—</Text>
        ),
    },
    {
      title: 'Belgilagan',
      dataIndex: 'markedBy',
      key: 'markedBy',
    },
    {
      title: 'Sana',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleDateString('uz-UZ'),
    },
  ];

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-3'>
        <WarningOutlined style={{ fontSize: 22, color: '#fa8c16' }} />
        <Title level={4} className='m-0'>
          Nomuvofiq geografik obyektlar
        </Title>
        <Tag color='orange'>{data.length} ta</Tag>
      </div>

      {/* Filters */}
      <Card size='small'>
        <div className='flex flex-wrap gap-3'>
          <Search
            placeholder='Nom yoki ariza raqami...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 260 }}
          />
          <Select
            placeholder='Viloyat'
            allowClear
            style={{ width: 200 }}
            value={regionId ?? undefined}
            onChange={(v) => {
              setRegionId(v ?? null);
              setDistrictId(null);
            }}
            options={regions.map((r) => ({ value: r.id, label: r.nameUz }))}
            showSearch
            filterOption={(input, opt) =>
              (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
          <Select
            placeholder='Tuman'
            allowClear
            style={{ width: 200 }}
            value={districtId ?? undefined}
            disabled={!regionId}
            onChange={(v) => setDistrictId(v ?? null)}
            options={districts.map((d) => ({ value: d.id, label: d.nameUz }))}
            showSearch
            filterOption={(input, opt) =>
              (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>
      </Card>

      {grouped.length === 0 ? (
        <Empty description='Nomuvofiq obyektlar mavjud emas' />
      ) : (
        grouped.map(([groupKey, rows]) => (
          <Card
            key={groupKey}
            title={
              <div className='flex items-center gap-2'>
                <WarningOutlined style={{ color: '#fa8c16' }} />
                <span>{groupKey}</span>
                <Tag color='orange'>{rows.length} ta</Tag>
              </div>
            }
            size='small'
          >
            <Table
              dataSource={rows}
              columns={columns}
              rowKey='id'
              pagination={false}
              size='small'
              locale={{ emptyText: 'Mavjud emas' }}
            />
          </Card>
        ))
      )}
    </div>
  );
}
