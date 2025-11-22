import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    full_name: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must be less than 100 characters'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    new_password: z
      .string()
      .min(1, 'New password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.new_password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Aliases for backward compatibility
export const userRegistrationSchema = registerSchema;
export const passwordResetSchema = resetPasswordSchema;

// Type definitions
export type UserRegistrationData = z.infer<typeof registerSchema>;
export type PasswordResetData = z.infer<typeof resetPasswordSchema>;

// Book schemas
export const bookSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(2, 'Title must be at least 2 characters')
    .max(255, 'Title must be less than 255 characters'),
  isbn: z
    .string()
    .optional()
    .refine(
      val =>
        !val ||
        /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/.test(
          val
        ),
      {
        message: 'Please enter a valid ISBN',
      }
    ),
  description: z
    .string()
    .optional()
    .refine(val => !val || val.length <= 2000, {
      message: 'Description must be less than 2000 characters',
    }),
  price: z
    .number()
    .min(0.01, 'Price must be greater than 0')
    .max(9999.99, 'Price must be less than $10,000'),
  stock_quantity: z
    .number()
    .int('Stock quantity must be a whole number')
    .min(0, 'Stock quantity cannot be negative')
    .max(999999, 'Stock quantity must be less than 1,000,000'),
  publication_date: z
    .string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: 'Please enter a valid date',
    }),
  publisher: z
    .string()
    .optional()
    .refine(val => !val || val.length <= 255, {
      message: 'Publisher must be less than 255 characters',
    }),
  language: z
    .string()
    .optional()
    .refine(val => !val || val.length <= 50, {
      message: 'Language must be less than 50 characters',
    }),
  pages: z
    .number()
    .int('Pages must be a whole number')
    .min(1, 'Pages must be at least 1')
    .max(99999, 'Pages must be less than 100,000')
    .optional(),
  format: z
    .enum(['hardcover', 'paperback', 'ebook', 'audiobook'], {
      errorMap: () => ({ message: 'Please select a valid format' }),
    })
    .optional(),
  author_ids: z.array(z.number()).min(1, 'At least one author is required'),
  category_ids: z.array(z.number()).min(1, 'At least one category is required'),
});

// Author schemas
export const authorSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(255, 'First name must be less than 255 characters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(255, 'Last name must be less than 255 characters'),
  biography: z
    .string()
    .optional()
    .refine(val => !val || val.length <= 2000, {
      message: 'Biography must be less than 2000 characters',
    }),
  nationality: z
    .string()
    .optional()
    .refine(val => !val || val.length <= 100, {
      message: 'Nationality must be less than 100 characters',
    }),
  website: z
    .string()
    .optional()
    .refine(val => !val || /^https?:\/\/.+/.test(val), {
      message: 'Please enter a valid website URL',
    }),
});

// Category schemas
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters'),
  description: z
    .string()
    .optional()
    .refine(val => !val || val.length <= 1000, {
      message: 'Description must be less than 1000 characters',
    }),
  parent_id: z.number().optional(),
});

// Customer schemas
export const customerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  first_name: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name must be less than 100 characters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name must be less than 100 characters'),
  phone: z
    .string()
    .optional()
    .refine(val => !val || /^\+?[\d\s\-\(\)]{10,}$/.test(val), {
      message: 'Please enter a valid phone number',
    }),
  date_of_birth: z
    .string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: 'Please enter a valid date of birth',
    })
    .refine(val => !val || new Date(val) <= new Date(), {
      message: 'Date of birth cannot be in the future',
    }),
  address: z
    .string()
    .optional()
    .refine(val => !val || val.length <= 500, {
      message: 'Address must be less than 500 characters',
    }),
  city: z
    .string()
    .optional()
    .refine(val => !val || val.length <= 100, {
      message: 'City must be less than 100 characters',
    }),
  country: z
    .string()
    .optional()
    .refine(val => !val || val.length <= 100, {
      message: 'Country must be less than 100 characters',
    }),
  postal_code: z
    .string()
    .optional()
    .refine(val => !val || /^[A-Z0-9\s-]{3,10}$/i.test(val), {
      message: 'Please enter a valid postal code',
    }),
});

// Sale schemas
export const saleItemSchema = z.object({
  book_id: z.number().min(1, 'Please select a book'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(999, 'Quantity must be less than 1000'),
});

export const saleSchema = z.object({
  customer_id: z.number().min(1, 'Please select a customer'),
  payment_method: z.enum(['cash', 'credit_card', 'debit_card', 'online'], {
    errorMap: () => ({ message: 'Please select a valid payment method' }),
  }),
  notes: z
    .string()
    .optional()
    .refine(val => !val || val.length <= 1000, {
      message: 'Notes must be less than 1000 characters',
    }),
  items: z
    .array(saleItemSchema)
    .min(1, 'At least one item is required')
    .max(50, 'Maximum 50 items per sale'),
});

// Search and filter schemas
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(255, 'Search query must be less than 255 characters'),
});

export const bookFilterSchema = z.object({
  search: z.string().optional(),
  author_id: z.number().optional(),
  category_id: z.number().optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  in_stock: z.boolean().optional(),
  format: z.enum(['hardcover', 'paperback', 'ebook', 'audiobook']).optional(),
  page: z.number().int().min(1).optional(),
  size: z.number().int().min(1).max(100).optional(),
});

export const customerFilterSchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  page: z.number().int().min(1).optional(),
  size: z.number().int().min(1).max(100).optional(),
});

export const saleFilterSchema = z.object({
  customer_id: z.number().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(['pending', 'completed', 'cancelled', 'refunded']).optional(),
  payment_method: z.enum(['cash', 'credit_card', 'debit_card', 'online']).optional(),
  min_amount: z.number().min(0).optional(),
  max_amount: z.number().min(0).optional(),
  page: z.number().int().min(1).optional(),
  size: z.number().int().min(1).max(100).optional(),
});

// File upload schemas
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(file => file.size <= 10 * 1024 * 1024, {
      message: 'File size must be less than 10MB',
    })
    .refine(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), {
      message: 'File must be a JPEG, PNG, or WebP image',
    }),
});

export const csvUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(file => file.size <= 50 * 1024 * 1024, {
      message: 'File size must be less than 50MB',
    })
    .refine(
      file =>
        [
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ].includes(file.type),
      {
        message: 'File must be a CSV or Excel file',
      }
    ),
});

// Profile and settings schemas
export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(1, 'New password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine(data => data.new_password === data.confirmPassword, {
    message: "New passwords don't match",
    path: ['confirmPassword'],
  });

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type BookFormData = z.infer<typeof bookSchema>;
export type AuthorFormData = z.infer<typeof authorSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type CustomerFormData = z.infer<typeof customerSchema>;
export type SaleFormData = z.infer<typeof saleSchema>;
export type SaleItemFormData = z.infer<typeof saleItemSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type BookFilterFormData = z.infer<typeof bookFilterSchema>;
export type CustomerFilterFormData = z.infer<typeof customerFilterSchema>;
export type SaleFilterFormData = z.infer<typeof saleFilterSchema>;
export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
export type CsvUploadFormData = z.infer<typeof csvUploadSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
