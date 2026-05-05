import { prisma } from '@/lib/prisma';

export class SupplierService {
  /**
   * Retrieves all active wholesale suppliers
   */
  static async getActiveSuppliers() {
    return prisma.supplier.findMany({
      where: { status: 'ACTIVE' },
      include: {
        apiCredentials: true
      }
    });
  }

  /**
   * Tests connection to the supplier's API endpoint securely
   */
  static async testConnection(supplierId: string): Promise<boolean> {
    const creds = await prisma.supplierApiCredential.findUnique({
      where: { supplierId }
    });

    if (!creds || !creds.apiBaseUrl) {
      return false;
    }

    try {
      // Execute a lightweight ping to the supplier API
      const response = await fetch(`${creds.apiBaseUrl}/ping`, {
        headers: creds.encryptedApiKey ? {
          'Authorization': `Bearer ${creds.encryptedApiKey}`
        } : undefined
      });
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}
