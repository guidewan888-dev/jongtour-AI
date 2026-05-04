import Link from "next/link";
import { ChevronRight, MapPin, Calendar, Clock, Plane, Sparkles, Filter, ChevronDown, CheckCircle2, Flame, AlertCircle, MessageSquare, ShieldCheck, HelpCircle, FileText, CloudSun, Utensils, Search, Users } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui-new/Card";
import { Badge } from "@/components/ui-new/Badge";
import { Button } from "@/components/ui-new/Button";
import AiSearchBar from "@/components/AiSearchBar";

export const dynamic = 'force-dynamic';

const COUNTRY_CONFIG: Record<string, any> = {
  japan: {
    name: "ญี่ปุ่น", searchName: "Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
    cities: ["tokyo", "osaka", "hokkaido", "fukuoka", "okinawa"],
    cityNames: ["โตเกียว", "โอซาก้า", "ฮอกไกโด", "ฟุกุโอกะ", "โอกินาว่า"],
    seasons: [
      { name: "🌸 ซากุระ", desc: "มีนาคม - เมษายน" },
      { name: "🍁 ใบไม้เปลี่ยนสี", desc: "ตุลาคม - พฤศจิกายน" },
      { name: "⛄ หิมะ / เล่นสกี", desc: "ธันวาคม - กุมภาพันธ์" },
      { name: "🎏 Golden Week", desc: "ปลายเมษายน - ต้นพฤษภาคม" }
    ],
    visa: "คนไทยเข้าญี่ปุ่นได้โดยไม่ต้องขอวีซ่า พำนักได้ไม่เกิน 15 วัน เพียงแค่เตรียมพาสปอร์ตที่มีอายุเหลือมากกว่า 6 เดือน"
  },
  china: {
    name: "จีน", searchName: "China",
    image: "https://images.unsplash.com/photo-1508804185872-d7bad800043e",
    cities: ["beijing", "shanghai", "chengdu", "zhangjiajie", "kunming"],
    cityNames: ["ปักกิ่ง", "เซี่ยงไฮ้", "เฉิงตู", "จางเจียเจี้ย", "คุนหมิง"],
    seasons: [
      { name: "🧧 ตรุษจีน", desc: "มกราคม - กุมภาพันธ์" },
      { name: "⛄ หิมะฮาร์บิน", desc: "ธันวาคม - กุมภาพันธ์" },
      { name: "🏞️ จางเจียเจี้ย", desc: "เที่ยวได้ตลอดปี" },
      { name: "🍁 ฤดูใบไม้ร่วง", desc: "กันยายน - พฤศจิกายน" }
    ],
    visa: "คนไทยเข้าจีนได้โดยไม่ต้องขอวีซ่าสำหรับการท่องเที่ยว (ระยะสั้น)"
  },
  egypt: {
    name: "อียิปต์", searchName: "Egypt",
    image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50",
    cities: ["cairo", "alexandria", "luxor", "aswan"],
    cityNames: ["ไคโร", "อเล็กซานเดรีย", "ลักซอร์", "อัสวาน"],
    seasons: [
      { name: "🐪 อากาศเย็นสบาย", desc: "ตุลาคม - กุมภาพันธ์" },
      { name: "☀️ ฤดูร้อน", desc: "มิถุนายน - สิงหาคม (อากาศร้อนจัด)" }
    ],
    visa: "ต้องขอวีซ่าอียิปต์ล่วงหน้า หรือสามารถขอ Visa on Arrival ได้ที่สนามบินสำหรับบางกรณี (โปรดสอบถามเจ้าหน้าที่ทัวร์)"
  },
  georgia: {
    name: "จอร์เจีย", searchName: "Georgia",
    image: "https://images.unsplash.com/photo-1565008576549-57569a49371d",
    cities: ["tbilisi", "gudauri", "batumi", "kazbegi"],
    cityNames: ["ทบิลิซี", "กูดาวรี", "บาทูมี", "คาซเบกิ"],
    seasons: [
      { name: "⛄ เล่นสกี (ฤดูหนาว)", desc: "ธันวาคม - กุมภาพันธ์" },
      { name: "🌸 ฤดูใบไม้ผลิ", desc: "พฤษภาคม - มิถุนายน (ดอกไม้บาน)" }
    ],
    visa: "คนไทยเข้าจอร์เจียได้ฟรีโดยไม่ต้องขอวีซ่า พำนักได้นานถึง 365 วัน!"
  },
  turkey: {
    name: "ตุรกี", searchName: "Turkey",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200",
    cities: ["istanbul", "cappadocia", "pamukkale", "antalya"],
    cityNames: ["อิสตันบูล", "คัปปาโดเกีย", "ปามุคคาเล่", "อันตัลยา"],
    seasons: [
      { name: "🎈 ขึ้นบอลลูน", desc: "พฤษภาคม - ตุลาคม (สภาพอากาศเอื้ออำนวย)" },
      { name: "❄️ ฤดูหนาว/หิมะ", desc: "พฤศจิกายน - เมษายน" }
    ],
    visa: "คนไทยเข้าตุรกีได้โดยไม่ต้องขอวีซ่า พำนักได้ไม่เกิน 30 วัน"
  },
  france: {
    name: "ฝรั่งเศส", searchName: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    cities: ["paris", "nice", "lyon", "marseille"],
    cityNames: ["ปารีส", "นีซ", "ลียง", "มาร์แซย์"],
    seasons: [
      { name: "🌷 ฤดูใบไม้ผลิ", desc: "มีนาคม - พฤษภาคม" },
      { name: "🍂 ฤดูใบไม้ร่วง", desc: "กันยายน - พฤศจิกายน" }
    ],
    visa: "ต้องขอวีซ่าแชงเก้นล่วงหน้า แนะนำให้ยื่นก่อนเดินทางอย่างน้อย 1-2 เดือน"
  },
  switzerland: {
    name: "สวิตเซอร์แลนด์", searchName: "Switzerland",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99",
    cities: ["zurich", "geneva", "lucerne", "zermatt"],
    cityNames: ["ซูริก", "เจนีวา", "ลูเซิร์น", "เซอร์แมท"],
    seasons: [
      { name: "🏔️ ชมยอดเขาแบบสดใส", desc: "มิถุนายน - สิงหาคม" },
      { name: "⛄ เล่นสกี/เทศกาลหิมะ", desc: "ธันวาคม - มีนาคม" }
    ],
    visa: "ต้องขอวีซ่าแชงเก้นล่วงหน้า แนะนำให้ยื่นก่อนเดินทางอย่างน้อย 1-2 เดือน"
  },
  italy: {
    name: "อิตาลี", searchName: "Italy",
    image: "https://images.unsplash.com/photo-1515542622106-78b28af7815b",
    cities: ["rome", "venice", "milan", "florence"],
    cityNames: ["โรม", "เวนิส", "มิลาน", "ฟลอเรนซ์"],
    seasons: [
      { name: "☀️ ฤดูร้อน", desc: "มิถุนายน - สิงหาคม (ฟ้าใส ถ่ายรูปสวย)" },
      { name: "🎭 เทศกาลคาร์นิวัล", desc: "กุมภาพันธ์ - มีนาคม (เวนิส)" }
    ],
    visa: "ต้องขอวีซ่าแชงเก้นล่วงหน้า แนะนำให้ยื่นก่อนเดินทางอย่างน้อย 1-2 เดือน"
  },
  uk: {
    name: "อังกฤษ", searchName: "UK",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad",
    cities: ["london", "manchester", "edinburgh", "liverpool"],
    cityNames: ["ลอนดอน", "แมนเชสเตอร์", "เอดินบะระ", "ลิเวอร์พูล"],
    seasons: [
      { name: "🌷 ฤดูใบไม้ผลิ", desc: "เมษายน - มิถุนายน (อากาศดี)" },
      { name: "⚽ ฤดูกาลฟุตบอล", desc: "สิงหาคม - พฤษภาคม" }
    ],
    visa: "ต้องขอวีซ่าท่องเที่ยวอังกฤษ (UK Visa) ล่วงหน้า (ไม่สามารถใช้แชงเก้นได้)"
  },
  korea: {
    name: "เกาหลี", searchName: "Korea",
    image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451",
    cities: ["seoul", "jeju", "busan", "nami"],
    cityNames: ["โซล", "เชจู", "ปูซาน", "เกาะนามิ"],
    seasons: [
      { name: "🌸 ซากุระเกาหลี", desc: "เมษายน" },
      { name: "⛄ เล่นสกีหิมะ", desc: "ธันวาคม - กุมภาพันธ์" }
    ],
    visa: "ไม่ต้องขอวีซ่า แต่ต้องลงทะเบียน K-ETA ล่วงหน้าก่อนเดินทาง"
  },
  taiwan: {
    name: "ไต้หวัน", searchName: "Taiwan",
    image: "https://images.unsplash.com/photo-1558000143-a6120ee5d985",
    cities: ["taipei", "taichung", "kaohsiung", "sun-moon-lake"],
    cityNames: ["ไทเป", "ไทจง", "เกาสง", "ทะเลสาบสุริยันจันทรา"],
    seasons: [
      { name: "🌸 ชมซากุระ", desc: "กุมภาพันธ์ - มีนาคม" },
      { name: "🍂 อากาศเย็นสบาย", desc: "ตุลาคม - ธันวาคม" }
    ],
    visa: "คนไทยเข้าฟรีไม่ต้องขอวีซ่า (ฟรีวีซ่าถึงวันที่ 31 ก.ค. 2568)"
  },
  "hong-kong": {
    name: "ฮ่องกง", searchName: "Hong Kong",
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9",
    cities: ["victoria-peak", "disneyland", "lantau", "mongkok"],
    cityNames: ["วิกตอเรียพีค", "ดิสนีย์แลนด์", "ลันเตา", "มงก๊ก"],
    seasons: [
      { name: "🛍️ ลดทั้งเกาะ", desc: "กรกฎาคม - สิงหาคม" },
      { name: "⛄ ฤดูหนาว", desc: "ธันวาคม - กุมภาพันธ์" }
    ],
    visa: "คนไทยเข้าฮ่องกงฟรีไม่ต้องขอวีซ่า พำนักได้ไม่เกิน 30 วัน"
  },
  singapore: {
    name: "สิงคโปร์", searchName: "Singapore",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd",
    cities: ["marina-bay", "sentosa", "universal-studios", "jewel"],
    cityNames: ["มารีน่าเบย์", "เซนโตซ่า", "ยูนิเวอร์แซลสตูดิโอ", "จีเวล"],
    seasons: [
      { name: "☀️ เที่ยวได้ตลอดปี", desc: "สภาพอากาศอบอุ่นตลอดปี มีฝนบ้างบางช่วง" }
    ],
    visa: "คนไทยเข้าฟรี กรอก SG Arrival Card ก่อนเดินทาง"
  },
  vietnam: {
    name: "เวียดนาม", searchName: "Vietnam",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592",
    cities: ["hanoi", "danang", "ho-chi-minh", "sapa", "bana-hills"],
    cityNames: ["ฮานอย", "ดานัง", "โฮจิมินห์", "ซาปา", "บานาฮิลล์"],
    seasons: [
      { name: "⛄ ซาปาหนาวมาก", desc: "ธันวาคม - มกราคม (อาจมีหิมะ)" },
      { name: "☀️ บานาฮิลล์อากาศดี", desc: "เที่ยวได้ตลอดปี" }
    ],
    visa: "คนไทยเข้าเวียดนามฟรี พำนักได้ไม่เกิน 30 วัน"
  },
  germany: {
    name: "เยอรมนี", searchName: "Germany",
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b",
    cities: ["berlin", "munich", "frankfurt", "neuschwanstein"],
    cityNames: ["เบอร์ลิน", "มิวนิก", "แฟรงก์เฟิร์ต", "ปราสาทนอยชวานสไตน์"],
    seasons: [
      { name: "🍻 Oktoberfest", desc: "กันยายน - ตุลาคม" },
      { name: "🎄 ตลาดคริสต์มาส", desc: "ธันวาคม" }
    ],
    visa: "ต้องขอวีซ่าแชงเก้นล่วงหน้า"
  },
  austria: {
    name: "ออสเตรีย", searchName: "Austria",
    image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af",
    cities: ["vienna", "salzburg", "innsbruck", "hallstatt"],
    cityNames: ["เวียนนา", "ซาลซ์บูร์ก", "อินส์บรุค", "ฮัลล์สตัทท์"],
    seasons: [
      { name: "⛄ หิมะตกสวยงาม", desc: "ธันวาคม - มีนาคม" },
      { name: "🌷 ใบไม้ผลิ", desc: "เมษายน - พฤษภาคม" }
    ],
    visa: "ต้องขอวีซ่าแชงเก้นล่วงหน้า"
  },
  spain: {
    name: "สเปน", searchName: "Spain",
    image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325",
    cities: ["madrid", "barcelona", "seville", "valencia"],
    cityNames: ["มาดริด", "บาร์เซโลนา", "เซบียา", "บาเลนเซีย"],
    seasons: [
      { name: "☀️ อบอุ่น", desc: "เมษายน - ตุลาคม" }
    ],
    visa: "ต้องขอวีซ่าแชงเก้นล่วงหน้า"
  },
  portugal: {
    name: "โปรตุเกส", searchName: "Portugal",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b",
    cities: ["lisbon", "porto", "sintra"],
    cityNames: ["ลิสบอน", "ปอร์โต", "ซินทรา"],
    seasons: [
      { name: "☀️ อากาศเย็นสบาย", desc: "มีนาคม - ตุลาคม" }
    ],
    visa: "ต้องขอวีซ่าแชงเก้นล่วงหน้า"
  },
  "czech-republic": {
    name: "เช็ก", searchName: "Czech",
    image: "https://images.unsplash.com/photo-1519677100203-a0e668c92439",
    cities: ["prague", "cesky-krumlov", "karlovy-vary"],
    cityNames: ["ปราก", "เชสกี้ครุมลอฟ", "คาร์โลวีวารี"],
    seasons: [
      { name: "🍂 โรแมนติก", desc: "ตลอดปี" }
    ],
    visa: "ต้องขอวีซ่าแชงเก้นล่วงหน้า"
  },
  hungary: {
    name: "ฮังการี", searchName: "Hungary",
    image: "https://images.unsplash.com/photo-1541358969440-ce80fcefece6",
    cities: ["budapest"],
    cityNames: ["บูดาเปสต์"],
    seasons: [
      { name: "🌟 ล่องเรือดานูบ", desc: "เที่ยวได้ตลอดปี" }
    ],
    visa: "ต้องขอวีซ่าแชงเก้นล่วงหน้า"
  },
  iceland: {
    name: "ไอซ์แลนด์", searchName: "Iceland",
    image: "https://images.unsplash.com/photo-1476610287331-b711a62e400e",
    cities: ["reykjavik", "blue-lagoon", "golden-circle"],
    cityNames: ["เรคยาวิก", "บลูลากูน", "โกลเด้นเซอร์เคิล"],
    seasons: [
      { name: "✨ ล่าแสงเหนือ", desc: "กันยายน - เมษายน" }
    ],
    visa: "ต้องขอวีซ่าแชงเก้นล่วงหน้า"
  },
  dubai: {
    name: "ดูไบ (UAE)", searchName: "Dubai",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
    cities: ["dubai", "abu-dhabi"],
    cityNames: ["ดูไบ", "อาบูดาบี"],
    seasons: [
      { name: "☀️ อากาศเย็นสบาย", desc: "พฤศจิกายน - มีนาคม (หน้าร้อนจะร้อนมาก)" }
    ],
    visa: "ต้องขอวีซ่า UAE ล่วงหน้า"
  },
  jordan: {
    name: "จอร์แดน", searchName: "Jordan",
    image: "https://images.unsplash.com/photo-1548810237-7756f140683a",
    cities: ["petra", "amman", "dead-sea", "wadi-rum"],
    cityNames: ["เพตรา", "อัมมาน", "เดดซี", "วาดิรัม"],
    seasons: [
      { name: "☀️ อากาศดี", desc: "มีนาคม - พฤษภาคม และ กันยายน - พฤศจิกายน" }
    ],
    visa: "ขอ Visa on Arrival ได้ หรือซื้อ Jordan Pass"
  },
  morocco: {
    name: "โมร็อกโก", searchName: "Morocco",
    image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70",
    cities: ["marrakech", "casablanca", "fes", "chefchaouen"],
    cityNames: ["มาราเกช", "คาซาบลังกา", "เฟส", "เชฟชาอุน"],
    seasons: [
      { name: "🐪 ทะเลทรายเย็นสบาย", desc: "ตุลาคม - เมษายน" }
    ],
    visa: "คนไทยต้องขอวีซ่าล่วงหน้าก่อนเดินทางเข้าโมร็อกโก"
  },
  "united-states": {
    name: "สหรัฐอเมริกา", searchName: "USA",
    image: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74",
    cities: ["new-york", "los-angeles", "las-vegas", "san-francisco"],
    cityNames: ["นิวยอร์ก", "ลอสแอนเจลิส", "ลาสเวกัส", "ซานฟรานซิสโก"],
    seasons: [
      { name: "🗽 เที่ยวได้ตลอดปี", desc: "ขึ้นอยู่กับรัฐ" }
    ],
    visa: "ต้องขอ US Visa ล่วงหน้า (รอนาน ควรวางแผนเนิ่นๆ)"
  },
  canada: {
    name: "แคนาดา", searchName: "Canada",
    image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce",
    cities: ["toronto", "vancouver", "banff", "niagara"],
    cityNames: ["โทรอนโต", "แวนคูเวอร์", "แบนฟ์", "น้ำตกไนแองการ่า"],
    seasons: [
      { name: "🍁 ใบไม้เปลี่ยนสี", desc: "กันยายน - ตุลาคม" }
    ],
    visa: "ต้องขอวีซ่าแคนาดาล่วงหน้า"
  },
  australia: {
    name: "ออสเตรเลีย", searchName: "Australia",
    image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be",
    cities: ["sydney", "melbourne", "gold-coast", "perth"],
    cityNames: ["ซิดนีย์", "เมลเบิร์น", "โกลด์โคสต์", "เพิร์ท"],
    seasons: [
      { name: "☀️ ฤดูร้อนสดใส", desc: "ธันวาคม - กุมภาพันธ์" }
    ],
    visa: "ต้องขอวีซ่า (ETA/eVisitor) ล่วงหน้า"
  },
  "new-zealand": {
    name: "นิวซีแลนด์", searchName: "New Zealand",
    image: "https://images.unsplash.com/photo-1469521669194-bce765805566",
    cities: ["auckland", "queenstown", "christchurch", "rotorua"],
    cityNames: ["โอ๊คแลนด์", "ควีนส์ทาวน์", "ไครสต์เชิร์ช", "โรโตรัว"],
    seasons: [
      { name: "🍁 ใบไม้เปลี่ยนสี", desc: "มีนาคม - พฤษภาคม" }
    ],
    visa: "ต้องขอวีซ่า (NZeTA หรือ Visitor Visa) ล่วงหน้า"
  }
};

