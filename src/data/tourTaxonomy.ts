import { TourData } from '@/components/tour/TourCard';

export interface RegionData {
  slug: string;
  name: string;
  type: 'continent' | 'country';
  parentId?: string; // If country, links to continent slug
  heroImage: string;
  description: string;
  popularSubRegions: { name: string; image: string }[];
  faqs: { q: string; a: string }[];
}

export const WHOLESALES = ['LETGO', 'CHECKIN', 'TOURFACTORY', 'GO HOLIDAY', 'EASYTRIP'];

// Base Taxonomy mapping as requested
export const taxonomyDB: Record<string, RegionData> = {
  // --- CONTINENTS ---
  'asia': {
    slug: 'asia', name: 'เอเชีย', type: 'continent',
    heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop',
    description: 'ค้นพบเสน่ห์แห่งเอเชีย ทั้งวัฒนธรรม อาหาร และธรรมชาติที่สวยงาม',
    popularSubRegions: [
      { name: 'ญี่ปุ่น', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=500&auto=format&fit=crop' },
      { name: 'จีน', image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=500&auto=format&fit=crop' },
      { name: 'เกาหลีใต้', image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=500&auto=format&fit=crop' },
      { name: 'ไต้หวัน', image: 'https://images.unsplash.com/photo-1552993873-040212f71ee5?q=80&w=500&auto=format&fit=crop' },
    ],
    faqs: [{ q: 'วีซ่าเอเชีย', a: 'หลายประเทศในเอเชียฟรีวีซ่าสำหรับคนไทย เช่น ญี่ปุ่น ไต้หวัน เกาหลีใต้ สิงคโปร์' }]
  },
  'europe': {
    slug: 'europe', name: 'ยุโรป', type: 'continent',
    heroImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2000&auto=format&fit=crop',
    description: 'ดินแดนแห่งประวัติศาสตร์ สถาปัตยกรรมสุดอลังการ และธรรมชาติเหนือจินตนาการ',
    popularSubRegions: [
      { name: 'สวิตเซอร์แลนด์', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=500&auto=format&fit=crop' },
      { name: 'อิตาลี', image: 'https://images.unsplash.com/photo-1516483638261-f40af5aa11e0?q=80&w=500&auto=format&fit=crop' },
      { name: 'ฝรั่งเศส', image: 'https://images.unsplash.com/photo-1502602898657-3e90761138dd?q=80&w=500&auto=format&fit=crop' },
      { name: 'สแกนดิเนเวีย', image: 'https://images.unsplash.com/photo-1476610283111-5360f2526e83?q=80&w=500&auto=format&fit=crop' },
    ],
    faqs: [{ q: 'การขอเชงเก้นวีซ่า', a: 'การเดินทางยุโรปส่วนใหญ่ต้องใช้เชงเก้นวีซ่า ทางเรามีบริการให้คำปรึกษาและเตรียมเอกสารฟรีเมื่อจองทัวร์' }]
  },
  'middle-east': {
    slug: 'middle-east', name: 'ตะวันออกกลางและแอฟริกาเหนือ', type: 'continent',
    heroImage: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?q=80&w=2000&auto=format&fit=crop',
    description: 'สัมผัสมนต์เสน่ห์แห่งทะเลทราย อารยธรรมโบราณ และความหรูหรา',
    popularSubRegions: [
      { name: 'อียิปต์', image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?q=80&w=500&auto=format&fit=crop' },
      { name: 'จอร์เจีย', image: 'https://images.unsplash.com/photo-1565015941916-2c938f388cb2?q=80&w=500&auto=format&fit=crop' },
      { name: 'ตุรกี', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=500&auto=format&fit=crop' },
      { name: 'ดูไบ', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=500&auto=format&fit=crop' },
    ],
    faqs: [{ q: 'ภูมิอากาศ', a: 'ตะวันออกกลางมีอากาศร้อนจัดในฤดูร้อน แนะนำให้เดินทางช่วงตุลาคม - มีนาคม จะได้สัมผัสอากาศเย็นสบาย' }]
  },

  // --- COUNTRIES ---
  'japan': {
    slug: 'japan', name: 'ญี่ปุ่น', type: 'country', parentId: 'asia',
    heroImage: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2000&auto=format&fit=crop',
    description: 'เที่ยวญี่ปุ่นครบทุกฤดู ชมซากุระ ใบไม้เปลี่ยนสี และเล่นหิมะ',
    popularSubRegions: [
      { name: 'โตเกียว', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=500&auto=format&fit=crop' },
      { name: 'โอซาก้า', image: 'https://images.unsplash.com/photo-1590559899731-a382839ce26b?q=80&w=500&auto=format&fit=crop' },
      { name: 'ฮอกไกโด', image: 'https://images.unsplash.com/photo-1601002341257-25e408ec228c?q=80&w=500&auto=format&fit=crop' },
      { name: 'ฟุกุโอกะ', image: 'https://images.unsplash.com/photo-1574041797825-75e110c9c7f6?q=80&w=500&auto=format&fit=crop' },
    ],
    faqs: [{ q: 'คนไทยต้องใช้วีซ่าญี่ปุ่นไหม?', a: 'คนไทยสามารถเดินทางเข้าญี่ปุ่นเพื่อการท่องเที่ยวได้ฟรีวีซ่าสูงสุด 15 วัน' }]
  },
  'china': {
    slug: 'china', name: 'จีน', type: 'country', parentId: 'asia',
    heroImage: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2000&auto=format&fit=crop',
    description: 'สัมผัสความยิ่งใหญ่ของแผ่นดินมังกร ธรรมชาติระดับโลก และอารยธรรม 5,000 ปี',
    popularSubRegions: [
      { name: 'ปักกิ่ง', image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=500&auto=format&fit=crop' },
      { name: 'จิ่วจ้ายโกว', image: 'https://images.unsplash.com/photo-1612255755152-ed876878e3be?q=80&w=500&auto=format&fit=crop' },
      { name: 'เซี่ยงไฮ้', image: 'https://images.unsplash.com/photo-1455459182396-ae46100617cb?q=80&w=500&auto=format&fit=crop' },
      { name: 'จางเจียเจี้ย', image: 'https://images.unsplash.com/photo-1525097487452-6278ff080c31?q=80&w=500&auto=format&fit=crop' },
    ],
    faqs: [{ q: 'วีซ่าจีน', a: 'ปัจจุบันคนไทยและจีนได้ยกเว้นวีซ่าระหว่างกัน สามารถเดินทางเข้าจีนเพื่อการท่องเที่ยวได้ฟรีวีซ่า 30 วัน' }]
  },
  'egypt': {
    slug: 'egypt', name: 'อียิปต์', type: 'country', parentId: 'middle-east',
    heroImage: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?q=80&w=2000&auto=format&fit=crop',
    description: 'ตามรอยฟาโรห์ ขี่อูฐชมพีระมิด และล่องเรือแม่น้ำไนล์',
    popularSubRegions: [
      { name: 'ไคโร', image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?q=80&w=500&auto=format&fit=crop' },
      { name: 'ลักซอร์', image: 'https://images.unsplash.com/photo-1600521605612-88891fc45353?q=80&w=500&auto=format&fit=crop' },
      { name: 'กิซ่า', image: 'https://images.unsplash.com/photo-1572410884635-430fb8ebf035?q=80&w=500&auto=format&fit=crop' },
    ],
    faqs: [{ q: 'วีซ่าอียิปต์', a: 'ต้องขอวีซ่าอียิปต์ ทางทัวร์มักจะรวมบริการขอวีซ่าแบบกรุ๊ปให้เรียบร้อยแล้ว' }]
  },
  'georgia': {
    slug: 'georgia', name: 'จอร์เจีย', type: 'country', parentId: 'middle-east',
    heroImage: 'https://images.unsplash.com/photo-1565015941916-2c938f388cb2?q=80&w=2000&auto=format&fit=crop',
    description: 'วิวสวิตเซอร์แลนด์ในราคาเอเชีย ฟรีวีซ่า 365 วัน',
    popularSubRegions: [
      { name: 'ทบิลิซี', image: 'https://images.unsplash.com/photo-1565015941916-2c938f388cb2?q=80&w=500&auto=format&fit=crop' },
      { name: 'คาซเบกิ', image: 'https://images.unsplash.com/photo-1582294154942-1cb42ed2d987?q=80&w=500&auto=format&fit=crop' },
      { name: 'บาทูมิ', image: 'https://images.unsplash.com/photo-1627914092305-b040441a7d65?q=80&w=500&auto=format&fit=crop' },
    ],
    faqs: [{ q: 'สภาพอากาศ', a: 'สามารถเที่ยวได้ทั้งปี ฤดูหนาวมีสกีรีสอร์ท ฤดูร้อนอากาศเย็นสบาย' }]
  },
  'turkey': {
    slug: 'turkey', name: 'ตุรกี', type: 'country', parentId: 'middle-east',
    heroImage: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=2000&auto=format&fit=crop',
    description: 'ดินแดนสองทวีป ขึ้นบอลลูนที่คัปปาโดเกีย ชมมัสยิดสีน้ำเงิน',
    popularSubRegions: [
      { name: 'อิสตันบูล', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=500&auto=format&fit=crop' },
      { name: 'คัปปาโดเกีย', image: 'https://images.unsplash.com/photo-1570939274717-7eda259b5052?q=80&w=500&auto=format&fit=crop' },
      { name: 'ปามุคคาเล่', image: 'https://images.unsplash.com/photo-1523537672274-129486c9d09c?q=80&w=500&auto=format&fit=crop' },
    ],
    faqs: [{ q: 'ฟรีวีซ่า', a: 'ตุรกีให้สิทธิ์คนไทยเดินทางเข้าประเทศเพื่อการท่องเที่ยวได้ฟรี 30 วัน' }]
  },
  'south-korea': {
    slug: 'south-korea', name: 'เกาหลีใต้', type: 'country', parentId: 'asia',
    heroImage: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=2000&auto=format&fit=crop',
    description: 'เที่ยวเกาหลีครบทุกอารมณ์ ช้อปปิ้ง K-Culture สกี และใบไม้เปลี่ยนสี',
    popularSubRegions: [
      { name: 'โซล', image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=500&auto=format&fit=crop' },
      { name: 'ปูซาน', image: 'https://images.unsplash.com/photo-1573155993874-d5d48af862ba?q=80&w=500&auto=format&fit=crop' },
      { name: 'เชจู', image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?q=80&w=500&auto=format&fit=crop' },
    ],
    faqs: [{ q: 'ฟรีวีซ่า', a: 'คนไทยสามารถเดินทางเข้าเกาหลีใต้เพื่อการท่องเที่ยวได้ฟรีวีซ่า 90 วัน (ต้องลงทะเบียน K-ETA)' }]
  },
  'taiwan': {
    slug: 'taiwan', name: 'ไต้หวัน', type: 'country', parentId: 'asia',
    heroImage: 'https://images.unsplash.com/photo-1552993873-040212f71ee5?q=80&w=2000&auto=format&fit=crop',
    description: 'ไต้หวัน ดินแดนแห่งชาบับเบิ้ล วัดงดงาม และธรรมชาติสุดตระการตา',
    popularSubRegions: [
      { name: 'ไทเป', image: 'https://images.unsplash.com/photo-1552993873-040212f71ee5?q=80&w=500&auto=format&fit=crop' },
      { name: 'เกาสง', image: 'https://images.unsplash.com/photo-1583401515094-86bb2c7aff51?q=80&w=500&auto=format&fit=crop' },
      { name: 'อาลีซาน', image: 'https://images.unsplash.com/photo-1576450297064-c56b9a1df233?q=80&w=500&auto=format&fit=crop' },
    ],
    faqs: [{ q: 'ฟรีวีซ่า', a: 'คนไทยสามารถเดินทางเข้าไต้หวันเพื่อการท่องเที่ยวได้ฟรีวีซ่า 14 วัน' }]
  },
  'vietnam': {
    slug: 'vietnam', name: 'เวียดนาม', type: 'country', parentId: 'asia',
    heroImage: 'https://images.unsplash.com/photo-1557750255-c76072a7aee1?q=80&w=2000&auto=format&fit=crop',
    description: 'เวียดนาม ดินแดนแห่งฟอลีน อ่าวฮาลอง และสตรีทฟู้ดระดับโลก',
    popularSubRegions: [
      { name: 'ฮานอย', image: 'https://images.unsplash.com/photo-1557750255-c76072a7aee1?q=80&w=500&auto=format&fit=crop' },
      { name: 'ดานัง', image: 'https://images.unsplash.com/photo-1559592413-7ce4f0a02951?q=80&w=500&auto=format&fit=crop' },
      { name: 'ซาปา', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=500&auto=format&fit=crop' },
    ],
    faqs: [{ q: 'ฟรีวีซ่า', a: 'คนไทยสามารถเดินทางเข้าเวียดนามเพื่อการท่องเที่ยวได้ฟรีวีซ่า 30 วัน' }]
  },
  'india': {
    slug: 'india', name: 'อินเดีย', type: 'country', parentId: 'asia',
    heroImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000&auto=format&fit=crop',
    description: 'อินเดีย ดินแดนมหัศจรรย์ ทัชมาฮาล วัดสุดอลัง และอาหารรสจัดจ้าน',
    popularSubRegions: [
      { name: 'เดลี', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=500&auto=format&fit=crop' },
      { name: 'ชัยปุระ', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=500&auto=format&fit=crop' },
      { name: 'อัครา', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=500&auto=format&fit=crop' },
    ],
    faqs: [{ q: 'วีซ่า', a: 'ต้องขอวีซ่าอินเดีย สามารถทำ e-Visa ออนไลน์ได้ ใช้เวลาประมาณ 3-5 วันทำการ' }]
  }
};

// Fallback generator for unknown slugs
export function getRegionData(slug: string): RegionData {
  if (taxonomyDB[slug]) return taxonomyDB[slug];
  
  // Generic Fallback
  return {
    slug,
    name: slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' '),
    type: 'country',
    heroImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop',
    description: 'ค้นพบโปรแกรมทัวร์ที่ดีที่สุด ในราคาที่คุ้มค่ากับโฮลเซลล์ชั้นนำ',
    popularSubRegions: [
      { name: 'เมืองหลวง', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=500&auto=format&fit=crop' },
      { name: 'เมืองท่องเที่ยว 1', image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=500&auto=format&fit=crop' },
      { name: 'เมืองท่องเที่ยว 2', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=500&auto=format&fit=crop' },
    ],
    faqs: [{ q: 'การจองทัวร์', a: 'คุณสามารถจองทัวร์ผ่านระบบออนไลน์ได้ตลอด 24 ชม.' }]
  };
}

/**
 * Generate highly deterministic mock tours based on slug and wholesale.
 * Ensuring we have enough data to satisfy "4 per wholesale + view all" requirement.
 */
export function generateWholesaleGroupedTours(regionName: string, countPerWholesale: number = 4) {
  const groupedData: Record<string, { totalAvailable: number; tours: TourData[] }> = {};

  WHOLESALES.forEach((supplier, wIdx) => {
    const tours: TourData[] = [];
    const totalAvailable = countPerWholesale + Math.floor(Math.random() * 20) + 15; // Random total 15-40
    
    for (let i = 0; i < countPerWholesale; i++) {
      const idStr = `${regionName}-${supplier}-${i}`;
      tours.push({
        id: idStr,
        code: `${regionName.substring(0,2).toUpperCase()}-${wIdx}${i}0${i}`,
        title: `ทัวร์${regionName} ไฮไลท์สุดคุ้ม พัก 4 ดาว (รหัส ${wIdx}${i})`,
        image: `https://images.unsplash.com/photo-${1500000000000 + (wIdx * 10000) + i}?q=80&w=600&auto=format&fit=crop`, 
        // Using a stable random unsplash ID would be hard, so just reuse a few high quality travel images based on index
        supplier: supplier,
        country: regionName,
        city: 'เมืองฮิต',
        durationDays: 5 + (i % 3),
        durationNights: 3 + (i % 3),
        nextDeparture: `1${i} ต.ค. 69`,
        price: 25000 + (wIdx * 1000) + (i * 500),
        originalPrice: i % 2 === 0 ? 30000 + (wIdx * 1000) + (i * 500) : undefined,
        isFlashSale: i === 0,
        isConfirmed: i < 2,
        availableSeats: 2 + (i * 3),
        aiScore: 85 + i + wIdx,
        airline: wIdx % 2 === 0 ? 'XJ' : 'TG'
      });
    }

    // Override images to look good
    tours.forEach((t, idx) => {
        const images = [
            'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1565015941916-2c938f388cb2?q=80&w=600&auto=format&fit=crop'
        ];
        t.image = images[(wIdx + idx) % images.length];
    });

    groupedData[supplier] = {
      totalAvailable,
      tours
    };
  });

  return groupedData;
}

/**
 * Generate mock tours for a specific supplier, grouped clearly by country.
 */
export function generateSupplierToursGroupedByCountry(supplierName: string, countPerCountry: number = 4) {
  const groupedData: Record<string, { totalAvailable: number; tours: TourData[] }> = {};
  
  const targetCountries = ['ญี่ปุ่น', 'จีน', 'ยุโรป', 'เวียดนาม', 'จอร์เจีย'];

  targetCountries.forEach((country, cIdx) => {
    const tours: TourData[] = [];
    const totalAvailable = countPerCountry + Math.floor(Math.random() * 10) + 5; // Random total 9-19
    
    for (let i = 0; i < countPerCountry; i++) {
      const idStr = `${supplierName}-${country}-${i}`;
      tours.push({
        id: idStr,
        code: `${country.substring(0,2).toUpperCase()}-${cIdx}${i}0${i}`,
        title: `ทัวร์${country} คุ้มค่า จัดโดย ${supplierName} (รหัส ${cIdx}${i})`,
        image: `https://images.unsplash.com/photo-${1500000000000 + (cIdx * 10000) + i}?q=80&w=600&auto=format&fit=crop`,
        supplier: supplierName,
        country: country,
        city: 'เมืองฮิต',
        durationDays: 5 + (i % 3),
        durationNights: 3 + (i % 3),
        nextDeparture: `2${i} ธ.ค. 69`,
        price: 19900 + (cIdx * 5000) + (i * 1000),
        originalPrice: i % 2 === 0 ? 25900 + (cIdx * 5000) + (i * 1000) : undefined,
        isFlashSale: i === 0,
        isConfirmed: i < 2,
        availableSeats: 5 + (i * 2),
        aiScore: 88 + i,
        airline: cIdx % 2 === 0 ? 'XJ' : 'TG'
      });
    }

    // Override images to look good
    tours.forEach((t, idx) => {
        const images = [
            'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1559592413-7ce4f0a02951?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1565015941916-2c938f388cb2?q=80&w=600&auto=format&fit=crop'
        ];
        t.image = images[cIdx % images.length];
    });

    groupedData[country] = {
      totalAvailable,
      tours
    };
  });

  return groupedData;
}
