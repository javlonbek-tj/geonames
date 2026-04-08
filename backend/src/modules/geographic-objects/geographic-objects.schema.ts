import { z } from 'zod';

const geometrySchema = z.object({
  type: z.enum([
    'Point', 'Polygon', 'LineString', 'MultiPolygon',
    'MultiPoint', 'MultiLineString', 'GeometryCollection',
    'Feature', 'FeatureCollection',
  ]),
}).passthrough();

const objectItemSchema = z.object({
  nameUz: z.string().min(1, 'Nomi kiritilishi shart').max(200),
  nameKrill: z.string().max(200).optional(),
  registryNumber: z.string().max(50).optional(),
  geometry: geometrySchema,
});

export const createGeographicObjectSchema = z.object({
  objectTypeId: z.number().int().positive("Ob'yekt turi tanlanishi shart"),
  regionId: z.number().int().positive('Viloyat tanlanishi shart'),
  districtId: z.number().int().positive('Tuman tanlanishi shart'),
  existsInRegistry: z.boolean(),
  objects: z.array(objectItemSchema).min(1, "Kamida bitta ob'yekt kiritilishi shart"),
});

export const updateGeometrySchema = z.object({
  geometry: geometrySchema,
});

export type CreateGeographicObjectInput = z.infer<typeof createGeographicObjectSchema>;
export type ObjectItem = z.infer<typeof objectItemSchema>;
export type UpdateGeometryInput = z.infer<typeof updateGeometrySchema>;
