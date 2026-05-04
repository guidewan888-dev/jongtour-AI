

async function testChat() {
  const body = {
    message: "ขอทัวร์ญี่ปุ่นของ Let's go เดือนพฤษภาคม 2 คน",
    chatHistory: []
  };

  try {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response body:", text.substring(0, 500));
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
testChat();
