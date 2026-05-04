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
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');
let hrefIssues = [];

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('href="#"') || content.includes('href=""') || content.includes('javascript:void(0)')) {
        hrefIssues.push(file.replace(/\\/g, '/').replace('src/', ''));
    }
});

console.log(JSON.stringify({ hrefIssues }, null, 2));
