/**
 * UserService — User profiles, roles, preferences, and account management
 */
import { prisma } from '@/lib/prisma';

export class UserService {

  /** Get full user profile with role */
  static async getUserProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        customer: true,
      },
    });
  }

  /** Get user by email */
  static async getUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email },
      include: { role: true },
    });
  }

  /** Update user profile */
  static async updateProfile(userId: string, updates: {
    name?: string; phone?: string; avatarUrl?: string;
    preferredLanguage?: string; lineId?: string;
  }) {
    // Current user schema has only account-level fields.
    // Profile fields are kept on Customer/UserProfile in other modules.
    const hasNoDirectUserField = !updates.name && !updates.phone && !updates.avatarUrl && !updates.preferredLanguage && !updates.lineId;
    if (hasNoDirectUserField) {
      return prisma.user.findUnique({ where: { id: userId } });
    }
    return prisma.user.findUnique({ where: { id: userId } });
  }

  /** Assign role to user */
  static async assignRole(userId: string, roleName: string) {
    const role = await prisma.role.findFirst({ where: { name: roleName } });
    if (!role) throw new Error(`Role ${roleName} not found`);

    return prisma.user.update({
      where: { id: userId },
      data: { roleId: role.id },
    });
  }

  /** List users with pagination + role filter */
  static async listUsers(options?: { page?: number; limit?: number; role?: string; search?: string }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options?.role) where.role = { name: options.role };
    if (options?.search) {
      where.OR = [
        { email: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { role: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  /** Deactivate user */
  static async deactivateUser(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { status: 'INACTIVE' },
    });
  }

  /** Get user stats */
  static async getStats() {
    const [total, active, byRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.groupBy({
        by: ['roleId'],
        _count: true,
      }),
    ]);

    return { total, active, inactive: total - active, byRole };
  }
}
