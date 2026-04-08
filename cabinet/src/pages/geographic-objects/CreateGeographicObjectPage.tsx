import { useState, useRef } from 'react';
import {
  Card, Form, Input, Select, Switch, Button, Typography, Upload, Alert, Table,
} from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useRegions, useDistricts } from '@/hooks/locations/useLocations';
import { useObjectCategories, useObjectTypes } from '@/hooks/object-types/useObjectTypes';
import { useCreateGeographicObject } from '@/hooks/geographic-objects/useCreateGeographicObject';
import { useAuthStore } from '@/store/authStore';
import GeoJsonMap from '@/components/map/GeoJsonMap';
import type { GeoJSON } from '@/types';

const { Title, Text } = Typography;
const { Dragger } = Upload;

interface ObjectRow {
  key: string;
  nameUz: string;
  nameKrill: string;
  registryNumber: string;
  geometry: GeoJSON;
}

function extractObjects(geojson: GeoJSON): ObjectRow[] {
  if (geojson.type === 'FeatureCollection' && Array.isArray(geojson.features)) {
    return geojson.features.map((f: GeoJSON, i: number) => ({
      key: String(i),
      nameUz: f.properties?.name ?? f.properties?.nameUz ?? '',
      nameKrill: f.properties?.nameKrill ?? '',
      registryNumber: f.properties?.registryNumber ?? '',
      geometry: f.type === 'Feature' ? f : { type: 'Feature', properties: {}, geometry: f },
    }));
  }
  // Single Feature yoki Geometry
  if (geojson.type === 'Feature') {
    return [{
      key: '0',
      nameUz: geojson.properties?.name ?? geojson.properties?.nameUz ?? '',
      nameKrill: geojson.properties?.nameKrill ?? '',
      registryNumber: '',
      geometry: geojson,
    }];
  }
  // Raw Geometry
  return [{
    key: '0',
    nameUz: '',
    nameKrill: '',
    registryNumber: '',
    geometry: { type: 'Feature', properties: {}, geometry: geojson },
  }];
}

function buildFeatureCollection(rows: ObjectRow[]): GeoJSON {
  return {
    type: 'FeatureCollection',
    features: rows.map((r) => ({
      type: 'Feature',
      properties: { name: r.nameUz },
      geometry: r.geometry.type === 'Feature' ? r.geometry.geometry : r.geometry,
    })),
  };
}

