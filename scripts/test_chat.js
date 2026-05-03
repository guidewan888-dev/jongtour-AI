async function testChat() {
  const messages = ["ขอโปรแกรม", "ขอโปรแกรม Zego", "ทัวร์คุนหมิง Let's go"];
  
  for (const msg of messages) {
    console.log(`\nTesting: "${msg}"`);
    try {
      const res = await fetch('https://agent.jongtour.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, chatHistory: [] })
      });
      const text = await res.text();
      console.log(text.substring(0, 300));
    } catch (err) {
      console.error(err);
    }
  }
}

testChat();
