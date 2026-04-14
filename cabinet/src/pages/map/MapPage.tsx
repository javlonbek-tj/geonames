import { useState } from 'react';
import { Spin } from 'antd';
import { useMapRegions, useMapDistricts, useMapDistrictObjects } from '@/hooks/map/useMapData';
import { useRegions, useDistricts } from '@/hooks/locations/useLocations';
import type { MapFeature } from '@/api/map.api';
import MapView from './components/MapView';
import MapFilterPanel from './components/MapFilterPanel';
import MapBreadcrumb from './components/MapBreadcrumb';

export default function MapPage() {
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);

  const { data: regionFeatures, isLoading: regionsLoading } = useMapRegions();
  const { data: districtFeatures, isFetching: districtsFetching } = useMapDistricts(selectedRegionId);
  const { data: districtObjects, isFetching: objectsFetching } = useMapDistrictObjects(selectedDistrictId);

  const { data: regions = [] } = useRegions();
  const { data: districts = [] } = useDistricts(selectedRegionId ?? undefined);

  const isLoading = regionsLoading || districtsFetching || objectsFetching;

  const selectedRegion = regions.find((r) => r.id === selectedRegionId);
  const selectedDistrict = districts.find((d) => d.id === selectedDistrictId);

  const handleRegionClick = (feature: MapFeature) => {
    const regionDbId = feature.properties.regionDbId ?? feature.properties.regionId;
    setSelectedRegionId(regionDbId);
    setSelectedDistrictId(null);
  };

  const handleDistrictClick = (feature: MapFeature) => {
    const districtDbId = feature.properties.districtDbId ?? feature.properties.districtId;
    setSelectedDistrictId(districtDbId);
  };

  const featureCounts = {
    regions: selectedRegionId === null ? (regionFeatures?.features.length ?? 0) : 0,
    districts: selectedRegionId !== null && selectedDistrictId === null
      ? (districtFeatures?.features.length ?? 0) : 0,
    mfy: districtObjects?.features.filter((f) => f.properties.isMfy).length ?? 0,
    streets: districtObjects?.features.filter((f) => !f.properties.isMfy).length ?? 0,
  };

  const breadcrumbs = [
    {
      label: "O'zbekiston",
      onClick: selectedRegionId !== null
        ? () => { setSelectedRegionId(null); setSelectedDistrictId(null); }
        : undefined,
    },
    ...(selectedRegion
      ? [{
          label: selectedRegion.nameUz,
          onClick: selectedDistrictId !== null
            ? () => setSelectedDistrictId(null)
            : undefined,
        }]
      : []),
    ...(selectedDistrict ? [{ label: selectedDistrict.nameUz }] : []),
  ];

  return (
    <div className="-m-6 flex" style={{ height: 'calc(100vh - 112px)' }}>
      {/* Sidebar */}
      <div className="w-72 shrink-0 bg-white border-r border-gray-100 p-4 overflow-y-auto flex flex-col">
        <MapFilterPanel
          selectedRegionId={selectedRegionId}
          selectedDistrictId={selectedDistrictId}
          onRegionChange={(id) => { setSelectedRegionId(id); setSelectedDistrictId(null); }}
          onDistrictChange={setSelectedDistrictId}
          featureCounts={featureCounts}
          isLoading={isLoading}
        />
      </div>

      {/* Map area */}
      <div className="flex-1 relative min-w-0">
        {/* Breadcrumb overlay */}
        <div className="absolute top-3 left-3 z-[1000]">
          <MapBreadcrumb crumbs={breadcrumbs} />
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
            <Spin size="large" />
          </div>
        )}

        <MapView
          regionFeatures={regionFeatures}
          districtFeatures={districtFeatures}
          districtObjects={districtObjects}
          onRegionClick={handleRegionClick}
          onDistrictClick={handleDistrictClick}
          selectedRegionId={selectedRegionId}
          selectedDistrictId={selectedDistrictId}
        />
      </div>
    </div>
  );
}
