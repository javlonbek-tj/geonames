import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Card, Descriptions, Tag, Typography, Button, Timeline,
  Modal, Input, Select, Spin, Empty, Popconfirm, Upload, Space, Table, Alert,
} from 'antd';
import GeoJsonMap from '@/components/map/GeoJsonMap';
import {
  ArrowLeftOutlined, UploadOutlined, DeleteOutlined, FileOutlined, SaveOutlined, DownloadOutlined, ExpandOutlined,
} from '@ant-design/icons';
import { useApplication, useAvailableActions, usePerformAction } from '@/hooks/applications/useApplication';
import { useDocuments, useUploadDocument, useDeleteDocument } from '@/hooks/uploads/useDocuments';
import { useUpdateObjectNames } from '@/hooks/geographic-objects/useUpdateObjectNames';
import { useObjectTypes } from '@/hooks/object-types/useObjectTypes';
import { useAuthStore } from '@/store/authStore';
import { STATUS_LABELS, STATUS_COLORS, ROLE_LABELS, ACTION_LABELS, ACTION_COLORS } from '@/constants';
import { latinToKrill } from '@/lib/transliterate';
import type { ApplicationStatus, GeographicObject, GeoJSON } from '@/types';

const { Title, Text } = Typography;
const { TextArea } = Input;

function extractRawGeometry(geometry: GeoJSON): GeoJSON | null {
  if (!geometry) return null;
  if (geometry.type === 'Feature') return geometry.geometry ?? null;
  if (geometry.type === 'FeatureCollection') return geometry;
  return geometry;
}

