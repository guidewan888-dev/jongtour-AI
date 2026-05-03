fetch('https://jongtour.com/destinations/asia/japan/tokyo').then(async res => {
  console.log('STATUS:', res.status);
  console.log('BODY:', await res.text());
}).catch(console.error);
