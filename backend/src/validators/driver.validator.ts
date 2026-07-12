import { z } from 'zod';

export const driverSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    licenseNumber: z.string().min(3),
    category: z.enum(['LMV', 'HMV']),
    licenseExpiry: z.coerce.date(),
    contactNumber: z.string().min(6),
    email: z.string().email(),
    tripCompletionRate: z.number().min(0).max(100).optional(),
    safetyScore: z.number().min(0).max(100).optional(),
    status: z.string().optional(),
  }),
});
