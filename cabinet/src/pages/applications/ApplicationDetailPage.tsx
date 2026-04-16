import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Card,
  Descriptions,
  Tag,
  Typography,
  Button,
  Timeline,
  Modal,
  Input,
  Select,
  Spin,
  Empty,
  Popconfirm,
  Upload,
  Space,
  Table,
  Alert,
} from 'antd';
import GeoJsonMap from '@/components/map/GeoJsonMap';
import {
  ArrowLeftOutlined,
  UploadOutlined,
  DeleteOutlined,
  FileOutlined,
  SaveOutlined,
  DownloadOutlined,
  ExpandOutlined,
  CloseOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  useApplication,
  useAvailableActions,
  usePerformAction,
} from '@/hooks/applications/useApplication';
import {
  useCommissionApprovals,
  useApproveAsCommission,
  useRejectCommission,
  useRevokeCommissionApproval,
} from '@/hooks/commission/useCommission';
import { useDiscussionResults } from '@/hooks/public/usePublicDiscussion';
import {
  useApplicationFlags,
  useToggleGeoFlag,
} from '@/hooks/geo-flags/useGeoFlags';
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
} from '@/hooks/uploads/useDocuments';
import { useUpdateObjectNames } from '@/hooks/geographic-objects/useUpdateObjectNames';
import { useObjectTypes } from '@/hooks/object-types/useObjectTypes';
import { useAuthStore } from '@/store/authStore';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_HOLDER,
  ROLE_LABELS,
  ACTION_LABELS,
  ACTION_COLORS,
} from '@/constants';
import {
  COMMISSION_POSITION_LABELS,
  type CommissionPosition,
} from '@/types/user';
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
  const { mutate: performAction, isPending: isActing } =
    usePerformAction(appId);
  const { mutate: uploadDoc, isPending: isUploading } =
    useUploadDocument(appId);
  const { mutate: deleteDoc } = useDeleteDocument(appId);
  const { mutate: saveNames, isPending: isSavingNames } =
    useUpdateObjectNames(appId);
  const { data: allObjectTypes = [] } = useObjectTypes();
  const isCommissionStep =
    app?.currentStatus === 'step_2_1_district_commission';
  const isDiscussionStep = app?.currentStatus === 'step_2_public_discussion';
  const hasDiscussion =
    isDiscussionStep ||
    (app &&
      [
        'step_2_1_district_commission',
        'step_2_2_regional_commission',
        'step_3_regional_hokimlik',
        'step_4_kadastr_agency',
        'step_5_dkp_central',
        'step_6_kadastr_agency_final',
        'step_7_regional_hokimlik',
        'step_8_district_hokimlik',
        'completed',
      ].includes(app.currentStatus));
  const { data: commissionApprovals = [] } = useCommissionApprovals(
    isCommissionStep ? appId : 0,
  );
  const { data: discussionResults } = useDiscussionResults(
    appId,
    !!hasDiscussion,
  );
  const { mutate: approveAsCommission, isPending: isApproving } =
    useApproveAsCommission(appId);
  const { mutate: rejectCommission, isPending: isRejecting } =
    useRejectCommission(appId);
  const { mutate: revokeApproval, isPending: isRevoking } =
    useRevokeCommissionApproval(appId);

  const isKadastrFlagStep =
    app?.currentStatus === 'step_5_dkp_central' && user?.role === 'dkp_central';
  const FLAG_VISIBLE_STATUSES = [
    'step_6_kadastr_agency_final',
    'step_7_regional_hokimlik',
    'step_8_district_hokimlik',
    'completed',
  ];
  const canViewFlags =
    !isKadastrFlagStep &&
    !!app?.currentStatus &&
    FLAG_VISIBLE_STATUSES.includes(app.currentStatus);
  const { data: geoFlags = [] } = useApplicationFlags(
    isKadastrFlagStep || canViewFlags ? appId : 0,
  );
  const { mutate: toggleFlag, isPending: isTogglingFlag } =
    useToggleGeoFlag(appId);
  const [flagModal, setFlagModal] = useState<{ geoObjectId: number } | null>(
    null,
  );
  const [flagComment, setFlagComment] = useState('');
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState('');

  const [modal, setModal] = useState<{ action: string; label: string } | null>(
    null,
  );
  const [comment, setComment] = useState('');
  const [activeGeoIdx, setActiveGeoIdx] = useState<number | null>(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [nameEdits, setNameEdits] = useState<
    Record<
      number,
      { nameUz: string; nameKrill: string; objectTypeId: number | null }
    >
  >({});
  // Track which krill fields were manually edited (don't auto-overwrite)
  const [krillManual, setKrillManual] = useState<Record<number, boolean>>({});

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

  // useMemo hooklar har doim (early return dan OLDIN) chaqirilishi kerak
  const geoObjects = app?.geographicObjects ?? [];
  const mapGeojson = useMemo(
    () => buildFeatureCollection(geoObjects),
    [geoObjects],
  );
  const tableData = useMemo(
    () => geoObjects.map((o) => ({ ...o, _edit: nameEdits[o.id] ?? null })),
    [geoObjects, nameEdits],
  );

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Spin size='large' />
      </div>
    );
  }
  if (!app) return <Empty description='Ariza topilmadi' />;

  const firstGeo = geoObjects[0];
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
      return (
        edit.nameUz.trim().length > 0 &&
        edit.nameKrill.trim().length > 0 &&
        edit.objectTypeId != null
      );
    });
  const hasUnsavedEdits = Object.keys(nameEdits).length > 0;
  const needsDocumentUpload =
    user?.role === 'district_hokimlik' &&
    app?.currentStatus === 'step_8_district_hokimlik' &&
    !documents.some((d) => d.uploader?.id === user?.id);
  const actionsBlocked =
    (canEnterNames && (!allNamed || hasUnsavedEdits)) || needsDocumentUpload;

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
    const data = JSON.stringify(
      { type: 'FeatureCollection', features },
      null,
      2,
    );
    const url = URL.createObjectURL(
      new Blob([data], { type: 'application/geo+json' }),
    );
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
      const nameKrill = krillManual[geo.id]
        ? current.nameKrill
        : latinToKrill(value);
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
        return geo.nameUz ? (
          <Text>{geo.nameUz}</Text>
        ) : (
          <Text type='secondary'>Nomsiz</Text>
        );
      },
    },
    // Krill ustuni faqat district_hokimlik tahrirlash rejimida
    ...(canEnterNames
      ? [
          {
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
          },
        ]
      : []),
    {
      title: 'Obyekt turi',
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
              options={allObjectTypes.map((t) => ({
                value: t.id,
                label: t.nameUz,
              }))}
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
        return geo.objectType?.nameUz ? (
          <Text>{geo.objectType.nameUz}</Text>
        ) : (
          <Text type='secondary'>—</Text>
        );
      },
    },
    {
      title: 'Reyestrdа',
      dataIndex: 'existsInRegistry',
      key: 'existsInRegistry',
      width: 90,
      render: (v: boolean | null) =>
        v == null ? (
          '—'
        ) : (
          <Tag color={v ? 'green' : 'orange'}>{v ? 'Mavjud' : 'Yangi'}</Tag>
        ),
    },
    // Nomuvofiq ustuni: dkp_central uchun tahrirlash, kadastr_agency uchun faqat ko'rish
    ...(isKadastrFlagStep || canViewFlags
      ? [
          {
            title: 'Holat',
            key: 'nomuvofiq',
            width: 130,
            render: (geo: GeographicObject) => {
              const flag = geoFlags.find((f) => f.geoObjectId === geo.id);
              if (canViewFlags) {
                return flag ? (
                  <Tag color='red'>Nomuvofiq</Tag>
                ) : (
                  <Tag color='green'>Muvofiq</Tag>
                );
              }
              return (
                <Button
                  size='small'
                  danger={!!flag}
                  type={flag ? 'primary' : 'default'}
                  loading={isTogglingFlag}
                  onClick={() => {
                    if (flag) {
                      toggleFlag({ geoObjectId: geo.id });
                    } else {
                      setFlagComment('');
                      setFlagModal({ geoObjectId: geo.id });
                    }
                  }}
                >
                  {flag ? 'Nomuvofiq' : 'Muvofiq'}
                </Button>
              );
            },
          },
        ]
      : []),
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
        <Title level={4} className='m-0'>
          {app.applicationNumber}
        </Title>
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
              <Descriptions.Item label='Ariza raqami'>
                {app.applicationNumber}
              </Descriptions.Item>
              <Descriptions.Item label='Kategoriya'>
                {firstGeo?.objectType?.category?.nameUz ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label='Yaratuvchi'>
                {app.creator?.fullName ?? app.creator?.username ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label='Obyekt turi'>
                {firstGeo?.objectType?.nameUz ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label='Viloyat'>
                {firstGeo?.region?.nameUz ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label='Obyektlar soni'>
                {geoObjects.length} ta
              </Descriptions.Item>
              <Descriptions.Item label='Tuman'>
                {firstGeo?.district?.nameUz ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label='Yaratilgan'>
                {new Date(app.createdAt).toLocaleDateString('uz-UZ')}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Geografik obyektlar */}
          <Card
            title={`Geografik obyektlar (${geoObjects.length} ta)`}
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
                message='Xaritadagi joylashuvga qarab har bir obyektga nom bering'
              />
            )}
            <Table
              dataSource={tableData as GeographicObject[]}
              columns={objectColumns}
              pagination={false}
              size='small'
              rowKey='id'
              locale={{ emptyText: 'Obyektlar mavjud emas' }}
              scroll={
                existsInRegistry === false && !canEnterNames
                  ? undefined
                  : { x: 600 }
              }
              rowClassName={(_, i) =>
                i === activeGeoIdx ? 'geo-row-active' : ''
              }
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
                    <Button
                      size='small'
                      icon={<DownloadOutlined />}
                      onClick={handleDownloadGeoJson}
                    >
                      GeoJSON yuklab olish
                    </Button>
                  )}
                  <button
                    onClick={() => setMapFullscreen(true)}
                    className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border border-[#d1d9e8] bg-white hover:bg-gray-50 transition-colors'
                    style={{ color: '#1565c0' }}
                  >
                    <ExpandOutlined style={{ fontSize: 12 }} />
                    To'liq ekran
                  </button>
                </Space>
              }
            >
              {!mapFullscreen && (
                <GeoJsonMap
                  geojson={mapGeojson}
                  height='380px'
                  highlightedIndex={activeGeoIdx}
                />
              )}
            </Card>
          )}

          {/* Tarix */}
          <Card title='Harakat tarixi' size='small'>
            {(app.history && app.history.length > 0) || app.currentStatus ? (
              <Timeline
                items={[
                  ...(app.history ?? []).map((h) => {
                    const statusLabel = h.fromStatus
                      ? STATUS_LABELS[h.fromStatus as ApplicationStatus]
                      : STATUS_LABELS[h.toStatus as ApplicationStatus];
                    return {
                      key: h.id,
                      color:
                        h.actionType === 'approve'
                          ? 'green'
                          : h.actionType === 'return' ||
                              h.actionType === 'reject'
                            ? 'red'
                            : 'blue',
                      children: (
                        <div className='flex flex-col gap-0.5'>
                          <div className='flex items-center gap-2 flex-wrap'>
                            <Text strong>{statusLabel}</Text>
                            <Tag
                              color={ACTION_COLORS[h.actionType]}
                              className='m-0'
                            >
                              {ACTION_LABELS[h.actionType] ?? h.actionType}
                            </Tag>
                            <Text type='secondary' className='text-xs'>
                              {new Date(h.createdAt).toLocaleString('uz-UZ')}
                            </Text>
                          </div>
                          <Text type='secondary' className='text-xs'>
                            {h.performer?.fullName ?? h.performer?.username}
                            {h.performer?.role
                              ? ` · ${ROLE_LABELS[h.performer.role as keyof typeof ROLE_LABELS]}`
                              : ''}
                          </Text>
                          {h.comment && (
                            <Text className='text-sm'>{h.comment}</Text>
                          )}
                        </div>
                      ),
                    };
                  }),
                  // Joriy holat — completed/rejected bo'lmasa ko'rsatiladi
                  ...(app.currentStatus &&
                  app.currentStatus !== 'completed' &&
                  app.currentStatus !== 'rejected'
                    ? [
                        {
                          key: 'current',
                          dot: (
                            <ClockCircleOutlined
                              style={{ fontSize: 14, color: '#fa8c16' }}
                            />
                          ),
                          color: 'orange' as const,
                          children: (
                            <div className='flex flex-col gap-0.5'>
                              <div className='flex items-center gap-2 flex-wrap'>
                                <Text strong style={{ color: '#fa8c16' }}>
                                  {
                                    STATUS_LABELS[
                                      app.currentStatus as ApplicationStatus
                                    ]
                                  }
                                </Text>
                                <Tag color='orange' className='m-0'>
                                  Kutilmoqda
                                </Tag>
                              </div>
                              {STATUS_HOLDER[
                                app.currentStatus as ApplicationStatus
                              ] && (
                                <Text type='secondary' className='text-xs'>
                                  Hozir kimda:{' '}
                                  <span className='font-medium text-gray-700'>
                                    {
                                      STATUS_HOLDER[
                                        app.currentStatus as ApplicationStatus
                                      ]
                                    }
                                  </span>
                                </Text>
                              )}
                            </div>
                          ),
                        },
                      ]
                    : []),
                ]}
              />
            ) : (
              <Empty
                description='Tarix mavjud emas'
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className='flex flex-col gap-4'>
          {/* Ommaviy muhokama natijalari */}
          {discussionResults && (
            <Card title='Ommaviy muhokama natijalari' size='small'>
              <div className='flex flex-col gap-2'>
                <div className='flex items-center justify-between text-sm'>
                  <Text type='secondary'>Muhokama tugash sanasi</Text>
                  <Text>
                    {new Date(discussionResults.endsAt).toLocaleDateString(
                      'uz-UZ',
                    )}
                  </Text>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <Text type='secondary'>Jami ovozlar</Text>
                  <Text strong>{discussionResults.total}</Text>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <Tag color='green'>
                    Qo'llayman: {discussionResults.supportCount}
                  </Tag>
                  <Tag color='red'>
                    Qo'llamayman: {discussionResults.opposeCount}
                  </Tag>
                </div>
                {isDiscussionStep && (
                  <Alert
                    type='info'
                    showIcon
                    className='mt-1'
                    message={`Muhokama davom etmoqda. ${Math.max(0, Math.ceil((new Date(discussionResults.endsAt).getTime() - Date.now()) / 86400000))} kun qoldi.`}
                  />
                )}
              </div>
            </Card>
          )}

          {/* Tuman komissiyasi kelishuv paneli */}
          {isCommissionStep &&
            (() => {
              const myApproval =
                user?.role === 'district_commission' && user.position
                  ? commissionApprovals.find(
                      (a) => a.position === user.position,
                    )
                  : null;
              const approvedCount = commissionApprovals.filter(
                (a) => a.approved,
              ).length;
              const total = Object.keys(COMMISSION_POSITION_LABELS).length;
              const canRevoke = !!myApproval; // step allaqachon tekshirilgan (isCommissionStep)

              return (
                <Card title='Tuman komissiyasi kelishuvi' size='small'>
                  {user?.role === 'district_commission' && !user.position && (
                    <Alert
                      type='warning'
                      showIcon
                      className='mb-3'
                      message="Sizning lavozimingiz belgilanmagan. Administrator bilan bog'laning."
                    />
                  )}

                  {/* Faqat district_commission uchun amal tugmalari */}
                  {user?.role === 'district_commission' && user.position && (
                    <div className='mb-3 p-2 bg-gray-50 rounded flex items-center gap-2 flex-wrap'>
                      <Text className='text-sm flex-1'>
                        <strong>
                          {
                            COMMISSION_POSITION_LABELS[
                              user.position as CommissionPosition
                            ]
                          }
                        </strong>
                        {' — '}
                        {!myApproval && (
                          <span className='text-gray-400'>
                            Qaror kutilmoqda
                          </span>
                        )}
                        {myApproval?.approved && (
                          <span className='text-green-600'>Kelishildi ✓</span>
                        )}
                        {myApproval && !myApproval.approved && (
                          <span className='text-red-500'>Rad etildi</span>
                        )}
                      </Text>
                      {!myApproval && (
                        <Space size={6}>
                          <Button
                            type='primary'
                            size='small'
                            loading={isApproving}
                            onClick={() => approveAsCommission()}
                          >
                            Kelishdim
                          </Button>
                          <Button
                            danger
                            size='small'
                            onClick={() => {
                              setRejectComment('');
                              setRejectModal(true);
                            }}
                          >
                            Rad etish
                          </Button>
                        </Space>
                      )}
                      {canRevoke && (
                        <Button
                          size='small'
                          loading={isRevoking}
                          onClick={() => revokeApproval()}
                        >
                          Kelishuvni bekor qilish
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Ro'yxat */}
                  <div className='flex flex-col'>
                    {(
                      Object.keys(
                        COMMISSION_POSITION_LABELS,
                      ) as CommissionPosition[]
                    ).map((pos) => {
                      const approval = commissionApprovals.find(
                        (a) => a.position === pos,
                      );
                      return (
                        <div
                          key={pos}
                          className='flex items-start justify-between py-1.5 border-b border-gray-100 last:border-0 gap-2'
                        >
                          <Space size={6} align='start'>
                            <span
                              className={`inline-block w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                !approval
                                  ? 'bg-gray-300'
                                  : approval.approved
                                    ? 'bg-green-500'
                                    : 'bg-red-400'
                              }`}
                            />
                            <div>
                              <Text className='text-sm'>
                                {COMMISSION_POSITION_LABELS[pos]}
                              </Text>
                              {approval &&
                                !approval.approved &&
                                approval.comment && (
                                  <Text
                                    type='secondary'
                                    className='text-xs block italic'
                                  >
                                    "{approval.comment}"
                                  </Text>
                                )}
                            </div>
                          </Space>
                          {approval && (
                            <Text type='secondary' className='text-xs shrink-0'>
                              {approval.user.fullName ?? approval.user.username}
                              {' · '}
                              {new Date(approval.createdAt).toLocaleDateString(
                                'uz-UZ',
                              )}
                            </Text>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className='mt-2 pt-2 border-t border-gray-100 flex items-center justify-between'>
                    <Text type='secondary' className='text-xs'>
                      {approvedCount} / {total} ta kelishdi
                    </Text>
                    {approvedCount === total && (
                      <Tag color='green'>Barchasi kelishdi</Tag>
                    )}
                  </div>
                </Card>
              );
            })()}

          {/* Nomuvofiq belgilash modal */}
          <Modal
            open={!!flagModal}
            title='Nomuvofiq deb belgilash'
            okText='Belgilash'
            okButtonProps={{ danger: true, loading: isTogglingFlag }}
            cancelText='Bekor qilish'
            onCancel={() => setFlagModal(null)}
            onOk={() => {
              if (!flagModal) return;
              toggleFlag(
                {
                  geoObjectId: flagModal.geoObjectId,
                  comment: flagComment.trim() || undefined,
                },
                { onSuccess: () => setFlagModal(null) },
              );
            }}
            centered
          >
            <TextArea
              rows={3}
              placeholder='Izoh (ixtiyoriy)...'
              value={flagComment}
              onChange={(e) => setFlagComment(e.target.value)}
              className='mt-3'
            />
          </Modal>

          {/* Rad etish modal */}
          <Modal
            open={rejectModal}
            title='Rad etish sababi'
            okText='Rad etish'
            okButtonProps={{ danger: true, loading: isRejecting }}
            cancelText='Bekor qilish'
            onCancel={() => setRejectModal(false)}
            onOk={() => {
              if (!rejectComment.trim()) return;
              rejectCommission(rejectComment, {
                onSuccess: () => {
                  setRejectModal(false);
                  setRejectComment('');
                },
              });
            }}
            centered
          >
            <TextArea
              rows={3}
              placeholder='Rad etish sababini kiriting (majburiy)...'
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              status={!rejectComment.trim() ? 'error' : undefined}
              className='mt-3'
            />
            {!rejectComment.trim() && (
              <Text type='danger' className='text-xs mt-1 block'>
                Sabab kiritilishi shart
              </Text>
            )}
          </Modal>

          {actions.length > 0 && (
            <Card title='Harakatlar' size='small'>
              {actionsBlocked && (
                <Alert
                  type='warning'
                  showIcon
                  className='mb-3'
                  message={
                    needsDocumentUpload
                      ? 'Yakunlash uchun avval Kengash qarorining PDF nusxasini yuklang'
                      : hasUnsavedEdits && allNamed
                        ? "Nomlarni saqlang, so'ng yuborishingiz mumkin"
                        : 'Barcha obyektlarga lotin va kirill nomlar berilib, saqlangunga qadar yuborish mumkin emas'
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
                    onClick={() =>
                      setModal({ action: a.action, label: a.label })
                    }
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
                  accept='.pdf,.png,.jpg,.jpeg'
                  beforeUpload={(file) => {
                    uploadDoc({ file });
                    return false;
                  }}
                >
                  <Button
                    size='small'
                    icon={<UploadOutlined />}
                    loading={isUploading}
                  >
                    Yuklash
                  </Button>
                </Upload>
              )
            }
          >
            {documents.length > 0 ? (
              <div className='flex flex-col gap-2'>
                {documents.map((doc) => {
                  const ext =
                    doc.originalName.split('.').pop()?.toLowerCase() ?? '';
                  const isPdf = ext === 'pdf';
                  const isImage = ['png', 'jpg', 'jpeg'].includes(ext);
                  const icon = isPdf ? (
                    <FilePdfOutlined className='text-red-500 shrink-0' />
                  ) : isImage ? (
                    <FileImageOutlined className='text-green-600 shrink-0' />
                  ) : (
                    <FileOutlined className='text-blue-500 shrink-0' />
                  );
                  return (
                    <div
                      key={doc.id}
                      className='flex items-center justify-between gap-2'
                    >
                      <Space size={4} className='min-w-0'>
                        {icon}
                        <a
                          href={`${import.meta.env.VITE_API_URL?.replace('/api', '') ?? ''}${doc.filePath}`}
                          target='_blank'
                          rel='noreferrer'
                          className='text-sm truncate max-w-44'
                          title={doc.originalName}
                        >
                          {doc.originalName}
                        </a>
                      </Space>
                      {actions.length > 0 && doc.uploader?.id === user?.id && (
                        <Popconfirm
                          title="O'chirilsinmi?"
                          onConfirm={() => deleteDoc(doc.id)}
                          okText='Ha'
                          cancelText="Yo'q"
                        >
                          <Button
                            type='text'
                            danger
                            size='small'
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty
                description='Hujjat yuklanmagan'
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </div>
      </div>

      {/* Fullscreen map */}
      {mapFullscreen && mapGeojson && (
        <div
          className='fixed inset-0 z-[9999] flex flex-col'
          style={{ background: '#000' }}
        >
          <div
            className='flex items-center justify-between px-4 py-3 shrink-0'
            style={{ background: '#0f1f3d' }}
          >
            <span className='text-white font-semibold text-sm'>
              {app.applicationNumber} — Xaritada ko'rish
            </span>
            <button
              onClick={() => setMapFullscreen(false)}
              className='w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-0 transition-colors'
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
            >
              <CloseOutlined style={{ fontSize: 14 }} />
            </button>
          </div>
          <div className='flex-1'>
            <GeoJsonMap
              geojson={mapGeojson}
              height='100%'
              highlightedIndex={activeGeoIdx}
            />
          </div>
        </div>
      )}

      {/* Action modal */}
      <Modal
        open={!!modal}
        title={modal?.label}
        onCancel={() => {
          setModal(null);
          setComment('');
        }}
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
