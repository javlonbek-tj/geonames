import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import { ArrowLeftOutlined, ExpandOutlined, CloseOutlined } from '@ant-design/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { publicApi } from '@/api/public.api';

interface GeoObject {
  id: number;
  nameUz: string | null;
  nameKrill: string | null;
  registryNumber: string | null;
  soato?: string | null;
  objectType?: { nameUz: string; category?: { nameUz: string; code?: string | null } | null } | null;
  region?: { nameUz: string } | null;
  district?: { nameUz: string } | null;
  affiliation?: string | null;
  historicalName?: string | null;
  basisDocument?: string | null;
  comment?: string | null;
  geometry?: object | null;
  existsInRegistry?: boolean | null;
}

function MapInstance({ geometry, height }: { geometry: object; height: number | string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { zoomControl: true, attributionControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    try {
      const layer = L.geoJSON(geometry as Parameters<typeof L.geoJSON>[0], {
        pointToLayer: (_, latlng) =>
          L.circleMarker(latlng, { radius: 8, color: '#1565c0', fillColor: '#1565c0', fillOpacity: 0.8 }),
        style: { color: '#1565c0', weight: 2 },
      }).addTo(map);
      map.fitBounds(layer.getBounds(), { padding: [32, 32], maxZoom: 15 });
    } catch {}
    return () => { map.remove(); };
  }, [geometry]);
  return <div ref={ref} style={{ height, width: '100%', borderRadius: 8 }} />;
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className='flex gap-2 py-1.5 border-b border-gray-100 last:border-0'>
      <span className='text-xs text-gray-400 w-36 shrink-0 pt-0.5'>{label}</span>
      <span className='text-sm text-[#0f1f3d] font-medium'>{value}</span>
    </div>
  );
}

const COMMENT_LIMIT = 200;

function CommentRow({ value }: { value?: string | null }) {
  const [expanded, setExpanded] = useState(false);
  if (!value) return null;
  const isLong = value.length > COMMENT_LIMIT;
  const displayed = isLong && !expanded ? value.slice(0, COMMENT_LIMIT) + '...' : value;

  return (
    <div className='flex gap-2 py-1.5 border-b border-gray-100 last:border-0'>
      <span className='text-xs text-gray-400 w-36 shrink-0 pt-0.5'>Izoh</span>
      <span className='text-sm text-[#0f1f3d] font-medium'>
        {displayed}
        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className='ml-1.5 text-xs text-[#1565c0] hover:underline cursor-pointer bg-transparent border-0 p-0'
          >
            {expanded ? 'Kamroq ko\'rsatish' : 'Ko\'proq ko\'rsatish'}
          </button>
        )}
      </span>
    </div>
  );
}

export default function GeoObjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [fullscreen, setFullscreen] = useState(false);

  const { data: obj, isLoading } = useQuery({
    queryKey: ['public-geo-object', id],
    queryFn: () => publicApi.getRegistryObject(Number(id)).then((r) => r.data.data as GeoObject),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Spin size='large' />
      </div>
    );
  }

  if (!obj) {
    return (
      <div className='max-w-7xl mx-auto px-4 py-16 text-center text-gray-400'>
        Geografik obyekt topilmadi
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-4'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <button
          onClick={() => navigate(-1)}
          className='w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer transition-colors'
        >
          <ArrowLeftOutlined style={{ fontSize: 13, color: '#374151' }} />
        </button>
        <h1 className='text-xl font-extrabold text-[#0f1f3d] m-0'>
          {obj.nameUz ?? "Nomi yo'q"}
        </h1>
        {obj.objectType?.nameUz && (
          <span className='text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#e8efff] text-[#1565c0]'>
            {obj.objectType.nameUz}
          </span>
        )}
      </div>

      {/* 2-column grid: details left, map right */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {/* Left — details */}
        <div className='rounded-2xl border border-[#e2e8f4] bg-white p-4'>
          <p className='text-xs font-bold text-gray-400 uppercase tracking-widest mb-3'>
            Ma'lumotlar
          </p>
          <Row label="Nomi (lotin)"      value={obj.nameUz} />
          <Row label="Nomi (kirill)"     value={obj.nameKrill} />
          <Row label="Reyestr raqami"    value={obj.registryNumber} />
          <Row label="SOATO"             value={obj.soato} />
          <Row label="Guruh"             value={obj.objectType?.category?.nameUz} />
          <Row label="Ob'yekt turi"      value={obj.objectType?.nameUz} />
          <Row label="Viloyat"           value={obj.region?.nameUz} />
          <Row label="Tuman"             value={obj.district?.nameUz} />
          <Row label="Tegishlilik"       value={obj.affiliation} />
          <Row label="Tarixiy nomi"      value={obj.historicalName} />
          <Row label="Me'yoriy hujjat"   value={obj.basisDocument} />
          <CommentRow value={obj.comment} />
        </div>

        {/* Right — map */}
        <div className='rounded-2xl border border-[#e2e8f4] bg-white p-4'>
          <div className='flex items-center justify-between mb-3'>
            <p className='text-xs font-bold text-gray-400 uppercase tracking-widest m-0'>
              Xaritada joylashuvi
            </p>
            {obj.geometry && (
              <button
                onClick={() => setFullscreen(true)}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border border-[#d1d9e8] bg-white hover:bg-gray-50 transition-colors'
                style={{ color: '#1565c0' }}
              >
                <ExpandOutlined style={{ fontSize: 11 }} />
                To'liq ekran
              </button>
            )}
          </div>
          {obj.geometry
            ? !fullscreen && <MapInstance geometry={obj.geometry} height={340} />
            : <div className='flex items-center justify-center h-64 text-gray-300 text-sm'>Geometriya mavjud emas</div>
          }
        </div>
      </div>

      {/* Fullscreen map */}
      {fullscreen && obj.geometry && (
        <div className='fixed inset-0 z-[9999] flex flex-col' style={{ background: '#000' }}>
          <div className='flex items-center justify-between px-4 py-3 shrink-0' style={{ background: '#0f1f3d' }}>
            <span className='text-white font-semibold text-sm'>{obj.nameUz ?? 'Xaritada joylashuvi'}</span>
            <button
              onClick={() => setFullscreen(false)}
              className='w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-0 transition-colors'
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
            >
              <CloseOutlined style={{ fontSize: 14 }} />
            </button>
          </div>
          <div className='flex-1'>
            <MapInstance geometry={obj.geometry} height='100%' />
          </div>
        </div>
      )}
    </div>
  );
}
