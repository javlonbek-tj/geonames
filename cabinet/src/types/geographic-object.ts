import type { ObjectType } from './object-type';
import type { Region, District } from './location';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GeoJSON = Record<string, any>;

export interface GeographicObject {
  id: number;
  applicationId: number;
  nameUz: string;
  nameKrill: string | null;
  objectTypeId: number;
  objectType?: ObjectType;
  regionId: number;
  region?: Region;
  districtId: number;
  district?: District;
  geometry: GeoJSON | null;
  registryNumber: string | null;
  existsInRegistry: boolean | null;
  createdBy: number;
  createdAt: string;
}
