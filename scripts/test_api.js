async function test() {
  try {
    const envRes = await fetch('https://admin.jongtour.com/api/debug-env');
    console.log('ENV:', await envRes.text());

    const res = await fetch('https://admin.jongtour.com/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'jongtourAi@gmail.com' })
    });
    console.log('API:', await res.text());
  } catch(e) {
    console.error(e);
  }
}
test();
