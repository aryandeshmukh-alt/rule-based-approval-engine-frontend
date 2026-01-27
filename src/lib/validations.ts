import { z } from 'zod';

/**
 * Sanitizes input by trimming and basic HTML tag stripping
 */
export const sanitizeInput = (val: string): string => {
    return val.trim().replace(/<[^>]*>?/gm, '');
};

// Auth Schemas
export const loginSchema = z.object({
    email: z.string().trim().email('Invalid email address').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
    email: z.string().trim().email('Invalid email address').toLowerCase(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Request Schemas
export const leaveRequestSchema = z.object({
    fromDate: z.string(),
    toDate: z.string(),
    leaveType: z.enum(['EARN', 'SICK', 'CASUAL', 'UNPAID']),
    reason: z.string().transform(sanitizeInput).pipe(
        z.string().min(10, 'Please provide a more detailed reason (min 10 chars)').max(1000, 'Reason is too long')
    ),
});

export const expenseRequestSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    category: z.string().min(1, 'Category is required'),
    reason: z.string().transform(sanitizeInput).pipe(
        z.string().min(5, 'Description is too short').max(500, 'Description is too long')
    ),
});

export const discountRequestSchema = z.object({
    discountPercentage: z.number().min(1).max(25),
    reason: z.string().transform(sanitizeInput).pipe(
        z.string().min(5, 'Justification is too short').max(500, 'Justification is too long')
    ),
});
