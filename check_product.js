const https = require('https');

const apiKey = '8c489f30-d034-4843-ab0c-c746f5965124';

const options = {
    hostname: 'api.prodigi.com',
    path: `/v4.0/products`,
    method: 'GET',
    headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        // The list might be huge, so let's just print SKUs that contain "CARD"
        try {
            const json = JSON.parse(data);
            if (json.products) {
                const cards = json.products.filter(p => p.sku.includes('CARD') || p.description.toLowerCase().includes('business card'));
                console.log("Found products:", cards.map(c => c.sku));
            } else {
                console.log("No products field in response");
                console.log(JSON.stringify(json, null, 2).substring(0, 500));
            }
        } catch (e) {
            console.log("Error parsing JSON");
        }
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.end();

