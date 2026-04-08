import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface GeoJsonMapProps {
  geojson: object;
  height?: string;
}

export default function GeoJsonMap({ geojson, height = '400px' }: GeoJsonMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Map allaqachon yaratilgan bo'lsa qayta yaratmaymiz
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const layer = L.geoJSON(geojson as GeoJSON.GeoJsonObject, {
      style: {
        color: '#1677ff',
        weight: 3,
        opacity: 0.8,
        fillOpacity: 0.15,
      },
    }).addTo(map);

    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] });
    } else {
      map.setView([41.2995, 69.2401], 7); // Toshkent
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [geojson]);

  return <div ref={containerRef} style={{ height }} className='w-full rounded-lg z-0' />;
}
