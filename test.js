import fs from 'fs';

async function test() {
  const res = await fetch('https://hotels-com-provider.p.rapidapi.com/v2/hotels/search?region_id=6135820&locale=en_IN&domain=IN&checkin_date=2026-10-12&checkout_date=2026-10-18&adults_number=2&sort_order=REVIEW&page_number=1', {
    headers: {
      'x-rapidapi-key': '9b485f607cmsh2774ca50cb08df0p1fdcc6jsnc53f37294bdb',
      'x-rapidapi-host': 'hotels-com-provider.p.rapidapi.com'
    }
  });
  const data = await res.json();
  fs.writeFileSync('test.json', JSON.stringify(data, null, 2));
}

test();
