/**
 * Print Service Integration (Prodigi)
 * 
 * This service handles the integration with Prodigi's Print on Demand API.
 * Documentation: https://docs.prodigi.com/
 * 
 * Workflow:
 * 1. User designs business card in BusinessCardDesigner.
 * 2. User proceeds to checkout (Stripe).
 * 3. Upon successful payment, this service is called to create an order in Prodigi.
 * 4. Prodigi prints and ships the card to the user.
 */

interface Address {
  line1: string;
  line2?: string;
  postalOrZipCode: string;
  countryCode: string; // ISO 3166-1 alpha-2 (e.g. "US", "GB")
  townOrCity: string;
  stateOrCounty?: string;
}

interface Recipient {
  name: string;
  email: string;
  phoneNumber?: string;
  address: Address;
}

interface PrintAsset {
  printArea: string; // e.g. "front", "back"
  url: string; // URL to the high-res PDF/PNG of the design
}

interface OrderItem {
  sku: string; // Prodigi SKU for Business Cards (e.g. "GLOBAL-BC-01")
  copies: number; // Quantity (e.g. 50, 100)
  sizing: 'fill' | 'fit';
  assets: PrintAsset[];
}

interface CreateOrderRequest {
  shippingMethod: 'Budget' | 'Standard' | 'Express';
  recipient: Recipient;
  items: OrderItem[];
  idempotencyKey: string; // Unique ID to prevent duplicate orders
  metadata?: Record<string, string>;
}

export class PrintService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.PRODIGI_API_KEY || '';
    // Use sandbox URL for development, production URL for live
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.prodigi.com/v4.0' 
      : 'https://api.sandbox.prodigi.com/v4.0';
  }

  /**
   * Create a new print order
   */
  async createOrder(orderData: CreateOrderRequest) {
    if (!this.apiKey) {
      throw new Error('Prodigi API key is not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Prodigi API Error: ${JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create print order:', error);
      throw error;
    }
  }

  /**
   * Get a shipping quote before placing order
   */
  async getQuote(destinationCountry: string, items: OrderItem[]) {
    // Implementation for getting shipping costs to display to user
    // POST /quotes
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string) {
    // GET /orders/{orderId}
  }
}

// Example Usage:
/*
const printService = new PrintService();
await printService.createOrder({
  shippingMethod: 'Standard',
  recipient: {
    name: 'John Doe',
    email: 'john@example.com',
    address: {
      line1: '123 Main St',
      townOrCity: 'New York',
      stateOrCounty: 'NY',
      postalOrZipCode: '10001',
      countryCode: 'US'
    }
  },
  items: [{
    sku: 'GLOBAL-BC-01', // Example SKU
    copies: 100,
    sizing: 'fill',
    assets: [{
      printArea: 'default',
      url: 'https://pholio.links/api/generate-card/123.pdf' // URL to generated PDF
    }]
  }],
  idempotencyKey: 'order_123_abc'
});
*/
