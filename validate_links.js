const fs = require('fs');

const header = fs.readFileSync('src/components/layouts/Header.tsx', 'utf8');
const sidebar = fs.readFileSync('src/app/destinations/[[...slug]]/page.tsx', 'utf8');

const getLinks = (str) => {
  const matches = str.match(/href="\/destinations\/([^"]+)"/g) || [];
  return [...new Set(matches.map(m => m.replace('href="/destinations/', '').slice(0, -1)))];
};

const allLinks = [...new Set([...getLinks(header), ...getLinks(sidebar)])];

const code = fs.readFileSync('src/lib/destinations.ts', 'utf8');
const objMatch = code.match(/export const destinationConfig: Record<string, DestinationNode> = ({[\s\S]*?});/);
if(!objMatch) {
    console.error("Could not parse destinationConfig");
    process.exit(1);
}

// Very hacky but works for this specific object literal format
let configStr = objMatch[1];
const script = new require('vm').Script(`const config = ${configStr}; config;`);
const config = script.runInNewContext({});

const getDestinationData = (slug) => {
  let currentObj = config;
  let currentNode = null;
  for (let i = 0; i < slug.length; i++) {
    const key = slug[i];
    if (currentObj && currentObj[key]) {
      currentNode = currentObj[key];
      currentObj = currentNode.children;
    } else {
      return null;
    }
  }
  return currentNode;
};

const missing = [];
for(const link of allLinks) {
  const slug = link.split('/');
  if(!getDestinationData(slug)) {
    missing.push(link);
  }
}

console.log('Missing routes causing 404:');
console.log(missing);
