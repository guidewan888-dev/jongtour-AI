async function test() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWYwM2JlODQzMWFmMmU0ODY5NWY0YjAiLCJpYXQiOjE3Nzc1MTg1NDN9.qbZPxA3jldUTTLsGmbdMrvv3qXnTPDiNc_9_T48zPnw';
  const zegoUrl = 'https://www.zegoapi.com/v1.5/programtours';
  const tfUrl = 'https://api.tourfactory.co.th/v1/programtours';
  const ciUrl = 'https://api.checkingroup.co.th/v1/programtours';

  console.log("Fetching Zego...");
  try {
    const res = await fetch(zegoUrl, { headers: { 'auth-token': token } });
    const json = await res.json();
    const arr = Array.isArray(json) ? json : json.data;
    console.log(`Zego returned ${arr ? arr.length : 0} items`);
    if (arr && arr.length > 0) {
      console.log("First item sample keys:", Object.keys(arr[0]));
      console.log("Zego Item 0 ProductID:", arr[0].ProductID, "ProductName:", arr[0].ProductName);
    }
  } catch (e) {
    console.error("Zego error:", e);
  }

  console.log("\nFetching TourFactory...");
  try {
    const res = await fetch(tfUrl);
    const json = await res.json();
    console.log(`TF returned ${Array.isArray(json) ? json.length : 0} items`);
    if (Array.isArray(json) && json.length > 0) {
      console.log("First item sample keys:", Object.keys(json[0]));
      console.log("TF Item 0 id:", json[0].id, "name:", json[0].name);
    }
  } catch (e) {
    console.error("TF error:", e);
  }

  console.log("\nFetching CheckIn...");
  try {
    const res = await fetch(ciUrl);
    const json = await res.json();
    console.log(`CheckIn returned ${Array.isArray(json) ? json.length : 0} items`);
    if (Array.isArray(json) && json.length > 0) {
      console.log("First item sample keys:", Object.keys(json[0]));
      console.log("CI Item 0 id:", json[0].id, "name:", json[0].name);
    }
  } catch (e) {
    console.error("CheckIn error:", e);
  }
}

test();
