const https = require('http'); // local nextjs runs on http

async function testSync() {
  try {
    console.log("Triggering Check In Group sync...");
    const checkinRes = await fetch('http://localhost:3000/api/sync/checkingroup');
    const checkinJson = await checkinRes.json();
    console.log("Check In Group Response:", checkinJson);

    console.log("Triggering Tour Factory sync...");
    const tourfacRes = await fetch('http://localhost:3000/api/sync/tourfactory');
    const tourfacJson = await tourfacRes.json();
    console.log("Tour Factory Response:", tourfacJson);
  } catch (e) {
    console.error(e);
  }
}

testSync();
