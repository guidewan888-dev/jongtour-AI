const fs = require('fs');
let code = fs.readFileSync('src/lib/destinations.ts', 'utf8');

if (!code.includes('thailand: {')) {
  const replacement = `export const destinationConfig: Record<string, DestinationNode> = {
  thailand: {
    name: "ไทย",
    keywords: ["THAILAND", "ไทย"],
    coverImage: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2000"
  },`;
  code = code.replace('export const destinationConfig: Record<string, DestinationNode> = {', replacement);
  fs.writeFileSync('src/lib/destinations.ts', code);
  console.log('Added Thailand');
}
