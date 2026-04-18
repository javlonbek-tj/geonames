import { useState } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  Modal,
  Form,
  Popconfirm,
  Typography,
  Switch,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useResetPassword,
} from '@/hooks/admin/useUsers';
import type { CreateUserPayload, UpdateUserPayload } from '@/api/admin.api';
import {
  useRegions,
  useDistricts,
  useAllDistricts,
} from '@/hooks/locations/useLocations';
import { ROLE_LABELS } from '@/constants';
import { COMMISSION_POSITION_LABELS } from '@/types/user';
import type { User, UserRole } from '@/types';

const { Title, Text } = Typography;

const ROLE_OPTIONS = Object.entries(ROLE_LABELS)
  .filter(([key]) => key !== 'admin')
  .map(([value, label]) => ({ value, label }));

const DISTRICT_ROLES: UserRole[] = [
  'dkp_filial',
  'district_commission',
  'district_hokimlik',
];
const REGIONAL_ROLES: UserRole[] = [
  'dkp_regional',
  'regional_commission',
  'regional_hokimlik',
];

type ModalMode = 'create' | 'edit' | 'password';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState<{ mode: ModalMode; user?: User } | null>(
    null,
  );
  const [form] = Form.useForm();
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>();
  const [selectedRegionId, setSelectedRegionId] = useState<
    number | undefined
  >();

  const { data, isLoading } = useUsers({
    page,
    limit: 10,
    role: roleFilter,
    search: search || undefined,
  });
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: deleteUser } = useDeleteUser();

  const editingId = modal?.mode !== 'create' ? modal?.user?.id : undefined;
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser(
    editingId ?? 0,
  );
  const { mutate: resetPassword, isPending: isResetting } = useResetPassword(
    editingId ?? 0,
  );

  const { data: regions = [] } = useRegions();
  const { data: districts = [] } = useDistricts(selectedRegionId);
  const { data: allDistricts = [] } = useAllDistricts();

  const openCreate = () => {
    form.resetFields();
    setSelectedRole(undefined);
    setSelectedRegionId(undefined);
    setModal({ mode: 'create' });
  };

  const openEdit = (user: User) => {
    setSelectedRole(user.role);
    setSelectedRegionId(user.regionId ?? undefined);
    form.setFieldsValue({
      fullName: user.fullName,
      role: user.role,
      regionId: user.regionId,
      districtId: user.districtId,
      position: user.position,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
    });
    setModal({ mode: 'edit', user });
  };

  const openPassword = (user: User) => {
    form.resetFields();
    setModal({ mode: 'password', user });
  };

  const closeModal = () => {
    setModal(null);
    form.resetFields();
    setSelectedRole(undefined);
    setSelectedRegionId(undefined);
  };

  const handleSubmit = (
    values: CreateUserPayload | UpdateUserPayload | { newPassword: string },
  ) => {
    if (modal?.mode === 'create') {
      createUser(values as CreateUserPayload, { onSuccess: closeModal });
    } else if (modal?.mode === 'edit') {
      updateUser(values as UpdateUserPayload, { onSuccess: closeModal });
    } else if (modal?.mode === 'password') {
      resetPassword((values as { newPassword: string }).newPassword, {
        onSuccess: closeModal,
      });
    }
  };

  const needsDistrict = DISTRICT_ROLES.includes(selectedRole as UserRole);
  const needsRegion =
    REGIONAL_ROLES.includes(selectedRole as UserRole) || needsDistrict;

  const columns = [
    {
      title: '#',
      width: 50,
      render: (_: unknown, __: User, i: number) => (
        <Text type='secondary'>{(page - 1) * 10 + i + 1}</Text>
      ),
    },
    {
      title: 'Foydalanuvchi',
      key: 'user',
      render: (u: User) => (
        <div>
          <div className='font-medium'>{u.fullName ?? u.username}</div>
          <Text type='secondary' className='text-xs'>
            {u.username}
          </Text>
        </div>
      ),
    },
    {
      title: 'Rol',
      key: 'role',
      render: (u: User) => <Tag>{ROLE_LABELS[u.role] ?? u.role}</Tag>,
    },
    {
      title: 'Viloyat / Tuman',
      key: 'location',
      render: (u: User) => {
        const region = regions.find((r) => r.id === u.regionId);
        const district = allDistricts.find((d) => d.id === u.districtId);
        if (!region) return <Text type='secondary'>—</Text>;
        return (
          <div className='text-xs'>
            <div>{region.nameUz}</div>
            {district && <Text type='secondary'>{district.nameUz}</Text>}
          </div>
        );
      },
    },
    {
      title: 'Holat',
      key: 'status',
      render: (u: User) => {
        if (u.isBlocked) return <Tag color='red'>Bloklangan</Tag>;
        if (u.isActive) return <Tag color='green'>Faol</Tag>;
        return <Tag color='default'>Nofaol</Tag>;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (u: User) => (
        <Space size={4}>
          <Tooltip title='Tahrirlash'>
            <Button
              size='small'
              icon={<EditOutlined />}
              onClick={() => openEdit(u)}
            />
          </Tooltip>
          <Tooltip title='Parolni yangilash'>
            <Button
              size='small'
              icon={<LockOutlined />}
              onClick={() => openPassword(u)}
            />
          </Tooltip>
          <Tooltip title="O'chirish">
            <Popconfirm
              title="Foydalanuvchini o'chirishni tasdiqlaysizmi?"
              onConfirm={() => deleteUser(u.id)}
              okText='Ha'
              cancelText="Yo'q"
              okButtonProps={{ danger: true }}
            >
              <Button size='small' danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const modalTitle =
    modal?.mode === 'create'
      ? 'Yangi foydalanuvchi'
      : modal?.mode === 'edit'
        ? 'Tahrirlash'
        : 'Parolni yangilash';

  const isPending = isCreating || isUpdating || isResetting;

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <Title level={4} className='m-0'>
          Foydalanuvchilar
        </Title>
        <Button type='primary' icon={<PlusOutlined />} onClick={openCreate}>
          Yangi foydalanuvchi
        </Button>
      </div>

      <div className='flex gap-2'>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Username bo'yicha qidirish"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          allowClear
          style={{ maxWidth: 260 }}
        />
        <Select
          placeholder="Rol bo'yicha filter"
          allowClear
          style={{ width: 220 }}
          options={ROLE_OPTIONS}
          value={roleFilter}
          onChange={(v) => {
            setRoleFilter(v);
            setPage(1);
          }}
        />
      </div>

      <Table
        dataSource={data?.data ?? []}
        columns={columns}
        rowKey='id'
        loading={isLoading}
        size='small'
        pagination={{
          current: page,
          total: data?.meta.total ?? 0,
          pageSize: 10,
          onChange: setPage,
          showTotal: (t) => `Jami: ${t} ta`,
        }}
      />

      <Modal
        open={!!modal}
        title={modalTitle}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={isPending}
        okText='Saqlash'
        cancelText='Bekor qilish'
        destroyOnHidden
      >
        {modal?.mode === 'password' ? (
          <Form
            form={form}
            layout='vertical'
            onFinish={handleSubmit}
            className='pt-3'
          >
            <Form.Item
              label='Yangi parol'
              name='newPassword'
              rules={[
                { required: true, message: 'Parol kiritilishi shart' },
                { min: 8, message: 'Kamida 8 ta belgi' },
              ]}
            >
              <Input.Password placeholder='Yangi parolni kiriting' />
            </Form.Item>
          </Form>
        ) : (
          <Form
            form={form}
            layout='vertical'
            onFinish={handleSubmit}
            className='pt-3'
          >
            {modal?.mode === 'create' && (
              <>
                <Form.Item
                  label='Username'
                  name='username'
                  rules={[
                    { required: true, message: 'Username kiritilishi shart' },
                    { min: 3, message: 'Kamida 3 ta belgi' },
                    { max: 50, message: '50 ta belgidan oshmasligi kerak' },
                    {
                      pattern: /^[a-zA-Z0-9_]+$/,
                      message: 'Faqat harf, raqam va _ mumkin',
                    },
                  ]}
                >
                  <Input placeholder='username' maxLength={50} />
                </Form.Item>
                <Form.Item
                  label='Parol'
                  name='password'
                  rules={[
                    { required: true, message: 'Parol kiritilishi shart' },
                    { min: 8, message: 'Kamida 8 ta belgi' },
                  ]}
                >
                  <Input.Password placeholder='Parol' />
                </Form.Item>
              </>
            )}

            <Form.Item
              label='F.I.O.'
              name='fullName'
              rules={[
                {
                  required: modal?.mode === 'create',
                  message: 'F.I.O. kiritilishi shart',
                },
                { min: 2, message: "F.I.O. kamida 2 ta belgi bo'lishi kerak" },
                {
                  max: 200,
                  message: 'F.I.O. 200 ta belgidan oshmasligi kerak',
                },
              ]}
            >
              <Input placeholder="To'liq ism" maxLength={200} />
            </Form.Item>

            <Form.Item
              label='Rol'
              name='role'
              rules={[{ required: true, message: 'Rol tanlanishi shart' }]}
            >
              <Select
                placeholder='Rol tanlang'
                options={ROLE_OPTIONS}
                onChange={(val) => {
                  setSelectedRole(val as UserRole);
                  setSelectedRegionId(undefined);
                  form.setFieldsValue({
                    regionId: undefined,
                    districtId: undefined,
                  });
                }}
              />
            </Form.Item>

            {needsRegion && (
              <Form.Item
                label='Viloyat'
                name='regionId'
                rules={[
                  { required: true, message: 'Viloyat tanlanishi shart' },
                ]}
              >
                <Select
                  placeholder='Viloyat tanlang'
                  options={regions.map((r) => ({
                    value: r.id,
                    label: r.nameUz,
                  }))}
                  onChange={(val) => {
                    setSelectedRegionId(val as number);
                    form.setFieldValue('districtId', undefined);
                  }}
                />
              </Form.Item>
            )}

            {needsDistrict && (
              <Form.Item
                label='Tuman'
                name='districtId'
                rules={[{ required: true, message: 'Tuman tanlanishi shart' }]}
              >
                <Select
                  placeholder='Tuman tanlang'
                  disabled={!selectedRegionId}
                  options={districts.map((d) => ({
                    value: d.id,
                    label: d.nameUz,
                  }))}
                />
              </Form.Item>
            )}

            {selectedRole === 'district_commission' && (
              <Form.Item
                label='Lavozim'
                name='position'
                rules={[
                  { required: true, message: 'Lavozim tanlanishi shart' },
                ]}
              >
                <Select
                  placeholder='Lavozim tanlang'
                  options={Object.entries(COMMISSION_POSITION_LABELS).map(
                    ([value, label]) => ({ value, label }),
                  )}
                />
              </Form.Item>
            )}

            {modal?.mode === 'edit' && (
              <div className='flex gap-4'>
                <Form.Item label='Faol' name='isActive' valuePropName='checked'>
                  <Switch />
                </Form.Item>
                <Form.Item
                  label='Bloklangan'
                  name='isBlocked'
                  valuePropName='checked'
                >
                  <Switch />
                </Form.Item>
              </div>
            )}
          </Form>
        )}
      </Modal>
    </div>
  );
}
