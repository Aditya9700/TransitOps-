import { z } from 'zod';

export const maintenanceSchema = z.object({
  body: z.object({
    maintenanceCode: z.string().min(3),
    vehicle: z.string().min(1),
    serviceType: z.string().min(2),
    description: z.string().min(2),
    category: z.enum(['Oil Change', 'Engine Repair', 'Tyre Replacement', 'Brake Service', 'Battery', 'General Inspection']),
    status: z.string().optional(),
    scheduledDate: z.coerce.date(),
    estimatedCompletion: z.coerce.date().optional(),
    completionDate: z.coerce.date().optional(),
    estimatedCost: z.number().nonnegative(),
    mechanicName: z.string().min(2),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    notes: z.string().optional(),
  }),
});
