const fs = require('fs');
let c = fs.readFileSync('src/app/destinations/[[...slug]]/page.tsx', 'utf8');
c = c.replace(/href="\/search\//g, 'href="/destinations/');
fs.writeFileSync('src/app/destinations/[[...slug]]/page.tsx', c);
console.log('Replaced');
