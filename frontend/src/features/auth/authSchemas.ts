import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid official email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Full name is required (min 2 characters)'),
  email: z.string().email('Please enter a valid institutional email address'),
  organization: z.string().min(3, 'Organization or Health Department name is required'),
  role: z.enum(['epidemiologist', 'health_officer', 'analyst', 'admin'] as const, {
    message: 'Please select an authorized role',
  }),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must acknowledge the HIPAA & Anonymized Data Policy',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid registered email address'),
});
