const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const IS_FIX_MODE = process.argv.includes('--fix');

const report = [];

function addIssue(recordId, tableName, fieldName, currentValue, issue, severity, suggestedValue = null, canAutoFix = false) {
  report.push({
    record_id: recordId,
    table_name: tableName,
    field_name: fieldName,
    current_value: currentValue,
    issue,
    severity,
    suggested_value,
    can_auto_fix
  });
}

async function checkUrl(urlStr) {
  if (!urlStr) return { isValid: false, issue: 'EMPTY' };
  if (urlStr === 'undefined' || urlStr === 'null' || urlStr === '#' || urlStr.includes('javascript:void(0)')) return { isValid: false, issue: 'INVALID_FORMAT' };
  if (urlStr.includes('localhost') || urlStr.includes('staging') || urlStr.includes('test')) return { isValid: false, issue: 'DEV_URL' };
  
  try {
    const url = new URL(urlStr);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return { isValid: false, issue: 'INVALID_PROTOCOL' };
    
    // Quick head check
    try {
      const res = await fetch(urlStr, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
      if (!res.ok && res.status !== 405) { // 405 method not allowed is fine
        return { isValid: false, issue: `HTTP_${res.status}` };
      }
    } catch(e) {
      return { isValid: false, issue: 'UNREACHABLE' };
    }
  } catch (e) {
    return { isValid: false, issue: 'MALFORMED' };
  }
  
  return { isValid: true, issue: null };
}

async function runAudit() {
  console.log(`Starting Database URL Audit... Mode: ${IS_FIX_MODE ? 'AUTO-FIX' : 'DRY-RUN'}`);

  // 1. Tours
  console.log('Auditing Tours...');
  const tours = await prisma.tour.findMany({ include: { supplier: true } });
  const slugs = new Set();
  
  for (const t of tours) {
    // Check Slug Duplication
    if (slugs.has(t.slug)) {
      addIssue(t.id, 'Tour', 'slug', t.slug, 'DUPLICATE_SLUG', 'CRITICAL', `${t.slug}-${t.id.substring(0,4)}`, true);
      if (IS_FIX_MODE) {
        await prisma.tour.update({ where: { id: t.id }, data: { slug: `${t.slug}-${t.id.substring(0,4)}` } });
      }
    } else {
      slugs.add(t.slug);
    }

    // Check Source URL
    if (t.sourceUrl) {
      const check = await checkUrl(t.sourceUrl);
      if (!check.isValid) {
        addIssue(t.id, 'Tour', 'sourceUrl', t.sourceUrl, check.issue, 'HIGH', null, check.issue === 'INVALID_FORMAT');
        if (IS_FIX_MODE && check.issue === 'INVALID_FORMAT') {
          await prisma.tour.update({ where: { id: t.id }, data: { sourceUrl: null } });
        }
      } else if (t.supplier && !t.sourceUrl.includes(t.supplier.canonicalName) && !t.sourceUrl.includes(t.supplier.canonicalName.replace(/[^a-zA-Z0-9]/g, ''))) {
        addIssue(t.id, 'Tour', 'sourceUrl', t.sourceUrl, 'SUPPLIER_MISMATCH', 'MEDIUM', null, false);
      }
    }

    // Check Booking URL
    if (t.bookingUrl) {
      const check = await checkUrl(t.bookingUrl);
      if (!check.isValid) {
        addIssue(t.id, 'Tour', 'bookingUrl', t.bookingUrl, check.issue, 'HIGH', null, check.issue === 'INVALID_FORMAT');
        if (IS_FIX_MODE && check.issue === 'INVALID_FORMAT') {
          await prisma.tour.update({ where: { id: t.id }, data: { bookingUrl: null } });
        }
      } else if (!t.bookingUrl.includes(t.id)) {
        addIssue(t.id, 'Tour', 'bookingUrl', t.bookingUrl, 'TOUR_ID_MISMATCH', 'MEDIUM', null, false);
      }

      // Check Inactive Tour with active booking URL
      if (t.status !== 'PUBLISHED' && t.bookingUrl) {
        addIssue(t.id, 'Tour', 'bookingUrl', t.bookingUrl, 'INACTIVE_TOUR_HAS_BOOKING', 'HIGH', null, true);
        if (IS_FIX_MODE) {
          await prisma.tour.update({ where: { id: t.id }, data: { bookingUrl: null } });
        }
      }
    }
  }

  // 2. Tour Images
  console.log('Auditing Tour Images...');
  const images = await prisma.tourImage.findMany();
  for (const img of images) {
    if (img.imageUrl) {
      const check = await checkUrl(img.imageUrl);
      if (!check.isValid) {
        addIssue(img.id, 'TourImage', 'imageUrl', img.imageUrl, check.issue, 'MEDIUM', null, false);
      }
    }
  }

  // 3. Supplier API Credentials
  console.log('Auditing Supplier API Credentials...');
  const creds = await prisma.supplierApiCredential.findMany();
  for (const c of creds) {
    if (c.apiBaseUrl) {
      const check = await checkUrl(c.apiBaseUrl);
      if (!check.isValid) {
        addIssue(c.id, 'SupplierApiCredential', 'apiBaseUrl', c.apiBaseUrl, check.issue, 'CRITICAL', null, false);
      }
    }
  }

  // 4. Vouchers
  console.log('Auditing Vouchers...');
  const vouchers = await prisma.voucher.findMany();
  for (const v of vouchers) {
    if (v.pdfUrl) {
      const check = await checkUrl(v.pdfUrl);
      if (!check.isValid) {
        addIssue(v.id, 'Voucher', 'pdfUrl', v.pdfUrl, check.issue, 'HIGH', null, false);
      }
    }
  }

  // Export Report
  const outputDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  
  const filePath = path.join(outputDir, 'db_url_audit_report.json');
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));

  console.log('\nAudit Complete!');
  console.log(`Found ${report.length} issues.`);
  console.log(`Report saved to: ${filePath}`);

  await prisma.$disconnect();
}

runAudit().catch(e => {
  console.error(e);
  process.exit(1);
});
