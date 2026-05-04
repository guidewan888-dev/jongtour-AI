import fs from 'fs';
import path from 'path';

function replaceInFile(filePath: string) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    // Fix query
    if (content.includes('supplier:suppliers(name)')) {
      content = content.replace(/supplier:suppliers\(name\)/g, 'supplier:suppliers(displayName)');
      changed = true;
    }
    
    // Fix mapping
    if (content.includes('supplier: t.supplier?.name')) {
      content = content.replace(/supplier: t\.supplier\?\.name/g, 'supplier: t.supplier?.displayName');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated ${filePath}`);
    }
  } catch (err) {
    console.error(`Failed to read/write ${filePath}`, err);
  }
}

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

const targetDir = path.join(process.cwd(), 'src/app');
walkDir(targetDir);
console.log('Done replacing supplier name.');
