const fs = require('fs');
let code = fs.readFileSync('src/lib/destinations.ts', 'utf8');

const africaMissing = `
  africa: {
    name: "แอฟริกา",
    keywords: ["AFRICA", "แอฟริกา", "MOROCCO", "โมร็อกโก"],
    coverImage: "https://images.unsplash.com/photo-1547471080-7cb2cb9a46cb?q=80&w=2000",
    children: {
      morocco: {
        name: "โมร็อกโก",
        keywords: ["MOROCCO", "โมร็อกโก", "มาร์ราเกช", "คาซาบลังกา"],
        coverImage: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=2000"
      }
    }
  },
`;

const americaMissing = `
  america: {
    name: "อเมริกา",
    keywords: ["AMERICA", "อเมริกา", "USA", "สหรัฐอเมริกา", "CANADA", "แคนาดา"],
    coverImage: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80&w=2000",
    children: {
      usa: {
        name: "สหรัฐอเมริกา",
        keywords: ["USA", "สหรัฐอเมริกา", "นิวยอร์ก", "ลอสแอนเจลิส"],
        coverImage: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2000"
      },
      canada: {
        name: "แคนาดา",
        keywords: ["CANADA", "แคนาดา", "โทรอนโต", "แวนคูเวอร์"],
        coverImage: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=2000"
      }
    }
  },
`;

const oceaniaMissing = `
  oceania: {
    name: "โอเชียเนีย",
    keywords: ["OCEANIA", "โอเชียเนีย", "AUSTRALIA", "ออสเตรเลีย", "NEW ZEALAND", "นิวซีแลนด์"],
    coverImage: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?q=80&w=2000",
    children: {
      australia: {
        name: "ออสเตรเลีย",
        keywords: ["AUSTRALIA", "ออสเตรเลีย", "ซิดนีย์", "เมลเบิร์น"],
        coverImage: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?q=80&w=2000"
      },
      'new-zealand': {
        name: "นิวซีแลนด์",
        keywords: ["NEW ZEALAND", "นิวซีแลนด์", "โอ๊คแลนด์", "ควีนส์ทาวน์"],
        coverImage: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?q=80&w=2000"
      }
    }
  }
`;

// Insert after middle-east block
code = code.replace(/middle-east:\s*\{\s*name:\s*"ตะวันออกกลาง"[\s\S]*?egypt:.*\}[\s\S]*?\n\s*\}\n\s*\}/m, match => match + ',\n' + africaMissing + americaMissing + oceaniaMissing);

fs.writeFileSync('src/lib/destinations.ts', code);
console.log('Injected remaining missing destinations');
