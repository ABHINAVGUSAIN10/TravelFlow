const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "9b485f607cmsh2774ca50cb08df0p1fdcc6jsnc53f37294bdb";
const RAPIDAPI_HOST = "hotels-com-provider.p.rapidapi.com";

async function testDetail() {
  const propertyId = "1327110880";
  console.log(`Fetching Summary for Hotel ID: ${propertyId}...`);
  
  const detailRes = await fetch(
    `https://${RAPIDAPI_HOST}/v2/hotels/summary?domain=IN&hotel_id=${propertyId}&locale=en_IN`,
    {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    }
  );

  if (!detailRes.ok) {
    console.log("Summary failed:", detailRes.status, await detailRes.text());
    return;
  }

  const detailData = await detailRes.json();
  const fs = require('fs');
  fs.writeFileSync('summary.json', JSON.stringify(detailData, null, 2));
  console.log("Wrote full summaryData to summary.json");
}

testDetail().catch(console.error);
