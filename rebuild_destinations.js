const fs = require('fs');

const fileContent = fs.readFileSync('src/lib/destinations.ts', 'utf8');
const objMatch = fileContent.match(/export const destinationConfig: Record<string, DestinationNode> = ({[\s\S]*?});\n\n\/\*\*/);

let configStr = objMatch[1];
const script = new (require('vm').Script)(`const config = ${configStr}; config;`);
const config = script.runInNewContext({});

// Function to safely add a node
const addNode = (path, name, keywords, coverImage = "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000") => {
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

// Add missing Japan
addNode(['asia', 'japan', 'kyoto'], 'เกียวโต', ['เกียวโต', 'Kyoto']);

// Add missing China
const chinaNodes = [
  ['zhangjiajie', 'จางเจียเจี้ย', ['จางเจียเจี้ย', 'Zhangjiajie']],
  ['kunming', 'คุนหมิง', ['คุนหมิง', 'Kunming']],
  ['guilin', 'กุ้ยหลิน', ['กุ้ยหลิน', 'Guilin']],
  ['xian', 'ซีอาน', ['ซีอาน', 'Xian']],
  ['silk-road', 'เส้นทางสายไหม', ['เส้นทางสายไหม', 'Silk Road']],
  ['xinjiang', 'ซินเจียง', ['ซินเจียง', 'Xinjiang']],
  ['tibet', 'ทิเบต', ['ทิเบต', 'Tibet']],
  ['lijiang', 'ลี่เจียง', ['ลี่เจียง', 'Lijiang']],
  ['yichang', 'อี้ชาง', ['อี้ชาง', 'Yichang']],
  ['hangzhou', 'หังโจว', ['หังโจว', 'Hangzhou']],
  ['dali', 'ต้าหลี่', ['ต้าหลี่', 'Dali']],
  ['luoyang', 'ลั่วหยาง', ['ลั่วหยาง', 'Luoyang']],
  ['wangxian', 'หุบเขาเทวดา', ['หุบเขาเทวดา', 'Wangxian']],
  ['enshi', 'เอินซือ', ['เอินซือ', 'Enshi']],
  ['qingdao', 'ชิงเต่า', ['ชิงเต่า', 'Qingdao']],
  ['dalian', 'ต้าเหลียน', ['ต้าเหลียน', 'Dalian']],
  ['inner-mongolia', 'มองโกเลีย', ['มองโกเลีย', 'Inner Mongolia']],
  ['no-shopping', 'ทัวร์ไม่ลงร้าน', ['ไม่ลงร้าน', 'No Shopping']],
  ['chongqing-zhangjiajie', 'ฉงชิ่ง-จางเจียเจี้ย', ['ฉงชิ่ง', 'จางเจียเจี้ย']],
  ['shanghai-beijing', 'เซี่ยงไฮ้-ปักกิ่ง', ['เซี่ยงไฮ้', 'ปักกิ่ง']],
  ['zhuhai-macau', 'จู่ไห่-มาเก๊า', ['จู่ไห่', 'มาเก๊า']],
  ['guangzhou-macau', 'กวางโจว-มาเก๊า', ['กวางโจว', 'มาเก๊า']],
  ['guangzhou-hongkong', 'กวางโจว-ฮ่องกง', ['กวางโจว', 'ฮ่องกง']],
];

for(const c of chinaNodes) {
    addNode(['asia', 'china', c[0]], c[1], c[2]);
}

// Convert back to JSON with nice formatting
const newConfigStr = JSON.stringify(config, null, 2);

const newFileContent = `export interface DestinationNode {
  name: string; // ชื่อภาษาไทย
  keywords: string[]; // คำค้นหาในฐานข้อมูล (จะเอาไป match กับ destination และ title)
  coverImage: string; // รูปหน้าปก
  children?: Record<string, DestinationNode>; // สถานที่ย่อย
}

export const destinationConfig: Record<string, DestinationNode> = ${newConfigStr};

/**
 * ฟังก์ชันช่วยค้นหา Node ตามเส้นทาง Slug เช่น ['asia', 'japan', 'hokkaido']
 */
export function getDestinationData(slug: string[]): { node: DestinationNode | null, breadcrumbs: { name: string, url: string }[] } {
  let currentObj: Record<string, DestinationNode> | undefined = destinationConfig;
  let currentNode: DestinationNode | null = null;
  let breadcrumbs: { name: string, url: string }[] = [{ name: "หน้าหลัก", url: "/" }];
  let currentUrl = "/destinations";

  for (let i = 0; i < slug.length; i++) {
    const key = slug[i];
    if (currentObj && currentObj[key]) {
      currentNode = currentObj[key];
      currentUrl += \`/\${key}\`;
      breadcrumbs.push({ name: currentNode.name, url: currentUrl });
      currentObj = currentNode.children;
    } else {
      // ถ้าไม่เจอ slug นี้
      return { node: null, breadcrumbs };
    }
  }

  return { node: currentNode, breadcrumbs };
}
`;

fs.writeFileSync('src/lib/destinations.ts', newFileContent);
console.log('Successfully rebuilt destinations.ts');
