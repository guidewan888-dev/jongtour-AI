const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('.next')) {
                results = results.concat(walk(file));
            }
        } else { 
            if (file.endsWith('page.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src/app');
let placeholderPages = [];

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('Coming Soon') || content.includes('อยู่ระหว่างการพัฒนา') || content.includes('Placeholder')) {
        placeholderPages.push(file.replace(/\\/g, '/').replace('src/app/', ''));
    }
});

console.log(JSON.stringify(placeholderPages, null, 2));
