import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

interface GeoJsonMapProps {
  geojson: object;
  height?: string;
  highlightedIndex?: number | null;
  onFeatureHover?: (index: number | null) => void;
  onFeatureClick?: (index: number) => void;
  showLabels?: boolean;
}

const DEFAULT_STYLE: L.PathOptions = { color: '#1677ff', weight: 2.5, opacity: 0.8, fillOpacity: 0.12 };
const HIGHLIGHT_STYLE: L.PathOptions = { color: '#fa8c16', weight: 4, opacity: 1, fillOpacity: 0.35 };

const TILES = {
  osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
} as const;

type TileKey = keyof typeof TILES;

function makeLabel(n: number, highlighted: boolean) {
  const bg = highlighted ? '#fa8c16' : '#1677ff';
  return L.divIcon({
    className: '',
    html: `<div style="background:${bg};color:#fff;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;box-shadow:0 1px 4px rgba(0,0,0,.35);transition:background .15s">${n}</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export default function GeoJsonMap({
  geojson,
  height = '400px',
  highlightedIndex,
  showLabels = true,
}: GeoJsonMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layersRef = useRef<L.Path[]>([]);
  const labelMarkersRef = useRef<L.Marker[]>([]);
  const highlightedIndexRef = useRef<number | null | undefined>(highlightedIndex);
  const [tileKey, setTileKey] = useState<TileKey>('osm');

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    layersRef.current = [];
    labelMarkersRef.current = [];

    const map = L.map(containerRef.current, { attributionControl: false });
    mapRef.current = map;

    tileLayerRef.current = L.tileLayer(TILES[tileKey], {}).addTo(map);

    const paths: L.Path[] = [];
    const markers: L.Marker[] = [];

    const geoLayer = L.geoJSON(geojson as GeoJSON.GeoJsonObject, {
      style: DEFAULT_STYLE,
      onEachFeature: (feature, layer) => {
        const idx = paths.length;
        paths.push(layer as L.Path);

        const center =
          (layer as any).getBounds?.()?.isValid?.()
            ? (layer as any).getBounds().getCenter()
            : (layer as any).getLatLng?.();

        if (center && showLabels) {
          const isHighlighted = highlightedIndexRef.current === idx;
          const marker = L.marker(center, { icon: makeLabel(idx + 1, isHighlighted), zIndexOffset: 500 });

          const p = feature.properties ?? {};
          const lines: string[] = [];
          lines.push(
            p.name
              ? `<strong>${p.name}</strong>`
              : `<span style="color:#aaa">#${idx + 1} — nomi kiritilmagan</span>`,
          );
          if (p.objectType) lines.push(`<span style="color:#888;font-size:12px">Tur: </span>${p.objectType}`);
          marker.bindPopup(lines.join('<br/>'), { maxWidth: 220 });
          marker.on('mouseover', () => marker.openPopup());
          marker.on('mouseout', () => marker.closePopup());

          marker.addTo(map);
          markers.push(marker);
        }
      },
    }).addTo(map);

    layersRef.current = paths;
    labelMarkersRef.current = markers;

    paths.forEach((layer, i) => {
      (layer as any).setStyle?.(i === highlightedIndexRef.current ? HIGHLIGHT_STYLE : DEFAULT_STYLE);
    });

    const bounds = geoLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [24, 24] });
    } else {
      map.setView([41.2995, 69.2401], 7);
    }

    return () => { map.remove(); mapRef.current = null; tileLayerRef.current = null; layersRef.current = []; labelMarkersRef.current = []; };
  }, [geojson]);

  // Tile layer switch
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    const options: L.TileLayerOptions = {};
    if (tileKey === 'satellite') options.maxNativeZoom = 17;
    tileLayerRef.current = L.tileLayer(TILES[tileKey], options).addTo(map);
    tileLayerRef.current.bringToBack();
  }, [tileKey]);

  useEffect(() => {
    highlightedIndexRef.current = highlightedIndex;
    layersRef.current.forEach((layer, i) => {
      (layer as any).setStyle?.(i === highlightedIndex ? HIGHLIGHT_STYLE : DEFAULT_STYLE);
    });
    labelMarkersRef.current.forEach((marker, i) => {
      marker.setIcon(makeLabel(i + 1, i === highlightedIndex));
    });
  }, [highlightedIndex]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden z-0" style={{ height }}>
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-3 right-3 z-[1000] flex rounded-lg overflow-hidden shadow border border-gray-200 text-xs font-medium">
        <button
          onClick={() => setTileKey('osm')}
          className={`px-3 py-1.5 cursor-pointer transition-colors ${
            tileKey === 'osm' ? 'bg-[#1677ff] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Xarita
        </button>
        <button
          onClick={() => setTileKey('satellite')}
          className={`px-3 py-1.5 cursor-pointer transition-colors border-l border-gray-200 ${
            tileKey === 'satellite' ? 'bg-[#1677ff] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Satellite
        </button>
      </div>
    </div>
  );
}
