import fs from 'fs';
import path from 'path';

/**
 * Link Checker Configuration
 */
const CONFIG = {
  baseUrl: process.argv[2] || 'https://jongtour.com',
  maxDepth: 3,
  concurrency: 5,
  retryLimit: 3,
  retryDelayMs: 1000,
  ignoreList: [
    '/api/',
    '/auth/',
    'mailto:',
    'tel:',
    'whatsapp:',
    'line:',
    'facebook.com',
    'twitter.com',
    'instagram.com'
  ]
};

// State
const visitedUrls = new Set();
const queuedUrls = new Map(); // url -> depth
const auditItems = [];
const summary = {
  total_pages_crawled: 0,
  total_links_checked: 0,
  ok: 0,
  broken: 0,
  redirects: 0,
  critical: 0,
  manual_review: 0
};

/**
 * Utility: Wait
 */
const delay = (ms) => new Promise(res => setTimeout(res, ms));

/**
 * Utility: Normalize URL
 */
function normalizeUrl(href, sourceUrl) {
  if (!href || href === 'undefined' || href === 'null' || href === '#' || href === 'javascript:void(0)') {
    return { url: null, issue: 'INVALID_FORMAT' };
  }
  
  try {
    const urlObj = new URL(href, sourceUrl);
    // Remove hash
    urlObj.hash = '';
    return { url: urlObj.toString(), issue: null };
  } catch (e) {
    return { url: null, issue: 'MALFORMED_URL' };
  }
}

/**
 * Utility: Determine Link Type
 */