function buildFeatureCollection(objects: GeographicObject[]): GeoJSON | null {
  const features = objects
    .filter((o) => o.geometry)
    .map((o) => {
      const rawGeom = extractRawGeometry(o.geometry as GeoJSON);
      return {
        type: 'Feature',
        properties: {
          name: o.nameUz ?? null,
          objectType: o.objectType?.nameUz ?? null,
          category: o.objectType?.category?.nameUz ?? null,
        },
        geometry: rawGeom,
      };
    })
    .filter((f) => f.geometry !== null);
  if (features.length === 0) return null;
  return { type: 'FeatureCollection', features };
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const appId = Number(id);

  const user = useAuthStore((s) => s.user);
  const { data: app, isLoading } = useApplication(appId);
  const { data: actions = [] } = useAvailableActions(appId);
  const { data: documents = [] } = useDocuments(appId);
  const { mutate: performAction, isPending: isActing } = usePerformAction(appId);
  const { mutate: uploadDoc, isPending: isUploading } = useUploadDocument(appId);
  const { mutate: deleteDoc } = useDeleteDocument(appId);
  const { mutate: saveNames, isPending: isSavingNames } = useUpdateObjectNames(appId);
  const { data: allObjectTypes = [] } = useObjectTypes();

  const [modal, setModal] = useState<{ action: string; label: string } | null>(null);
  const [comment, setComment] = useState('');
  const [activeGeoIdx, setActiveGeoIdx] = useState<number | null>(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [nameEdits, setNameEdits] = useState<
    Record<number, { nameUz: string; nameKrill: string; objectTypeId: number | null }>
  >({});
  // Track which krill fields were manually edited (don't auto-overwrite)
  const [krillManual, setKrillManual] = useState<Record<number, boolean>>({});

  const handleAction = () => {
    if (!modal) return;
    performAction(
      { action: modal.action, comment: comment.trim() || undefined },
      { onSuccess: () => { setModal(null); setComment(''); } },
    );
  };

  if (isLoading) {
    return <div className='flex items-center justify-center h-64'><Spin size='large' /></div>;
  }
  if (!app) return <Empty description='Ariza topilmadi' />;

  const geoObjects = app.geographicObjects ?? [];
  const firstGeo = geoObjects[0];
  const mapGeojson = useMemo(() => buildFeatureCollection(geoObjects), [geoObjects]);

  // nameEdits o'zgarganda table rows ham yangilansin (Ant Design Table rows ni re-render qilishi uchun)
  const tableData = useMemo(
    () => geoObjects.map((o) => ({ ...o, _edit: nameEdits[o.id] ?? null })),
    [geoObjects, nameEdits],
  );
  const existsInRegistry = firstGeo?.existsInRegistry ?? false;

  const getEdit = (geo: GeographicObject) =>
    nameEdits[geo.id] ?? {
      nameUz: geo.nameUz ?? '',
      nameKrill: geo.nameKrill ?? '',
      objectTypeId: geo.objectTypeId ?? null,
    };

  const canEnterNames =
    user?.role === 'district_hokimlik' &&
    app.currentStatus === 'step_2_district_hokimlik' &&
    geoObjects.some((o) => o.existsInRegistry === false);

  const allNamed = geoObjects
    .filter((o) => o.existsInRegistry === false)
    .every((o) => {
      const edit = getEdit(o);
      return edit.nameUz.trim().length > 0 && edit.nameKrill.trim().length > 0 && edit.objectTypeId != null;
    });
  const hasUnsavedEdits = Object.keys(nameEdits).length > 0;
  const actionsBlocked = canEnterNames && (!allNamed || hasUnsavedEdits);

  const canDownloadGeoJson =
    user?.role === 'dkp_regional' || user?.role === 'dkp_central';

  const handleDownloadGeoJson = () => {
    const features = geoObjects
      .filter((o) => o.geometry)
      .map((o) => ({
        type: 'Feature',
        properties: {
          id: o.id,
          name_uz: o.nameUz ?? null,
          name_krill: o.nameKrill ?? null,
          object_type_id: o.objectTypeId ?? null,
          object_type: o.objectType?.nameUz ?? null,
          registry_number: o.registryNumber ?? null,
          exists_in_registry: o.existsInRegistry,
          region: o.region?.nameUz ?? null,
          district: o.district?.nameUz ?? null,
        },
        geometry: extractRawGeometry(o.geometry as GeoJSON),
      }));
    const data = JSON.stringify({ type: 'FeatureCollection', features }, null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: 'application/geo+json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${app.applicationNumber}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveNames = () => {
    const objects = geoObjects.map((geo) => {
      const edit = getEdit(geo);
      return {
        id: geo.id,
        nameUz: edit.nameUz.trim(),
        nameKrill: edit.nameKrill.trim() || undefined,
        objectTypeId: edit.objectTypeId!,
      };
    });
    saveNames(objects, {
      onSuccess: () => {
        setNameEdits({});
        setKrillManual({});
      },
    });
  };

  const updateNameUz = (geo: GeographicObject, value: string) => {
    setNameEdits((prev) => {
      const current = prev[geo.id] ?? {
        nameUz: geo.nameUz ?? '',
        nameKrill: geo.nameKrill ?? '',
        objectTypeId: geo.objectTypeId ?? null,
      };
      const nameKrill = krillManual[geo.id] ? current.nameKrill : latinToKrill(value);
      return { ...prev, [geo.id]: { ...current, nameUz: value, nameKrill } };
    });
  };

  const updateNameKrill = (geo: GeographicObject, value: string) => {
    setKrillManual((prev) => ({ ...prev, [geo.id]: true }));
    setNameEdits((prev) => {
      const current = prev[geo.id] ?? {
        nameUz: geo.nameUz ?? '',
        nameKrill: geo.nameKrill ?? '',
        objectTypeId: geo.objectTypeId ?? null,
      };
      return { ...prev, [geo.id]: { ...current, nameKrill: value } };
    });
  };

  // Columns depend on role and existsInRegistry
  const objectColumns = [
    {
      title: '#',
      width: 40,
      render: (_: unknown, __: GeographicObject, i: number) => (
        <Text type='secondary'>{i + 1}</Text>
      ),
    },
    {
      title: 'Nomi',
      key: 'nameUz',
      render: (geo: GeographicObject) => {
        if (canEnterNames) {
          return (
            <Input
              size='small'
              value={getEdit(geo).nameUz}
              placeholder='Nomni kiriting'
              status={!getEdit(geo).nameUz.trim() ? 'error' : undefined}
              onChange={(e) => updateNameUz(geo, e.target.value)}
            />
          );
        }
        return geo.nameUz ? <Text>{geo.nameUz}</Text> : <Text type='secondary'>—</Text>;
      },
    },
    // Krill ustuni faqat district_hokimlik tahrirlash rejimida
    ...(canEnterNames ? [{
      title: 'Nomi (kirill)',
      key: 'nameKrill',
      render: (geo: GeographicObject) => (
        <Input
          size='small'
          value={getEdit(geo).nameKrill}
          placeholder='Kirill (avto)'
          status={!getEdit(geo).nameKrill.trim() ? 'error' : undefined}
          onChange={(e) => updateNameKrill(geo, e.target.value)}
        />
      ),
    }] : []),
    {
      title: "Ob'yekt turi",
      key: 'objectTypeId',
      render: (geo: GeographicObject) => {
        if (canEnterNames) {
          return (
            <Select
              size='small'
              style={{ width: '100%', minWidth: 180 }}
              placeholder='Tur tanlang'
              value={getEdit(geo).objectTypeId ?? undefined}
              status={getEdit(geo).objectTypeId == null ? 'error' : undefined}
              options={allObjectTypes.map((t) => ({ value: t.id, label: t.nameUz }))}
              showSearch
              filterOption={(input, opt) =>
                (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              onChange={(val) =>
                setNameEdits((prev) => ({
                  ...prev,
                  [geo.id]: { ...getEdit(geo), objectTypeId: val },
                }))
              }
            />
          );
        }
        return geo.objectType?.nameUz
          ? <Text>{geo.objectType.nameUz}</Text>
          : <Text type='secondary'>—</Text>;
      },
    },
    {
      title: 'Reestrdа',
      dataIndex: 'existsInRegistry',
      key: 'existsInRegistry',
      width: 90,
      render: (v: boolean | null) =>
        v == null ? '—' : (
          <Tag color={v ? 'green' : 'orange'}>{v ? 'Mavjud' : 'Yangi'}</Tag>
        ),
    },
  ];

  return (
    <div className='flex flex-col gap-4'>

      {/* Header */}
      <div className='flex items-center gap-3'>
        <Button type='text' icon={<ArrowLeftOutlined />} onClick={() => void navigate('/applications')} />
        <Title level={4} className='m-0'>{app.applicationNumber}</Title>
        <Tag color={STATUS_COLORS[app.currentStatus as ApplicationStatus]}>
          {STATUS_LABELS[app.currentStatus as ApplicationStatus]}
        </Tag>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>

        {/* Left column */}
        <div className='lg:col-span-2 flex flex-col gap-4'>

          {/* Ariza ma'lumotlari — 2 ustun: chap va o'ng */}
          <Card title="Ariza ma'lumotlari" size='small'>
            <Descriptions column={2} size='small'>
              <Descriptions.Item label='Ariza raqami'>{app.applicationNumber}</Descriptions.Item>
              <Descriptions.Item label='Kategoriya'>
                {firstGeo?.objectType?.category?.nameUz ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label='Yaratuvchi'>
                {app.creator?.fullName ?? app.creator?.username ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Ob'yekt turi">
                {firstGeo?.objectType?.nameUz ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label='Viloyat'>{firstGeo?.region?.nameUz ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Ob'yektlar soni">{geoObjects.length} ta</Descriptions.Item>
              <Descriptions.Item label='Tuman'>{firstGeo?.district?.nameUz ?? '—'}</Descriptions.Item>
              <Descriptions.Item label='Yaratilgan'>
                {new Date(app.createdAt).toLocaleDateString('uz-UZ')}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Geografik ob'yektlar */}
          <Card
            title={`Geografik ob'yektlar (${geoObjects.length} ta)`}
            size='small'
            extra={
              canEnterNames && (
                <Button
                  size='small'
                  type='primary'
                  icon={<SaveOutlined />}
                  loading={isSavingNames}
                  onClick={handleSaveNames}
                >
                  Nomlarni saqlash
                </Button>
              )
            }
          >
            {canEnterNames && (
              <Alert
                type='info'
                showIcon
                className='mb-3'
                message="Xaritadagi joylashuvga qarab har bir ob'yektga nom bering"
              />
            )}
            <Table
              dataSource={tableData as GeographicObject[]}
              columns={objectColumns}
              pagination={false}
              size='small'
              rowKey='id'
              locale={{ emptyText: "Ob'yektlar mavjud emas" }}
              scroll={existsInRegistry === false && !canEnterNames ? undefined : { x: 600 }}
              rowClassName={(_, i) => i === activeGeoIdx ? 'geo-row-active' : ''}
              onRow={(_, i) => ({
                onMouseEnter: () => setActiveGeoIdx(i ?? null),
                onMouseLeave: () => setActiveGeoIdx(null),
                style: { cursor: 'default' },
              })}
            />
          </Card>

          {/* Xarita */}
          {mapGeojson && (
            <Card
              title="Xaritada ko'rish"
              size='small'
              className='overflow-hidden'
              extra={
                <Space size={8}>
                  {canDownloadGeoJson && (
                    <Button size='small' icon={<DownloadOutlined />} onClick={handleDownloadGeoJson}>
                      GeoJSON yuklab olish
                    </Button>
                  )}
                  <Button size='small' icon={<ExpandOutlined />} onClick={() => setMapFullscreen(true)} />
                </Space>
              }
            >
              <GeoJsonMap
                geojson={mapGeojson}
                height='380px'
                highlightedIndex={activeGeoIdx}
              />
            </Card>
          )}

          {/* Tarix */}
          <Card title='Harakat tarixi' size='small'>
            {app.history && app.history.length > 0 ? (
              <Timeline
                items={app.history.map((h) => {
                  const statusLabel = h.fromStatus
                    ? STATUS_LABELS[h.fromStatus as ApplicationStatus]
                    : STATUS_LABELS[h.toStatus as ApplicationStatus];
                  return {
                    key: h.id,
                    color: h.actionType === 'approve' ? 'green'
                      : h.actionType === 'return' || h.actionType === 'reject' ? 'red'
                      : 'blue',
                    children: (
                      <div className='flex flex-col gap-0.5'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <Text strong>{statusLabel}</Text>
                          <Tag color={ACTION_COLORS[h.actionType]} className='m-0'>
                            {ACTION_LABELS[h.actionType] ?? h.actionType}
                          </Tag>
                          <Text type='secondary' className='text-xs'>
                            {new Date(h.createdAt).toLocaleString('uz-UZ')}
                          </Text>
                        </div>
                        <Text type='secondary' className='text-xs'>
                          {h.performer?.fullName ?? h.performer?.username}
                          {h.performer?.role ? ` · ${ROLE_LABELS[h.performer.role as keyof typeof ROLE_LABELS]}` : ''}
                        </Text>
                        {h.comment && <Text className='text-sm'>{h.comment}</Text>}
                      </div>
                    ),
                  };
                })}
              />
            ) : (
              <Empty description='Tarix mavjud emas' image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>

        </div>

        {/* Right column */}
        <div className='flex flex-col gap-4'>

          {actions.length > 0 && (
            <Card title='Harakatlar' size='small'>
              {actionsBlocked && (
                <Alert
                  type='warning'
                  showIcon
                  className='mb-3'
                  message={
                    hasUnsavedEdits && allNamed
                      ? "Nomlarni saqlang, so'ng yuborishingiz mumkin"
                      : "Barcha ob'yektlarga lotin va kirill nomlar berilib, saqlangunga qadar yuborish mumkin emas"
                  }
                />
              )}
              <div className='flex flex-col gap-2'>
                {actions.map((a) => (
                  <Button
                    key={a.action}
                    type={a.action === 'return' ? 'default' : 'primary'}
                    danger={a.action === 'return'}
                    block
                    disabled={actionsBlocked}
                    onClick={() => setModal({ action: a.action, label: a.label })}
                  >
                    {a.label}
                  </Button>
                ))}
              </div>
            </Card>
          )}

          <Card
            title='Hujjatlar'
            size='small'
            extra={
              actions.length > 0 && (
                <Upload
                  showUploadList={false}
                  beforeUpload={(file) => { uploadDoc({ file }); return false; }}
                >
                  <Button size='small' icon={<UploadOutlined />} loading={isUploading}>
                    Yuklash
                  </Button>
                </Upload>
              )
            }
          >
            {documents.length > 0 ? (
              <div className='flex flex-col gap-2'>
                {documents.map((doc) => (
                  <div key={doc.id} className='flex items-center justify-between gap-2'>
                    <Space size={4} className='min-w-0'>
                      <FileOutlined className='text-blue-500 shrink-0' />
                      <Text ellipsis className='text-sm max-w-40' title={doc.originalName}>
                        {doc.originalName}
                      </Text>
                    </Space>
                    <Popconfirm
                      title="O'chirilsinmi?"
                      onConfirm={() => deleteDoc(doc.id)}
                      okText='Ha'
                      cancelText="Yo'q"
                    >
                      <Button type='text' danger size='small' icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description='Hujjat yuklanmagan' image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>

        </div>
      </div>

      {/* Fullscreen map modal */}
      {mapGeojson && (
        <Modal
          open={mapFullscreen}
          onCancel={() => setMapFullscreen(false)}
          footer={null}
          width='95vw'
          style={{ top: 16 }}
          styles={{ body: { padding: 0, height: 'calc(95vh - 56px)' } }}
          title="Xaritada ko'rish"
        >
          <GeoJsonMap geojson={mapGeojson} height='100%' highlightedIndex={activeGeoIdx} />
        </Modal>
      )}

      {/* Action modal */}
      <Modal
        open={!!modal}
        title={modal?.label}
        onCancel={() => { setModal(null); setComment(''); }}
        onOk={handleAction}
        confirmLoading={isActing}
        okText='Tasdiqlash'
        cancelText='Bekor qilish'
      >
        <div className='flex flex-col gap-2 pt-2'>
          <Text type='secondary'>Izoh (ixtiyoriy)</Text>
          <TextArea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder='Izoh kiriting...'
          />
        </div>
      </Modal>

    </div>
  );
}
