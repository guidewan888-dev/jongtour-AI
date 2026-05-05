import { Prisma } from '@prisma/client';

/**
 * STRICT REAL DATA FILTER
 * Applied to every public-facing Prisma query that fetches Tours.
 * Ensures NO mock, fake, demo, or unpublished tours leak into the UI.
 */
export const realDataOnlyFilter: Prisma.TourWhereInput = {
  status: { in: ['PUBLISHED', 'ACTIVE'] },
  supplierId: { not: '' },
  isMock: false,
  isDemo: false,
  isVisible: true,
  excludedFromSearch: false,
  sourceType: { notIn: ['MOCK', 'DEMO', 'TEST', 'SEED', 'FAKE'] },
};

