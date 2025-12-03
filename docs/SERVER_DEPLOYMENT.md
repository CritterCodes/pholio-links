# Deploying Domain Setup Server

This guide walks you through deploying the domain-setup-server on your private server at `65.21.227.202`.

## Prerequisites

- Node.js 18+ installed on the server
- Nginx installed and configured
- Certbot installed
- SSH access to the server
- A shared secret (DOMAIN_SETUP_SECRET) created

## Installation Steps

### 1. Create Application Directory

```bash
ssh prod

# Create app directory
sudo mkdir -p /opt/pholio/domain-setup-server
cd /opt/pholio/domain-setup-server

# Initialize Node.js project
npm init -y
npm install express dotenv
```

### 2. Create Server File

Copy the server code from `docs/SERVER_SETUP.ts` and save as `server.js` on the server:

```bash
# Create the server.js file on your local machine, then:
scp server.js prod:/opt/pholio/domain-setup-server/
```

Or create it directly:

```bash
cat > /opt/pholio/domain-setup-server/server.js << 'EOF'
# (Paste the server code here)
EOF
```

### 3. Create .env File

```bash
cat > /opt/pholio/domain-setup-server/.env << EOF
PORT=3001
DOMAIN_SETUP_SECRET=your-super-secret-key-here-change-this
VERCEL_APP_URL=https://pholio.link
EOF

# Restrict permissions
chmod 600 /opt/pholio/domain-setup-server/.env
```

**Important:** Use the SAME `DOMAIN_SETUP_SECRET` that you set in your Vercel app's `.env.local`.

### 4. Test the Server Locally

```bash
cd /opt/pholio/domain-setup-server
node server.js

# Should output:
# [Domain Setup Server] Listening on port 3001
# [Domain Setup Server] DOMAIN_SETUP_SECRET: ✓ Set
```

Press `Ctrl+C` to stop.

### 5. Set Up Systemd Service (Production)

Create a systemd service file to run the server automatically:

```bash
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
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable pholio-domain-setup
sudo systemctl start pholio-domain-setup

# Check status
sudo systemctl status pholio-domain-setup

# View logs
sudo journalctl -u pholio-domain-setup -f
```

### 6. Configure Firewall (Optional but Recommended)

The server listens on port 3001, which should only be accessible from your Vercel domain:

```bash
# Allow only from Vercel's IPs (these are examples, check Vercel's docs)
sudo ufw allow from 76.76.19.0/24 to any port 3001 comment "Vercel"
sudo ufw allow from 76.76.21.0/24 to any port 3001 comment "Vercel"

# Or allow all (less secure):
sudo ufw allow 3001
```

### 7. Test the Endpoint

From your local machine:

```bash
curl -X POST https://65.21.227.202:3001/api/custom-domains/setup \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "test.example.com",
    "userId": "test@example.com",
    "webhookUrl": "https://pholio.link/api/custom-domains/webhook",
    "signature": "invalid-signature-for-now"
  }'

# Should reject due to invalid signature (which is good!)
```

### 8. Update Vercel App Environment Variables

Make sure your `.env.local` has:

```bash
DOMAIN_SETUP_SECRET=your-super-secret-key-here-change-this
SERVER_API_URL=https://65.21.227.202:3001
```

Deploy to Vercel.

## Sudo Access for Nginx/Certbot

The server needs sudo access to run nginx and certbot commands. To avoid requiring a password:

```bash
# Edit sudoers
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

## Troubleshooting

### Server won't start

```bash
# Check Node.js is installed
node --version

# Check dependencies are installed
cd /opt/pholio/domain-setup-server
npm install

# Try running directly to see errors
node server.js
```

### Port 3001 already in use

```bash
# Find what's using it
sudo lsof -i :3001

# Kill the process
sudo kill -9 <PID>
```

### Can't connect to server from Vercel app

1. Check server is running: `sudo systemctl status pholio-domain-setup`
2. Check port is open: `sudo netstat -tlnp | grep 3001`
3. Check firewall: `sudo ufw status`
4. Check SERVER_API_URL in `.env.local` is correct
5. Try from server machine: `curl http://localhost:3001/health`

### Nginx config creation fails

```bash
# Check nginx folder permissions
ls -la /etc/nginx/sites-available/

# Check if www-data can write
sudo -u www-data touch /etc/nginx/sites-available/test.txt
sudo rm /etc/nginx/sites-available/test.txt
```

### Certbot fails silently

```bash
# Check certbot is installed
certbot --version

# Try manual cert generation
sudo certbot certonly --manual --preferred-challenges=dns -d example.com

# Check existing certs
sudo certbot certificates

# Check DNS records
nslookup example.com
```

## Monitoring

### View logs in real-time

```bash
sudo journalctl -u pholio-domain-setup -f
```

### Check domain status

```bash
# List all custom domains set up
ls -la /etc/nginx/sites-available/

# Check a specific domain's nginx config
sudo cat /etc/nginx/sites-available/example.com

# Check SSL cert
sudo openssl x509 -in /etc/letsencrypt/live/example.com/fullchain.pem -noout -text
```

### Health check endpoint

```bash
curl http://65.21.227.202:3001/health

# Should return:
# {"status":"ok","timestamp":"2024-01-15T10:30:00Z"}
```

## Updates

To update the server code:

```bash
# Download new version
scp /path/to/new/server.js prod:/opt/pholio/domain-setup-server/

# Restart service
sudo systemctl restart pholio-domain-setup
```

## Backups

Important files to back up:

```bash
# Nginx configs
/etc/nginx/sites-available/

# SSL certificates
/etc/letsencrypt/live/

# Application code
/opt/pholio/domain-setup-server/
```

```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/backups/pholio

mkdir -p $BACKUP_DIR

sudo tar -czf $BACKUP_DIR/nginx_sites_$DATE.tar.gz /etc/nginx/sites-available/
sudo tar -czf $BACKUP_DIR/letsencrypt_$DATE.tar.gz /etc/letsencrypt/

# Optional: sync to cloud storage
# aws s3 sync $BACKUP_DIR s3://my-backup-bucket/pholio/
```

## Security Checklist

- [ ] DOMAIN_SETUP_SECRET is strong (random 32+ characters)
- [ ] .env file has 600 permissions (`chmod 600 .env`)
- [ ] SERVICE runs as non-root user (www-data)
- [ ] Firewall restricts who can access port 3001
- [ ] Sudo rules are minimal (only nginx/certbot)
- [ ] SSL certificates are used for Vercel API calls
- [ ] Logs don't expose secrets
- [ ] Regular backups of nginx configs and certs
