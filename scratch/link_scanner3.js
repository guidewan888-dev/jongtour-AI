const fs = require('fs');
const path = require('path');

const filesToScan = [
  'src/components/layouts/Header.tsx',
  'src/app/country/[slug]/page.tsx',
  'src/app/country/[slug]/[city]/page.tsx',
  'src/app/wholesale/[slug]/page.tsx',
  'src/app/deals/flash-sale/page.tsx',
  'src/components/AgentRegistrationBadge.tsx',
  'src/components/AuthButtons.tsx'
];

let foundErrors = false;

filesToScan.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) return;
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('href="#"') || line.includes("href='#'") || line.includes('href={null}') || line.includes('href={undefined}')) {
      console.log(`[WARNING] Invalid href found in ${file}:${index + 1}`);
      console.log(`> ${line.trim()}`);
      foundErrors = true;
    }
  });
});

if (!foundErrors) {
  console.log("SUCCESS: No invalid hrefs found!");
}
