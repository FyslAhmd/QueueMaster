import { z } from 'zod';

// Schema for API (expects combined startTime)
export const createAppointmentApiSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name must be less than 100 characters')
    .trim(),
  customerEmail: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  customerPhone: z
    .string()
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  serviceId: z
    .string()
    .min(1, 'Please select a service'),
  staffId: z
    .string()
    .optional()
    .or(z.literal('')),
  startTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Please enter a valid date and time',
    }),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

// Schema for form (has separate date and time fields)
export const createAppointmentSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name must be less than 100 characters')
    .trim(),
  customerEmail: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  customerPhone: z
    .string()
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  serviceId: z
    .string()
    .min(1, 'Please select a service'),
  staffId: z
    .string()
    .optional()
    .or(z.literal('')),
  date: z
    .string()
    .min(1, 'Please select a date'),
  time: z
    .string()
    .min(1, 'Please select a time'),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
});

// Form schema for update - used by frontend forms
export const updateAppointmentSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name must be less than 100 characters')
    .trim()
    .optional(),
  customerEmail: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  customerPhone: z
    .string()
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  serviceId: z.string().optional(),
  staffId: z.string().optional().or(z.literal('')),
  date: z.string().optional(),
  time: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

// API schema for update - used by API routes
export const updateAppointmentApiSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name must be less than 100 characters')
    .trim()
    .optional(),
  customerEmail: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  customerPhone: z
    .string()
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  serviceId: z.string().optional(),
  staffId: z.string().optional().or(z.literal('')),
  startTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Please enter a valid date and time',
    })
    .optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type CreateAppointmentApiInput = z.infer<typeof createAppointmentApiSchema>;
export type UpdateAppointmentApiInput = z.infer<typeof updateAppointmentApiSchema>;
