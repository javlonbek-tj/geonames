import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Login kiriting'),
  password: z.string().min(1, 'Parol kiriting'),
});

export type LoginSchema = z.infer<typeof loginSchema>;
