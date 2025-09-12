import { z } from 'zod';

// Common validation schemas
export const phoneSchema = z.string()
  .regex(/^[+]?[\d\s-()]+$/, 'Invalid phone number format')
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number cannot exceed 15 digits')
  .optional()
  .or(z.literal(''));

export const emailSchema = z.string()
  .email('Invalid email format')
  .optional()
  .or(z.literal(''));

export const positiveNumberSchema = z.union([
  z.number().positive('Must be a positive number'),
  z.string().regex(/^\d+$/, 'Must be a valid number').transform(Number)
]);

export const currencySchema = z.union([
  z.number().min(0, 'Amount cannot be negative'),
  z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid currency format').transform(Number)
]);

// Patient validation schemas - aligned with tbl_patient table
export const patientFormSchema = z.object({
  patientId: z.string().optional(),
  patientName: z.string()
    .min(2, 'Patient name must be at least 2 characters')
    .max(255, 'Patient name cannot exceed 255 characters')
    .regex(/^[a-zA-Z\s.]+$/, 'Name can only contain letters, spaces, and periods'),
  relationType: z.enum(['W/o', 'D/o', 'S/o']).refine(val => ['W/o', 'D/o', 'S/o'].includes(val), {
    message: 'Please select a valid relation type'
  }),
  relation: z.string()
    .max(255, 'Relation name cannot exceed 255 characters')
    .optional()
    .or(z.literal('')),
  age: z.union([
    z.number().min(0).max(150),
    z.string().regex(/^\d+$/, 'Age must be a number').transform(Number).optional()
  ]).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).refine(val => ['Male', 'Female', 'Other'].includes(val), {
    message: 'Please select a valid gender'
  }),
  mobile: z.string()
    .regex(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
    .optional()
    .or(z.literal('')),
  address: z.string()
    .max(512, 'Address cannot exceed 512 characters')
    .optional()
    .or(z.literal('')),
  doctorId: z.string().optional(),
  createdBy: z.string()
    .min(1, 'Created by is required')
    .max(255, 'Created by cannot exceed 255 characters')
    .default('web')
});

