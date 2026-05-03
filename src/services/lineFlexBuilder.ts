export function buildTourCarousel(tours: any[], lineUserId?: string) {
  return {
    type: "flex",
    altText: "แพ็กเกจทัวร์แนะนำสำหรับคุณ",
    contents: {
      type: "carousel",
      contents: tours.slice(0, 10).map((tour) => {
        // Fallback image if the tour doesn't have one
        const imageUrl = tour.imageUrl || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600&auto=format&fit=crop";

        return {
          type: "bubble",
          hero: {
            type: "image",
            url: imageUrl,
            size: "full",
            aspectRatio: "20:13",
            aspectMode: "cover",
          },
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: tour.title || "แพ็กเกจทัวร์",
                weight: "bold",
                size: "lg",
                wrap: true,
              },
              {
                type: "box",
                layout: "baseline",
                margin: "md",
                contents: [
                  {
                    type: "text",
                    text: "ราคา",
                    color: "#999999",
                    size: "sm",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: `฿${Number(tour.price).toLocaleString()}`,
                    weight: "bold",
                    color: "#00b900",
                    size: "lg",
                    flex: 3,
                  },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                margin: "sm",
                contents: [
                  {
                    type: "text",
                    text: "จุดหมาย",
                    color: "#999999",
                    size: "sm",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: tour.destination || "-",
                    color: "#666666",
                    size: "sm",
                    flex: 3,
                    wrap: true
                  },
                ],
              },
            ],
          },
          footer: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              {
                type: "button",
                style: "primary",
                height: "sm",
                color: "#2563eb",
                action: {
                  type: "uri",
                  label: "ดูรายละเอียด / จอง",
                  uri: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tour.jongtour.com'}/tour/${tour.id}${lineUserId ? `?ref=line_${lineUserId}` : ''}`,
                },
              },
            ],
          },
        };
      }),
    },
  };
}

export function buildItineraryFlex(itinerary: { title: string; estimatedPrice: string; days: { day: number; title: string; detail: string }[] }) {
  return {
    type: "flex",
    altText: `แผนการเดินทาง: ${itinerary.title}`,
    contents: {
      type: "bubble",
      size: "giga",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#ff7f50",
        paddingAll: "xl",
        contents: [
          {
            type: "text",
            text: "✨ แผนการเดินทางส่วนตัว",
            color: "#ffffff",
            weight: "bold",
            size: "md"
          },
          {
            type: "text",
            text: itinerary.title,
            color: "#ffffff",
            weight: "bold",
            size: "xl",
            wrap: true,
            margin: "md"
          },
          {
            type: "text",
            text: `งบประมาณประเมิน: ${itinerary.estimatedPrice}`,
            color: "#ffffff",
            size: "sm",
            margin: "sm"
          }
        ]
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        paddingAll: "xl",
        contents: itinerary.days.map(day => ({
          type: "box",
          layout: "horizontal",
          spacing: "md",
          contents: [
            {
              type: "box",
              layout: "vertical",
              flex: 1,
              contents: [
                {
                  type: "text",
                  text: `Day ${day.day}`,
                  weight: "bold",
                  color: "#ff7f50",
                  size: "sm",
                  align: "center"
                }
              ]
            },
            {
              type: "box",
              layout: "vertical",
              flex: 4,
              contents: [
                {
                  type: "text",
                  text: day.title,
                  weight: "bold",
                  size: "md",
                  wrap: true
                },
                {
                  type: "text",
                  text: day.detail,
                  size: "sm",
                  color: "#666666",
                  wrap: true,
                  margin: "sm"
                }
              ]
            }
          ]
        }))
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "xl",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#00c300",
            action: {
              type: "message",
              label: "สอบถามรายละเอียดเพิ่ม",
              text: "สนใจจัดทริปนี้ ขอคุยกับพนักงานหน่อยครับ"
            }
          }
        ]
      }
    }
  };
}
