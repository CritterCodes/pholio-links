import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const PRICES = {
  50: 2999,   // $29.99
  100: 4999,  // $49.99
  250: 8999,  // $89.99
  500: 14999, // $149.99
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quantity, finish, imageUrl } = await request.json();

    if (!PRICES[quantity as keyof typeof PRICES]) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    const amount = PRICES[quantity as keyof typeof PRICES];

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${quantity} Business Cards`,
              description: `${finish === 'gloss' ? 'Gloss' : 'Matte'} Finish`,
              images: imageUrl ? [imageUrl] : [],
              metadata: {
                type: 'print_order',
                quantity,
                finish,
                imageUrl,
              },
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['US', 'GB', 'CA', 'AU', 'DE', 'FR'], // Add more as needed
      },
      metadata: {
        type: 'print_order',
        quantity,
        finish,
        imageUrl,
        userId: session.user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=print_order`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/business-card?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
