export interface DestinationNode {
  name: string; // ชื่อภาษาไทย
  keywords: string[]; // คำค้นหาในฐานข้อมูล (จะเอาไป match กับ destination และ title)
  coverImage: string; // รูปหน้าปก
  children?: Record<string, DestinationNode>; // สถานที่ย่อย
}

export const destinationConfig: Record<string, DestinationNode> = {
  "thailand": {
    "name": "ไทย",
    "keywords": [
      "THAILAND",
      "ไทย"
    ],
    "coverImage": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2000"
  },
  "asia": {
    "name": "เอเชีย",
    "keywords": [
      "CHINA",
      "JAPAN",
      "VIETNAM",
      "HONG KONG",
      "KOREA",
      "TAIWAN",
      "SINGAPORE",
      "INDIA",
      "เอเชีย",
      "ญี่ปุ่น",
      "จีน",
      "เกาหลี",
      "ไต้หวัน",
      "เวียดนาม",
      "ฮ่องกง",
      "สิงคโปร์",
      "อินเดีย"
    ],
    "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000",
    "children": {
      "japan": {
        "name": "ญี่ปุ่น",
        "keywords": [
          "JAPAN",
          "ญี่ปุ่น",
          "ฮอกไกโด",
          "โตเกียว",
          "โอซาก้า",
          "ฟุกุโอกะ",
          "นาโกย่า"
        ],
        "coverImage": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000",
        "children": {
          "hokkaido": {
            "name": "ฮอกไกโด",
            "keywords": [
              "ฮอกไกโด",
              "Hokkaido",
              "ซัปโปโร",
              "โอตารุ",
              "ฟูราโน่"
            ],
            "coverImage": "https://images.unsplash.com/photo-1580136611385-f55db1109a1c?q=80&w=2000"
          },
          "tokyo": {
            "name": "โตเกียว",
            "keywords": [
              "โตเกียว",
              "Tokyo",
              "ฟูจิ",
              "ชินจูกุ"
            ],
            "coverImage": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2000"
          },
          "osaka": {
            "name": "โอซาก้า",
            "keywords": [
              "โอซาก้า",
              "Osaka",
              "คันไซ",
              "เกียวโต"
            ],
            "coverImage": "https://images.unsplash.com/photo-1590559899731-a38283bce401?q=80&w=2000"
          },
          "fukuoka": {
            "name": "ฟุกุโอกะ",
            "keywords": [
              "ฟุกุโอกะ",
              "Fukuoka",
              "คิวชู"
            ],
            "coverImage": "https://images.unsplash.com/photo-1591289009723-aef0a1a8a211?q=80&w=2000"
          },
          "nagoya": {
            "name": "นาโกย่า",
            "keywords": [
              "นาโกย่า",
              "Nagoya",
              "ชูบุ",
              "ทาคายาม่า",
              "ชิราคาวาโกะ"
            ],
            "coverImage": "https://images.unsplash.com/photo-1583134104273-092576b2bfad?q=80&w=2000"
          },
          "okinawa": {
            "name": "โอกินาว่า",
            "keywords": [
              "โอกินาว่า",
              "Okinawa"
            ],
            "coverImage": "https://images.unsplash.com/photo-1586714029272-b5eef9a6e12e?q=80&w=2000"
          },
          "kyoto": {
            "name": "เกียวโต",
            "keywords": [
              "เกียวโต",
              "Kyoto"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          }
        }
      },
      "china": {
        "name": "จีน",
        "keywords": [
          "CHINA",
          "จีน",
          "กวางเจา",
          "จู่ไห่",
          "เซี่ยงไฮ้",
          "ปักกิ่ง",
          "เฉิงตู",
          "ฉงชิ่ง",
          "ฮาร์บิ้น"
        ],
        "coverImage": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2000",
        "children": {
          "guangzhou": {
            "name": "กวางเจา",
            "keywords": [
              "กวางเจา",
              "กวางโจว",
              "Guangzhou"
            ],
            "coverImage": "https://images.unsplash.com/photo-1558281050-0cb2a988d8b2?q=80&w=2000"
          },
          "zhuhai": {
            "name": "จูไห่",
            "keywords": [
              "จูไห่",
              "Zhuhai",
              "จู่ไห่"
            ],
            "coverImage": "https://images.unsplash.com/photo-1599863486333-e28a5da58c0c?q=80&w=2000"
          },
          "chongqing": {
            "name": "ฉงชิ่ง",
            "keywords": [
              "ฉงชิ่ง",
              "Chongqing",
              "อู่หลง"
            ],
            "coverImage": "https://images.unsplash.com/photo-1559868661-82d8c3686cd4?q=80&w=2000"
          },
          "shanghai": {
            "name": "เซี่ยงไฮ้",
            "keywords": [
              "เซี่ยงไฮ้",
              "Shanghai",
              "ดิสนีย์แลนด์เซี่ยงไฮ้"
            ],
            "coverImage": "https://images.unsplash.com/photo-1545658966-2e8642a8b309?q=80&w=2000"
          },
          "chengdu": {
            "name": "เฉิงตู",
            "keywords": [
              "เฉิงตู",
              "Chengdu",
              "จิ่วจ้ายโกว",
              "หมีแพนด้า"
            ],
            "coverImage": "https://images.unsplash.com/photo-1554907984-15263bf4f276?q=80&w=2000"
          },
          "beijing": {
            "name": "ปักกิ่ง",
            "keywords": [
              "ปักกิ่ง",
              "Beijing",
              "กำแพงเมืองจีน"
            ],
            "coverImage": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2000"
          },
          "harbin": {
            "name": "ฮาร์บิ้น",
            "keywords": [
              "ฮาร์บิ้น",
              "Harbin",
              "เทศกาลน้ำแข็ง"
            ],
            "coverImage": "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?q=80&w=2000"
          },
          "zhangjiajie": {
            "name": "จางเจียเจี้ย",
            "keywords": [
              "จางเจียเจี้ย",
              "Zhangjiajie"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "kunming": {
            "name": "คุนหมิง",
            "keywords": [
              "คุนหมิง",
              "Kunming"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "guilin": {
            "name": "กุ้ยหลิน",
            "keywords": [
              "กุ้ยหลิน",
              "Guilin"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "xian": {
            "name": "ซีอาน",
            "keywords": [
              "ซีอาน",
              "Xian"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "silk-road": {
            "name": "เส้นทางสายไหม",
            "keywords": [
              "เส้นทางสายไหม",
              "Silk Road"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "xinjiang": {
            "name": "ซินเจียง",
            "keywords": [
              "ซินเจียง",
              "Xinjiang"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "tibet": {
            "name": "ทิเบต",
            "keywords": [
              "ทิเบต",
              "Tibet"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "lijiang": {
            "name": "ลี่เจียง",
            "keywords": [
              "ลี่เจียง",
              "Lijiang"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "yichang": {
            "name": "อี้ชาง",
            "keywords": [
              "อี้ชาง",
              "Yichang"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "hangzhou": {
            "name": "หังโจว",
            "keywords": [
              "หังโจว",
              "Hangzhou"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "dali": {
            "name": "ต้าหลี่",
            "keywords": [
              "ต้าหลี่",
              "Dali"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "luoyang": {
            "name": "ลั่วหยาง",
            "keywords": [
              "ลั่วหยาง",
              "Luoyang"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "wangxian": {
            "name": "หุบเขาเทวดา",
            "keywords": [
              "หุบเขาเทวดา",
              "Wangxian"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "enshi": {
            "name": "เอินซือ",
            "keywords": [
              "เอินซือ",
              "Enshi"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "qingdao": {
            "name": "ชิงเต่า",
            "keywords": [
              "ชิงเต่า",
              "Qingdao"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "dalian": {
            "name": "ต้าเหลียน",
            "keywords": [
              "ต้าเหลียน",
              "Dalian"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "inner-mongolia": {
            "name": "มองโกเลีย",
            "keywords": [
              "มองโกเลีย",
              "Inner Mongolia"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "no-shopping": {
            "name": "ทัวร์ไม่ลงร้าน",
            "keywords": [
              "ไม่ลงร้าน",
              "No Shopping"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "chongqing-zhangjiajie": {
            "name": "ฉงชิ่ง-จางเจียเจี้ย",
            "keywords": [
              "ฉงชิ่ง",
              "จางเจียเจี้ย"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "shanghai-beijing": {
            "name": "เซี่ยงไฮ้-ปักกิ่ง",
            "keywords": [
              "เซี่ยงไฮ้",
              "ปักกิ่ง"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "zhuhai-macau": {
            "name": "จู่ไห่-มาเก๊า",
            "keywords": [
              "จู่ไห่",
              "มาเก๊า"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "guangzhou-macau": {
            "name": "กวางโจว-มาเก๊า",
            "keywords": [
              "กวางโจว",
              "มาเก๊า"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          },
          "guangzhou-hongkong": {
            "name": "กวางโจว-ฮ่องกง",
            "keywords": [
              "กวางโจว",
              "ฮ่องกง"
            ],
            "coverImage": "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?q=80&w=2000"
          }
        }
      },
      "korea": {
        "name": "เกาหลี",
        "keywords": [
          "KOREA",
          "เกาหลี",
          "โซล",
          "ปูซาน",
          "เชจู"
        ],
        "coverImage": "https://images.unsplash.com/photo-1538669715315-12dd51b41eeb?q=80&w=2000",
        "children": {
          "seoul": {
            "name": "โซล",
            "keywords": [
              "โซล",
              "Seoul",
              "เมียงดง"
            ],
            "coverImage": "https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=2000"
          },
          "busan": {
            "name": "ปูซาน",
            "keywords": [
              "ปูซาน",
              "Busan"
            ],
            "coverImage": "https://images.unsplash.com/photo-1620025986561-1694db09618a?q=80&w=2000"
          },
          "jeju": {
            "name": "เชจู",
            "keywords": [
              "เชจู",
              "Jeju"
            ],
            "coverImage": "https://images.unsplash.com/photo-1610484555819-27dc514fc750?q=80&w=2000"
          }
        }
      },
      "taiwan": {
        "name": "ไต้หวัน",
        "keywords": [
          "TAIWAN",
          "ไต้หวัน",
          "ไทเป",
          "เกาสง"
        ],
        "coverImage": "https://images.unsplash.com/photo-1552993873-0aa1031d2fb7?q=80&w=2000",
        "children": {
          "taipei": {
            "name": "ไทเป",
            "keywords": [
              "ไทเป",
              "Taipei",
              "จิ่วเฟิ่น"
            ],
            "coverImage": "https://images.unsplash.com/photo-1508189860359-5433baed8524?q=80&w=2000"
          },
          "kaohsiung": {
            "name": "เกาสง",
            "keywords": [
              "เกาสง",
              "Kaohsiung"
            ],
            "coverImage": "https://images.unsplash.com/photo-1574676571587-f26046e8c454?q=80&w=2000"
          }
        }
      },
      "hongkong": {
        "name": "ฮ่องกง",
        "keywords": [
          "HONG KONG",
          "ฮ่องกง",
          "ดิสนีย์แลนด์",
          "ไหว้พระ"
        ],
        "coverImage": "https://images.unsplash.com/photo-1507504031003-b417219a0fde?q=80&w=2000"
      },
      "singapore": {
        "name": "สิงคโปร์",
        "keywords": [
          "SINGAPORE",
          "สิงคโปร์"
        ],
        "coverImage": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2000"
      },
      "south-korea": {
        "name": "เกาหลีใต้",
        "keywords": [
          "KOREA",
          "เกาหลี",
          "โซล",
          "ปูซาน",
          "เชจู"
        ],
        "coverImage": "https://images.unsplash.com/photo-1538485395224-329273f69da0?q=80&w=2000"
      },
      "macau": {
        "name": "มาเก๊า",
        "keywords": [
          "MACAU",
          "มาเก๊า"
        ],
        "coverImage": "https://images.unsplash.com/photo-1582236371727-81498b958c2b?q=80&w=2000"
      },
      "malaysia": {
        "name": "มาเลเซีย",
        "keywords": [
          "MALAYSIA",
          "มาเลเซีย",
          "กัวลาลัมเปอร์"
        ],
        "coverImage": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2000"
      },
      "indonesia": {
        "name": "อินโดนีเซีย",
        "keywords": [
          "INDONESIA",
          "อินโดนีเซีย",
          "บาหลี"
        ],
        "coverImage": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2000"
      },
      "maldives": {
        "name": "มัลดีฟส์",
        "keywords": [
          "MALDIVES",
          "มัลดีฟส์"
        ],
        "coverImage": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=2000"
      },
      "india": {
        "name": "อินเดีย",
        "keywords": [
          "INDIA",
          "อินเดีย",
          "นิวเดลี",
          "ทัชมาฮาล"
        ],
        "coverImage": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000"
      },
      "vietnam": {
        "name": "เวียดนาม",
        "keywords": [
          "VIETNAM",
          "เวียดนาม",
          "ดานัง",
          "ฮานอย",
          "โฮจิมินห์",
          "ดาลัด"
        ],
        "coverImage": "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2000",
        "children": {
          "danang": {
            "name": "ดานัง",
            "keywords": [
              "ดานัง",
              "Da Nang",
              "บานาฮิลล์"
            ],
            "coverImage": "https://images.unsplash.com/photo-1563242691-2475e771cc4e?q=80&w=2000"
          },
          "hanoi": {
            "name": "ฮานอย",
            "keywords": [
              "ฮานอย",
              "Hanoi",
              "ซาปา"
            ],
            "coverImage": "https://images.unsplash.com/photo-1559592413-7ce4f0a048dc?q=80&w=2000"
          },
          "hochiminh": {
            "name": "โฮจิมินห์",
            "keywords": [
              "โฮจิมินห์",
              "Ho Chi Minh",
              "มุยเน่"
            ],
            "coverImage": "https://images.unsplash.com/photo-1583417311093-39dafb7f8a97?q=80&w=2000"
          }
        }
      }
    }
  },
  "europe": {
    "name": "ยุโรป",
    "keywords": [
      "EUROPE",
      "ยุโรป",
      "ฝรั่งเศส",
      "สวิตเซอร์แลนด์",
      "อิตาลี",
      "อังกฤษ",
      "FRANCE",
      "SWITZERLAND",
      "ITALY",
      "UK",
      "ENGLAND",
      "GERMANY",
      "AUSTRIA",
      "CZECH",
      "SPAIN",
      "NETHERLANDS",
      "FINLAND",
      "GEORGIA"
    ],
    "coverImage": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2000",
    "children": {
      "france": {
        "name": "ฝรั่งเศส",
        "keywords": [
          "FRANCE",
          "ฝรั่งเศส",
          "ปารีส"
        ],
        "coverImage": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2000"
      },
      "switzerland": {
        "name": "สวิตเซอร์แลนด์",
        "keywords": [
          "SWITZERLAND",
          "สวิตเซอร์แลนด์",
          "สวิส"
        ],
        "coverImage": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=2000"
      },
      "italy": {
        "name": "อิตาลี",
        "keywords": [
          "ITALY",
          "อิตาลี",
          "โรม",
          "เวนิส",
          "มิลาน"
        ],
        "coverImage": "https://images.unsplash.com/photo-1515542622106-78b28af7815b?q=80&w=2000"
      },
      "uk": {
        "name": "อังกฤษ",
        "keywords": [
          "UK",
          "ENGLAND",
          "อังกฤษ",
          "สหราชอาณาจักร",
          "ลอนดอน"
        ],
        "coverImage": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2000"
      },
      "georgia": {
        "name": "จอร์เจีย",
        "keywords": [
          "GEORGIA",
          "จอร์เจีย",
          "ทบิลิซี"
        ],
        "coverImage": "https://images.unsplash.com/photo-1565008576549-57569a49371d?q=80&w=2000"
      },
      "germany": {
        "name": "เยอรมนี",
        "keywords": [
          "GERMANY",
          "เยอรมนี",
          "มิวนิค",
          "แฟรงก์เฟิร์ต"
        ],
        "coverImage": "https://images.unsplash.com/photo-1534313314376-a72289b4671e?q=80&w=2000"
      },
      "austria": {
        "name": "ออสเตรีย",
        "keywords": [
          "AUSTRIA",
          "ออสเตรีย",
          "เวียนนา",
          "ฮัลล์ชตัทท์"
        ],
        "coverImage": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=2000"
      },
      "czech": {
        "name": "เช็ก",
        "keywords": [
          "CZECH",
          "เช็ก",
          "ปราก"
        ],
        "coverImage": "https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=2000"
      },
      "spain": {
        "name": "สเปน",
        "keywords": [
          "SPAIN",
          "สเปน",
          "มาดริด",
          "บาร์เซโลน่า"
        ],
        "coverImage": "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=2000"
      },
      "netherlands": {
        "name": "เนเธอร์แลนด์",
        "keywords": [
          "NETHERLANDS",
          "เนเธอร์แลนด์",
          "อัมสเตอร์ดัม"
        ],
        "coverImage": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?q=80&w=2000"
      },
      "finland": {
        "name": "ฟินแลนด์",
        "keywords": [
          "FINLAND",
          "ฟินแลนด์",
          "เฮลซิงกิ"
        ],
        "coverImage": "https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?q=80&w=2000"
      }
    }
  },
  "middle-east": {
    "name": "ตะวันออกกลาง",
    "keywords": [
      "MIDDLE EAST",
      "ตะวันออกกลาง",
      "TURKEY",
      "TURKIYE",
      "ตุรกี",
      "EGYPT",
      "อียิปต์",
      "JORDAN",
      "จอร์แดน"
    ],
    "coverImage": "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2000",
    "children": {
      "turkey": {
        "name": "ตุรกี",
        "keywords": [
          "TURKEY",
          "TURKIYE",
          "ตุรกี",
          "อิสตันบูล",
          "คัปปาโดเกีย"
        ],
        "coverImage": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=2000"
      },
      "egypt": {
        "name": "อียิปต์",
        "keywords": [
          "EGYPT",
          "อียิปต์",
          "ไคโร",
          "พีระมิด"
        ],
        "coverImage": "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?q=80&w=2000"
      },
      "jordan": {
        "name": "จอร์แดน",
        "keywords": [
          "JORDAN",
          "จอร์แดน",
          "เพตรา"
        ],
        "coverImage": "https://images.unsplash.com/photo-1543714271-9fbd5be4bd98?q=80&w=2000"
      }
    }
  },
  "africa": {
    "name": "แอฟริกา",
    "keywords": [],
    "coverImage": "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=2000",
    "children": {
      "morocco": {
        "name": "โมร็อกโก",
        "keywords": [
          "MOROCCO",
          "โมร็อกโก",
          "มาร์ราเกช",
          "คาซาบลังกา"
        ],
        "coverImage": "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=2000"
      }
    }
  },
  "america": {
    "name": "อเมริกา",
    "keywords": [],
    "coverImage": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2000",
    "children": {
      "usa": {
        "name": "สหรัฐอเมริกา",
        "keywords": [
          "USA",
          "สหรัฐอเมริกา",
          "นิวยอร์ก",
          "ลอสแอนเจลิส"
        ],
        "coverImage": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2000"
      },
      "canada": {
        "name": "แคนาดา",
        "keywords": [
          "CANADA",
          "แคนาดา",
          "โทรอนโต",
          "แวนคูเวอร์"
        ],
        "coverImage": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=2000"
      }
    }
  },
  "oceania": {
    "name": "โอเชียเนีย",
    "keywords": [],
    "coverImage": "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?q=80&w=2000",
    "children": {
      "australia": {
        "name": "ออสเตรเลีย",
        "keywords": [
          "AUSTRALIA",
          "ออสเตรเลีย",
          "ซิดนีย์",
          "เมลเบิร์น"
        ],
        "coverImage": "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?q=80&w=2000"
      },
      "new-zealand": {
        "name": "นิวซีแลนด์",
        "keywords": [
          "NEW ZEALAND",
          "นิวซีแลนด์",
          "โอ๊คแลนด์",
          "ควีนส์ทาวน์"
        ],
        "coverImage": "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?q=80&w=2000"
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

/**
 * ค้นหาเส้นทาง (slugs) จาก keyword หรือชื่อสถานที่
 */
export function findPathByKeyword(keyword: string): string[] | null {
  if (!keyword) return null;
  const search = keyword.toUpperCase().trim();
  
  function searchNode(node: DestinationNode, path: string[]): string[] | null {
    // กรณีที่ keyword ตรงกับ name หรือใน keywords array (แบบ case-insensitive)
    if (
      node.name.toUpperCase() === search || 
      (node.keywords && node.keywords.some(k => k.toUpperCase().includes(search) || search.includes(k.toUpperCase())))
    ) {
      return path;
    }
    
    // ค้นหาในลูกๆ
    if (node.children) {
      for (const [key, child] of Object.entries(node.children)) {
        const found = searchNode(child, [...path, key]);
        if (found) return found;
      }
    }
    return null;
  }

  for (const [key, node] of Object.entries(destinationConfig)) {
    const found = searchNode(node, [key]);
    if (found) return found;
  }
  return null;
}
