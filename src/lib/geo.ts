export type RegionKey = 'asia' | 'europe' | 'middle-east' | 'americas' | 'oceania' | 'others';

export interface RegionMeta {
  key: RegionKey;
  name: string;
  nameEn: string;
  desc: string;
}

export interface CountryMeta {
  slug: string;
  name: string;
  flagCode: string;
  regionKey: RegionKey;
  aliases: string[];
}

export interface RegionCountryItem {
  name: string;
  slug: string;
  flagCode: string;
  searchNames: string[];
}

export interface RegionData {
  name: string;
  nameEn: string;
  desc: string;
  countries: RegionCountryItem[];
}

export const REGION_ORDER: RegionKey[] = ['asia', 'europe', 'middle-east', 'americas', 'oceania', 'others'];

export const REGION_META: Record<RegionKey, RegionMeta> = {
  asia: {
    key: 'asia',
    name: 'เอเชีย',
    nameEn: 'Asia',
    desc: 'รวมทัวร์ยอดนิยมโซนเอเชีย',
  },
  europe: {
    key: 'europe',
    name: 'ยุโรป',
    nameEn: 'Europe',
    desc: 'รวมทัวร์ยุโรปทุกประเทศยอดนิยม',
  },
  'middle-east': {
    key: 'middle-east',
    name: 'ตะวันออกกลาง',
    nameEn: 'Middle East',
    desc: 'รวมทัวร์ตะวันออกกลางและใกล้เคียง',
  },
  americas: {
    key: 'americas',
    name: 'อเมริกา',
    nameEn: 'Americas',
    desc: 'รวมทัวร์อเมริกาเหนือและใต้',
  },
  oceania: {
    key: 'oceania',
    name: 'โอเชียเนีย',
    nameEn: 'Oceania',
    desc: 'รวมทัวร์ออสเตรเลียและนิวซีแลนด์',
  },
  others: {
    key: 'others',
    name: 'อื่นๆ',
    nameEn: 'Others',
    desc: 'รวมปลายทางอื่นๆ',
  },
};

