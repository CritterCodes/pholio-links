/**
 * Domain Setup Client
 * Use to communicate with the Domain Setup Microservice from Pholio
 */

import crypto from 'crypto';

interface SetupDomainResponse {
  status: 'pending' | 'removing' | 'active' | 'failed';
  domain: string;
  message: string;
  error?: string;
  timestamp: string;
}

export class DomainSetupClient {
  private serverUrl: string;
  private secret: string;

  constructor(serverUrl: string, secret: string) {
    this.serverUrl = serverUrl.replace(/\/$/, '');
    this.secret = secret;
  }

  private createSignature(body: Record<string, unknown> | string): string {
    const str = typeof body === 'string' ? body : JSON.stringify(body);
    return crypto.createHmac('sha256', this.secret).update(str).digest('hex');
  }

  async setupDomain(
    domain: string,
    userId: string,
    webhookUrl: string
  ): Promise<SetupDomainResponse> {
    const body = { domain, userId, webhookUrl };
    const signature = this.createSignature(body);

    const response = await fetch(`${this.serverUrl}/api/domains/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
      },
      body: JSON.stringify(body),
      // Allow self-signed certificates until proper cert is obtained
      // Once domains.crittercodes.dev A record is configured, we can use certbot
      // @ts-ignore
      rejectUnauthorized: false,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Domain setup failed');
    }

    return response.json();
  }

  async checkStatus(domain: string) {
    const response = await fetch(
      `${this.serverUrl}/api/domains/${domain}/status`,
      // Allow self-signed certificates until proper cert is obtained
      // @ts-ignore
      { rejectUnauthorized: false }
    );

    if (!response.ok) {
      throw new Error('Failed to check domain status');
    }

    return response.json();
  }

  async health() {
    const response = await fetch(`${this.serverUrl}/health`, {
      // Allow self-signed certificates until proper cert is obtained
      // @ts-ignore
      rejectUnauthorized: false,
    });

    if (!response.ok) {
      throw new Error('Service unavailable');
    }

    return response.json();
  }
}
