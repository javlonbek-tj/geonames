import type { ObjectType } from './object-type';
import type { Region, District } from './location';
import type { User } from './user';
import type { Application } from './application';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GeoJSON = Record<string, any>;

export interface GeographicObject {
  id: number;
  applicationId: number | null;
  nameUz: string | null;
  nameKrill: string | null;
  objectTypeId: number | null;
  objectType?: ObjectType;
  regionId: number;
  region?: Region;
  districtId: number;
  district?: District;
  geometry: GeoJSON | null;
  registryNumber: string | null;
  soato: string | null;
  basisDocument: string | null;
  affiliation: string | null;
  historicalName: string | null;
  comment: string | null;
  existsInRegistry: boolean | null;
  createdBy: number;
  creator?: Pick<User, 'id' | 'username' | 'fullName' | 'role'>;
  application?: Application;
  createdAt: string;
  updatedAt: string;
}
