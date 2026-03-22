const https = require('https');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "9b485f607cmsh2774ca50cb08df0p1fdcc6jsnc53f37294bdb";
const RAPIDAPI_HOST = "hotels-com-provider.p.rapidapi.com";

async function testAPI() {
  console.log("Fetching Region ID for Manali...");
  const regionRes = await fetch(
    `https://${RAPIDAPI_HOST}/v2/regions?query=Manali&locale=en_IN&domain=IN`,
    {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    }
  );
  
  const regionData = await regionRes.json();
  const regions = regionData?.data ?? [];
  const priorityTypes = ["MULTICITY", "CITY", "NEIGHBORHOOD", "POI"];
  
  let regionId = null;
  for (const type of priorityTypes) {
    const match = regions.find((r) => r.type === type);
    if (match) {
      regionId = match.gaiaId || match.hotelId;
      console.log(`Found region: ${match.type} - ${regionId}`);
      break;
    }
  }

  if (!regionId) {
    console.log("No region found.", regionData);
    return;
  }

  console.log(`\nFetching Hotels for Region ${regionId}...`);
  // Trying dates 1 month from now
  const today = new Date();
  const checkinDate = new Date(today);
  checkinDate.setDate(today.getDate() + 30);
  const checkoutDate = new Date(today);
  checkoutDate.setDate(today.getDate() + 35);
  
  const checkinStr = checkinDate.toISOString().split('T')[0];
  const checkoutStr = checkoutDate.toISOString().split('T')[0];
  console.log(`Checkin: ${checkinStr}, Checkout: ${checkoutStr}`);

  const searchRes = await fetch(
    `https://${RAPIDAPI_HOST}/v2/hotels/search?region_id=${regionId}&locale=en_IN&domain=IN&checkin_date=${checkinStr}&checkout_date=${checkoutStr}&adults_number=2&sort_order=PRICE_LOW_TO_HIGH&page_number=1`,
    {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    }
  );

  if (!searchRes.ok) {
    console.log("Search failed:", searchRes.status, await searchRes.text());
    return;
  }

  const searchData = await searchRes.json();
  const fs = require('fs');
  fs.writeFileSync('response.json', JSON.stringify(searchData, null, 2));
  console.log("Wrote full searchData to response.json");
}

testAPI().catch(console.error);
