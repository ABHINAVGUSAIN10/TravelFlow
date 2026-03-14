const fs = require('fs');
const path = require('path');

const locations = {
    'pangong_tso': 'pangong lake ladakh',
    'mechuka': 'arunachal pradesh landscape',
    'taj_mahal': 'taj mahal beautiful',
    'palolem_beach': 'goa beach sunset',
    'munnar': 'munnar kerala tea gardens',
    'valley_of_flowers': 'himalayas flowers landscape india',
    'radhanagar': 'andaman nicobar beach',
    'gulmarg': 'kashmir snow winter'
};

if (!fs.existsSync('public/images')) {
    fs.mkdirSync('public/images', { recursive: true });
}

const HEADERS = { 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36'
};

async function fetchBuffer(url) {
    const res = await fetch(url, { headers: HEADERS, redirect: 'follow' });
    if (!res.ok) {
        throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

async function download() {
    for (const [key, search] of Object.entries(locations)) {
        console.log(`Searching Unsplash for: ${search}...`);
        
        const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(search)}&per_page=5&orientation=landscape`;
        
        try {
            const res = await fetch(url, { headers: HEADERS });
            const data = await res.json();
            
            if (data.results && data.results.length > 0) {
                // Get the best image (we'll check the first 3 for the best aspect ratio)
                let bestImage = data.results[0];
                const rawUrl = bestImage.urls.raw;
                const downloadUrl = `${rawUrl}&q=80&w=1920&auto=format&fit=crop`;
                
                console.log(`Downloading ${key}: ${downloadUrl}`);
                const buffer = await fetchBuffer(downloadUrl);
                fs.writeFileSync(`public/images/${key}.jpg`, buffer);
                console.log(`Saved public/images/${key}.jpg (${Math.round(buffer.length/1024)}KB)`);
            } else {
                console.log(`No results found for ${search}`);
            }
        } catch (e) {
            console.error(`Error with ${search}:`, e.message);
        }
        
        // Wait 2 seconds to avoid rate limits
        await new Promise(r => setTimeout(r, 2000));
    }
}

download().then(() => console.log('Done'));
