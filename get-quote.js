const https = require('https');

const apiKey = '8c489f30-d034-4843-ab0c-c746f5965124'; // From .env.local
const quantities = [50, 100, 250, 500];

async function getQuote(quantity) {
  const data = JSON.stringify({
    shippingMethod: "Budget",
    destinationCountryCode: "US",
    currencyCode: "USD",
    items: [
      {
        sku: "GLOBAL-BUS-CARD",
        copies: quantity,
        attributes: {
            finish: "gloss" // trying gloss as a default
        }
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

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Status: ${res.statusCode}, Body: ${body}`));
        }
      });
    });

    req.on('error', (error) => reject(error));
    req.write(data);
    req.end();
  });
}

async function run() {
  const skus = ['GLOBAL-BUS-CARD-50', 'GLOBAL-BUS-CARD-100', 'GLOBAL-BUS-CARD-250', 'GLOBAL-BUS-CARD-500', 'GLOBAL-BUS-CARD-2x4', 'GLOBAL-BUS-CARD-3.5x2'];
  
  for (const sku of skus) {
      console.log(`Testing SKU: ${sku}...`);
      try {
        // Test with 1 copy of the pack? Or copies=100?
        // If the SKU implies quantity, copies should be 1.
        // Let's try copies=1 for these pack SKUs.
        const data = JSON.stringify({
            shippingMethod: "Budget",
            destinationCountryCode: "US",
            currencyCode: "USD",
            items: [
            {
                sku: sku,
                copies: 1,
                attributes: {
                    finish: "gloss"
                }
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

        await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    const quote = JSON.parse(body);
                    console.log(`SUCCESS: ${sku} - Cost for 100: $${quote.quotes[0].cost.amount}`);
                    resolve();
                } else {
                    console.log(`FAILED: ${sku} - Status: ${res.statusCode}`);
                    resolve();
                }
            });
            });
            req.on('error', (error) => {
                console.error(error);
                resolve();
            });
            req.write(data);
            req.end();
        });

      } catch (error) {
        console.error(`Error for SKU ${sku}:`, error.message);
      }
  }
}

run();
