async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/hotels/search?dest=Bali");
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body length:", text.length);
    const data = JSON.parse(text);
    console.log("Number of hotels:", data.hotels ? data.hotels.length : "undefined");
    if (data.hotels && data.hotels.length > 0) {
      console.log("First hotel:", data.hotels[0]);
    } else {
      console.log("Response data:", data);
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}
test();
