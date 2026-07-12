import { z } from 'zod';

export const expenseSchema = z.object({
  body: z.object({
    expenseCode: z.string().min(3),
    expenseCategory: z.string().min(2),
    status: z.string().optional(),
    amount: z.number().nonnegative(),
    expenseDate: z.coerce.date(),
    description: z.string().min(2),
    vehicle: z.string().min(1),
    trip: z.string().min(1),
  }),
});
