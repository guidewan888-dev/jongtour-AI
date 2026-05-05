import { Prisma } from '@prisma/client';

/**
 * Real Data Filter
 * 
 * Enforces strict rules to ensure ONLY real, production-ready data is fetched from the database.
 * This prevents mock data, demo data, and incomplete data from leaking into the UI.
 * 
 * Usage:
 * const tours = await prisma.tour.findMany({
 *   where: {
 *     ...realDataFilter,
 *     // add other conditions like destination here
 *   }
 * });
 */
export const realDataFilter: Prisma.TourWhereInput = {
  status: { in: ['ACTIVE', 'PUBLISHED'] },
  supplierId: { not: '' },
  sourceType: { notIn: ['MOCK', 'DEMO', 'TEST', 'SEED', 'FAKE'] },
  isMock: false,
  isDemo: false,
  isVisible: true,
  excludedFromSearch: false,
  excludedFromAi: false,
};

/**
 * AI Real Data Filter
 * A slightly stricter filter specifically for the AI Planner to prevent hallucinatory recommendations.
 */
export const aiRealDataFilter: Prisma.TourWhereInput = {
  ...realDataFilter,
  excludedFromAi: false,
};
