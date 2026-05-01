const https = require('https');

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'Node.js' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', err => reject(err));
  });
}

async function test() {
  try {
    console.log("Fetching Check In Group...");
    const checkin = await fetchJSON('https://api.checkingroup.co.th/v1/programtours');
    if (checkin && checkin.length > 0) {
      console.log("Check In First Item Keys:", Object.keys(checkin[0]));
      console.log("Check In First Item periods length:", checkin[0].periods ? checkin[0].periods.length : 0);
      if (checkin[0].periods && checkin[0].periods.length > 0) {
        console.log("Check In Period sample:", checkin[0].periods[0]);
      }
    }

    console.log("\nFetching Tour Factory...");
    const tourfac = await fetchJSON('https://api.tourfactory.co.th/v1/programtours');
    if (tourfac && tourfac.length > 0) {
      console.log("Tour Factory First Item Keys:", Object.keys(tourfac[0]));
      console.log("Tour Factory First Item periods length:", tourfac[0].periods ? tourfac[0].periods.length : 0);
      if (tourfac[0].periods && tourfac[0].periods.length > 0) {
        console.log("Tour Factory Period sample:", tourfac[0].periods[0]);
      }
    }
  } catch(e) {
    console.error(e);
  }
}

test();