export default function CreateGeographicObjectPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { mutate: create, isPending } = useCreateGeographicObject();

  const [form] = Form.useForm();
  const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>(
    user?.regionId ?? undefined,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [existsInRegistry, setExistsInRegistry] = useState(false);
  const [objects, setObjects] = useState<ObjectRow[]>([]);
  const [geojsonError, setGeojsonError] = useState<string | null>(null);
  const fileListRef = useRef<{ uid: string; name: string }[]>([]);

  const { data: regions = [] } = useRegions();
  const { data: districts = [] } = useDistricts(selectedRegionId);
  const { data: categories = [] } = useObjectCategories();
  const { data: objectTypes = [] } = useObjectTypes(selectedCategoryId);

  const initialValues = {
    regionId: user?.regionId ?? undefined,
    districtId: user?.districtId ?? undefined,
    existsInRegistry: false,
  };

  const handleGeoJsonFile = (file: File) => {
    setGeojsonError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as GeoJSON;
        if (!parsed.type) throw new Error("GeoJSON formati noto'g'ri");
        setObjects(extractObjects(parsed));
      } catch {
        setGeojsonError("GeoJSON fayl noto'g'ri formatda");
        setObjects([]);
      }
    };
    reader.readAsText(file);
    return false;
  };

  const updateObject = (key: string, field: keyof ObjectRow, value: string) => {
    setObjects((prev) =>
      prev.map((o) => (o.key === key ? { ...o, [field]: value } : o)),
    );
  };

  const removeObject = (key: string) => {
    setObjects((prev) => prev.filter((o) => o.key !== key));
  };

  const onFinish = (values: {
    objectTypeId: number;
    regionId: number;
    districtId: number;
    existsInRegistry: boolean;
  }) => {
    if (objects.length === 0) {
      setGeojsonError("GeoJSON fayl yuklanishi shart");
      return;
    }
    const missing = objects.find((o) => !o.nameUz.trim());
    if (missing) {
      setGeojsonError(`${Number(missing.key) + 1}-ob'yekt uchun nomi kiritilishi shart`);
      return;
    }


    create({
      objectTypeId: values.objectTypeId,
      regionId: values.regionId,
      districtId: values.districtId,
      existsInRegistry: values.existsInRegistry,
      objects: objects.map((o) => {
        // Feature bo'lsa ichidagi raw geometryni saqlaymiz
        const geom = o.geometry.type === 'Feature' ? o.geometry.geometry : o.geometry;
        return {
          nameUz: o.nameUz.trim(),
          nameKrill: o.nameKrill.trim() || undefined,
          registryNumber: o.registryNumber.trim() || undefined,
          geometry: geom,
        };
      }),
    });
  };

  const mapGeojson = objects.length > 0 ? buildFeatureCollection(objects) : null;

  const columns = [
    {
      title: '#',
      width: 40,
      render: (_: unknown, __: ObjectRow, index: number) => (
        <Text type='secondary'>{index + 1}</Text>
      ),
    },
    {
      title: "Nomi (lotin) *",
      dataIndex: 'nameUz',
      render: (val: string, record: ObjectRow) => (
        <Input
          value={val}
          placeholder="Ko'cha nomi"
          onChange={(e) => updateObject(record.key, 'nameUz', e.target.value)}
          status={!val.trim() ? 'error' : undefined}
        />
      ),
    },
    {
      title: 'Nomi (kirill)',
      dataIndex: 'nameKrill',
      render: (val: string, record: ObjectRow) => (
        <Input
          value={val}
          placeholder="Кўча номи"
          onChange={(e) => updateObject(record.key, 'nameKrill', e.target.value)}
        />
      ),
    },
    ...(existsInRegistry
      ? [{
          title: 'Reyestr raqami',
          dataIndex: 'registryNumber',
          render: (val: string, record: ObjectRow) => (
            <Input
              value={val}
              placeholder="Raqam"
              onChange={(e) => updateObject(record.key, 'registryNumber', e.target.value)}
            />
          ),
        }]
      : []),
    {
      title: '',
      width: 40,
      render: (_: unknown, record: ObjectRow) => (
        <Button
          type='text'
          danger
          size='small'
          icon={<DeleteOutlined />}
          onClick={() => removeObject(record.key)}
          disabled={objects.length === 1}
        />
      ),
    },
  ];

  return (
    <div className='flex flex-col gap-4 max-w-5xl'>
      <div className='flex items-center justify-between'>
        <Title level={4} className='m-0'>Yangi ariza — geografik ob'yektlar</Title>
        <Button onClick={() => void navigate('/applications')}>Orqaga</Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-5 gap-4'>

        {/* Umumiy ma'lumotlar */}
        <Card title="Umumiy ma'lumotlar" size='small' className='lg:col-span-2'>
          <Form
            form={form}
            layout='vertical'
            initialValues={initialValues}
            onFinish={onFinish}
          >
            <Form.Item label='Kategoriya' required>
              <Select
                placeholder='Kategoriya tanlang'
                options={categories.map((c) => ({ value: c.id, label: c.nameUz }))}
                onChange={(val) => {
                  setSelectedCategoryId(val as number);
                  form.setFieldValue('objectTypeId', undefined);
                }}
              />
            </Form.Item>

            <Form.Item label="Ob'yekt turi" name='objectTypeId'
              rules={[{ required: true, message: "Tur tanlanishi shart" }]}
            >
              <Select
                placeholder="Tur tanlang"
                disabled={!selectedCategoryId}
                options={objectTypes.map((t) => ({ value: t.id, label: t.nameUz }))}
              />
            </Form.Item>

            <Form.Item label='Viloyat' name='regionId'
              rules={[{ required: true, message: 'Viloyat tanlanishi shart' }]}
            >
              <Select
                placeholder='Viloyat tanlang'
                options={regions.map((r) => ({ value: r.id, label: r.nameUz }))}
                onChange={(val) => {
                  setSelectedRegionId(val as number);
                  form.setFieldValue('districtId', undefined);
                }}
              />
            </Form.Item>

            <Form.Item label='Tuman' name='districtId'
              rules={[{ required: true, message: 'Tuman tanlanishi shart' }]}
            >
              <Select
                placeholder='Tuman tanlang'
                disabled={!selectedRegionId}
                options={districts.map((d) => ({ value: d.id, label: d.nameUz }))}
              />
            </Form.Item>

            <Form.Item label="Reestrdа mavjudmi?" name='existsInRegistry' valuePropName='checked'>
              <Switch
                checkedChildren='Ha'
                unCheckedChildren="Yo'q"
                onChange={setExistsInRegistry}
              />
            </Form.Item>

            <Button
              type='primary'
              htmlType='submit'
              loading={isPending}
              disabled={objects.length === 0}
              block
            >
              Ariza yuborish ({objects.length} ta ob'yekt)
            </Button>
          </Form>
        </Card>

        {/* O'ng: yuklash + xarita + jadval */}
        <div className='lg:col-span-3 flex flex-col gap-4'>

          <Card title='GeoJSON fayl yuklash' size='small'>
            {geojsonError && (
              <Alert message={geojsonError} type='error' showIcon className='mb-3' />
            )}
            <Dragger
              accept='.geojson,.json'
              beforeUpload={handleGeoJsonFile}
              maxCount={1}
              fileList={fileListRef.current}
              showUploadList={false}
            >
              <p className='ant-upload-drag-icon'><InboxOutlined /></p>
              <p className='ant-upload-text'>Faylni bu yerga tashlang yoki bosing</p>
              <p className='ant-upload-hint'>.geojson yoki .json — FeatureCollection yoki alohida geometriya</p>
            </Dragger>
          </Card>

          {mapGeojson && (
            <Card title="Xaritada ko'rish" size='small' className='overflow-hidden'>
              <GeoJsonMap geojson={mapGeojson} height='300px' />
            </Card>
          )}

          {objects.length > 0 && (
            <Card
              title={`Ob'yektlar (${objects.length} ta)`}
              size='small'
            >
              <Table
                dataSource={objects}
                columns={columns}
                pagination={false}
                size='small'
                rowKey='key'
              />
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