const COUNTRY_CATALOG: CountryMeta[] = [
  { slug: 'japan', name: 'ญี่ปุ่น', flagCode: 'jp', regionKey: 'asia', aliases: ['ญี่ปุ่น', 'japan', 'jp'] },
  { slug: 'china', name: 'จีน', flagCode: 'cn', regionKey: 'asia', aliases: ['จีน', 'china', 'cn', 'เซี่ยงไฮ้', 'ทิเบต'] },
  { slug: 'south-korea', name: 'เกาหลีใต้', flagCode: 'kr', regionKey: 'asia', aliases: ['เกาหลี', 'เกาหลีใต้', 'south korea', 'korea', 'kr'] },
  { slug: 'taiwan', name: 'ไต้หวัน', flagCode: 'tw', regionKey: 'asia', aliases: ['ไต้หวัน', 'taiwan', 'tw'] },
  { slug: 'vietnam', name: 'เวียดนาม', flagCode: 'vn', regionKey: 'asia', aliases: ['เวียดนาม', 'vietnam', 'vn'] },
  { slug: 'hongkong', name: 'ฮ่องกง', flagCode: 'hk', regionKey: 'asia', aliases: ['ฮ่องกง', 'hong kong', 'hongkong', 'hk'] },
  { slug: 'singapore', name: 'สิงคโปร์', flagCode: 'sg', regionKey: 'asia', aliases: ['สิงคโปร์', 'singapore', 'sg'] },
  { slug: 'malaysia', name: 'มาเลเซีย', flagCode: 'my', regionKey: 'asia', aliases: ['มาเลเซีย', 'malaysia', 'my'] },
  { slug: 'india', name: 'อินเดีย', flagCode: 'in', regionKey: 'asia', aliases: ['อินเดีย', 'india', 'in'] },
  { slug: 'cambodia', name: 'กัมพูชา', flagCode: 'kh', regionKey: 'asia', aliases: ['กัมพูชา', 'cambodia', 'kh'] },
  { slug: 'myanmar', name: 'พม่า', flagCode: 'mm', regionKey: 'asia', aliases: ['พม่า', 'เมียนมา', 'myanmar', 'mm'] },
  { slug: 'laos', name: 'ลาว', flagCode: 'la', regionKey: 'asia', aliases: ['ลาว', 'laos', 'la'] },
  { slug: 'philippines', name: 'ฟิลิปปินส์', flagCode: 'ph', regionKey: 'asia', aliases: ['ฟิลิปปินส์', 'philippines', 'ph'] },
  { slug: 'macau', name: 'มาเก๊า', flagCode: 'mo', regionKey: 'asia', aliases: ['มาเก๊า', 'macau', 'mo'] },
  { slug: 'indonesia', name: 'อินโดนีเซีย', flagCode: 'id', regionKey: 'asia', aliases: ['อินโดนีเซีย', 'indonesia', 'id'] },
  { slug: 'bhutan', name: 'ภูฏาน', flagCode: 'bt', regionKey: 'asia', aliases: ['ภูฏาน', 'ภูฎาน', 'bhutan', 'bt'] },
  { slug: 'srilanka', name: 'ศรีลังกา', flagCode: 'lk', regionKey: 'asia', aliases: ['ศรีลังกา', 'sri lanka', 'srilanka', 'lk'] },
  { slug: 'mongolia', name: 'มองโกเลีย', flagCode: 'mn', regionKey: 'asia', aliases: ['มองโกเลีย', 'mongolia', 'mn'] },
  { slug: 'nepal', name: 'เนปาล', flagCode: 'np', regionKey: 'asia', aliases: ['เนปาล', 'nepal', 'np'] },
  { slug: 'maldives', name: 'มัลดีฟส์', flagCode: 'mv', regionKey: 'asia', aliases: ['มัลดีฟส์', 'maldives', 'mv'] },
  { slug: 'kazakhstan', name: 'คาซัคสถาน', flagCode: 'kz', regionKey: 'asia', aliases: ['คาซัคสถาน', 'kazakhstan', 'kz'] },

  { slug: 'uk', name: 'อังกฤษ', flagCode: 'gb', regionKey: 'europe', aliases: ['อังกฤษ', 'uk', 'united kingdom', 'england', 'great britain', 'gb'] },
  { slug: 'france', name: 'ฝรั่งเศส', flagCode: 'fr', regionKey: 'europe', aliases: ['ฝรั่งเศส', 'france', 'fr'] },
  { slug: 'italy', name: 'อิตาลี', flagCode: 'it', regionKey: 'europe', aliases: ['อิตาลี', 'italy', 'it'] },
  { slug: 'switzerland', name: 'สวิตเซอร์แลนด์', flagCode: 'ch', regionKey: 'europe', aliases: ['สวิตเซอร์แลนด์', 'switzerland', 'ch'] },
  { slug: 'germany', name: 'เยอรมนี', flagCode: 'de', regionKey: 'europe', aliases: ['เยอรมนี', 'เยอรมัน', 'germany', 'de'] },
  { slug: 'spain', name: 'สเปน', flagCode: 'es', regionKey: 'europe', aliases: ['สเปน', 'spain', 'es'] },
  { slug: 'netherlands', name: 'เนเธอร์แลนด์', flagCode: 'nl', regionKey: 'europe', aliases: ['เนเธอร์แลนด์', 'holland', 'netherlands', 'nl'] },
  { slug: 'austria', name: 'ออสเตรีย', flagCode: 'at', regionKey: 'europe', aliases: ['ออสเตรีย', 'austria', 'at'] },
  { slug: 'scandinavia', name: 'สแกนดิเนเวีย', flagCode: 'se', regionKey: 'europe', aliases: ['สแกนดิเนเวีย', 'scandinavia'] },
  { slug: 'baltic', name: 'บอลติก', flagCode: 'lv', regionKey: 'europe', aliases: ['บอลติก', 'baltic'] },
  { slug: 'norway', name: 'นอร์เวย์', flagCode: 'no', regionKey: 'europe', aliases: ['นอร์เวย์', 'norway', 'no'] },
  { slug: 'sweden', name: 'สวีเดน', flagCode: 'se', regionKey: 'europe', aliases: ['สวีเดน', 'sweden', 'se'] },
  { slug: 'finland', name: 'ฟินแลนด์', flagCode: 'fi', regionKey: 'europe', aliases: ['ฟินแลนด์', 'finland', 'fi'] },
  { slug: 'denmark', name: 'เดนมาร์ก', flagCode: 'dk', regionKey: 'europe', aliases: ['เดนมาร์ก', 'denmark', 'dk'] },
  { slug: 'belgium', name: 'เบลเยียม', flagCode: 'be', regionKey: 'europe', aliases: ['เบลเยียม', 'belgium', 'be'] },
  { slug: 'czech', name: 'เช็ก', flagCode: 'cz', regionKey: 'europe', aliases: ['เช็ก', 'czech', 'czech republic', 'cz'] },
  { slug: 'hungary', name: 'ฮังการี', flagCode: 'hu', regionKey: 'europe', aliases: ['ฮังการี', 'hungary', 'hu'] },
  { slug: 'portugal', name: 'โปรตุเกส', flagCode: 'pt', regionKey: 'europe', aliases: ['โปรตุเกส', 'portugal', 'pt'] },
  { slug: 'georgia', name: 'จอร์เจีย', flagCode: 'ge', regionKey: 'europe', aliases: ['จอร์เจีย', 'georgia', 'ge'] },
  { slug: 'russia', name: 'รัสเซีย', flagCode: 'ru', regionKey: 'europe', aliases: ['รัสเซีย', 'russia', 'ru'] },
  { slug: 'iceland', name: 'ไอซ์แลนด์', flagCode: 'is', regionKey: 'europe', aliases: ['ไอซ์แลนด์', 'iceland', 'is'] },
  { slug: 'greece', name: 'กรีซ', flagCode: 'gr', regionKey: 'europe', aliases: ['กรีซ', 'greece', 'gr'] },
  { slug: 'croatia', name: 'โครเอเชีย', flagCode: 'hr', regionKey: 'europe', aliases: ['โครเอเชีย', 'croatia', 'hr'] },
  { slug: 'bulgaria', name: 'บัลแกเรีย', flagCode: 'bg', regionKey: 'europe', aliases: ['บัลแกเรีย', 'bulgaria', 'bg'] },
  { slug: 'malta', name: 'มอลต้า', flagCode: 'mt', regionKey: 'europe', aliases: ['มอลต้า', 'malta', 'mt'] },
  { slug: 'ireland', name: 'ไอร์แลนด์', flagCode: 'ie', regionKey: 'europe', aliases: ['ไอร์แลนด์', 'ireland', 'ie'] },
  { slug: 'poland', name: 'โปแลนด์', flagCode: 'pl', regionKey: 'europe', aliases: ['โปแลนด์', 'poland', 'pl'] },
  { slug: 'europe-multi', name: 'ยุโรป', flagCode: 'eu', regionKey: 'europe', aliases: ['ยุโรป', 'europe', 'eu'] },

  { slug: 'turkey', name: 'ตุรกี', flagCode: 'tr', regionKey: 'middle-east', aliases: ['ตุรกี', 'ตุรเคีย', 'turkey', 'turkiye', 'tr'] },
  { slug: 'egypt', name: 'อียิปต์', flagCode: 'eg', regionKey: 'middle-east', aliases: ['อียิปต์', 'egypt', 'eg'] },
  { slug: 'jordan', name: 'จอร์แดน', flagCode: 'jo', regionKey: 'middle-east', aliases: ['จอร์แดน', 'jordan', 'jo'] },
  { slug: 'dubai', name: 'ดูไบ', flagCode: 'ae', regionKey: 'middle-east', aliases: ['ดูไบ', 'uae', 'dubai', 'united arab emirates', 'สหรัฐอาหรับเอมิเรตส์', 'ae'] },

  { slug: 'usa', name: 'อเมริกา', flagCode: 'us', regionKey: 'americas', aliases: ['อเมริกา', 'usa', 'united states', 'us', 'america', 'อลาสก้า', 'alaska'] },
  { slug: 'canada', name: 'แคนาดา', flagCode: 'ca', regionKey: 'americas', aliases: ['แคนาดา', 'canada', 'ca'] },
  { slug: 'argentina', name: 'อาร์เจนตินา', flagCode: 'ar', regionKey: 'americas', aliases: ['อาร์เจนตินา', 'argentina', 'ar'] },
  { slug: 'peru', name: 'เปรู', flagCode: 'pe', regionKey: 'americas', aliases: ['เปรู', 'peru', 'pe'] },
  { slug: 'mexico', name: 'เม็กซิโก', flagCode: 'mx', regionKey: 'americas', aliases: ['เม็กซิโก', 'mexico', 'mx'] },
  { slug: 'brazil', name: 'บราซิล', flagCode: 'br', regionKey: 'americas', aliases: ['บราซิล', 'brazil', 'br'] },

  { slug: 'australia', name: 'ออสเตรเลีย', flagCode: 'au', regionKey: 'oceania', aliases: ['ออสเตรเลีย', 'australia', 'au'] },
  { slug: 'newzealand', name: 'นิวซีแลนด์', flagCode: 'nz', regionKey: 'oceania', aliases: ['นิวซีแลนด์', 'new zealand', 'newzealand', 'nz'] },

  { slug: 'south-africa', name: 'แอฟริกาใต้', flagCode: 'za', regionKey: 'others', aliases: ['แอฟริกาใต้', 'south africa', 'za'] },
  { slug: 'kenya', name: 'เคนย่า', flagCode: 'ke', regionKey: 'others', aliases: ['เคนย่า', 'kenya', 'ke'] },
];

