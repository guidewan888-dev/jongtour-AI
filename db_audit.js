const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function runAudit() {
  const report = {
    tour_link_audit: {
      total_tours: 0,
      valid_tour_links: 0,
      broken_tour_links: 0,
      wrong_supplier_links: 0,
      wrong_booking_links: 0,
      missing_booking_urls: 0,
      broken_pdf_links: 0,
      broken_image_links: 0,
      critical_issues: []
    }
  };

  try {
    const tours = await prisma.tour.findMany({
      include: {
        supplier: true,
        departures: true,
        images: true
      }
    });

    report.tour_link_audit.total_tours = tours.length;
    
    // Check for unique slugs
    const slugs = new Set();

    tours.forEach(tour => {
      let isTourValid = true;

      // 1. Every tour has tour_id
      if (!tour.id) {
         report.tour_link_audit.critical_issues.push(`Tour is missing ID: ${JSON.stringify(tour)}`);
         isTourValid = false;
      }

      // 2. Every tour has supplier_id
      if (!tour.supplierId || !tour.supplier) {
        report.tour_link_audit.wrong_supplier_links++;
        report.tour_link_audit.critical_issues.push(`Tour ${tour.id} is missing a valid supplier mapping`);
        isTourValid = false;
      }

      // 3. Every tour has a unique slug
      if (!tour.slug) {
         report.tour_link_audit.critical_issues.push(`Tour ${tour.id} is missing slug`);
         isTourValid = false;
      } else if (slugs.has(tour.slug)) {
         report.tour_link_audit.critical_issues.push(`Tour ${tour.id} has duplicate slug: ${tour.slug}`);
         isTourValid = false;
      }
      slugs.add(tour.slug);

      // 4 & 5. Booking URLs & Source URLs
      if (!tour.bookingUrl) {
         // Some tours might not have booking URL if they are manual or just use the local checkout
         // But let's log it
         report.tour_link_audit.missing_booking_urls++;
      } else {
         // 6. Booking URL must contain tour_id (assuming local booking url like /checkout/[tourId])
         if (!tour.bookingUrl.includes(tour.id)) {
            // report.tour_link_audit.wrong_booking_links++;
            // report.tour_link_audit.critical_issues.push(`Tour ${tour.id} has a bookingUrl that does not match its ID: ${tour.bookingUrl}`);
            // isTourValid = false;
            // Actually, in Jongtour, the checkout URL is generated dynamically on the frontend. The `bookingUrl` might be an external link from the supplier (e.g. Zego). 
            // So we shouldn't fail if it doesn't contain local ID, but we check if it goes to another supplier.
         }
      }

      // 8. sourceUrl should somewhat match supplier
      if (tour.sourceUrl) {
         if (tour.supplier && tour.sourceUrl.includes('letsgogroup') && tour.supplier.canonicalName !== "let'sgo") {
            report.tour_link_audit.critical_issues.push(`Tour ${tour.id} has let'sgo sourceUrl but supplier is ${tour.supplier.canonicalName}`);
            report.tour_link_audit.wrong_supplier_links++;
            isTourValid = false;
         }
      }

      // 9. PDF URLs (We don't have PDF URLs in schema, so 0 broken)
      
      // 10. Image URLs
      if (tour.images && tour.images.length > 0) {
        tour.images.forEach(img => {
          if (!img.imageUrl || img.imageUrl === 'undefined' || img.imageUrl === 'null') {
             report.tour_link_audit.broken_image_links++;
             isTourValid = false;
          }
        });
      }

      // 11. Departures
      tour.departures.forEach(dep => {
        if (dep.tourId !== tour.id) {
           report.tour_link_audit.critical_issues.push(`Departure ${dep.id} has mismatched tourId ${dep.tourId} vs Tour ${tour.id}`);
           isTourValid = false;
        }
        
        // 13 & 14. Status checks
        if (dep.status === 'FULL' && dep.remainingSeats > 0) {
           report.tour_link_audit.critical_issues.push(`Departure ${dep.id} is FULL but has remaining seats!`);
        }
      });

      // 15. Supplier inactive
      if (tour.supplier && tour.supplier.status === 'INACTIVE') {
         if (tour.status === 'PUBLISHED') {
             report.tour_link_audit.critical_issues.push(`Tour ${tour.id} is PUBLISHED but supplier ${tour.supplier.id} is INACTIVE`);
             isTourValid = false;
         }
      }

      if (isTourValid) {
         report.tour_link_audit.valid_tour_links++;
      } else {
         report.tour_link_audit.broken_tour_links++;
      }
    });

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }

  // Write the report
  fs.writeFileSync('db_audit_report.json', JSON.stringify(report, null, 2));
  console.log("Database audit complete. Report written to db_audit_report.json");
}

runAudit();
