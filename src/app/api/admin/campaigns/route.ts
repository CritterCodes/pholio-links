import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getCampaignsCollection } from '@/lib/mongodb';
import { createPromotionCode } from '@/lib/stripe';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any).isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const campaignsCollection = await getCampaignsCollection();
    const campaigns = await campaignsCollection.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any).isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, code, percentOff, duration, durationInMonths, startDate, endDate, isActive } = body;

    // Create Stripe Promotion Code
    let stripePromotionCodeId = null;
    try {
      const promotionCode = await createPromotionCode(code, percentOff, duration, durationInMonths);
      stripePromotionCodeId = promotionCode.id;
    } catch (stripeError) {
      console.error('Failed to create Stripe promotion code:', stripeError);
      return new NextResponse('Failed to create Stripe promotion code', { status: 400 });
    }

    const campaignsCollection = await getCampaignsCollection();
    
    const newCampaign = {
      title,
      description,
      code,
      percentOff,
      duration,
      durationInMonths,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive,
      stripePromotionCodeId,
      createdAt: new Date(),
      createdBy: session.user.email
    };

    await campaignsCollection.insertOne(newCampaign);

    return NextResponse.json(newCampaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