const normalizeText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[()\[\]{}]/g, ' ')
    .replace(/[\/_,.;|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const normalizedCatalog = COUNTRY_CATALOG.map((country) => ({
  ...country,
  aliasSet: country.aliases.map(normalizeText),
}));

const hasAliasMatch = (text: string, alias: string) => {
  if (!text || !alias) return false;
  if (text === alias) return true;
  if (text.startsWith(`${alias} `) || text.startsWith(`${alias}-`)) return true;
  if (text.includes(` ${alias} `)) return true;
  return false;
};

const findCountryByText = (value: string): CountryMeta | null => {
  const normalizedValue = normalizeText(value);
  if (!normalizedValue) return null;
  for (const country of normalizedCatalog) {
    for (const alias of country.aliasSet) {
      if (hasAliasMatch(normalizedValue, alias)) {
        return country;
      }
    }
  }
  return null;
};

export function resolveCountryMeta(countryRaw?: string, titleRaw?: string): CountryMeta {
  const fromCountry = findCountryByText(countryRaw || '');
  if (fromCountry) return fromCountry;

  const normalizedTitle = normalizeText(titleRaw || '');
  if (normalizedTitle) {
    for (const country of normalizedCatalog) {
      for (const alias of country.aliasSet) {
        if (alias.length < 3) continue;
        if (normalizedTitle.includes(alias)) {
          return country;
        }
      }
    }
  }

  return {
    slug: normalizeText(countryRaw || '').replace(/\s+/g, '-') || 'unknown',
    name: (countryRaw || '').trim() || 'อื่นๆ',
    flagCode: '',
    regionKey: 'others',
    aliases: [],
  };
}

export function normalizeCountryName(countryRaw?: string, titleRaw?: string): string {
  return resolveCountryMeta(countryRaw, titleRaw).name;
}

export function getCountryBySlug(slug: string): CountryMeta | null {
  const normalizedSlug = normalizeText(slug).replace(/\s+/g, '-');
  return COUNTRY_CATALOG.find((country) => country.slug === normalizedSlug) || null;
}

export function getCountriesByRegion(regionKey: string): CountryMeta[] {
  if (!(regionKey in REGION_META)) return [];
  return COUNTRY_CATALOG.filter((country) => country.regionKey === regionKey);
}

export function getRegionData(regionKeyInput: string): RegionData {
  const regionKey = (regionKeyInput in REGION_META ? regionKeyInput : 'asia') as RegionKey;
  const region = REGION_META[regionKey];
  const countries = getCountriesByRegion(region.key).map((country) => ({
    name: country.name,
    slug: country.slug,
    flagCode: country.flagCode,
    searchNames: [country.name, ...country.aliases],
  }));

  return {
    name: region.name,
    nameEn: region.nameEn,
    desc: region.desc,
    countries,
  };
}

export function getRegionByKey(regionKeyInput: string): RegionMeta {
  const key = (regionKeyInput in REGION_META ? regionKeyInput : 'asia') as RegionKey;
  return REGION_META[key];
}
