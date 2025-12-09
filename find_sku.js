const https = require('https');

const apiKey = '8c489f30-d034-4843-ab0c-c746f5965124';
const skus = [
    'GLOBAL-BUS-CARD',
    'GLOBAL-BUS-CARD-2x4',
    'GLOBAL-BUS-CARD-5x10',
    'GLOBAL-BUS-CARD-3.5x2',
    'GLOBAL-BUS-CARD-85x55',
    'GLOBAL-BUS-CARD-55x85',
    'GLOBAL-BUS-CARD-50x100',
    'GLOBAL-BUS-CARD-100x50',
    'GLOBAL-BUS-CARD-GLOSS',
    'GLOBAL-BUS-CARD-MATTE',
    'GLOBAL-BUS-CARD-MOHAWK',
    'GLOBAL-BUS-CARD-2x4-GLOSS',
    'GLOBAL-BUS-CARD-2x4-MATTE',
    'GLOBAL-BUS-CARD-2x4-MOHAWK',
    'GLOBAL-BUS-CARD-50', // From get-quote.js
    'GLOBAL-BUS-CARD-100',
    'GLOBAL-BUS-CARD-250',
    'GLOBAL-BUS-CARD-500'
];

function check(hostname, sku) {
    const options = {
        hostname: hostname,
        path: `/v4.0/products/${sku}`,
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
            if (res.statusCode === 200) {
                console.log(`FOUND! Host: ${hostname} SKU: ${sku}`);
                console.log(data);
            } else {
                console.log(`Not Found: Host: ${hostname} SKU: ${sku} (${res.statusCode})`);
            }
        });
    });

    req.on('error', (error) => {
        console.error(error);
    });

    req.end();
}

console.log('Checking SKUs...');
skus.forEach(sku => {
    check('api.sandbox.prodigi.com', sku);
});
