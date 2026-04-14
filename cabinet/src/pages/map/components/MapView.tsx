import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapFeatureCollection, MapFeature } from '@/api/map.api';

const TILES = {
  osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
} as const;

type TileKey = keyof typeof TILES;

const TILE_ATTRIBUTIONS: Record<TileKey, string> = {
  osm: '© OpenStreetMap',
  satellite: '© Esri, Maxar, Earthstar Geographics',
};

const BORDER = '#0000FF';

const STYLES = {
  region: { color: BORDER, weight: 2.5, opacity: 1, fillOpacity: 0 },
  regionHover: { color: BORDER, weight: 4, opacity: 1, fillOpacity: 0 },
  regionFaded: { color: BORDER, weight: 1, opacity: 0.3, fillOpacity: 0 },
  district: { color: BORDER, weight: 2, opacity: 1, fillOpacity: 0 },
  districtHover: { color: BORDER, weight: 3.5, opacity: 1, fillOpacity: 0 },
  mfy: { color: '#f97316', weight: 2.5, opacity: 1, fillOpacity: 0 },
  mfyHover: { color: '#f97316', weight: 4, opacity: 1, fillOpacity: 0 },
  street: { color: '#7c3aed', weight: 1.5, opacity: 0.8 },
} as const;

interface Props {
  regionFeatures: MapFeatureCollection | undefined;
  districtFeatures: MapFeatureCollection | undefined;
  districtObjects: MapFeatureCollection | undefined;
  onRegionClick: (feature: MapFeature) => void;
  onDistrictClick: (feature: MapFeature) => void;
  selectedRegionId: number | null;
  selectedDistrictId: number | null;
}

