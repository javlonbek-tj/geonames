export interface Region {
  id: number;
  code: string;
  nameUz: string;
  nameKrill: string | null;
}

export interface District {
  id: number;
  code: string;
  nameUz: string;
  nameKrill: string | null;
  regionId: number;
}
