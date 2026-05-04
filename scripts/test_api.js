fetch('https://admin.jongtour.com/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'guidewan888@gmail.com' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
