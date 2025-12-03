# Custom Domain Setup Architecture

## Overview

This document explains how custom domains work in Pholio with the three-tier architecture:

1. **Vercel App** (pholio.vercel.app) - Main application with Settings UI
2. **Private Server** (65.21.227.202) - Nginx reverse proxy + Domain setup API
3. **MongoDB** (23.94.251.158:27017) - Database

## User Flow

```
┌─────────────┐
│ User adds   │
│ domain in   │
│ Settings    │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────┐
│ App verifies DNS record (A record    │
│ points to 65.21.227.202)             │
└──────┬───────────────────────────────┘
       │
       ▼
  DNS Verified
       │
       ▼
┌──────────────────────────────────────────┐
│ User clicks "Activate Domain"            │
│ App calls /api/custom-domain/setup       │
└──────┬───────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────┐
│ Vercel App calls                               │
│ POST SERVER_API_URL/api/custom-domains/setup   │
│ (with HMAC signature)                          │
└──────┬─────────────────────────────────────────┘
       │
       ▼
   ┌─────────────────────────────────────────────┐
   │ Private Server                              │
   ├─────────────────────────────────────────────┤
   │ 1. Verify signature                         │
   │ 2. Generate nginx config                    │
   │ 3. Create config file                       │
   │ 4. Test nginx -t                            │
   │ 5. Run certbot to get SSL cert              │
   │ 6. nginx reload                             │
   │ 7. POST webhook back to Vercel              │
   └──────┬──────────────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────┐
   │ Vercel App receives webhook  │
   │ POST /api/custom-domains/webhook
   │ Updates domain status to      │
   │ "active" in database          │
   └──────┬───────────────────────┘
          │
          ▼
   ┌──────────────────────────┐
   │ User sees "Domain Active"│
   │ in Settings              │
   └──────────────────────────┘
```

## Implementation Details

### Frontend (Vercel App)

**Settings Page** (`src/app/(dashboard)/settings/page.tsx`)
- User enters domain (e.g., `example.com` or `subdomain.example.com`)
- Click "Verify DNS" → calls `/api/custom-domain/verify`
- Click "Activate Domain" → calls `/api/custom-domain/setup`

### Verification API (`src/app/api/custom-domain/verify/route.ts`)

```typescript
POST /api/custom-domain/verify
Body: { domain: "example.com" }

Does:
1. Performs DNS lookup on the domain
2. Checks if A record points to 65.21.227.202
3. Returns verified: true/false
```

### Setup API (`src/app/api/custom-domain/setup/route.ts`)

```typescript
POST /api/custom-domain/setup
Body: { domain: "example.com" }

Does:
1. Saves domain to database (status: "pending")
2. Calls SERVER_API_URL/api/custom-domains/setup
3. Returns status to user (activation in progress)

Security:
- Signs request with HMAC-SHA256(payload, DOMAIN_SETUP_SECRET)
```

### Private Server API

The server-side application handles the actual domain setup. It can be deployed as:

**Option 1: Simple Node.js App** (recommended for testing)
```bash
# On 65.21.227.202
cd /opt/pholio/domain-setup-server
npm install
DOMAIN_SETUP_SECRET=your-secret npm start
```

**Option 2: Bash Script** (for production with sudo)
```bash
#!/bin/bash
DOMAIN=$1
VERCEL_APP=$2

# Create nginx config
sudo cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN *.${DOMAIN};
    return 301 https://\$host\$request_uri;
}
server {
    listen 443 ssl http2;
    server_name $DOMAIN *.${DOMAIN};
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    location / {
        proxy_pass https://pholio.vercel.app;
        proxy_set_header Host \$host;
        ...
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN

# Test config
sudo nginx -t

# Get cert (MANUAL - requires DNS TXT record)
sudo certbot certonly --manual --preferred-challenges=dns -d $DOMAIN -d *.$DOMAIN

# Reload nginx
sudo systemctl reload nginx
```

### Webhook Endpoint (`src/app/api/custom-domains/webhook/route.ts`)

```typescript
POST /api/custom-domains/webhook
Headers: { X-Signature: "hmac-sha256-signature" }
Body: {
  userId: "user@example.com",
  domain: "example.com",
  status: "active" | "failed",
  message: "Domain setup completed"
}

Does:
1. Verifies HMAC signature
2. Updates user's domain status in database
3. Saves completion timestamp and any messages/errors
```

