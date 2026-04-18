import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  Typography,
  Empty,
  Select,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateType,
  useUpdateType,
  useDeleteType,
} from '@/hooks/admin/useObjectTypes';
import type { ObjectCategory, ObjectType } from '@/types';

const { Title, Text } = Typography;

type CategoryModal = { mode: 'create' | 'edit'; item?: ObjectCategory } | null;
type TypeModal = { mode: 'create' | 'edit'; item?: ObjectType } | null;

export default function ObjectTypesPage() {
  const { data: categories = [], isLoading } = useAdminCategories();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const [catModal, setCatModal] = useState<CategoryModal>(null);
  const [typeModal, setTypeModal] = useState<TypeModal>(null);
  const [catForm] = Form.useForm();
  const [typeForm] = Form.useForm();

  const { mutate: createCat, isPending: isCreatingCat } = useCreateCategory();
  const { mutate: updateCat, isPending: isUpdatingCat } = useUpdateCategory(
    catModal?.item?.id ?? 0,
  );
  const { mutate: deleteCat } = useDeleteCategory();

  const { mutate: createType, isPending: isCreatingType } = useCreateType();
  const { mutate: updateType, isPending: isUpdatingType } = useUpdateType(
    typeModal?.item?.id ?? 0,
  );
  const { mutate: deleteType } = useDeleteType();

  const selectedCategory =
    categories.find((c) => c.id === selectedCategoryId) ?? null;
  const types: ObjectType[] = selectedCategory?.objectTypes ?? [];

  // Category modal
  const openCreateCat = () => {
    catForm.resetFields();
    setCatModal({ mode: 'create' });
  };
  const openEditCat = (item: ObjectCategory) => {
    catForm.setFieldsValue({
      code: item.code,
      nameUz: item.nameUz,
      nameKrill: item.nameKrill,
    });
    setCatModal({ mode: 'edit', item });
  };
  const closeCatModal = () => {
    setCatModal(null);
    catForm.resetFields();
  };

  const handleCatSubmit = (values: {
    code: string;
    nameUz: string;
    nameKrill?: string;
  }) => {
    if (catModal?.mode === 'create') {
      createCat(values, { onSuccess: closeCatModal });
    } else {
      updateCat(values, { onSuccess: closeCatModal });
    }
  };

  // Type modal
  const openCreateType = () => {
    if (!selectedCategoryId) return;
    typeForm.resetFields();
    typeForm.setFieldValue('categoryId', selectedCategoryId);
    setTypeModal({ mode: 'create' });
  };
  const openEditType = (item: ObjectType) => {
    typeForm.setFieldsValue({
      nameUz: item.nameUz,
      nameKrill: item.nameKrill,
      categoryId: item.categoryId,
    });
    setTypeModal({ mode: 'edit', item });
  };
  const closeTypeModal = () => {
    setTypeModal(null);
    typeForm.resetFields();
  };

  const handleTypeSubmit = (values: {
    nameUz: string;
    nameKrill?: string;
    categoryId: number;
  }) => {
    if (typeModal?.mode === 'create') {
      createType(values, { onSuccess: closeTypeModal });
    } else {
      updateType(values, { onSuccess: closeTypeModal });
    }
  };

  const catColumns = [
    {
      title: 'Kategoriya nomi',
      key: 'nameUz',
      render: (c: ObjectCategory) => (
        <button
          className={`text-left w-full px-2 py-1 cursor-pointer rounded transition-colors ${selectedCategoryId === c.id ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'}`}
          onClick={() =>
            setSelectedCategoryId(c.id === selectedCategoryId ? null : c.id)
          }
        >
          <span className='flex items-center gap-2'>
            {c.code && (
              <Tag color='blue' className='m-0 font-mono text-xs'>
                {c.code}
              </Tag>
            )}
            {c.nameUz}
          </span>
          {c.nameKrill && (
            <Text type='secondary' className='text-xs'>
              {c.nameKrill}
            </Text>
          )}
        </button>
      ),
    },
    {
      title: 'Turlar',
      key: 'count',
      width: 70,
      render: (c: ObjectCategory) => <Tag>{c.objectTypes?.length ?? 0} ta</Tag>,
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (c: ObjectCategory) => (
        <Space size={4}>
          <Button
            size='small'
            icon={<EditOutlined />}
            onClick={() => openEditCat(c)}
          />
          <Popconfirm
            title="Kategoriyani o'chirishni tasdiqlaysizmi?"
            description="Barcha turlar ham o'chadi"
            onConfirm={() => deleteCat(c.id)}
            okText='Ha'
            cancelText="Yo'q"
            okButtonProps={{ danger: true }}
          >
            <Button size='small' danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const typeColumns = [
    {
      title: 'Tur nomi',
      key: 'nameUz',
      render: (t: ObjectType) => (
        <div>
          <div>{t.nameUz}</div>
          {t.nameKrill && (
            <Text type='secondary' className='text-xs'>
              {t.nameKrill}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (t: ObjectType) => (
        <Space size={4}>
          <Button
            size='small'
            icon={<EditOutlined />}
            onClick={() => openEditType(t)}
          />
          <Popconfirm
            title="Turni o'chirishni tasdiqlaysizmi?"
            onConfirm={() => deleteType(t.id)}
            okText='Ha'
            cancelText="Yo'q"
            okButtonProps={{ danger: true }}
          >
            <Button size='small' danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className='flex flex-col gap-4'>
      <Title level={4} className='m-0'>
        Geografik obyekt guruhlari
      </Title>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {/* Categories */}
        <Card
          title='Kategoriyalar'
          size='small'
          extra={
            <Button
              size='small'
              type='primary'
              icon={<PlusOutlined />}
              onClick={openCreateCat}
            >
              Yangi
            </Button>
          }
        >
          <Table
            dataSource={categories}
            columns={catColumns}
            rowKey='id'
            loading={isLoading}
            pagination={false}
            size='small'
            scroll={{ y: 480 }}
            locale={{ emptyText: 'Kategoriyalar mavjud emas' }}
          />
        </Card>

        {/* Turlar */}
        <Card
          title={
            selectedCategory ? `"${selectedCategory.nameUz}" turlari` : 'Turlar'
          }
          size='small'
          extra={
            selectedCategoryId && (
              <Button
                size='small'
                type='primary'
                icon={<PlusOutlined />}
                onClick={openCreateType}
              >
                Yangi
              </Button>
            )
          }
        >
          {!selectedCategoryId ? (
            <Empty
              description='Kategoriya tanlang'
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              dataSource={types}
              columns={typeColumns}
              rowKey='id'
              pagination={false}
              scroll={{ y: 480 }}
              size='small'
              locale={{ emptyText: 'Turlar mavjud emas' }}
            />
          )}
        </Card>
      </div>

      {/* Category modal */}
      <Modal
        open={!!catModal}
        title={
          catModal?.mode === 'create'
            ? 'Yangi kategoriya'
            : 'Kategoriyani tahrirlash'
        }
        onCancel={closeCatModal}
        onOk={() => catForm.submit()}
        confirmLoading={isCreatingCat || isUpdatingCat}
        okText='Saqlash'
        cancelText='Bekor qilish'
        destroyOnHidden
      >
        <Form
          form={catForm}
          layout='vertical'
          onFinish={handleCatSubmit}
          className='pt-3'
        >
          <Form.Item
            label='Kod'
            name='code'
            rules={[
              { required: true, message: 'Kod kiritilishi shart' },
              { max: 20, message: 'Kod 20 ta belgidan oshmasligi kerak' },
            ]}
            extra='Qisqa kod, masalan: APU, MHU, MTU'
          >
            <Input
              placeholder='APU'
              style={{ fontFamily: 'monospace' }}
              maxLength={20}
            />
          </Form.Item>
          <Form.Item
            label='Nomi (lotin)'
            name='nameUz'
            rules={[
              { required: true, message: 'Nom kiritilishi shart' },
              { max: 200, message: 'Nom 200 ta belgidan oshmasligi kerak' },
            ]}
          >
            <Input placeholder='Kategoriya nomi' maxLength={200} />
          </Form.Item>
          <Form.Item
            label='Nomi (kirill)'
            name='nameKrill'
            rules={[
              { max: 200, message: 'Nom 200 ta belgidan oshmasligi kerak' },
            ]}
          >
            <Input placeholder='Kirill (ixtiyoriy)' maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Type modal */}
      <Modal
        open={!!typeModal}
        title={typeModal?.mode === 'create' ? 'Yangi tur' : 'Turni tahrirlash'}
        onCancel={closeTypeModal}
        onOk={() => typeForm.submit()}
        confirmLoading={isCreatingType || isUpdatingType}
        okText='Saqlash'
        cancelText='Bekor qilish'
        destroyOnHidden
      >
        <Form
          form={typeForm}
          layout='vertical'
          onFinish={handleTypeSubmit}
          className='pt-3'
        >
          <Form.Item
            label='Nomi (lotin)'
            name='nameUz'
            rules={[
              { required: true, message: 'Nom kiritilishi shart' },
              { max: 200, message: 'Nom 200 ta belgidan oshmasligi kerak' },
            ]}
          >
            <Input placeholder='Tur nomi' maxLength={200} />
          </Form.Item>
          <Form.Item
            label='Nomi (kirill)'
            name='nameKrill'
            rules={[
              { max: 200, message: 'Nom 200 ta belgidan oshmasligi kerak' },
            ]}
          >
            <Input placeholder='Kirill (ixtiyoriy)' maxLength={200} />
          </Form.Item>
          <Form.Item name='categoryId' hidden>
            <Input />
          </Form.Item>
          {typeModal?.mode === 'edit' && (
            <Form.Item label='Kategoriya' name='categoryId'>
              <Select
                options={categories.map((c) => ({
                  value: c.id,
                  label: c.nameUz,
                }))}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