export default function MapView({
  regionFeatures,
  districtFeatures,
  districtObjects,
  onRegionClick,
  onDistrictClick,
  selectedRegionId,
  selectedDistrictId,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layersRef = useRef<{
    regions: L.GeoJSON | null;
    districts: L.GeoJSON | null;
    objects: L.LayerGroup | null;
  }>({ regions: null, districts: null, objects: null });
  const [tileKey, setTileKey] = useState<TileKey>('osm');
  const [hoveredStreet, setHoveredStreet] = useState<{ name: string; objectType: string | null } | null>(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [41.3, 63.5],
      zoom: 6,
      zoomControl: true,
      attributionControl: false,
    });

    tileLayerRef.current = L.tileLayer(TILES.osm, { attribution: TILE_ATTRIBUTIONS.osm }).addTo(map);

    const updateZoomClass = () => {
      containerRef.current?.classList.toggle('zoom-street-labels', map.getZoom() >= 16);
    };
    map.on('zoomend', updateZoomClass);
    updateZoomClass();

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Region layer — always present; faded when drilling into a region
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !regionFeatures) return;

    if (layersRef.current.regions) {
      map.removeLayer(layersRef.current.regions);
      layersRef.current.regions = null;
    }

    const drilled = selectedRegionId !== null;

    const layer = L.geoJSON(regionFeatures as GeoJSON.GeoJsonObject, {
      style: drilled ? STYLES.regionFaded : STYLES.region,
      onEachFeature: (feature, lyr) => {
        const f = feature as MapFeature;
        if (!drilled) {
          lyr.on('mouseover', () => (lyr as L.Path).setStyle(STYLES.regionHover));
          lyr.on('mouseout', () => (lyr as L.Path).setStyle(STYLES.region));
          lyr.on('click', () => onRegionClick(f));
          lyr.bindTooltip(f.properties.nameUz ?? '', { sticky: true, className: 'map-tooltip' });
        }
      },
    }).addTo(map);

    layersRef.current.regions = layer;

    if (!drilled) {
      const bounds = layer.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [regionFeatures, selectedRegionId, onRegionClick]);

  // District layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layersRef.current.districts) {
      map.removeLayer(layersRef.current.districts);
      layersRef.current.districts = null;
    }

    if (!districtFeatures || selectedRegionId === null) return;

    const layer = L.geoJSON(districtFeatures as GeoJSON.GeoJsonObject, {
      style: (feature) => {
        const f = feature as MapFeature;
        const isSelected = f.properties.districtDbId === selectedDistrictId;
        return isSelected
          ? { ...STYLES.district, weight: 3 }
          : STYLES.district;
      },
      onEachFeature: (feature, lyr) => {
        const f = feature as MapFeature;
        lyr.on('mouseover', () => {
          if (f.properties.districtDbId !== selectedDistrictId)
            (lyr as L.Path).setStyle(STYLES.districtHover);
        });
        lyr.on('mouseout', () => {
          if (f.properties.districtDbId !== selectedDistrictId)
            (lyr as L.Path).setStyle(STYLES.district);
        });
        lyr.on('click', () => onDistrictClick(f));
        lyr.bindTooltip(f.properties.nameUz ?? '', {
          permanent: true,
          direction: 'center',
          className: 'map-label',
        });
      },
    }).addTo(map);

    layersRef.current.districts = layer;

    const bounds = layer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
  }, [districtFeatures, selectedRegionId, selectedDistrictId, onDistrictClick]);

  // District objects layer (MFY + streets)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layersRef.current.objects) {
      map.removeLayer(layersRef.current.objects);
      layersRef.current.objects = null;
    }

    if (!districtObjects || selectedDistrictId === null) return;

    const mfyColor = tileKey === 'satellite' ? '#facc15' : STYLES.mfy.color;
    const mfyStyle = { ...STYLES.mfy, color: mfyColor };
    const mfyHoverStyle = { ...STYLES.mfyHover, color: mfyColor };

    const data = districtObjects as GeoJSON.FeatureCollection;
    const mfyData = { ...data, features: data.features.filter((f) => (f as MapFeature).properties.isMfy) };
    const streetData = { ...data, features: data.features.filter((f) => !(f as MapFeature).properties.isMfy) };

    // MFY layer
    const mfyLayer = L.geoJSON(mfyData as GeoJSON.GeoJsonObject, {
      style: mfyStyle,
      pointToLayer: (_feature, latlng) =>
        L.circleMarker(latlng, { radius: 5, color: mfyColor, fillOpacity: 0.7 }),
      onEachFeature: (feature, lyr) => {
        const f = feature as MapFeature;
        lyr.on('mouseover', () => (lyr as L.Path).setStyle(mfyHoverStyle));
        lyr.on('mouseout', () => (lyr as L.Path).setStyle(mfyStyle));
        if (f.properties.nameUz) {
          lyr.bindTooltip(`${f.properties.nameUz} MFY`, {
            permanent: true, direction: 'center', className: 'map-label',
          });
        }
      },
    });

    // Street visual layer — thin, non-interactive (no events)
    const streetVisualMap = new Map<number, L.Path>();
    const streetVisual = L.geoJSON(streetData as GeoJSON.GeoJsonObject, {
      style: STYLES.street,
      interactive: false,
      onEachFeature: (feature, lyr) => {
        const f = feature as MapFeature;
        streetVisualMap.set(f.properties.id, lyr as L.Path);
        if (f.properties.nameUz) {
          lyr.bindTooltip(
            [f.properties.nameUz, f.properties.objectType?.toLowerCase()].filter(Boolean).join(' '),
            { permanent: true, direction: 'center', className: 'map-street-label' },
          );
        }
      },
    });

    // Street hit layer — thick, transparent, interactive only
    const streetHit = L.geoJSON(streetData as GeoJSON.GeoJsonObject, {
      style: { color: '#000', weight: 14, opacity: 0.001, fillOpacity: 0 },
      onEachFeature: (feature, lyr) => {
        const f = feature as MapFeature;
        const id = f.properties.id as number;
        lyr.on('mouseover', () => {
          streetVisualMap.get(id)?.setStyle({ ...STYLES.street, weight: 4, opacity: 1 });
          setHoveredStreet({ name: f.properties.nameUz ?? '', objectType: f.properties.objectType ?? null });
        });
        lyr.on('mouseout', () => {
          streetVisualMap.get(id)?.setStyle(STYLES.street);
          setHoveredStreet(null);
        });
      },
    });

    // Order: streetVisual (bottom) → mfyLayer → streetHit (top, captures events)
    const group = L.layerGroup([streetVisual, mfyLayer, streetHit]).addTo(map);

    layersRef.current.objects = group;

    const bounds = mfyLayer.getBounds().extend(streetVisual.getBounds());
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [16, 16], maxZoom: 14 });
  }, [districtObjects, selectedDistrictId, tileKey]);

  // Tile layer switch
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const options: L.TileLayerOptions = { attribution: TILE_ATTRIBUTIONS[tileKey] };
    if (tileKey === 'satellite') options.maxNativeZoom = 17;
    tileLayerRef.current = L.tileLayer(TILES[tileKey], options).addTo(map);
    tileLayerRef.current.bringToBack();
  }, [tileKey]);

  // Cleanup district/object layers when drilling back up
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedRegionId === null) {
      if (layersRef.current.districts) { map.removeLayer(layersRef.current.districts); layersRef.current.districts = null; }
      if (layersRef.current.objects) { map.removeLayer(layersRef.current.objects); layersRef.current.objects = null; }
    }
    if (selectedDistrictId === null && layersRef.current.objects) {
      map.removeLayer(layersRef.current.objects);
      layersRef.current.objects = null;
    }
  }, [selectedRegionId, selectedDistrictId]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: 0 }}>
      <div ref={containerRef} className="w-full h-full" />

      {/* Street hover info */}
      {hoveredStreet && (
        <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 px-4 py-3 pointer-events-none min-w-40">
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">
            {hoveredStreet.objectType ?? "Ko'cha"}
          </p>
          <p className="text-sm font-semibold text-[#0f1f3d] leading-tight">
            {hoveredStreet.name}
          </p>
        </div>
      )}

      {/* Tile switcher */}
      <div className="absolute bottom-6 right-3 z-[1000] flex rounded-lg overflow-hidden shadow border border-gray-200 text-xs font-medium">
        <button
          onClick={() => setTileKey('osm')}
          className={`px-3 py-1.5 cursor-pointer transition-colors ${
            tileKey === 'osm'
              ? 'bg-[#1D4ED8] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Xarita
        </button>
        <button
          onClick={() => setTileKey('satellite')}
          className={`px-3 py-1.5 cursor-pointer transition-colors border-l border-gray-200 ${
            tileKey === 'satellite'
              ? 'bg-[#1D4ED8] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Satellite
        </button>
      </div>
    </div>
  );
}
