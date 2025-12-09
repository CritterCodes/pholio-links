const https = require('https');

const apiKey = '8c489f30-d034-4843-ab0c-c746f5965124';

const quantities = [50, 100, 250, 500];

async function getQuote(quantity) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            shippingMethod: "Standard",
            destinationCountryCode: "US",
            currencyCode: "USD",
            items: [
                {
                    sku: "GLOBAL-BUS-CARD",
                    copies: quantity
                }
            ]
        });

        const options = {
            hostname: 'api.prodigi.com',
            path: '/v4.0/quotes',
            method: 'POST',
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(responseBody));
                } else {
                    reject(`Status: ${res.statusCode}, Body: ${responseBody}`);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

async function run() {
    console.log('Fetching quotes...');
    for (const qty of quantities) {
        try {
            const quote = await getQuote(qty);
            const cost = quote.quotes[0].costSummary.totalCost.amount;
            const currency = quote.quotes[0].costSummary.totalCost.currency;
            console.log(`Quantity: ${qty}, Cost: ${cost} ${currency}`);
        } catch (error) {
            console.error(`Error for quantity ${qty}:`, error);
        }
    }
}

run();
