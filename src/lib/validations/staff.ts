import { z } from 'zod';

export const createStaffSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  serviceType: z
    .string()
    .min(2, 'Service type must be at least 2 characters')
    .max(100, 'Service type must be less than 100 characters')
    .trim(),
  dailyCapacity: z
    .number()
    .int('Daily capacity must be a whole number')
    .min(1, 'Daily capacity must be at least 1')
    .max(50, 'Daily capacity cannot exceed 50'),
  status: z.enum(['available', 'on_leave']).optional(),
});

export const updateStaffSchema = createStaffSchema.partial();

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
