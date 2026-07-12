import { z } from 'zod';

export const tripSchema = z.object({
  body: z.object({
    tripCode: z.string().min(3),
    vehicle: z.string().min(1),
    driver: z.string().min(1),
    source: z.string().min(2),
    destination: z.string().min(2),
    cargoWeight: z.number().nonnegative(),
    plannedDistance: z.number().nonnegative(),
    expectedRevenue: z.number().nonnegative(),
    status: z.string().optional(),
    notes: z.string().optional(),
    eta: z.string().optional(),
    createdDate: z.coerce.date().optional(),
    dispatchedDate: z.coerce.date().optional(),
    completedDate: z.coerce.date().optional(),
    cancelledDate: z.coerce.date().optional(),
    finalOdometer: z.number().nonnegative().optional(),
    fuelConsumed: z.number().nonnegative().optional(),
    additionalExpense: z.number().nonnegative().optional(),
    completionNotes: z.string().optional(),
  }),
});