function getLinkType(url, isImage, isCanonical) {
  if (isCanonical) return 'canonical';
  if (isImage || url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
  if (url.match(/\.pdf$/i)) return 'pdf';
  if (url.includes('/checkout/') || url.includes('/booking/')) return 'booking';
  if (url.includes('/api/')) return 'api';
  if (url.startsWith(CONFIG.baseUrl)) return 'internal';
  return 'external';
}

/**
 * Check a specific URL for its status (HEAD or GET)
 */
async function checkUrlStatus(targetUrl, sourceUrl, linkType) {
  summary.total_links_checked++;

  // Ignore list check
  if (CONFIG.ignoreList.some(ignore => targetUrl.includes(ignore))) {
    return { statusCode: 0, finalUrl: targetUrl, issue: 'IGNORED', severity: 'LOW' };
  }

  let attempt = 0;
  let lastError = null;

  while (attempt < CONFIG.retryLimit) {
    try {
      // Use HEAD for standard links, GET for pages we need to crawl
      const method = (linkType === 'internal' && !targetUrl.includes('.')) ? 'GET' : 'HEAD';
      
      const response = await fetch(targetUrl, {
        method,
        headers: { 'User-Agent': 'Jongtour-Link-Checker/1.0' },
        redirect: 'manual' // Handle redirects manually to track chains
      });

      const statusCode = response.status;
      let finalUrl = targetUrl;
      let issueType = statusCode >= 400 ? 'HTTP_ERROR' : 'OK';
      let severity = statusCode >= 400 ? 'HIGH' : 'LOW';

      // Handle Redirects
      if (statusCode >= 300 && statusCode < 400) {
        summary.redirects++;
        finalUrl = response.headers.get('location');
        if (finalUrl && !finalUrl.startsWith('http')) {
           finalUrl = new URL(finalUrl, targetUrl).toString();
        }
        issueType = 'REDIRECT';
        severity = 'MEDIUM';

        // Check Redirect Loop
        if (finalUrl === targetUrl) {
           issueType = 'REDIRECT_LOOP';
           severity = 'CRITICAL';
        }
      }

      if (statusCode === 404) severity = 'CRITICAL';
      if (statusCode >= 500) severity = 'CRITICAL';

      // If it's a valid internal page we fetched via GET, return the HTML so we can parse it
      let html = null;
      if (method === 'GET' && statusCode === 200 && response.headers.get('content-type')?.includes('text/html')) {
        html = await response.text();
      }

      return { statusCode, finalUrl, issue: issueType, severity, html };

    } catch (error) {
      lastError = error;
      attempt++;
      await delay(CONFIG.retryDelayMs);
    }
  }

  // If we reach here, it failed completely
  summary.broken++;
  return { statusCode: 0, finalUrl: targetUrl, issue: 'NETWORK_ERROR', severity: 'HIGH' };
}

/**
 * Parse HTML and extract links using Regex
 */
function extractLinks(html, sourceUrl) {
  const links = [];
  
  // Extract <a> tags
  const aRegex = /<a[^>]+href=["']([^"']+)["']/gi;
  let match;
  while ((match = aRegex.exec(html)) !== null) {
    links.push({ href: match[1], isImage: false, isCanonical: false });
  }

  // Extract <img> tags
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  while ((match = imgRegex.exec(html)) !== null) {
    links.push({ href: match[1], isImage: true, isCanonical: false });
  }

  // Extract canonical
  const canRegex = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/gi;
  while ((match = canRegex.exec(html)) !== null) {
    links.push({ href: match[1], isImage: false, isCanonical: true });
  }

  // Extract OG Image
  const ogRegex = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi;
  while ((match = ogRegex.exec(html)) !== null) {
    links.push({ href: match[1], isImage: true, isCanonical: false });
  }

  return links;
}

/**
 * Process a single page
 */
async function crawlPage(url, depth) {
  if (visitedUrls.has(url)) return;
  visitedUrls.add(url);

  console.log(`[Crawling Depth ${depth}] ${url}`);
  summary.total_pages_crawled++;

  const { statusCode, html, issue, finalUrl } = await checkUrlStatus(url, url, 'internal');

  if (issue && issue !== 'OK') {
    auditItems.push({
      source_page: 'ROOT',
      link_text: 'Entry Point',
      url: url,
      link_type: 'internal',
      status_code: statusCode,
      final_url: finalUrl,
      issue_type: issue,
      severity: issue === 'REDIRECT' ? 'MEDIUM' : 'CRITICAL',
      suggested_fix: 'Check server configuration'
    });
    return;
  }

  if (!html) return;

  const rawLinks = extractLinks(html, url);
  
  for (const raw of rawLinks) {
    const { url: targetUrl, issue: formatIssue } = normalizeUrl(raw.href, url);
    
    let linkType = getLinkType(targetUrl || raw.href, raw.isImage, raw.isCanonical);

    if (formatIssue) {
      summary.broken++;
      summary.critical++;
      auditItems.push({
        source_page: url,
        link_text: raw.href,
        url: raw.href,
        link_type: linkType,
        status_code: 0,
        final_url: '',
        issue_type: formatIssue,
        severity: 'CRITICAL',
        suggested_fix: 'Replace with valid absolute or relative URL'
      });
      continue;
    }

    // Standard Validation
    const statusResult = await checkUrlStatus(targetUrl, url, linkType);

    if (statusResult.issue === 'OK' || statusResult.issue === 'IGNORED') {
      summary.ok++;
    } else {
      if (statusResult.severity === 'CRITICAL') summary.critical++;
      if (statusResult.issue === 'REDIRECT') summary.redirects++;
      else summary.broken++;

      auditItems.push({
        source_page: url,
        link_text: raw.href,
        url: targetUrl,
        link_type: linkType,
        status_code: statusResult.statusCode,
        final_url: statusResult.finalUrl,
        issue_type: statusResult.issue,
        severity: statusResult.severity,
        suggested_fix: statusResult.issue === 'REDIRECT' ? `Update link to directly point to ${statusResult.finalUrl}` : 'Verify target existence'
      });
    }

    // Queue for crawling if internal and within depth
    if (linkType === 'internal' && depth < CONFIG.maxDepth && !visitedUrls.has(targetUrl)) {
      if (!queuedUrls.has(targetUrl)) {
        queuedUrls.set(targetUrl, depth + 1);
      }
    }
  }
}

/**
 * Main Execution
 */
async function run() {
  console.log('=============================================');
  console.log(`🚀 Starting Link Checker for: ${CONFIG.baseUrl}`);
  console.log(`⚙️  Max Depth: ${CONFIG.maxDepth} | Concurrency: ${CONFIG.concurrency}`);
  console.log('=============================================\n');

  // Start with root
  queuedUrls.set(CONFIG.baseUrl, 0);

  // Process Queue with basic concurrency
  while (queuedUrls.size > 0) {
    const batch = Array.from(queuedUrls.entries()).slice(0, CONFIG.concurrency);
    for (const [url] of batch) queuedUrls.delete(url);

    await Promise.all(batch.map(([url, depth]) => crawlPage(url, depth)));
  }

  // Export Report
  const report = {
    summary,
    items: auditItems
  };

  const outputDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // JSON
  fs.writeFileSync(path.join(outputDir, `link_audit_${timestamp}.json`), JSON.stringify(report, null, 2));

  // CSV
  let csv = 'Source Page,Target URL,Link Type,Status Code,Issue Type,Severity,Suggested Fix\n';
  auditItems.forEach(item => {
    csv += `"${item.source_page}","${item.url}","${item.link_type}","${item.status_code}","${item.issue_type}","${item.severity}","${item.suggested_fix}"\n`;
  });
  fs.writeFileSync(path.join(outputDir, `link_audit_${timestamp}.csv`), csv);

  console.log('\n=============================================');
  console.log('✅ Link Check Complete!');
  console.log(`📊 Pages Crawled: ${summary.total_pages_crawled}`);
  console.log(`🔗 Links Checked: ${summary.total_links_checked}`);
  console.log(`❌ Broken Links: ${summary.broken}`);
  console.log(`⚠️  Critical Issues: ${summary.critical}`);
  console.log(`↪️  Redirects Found: ${summary.redirects}`);
  console.log(`\n📁 Reports saved to ./reports/ directory.`);
  console.log('=============================================');
}

run().catch(console.error);
