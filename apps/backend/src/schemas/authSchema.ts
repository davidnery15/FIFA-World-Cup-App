import { z } from 'zod';

// Schema for User Registration
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .max(50, { message: 'Name cannot exceed 50 characters.' }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: 'Please provide a valid email address.' })),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long.' })
    .max(100, { message: 'Password is too long.' }),
});

// Schema for User Login
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: 'Please provide a valid email address.' })),
  password: z
    .string()
    .min(1, { message: 'Password cannot be empty.' }),
});

// Optional: Export TypeScript types inferred directly from the schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;