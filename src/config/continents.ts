/**
 * Continent → Country → City mapping
 * Used by tours pages and region pages
 * v3 — 18 European countries
 */

export interface ContinentCountry {
  name: string;
  flagCode: string;
  cities: Record<string, string>;
  searchNames?: string[];
}

export interface ContinentData {
  name: string;
  desc: string;
  countries: Record<string, ContinentCountry>;
}

export const CONTINENTS: Record<string, ContinentData> = {
  asia: {
    name: 'เอเชีย', desc: 'เปิดโลกแห่งเอเชีย ให้ทุกการเดินทางเป็นความทรงจำที่ยิ่งใหญ่',
    countries: {
      japan: { name: 'ญี่ปุ่น', flagCode: 'jp', searchNames: ['ญี่ปุ่น', 'JAPAN'], cities: { tokyo: 'โตเกียว', osaka: 'โอซาก้า', hokkaido: 'ฮอกไกโด', kyoto: 'เกียวโต', fukuoka: 'ฟุกุโอกะ', nagoya: 'นาโกย่า', okinawa: 'โอกินาว่า' }},
      china: { name: 'จีน', flagCode: 'cn', searchNames: ['จีน', 'CHINA'], cities: { chengdu: 'เฉิงตู', zhangjiajie: 'จางเจียเจี้ย', kunming: 'คุนหมิง', beijing: 'ปักกิ่ง', shanghai: 'เซี่ยงไฮ้', guangzhou: 'กวางเจา', guilin: 'กุ้ยหลิน', xian: 'ซีอาน', chongqing: 'ฉงชิ่ง' }},
      'south-korea': { name: 'เกาหลีใต้', flagCode: 'kr', searchNames: ['เกาหลี', 'KOREA', 'SOUTH KOREA'], cities: { seoul: 'โซล', busan: 'ปูซาน', jeju: 'เชจู' }},
      taiwan: { name: 'ไต้หวัน', flagCode: 'tw', searchNames: ['ไต้หวัน', 'TAIWAN'], cities: { taipei: 'ไทเป', kaohsiung: 'เกาสง' }},
      vietnam: { name: 'เวียดนาม', flagCode: 'vn', searchNames: ['เวียดนาม', 'VIETNAM'], cities: { danang: 'ดานัง', hanoi: 'ฮานอย', hochiminh: 'โฮจิมินห์', sapa: 'ซาปา' }},
      hongkong: { name: 'ฮ่องกง', flagCode: 'hk', searchNames: ['ฮ่องกง', 'HONG KONG'], cities: {} },
      singapore: { name: 'สิงคโปร์', flagCode: 'sg', searchNames: ['สิงคโปร์', 'SINGAPORE'], cities: {} },
      malaysia: { name: 'มาเลเซีย', flagCode: 'my', searchNames: ['มาเลเซีย', 'MALAYSIA'], cities: { 'kuala-lumpur': 'กัวลาลัมเปอร์' }},
      india: { name: 'อินเดีย', flagCode: 'in', searchNames: ['อินเดีย', 'INDIA'], cities: { delhi: 'เดลี', kashmir: 'แคชเมียร์' }},
      cambodia: { name: 'กัมพูชา', flagCode: 'kh', searchNames: ['กัมพูชา', 'CAMBODIA'], cities: {} },
      myanmar: { name: 'พม่า', flagCode: 'mm', searchNames: ['พม่า', 'MYANMAR'], cities: {} },
      laos: { name: 'ลาว', flagCode: 'la', searchNames: ['ลาว', 'LAOS'], cities: {} },
      macau: { name: 'มาเก๊า', flagCode: 'mo', searchNames: ['มาเก๊า', 'MACAU'], cities: {} },
    },
  },
  europe: {
    name: 'ยุโรป', desc: 'สัมผัสเสน่ห์ยุโรป วัฒนธรรมเก่าแก่ สถาปัตยกรรมอลังการ',
    countries: {
      uk: { name: 'อังกฤษ', flagCode: 'gb', searchNames: ['อังกฤษ', 'ENGLAND', 'UK', 'UNITED KINGDOM'], cities: { london: 'ลอนดอน' }},
      france: { name: 'ฝรั่งเศส', flagCode: 'fr', searchNames: ['ฝรั่งเศส', 'FRANCE'], cities: { paris: 'ปารีส' }},
      italy: { name: 'อิตาลี', flagCode: 'it', searchNames: ['อิตาลี', 'ITALY'], cities: { rome: 'โรม', milan: 'มิลาน' }},
      switzerland: { name: 'สวิตเซอร์แลนด์', flagCode: 'ch', searchNames: ['สวิตเซอร์แลนด์', 'SWITZERLAND'], cities: {} },
      germany: { name: 'เยอรมนี', flagCode: 'de', searchNames: ['เยอรมนี', 'เยอรมัน', 'GERMANY'], cities: {} },
      spain: { name: 'สเปน', flagCode: 'es', searchNames: ['สเปน', 'SPAIN'], cities: {} },
      netherlands: { name: 'เนเธอร์แลนด์', flagCode: 'nl', searchNames: ['เนเธอร์แลนด์', 'NETHERLANDS'], cities: {} },
      austria: { name: 'ออสเตรีย', flagCode: 'at', searchNames: ['ออสเตรีย', 'AUSTRIA'], cities: {} },
      scandinavia: { name: 'สแกนดิเนเวีย', flagCode: 'se', searchNames: ['สแกนดิเนเวีย', 'SCANDINAVIA'], cities: {} },
      baltic: { name: 'บอลติก', flagCode: 'lv', searchNames: ['บอลติก', 'BALTIC'], cities: {} },
      norway: { name: 'นอร์เวย์', flagCode: 'no', searchNames: ['นอร์เวย์', 'NORWAY'], cities: {} },
      finland: { name: 'ฟินแลนด์', flagCode: 'fi', searchNames: ['ฟินแลนด์', 'FINLAND'], cities: {} },
      denmark: { name: 'เดนมาร์ก', flagCode: 'dk', searchNames: ['เดนมาร์ก', 'DENMARK'], cities: {} },
      belgium: { name: 'เบลเยียม', flagCode: 'be', searchNames: ['เบลเยียม', 'BELGIUM'], cities: {} },
      czech: { name: 'เช็ก', flagCode: 'cz', searchNames: ['เช็ก', 'CZECH REPUBLIC', 'CZECH'], cities: {} },
      hungary: { name: 'ฮังการี', flagCode: 'hu', searchNames: ['ฮังการี', 'HUNGARY'], cities: {} },
      portugal: { name: 'โปรตุเกส', flagCode: 'pt', searchNames: ['โปรตุเกส', 'PORTUGAL'], cities: {} },
      'europe-multi': { name: 'ยุโรป (รวม)', flagCode: 'eu', searchNames: ['ยุโรป', 'EUROPE'], cities: {} },
    },
  },
  'middle-east': {
    name: 'ตะวันออกกลาง', desc: 'สัมผัสอารยธรรมโบราณ จากมหาพีระมิดอียิปต์สู่นครดูไบสุดอลังการ',
    countries: {
      turkey: { name: 'ตุรกี', flagCode: 'tr', searchNames: ['ตุรกี', 'TURKIYE', 'TURKEY'], cities: { istanbul: 'อิสตันบูล', cappadocia: 'คัปปาโดเกีย' }},
      egypt: { name: 'อียิปต์', flagCode: 'eg', searchNames: ['อียิปต์', 'EGYPT'], cities: { cairo: 'ไคโร' }},
      jordan: { name: 'จอร์แดน', flagCode: 'jo', searchNames: ['จอร์แดน', 'JORDAN'], cities: {} },
      dubai: { name: 'ดูไบ', flagCode: 'ae', searchNames: ['ดูไบ', 'สหรัฐอาหรับเอมิเรตส์', 'DUBAI', 'UAE'], cities: {} },
    },
  },
  americas: {
    name: 'อเมริกา', desc: 'สำรวจทวีปอเมริกา จากมหานครนิวยอร์กถึงน้ำตกไนแองการ่า',
    countries: {
      usa: { name: 'อเมริกา', flagCode: 'us', searchNames: ['อเมริกา', 'USA', 'UNITED STATES'], cities: { 'new-york': 'นิวยอร์ก', 'los-angeles': 'ลอสแอนเจลิส' }},
      canada: { name: 'แคนาดา', flagCode: 'ca', searchNames: ['แคนาดา', 'CANADA'], cities: {} },
    },
  },
  oceania: {
    name: 'โอเชียเนีย', desc: 'ออสเตรเลีย นิวซีแลนด์ ดินแดนธรรมชาติอันงดงาม',
    countries: {
      australia: { name: 'ออสเตรเลีย', flagCode: 'au', searchNames: ['ออสเตรเลีย', 'AUSTRALIA'], cities: { sydney: 'ซิดนีย์', melbourne: 'เมลเบิร์น' }},
      newzealand: { name: 'นิวซีแลนด์', flagCode: 'nz', searchNames: ['นิวซีแลนด์', 'NEW ZEALAND'], cities: {} },
    },
  },
  others: {
    name: 'ทวีป/ประเทศอื่นๆ', desc: 'สำรวจจุดหมายปลายทางใหม่ๆ ที่น่าค้นพบทั่วโลก',
    countries: {
      georgia: { name: 'จอร์เจีย', flagCode: 'ge', searchNames: ['จอร์เจีย', 'GEORGIA'], cities: {} },
      russia: { name: 'รัสเซีย', flagCode: 'ru', searchNames: ['รัสเซีย', 'RUSSIA'], cities: {} },
      bhutan: { name: 'ภูฏาน', flagCode: 'bt', searchNames: ['ภูฏาน', 'ภูฎาน', 'BHUTAN'], cities: {} },
      srilanka: { name: 'ศรีลังกา', flagCode: 'lk', searchNames: ['ศรีลังกา', 'SRI LANKA'], cities: {} },
    },
  },
};
