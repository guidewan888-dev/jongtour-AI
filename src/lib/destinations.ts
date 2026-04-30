export interface DestinationNode {
  name: string; // ชื่อภาษาไทย
  keywords: string[]; // คำค้นหาในฐานข้อมูล (จะเอาไป match กับ destination และ title)
  coverImage: string; // รูปหน้าปก
  children?: Record<string, DestinationNode>; // สถานที่ย่อย
}

export const destinationConfig: Record<string, DestinationNode> = {
  asia: {
    name: "เอเชีย",
    keywords: ["CHINA", "JAPAN", "VIETNAM", "HONG KONG", "KOREA", "TAIWAN", "SINGAPORE", "INDIA", "เอเชีย", "ญี่ปุ่น", "จีน", "เกาหลี", "ไต้หวัน", "เวียดนาม", "ฮ่องกง", "สิงคโปร์", "อินเดีย"],
    coverImage: "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000",
    children: {
      japan: {
        name: "ญี่ปุ่น",
        keywords: ["JAPAN", "ญี่ปุ่น", "ฮอกไกโด", "โตเกียว", "โอซาก้า", "ฟุกุโอกะ", "นาโกย่า"],
        coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000",
        children: {
          hokkaido: {
            name: "ฮอกไกโด",
            keywords: ["ฮอกไกโด", "Hokkaido", "ซัปโปโร", "โอตารุ", "ฟูราโน่"],
            coverImage: "https://images.unsplash.com/photo-1580136611385-f55db1109a1c?q=80&w=2000"
          },
          tokyo: {
            name: "โตเกียว",
            keywords: ["โตเกียว", "Tokyo", "ฟูจิ", "ชินจูกุ"],
            coverImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2000"
          },
          osaka: {
            name: "โอซาก้า",
            keywords: ["โอซาก้า", "Osaka", "คันไซ", "เกียวโต"],
            coverImage: "https://images.unsplash.com/photo-1590559899731-a38283bce401?q=80&w=2000"
          },
          fukuoka: {
            name: "ฟุกุโอกะ",
            keywords: ["ฟุกุโอกะ", "Fukuoka", "คิวชู"],
            coverImage: "https://images.unsplash.com/photo-1591289009723-aef0a1a8a211?q=80&w=2000"
          },
          nagoya: {
            name: "นาโกย่า",
            keywords: ["นาโกย่า", "Nagoya", "ชูบุ", "ทาคายาม่า", "ชิราคาวาโกะ"],
            coverImage: "https://images.unsplash.com/photo-1583134104273-092576b2bfad?q=80&w=2000"
          },
          okinawa: {
            name: "โอกินาว่า",
            keywords: ["โอกินาว่า", "Okinawa"],
            coverImage: "https://images.unsplash.com/photo-1586714029272-b5eef9a6e12e?q=80&w=2000"
          }
        }
      },
      china: {
        name: "จีน",
        keywords: ["CHINA", "จีน", "กวางเจา", "จู่ไห่", "เซี่ยงไฮ้", "ปักกิ่ง", "เฉิงตู", "ฉงชิ่ง", "ฮาร์บิ้น"],
        coverImage: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2000",
        children: {
          guangzhou: {
            name: "กวางเจา",
            keywords: ["กวางเจา", "กวางโจว", "Guangzhou"],
            coverImage: "https://images.unsplash.com/photo-1558281050-0cb2a988d8b2?q=80&w=2000"
          },
          zhuhai: {
            name: "จูไห่",
            keywords: ["จูไห่", "Zhuhai", "จู่ไห่"],
            coverImage: "https://images.unsplash.com/photo-1599863486333-e28a5da58c0c?q=80&w=2000"
          },
          chongqing: {
            name: "ฉงชิ่ง",
            keywords: ["ฉงชิ่ง", "Chongqing", "อู่หลง"],
            coverImage: "https://images.unsplash.com/photo-1559868661-82d8c3686cd4?q=80&w=2000"
          },
          shanghai: {
            name: "เซี่ยงไฮ้",
            keywords: ["เซี่ยงไฮ้", "Shanghai", "ดิสนีย์แลนด์เซี่ยงไฮ้"],
            coverImage: "https://images.unsplash.com/photo-1545658966-2e8642a8b309?q=80&w=2000"
          },
          chengdu: {
            name: "เฉิงตู",
            keywords: ["เฉิงตู", "Chengdu", "จิ่วจ้ายโกว", "หมีแพนด้า"],
            coverImage: "https://images.unsplash.com/photo-1554907984-15263bf4f276?q=80&w=2000"
          },
          beijing: {
            name: "ปักกิ่ง",
            keywords: ["ปักกิ่ง", "Beijing", "กำแพงเมืองจีน"],
            coverImage: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2000"
          },
          harbin: {
            name: "ฮาร์บิ้น",
            keywords: ["ฮาร์บิ้น", "Harbin", "เทศกาลน้ำแข็ง"],
            coverImage: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?q=80&w=2000"
          }
        }
      },
      korea: {
        name: "เกาหลี",
        keywords: ["KOREA", "เกาหลี", "โซล", "ปูซาน", "เชจู"],
        coverImage: "https://images.unsplash.com/photo-1538669715315-12dd51b41eeb?q=80&w=2000",
        children: {
          seoul: {
            name: "โซล",
            keywords: ["โซล", "Seoul", "เมียงดง"],
            coverImage: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=2000"
          },
          busan: {
            name: "ปูซาน",
            keywords: ["ปูซาน", "Busan"],
            coverImage: "https://images.unsplash.com/photo-1620025986561-1694db09618a?q=80&w=2000"
          },
          jeju: {
            name: "เชจู",
            keywords: ["เชจู", "Jeju"],
            coverImage: "https://images.unsplash.com/photo-1610484555819-27dc514fc750?q=80&w=2000"
          }
        }
      },
      taiwan: {
        name: "ไต้หวัน",
        keywords: ["TAIWAN", "ไต้หวัน", "ไทเป", "เกาสง"],
        coverImage: "https://images.unsplash.com/photo-1552993873-0aa1031d2fb7?q=80&w=2000",
        children: {
          taipei: {
            name: "ไทเป",
            keywords: ["ไทเป", "Taipei", "จิ่วเฟิ่น"],
            coverImage: "https://images.unsplash.com/photo-1508189860359-5433baed8524?q=80&w=2000"
          },
          kaohsiung: {
            name: "เกาสง",
            keywords: ["เกาสง", "Kaohsiung"],
            coverImage: "https://images.unsplash.com/photo-1574676571587-f26046e8c454?q=80&w=2000"
          }
        }
      },
      hongkong: {
        name: "ฮ่องกง",
        keywords: ["HONG KONG", "ฮ่องกง", "ดิสนีย์แลนด์", "ไหว้พระ"],
        coverImage: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?q=80&w=2000"
      },
      singapore: {
        name: "สิงคโปร์",
        keywords: ["SINGAPORE", "สิงคโปร์", "มาริน่าเบย์"],
        coverImage: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2000"
      },
      india: {
        name: "อินเดีย",
        keywords: ["INDIA", "อินเดีย", "นิวเดลี", "ทัชมาฮาล"],
        coverImage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000"
      },
      vietnam: {
        name: "เวียดนาม",
        keywords: ["VIETNAM", "เวียดนาม", "ดานัง", "ฮานอย", "โฮจิมินห์", "ดาลัด"],
        coverImage: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2000",
        children: {
          danang: {
            name: "ดานัง",
            keywords: ["ดานัง", "Da Nang", "บานาฮิลล์"],
            coverImage: "https://images.unsplash.com/photo-1563242691-2475e771cc4e?q=80&w=2000"
          },
          hanoi: {
            name: "ฮานอย",
            keywords: ["ฮานอย", "Hanoi", "ซาปา"],
            coverImage: "https://images.unsplash.com/photo-1559592413-7ce4f0a048dc?q=80&w=2000"
          },
          hochiminh: {
            name: "โฮจิมินห์",
            keywords: ["โฮจิมินห์", "Ho Chi Minh", "มุยเน่"],
            coverImage: "https://images.unsplash.com/photo-1583417311093-39dafb7f8a97?q=80&w=2000"
          }
        }
      }
    }
  },
  europe: {
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
  }
};

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
      currentUrl += `/${key}`;
      breadcrumbs.push({ name: currentNode.name, url: currentUrl });
      currentObj = currentNode.children;
    } else {
      // ถ้าไม่เจอ slug นี้
      return { node: null, breadcrumbs };
    }
  }

  return { node: currentNode, breadcrumbs };
}
