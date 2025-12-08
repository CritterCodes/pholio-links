import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getFansCollection, getUsersCollection } from '@/lib/mongodb';

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

    const fansCollection = await getFansCollection();
    const fans = await fansCollection
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(fans);
  } catch (error) {
    console.error('Error fetching fans:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
