import { z } from 'zod';

export const fuelSchema = z.object({
  body: z.object({
    fuelCode: z.string().min(3),
    vehicle: z.string().min(1),
    trip: z.string().min(1),
    driver: z.string().min(1),
    date: z.coerce.date(),
    fuelQuantity: z.number().nonnegative(),
    fuelCost: z.number().nonnegative(),
    odometer: z.number().nonnegative(),
    fuelStation: z.string().min(2),
    notes: z.string().optional(),
  }),
});
