export interface ObjectCategory {
  id: number;
  code: string;
  nameUz: string;
  nameKrill: string | null;
  objectTypes: ObjectType[];
}

export interface ObjectType {
  id: number;
  nameUz: string;
  nameKrill: string | null;
  categoryId: number;
  category?: ObjectCategory;
}
