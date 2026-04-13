import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapFeatureCollection, MapFeature } from '@/api/map.api';

const STYLES = {
  region: { color: '#1565c0', weight: 2, opacity: 0.9, fillOpacity: 0, fillColor: '#1565c0' },
  regionHover: { fillOpacity: 0.1, weight: 3 },
  district: { color: '#15803d', weight: 1.5, opacity: 0.9, fillOpacity: 0, fillColor: '#15803d' },
  districtHover: { fillOpacity: 0.12, weight: 2.5 },
  mfy: { color: '#b45309', weight: 1, opacity: 0.8, fillOpacity: 0, fillColor: '#b45309' },
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
  const layersRef = useRef<{ regions: L.Layer | null; districts: L.Layer | null; objects: L.Layer | null }>({
    regions: null,
    districts: null,
    objects: null,
  });

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [41.3, 63.5],
      zoom: 6,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Region layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !regionFeatures) return;

    if (layersRef.current.regions) {
      map.removeLayer(layersRef.current.regions);
      layersRef.current.regions = null;
    }

    if (selectedRegionId !== null) return; // Show only when no region selected

    const layer = L.geoJSON(regionFeatures as GeoJSON.GeoJsonObject, {
      style: STYLES.region,
      onEachFeature: (feature, layer) => {
        const f = feature as MapFeature;
        layer.on('mouseover', () => (layer as L.Path).setStyle(STYLES.regionHover));
        layer.on('mouseout', () => (layer as L.Path).setStyle(STYLES.region));
        layer.on('click', () => onRegionClick(f));
        layer.bindTooltip(f.properties.nameUz ?? '', { sticky: true, className: 'map-tooltip' });
      },
    }).addTo(map);

    layersRef.current.regions = layer;

    const bounds = layer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
  }, [regionFeatures, selectedRegionId]);

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
          ? { ...STYLES.district, fillOpacity: 0.08, weight: 2.5 }
          : STYLES.district;
      },
      onEachFeature: (feature, layer) => {
        const f = feature as MapFeature;
        layer.on('mouseover', () => {
          if (f.properties.districtDbId !== selectedDistrictId)
            (layer as L.Path).setStyle(STYLES.districtHover);
        });
        layer.on('mouseout', () => {
          if (f.properties.districtDbId !== selectedDistrictId)
            (layer as L.Path).setStyle(STYLES.district);
        });
        layer.on('click', () => onDistrictClick(f));
        layer.bindTooltip(f.properties.nameUz ?? '', { sticky: true, className: 'map-tooltip' });
      },
    }).addTo(map);

    layersRef.current.districts = layer;

    const bounds = layer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
  }, [districtFeatures, selectedRegionId, selectedDistrictId]);

  // District objects layer (MFY + streets)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layersRef.current.objects) {
      map.removeLayer(layersRef.current.objects);
      layersRef.current.objects = null;
    }

    if (!districtObjects || selectedDistrictId === null) return;

    const layer = L.geoJSON(districtObjects as GeoJSON.GeoJsonObject, {
      style: (feature) => {
        const f = feature as MapFeature;
        return f.properties.isMfy ? STYLES.mfy : STYLES.street;
      },
      pointToLayer: (feature, latlng) => {
        const f = feature as MapFeature;
        return L.circleMarker(latlng, {
          radius: 5,
          color: f.properties.isMfy ? '#b45309' : '#7c3aed',
          fillOpacity: 0.7,
        });
      },
      onEachFeature: (feature, layer) => {
        const f = feature as MapFeature;
        if (f.properties.nameUz) {
          layer.bindTooltip(`${f.properties.objectType ?? ''}: ${f.properties.nameUz}`, {
            sticky: true,
            className: 'map-tooltip',
          });
        }
      },
    }).addTo(map);

    layersRef.current.objects = layer;

    const bounds = layer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [16, 16], maxZoom: 14 });
  }, [districtObjects, selectedDistrictId]);

  // Remove region/object layers when drilling up
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
    <div ref={containerRef} className="w-full h-full" style={{ minHeight: 0 }} />
  );
}
