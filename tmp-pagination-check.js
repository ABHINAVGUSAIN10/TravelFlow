const { getJson } = require("serpapi");

getJson({
  engine: "google_hotels",
  q: "Bali",
  check_in_date: "2026-10-12",
  check_out_date: "2026-10-18",
  adults: 2,
  api_key: "92186c701692fc1bf9ec9520b96e509e0aa08bd9ae5712c523908abdbf5f3c97"
}).then(res => {
  console.log(JSON.stringify(res.serpapi_pagination, null, 2));
}).catch(console.error);
