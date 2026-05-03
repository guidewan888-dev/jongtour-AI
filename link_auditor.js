const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const appDir = path.join(srcDir, 'app');

let allLinks = [];
let allImages = [];
let suspiciousLinks = [];

const walkSync = (dir, callback) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filepath = path.join(dir, file);
        const stats = fs.statSync(filepath);
        if (stats.isDirectory()) {
            walkSync(filepath, callback);
        } else if (stats.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
            callback(filepath);
        }
    });
};

const extractLinksAndImages = (filepath) => {
    const content = fs.readFileSync(filepath, 'utf-8');
    
    // Simple regex to find href="..." or href={'...'} or href={...}
    const hrefRegex = /href=["']([^"']+)["']/g;
    let match;
    while ((match = hrefRegex.exec(content)) !== null) {
        let link = match[1];
        allLinks.push({ link, source: filepath });
        
        if (link.includes('localhost') || link === '#' || link.includes('javascript:') || link.includes('undefined')) {
            suspiciousLinks.push({ link, source: filepath, type: 'Suspicious URL' });
        }
    }

    const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
    while ((match = imgRegex.exec(content)) !== null) {
        allImages.push({ link: match[1], source: filepath });
    }
};

walkSync(srcDir, extractLinksAndImages);

// Function to roughly verify if a static route exists
const verifyRouteExists = (link) => {
    if (link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('tel:')) return true; // Skip external
    if (link.includes('?')) link = link.split('?')[0]; // strip query
    if (link.includes('#')) link = link.split('#')[0]; // strip hash
    if (link === '' || link === '/') return true; // root exists

    // Strip dynamic parts for static check, e.g. /tour/123 -> /tour/[id]
    // Since we can't easily map exact dynamic routes in a simple script, we'll do a basic check
    const parts = link.split('/').filter(Boolean);
    
    // Check common known roots
    const validRoots = ['destinations', 'tour', 'search', 'wholesale', 'last-minute', 'admin', 'user', 'checkout', 'login', 'auth', 'payment', 'b2b'];
    if (parts.length > 0 && !validRoots.includes(parts[0])) {
        // If not in a known root and not an asset
        if (!link.startsWith('/images') && !link.startsWith('/api')) {
             return false;
        }
    }
    return true;
};

let brokenLinks = [];
let uniqueLinks = new Set();

allLinks.forEach(({ link, source }) => {
    if (!uniqueLinks.has(link)) {
        uniqueLinks.add(link);
        if (!verifyRouteExists(link)) {
            brokenLinks.push({ link, source });
        }
    }
});

let report = `# Jongtour Link Audit Report\n\n`;
report += `## Summary\n`;
report += `- Total Links Found: ${allLinks.length}\n`;
report += `- Unique Links Evaluated: ${uniqueLinks.size}\n`;
report += `- Total Images Found: ${allImages.length}\n`;
report += `- Suspicious Links (localhost, #, undefined): ${suspiciousLinks.length}\n`;
report += `- Potentially Broken Internal Routes: ${brokenLinks.length}\n\n`;

report += `## Suspicious Links\n`;
if (suspiciousLinks.length === 0) report += `None found.\n`;
suspiciousLinks.forEach(item => {
    report += `- \`${item.link}\` (Found in: ${item.source.replace(__dirname, '')})\n`;
});
report += `\n`;

report += `## Potentially Broken Internal Routes\n`;
if (brokenLinks.length === 0) report += `None found.\n`;
brokenLinks.forEach(item => {
    report += `- \`${item.link}\` (Found in: ${item.source.replace(__dirname, '')})\n`;
});

fs.writeFileSync(path.join(__dirname, 'link_audit_report.md'), report);
console.log('Audit complete. Saved to link_audit_report.md');
