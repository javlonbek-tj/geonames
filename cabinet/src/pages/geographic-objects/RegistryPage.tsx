import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Tag,
  Typography,
  Space,
  Tooltip,
  Modal,
  Form,
  message,
} from 'antd';
import {
  SearchOutlined,
  ClearOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useState as useLocalState } from 'react';
import type { TableProps } from 'antd';
import {
  useRegistry,
  useUpdateRegistryObject,
  useDeleteRegistryObject,
} from '@/hooks/geographic-objects/useRegistry';
import { useRegions, useDistricts } from '@/hooks/locations/useLocations';
import { useAdminCategories } from '@/hooks/admin/useObjectTypes';
import type { GeographicObject } from '@/types';
import type { RegistryParams } from '@/api/geographic-objects.api';

const { Title, Text } = Typography;
const DEFAULT_LIMIT = 10;

function CopyableNumber({ value }: { value: string }) {
  const [copied, setCopied] = useLocalState(false);
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
        {copied ? (
          <CheckOutlined style={{ fontSize: 10 }} />
        ) : (
          <CopyOutlined style={{ fontSize: 10 }} />
        )}
      </span>
    </Tooltip>
  );
}

export default function RegistryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive filters from URL
  const filters: RegistryParams = {
    page: Number(searchParams.get('page') || 1),
    limit: Number(searchParams.get('limit') || DEFAULT_LIMIT),
    search: searchParams.get('search') || undefined,
    regionId: searchParams.get('regionId')
      ? Number(searchParams.get('regionId'))
      : undefined,
    districtId: searchParams.get('districtId')
      ? Number(searchParams.get('districtId'))
      : undefined,
    categoryId: searchParams.get('categoryId')
      ? Number(searchParams.get('categoryId'))
      : undefined,
    objectTypeId: searchParams.get('objectTypeId')
      ? Number(searchParams.get('objectTypeId'))
      : undefined,
  };
  const selectedCategoryId = filters.categoryId;

  const [searchInput, setSearchInput] = useState(
    searchParams.get('search') || '',
  );

  const setFilters = useCallback(
    (updater: RegistryParams | ((prev: RegistryParams) => RegistryParams)) => {
      const next = typeof updater === 'function' ? updater(filters) : updater;
      const params = new URLSearchParams();
      if (next.page && next.page !== 1) params.set('page', String(next.page));
      if (next.limit && next.limit !== DEFAULT_LIMIT)
        params.set('limit', String(next.limit));
      if (next.search) params.set('search', next.search);
      if (next.regionId) params.set('regionId', String(next.regionId));
      if (next.districtId) params.set('districtId', String(next.districtId));
      if (next.categoryId) params.set('categoryId', String(next.categoryId));
      if (next.objectTypeId)
        params.set('objectTypeId', String(next.objectTypeId));
      setSearchParams(params, { replace: true });
    },
    [filters, setSearchParams],
  );

  // Edit modal
  const [editObj, setEditObj] = useState<GeographicObject | null>(null);
  const [editForm] = Form.useForm();
  const [editCategoryId, setEditCategoryId] = useState<number | undefined>();

  const { data, isFetching } = useRegistry(filters);
  const { data: regions = [] } = useRegions();
  const { data: filterDistricts = [] } = useDistricts(filters.regionId);
  const { data: editDistricts = [] } = useDistricts(
    editForm.getFieldValue('regionId'),
  );
  const { data: categories = [] } = useAdminCategories();

  const { mutate: updateObj, isPending: isUpdating } =
    useUpdateRegistryObject();
  const { mutate: deleteObj } = useDeleteRegistryObject();

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const typeOptions = selectedCategory?.objectTypes ?? [];
  const editCategory = categories.find((c) => c.id === editCategoryId);
  const editTypeOptions = editCategory?.objectTypes ?? [];

  const applySearch = useCallback(() => {
    setFilters((f) => ({ ...f, page: 1, search: searchInput || undefined }));
  }, [searchInput]);

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({}, { replace: true });
  };

  const hasFilters =
    !!filters.search ||
    !!filters.regionId ||
    !!filters.districtId ||
    !!filters.categoryId ||
    !!filters.objectTypeId;

  const openEdit = (obj: GeographicObject) => {
    const catId = obj.objectType?.categoryId;
    setEditCategoryId(catId);
    setEditObj(obj);
    editForm.setFieldsValue({
      nameUz: obj.nameUz,
      nameKrill: obj.nameKrill,
      registryNumber: obj.registryNumber,
      regionId: obj.regionId,
      districtId: obj.districtId,
      categoryId: catId,
      objectTypeId: obj.objectTypeId,
      basisDocument: obj.basisDocument,
      affiliation: obj.affiliation,
      historicalName: obj.historicalName,
      comment: obj.comment,
    });
  };

  const handleEditSubmit = (values: Record<string, unknown>) => {
    if (!editObj) return;
    const { categoryId: _cat, ...rest } = values;
    updateObj(
      { id: editObj.id, data: rest },
      {
        onSuccess: () => {
          message.success("O'zgarishlar saqlandi");
          setEditObj(null);
          editForm.resetFields();
        },
        onError: () => message.error('Xatolik yuz berdi'),
      },
    );
  };

  const handleDelete = (id: number, name?: string | null) => {
    Modal.confirm({
      title: "O'chirishni tasdiqlaysizmi?",
      content: name ? `"${name}" obyekti o'chiriladi` : "Obyekt o'chiriladi",
      okText: "O'chirish",
      cancelText: 'Bekor qilish',
      okButtonProps: { danger: true },
      centered: true,
      onOk: () =>
        new Promise((resolve, reject) => {
          deleteObj(id, {
            onSuccess: () => {
              message.success("Obyekt o'chirildi");
              resolve(undefined);
            },
            onError: () => {
              message.error('Xatolik yuz berdi');
              reject();
            },
          });
        }),
    });
  };

  const columns: TableProps<GeographicObject>['columns'] = [
    {
      title: '№',
      key: 'index',
      width: 52,
      render: (_: unknown, __: GeographicObject, index: number) =>
        ((filters.page ?? 1) - 1) * (filters.limit ?? DEFAULT_LIMIT) +
        index +
        1,
    },
    {
      title: 'Nomi',
      key: 'nameUz',
      width: 200,
      render: (obj: GeographicObject) => (
        <Text className='font-medium'>
          {obj.nameUz || <Text type='secondary'>—</Text>}
        </Text>
      ),
    },
    {
      title: 'Geografik obyekt guruhi',
      key: 'category',
      width: 180,
      render: (obj: GeographicObject) => {
        const cat = obj.objectType?.category;
        if (!cat) return <Text type='secondary'>—</Text>;
        return <Text className='text-sm'>{cat.nameUz}</Text>;
      },
    },
    {
      title: 'Geografik obyekt turi',
      key: 'objectType',
      width: 160,
      render: (obj: GeographicObject) =>
        obj.objectType ? (
          <Text className='text-sm'>{obj.objectType.nameUz}</Text>
        ) : (
          <Text type='secondary'>—</Text>
        ),
    },
    {
      title: 'Hudud',
      key: 'location',
      width: 160,
      render: (obj: GeographicObject) => (
        <div className='leading-tight'>
          <div className='text-sm'>{obj.region?.nameUz ?? '—'}</div>
          <Text type='secondary' className='text-xs'>
            {obj.district?.nameUz}
          </Text>
        </div>
      ),
    },
    {
      title: 'Tegishlilik',
      key: 'affiliation',
      width: 150,
      render: (obj: GeographicObject) =>
        obj.affiliation ? (
          <Tooltip title={obj.affiliation}>
            <Text className='text-sm line-clamp-2'>{obj.affiliation}</Text>
          </Tooltip>
        ) : (
          <Text type='secondary'>—</Text>
        ),
    },
    {
      title: "Me'yoriy hujjat",
      key: 'basisDocument',
      render: (obj: GeographicObject) =>
        obj.basisDocument ? (
          <Tooltip title={obj.basisDocument}>
            <Text className='text-sm line-clamp-2'>{obj.basisDocument}</Text>
          </Tooltip>
        ) : (
          <Text type='secondary'>—</Text>
        ),
    },
    {
      title: 'Reyestr raqami',
      key: 'registryNumber',
      width: 160,
      render: (obj: GeographicObject) =>
        obj.registryNumber ? (
          <CopyableNumber value={obj.registryNumber} />
        ) : (
          <Text type='secondary'>—</Text>
        ),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (obj: GeographicObject) => (
        <Space size={4}>
          <Tooltip title="Ko'rish">
            <Button
              size='small'
              icon={<EyeOutlined />}
              onClick={() => navigate(`/geographic-objects/${obj.id}`)}
            />
          </Tooltip>
          <Tooltip title='Tahrirlash'>
            <Button
              size='small'
              icon={<EditOutlined />}
              onClick={() => openEdit(obj)}
            />
          </Tooltip>
          <Tooltip title="O'chirish">
            <Button
              size='small'
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(obj.id, obj.nameUz)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className='flex flex-col gap-4'>
      <Title level={4} className='m-0'>
        Geografik obyektlar reyestri
      </Title>

      {/* Filters */}
      <Card size='small'>
        <div className='flex flex-wrap gap-2 items-end'>
          <div className='flex-1 min-w-48'>
            <div className='text-xs text-gray-500 mb-1'>
              Qidirish (nomi bo'yicha)
            </div>
            <Input
              placeholder="Nom yoki reyestr raqami bo'yicha..."
              prefix={<SearchOutlined className='text-gray-400' />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={applySearch}
              allowClear
              onClear={() => {
                setSearchInput('');
                setFilters((f) => ({ ...f, page: 1, search: undefined }));
              }}
            />
          </div>
          <div className='w-44'>
            <div className='text-xs text-gray-500 mb-1'>Viloyat</div>
            <Select
              placeholder='Barchasi'
              allowClear
              className='w-full'
              value={filters.regionId}
              options={regions.map((r) => ({ value: r.id, label: r.nameUz }))}
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  page: 1,
                  regionId: v,
                  districtId: undefined,
                }))
              }
            />
          </div>
          <div className='w-44'>
            <div className='text-xs text-gray-500 mb-1'>Tuman</div>
            <Select
              placeholder='Barchasi'
              allowClear
              className='w-full'
              disabled={!filters.regionId}
              value={filters.districtId}
              options={filterDistricts.map((d) => ({
                value: d.id,
                label: d.nameUz,
              }))}
              onChange={(v) =>
                setFilters((f) => ({ ...f, page: 1, districtId: v }))
              }
            />
          </div>
          <div className='w-48'>
            <div className='text-xs text-gray-500 mb-1'>Guruh</div>
            <Select
              placeholder='Barchasi'
              allowClear
              className='w-full'
              value={selectedCategoryId}
              options={categories.map((c) => ({
                value: c.id,
                label: c.code ? `[${c.code}] ${c.nameUz}` : c.nameUz,
              }))}
              onChange={(v) => {
                setFilters((f) => ({
                  ...f,
                  page: 1,
                  categoryId: v,
                  objectTypeId: undefined,
                }));
              }}
            />
          </div>
          <div className='w-48'>
            <div className='text-xs text-gray-500 mb-1'>Tur</div>
            <Select
              placeholder='Barchasi'
              allowClear
              className='w-full'
              disabled={!selectedCategoryId}
              value={filters.objectTypeId}
              options={typeOptions.map((t) => ({
                value: t.id,
                label: t.nameUz,
              }))}
              onChange={(v) =>
                setFilters((f) => ({ ...f, page: 1, objectTypeId: v }))
              }
            />
          </div>
          <Space>
            <Button
              type='primary'
              icon={<SearchOutlined />}
              onClick={applySearch}
            >
              Qidirish
            </Button>
            {hasFilters && (
              <Button icon={<ClearOutlined />} onClick={clearFilters}>
                Tozalash
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* Table */}
      <Card size='small' styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={data?.data ?? []}
          columns={columns}
          rowKey='id'
          loading={isFetching}
          pagination={{
            current: filters.page ?? 1,
            pageSize: filters.limit ?? DEFAULT_LIMIT,
            total: data?.meta.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => (
              <span className='inline-flex items-center gap-1 px-3 py-0.5 rounded text-sm font-medium text-blue-600 bg-blue-50'>
                Jami: {total} ta
              </span>
            ),
            onChange: (page, pageSize) =>
              setFilters((f) => ({ ...f, page, limit: pageSize })),
          }}
          size='small'
          bordered
          className='registry-table'
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* Edit Modal */}
      <Modal
        open={!!editObj}
        title='Obyektni tahrirlash'
        onCancel={() => {
          setEditObj(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        confirmLoading={isUpdating}
        okText='Saqlash'
        cancelText='Bekor qilish'
        width={600}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout='vertical'
          onFinish={handleEditSubmit}
          className='pt-2'
        >
          <div className='grid grid-cols-2 gap-x-4'>
            <Form.Item
              label='Nomi (lotin)'
              name='nameUz'
              rules={[{ required: true, message: 'Nom kiritilishi shart' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label='Nomi (kirill)' name='nameKrill'>
              <Input />
            </Form.Item>
            <Form.Item label='Tarixiy nomi' name='historicalName'>
              <Input />
            </Form.Item>
            <Form.Item label='Reyestr raqami' name='registryNumber'>
              <Input />
            </Form.Item>
            <Form.Item label='Viloyat' name='regionId'>
              <Select
                options={regions.map((r) => ({ value: r.id, label: r.nameUz }))}
                onChange={() => editForm.setFieldValue('districtId', undefined)}
              />
            </Form.Item>
            <Form.Item label='Tuman' name='districtId'>
              <Select
                options={editDistricts.map((d) => ({
                  value: d.id,
                  label: d.nameUz,
                }))}
              />
            </Form.Item>
            <Form.Item label='Guruh' name='categoryId'>
              <Select
                allowClear
                options={categories.map((c) => ({
                  value: c.id,
                  label: c.nameUz,
                }))}
                onChange={(v) => {
                  setEditCategoryId(v);
                  editForm.setFieldValue('objectTypeId', undefined);
                }}
              />
            </Form.Item>
            <Form.Item label='Tur' name='objectTypeId'>
              <Select
                allowClear
                disabled={!editCategoryId}
                options={editTypeOptions.map((t) => ({
                  value: t.id,
                  label: t.nameUz,
                }))}
              />
            </Form.Item>
          </div>
          <Form.Item label='Tegishlilik' name='affiliation'>
            <Input />
          </Form.Item>
          <Form.Item label="Me'yoriy hujjat" name='basisDocument'>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label='Izoh' name='comment'>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
