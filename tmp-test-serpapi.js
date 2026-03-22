const { getJson } = require("serpapi");
const fs = require("fs");

async function testSerpApi() {
  try {
    const response = await getJson({
      engine: "google_hotels",
      q: "Bali Resorts",
      check_in_date: "2026-10-12",
      check_out_date: "2026-10-18",
      adults: 2,
      currency: "INR",
      gl: "in",
      hl: "en",
      api_key: "92186c701692fc1bf9ec9520b96e509e0aa08bd9ae5712c523908abdbf5f3c97"
    });
    
    let result = { search: response.properties?.[0] };
    
    if (response.properties?.[0]) {
      const hotelName = response.properties[0].name;
      const detailResponse = await getJson({
        engine: "google_hotels",
        q: hotelName,
        check_in_date: "2026-10-12",
        check_out_date: "2026-10-18",
        adults: 2,
        currency: "INR",
        gl: "in",
        hl: "en",
        api_key: "92186c701692fc1bf9ec9520b96e509e0aa08bd9ae5712c523908abdbf5f3c97"
      });
      result.detail = detailResponse.properties?.[0];
    }
    fs.writeFileSync("tmp-serpapi-result.json", JSON.stringify(result, null, 2));
    console.log("Done");
  } catch (err) {
    console.error("Error:", err);
  }
}

testSerpApi();
