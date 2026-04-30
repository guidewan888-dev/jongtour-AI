const fs = require('fs');
let code = fs.readFileSync('src/lib/destinations.ts', 'utf8');

// 1. Add SINGAPORE, INDIA, KOREA to Asia
code = code.replace(
  'keywords: ["CHINA", "JAPAN", "VIETNAM", "HONG KONG", "KOREA", "TAIWAN", "เอเชีย", "ญี่ปุ่น", "จีน", "เกาหลี", "ไต้หวัน", "เวียดนาม", "ฮ่องกง"],',
  'keywords: ["CHINA", "JAPAN", "VIETNAM", "HONG KONG", "KOREA", "TAIWAN", "SINGAPORE", "INDIA", "เอเชีย", "ญี่ปุ่น", "จีน", "เกาหลี", "ไต้หวัน", "เวียดนาม", "ฮ่องกง", "สิงคโปร์", "อินเดีย"],'
);

// 2. Add EUROPE countries
code = code.replace(
  'keywords: ["EUROPE", "ยุโรป", "ฝรั่งเศส", "สวิตเซอร์แลนด์", "อิตาลี", "อังกฤษ", "FRANCE", "SWITZERLAND", "ITALY", "UK"],',
  'keywords: ["EUROPE", "ยุโรป", "ฝรั่งเศส", "สวิตเซอร์แลนด์", "อิตาลี", "อังกฤษ", "FRANCE", "SWITZERLAND", "ITALY", "UK", "ENGLAND", "GERMANY", "AUSTRIA", "CZECH", "SPAIN", "NETHERLANDS", "FINLAND", "GEORGIA"],'
);

// 3. We need to add the missing children to EUROPE.
const europeChildrenInsertPoint = code.indexOf('children: {') + 'children: {'.length;
// Actually just replace europe completely
const europeReplacement = `  europe: {
    name: "ยุโรป",
    keywords: ["EUROPE", "ยุโรป", "ฝรั่งเศส", "สวิตเซอร์แลนด์", "อิตาลี", "อังกฤษ", "FRANCE", "SWITZERLAND", "ITALY", "UK", "ENGLAND", "GERMANY", "AUSTRIA", "CZECH", "SPAIN", "NETHERLANDS", "FINLAND", "GEORGIA"],
    coverImage: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2000",
    children: {
      france: {
        name: "ฝรั่งเศส",
        keywords: ["FRANCE", "ฝรั่งเศส", "ปารีส"],
        coverImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2000"
      },
      switzerland: {
        name: "สวิตเซอร์แลนด์",
        keywords: ["SWITZERLAND", "สวิตเซอร์แลนด์", "สวิส"],
        coverImage: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=2000"
      },
      italy: {
        name: "อิตาลี",
        keywords: ["ITALY", "อิตาลี", "โรม", "เวนิส", "มิลาน"],
        coverImage: "https://images.unsplash.com/photo-1515542622106-78b28af7815b?q=80&w=2000"
      },
      uk: {
        name: "อังกฤษ",
        keywords: ["UK", "ENGLAND", "อังกฤษ", "สหราชอาณาจักร", "ลอนดอน"],
        coverImage: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2000"
      },
      georgia: {
        name: "จอร์เจีย",
        keywords: ["GEORGIA", "จอร์เจีย", "ทบิลิซี"],
        coverImage: "https://images.unsplash.com/photo-1565008576549-57569a49371d?q=80&w=2000"
      }
    }
  },
  "middle-east": {
    name: "ตะวันออกกลาง",
    keywords: ["MIDDLE EAST", "ตะวันออกกลาง", "TURKEY", "TURKIYE", "ตุรกี", "EGYPT", "อียิปต์", "JORDAN", "จอร์แดน"],
    coverImage: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2000",
    children: {
      turkey: {
        name: "ตุรกี",
        keywords: ["TURKEY", "TURKIYE", "ตุรกี", "อิสตันบูล", "คัปปาโดเกีย"],
        coverImage: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=2000"
      },
      egypt: {
        name: "อียิปต์",
        keywords: ["EGYPT", "อียิปต์", "ไคโร", "พีระมิด"],
        coverImage: "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?q=80&w=2000"
      }
    }
  }`;

// Find europe block: from "  europe: {" to "  }" before "};"
const startIndex = code.indexOf('  europe: {');
const endIndex = code.indexOf('};\n\n/**');
if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + europeReplacement + '\n' + code.substring(endIndex);
}

// Add remaining Asia countries
const vnIndex = code.indexOf('      vietnam: {');
const asiaAdditions = `      singapore: {
        name: "สิงคโปร์",
        keywords: ["SINGAPORE", "สิงคโปร์", "มาริน่าเบย์"],
        coverImage: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2000"
      },
      india: {
        name: "อินเดีย",
        keywords: ["INDIA", "อินเดีย", "นิวเดลี", "ทัชมาฮาล"],
        coverImage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000"
      },
`;
if (vnIndex !== -1) {
  code = code.substring(0, vnIndex) + asiaAdditions + code.substring(vnIndex);
}

fs.writeFileSync('src/lib/destinations.ts', code);
console.log('Modified src/lib/destinations.ts!');
