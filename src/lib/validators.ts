import { z } from 'zod';

// ============================================================
// SHARED PRIMITIVES
// ============================================================

export const emailSchema = z.string().email('กรุณากรอกอีเมลที่ถูกต้อง');
export const passwordSchema = z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร').max(128);
export const phoneSchema = z.string().regex(/^(\+66|0)[0-9]{8,9}$/, 'เบอร์โทรไม่ถูกต้อง').optional();
export const nameSchema = z.string().min(1, 'กรุณากรอกชื่อ').max(200).trim();
export const idParamSchema = z.string().min(1).max(100);
export const dateSchema = z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/));
export const positiveIntSchema = z.number().int().positive();
export const nonNegativeSchema = z.number().nonnegative();

// ============================================================
// AUTH
// ============================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'รหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});

// ============================================================
// BOOKING
// ============================================================

export const travelerSchema = z.object({
  titleTh: z.enum(['นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง', 'Mr', 'Mrs', 'Ms', 'Master', 'Miss']),
  firstNameTh: nameSchema,
  lastNameTh: nameSchema,
  firstNameEn: nameSchema,
  lastNameEn: nameSchema,
  passportNumber: z.string().max(20).optional(),
  passportExpiry: dateSchema.optional(),
  dateOfBirth: dateSchema.optional(),
  nationality: z.string().max(50).optional(),
  specialRequests: z.string().max(500).optional(),
});

export const createBookingSchema = z.object({
  tourId: idParamSchema,
  departureId: idParamSchema,
  travelers: z.array(travelerSchema).min(1, 'ต้องมีผู้เดินทางอย่างน้อย 1 คน').max(50),
  contactEmail: emailSchema,
  contactPhone: phoneSchema,
  specialRequests: z.string().max(1000).optional(),
});

export const bookingStatusSchema = z.enum([
  'PENDING', 'CONFIRMED', 'PAID', 'CANCELLED', 'COMPLETED', 'REFUNDED',
]);

// ============================================================
// PAYMENT
// ============================================================

export const createPaymentSchema = z.object({
  bookingId: idParamSchema,
  amount: z.number().positive('จำนวนเงินต้องมากกว่า 0'),
  currency: z.enum(['THB', 'USD']).default('THB'),
  method: z.enum(['STRIPE', 'BANK_TRANSFER', 'PROMPTPAY', 'CREDIT_CARD']),
});

// ============================================================
// LEAD / CRM
// ============================================================

export const createLeadSchema = z.object({
  customerName: nameSchema,
  email: emailSchema.optional(),
  phone: phoneSchema,
  source: z.enum(['WEBSITE', 'LINE', 'PHONE', 'WALK_IN', 'REFERRAL', 'AI_CHAT']).default('WEBSITE'),
  tourId: idParamSchema.optional(),
  notes: z.string().max(2000).optional(),
});

export const updateLeadSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']).optional(),
  assignedTo: idParamSchema.optional(),
  notes: z.string().max(2000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});

// ============================================================
// CONTACT FORM
// ============================================================

export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string().min(1).max(200),
  message: z.string().min(10, 'ข้อความต้องมีอย่างน้อย 10 ตัวอักษร').max(5000),
});

// ============================================================
// FIT REQUEST
// ============================================================

export const fitRequestSchema = z.object({
  destination: z.string().min(1).max(200),
  startDate: dateSchema,
  endDate: dateSchema,
  adults: positiveIntSchema,
  children: nonNegativeSchema.default(0),
  infants: nonNegativeSchema.default(0),
  budget: z.string().max(100).optional(),
  hotelLevel: z.enum(['3_STAR', '4_STAR', '5_STAR', 'BOUTIQUE']).optional(),
  specialRequests: z.string().max(2000).optional(),
  contactEmail: emailSchema,
  contactPhone: phoneSchema,
});

// ============================================================
// QUOTATION
// ============================================================

export const createQuotationSchema = z.object({
  customerId: idParamSchema,
  tourId: idParamSchema.optional(),
  validUntil: dateSchema,
  items: z.array(z.object({
    description: z.string().min(1).max(500),
    quantity: positiveIntSchema,
    unitPrice: z.number().positive(),
  })).min(1),
  notes: z.string().max(2000).optional(),
});

// ============================================================
// ADMIN
// ============================================================

export const inviteUserSchema = z.object({
  email: emailSchema,
  role: z.enum(['ADMIN', 'SALE_MANAGER', 'SALE_STAFF', 'OPERATION', 'FINANCE', 'CONTENT_MANAGER']),
  name: nameSchema,
});

export const updateSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(10000),
});

// ============================================================
// SEARCH
// ============================================================

export const searchQuerySchema = z.object({
  q: z.string().max(500).optional(),
  destination: z.string().max(200).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  minPrice: nonNegativeSchema.optional(),
  maxPrice: nonNegativeSchema.optional(),
  supplier: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================================
// UTILITY: Safe parse helper
// ============================================================

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errorMessages = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  return { success: false, error: errorMessages };
}
