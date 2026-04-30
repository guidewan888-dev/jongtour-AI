const fs = require('fs');
const header = fs.readFileSync('src/components/layouts/Header.tsx', 'utf8');
const sidebar = fs.readFileSync('src/app/destinations/[[...slug]]/page.tsx', 'utf8');

const getLinks = (str) => {
  const matches = str.match(/href="\/destinations\/([^"]+)"/g) || [];
  return [...new Set(matches.map(m => m.replace('href="/destinations/', '').slice(0, -1)))];
};

const hLinks = getLinks(header);
const sLinks = getLinks(sidebar);

console.log('Header only:');
console.log(hLinks.filter(l => !sLinks.includes(l)));

console.log('Sidebar only:');
console.log(sLinks.filter(l => !hLinks.includes(l)));
