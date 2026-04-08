import { useState } from 'react';
import { Table, Tag, Select, Typography, Button, Tabs, type TableProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useApplications } from '@/hooks/applications/useApplications';
import { useAuthStore } from '@/store/authStore';
import { STATUS_LABELS, STATUS_COLORS } from '@/constants';
import type { Application, ApplicationStatus } from '@/types';

const { Title } = Typography;

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const columns: TableProps<Application>['columns'] = [
  {
    title: 'Ariza raqami',
    dataIndex: 'applicationNumber',
    key: 'applicationNumber',
    width: 160,
  },
  {
    title: "Geografik ob'yektlar",
    key: 'objects',
    render: (_, record) => {
      const objs = record.geographicObjects ?? [];
      if (objs.length === 0) return '—';
      if (objs.length === 1) return objs[0].nameUz;
      return `${objs[0].nameUz} (+${objs.length - 1} ta)`;
    },
  },
  {
    title: 'Turi',
    key: 'objectType',
    render: (_, record) => record.geographicObjects?.[0]?.objectType?.nameUz ?? '—',
  },
  {
    title: 'Viloyat',
    key: 'region',
    render: (_, record) => record.geographicObjects?.[0]?.region?.nameUz ?? '—',
  },
  {
    title: 'Tuman',
    key: 'district',
    render: (_, record) => record.geographicObjects?.[0]?.district?.nameUz ?? '—',
  },
  {
    title: 'Holat',
    dataIndex: 'currentStatus',
    key: 'currentStatus',
    width: 260,
    render: (status: ApplicationStatus) => (
      <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>
    ),
  },
  {
    title: 'Yangilangan',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 130,
    render: (val: string) => new Date(val).toLocaleDateString('uz-UZ'),
  },
];

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>(undefined);

  const { data, isLoading } = useApplications({
    page,
    limit: 20,
    status,
    tab: tab === 'history' ? 'history' : undefined,
  });

  const handleTabChange = (key: string) => {
    setTab(key as 'active' | 'history');
    setPage(1);
    setStatus(undefined);
  };

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <Title level={4} className='m-0'>Arizalar</Title>
        <div className='flex items-center gap-2'>
          {user?.role === 'dkp_filial' && (
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => void navigate('/geographic-objects/create')}
            >
              Yangi ob'yekt
            </Button>
          )}
          <Select
            allowClear
            placeholder="Holat bo'yicha filter"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(val) => { setStatus(val); setPage(1); }}
            className='w-72'
          />
        </div>
      </div>

      <Tabs
        activeKey={tab}
        onChange={handleTabChange}
        items={[
          { key: 'active', label: 'Faol' },
          { key: 'history', label: 'Tarixiy' },
        ]}
      />

      <Table
        rowKey='id'
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
        onRow={(record) => ({
          onClick: () => void navigate(`/applications/${record.id}`),
          className: 'cursor-pointer',
        })}
        pagination={{
          current: page,
          pageSize: 20,
          total: data?.meta.total,
          showTotal: (total) => `Jami: ${total} ta`,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
      />
    </div>
  );
}
