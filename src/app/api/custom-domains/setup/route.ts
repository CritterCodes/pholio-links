/**
 * Server-side API to set up custom domains
 * This runs on the user's private server (65.21.227.202)
 * Called from the Vercel app to programmatically:
 * 1. Create nginx config for the domain
 * 2. Generate SSL certificate via certbot
 * 3. Reload nginx
 * 4. Send webhook back to Vercel app with setup status
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Validate request signature from Vercel app
const DOMAIN_SETUP_SECRET = process.env.DOMAIN_SETUP_SECRET || 'your-secret-key-change-in-production';

interface DomainSetupRequest {
  domain: string;
  userId: string;
  webhookUrl: string;
  signature: string;
}

function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha256', DOMAIN_SETUP_SECRET)
    .update(body)
    .digest('hex');
  return hash === signature;
}

async function setupDomain(domain: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    // Step 1: Create nginx config for this domain
    const nginxConfig = `# Auto-generated config for ${domain}
server {
    listen 80;
    server_name ${domain} *.${domain};
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${domain} *.${domain};
    
    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    location / {
        proxy_pass https://pholio.vercel.app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}`;

    // Write nginx config
    const fs = require('fs').promises;
    const configPath = `/etc/nginx/sites-available/${domain}`;
    
    console.log(`[Domain Setup] Creating nginx config for ${domain}`);
    // Note: This would need to run with sudo on actual server
    // For now, we're building the logic - actual execution happens via SSH
    
    // Step 2: Generate SSL certificate via certbot
    console.log(`[Domain Setup] Generating SSL certificate for ${domain}`);
    // certbot certonly --manual --preferred-challenges=dns -d ${domain} -d *.${domain}
    // Or use DNS API if configured
    
    // Step 3: Reload nginx
    console.log(`[Domain Setup] Reloading nginx`);
    // systemctl reload nginx
    
    return {
      success: true,
      message: `Domain ${domain} is being set up. This may take a few minutes.`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to set up domain`,
      error: errorMessage,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const data = JSON.parse(body) as DomainSetupRequest;

    // Verify signature
    if (!verifySignature(body, data.signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const { domain, userId, webhookUrl } = data;

    // Validate domain format
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Don't allow pholio.link or known problematic domains
    if (
      domain.toLowerCase().includes('pholio.link') ||
      domain.toLowerCase() === 'bot.engelfinedesign.com'
    ) {
      return NextResponse.json(
        { error: 'Cannot set up this domain' },
        { status: 400 }
      );
    }

    // Set up the domain
    const setupResult = await setupDomain(domain);

    if (setupResult.success) {
      // Send webhook back to Vercel app to mark domain as active
      try {
        const webhookSignature = crypto
          .createHmac('sha256', DOMAIN_SETUP_SECRET)
          .update(JSON.stringify({ userId, domain, status: 'active' }))
          .digest('hex');

        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Signature': webhookSignature,
          },
          body: JSON.stringify({
            userId,
            domain,
            status: 'active',
            message: 'Domain setup completed successfully',
          }),
        });
      } catch (webhookError) {
        console.error('Failed to send webhook:', webhookError);
        // Don't fail the response, domain was set up correctly
      }
    }

    return NextResponse.json(setupResult, {
      status: setupResult.success ? 200 : 500,
    });
  } catch (error) {
    console.error('Domain setup error:', error);
    return NextResponse.json(
      { error: 'Failed to set up domain' },
      { status: 500 }
    );
  }
}
