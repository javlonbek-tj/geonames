import api from './axios';

export interface MapFeature {
  type: 'Feature';
  geometry: object;
  properties: {
    id: number;
    nameUz: string | null;
    soato: string | null;
    regionId: number;
    districtId: number;
    regionDbId?: number;
    districtDbId?: number;
    objectType?: string | null;
    isMfy?: boolean;
  };
}

export interface MapFeatureCollection {
  type: 'FeatureCollection';
  features: MapFeature[];
}

export const mapApi = {
  getRegions: () =>
    api.get<{ status: string; data: MapFeatureCollection }>('/map/regions'),

  getDistricts: (regionId: number) =>
    api.get<{ status: string; data: MapFeatureCollection }>(`/map/regions/${regionId}/districts`),

  getDistrictObjects: (districtId: number) =>
    api.get<{ status: string; data: MapFeatureCollection }>(`/map/districts/${districtId}/objects`),
};
