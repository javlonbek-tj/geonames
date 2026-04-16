import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Card,
  Descriptions,
  Tag,
  Typography,
  Button,
  Timeline,
  Spin,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  ExpandOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import GeoJsonMap from '@/components/map/GeoJsonMap';
import { useGeographicObject } from '@/hooks/geographic-objects/useGeographicObject';
import {
  STATUS_LABELS,
  ACTION_LABELS,
  ACTION_COLORS,
  ROLE_LABELS,
} from '@/constants';
import type { ApplicationStatus } from '@/types';

const { Title, Text } = Typography;

function extractRawGeometry(
  geometry: Record<string, unknown>,
): Record<string, unknown> | null {
  if (!geometry) return null;
  if (geometry.type === 'Feature')
    return (geometry.geometry as Record<string, unknown>) ?? null;
  return geometry;
}

const COMMENT_LIMIT = 200;

export default function GeographicObjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: obj, isLoading } = useGeographicObject(Number(id));
  const [commentExpanded, setCommentExpanded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Spin size='large' />
      </div>
    );
  }

  if (!obj) {
    return <Empty description='Obyekt topilmadi' />;
  }

  const geometry = obj.geometry
    ? extractRawGeometry(obj.geometry as Record<string, unknown>)
    : null;
  const history = obj.application?.history ?? [];

  return (
    <div className='flex flex-col gap-4'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
        <div>
          <Title level={4} className='m-0'>
            {obj.nameUz ?? "Nomi yo'q"}
          </Title>
          {obj.nameKrill && <Text type='secondary'>{obj.nameKrill}</Text>}
        </div>
        {obj.objectType?.nameUz && (
          <Tag color='blue' className='ml-auto'>
            {obj.objectType.nameUz}
          </Tag>
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {/* Details */}
        <Card size='small' title="Ma'lumotlar">
          <Descriptions
            column={1}
            size='small'
            labelStyle={{ width: 160, color: '#888' }}
          >
            <Descriptions.Item label='Nomi (lotin)'>
              {obj.nameUz ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label='Nomi (kirill)'>
              {obj.nameKrill ?? '—'}
            </Descriptions.Item>
            {obj.registryNumber && (
              <Descriptions.Item label='Reyestr raqami'>
                <span className='font-mono'>{obj.registryNumber}</span>
              </Descriptions.Item>
            )}
            {obj.soato && (
              <Descriptions.Item label='SOATO'>{obj.soato}</Descriptions.Item>
            )}
            {obj.historicalName && (
              <Descriptions.Item label='Tarixiy nomi'>
                {obj.historicalName}
              </Descriptions.Item>
            )}
            <Descriptions.Item label='Guruh'>
              {obj.objectType?.category ? (
                <span className='flex items-center gap-1'>
                  {obj.objectType.category.code && (
                    <Tag color='blue' className='font-mono text-xs m-0'>
                      {obj.objectType.category.code}
                    </Tag>
                  )}
                  {obj.objectType.category.nameUz}
                </span>
              ) : (
                '—'
              )}
            </Descriptions.Item>
            <Descriptions.Item label='Tur'>
              {obj.objectType?.nameUz ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label='Viloyat'>
              {obj.region?.nameUz ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label='Tuman'>
              {obj.district?.nameUz ?? '—'}
            </Descriptions.Item>
            {obj.affiliation && (
              <Descriptions.Item label='Tegishlilik'>
                {obj.affiliation}
              </Descriptions.Item>
            )}
            {obj.basisDocument && (
              <Descriptions.Item label="Me'yoriy hujjat">
                {obj.basisDocument}
              </Descriptions.Item>
            )}
            {obj.comment && (
              <Descriptions.Item label='Izoh'>
                {obj.comment.length > COMMENT_LIMIT && !commentExpanded ? (
                  <>
                    {obj.comment.slice(0, COMMENT_LIMIT)}...{' '}
                    <Button
                      type='link'
                      size='small'
                      className='p-0 h-auto'
                      onClick={() => setCommentExpanded(true)}
                    >
                      Ko'proq ko'rsatish
                    </Button>
                  </>
                ) : (
                  <>
                    {obj.comment}
                    {obj.comment.length > COMMENT_LIMIT && (
                      <Button
                        type='link'
                        size='small'
                        className='p-0 h-auto ml-1'
                        onClick={() => setCommentExpanded(false)}
                      >
                        Kamroq ko'rsatish
                      </Button>
                    )}
                  </>
                )}
              </Descriptions.Item>
            )}
            {obj.creator && (
              <Descriptions.Item label='Kiritdi'>
                {obj.creator.fullName ?? obj.creator.username}
                <Text type='secondary' className='text-xs ml-1'>
                  ({ROLE_LABELS[obj.creator.role]})
                </Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label='Kiritilgan sana'>
              {new Date(obj.createdAt).toLocaleString('uz-UZ')}
            </Descriptions.Item>
            {obj.updatedAt !== obj.createdAt && (
              <Descriptions.Item label='Tahrirlangan'>
                {new Date(obj.updatedAt).toLocaleString('uz-UZ')}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Map */}
        <Card
          size='small'
          title={
            <span className='flex items-center gap-2'>
              <EnvironmentOutlined className='text-blue-500' />
              Xaritada joylashuvi
            </span>
          }
          extra={
            geometry && (
              <Button
                size='small'
                icon={<ExpandOutlined />}
                onClick={() => setFullscreen(true)}
              >
                To'liq ekran
              </Button>
            )
          }
        >
          {geometry ? (
            !fullscreen && (
              <GeoJsonMap
                geojson={geometry}
                height='360px'
                showLabels={false}
              />
            )
          ) : (
            <Empty
              description='Geometriya mavjud emas'
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className='my-4'
            />
          )}
        </Card>

        {/* Fullscreen overlay */}
        {fullscreen && geometry && (
          <div
            className='fixed inset-0 z-[9999] flex flex-col'
            style={{ background: '#000' }}
          >
            <div
              className='flex items-center justify-between px-4 py-3 shrink-0'
              style={{ background: '#0f1f3d' }}
            >
              <span className='text-white font-semibold text-sm'>
                {obj.nameUz ?? 'Xaritada joylashuvi'}
              </span>
              <Button
                size='small'
                icon={<CloseOutlined />}
                onClick={() => setFullscreen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  border: 'none',
                }}
              />
            </div>
            <div className='flex-1'>
              <GeoJsonMap geojson={geometry} height='100%' showLabels={false} />
            </div>
          </div>
        )}
      </div>

      {/* History */}
      {(obj.application || history.length > 0) && (
        <Card
          size='small'
          title={
            <span className='flex items-center gap-2'>
              <HistoryOutlined />
              Harakatlar tarixi
              {obj.application && (
                <Tag className='ml-2 font-mono text-xs'>
                  {obj.application.applicationNumber}
                </Tag>
              )}
            </span>
          }
        >
          {history.length === 0 ? (
            <Empty
              description='Tarix mavjud emas'
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }} className='pr-1'>
              <Timeline
                className='pt-2'
                items={history.map((h) => {
                  const statusLabel = h.fromStatus
                    ? STATUS_LABELS[h.fromStatus as ApplicationStatus]
                    : STATUS_LABELS[h.toStatus as ApplicationStatus];
                  return {
                    color:
                      h.actionType === 'approve'
                        ? 'green'
                        : h.actionType === 'return' || h.actionType === 'reject'
                          ? 'red'
                          : 'blue',
                    children: (
                      <div className='pb-1'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <Text strong className='text-sm'>
                            {statusLabel}
                          </Text>
                          <Tag
                            color={ACTION_COLORS[h.actionType] ?? 'default'}
                            className='text-xs'
                          >
                            {ACTION_LABELS[h.actionType] ?? h.actionType}
                          </Tag>
                          <Text type='secondary' className='text-xs'>
                            {new Date(h.createdAt).toLocaleString('uz-UZ')}
                          </Text>
                        </div>
                        <div className='text-xs text-gray-500 mt-0.5'>
                          {h.performer.fullName ?? h.performer.username}
                          {' · '}
                          {ROLE_LABELS[h.performer.role]}
                        </div>
                        {h.comment && (
                          <Text
                            type='secondary'
                            className='text-xs italic block mt-0.5'
                          >
                            "{h.comment}"
                          </Text>
                        )}
                      </div>
                    ),
                  };
                })}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
