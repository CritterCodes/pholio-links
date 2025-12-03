# Quick Start: Custom Domain Setup

## TL;DR - What You Need to Do

### 1. Update Environment Variables

Add to `.env.local`:
```bash
DOMAIN_SETUP_SECRET=generate-a-random-secret-here-at-least-32-chars
SERVER_API_URL=https://65.21.227.202:3001
```

### 2. Deploy Vercel App

```bash
git add .
git commit -m "Add custom domain setup"
git push origin main
```

Update `.env` in Vercel dashboard with the same values.

### 3. Deploy Server (on 65.21.227.202)

```bash
ssh prod

# Create directory
sudo mkdir -p /opt/pholio/domain-setup-server
cd /opt/pholio/domain-setup-server

# Setup
npm init -y
npm install express dotenv

# Get server code
# (Copy the content of docs/server.js and save as server.js)
# Or:
cat > server.js << 'EOF'
# (paste server.js content here)
EOF

# Create .env
sudo tee .env << EOF
PORT=3001
DOMAIN_SETUP_SECRET=same-secret-as-vercel
VERCEL_APP_URL=https://pholio.link
EOF

# Set permissions
sudo chmod 600 .env
sudo chown -R www-data:www-data /opt/pholio/domain-setup-server

# Create systemd service
sudo tee /etc/systemd/system/pholio-domain-setup.service << EOF
[Unit]
Description=Pholio Domain Setup Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/pholio/domain-setup-server
ExecStart=/usr/bin/node /opt/pholio/domain-setup-server/server.js
Restart=always
RestartSec=10
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable pholio-domain-setup
sudo systemctl start pholio-domain-setup

# Verify
sudo systemctl status pholio-domain-setup
```

### 4. Configure Sudo Access

```bash
sudo visudo
# Add these lines at the end:
www-data ALL=(ALL) NOPASSWD: /usr/sbin/nginx
www-data ALL=(ALL) NOPASSWD: /usr/bin/certbot
www-data ALL=(ALL) NOPASSWD: /bin/mkdir
www-data ALL=(ALL) NOPASSWD: /usr/bin/tee
www-data ALL=(ALL) NOPASSWD: /bin/ln
www-data ALL=(ALL) NOPASSWD: /usr/bin/openssl
www-data ALL=(ALL) NOPASSWD: /bin/systemctl
```

### 5. Test It

1. **Add A Record to Test Domain**
   - Domain: `test.example.com` (replace with your domain)
   - Type: A Record
   - Value: `65.21.227.202`
   - Wait for propagation (can take hours)

2. **In Settings → Integrations → Custom Domain**
   - Enter your test domain
   - Click "Verify DNS" → should show ✓ verified
   - Click "Activate Domain"
   - Watch server logs: `ssh prod "journalctl -u pholio-domain-setup -f"`
   - After setup completes, visit your domain
   - Should show your Pholio profile

## What Gets Created

### On Vercel App
- `/src/app/api/custom-domain/verify/route.ts` - DNS verification
- `/src/app/api/custom-domain/setup/route.ts` - Setup triggering
- `/src/app/api/custom-domains/webhook/route.ts` - Webhook receiver
- Settings UI updated with verify + activate buttons

### On Server (65.21.227.202)
For each custom domain setup:
- `/etc/nginx/sites-available/{domain}` - Nginx config
- `/etc/nginx/sites-enabled/{domain}` - Symlink
- `/etc/letsencrypt/live/{domain}/` - SSL certs

### In Database
User document updated:
```javascript
profile: {
  customDomain: "example.com",
  customDomainStatus: "active" | "pending" | "failed",
  customDomainSetupAt: Date,
  customDomainMessage: "...",
  customDomainError: null | "..."
}
```

## How It Works (Flow)

```
User enters domain in Settings
        ↓
Click "Verify DNS"
  → Check if domain A record points to 65.21.227.202
  → Show ✓ verified
        ↓
Click "Activate Domain"
  → Save domain to database (status: pending)
  → Call /api/custom-domain/setup
        ↓
Setup API calls server at 65.21.227.202:3001
  → Create nginx config
  → Generate SSL cert
  → Reload nginx
  → Send webhook back
        ↓
Webhook updates database (status: active)
        ↓
Domain works! 🎉
Middleware routes to user's profile
```

## Troubleshooting

### "Verify DNS" fails
- Make sure A record is added (not CNAME)
- Value must be exactly `65.21.227.202`
- Check with: `nslookup your-domain.com`
- May take 24-48 hours to propagate

### "Activate Domain" fails
1. Check server is running: `ssh prod "systemctl status pholio-domain-setup"`
2. Check logs: `ssh prod "journalctl -u pholio-domain-setup -f -n 50"`
3. Check secrets match: `echo $DOMAIN_SETUP_SECRET`
4. Check SERVER_API_URL in .env

### Domain doesn't work after activation
1. Check nginx config: `ssh prod "sudo cat /etc/nginx/sites-available/your-domain.com"`
2. Check cert: `ssh prod "sudo ls -la /etc/letsencrypt/live/your-domain.com/"`
3. Test curl: `curl -H "Host: your-domain.com" https://65.21.227.202`
4. Check database: domain should have `customDomainStatus: "active"`

## Security Notes

- `DOMAIN_SETUP_SECRET` must be strong (use: `openssl rand -hex 32`)
- Same secret must be in both .env files
- All requests are HMAC-SHA256 signed
- Sudo rules are minimal (only nginx/certbot)
- Domains are verified via DNS before setup
- Blacklist prevents setup of problematic domains

## Next Steps

1. Choose a strong secret and add to both .env files
2. Deploy to Vercel
3. Deploy server following steps above
4. Test with a test domain
5. Share domain setup instructions with users

## Files to Review

- `docs/CUSTOM_DOMAIN_SETUP.md` - Full architecture details
- `docs/SERVER_DEPLOYMENT.md` - Detailed deployment guide
- `docs/IMPLEMENTATION_COMPLETE.md` - Full implementation overview
- `docs/server.js` - Server source code

---

Questions? Check the docs or ask me!
