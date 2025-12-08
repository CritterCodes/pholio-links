import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getSubscribersCollection, getUsersCollection } from '@/lib/mongodb';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email: session.user.email });
    
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const subscribersCollection = await getSubscribersCollection();
    const subscribers = await subscribersCollection
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
