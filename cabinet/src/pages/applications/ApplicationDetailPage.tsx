import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Card, Descriptions, Tag, Typography, Button, Timeline,
  Modal, Input, Spin, Empty, Popconfirm, Upload, Space, Table,
} from 'antd';
import GeoJsonMap from '@/components/map/GeoJsonMap';
import {
  ArrowLeftOutlined, UploadOutlined, DeleteOutlined, FileOutlined,
} from '@ant-design/icons';
import { useApplication, useAvailableActions, usePerformAction } from '@/hooks/applications/useApplication';
import { useDocuments, useUploadDocument, useDeleteDocument } from '@/hooks/uploads/useDocuments';
import { STATUS_LABELS, STATUS_COLORS, ROLE_LABELS } from '@/constants';
import type { ApplicationStatus, GeographicObject, GeoJSON } from '@/types';

const { Title, Text } = Typography;
const { TextArea } = Input;

function extractRawGeometry(geometry: GeoJSON): GeoJSON | null {
  if (!geometry) return null;
  if (geometry.type === 'Feature') return geometry.geometry ?? null;
  if (geometry.type === 'FeatureCollection') return geometry; // pass through
  return geometry; // raw geometry (Point, Polygon, etc.)
}

function buildFeatureCollection(objects: GeographicObject[]): GeoJSON | null {
  const features = objects
    .filter((o) => o.geometry)
    .map((o) => {
      const rawGeom = extractRawGeometry(o.geometry as GeoJSON);
      return {
        type: 'Feature',
        properties: { name: o.nameUz },
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

  const { data: app, isLoading } = useApplication(appId);
  const { data: actions = [] } = useAvailableActions(appId);
  const { data: documents = [] } = useDocuments(appId);
  const { mutate: performAction, isPending: isActing } = usePerformAction(appId);
  const { mutate: uploadDoc, isPending: isUploading } = useUploadDocument(appId);
  const { mutate: deleteDoc } = useDeleteDocument(appId);

  const [modal, setModal] = useState<{ action: string; label: string } | null>(null);
  const [comment, setComment] = useState('');

  const handleAction = () => {
    if (!modal) return;
    performAction(
      { action: modal.action, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          setModal(null);
          setComment('');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Spin size='large' />
      </div>
    );
  }

  if (!app) return <Empty description='Ariza topilmadi' />;

  const geoObjects = app.geographicObjects ?? [];
  const firstGeo = geoObjects[0];
  const mapGeojson = buildFeatureCollection(geoObjects);

  const objectColumns = [
    {
      title: '#',
      width: 40,
      render: (_: unknown, __: GeographicObject, i: number) => (
        <Text type='secondary'>{i + 1}</Text>
      ),
    },
    { title: "Nomi (lotin)", dataIndex: 'nameUz', key: 'nameUz' },
    { title: 'Nomi (kirill)', dataIndex: 'nameKrill', key: 'nameKrill',
      render: (v: string | null) => v ?? '—' },
    { title: 'Reyestr raqami', dataIndex: 'registryNumber', key: 'registryNumber',
      render: (v: string | null) => v ?? '—' },
    {
      title: 'Reestrdа',
      dataIndex: 'existsInRegistry',
      key: 'existsInRegistry',
      render: (v: boolean | null) =>
        v == null ? '—' : <Tag color={v ? 'green' : 'orange'}>{v ? 'Mavjud' : "Mavjud emas"}</Tag>,
    },
  ];

  return (
    <div className='flex flex-col gap-4'>

      {/* Header */}
      <div className='flex items-center gap-3'>
        <Button
          type='text'
          icon={<ArrowLeftOutlined />}
          onClick={() => void navigate('/applications')}
        />
        <Title level={4} className='m-0'>{app.applicationNumber}</Title>
        <Tag color={STATUS_COLORS[app.currentStatus as ApplicationStatus]}>
          {STATUS_LABELS[app.currentStatus as ApplicationStatus]}
        </Tag>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>

        {/* Left column */}
        <div className='lg:col-span-2 flex flex-col gap-4'>

          {/* Asosiy ma'lumotlar */}
          <Card title="Ariza ma'lumotlari" size='small'>
            <Descriptions column={2} size='small'>
              <Descriptions.Item label='Ariza raqami'>{app.applicationNumber}</Descriptions.Item>
              <Descriptions.Item label='Yaratuvchi'>
                {app.creator?.fullName ?? app.creator?.username}
              </Descriptions.Item>
              <Descriptions.Item label="Ob'yekt turi">
                {firstGeo?.objectType?.nameUz ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label='Kategoriya'>
                {firstGeo?.objectType?.category?.nameUz ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label='Viloyat'>{firstGeo?.region?.nameUz ?? '—'}</Descriptions.Item>
              <Descriptions.Item label='Tuman'>{firstGeo?.district?.nameUz ?? '—'}</Descriptions.Item>
              <Descriptions.Item label='Yaratilgan'>
                {new Date(app.createdAt).toLocaleDateString('uz-UZ')}
              </Descriptions.Item>
              <Descriptions.Item label="Ob'yektlar soni">
                {geoObjects.length} ta
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Ob'yektlar jadvali */}
          <Card title={`Geografik ob'yektlar (${geoObjects.length} ta)`} size='small'>
            <Table
              dataSource={geoObjects}
              columns={objectColumns}
              pagination={false}
              size='small'
              rowKey='id'
              locale={{ emptyText: "Ob'yektlar mavjud emas" }}
            />
          </Card>

          {/* Geometriya xaritasi */}
          {mapGeojson && (
            <Card title="Xaritada ko'rish" size='small' className='overflow-hidden'>
              <GeoJsonMap geojson={mapGeojson} height='380px' />
            </Card>
          )}

          {/* Tarix */}
          <Card title='Harakat tarixi' size='small'>
            {app.history && app.history.length > 0 ? (
              <Timeline
                items={app.history.map((h) => ({
                  key: h.id,
                  color: h.toStatus === 'completed' ? 'green' : h.toStatus === 'rejected' ? 'red' : 'blue',
                  children: (
                    <div className='flex flex-col gap-0.5'>
                      <div className='flex items-center gap-2'>
                        <Text strong>{STATUS_LABELS[h.toStatus as ApplicationStatus]}</Text>
                        <Text type='secondary' className='text-xs'>
                          {new Date(h.createdAt).toLocaleString('uz-UZ')}
                        </Text>
                      </div>
                      <Text type='secondary' className='text-xs'>
                        {h.performer?.fullName ?? h.performer?.username}
                        {h.performer?.role ? ` · ${ROLE_LABELS[h.performer.role]}` : ''}
                      </Text>
                      {h.comment && <Text className='text-sm'>{h.comment}</Text>}
                    </div>
                  ),
                }))}
              />
            ) : (
              <Empty description='Tarix mavjud emas' image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>

        </div>

        {/* Right column */}
        <div className='flex flex-col gap-4'>

          {/* Harakatlar */}
          {actions.length > 0 && (
            <Card title='Harakatlar' size='small'>
              <div className='flex flex-col gap-2'>
                {actions.map((a) => (
                  <Button
                    key={a.action}
                    type={a.action === 'return' ? 'default' : 'primary'}
                    danger={a.action === 'return'}
                    block
                    onClick={() => setModal({ action: a.action, label: a.label })}
                  >
                    {a.label}
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {/* Hujjatlar */}
          <Card
            title='Hujjatlar'
            size='small'
            extra={
              <Upload
                showUploadList={false}
                beforeUpload={(file) => {
                  uploadDoc({ file });
                  return false;
                }}
              >
                <Button size='small' icon={<UploadOutlined />} loading={isUploading}>
                  Yuklash
                </Button>
              </Upload>
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
