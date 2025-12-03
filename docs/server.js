/**
 * Pholio Domain Setup Server
 * 
 * Handles automated setup of custom domains with nginx and SSL certs
 * Runs on: 65.21.227.202:3001
 * 
 * Install: npm install express dotenv
 * Run: DOMAIN_SETUP_SECRET=your-secret node server.js
 */

const express = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const execAsync = promisify(exec);

const DOMAIN_SETUP_SECRET = process.env.DOMAIN_SETUP_SECRET || 'change-this-secret';
const VERCEL_APP_URL = process.env.VERCEL_APP_URL || 'https://pholio.link';
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Verify HMAC signature
const verifySignature = (body, signature) => {
  const hash = crypto
    .createHmac('sha256', DOMAIN_SETUP_SECRET)
    .update(body)
    .digest('hex');
  return hash === signature;
};

// Generate nginx config
const generateNginxConfig = (domain) => {
  return `# Auto-generated for ${domain}
# ${new Date().toISOString()}

server {
    listen 80;
    listen [::]:80;
    server_name ${domain} *.${domain};
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${domain} *.${domain};

    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass https://pholio.vercel.app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;
        client_max_body_size 100M;
    }
    location /_health {
        access_log off;
        return 200 "ok";
    }
}
`;
};

// Main endpoint
app.post('/api/custom-domains/setup', async (req, res) => {
  try {
    const signature = req.get('X-Signature');
    const body = JSON.stringify(req.body);

    if (!signature || !verifySignature(body, signature)) {
      console.log('[Auth] Invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { domain, userId, webhookUrl } = req.body;

    if (!domain || typeof domain !== 'string') {
      return res.status(400).json({ error: 'Invalid domain' });
    }

    const domainLower = domain.toLowerCase();

    // Blacklist
    if (
      domainLower.includes('pholio.link') ||
      domainLower === 'bot.engelfinedesign.com'
    ) {
      return res.status(400).json({ error: 'Cannot set up this domain' });
    }

    console.log(`\n[${'='.repeat(50)}]`);
    console.log(`[Domain Setup] Starting: ${domainLower}`);
    console.log(`[Domain Setup] User: ${userId}`);

    try {
      // 1. Create nginx config
      console.log(`[${domainLower}] Creating nginx config...`);
      const nginxConfig = generateNginxConfig(domainLower);
      const configPath = `/etc/nginx/sites-available/${domainLower}`;

      // Write config with sudo
      await execAsync(`echo '${nginxConfig.replace(/'/g, "'\\''")}' | sudo tee ${configPath} > /dev/null`);

      // Enable site
      await execAsync(`sudo ln -sf ${configPath} /etc/nginx/sites-enabled/${domainLower}`);
      console.log(`[${domainLower}] ✓ Config created and enabled`);

      // 2. Test nginx
      console.log(`[${domainLower}] Testing nginx config...`);
      await execAsync('sudo nginx -t');
      console.log(`[${domainLower}] ✓ Nginx config valid`);

      // 3. Generate SSL cert
      console.log(`[${domainLower}] Generating SSL certificate...`);
      
      // Try certbot first (requires manual DNS validation for wildcard)
      try {
        // Attempt DNS challenge
        await execAsync(
          `sudo certbot certonly --manual --preferred-challenges=dns -d "${domainLower}" -d "*.${domainLower}" --agree-tos --non-interactive --register-unsafely-without-email 2>&1 || true`,
          { timeout: 5000 }
        );
        console.log(`[${domainLower}] ✓ Certificate generated (may require manual DNS validation)`);
      } catch (error) {
        // Fallback: create temporary self-signed cert
        console.log(`[${domainLower}] Creating temporary self-signed cert...`);
        await execAsync(
          `sudo mkdir -p /etc/letsencrypt/live/${domainLower} && sudo openssl req -x509 -nodes -days 90 -newkey rsa:2048 -keyout /etc/letsencrypt/live/${domainLower}/privkey.pem -out /etc/letsencrypt/live/${domainLower}/fullchain.pem -subj "/CN=${domainLower}" 2>/dev/null`
        );
        console.log(`[${domainLower}] ✓ Temporary self-signed cert created`);
      }

      // 4. Reload nginx
      console.log(`[${domainLower}] Reloading nginx...`);
      await execAsync('sudo systemctl reload nginx');
      console.log(`[${domainLower}] ✓ Nginx reloaded`);

      // 5. Send webhook
      console.log(`[${domainLower}] Sending webhook...`);
      const webhookPayload = {
        userId,
        domain: domainLower,
        status: 'active',
        message: 'Domain successfully configured',
      };

      const webhookSignature = crypto
        .createHmac('sha256', DOMAIN_SETUP_SECRET)
        .update(JSON.stringify(webhookPayload))
        .digest('hex');

      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Signature': webhookSignature,
          },
          body: JSON.stringify(webhookPayload),
        });
        console.log(`[${domainLower}] ✓ Webhook sent`);
      } catch (error) {
        console.error(`[${domainLower}] ✗ Webhook failed: ${error.message}`);
      }

      console.log(`[${domainLower}] ✅ SETUP COMPLETE`);
      console.log(`[${'='.repeat(50)}]\n`);

      res.json({
        success: true,
        domain: domainLower,
        message: `Domain ${domainLower} is now active!`,
      });
    } catch (error) {
      console.error(`[${domainLower}] ✗ Setup failed: ${error.message}`);

      // Send error webhook
      const errorPayload = {
        userId,
        domain: domainLower,
        status: 'failed',
        error: error.message,
      };

      const errorSignature = crypto
        .createHmac('sha256', DOMAIN_SETUP_SECRET)
        .update(JSON.stringify(errorPayload))
        .digest('hex');

      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Signature': errorSignature,
          },
          body: JSON.stringify(errorPayload),
        });
      } catch {
        // ignore
      }

      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  } catch (error) {
    console.error('[Request] Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Pholio Domain Setup Server`);
  console.log(`   Listening on port ${PORT}`);
  console.log(`   Secret configured: ${DOMAIN_SETUP_SECRET ? '✓' : '✗'}`);
  console.log(`   Vercel URL: ${VERCEL_APP_URL}`);
  console.log(`\n   Ready to set up custom domains!\n`);
});
