import { RawDeparture, RawTour } from './SupplierAdapter';

export class Normalizer {
  /**
   * Maps raw tour data into Jongtour's Tour schema format
   */
  static mapTour(supplierId: string, rawData: RawTour) {
    // In a real implementation, we would extract fields dynamically 
    // based on the supplierId or let the Adapter normalize it partially.
    // For MVP, we provide a generic mapping structure.
    
    return {
      supplierId,
      providerId: rawData.externalId, // Using providerId as externalTourId based on existing Prisma schema
      title: rawData.name,
      // Default extraction (Adapter specific logic should refine this)
      destination: rawData.payload?.destination || 'Unknown',
      durationDays: rawData.payload?.days || 1,
      price: rawData.payload?.min_price || rawData.payload?.price || 0,
      imageUrl: rawData.payload?.image || null,
      description: rawData.payload?.description || null,
      airlineCode: rawData.payload?.airline || null,
      pdfUrl: rawData.payload?.pdf || null,
    };
  }

  /**
   * Maps raw departure data into Jongtour's TourDeparture schema format
   */
  static mapDeparture(tourId: string, rawData: RawDeparture) {
    return {
      tourId,
      startDate: new Date(rawData.startDate),
      endDate: new Date(rawData.endDate),
      price: rawData.price,
      childPrice: rawData.payload?.child_price || null,
      singleRoomPrice: rawData.payload?.single_room_price || null,
      availableSeats: rawData.availableSeats,
      totalSeats: rawData.totalSeats,
      // B2B specific
      netPrice: rawData.payload?.net_price || null,
    };
  }
}
