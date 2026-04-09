import { z } from 'zod';

const objectItemSchema = z.object({
  nameUz: z.string().min(1, 'Nomi kiritilishi shart').max(200).optional(),
  nameKrill: z.string().max(200).optional(),
  registryNumber: z.string().max(50).optional(),
  objectTypeId: z.number().int().positive().optional(),
  geometry: z.looseObject({ type: z.string() }),
});

export const createGeographicObjectSchema = z.object({
  regionId: z.number({ error: 'Viloyat tanlanishi shart' }).int().positive(),
  districtId: z.number({ error: 'Tuman tanlanishi shart' }).int().positive(),
  existsInRegistry: z.boolean(),
  objects: z.array(objectItemSchema).min(1),
});

export type CreateGeographicObjectSchema = z.infer<typeof createGeographicObjectSchema>;
export type ObjectItem = z.infer<typeof objectItemSchema>;
