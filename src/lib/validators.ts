import { z } from 'zod';

// ============================================================
// SHARED PRIMITIVES
// ============================================================

export const emailSchema = z.string().email('เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธญเธตเน€เธกเธฅเธ—เธตเนเธ–เธนเธเธ•เนเธญเธ');
export const passwordSchema = z.string().min(8, 'เธฃเธซเธฑเธชเธเนเธฒเธเธ•เนเธญเธเธกเธตเธญเธขเนเธฒเธเธเนเธญเธข 8 เธ•เธฑเธงเธญเธฑเธเธฉเธฃ').max(128);
export const phoneSchema = z.string().regex(/^(\+66|0)[0-9]{8,9}$/, 'เน€เธเธญเธฃเนเนเธ—เธฃเนเธกเนเธ–เธนเธเธ•เนเธญเธ').optional();
export const nameSchema = z.string().min(1, 'เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธเธทเนเธญ').max(200).trim();
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
  message: 'เธฃเธซเธฑเธชเธเนเธฒเธเนเธกเนเธ•เธฃเธเธเธฑเธ',
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
  titleTh: z.enum(['เธเธฒเธข', 'เธเธฒเธ', 'เธเธฒเธเธชเธฒเธง', 'เน€เธ”เนเธเธเธฒเธข', 'เน€เธ”เนเธเธซเธเธดเธ', 'Mr', 'Mrs', 'Ms', 'Master', 'Miss', 'Mr.', 'Mrs.', 'Ms.', 'Miss.']),
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
  wholesaleId: idParamSchema.optional(),
  periodId: idParamSchema.optional(),
  selectedDate: z.string().optional(),
  travelDate: z.string().optional(),
  travelers: z.array(travelerSchema).min(1, 'เธ•เนเธญเธเธกเธตเธเธนเนเน€เธ”เธดเธเธ—เธฒเธเธญเธขเนเธฒเธเธเนเธญเธข 1 เธเธ').max(50),
  contactEmail: emailSchema,
  contactPhone: phoneSchema,
  specialRequests: z.string().max(1000).optional(),
  paymentType: z.enum(['LATER', 'DEPOSIT', 'FULL']).optional(),
  amountToPay: z.number().nonnegative().optional(),
  adultCount: z.number().int().min(0).optional(),
  childWithBedCount: z.number().int().min(0).optional(),
  childWithoutBedCount: z.number().int().min(0).optional(),
  infantCount: z.number().int().min(0).optional(),
  singleRoomCount: z.number().int().min(0).optional(),
  wantsSingleRoom: z.boolean().optional(),
  pdfFileId: idParamSchema.optional(),
  pdfUrl: z.string().url().optional(),
  pricingMeta: z.object({
    adultCount: z.number().int().min(0).optional(),
    childWithBedCount: z.number().int().min(0).optional(),
    childWithoutBedCount: z.number().int().min(0).optional(),
    infantCount: z.number().int().min(0).optional(),
    singleRoomCount: z.number().int().min(0).optional(),
  }).optional(),
});

export const bookingStatusSchema = z.enum([
  'PENDING', 'CONFIRMED', 'PAID', 'CANCELLED', 'COMPLETED', 'REFUNDED',
]);

// ============================================================
// PAYMENT
// ============================================================

export const createPaymentSchema = z.object({
  bookingId: idParamSchema,
  amount: z.number().positive('เธเธณเธเธงเธเน€เธเธดเธเธ•เนเธญเธเธกเธฒเธเธเธงเนเธฒ 0'),
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
  message: z.string().min(10, 'เธเนเธญเธเธงเธฒเธกเธ•เนเธญเธเธกเธตเธญเธขเนเธฒเธเธเนเธญเธข 10 เธ•เธฑเธงเธญเธฑเธเธฉเธฃ').max(5000),
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
  const errorMessages = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
  return { success: false, error: errorMessages };
}



