import { z } from 'zod';

export const vehicleSchema = z.object({
  body: z.object({
    registrationNumber: z.string().min(3),
    name: z.string().min(2),
    type: z.string().min(2),
    capacity: z.number().nonnegative(),
    capacityUnit: z.enum(['kg', 'Ton']).optional(),
    odometer: z.number().nonnegative(),
    acquisitionCost: z.number().nonnegative(),
    status: z.string().optional(),
  }),
});