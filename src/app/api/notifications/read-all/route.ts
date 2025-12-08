import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getNotificationsCollection, getUsersCollection } from '@/lib/mongodb';

export async function PUT() {
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

    const notificationsCollection = await getNotificationsCollection();
    
    await notificationsCollection.updateMany(
      { userId: user._id, read: false },
      { $set: { read: true } }
    );

    return new NextResponse('All marked as read', { status: 200 });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
