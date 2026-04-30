const fs = require('fs');
let code = fs.readFileSync('src/lib/destinations.ts', 'utf8');

const regexMatch = code.match(/export const destinationConfig: Record<string, DestinationNode> = ({[\s\S]*?});\n\n\/\*\*/);
let configStr = regexMatch[1];
const script = new (require('vm').Script)(`const config = ${configStr}; config;`);
const config = script.runInNewContext({});

const addNode = (path, name, keywords, coverImage = 'https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000') => {
    let current = config;
    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (!current[key]) {
            current[key] = { name: key, keywords: [], coverImage };
        }
        if (!current[key].children) {
            current[key].children = {};
        }
        current = current[key].children;
    }
    const lastKey = path[path.length - 1];
    if (!current[lastKey]) {
        current[lastKey] = { name, keywords, coverImage };
    }
};

addNode(['africa', 'morocco'], 'โมร็อกโก', ['MOROCCO', 'โมร็อกโก', 'มาร์ราเกช', 'คาซาบลังกา'], 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=2000');
addNode(['america', 'usa'], 'สหรัฐอเมริกา', ['USA', 'สหรัฐอเมริกา', 'นิวยอร์ก', 'ลอสแอนเจลิส'], 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2000');
addNode(['america', 'canada'], 'แคนาดา', ['CANADA', 'แคนาดา', 'โทรอนโต', 'แวนคูเวอร์'], 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=2000');
addNode(['oceania', 'australia'], 'ออสเตรเลีย', ['AUSTRALIA', 'ออสเตรเลีย', 'ซิดนีย์', 'เมลเบิร์น'], 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?q=80&w=2000');
addNode(['oceania', 'new-zealand'], 'นิวซีแลนด์', ['NEW ZEALAND', 'นิวซีแลนด์', 'โอ๊คแลนด์', 'ควีนส์ทาวน์'], 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?q=80&w=2000');

if(config['africa']) config['africa'].name = 'แอฟริกา';
if(config['america']) config['america'].name = 'อเมริกา';
if(config['oceania']) config['oceania'].name = 'โอเชียเนีย';

const newConfigStr = JSON.stringify(config, null, 2);
code = code.replace(regexMatch[1], newConfigStr);

fs.writeFileSync('src/lib/destinations.ts', code);
console.log('Added missing continents');
