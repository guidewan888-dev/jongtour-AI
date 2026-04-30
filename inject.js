const fs = require('fs');
let code = fs.readFileSync('src/lib/destinations.ts', 'utf8');

const asiaMissing = `
          singapore: {
            name: "สิงคโปร์",
            keywords: ["SINGAPORE", "สิงคโปร์"],
            coverImage: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2000"
          },
          'south-korea': { name: 'เกาหลีใต้', keywords: ['KOREA', 'เกาหลี', 'โซล', 'ปูซาน', 'เชจู'], coverImage: 'https://images.unsplash.com/photo-1538485395224-329273f69da0?q=80&w=2000' },
          macau: { name: 'มาเก๊า', keywords: ['MACAU', 'มาเก๊า'], coverImage: 'https://images.unsplash.com/photo-1582236371727-81498b958c2b?q=80&w=2000' },
          malaysia: { name: 'มาเลเซีย', keywords: ['MALAYSIA', 'มาเลเซีย', 'กัวลาลัมเปอร์'], coverImage: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2000' },
          indonesia: { name: 'อินโดนีเซีย', keywords: ['INDONESIA', 'อินโดนีเซีย', 'บาหลี'], coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2000' },
          maldives: { name: 'มัลดีฟส์', keywords: ['MALDIVES', 'มัลดีฟส์'], coverImage: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=2000' }
`;

const europeMissing = `
      georgia: {
        name: "จอร์เจีย",
        keywords: ["GEORGIA", "จอร์เจีย", "ทบิลิซี"],
        coverImage: "https://images.unsplash.com/photo-1565008576549-57569a49371d?q=80&w=2000"
      },
      germany: { name: 'เยอรมนี', keywords: ['GERMANY', 'เยอรมนี', 'มิวนิค', 'แฟรงก์เฟิร์ต'], coverImage: 'https://images.unsplash.com/photo-1534313314376-a72289b4671e?q=80&w=2000' },
      austria: { name: 'ออสเตรีย', keywords: ['AUSTRIA', 'ออสเตรีย', 'เวียนนา', 'ฮัลล์ชตัทท์'], coverImage: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=2000' },
      czech: { name: 'เช็ก', keywords: ['CZECH', 'เช็ก', 'ปราก'], coverImage: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=2000' },
      spain: { name: 'สเปน', keywords: ['SPAIN', 'สเปน', 'มาดริด', 'บาร์เซโลน่า'], coverImage: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=2000' },
      netherlands: { name: 'เนเธอร์แลนด์', keywords: ['NETHERLANDS', 'เนเธอร์แลนด์', 'อัมสเตอร์ดัม'], coverImage: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?q=80&w=2000' },
      finland: { name: 'ฟินแลนด์', keywords: ['FINLAND', 'ฟินแลนด์', 'เฮลซิงกิ'], coverImage: 'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?q=80&w=2000' }
`;

const meMissing = `
      egypt: {
        name: "อียิปต์",
        keywords: ["EGYPT", "อียิปต์", "ไคโร", "พีระมิด"],
        coverImage: "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?q=80&w=2000"
      },
      jordan: { name: 'จอร์แดน', keywords: ['JORDAN', 'จอร์แดน', 'เพตรา'], coverImage: 'https://images.unsplash.com/photo-1543714271-9fbd5be4bd98?q=80&w=2000' }
`;

// Replace singapore block
code = code.replace(/singapore:\s*\{\s*name:\s*"สิงคโปร์"[\s\S]*?coverImage:.*?"\s*\n\s*\}/m, asiaMissing.trim());

// Replace georgia block
code = code.replace(/georgia:\s*\{\s*name:\s*"จอร์เจีย"[\s\S]*?coverImage:.*?"\s*\n\s*\}/m, europeMissing.trim());

// Replace egypt block
code = code.replace(/egypt:\s*\{\s*name:\s*"อียิปต์"[\s\S]*?coverImage:.*?"\s*\n\s*\}/m, meMissing.trim());

fs.writeFileSync('src/lib/destinations.ts', code);
console.log('Injected missing destinations');