const DEFAULT_CONFIG = {
  name: "ต่างประเทศ", searchName: "",
  image: "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1",
  cities: [], cityNames: [],
  seasons: [
    { name: "☀️ High Season", desc: "ขึ้นอยู่กับแต่ละภูมิภาค กรุณาสอบถามเจ้าหน้าที่" },
    { name: "❄️ Low Season", desc: "ราคาพิเศษ คนน้อย" }
  ],
  visa: "สำหรับกรุ๊ปทัวร์ บางโปรแกรมอาจรวมค่าวีซ่ากรุ๊ปแล้ว หรือฟรีวีซ่าสำหรับคนไทย โปรดตรวจสอบรายละเอียดในแต่ละโปรแกรม"
};

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const config = COUNTRY_CONFIG[params.slug] || { name: params.slug };
  return {
    title: `ทัวร์${config.name} 2569 โปรแกรมทัวร์${config.name} ราคาดี มี AI ช่วยค้นหา | Jongtour`,
    description: `ค้นหาแพ็กเกจทัวร์${config.name} อัปเดตล่าสุด เปรียบเทียบราคา จองง่าย ปลอดภัย 100% พร้อมผู้เชี่ยวชาญดูแลตลอดการเดินทาง`,
    alternates: {
      canonical: `https://jongtour.com/country/${params.slug}`
    }
  };
}

