import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Card,
  Form,
  Switch,
  Button,
  Typography,
  Upload,
  Alert,
  Tag,
} from 'antd';
import { InboxOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useCreateGeographicObject } from '@/hooks/geographic-objects/useCreateGeographicObject';
import { useObjectTypes } from '@/hooks/object-types/useObjectTypes';
import { useAuthStore } from '@/store/authStore';
import GeoJsonMap from '@/components/map/GeoJsonMap';
import type { GeoJSON } from '@/types';

const { Title, Text } = Typography;
const { Dragger } = Upload;

interface ObjectRow {
  key: string;
  nameUz: string | null;
  nameKrill: string | null;
  registryNumber: string | null;
  objectTypeId: number | null;
  geometry: GeoJSON;
  geometryType: string;
  errors: string[];
}

function validateAndExtract(
  geojson: GeoJSON,
  existsInRegistry: boolean,
  validTypeIds: Set<number>,
): ObjectRow[] {
  const features: GeoJSON[] =
    geojson.type === 'FeatureCollection' && Array.isArray(geojson.features)
      ? geojson.features
      : [geojson];

  return features.map((f: GeoJSON, i: number) => {
    const props: Record<string, unknown> =
      f.type === 'Feature' ? (f.properties ?? {}) : {};
    const rawGeom: GeoJSON = f.type === 'Feature' ? f.geometry : f;

    const nameUz = (props.name_uz ?? props.nameUz ?? props.name ?? null) as
      | string
      | null;
    const nameKrill = (props.name_krill ?? props.nameKrill ?? null) as
      | string
      | null;
    const registryNumber = (props.registry_number ??
      props.registryNumber ??
      props.reg_number ??
      null) as string | null;
    const rawTypeId =
      props.object_type_id ??
      props.objectTypeId ??
      props.type_id ??
      props.objectType ??
      null;
    const objectTypeId =
      rawTypeId != null && !isNaN(Number(rawTypeId)) ? Number(rawTypeId) : null;

    const errors: string[] = [];
    if (existsInRegistry) {
      if (!registryNumber)
        errors.push("registry_number properties'da topilmadi");
      if (!nameUz) errors.push("name_uz properties'da topilmadi");
      if (!objectTypeId) {
        errors.push("object_type_id properties'da topilmadi");
      } else if (validTypeIds.size > 0 && !validTypeIds.has(objectTypeId)) {
        errors.push(`object_type_id=${objectTypeId} bazada topilmadi`);
      }
    } else if (
      objectTypeId &&
      validTypeIds.size > 0 &&
      !validTypeIds.has(objectTypeId)
    ) {
      // Reyestrda yo'q obyektlarda ham noto'g'ri ID bo'lsa xabar ber
      errors.push(`object_type_id=${objectTypeId} bazada topilmadi`);
    }

    return {
      key: String(i),
      nameUz: nameUz?.toString() ?? null,
      nameKrill: nameKrill?.toString() ?? null,
      registryNumber: registryNumber?.toString() ?? null,
      objectTypeId,
      geometry: rawGeom,
      geometryType: rawGeom?.type ?? "Noma'lum",
      errors,
    };
  });
}

function buildFeatureCollection(rows: ObjectRow[]): GeoJSON {
  return {
    type: 'FeatureCollection',
    features: rows.map((r) => ({
      type: 'Feature',
      properties: { name: r.nameUz ?? undefined },
      geometry: r.geometry,
    })),
  };
}