### Middleware Update

The middleware already handles custom domains:

```typescript
// src/middleware.ts
const customDomain = domain.toLowerCase();
const cachedUser = await usersCollection.findOne(
  { 'profile.customDomain': customDomain },
  { projection: { username: 1 } }
);

if (cachedUser) {
  return NextResponse.rewrite(new URL(`/${cachedUser.username}/profile`, request.url));
}
```

When a request comes to `example.com`, middleware:
1. Looks up the domain in database
2. Finds the associated username
3. Rewrites the request to `/{username}/profile` on Vercel
4. Vercel app shows the user's profile

## Database Schema

```typescript
User document:
{
  email: "user@example.com",
  subscriptionTier: "paid",
  profile: {
    customDomain: "example.com",
    customDomainStatus: "active" | "pending" | "failed",
    customDomainSetupAt: Date,
    customDomainMessage: "Domain setup completed",
    customDomainError: "Error message if failed"
  }
}
```

## Environment Variables

### Vercel App (.env.local)

```bash
# Domain Setup
DOMAIN_SETUP_SECRET=your-secret-key-change-in-production
SERVER_API_URL=http://65.21.227.202:3001
```

### Private Server (.env)

```bash
PORT=3001
DOMAIN_SETUP_SECRET=your-secret-key-change-in-production
VERCEL_APP_URL=https://pholio.link
```

## Security

1. **Request Signing**: All requests between Vercel and server use HMAC-SHA256 signatures
2. **DNS Verification**: Domain must have correct A record before setup
3. **Webhook Signing**: Webhooks are also signed with HMAC
4. **Domain Blacklist**: pholio.link and other known domains cannot be set up
5. **Rate Limiting**: (Optional) Can add rate limiting to prevent abuse

## Testing

### 1. Test DNS Verification

```bash
curl -X POST http://localhost:3000/api/custom-domain/verify \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}'
```

### 2. Test Domain Setup Flow

1. Add an A record to your domain pointing to 65.21.227.202
2. Go to Settings → Integrations → Custom Domain
3. Enter your domain
4. Click "Verify DNS"
5. Once verified, click "Activate Domain"
6. Watch server logs for setup progress

### 3. Check Nginx Config

```bash
ssh prod "sudo cat /etc/nginx/sites-available/example.com"
ssh prod "sudo nginx -t"
```

### 4. Check SSL Certificate

```bash
ssh prod "sudo ls -la /etc/letsencrypt/live/"
ssh prod "sudo openssl x509 -in /etc/letsencrypt/live/example.com/fullchain.pem -text -noout"
```

### 5. Test Access

```bash
# If DNS is propagated:
curl -v https://example.com

# Should redirect through nginx to Vercel and show the user's profile
```

## Troubleshooting

### DNS Verification Fails

- Check that you've added the A record correctly
- Wait for DNS propagation (up to 48 hours)
- Use `nslookup example.com` or `dig example.com` to verify

### Domain Setup Fails

1. Check server logs: `ssh prod "journalctl -u domain-setup-server -f"`
2. Check nginx config: `ssh prod "sudo nginx -t"`
3. Check certbot status: `ssh prod "sudo certbot certificates"`
4. Check SSL cert exists: `ssh prod "sudo ls -la /etc/letsencrypt/live/example.com/"`

### Domain Doesn't Work

1. Check DNS propagation: `nslookup example.com` should return 65.21.227.202
2. Check nginx: `ssh prod "sudo systemctl status nginx"`
3. Check middleware: Look for custom domain in database
4. Test with IP: `curl -H "Host: example.com" https://65.21.227.202`

### SSL Certificate Error

- For self-signed (temporary): Browser will show "untrusted" - that's OK for testing
- For Let's Encrypt: May need manual DNS verification
- Check cert: `ssh prod "sudo openssl x509 -in /etc/letsencrypt/live/example.com/fullchain.pem -noout -text"`

## Next Steps

1. Set up the domain-setup-server application on 65.21.227.202
2. Add DOMAIN_SETUP_SECRET to both `.env` files
3. Test with a test domain
4. Configure Let's Encrypt automation (certbot renewal)
5. Add monitoring/alerting for failed domain setups
6. Add admin dashboard to view all custom domains
