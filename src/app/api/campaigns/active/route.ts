import { NextResponse } from 'next/server';
import { getCampaignsCollection } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const campaignsCollection = await getCampaignsCollection();
    const now = new Date();

    const activeCampaign = await campaignsCollection.findOne({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    return NextResponse.json(activeCampaign || null);
  } catch (error) {
    console.error('Error fetching active campaign:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
