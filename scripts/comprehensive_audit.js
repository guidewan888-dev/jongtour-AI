const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');
const APP_DIR = path.join(SRC_DIR, 'app');

function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, filesList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      filesList.push(filePath);
    }
  }
  return filesList;
}

const allTsxFiles = getFiles(SRC_DIR);
const internalLinks = new Set();
const fileLinkMap = {};

// Regex to find href="/some-path" or href={`/some-path`} or href={'/some-path'}
const hrefRegex = /href=["'{](`?\/[^"'{]+)[\"'}]/g;

allTsxFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    let link = match[1];
    if (link.startsWith('`')) link = link.slice(1);
    
    // Ignore external links and fragments
    if (!link.startsWith('http') && link.startsWith('/')) {
      // remove dynamic interpolations like ${id} for static checking
      const baseLink = link.split('?')[0].split('#')[0];
      internalLinks.add(baseLink);
      if (!fileLinkMap[file]) fileLinkMap[file] = [];
      fileLinkMap[file].push(baseLink);
    }
  }
});

function getAppRoutes(dir, basePath = '', routes = new Set()) {
  if (!fs.existsSync(dir)) return routes;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      // Route groups like (b2c) shouldn't be part of the actual URL path
      let nextBasePath = basePath;
      if (!file.startsWith('(') && !file.endsWith(')')) {
          nextBasePath = basePath + '/' + file;
      }
      getAppRoutes(filePath, nextBasePath, routes);
    } else if (file === 'page.tsx') {
      routes.add(basePath === '' ? '/' : basePath);
    }
  }
  return routes;
}

const appRoutes = getAppRoutes(APP_DIR);

const brokenLinks = [];
const dynamicRoutes = [];

// Convert sets to arrays for easier manipulation
const appRoutesArr = Array.from(appRoutes);

for (let link of internalLinks) {
  if (link === '/') continue;

  let isMatch = false;
  
  // Exact match
  if (appRoutes.has(link)) {
    isMatch = true;
  } else {
    // Dynamic match checking
    const linkParts = link.split('/').filter(Boolean);
    
    for (const route of appRoutesArr) {
      if (route === '/') continue;
      
      const routeParts = route.split('/').filter(Boolean);
      
      if (linkParts.length === routeParts.length) {
        let matchParts = true;
        for (let i = 0; i < routeParts.length; i++) {
          if (routeParts[i].startsWith('[') && routeParts[i].endsWith(']')) {
             // It's a dynamic parameter, so we consider it a match
             continue;
          } else if (routeParts[i].startsWith('${')) {
             // TS template literal param
             continue;
          } else if (routeParts[i] !== linkParts[i]) {
            matchParts = false;
            break;
          }
        }
        if (matchParts) {
          isMatch = true;
          break;
        }
      }
    }
  }
  
  if (!isMatch) {
    brokenLinks.push(link);
  }
}

console.log('--- LINK AUDIT REPORT ---');
console.log(`Total TSX/TS files scanned: ${allTsxFiles.length}`);
console.log(`Total unique internal links found: ${internalLinks.size}`);
console.log(`Total physical page routes found: ${appRoutes.size}`);
console.log(`\nPotential Broken Links (${brokenLinks.length}):`);

brokenLinks.forEach(bl => {
  console.log(`- ${bl}`);
  // Find which files reference this broken link
  for (const [file, links] of Object.entries(fileLinkMap)) {
    if (links.includes(bl)) {
      console.log(`   └─ File: ${file.replace(SRC_DIR, 'src')}`);
    }
  }
});

// Create Route Map file
fs.writeFileSync(path.join(__dirname, '../route_map.txt'), Array.from(appRoutes).sort().join('\n'));
console.log('\nGenerated Route Map: route_map.txt');