export default async function CountryPage({ params }: { params: { slug: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const config = COUNTRY_CONFIG[params.slug] || { ...DEFAULT_CONFIG, name: params.slug, searchName: params.slug };
  const thCountryName = config.name;
  const searchName = config.searchName;

  // Search by country via existing tour_destinations table
  const { data: dests } = await supabase
    .from('tour_destinations')
    .select('tourId')
    .ilike('country', `%${searchName}%`)
    .limit(50);

  const tourIds = dests?.map(d => d.tourId) || [];

  let tours = [];
  if (tourIds.length > 0) {
    const { data: tourData } = await supabase
      .from('tours')
      .select(`
        id, tourName, tourCode, durationDays,
        images:tour_images(imageUrl),
        departures(startDate, remainingSeats, prices(sellingPrice)),
        supplier:suppliers(displayName)
      `)
      .in('id', tourIds)
      .limit(12);
    tours = tourData || [];
  }

  // Formatting for presentation (No DB logic changes)
  const formattedTours = tours.map((t: any) => {
    const validDeps = t.departures?.filter((d: any) => new Date(d.startDate) > new Date()) || [];
    const minPrice = validDeps.length > 0 ? Math.min(...validDeps.map((d: any) => d.prices?.[0]?.sellingPrice || 999999)) : 0;
    
    const isFlashSale = validDeps.some((d: any) => new Date(d.startDate).getTime() - new Date().getTime() < 14 * 24 * 60 * 60 * 1000);
    const isConfirmed = validDeps.some((d: any) => d.status === 'CONFIRMED' || d.remainingSeats < 10);
    const lowSeats = validDeps.some((d: any) => d.remainingSeats > 0 && d.remainingSeats <= 5);

    return {
      id: t.id,
      title: t.tourName,
      code: t.tourCode,
      days: t.durationDays,
      image: t.images?.[0]?.imageUrl || config.image,
      price: minPrice,
      supplier: t.supplier?.displayName || "Jongtour Partner",
      isFlashSale,
      isConfirmed,
      lowSeats,
      bookingUrl: `/tour/${t.id}`
    };
  }).filter((t: any) => t.price > 0);

  const flashSaleTours = formattedTours.filter((t: any) => t.isFlashSale);

  return (
    <main className="min-h-screen bg-background pb-20 font-sans">
      
      {/* Hero Section */}
      <div className="relative pt-24 pb-32 overflow-hidden bg-trust-900">
        <div className="absolute inset-0">
          <img 
            src={config.image} 
            alt={`ทัวร์${thCountryName}`} 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-trust-900 via-trust-900/60 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 z-10 flex flex-col items-center text-center mt-10">
          <div className="flex items-center gap-2 text-trust-300 text-xs md:text-sm font-bold tracking-wider mb-6">
            <Link href="/" className="hover:text-white transition-colors">หน้าหลัก</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/tour/search" className="hover:text-white transition-colors">ทัวร์ต่างประเทศ</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">ทัวร์{thCountryName}</span>
          </div>

          <Badge variant="brand" className="mb-6 px-4 py-1.5 text-sm">แพ็กเกจยอดนิยม 2026</Badge>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 drop-shadow-lg">
            ทัวร์{thCountryName} <span className="text-primary">คุ้มที่สุด</span>
          </h1>
          <p className="text-lg text-trust-200 max-w-2xl mb-10 font-medium">
            ค้นหาแพ็กเกจทัวร์{thCountryName} อัปเดตล่าสุด เปรียบเทียบราคาจากโฮลเซลล์ชั้นนำ จองง่าย ปลอดภัย 100%
          </p>

          <div className="flex gap-4">
             <Button variant="brand" className="shadow-lg gap-2" asChild>
                <Link href="#tours"><Search className="w-4 h-4" /> ดูโปรแกรมทั้งหมด</Link>
             </Button>
             <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 gap-2">
                <Sparkles className="w-4 h-4" /> ค้นหาทัวร์ด้วย AI
             </Button>
          </div>

          <div className="w-full max-w-4xl mt-10">
             <AiSearchBar placeholder={`AI ช่วยหาทัวร์${thCountryName} เช่น "ไป${thCountryName}เดือนหน้า ราคาไม่เกิน 30,000"`} defaultContext={{ country: searchName }} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
         {/* 3. Popular Cities */}
         {config.cities.length > 0 && (
           <div className="mb-16">
              <h2 className="text-2xl font-black text-trust-900 mb-6 text-center">จุดหมายยอดนิยมใน{thCountryName}</h2>
              <div className="flex flex-wrap justify-center gap-4">
                 {config.cities.map((cityEn: string, idx: number) => (
                    <Link key={cityEn} href={`/country/${params.slug}/${cityEn}`} className="w-40 h-32 md:w-48 md:h-36">
                       <Card className="overflow-hidden hover:border-primary transition-all group shadow-sm border-border cursor-pointer h-full">
                          <div className="h-full bg-muted relative overflow-hidden">
                             <img src={config.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                             <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                             <h3 className="absolute bottom-3 left-3 text-white font-black text-lg drop-shadow-md">{config.cityNames[idx]}</h3>
                          </div>
                       </Card>
                    </Link>
                 ))}
              </div>
           </div>
         )}

         {/* 5. Promotion Section */}
         {flashSaleTours.length > 0 && (
            <div className="mb-16">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-trust-900 flex items-center gap-2"><Flame className="w-6 h-6 text-destructive" /> ทัวร์ไฟไหม้{thCountryName}</h2>
                  <Link href="/deals/flash-sale" className="text-sm font-bold text-primary hover:underline">ดูทั้งหมด</Link>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {flashSaleTours.slice(0, 4).map((tour: any) => <TourCard key={tour.id} tour={tour} />)}
               </div>
            </div>
         )}

         {/* 6. Travel Season Section */}
         <div className="mb-16 bg-muted/30 rounded-3xl p-8 border border-border">
            <h2 className="text-2xl font-black text-trust-900 mb-6 flex items-center gap-2"><CloudSun className="w-6 h-6 text-primary" /> เที่ยว{thCountryName}ช่วงไหนดี?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {config.seasons.map((s: any) => (
                  <div key={s.name} className="bg-white p-4 rounded-xl border border-border shadow-sm text-center hover:border-primary transition-colors cursor-pointer flex flex-col justify-center min-h-[100px]">
                     <p className="font-bold text-trust-900">{s.name}</p>
                     <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* 4. Tour Listing (All) */}
         <div id="tours" className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 pt-10">
            <h2 className="text-2xl font-black text-trust-900">แพ็กเกจทัวร์{thCountryName}ทั้งหมด ({formattedTours.length})</h2>
            <div className="flex items-center gap-2">
               <Button variant="outline" className="bg-white gap-2"><Calendar className="w-4 h-4" /> เดือนเดินทาง <ChevronDown className="w-3 h-3" /></Button>
               <Button variant="outline" className="bg-white gap-2"><Filter className="w-4 h-4" /> ตัวกรองเพิ่มเติม <ChevronDown className="w-3 h-3" /></Button>
            </div>
         </div>

         {/* Tour Grid or Empty State */}
         {formattedTours.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-border shadow-sm max-w-4xl mx-auto">
               <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plane className="w-12 h-12 text-muted-foreground opacity-50" />
               </div>
               <h3 className="text-2xl font-black text-trust-900 mb-3">ยังไม่มีโปรแกรมทัวร์{thCountryName} ในขณะนี้</h3>
               <p className="text-trust-600 mb-8 max-w-lg mx-auto">
                  ขออภัยครับ โปรแกรมสำหรับประเทศนี้อาจจะเต็มหมดแล้ว หรือกำลังรออัปเดตจากพาร์ทเนอร์โฮลเซลล์ 
                  คุณสามารถให้ AI ช่วยหาประเทศใกล้เคียง หรือฝากข้อมูลให้เจ้าหน้าที่แจ้งเตือนเมื่อมีโปรแกรมใหม่ได้ครับ
               </p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
                  {/* Option 1: AI Search */}
                  <Card className="border-primary/20 shadow-sm hover:border-primary transition-colors">
                     <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary">
                              <Sparkles className="w-5 h-5" />
                           </div>
                           <h4 className="font-bold text-trust-900">ให้ AI ช่วยหาเส้นทางอื่น</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">พิมพ์บอกความต้องการ เช่น "แนะนำประเทศใกล้เคียงที่ไปเที่ยวช่วงเดือนหน้า"</p>
                        <AiSearchBar placeholder="พิมพ์ความต้องการของคุณที่นี่..." defaultContext={{ country: searchName }} />
                     </CardContent>
                  </Card>

                  {/* Option 2: Lead Gen */}
                  <Card className="border-border shadow-sm hover:border-trust-400 transition-colors bg-muted/30">
                     <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-trust-700">
                              <CheckCircle2 className="w-5 h-5" />
                           </div>
                           <h4 className="font-bold text-trust-900">แจ้งเตือนเมื่อมีโปรแกรม</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">ทิ้งเบอร์ติดต่อหรือ Line ID ไว้ แอดมินจะรีบแจ้งทันทีที่มีทัวร์{thCountryName}อัปเดตใหม่</p>
                        <form className="flex flex-col gap-2">
                           <input type="text" placeholder="ชื่อ - นามสกุล" className="h-10 px-3 rounded-lg border border-border text-sm w-full outline-none focus:border-primary" />
                           <input type="text" placeholder="เบอร์โทร / Line ID" className="h-10 px-3 rounded-lg border border-border text-sm w-full outline-none focus:border-primary" />
                           <Button type="button" variant="brand" className="w-full mt-2">ฝากข้อมูลติดต่อ</Button>
                        </form>
                     </CardContent>
                  </Card>
               </div>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {formattedTours.map((tour: any) => (
                  <TourCard key={tour.id} tour={tour} />
               ))}
            </div>
         )}

         {/* 7. Travel Guide Section */}
         <div className="mt-20 mb-16">
            <h2 className="text-2xl font-black text-trust-900 mb-8 text-center">คู่มือเตรียมตัวเที่ยว{thCountryName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className="shadow-sm border-border bg-white">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                     <div className="w-12 h-12 bg-primary-50 text-primary rounded-full flex items-center justify-center mb-4"><FileText className="w-6 h-6" /></div>
                     <h3 className="font-bold text-trust-900 mb-2">วีซ่าและเอกสาร</h3>
                     <p className="text-sm text-muted-foreground">{config.visa}</p>
                  </CardContent>
               </Card>
               <Card className="shadow-sm border-border bg-white">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                     <div className="w-12 h-12 bg-primary-50 text-primary rounded-full flex items-center justify-center mb-4"><CloudSun className="w-6 h-6" /></div>
                     <h3 className="font-bold text-trust-900 mb-2">สภาพอากาศ</h3>
                     <p className="text-sm text-muted-foreground">ตรวจสอบอุณหภูมิในแต่ละฤดูเพื่อเตรียมเครื่องแต่งกายให้พร้อม โดยเฉพาะฤดูหนาวที่ต้องเตรียมเสื้อกันหนาวให้เพียงพอ</p>
                  </CardContent>
               </Card>
               <Card className="shadow-sm border-border bg-white">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                     <div className="w-12 h-12 bg-primary-50 text-primary rounded-full flex items-center justify-center mb-4"><Utensils className="w-6 h-6" /></div>
                     <h3 className="font-bold text-trust-900 mb-2">อาหารท้องถิ่น</h3>
                     <p className="text-sm text-muted-foreground">เตรียมท้องให้พร้อมสำหรับเมนูยอดฮิต และโปรดแจ้งทีมงานล่วงหน้าหากท่านแพ้อาหารหรือรับประทานมังสวิรัติ</p>
                  </CardContent>
               </Card>
            </div>
         </div>

         {/* 8. CTA Section */}
         <div className="mt-10 mb-10 bg-trust-900 rounded-3xl p-10 text-center text-white overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/2"></div>
            <h2 className="text-3xl font-black mb-4 relative z-10">ยังหาโปรแกรมทัวร์{thCountryName}ที่ถูกใจไม่เจอ?</h2>
            <p className="text-trust-200 mb-8 max-w-2xl mx-auto relative z-10">ให้ AI ช่วยหา หรือติดต่อผู้เชี่ยวชาญของเราเพื่อช่วยเลือกโปรแกรม หรือจัดกรุ๊ปเหมาส่วนตัว (Private Group) ในราคาพิเศษ</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
               <Button variant="brand" size="lg" className="gap-2 shadow-lg shadow-primary/30 text-base h-12 px-8">
                  <Sparkles className="w-5 h-5" /> ให้ AI ช่วยออกแบบทริป
               </Button>
               <Button variant="outline" size="lg" className="gap-2 bg-transparent border-white/20 text-white hover:bg-white/10 h-12 px-8">
                  <Users className="w-5 h-5" /> จัดกรุ๊ปเหมาส่วนตัว
               </Button>
               <Button variant="outline" size="lg" className="gap-2 bg-transparent border-white/20 text-white hover:bg-white/10 h-12 px-8">
                  <MessageSquare className="w-5 h-5" /> ติดต่อแอดมิน
               </Button>
            </div>
         </div>

      </div>
    </main>
  );
}

function TourCard({ tour }: { tour: any }) {
   return (
      <Link href={tour.bookingUrl} className="group h-full">
         <Card className="h-full border-border hover:border-primary/50 hover:shadow-floating transition-all duration-300 overflow-hidden flex flex-col">
            <div className="relative h-48 overflow-hidden bg-muted">
               <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-trust-900 flex items-center gap-1 shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-primary" /> {tour.days} วัน
               </div>
               <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {tour.isFlashSale && <Badge variant="brand" className="shadow-md text-[10px] px-1.5 py-0">🔥 ไฟไหม้</Badge>}
                  {tour.isConfirmed && <Badge variant="success" className="shadow-md text-[10px] px-1.5 py-0 bg-emerald-500 hover:bg-emerald-600 border-0">✅ คอนเฟิร์มเดินทาง</Badge>}
                  {tour.lowSeats && <Badge variant="destructive" className="shadow-md text-[10px] px-1.5 py-0 bg-red-500 border-0">⏳ ที่นั่งเหลือน้อย</Badge>}
               </div>
            </div>
            <CardContent className="p-4 flex-1 flex flex-col">
               <div className="text-[10px] font-bold text-muted-foreground mb-1 font-mono">{tour.code}</div>
               <h3 className="font-bold text-trust-900 text-[15px] leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors">{tour.title}</h3>
               
               <div className="mt-auto pt-3 border-t border-border flex justify-between items-end">
                  <div>
                     <p className="text-[10px] text-muted-foreground">ราคาเริ่มต้น</p>
                     <p className="font-black text-lg text-primary">฿{tour.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] text-muted-foreground mb-0.5">ให้บริการโดย</p>
                     <p className="text-[10px] font-bold text-trust-700 max-w-[100px] truncate">{tour.supplier}</p>
                  </div>
               </div>
            </CardContent>
         </Card>
      </Link>
   );
}
