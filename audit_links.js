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
let mockDataIssues = [];
let todoIssues = [];

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Find broken links
    if (content.includes('href="#"') || content.includes('href=""') || content.includes('javascript:void(0)')) {
        hrefIssues.push(file.replace(/\\/g, '/').replace('src/', ''));
    }
    
    // Find mock data
    if (content.toLowerCase().includes('mock') && !file.includes('mock')) {
        mockDataIssues.push(file.replace(/\\/g, '/').replace('src/', ''));
    }
    
    // Find TODOs
    if (content.includes('TODO')) {
        todoIssues.push(file.replace(/\\/g, '/').replace('src/', ''));
    }
});

console.log(JSON.stringify({
    hrefIssues: [...new Set(hrefIssues)],
    mockDataIssues: [...new Set(mockDataIssues)],
    todoIssues: [...new Set(todoIssues)],
    totalFilesScanned: files.length
}, null, 2));
