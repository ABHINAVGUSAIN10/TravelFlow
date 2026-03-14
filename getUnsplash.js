const https = require('https');
const fs = require('fs');

const queries = [
    'himalayas-valley',
    'andaman-beach',
    'kerala-forest',
    'himalayan-snow-trek',
    'sundarbans-tiger',
    'ladakh-mountains',
    'cliff-beach-india',
    'meghalaya-waterfall'
];

async function fetchId(query) {
    return new Promise((resolve) => {
        const req = https.get(`https://unsplash.com/s/photos/${query}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                // Look for images.unsplash.com/photo- or standard 11 char IDs
                const regex = /images\.unsplash\.com\/photo-([0-9a-zA-Z-]+)\?/g;
                let match;
                const ids = new Set();
                while ((match = regex.exec(data)) !== null) {
                    if (match[1].length > 15) { // Valid IDs are like 162608...-xxx
                       ids.add(match[1]);
                    }
                }
                const idArray = Array.from(ids);
                if (idArray.length > 0) {
                   resolve(idArray[0]);
                } else {
                   resolve('NOT_FOUND');
                }
            });
        });
        req.on('error', () => resolve('ERROR'));
    });
}

async function run() {
    const results = {};
    for (const q of queries) {
        console.log(`Searching for: ${q}`);
        results[q] = await fetchId(q);
        console.log(`Found: ${results[q]}`);
    }
    fs.writeFileSync('unsplash_ids.json', JSON.stringify(results, null, 2));
}

run();
