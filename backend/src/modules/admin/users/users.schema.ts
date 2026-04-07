import { z } from 'zod';

const roles = [
  'admin',
  'dkp_filial',
  'district_commission',
  'district_hokimlik',
  'regional_commission',
  'regional_hokimlik',
  'kadastr_agency',
  'dkp_central',
  'peoples_council',
] as const;

// Viloyat darajasidagi rollar
const regionalRoles = [
  'regional_commission',
  'regional_hokimlik',
] as const;

// Tuman darajasidagi rollar
const districtRoles = [
  'dkp_filial',
  'district_commission',
  'district_hokimlik',
] as const;

export const createUserSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username kamida 3 ta belgi bo'lishi kerak")
      .max(50)
      .regex(/^[a-zA-Z0-9_]+$/, "Username faqat harf, raqam va _ dan iborat bo'lishi kerak"),
    password: z
      .string()
      .min(8, "Parol kamida 8 ta belgi bo'lishi kerak"),
    fullName: z.string().min(2).max(200).optional(),
    role: z.enum(roles, { error: "Noto'g'ri rol" }),
    regionId: z.number().int().positive().optional(),
    districtId: z.number().int().positive().optional(),
  })
  .refine(
    (data) => {
      if ((regionalRoles as readonly string[]).includes(data.role)) {
        return !!data.regionId;
      }
      return true;
    },
    { message: 'Viloyat darajasidagi rol uchun regionId majburiy', path: ['regionId'] }
  )
  .refine(
    (data) => {
      if ((districtRoles as readonly string[]).includes(data.role)) {
        return !!data.districtId;
      }
      return true;
    },
    { message: 'Tuman darajasidagi rol uchun districtId majburiy', path: ['districtId'] }
  );

export const updateUserSchema = z
  .object({
    fullName: z.string().min(2).max(200).optional(),
    role: z.enum(roles).optional(),
    regionId: z.number().int().positive().nullable().optional(),
    districtId: z.number().int().positive().nullable().optional(),
    isActive: z.boolean().optional(),
    isBlocked: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Kamida bitta maydon o'zgartirilishi kerak",
  });

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Parol kamida 8 ta belgi bo'lishi kerak"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
