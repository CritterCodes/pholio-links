import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUsersCollection, getFeatureRequestsCollection } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usersCollection = await getUsersCollection();
    const featureRequestsCollection = await getFeatureRequestsCollection();

    const [
      totalUsers,
      proUsers,
      totalFeatureRequests,
      pendingFeatureRequests
    ] = await Promise.all([
      usersCollection.countDocuments(),
      usersCollection.countDocuments({ subscriptionTier: 'paid' }),
      featureRequestsCollection.countDocuments(),
      featureRequestsCollection.countDocuments({ status: 'pending' })
    ]);

    return NextResponse.json({
      totalUsers,
      proUsers,
      totalFeatureRequests,
      pendingFeatureRequests
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
