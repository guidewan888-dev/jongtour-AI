export function buildTourCarousel(tours: any[]) {
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
                  uri: `https://jongtour.vercel.app/tours/${tour.id}`,
                },
              },
            ],
          },
        };
      }),
    },
  };
}