// Doctor validation schemas - aligned with tbl_doctor table
export const doctorFormSchema = z.object({
  doctorName: z.string()
    .min(2, 'Doctor name must be at least 2 characters')
    .max(200, 'Doctor name cannot exceed 200 characters')
    .regex(/^[a-zA-Z\s.]+$/, 'Name can only contain letters, spaces, and periods'),
  specialty: z.string()
    .max(200, 'Specialty cannot exceed 200 characters')
    .optional()
    .or(z.literal('')),
  mobile: z.string()
    .regex(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
    .optional()
    .or(z.literal('')),
  email: emailSchema,
  consultationFee: currencySchema.optional(),
  commissionPercent: z.union([
    z.number().min(0).max(100),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid percentage format').transform(Number)
  ]).optional(),
  address: z.string()
    .max(512, 'Address cannot exceed 512 characters')
    .optional()
    .or(z.literal('')),
  isDeleted: z.boolean().default(false)
});

// Test validation schemas - aligned with tbl_test table
export const testFormSchema = z.object({
  testName: z.string()
    .min(2, 'Test name must be at least 2 characters')
    .max(255, 'Test name cannot exceed 255 characters'),
  price: currencySchema.refine((val: number) => val > 0, 'Price must be greater than 0'),
  category: z.string()
    .max(100, 'Category cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  normalRange: z.string()
    .max(255, 'Normal range cannot exceed 255 characters')
    .optional()
    .or(z.literal('')),
  unit: z.string()
    .max(50, 'Unit cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
  description: z.string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  isPrintable: z.boolean().default(true),
  isDeleted: z.boolean().default(false)
});

// Service validation schemas - aligned with tbl_service table  
export const serviceFormSchema = z.object({
  serviceName: z.string()
    .min(2, 'Service name must be at least 2 characters')
    .max(255, 'Service name cannot exceed 255 characters'),
  price: currencySchema.refine((val: number) => val > 0, 'Price must be greater than 0'),
  category: z.string()
    .max(100, 'Category cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  duration: z.union([
    z.number().min(0),
    z.string().regex(/^\d+$/, 'Duration must be a number').transform(Number)
  ]).optional(),
  description: z.string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().default(true),
  isDeleted: z.boolean().default(false)
});

// Expense validation schemas - aligned with tbl_expense table
export const expenseFormSchema = z.object({
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Invalid date format'),
  category: z.string()
    .min(1, 'Category is required')
    .max(100, 'Category cannot exceed 100 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description cannot exceed 500 characters'),
  amount: currencySchema.refine((val: number) => val > 0, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'cheque', 'bank_transfer']).default('cash'),
  vendorName: z.string()
    .max(200, 'Vendor name cannot exceed 200 characters')
    .optional()
    .or(z.literal('')),
  billNumber: z.string()
    .max(100, 'Bill number cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  approvedBy: z.string()
    .max(100, 'Approved by cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  isDeleted: z.boolean().default(false)
});

// Cash receipt validation schemas - aligned with tbl_cashreceipt and tbl_cashreceipt_details
export const cashReceiptTestSchema = z.object({
  testId: z.number().positive('Test ID must be a positive number'),
  testName: z.string().min(1, 'Test name is required'),
  price: currencySchema.refine((val: number) => val > 0, 'Price must be greater than 0'),
  quantity: z.number().min(1, 'Quantity must be at least 1').default(1),
  amount: currencySchema.refine((val: number) => val > 0, 'Amount must be greater than 0'),
  isPrintable: z.boolean().default(true)
});

export const cashReceiptFormSchema = z.object({
  // Main receipt fields - tbl_cashreceipt
  receiptId: z.string().optional(),
  patientName: z.string()
    .min(2, 'Patient name must be at least 2 characters')
    .max(255, 'Patient name cannot exceed 255 characters'),
  billDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Invalid date format'),
  userName: z.string()
    .min(1, 'User name is required')
    .max(100, 'User name cannot exceed 100 characters')
    .default('admin'),
  orgID: z.number().positive('Organization ID must be positive').default(1),
  
  // Patient details
  relationType: z.enum(['W/o', 'D/o', 'S/o']).refine(val => ['W/o', 'D/o', 'S/o'].includes(val), {
    message: 'Please select a valid relation type'
  }),
  relation: z.string()
    .max(255, 'Relation name cannot exceed 255 characters')
    .optional()
    .or(z.literal('')),
  mobile: z.string()
    .regex(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
    .optional()
    .or(z.literal('')),
  age: z.string()
    .max(10, 'Age cannot exceed 10 characters')
    .optional()
    .or(z.literal('')),
  address: z.string()
    .max(512, 'Address cannot exceed 512 characters')
    .optional()
    .or(z.literal('')),
  gender: z.enum(['Male', 'Female', 'Other']).refine(val => ['Male', 'Female', 'Other'].includes(val), {
    message: 'Please select a valid gender'
  }),
  
  // Financial fields
  totalAmount: z.number().min(0, 'Total amount cannot be negative'),
  discount: z.number().min(0, 'Discount cannot be negative').default(0),
  netAmount: z.number().min(0, 'Net amount cannot be negative'),
  netAmountWords: z.string()
    .max(500, 'Amount in words cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  
  // Doctor and referral fields
  refAmount: z.number().min(0, 'Referral amount cannot be negative').default(0),
  doctorID: z.number().min(0, 'Doctor ID must be non-negative').default(0),
  isRefPaid: z.boolean().default(false),
  
  // Patient reference
  patientID: z.number().optional(),
  
  // IPD fields
  isIPD: z.boolean().default(false),
  isDischarged: z.boolean().default(true),
  
  // Selected tests - tbl_cashreceipt_details
  selectedTests: z.array(cashReceiptTestSchema)
    .min(1, 'At least one test must be selected')
    .max(50, 'Cannot select more than 50 tests')
}).refine((data) => {
  // Custom validation: net amount should equal total amount minus discount
  return data.netAmount === data.totalAmount - data.discount;
}, {
  message: 'Net amount must equal total amount minus discount',
  path: ['netAmount']
}).refine((data) => {
  // Custom validation: total amount should match sum of selected tests
  const testsTotal = data.selectedTests.reduce((sum, test) => sum + test.amount, 0);
  return data.totalAmount === testsTotal;
}, {
  message: 'Total amount must match sum of selected tests',
  path: ['totalAmount']
});

// Referral amount validation schema - aligned with tbl_referralamount
export const referralAmountFormSchema = z.object({
  doctorID: z.number().positive('Doctor ID must be positive'),
  receiptID: z.number().positive('Receipt ID must be positive'),
  referralAmount: currencySchema.refine((val: number) => val > 0, 'Referral amount must be greater than 0'),
  paidDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Invalid date format'),
  isPaid: z.boolean().default(false),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'cheque', 'bank_transfer']).default('cash'),
  notes: z.string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  isDeleted: z.boolean().default(false)
});

// Validation utility functions
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err: z.ZodIssue) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}

export function validateField<T>(schema: z.ZodSchema<T>, value: unknown): {
  success: boolean;
  error?: string;
} {
  try {
    schema.parse(value);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation failed' };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// Simple field validation helper
export function validateSingleField(
  value: unknown,
  validationFn: (val: unknown) => boolean,
  errorMessage: string
): { success: boolean; error?: string } {
  if (validationFn(value)) {
    return { success: true };
  }
  return { success: false, error: errorMessage };
}

// Typed exports for better IntelliSense
export type PatientFormData = z.infer<typeof patientFormSchema>;
export type DoctorFormData = z.infer<typeof doctorFormSchema>;
export type TestFormData = z.infer<typeof testFormSchema>;
export type ServiceFormData = z.infer<typeof serviceFormSchema>;
export type ExpenseFormData = z.infer<typeof expenseFormSchema>;
export type CashReceiptFormData = z.infer<typeof cashReceiptFormSchema>;
export type CashReceiptTestData = z.infer<typeof cashReceiptTestSchema>;
export type ReferralAmountFormData = z.infer<typeof referralAmountFormSchema>;