export default function CreateGeographicObjectPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { mutate: create, isPending } = useCreateGeographicObject();
  const { data: allObjectTypes = [] } = useObjectTypes();
  const validTypeIds = useMemo(
    () => new Set(allObjectTypes.map((t) => t.id)),
    [allObjectTypes],
  );

  const [form] = Form.useForm();
  const [existsInRegistry, setExistsInRegistry] = useState(false);
  const [objects, setObjects] = useState<ObjectRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const lastParsedRef = useRef<{
    geojson: GeoJSON;
    existsInRegistry: boolean;
  } | null>(null);

  // objectTypes yuklanib bo'lganda, yuklangan fayl bor bo'lsa qayta validate qil
  useEffect(() => {
    if (validTypeIds.size > 0 && lastParsedRef.current) {
      const { geojson, existsInRegistry: reg } = lastParsedRef.current;
      setObjects(validateAndExtract(geojson, reg, validTypeIds));
    }
  }, [validTypeIds]);

  const handleGeoJsonFile = (file: File) => {
    setParseError(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as GeoJSON;
        if (!parsed.type) throw new Error("GeoJSON formati noto'g'ri");
        lastParsedRef.current = { geojson: parsed, existsInRegistry };
        setObjects(validateAndExtract(parsed, existsInRegistry, validTypeIds));
      } catch {
        setParseError("GeoJSON fayl noto'g'ri formatda");
        setObjects([]);
        lastParsedRef.current = null;
      }
    };
    reader.readAsText(file);
    return false;
  };

  const handleClearFile = () => {
    setObjects([]);
    setParseError(null);
    setFileName(null);
    lastParsedRef.current = null;
  };

  const handleExistsChange = (val: boolean) => {
    setExistsInRegistry(val);
    if (lastParsedRef.current) {
      lastParsedRef.current.existsInRegistry = val;
      setObjects(
        validateAndExtract(lastParsedRef.current.geojson, val, validTypeIds),
      );
    } else {
      setObjects([]);
      setParseError(null);
      setFileName(null);
    }
  };

  const validCount = objects.filter((o) => o.errors.length === 0).length;
  const errorCount = objects.filter((o) => o.errors.length > 0).length;
  const allErrors = objects.some((o) => o.errors.length > 0);
  const fileLoaded = !!fileName;
  const mapGeojson = useMemo(
    () => (objects.length > 0 ? buildFeatureCollection(objects) : null),
    [objects],
  );

  const onFinish = (values: { existsInRegistry: boolean }) => {
    if (objects.length === 0) {
      setParseError('GeoJSON fayl yuklanishi shart');
      return;
    }
    if (allErrors) return;

    create({
      regionId: user.regionId!,
      districtId: user.districtId!,
      existsInRegistry: values.existsInRegistry,
      objects: objects.map((o) => ({
        nameUz: o.nameUz ?? undefined,
        nameKrill: o.nameKrill ?? undefined,
        registryNumber: o.registryNumber ?? undefined,
        objectTypeId: o.objectTypeId ?? undefined,
        geometry: o.geometry,
      })),
    });
  };

  if (!user?.regionId || !user?.districtId) {
    return (
      <div className='flex flex-col gap-4 max-w-5xl'>
        <div className='flex items-center justify-between'>
          <Title level={4} className='m-0'>
            Yangi ariza — geometriya yuklash
          </Title>
          <Button onClick={() => void navigate('/applications')}>Orqaga</Button>
        </div>
        <Alert
          type='error'
          showIcon
          message='Viloyat va tuman biriktirilmagan'
          description="Sizning profilingizga viloyat va tuman biriktirilmagan. Ariza yaratish uchun administrator bilan bog'laning."
        />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4 max-w-5xl'>
      <div className='flex items-center justify-between'>
        <Title level={4} className='m-0'>
          Yangi ariza — geometriya yuklash
        </Title>
        <Button onClick={() => void navigate('/applications')}>Orqaga</Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-5 gap-4 items-start'>
        {/* Chap: umumiy */}
        <Card title="Umumiy ma'lumotlar" size='small' className='lg:col-span-2'>
          <Form
            form={form}
            layout='vertical'
            initialValues={{ existsInRegistry: false }}
            onFinish={onFinish}
          >
            <Form.Item
              label='Reyestrdа mavjudmi?'
              name='existsInRegistry'
              valuePropName='checked'
            >
              <Switch
                checkedChildren='Ha'
                unCheckedChildren="Yo'q"
                onChange={handleExistsChange}
              />
            </Form.Item>
          </Form>
        </Card>

        {/* O'ng: fayl + xarita */}
        <div className='lg:col-span-3 flex flex-col gap-4'>
          {/* Fayl yuklash — faqat fayl yuklanmagan bo'lsa */}
          {!fileLoaded && (
            <Card title='GeoJSON fayl yuklash' size='small'>
              {parseError && (
                <Alert
                  message={parseError}
                  type='error'
                  showIcon
                  className='mb-3'
                />
              )}
              <Dragger
                accept='.geojson,.json'
                beforeUpload={handleGeoJsonFile}
                maxCount={1}
                showUploadList={false}
              >
                <p className='ant-upload-drag-icon'>
                  <InboxOutlined />
                </p>
                <p className='ant-upload-text'>
                  Faylni bu yerga tashlang yoki bosing
                </p>
              </Dragger>
            </Card>
          )}

          {/* Xarita — fayl yuklangandan keyin */}
          {mapGeojson && (
            <Card
              title="Xaritada ko'rish"
              size='small'
              className='overflow-hidden'
              extra={
                <span className='flex items-center gap-2'>
                  {validCount > 0 && (
                    <Tag color='green'>{validCount} ta tayyor</Tag>
                  )}
                  {errorCount > 0 && (
                    <Tag color='red'>{errorCount} ta xatolik</Tag>
                  )}
                </span>
              }
            >
              {/* Yuklangan fayl ko'rsatish + o'chirish */}
              <div className='flex items-center gap-2 mb-3 px-1 py-2 bg-gray-50 rounded border border-gray-200'>
                <FileOutlined className='text-blue-500' />
                <Text className='flex-1 text-sm truncate'>{fileName}</Text>
                <Button
                  size='small'
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleClearFile}
                >
                  O'chirish
                </Button>
              </div>

              {allErrors && (
                <Alert
                  type='error'
                  showIcon
                  className='mb-3'
                  message={`${errorCount} ta obyektda majburiy maydonlar to'ldirilmagan`}
                />
              )}

              <GeoJsonMap geojson={mapGeojson} height='300px' />

              <div className='mt-3'>
                <Button
                  type='primary'
                  loading={isPending}
                  disabled={allErrors}
                  block
                  onClick={() => form.submit()}
                >
                  {allErrors
                    ? `Xatolik bor (${errorCount} ta)`
                    : `Ariza yuborish (${objects.length} ta obyekt)`}
                </Button>
              </div>
            </Card>
          )}

          {/* Fayl yuklangan lekin map yo'q (parse xatosi) */}
          {fileLoaded && !mapGeojson && (
            <Card size='small'>
              {parseError && (
                <Alert
                  message={parseError}
                  type='error'
                  showIcon
                  className='mb-3'
                />
              )}
              <div className='flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200'>
                <FileOutlined className='text-red-500' />
                <Text className='flex-1 text-sm truncate'>{fileName}</Text>
                <Button
                  size='small'
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleClearFile}
                >
                  O'chirish
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
