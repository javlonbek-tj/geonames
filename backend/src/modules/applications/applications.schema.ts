import { z } from 'zod';

export const performActionSchema = z.object({
  action: z.enum(['submit', 'approve', 'return', 'confirm_geometry'], {
    error: "Noto'g'ri harakat turi",
  }),
  comment: z.string().max(2000).optional(),
  // Oldindan yuklangan fayllar yo'llari (upload endpointdan qaytgan paths)
  attachments: z.array(z.string()).optional(),
});

export type PerformActionInput = z.infer<typeof performActionSchema>;
