import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getNotificationsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id } = await params;
    const notificationsCollection = await getNotificationsCollection();
    
    await notificationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { read: true } }
    );

    return new NextResponse('Marked as read', { status: 200 });
  } catch (error) {
    console.error('Error updating notification:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
