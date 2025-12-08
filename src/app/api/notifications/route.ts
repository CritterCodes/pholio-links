import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getNotificationsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const notificationsCollection = await getNotificationsCollection();
    
    // Find user by email to get ID (since session might not have ID depending on config)
    // Actually, let's assume we can query by email if we stored it, but better to use ID.
    // In auth.ts, we are using MongoDB adapter, so session.user.id should be available if configured correctly,
    // but let's look up the user ID from the email just to be safe if the session doesn't have it populated.
    // Wait, the session object in next-auth with mongodb adapter usually has the ID.
    // Let's try to use session.user.id if available, otherwise query.
    
    // For now, let's just query by user email if we stored it in notification, OR look up the user first.
    // The Notification interface uses userId: ObjectId.
    
    // Let's get the user first.
    const { getUsersCollection } = await import('@/lib/mongodb');
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email: session.user.email });
    
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    let notifications = await notificationsCollection
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    // SEED: If no notifications exist, create a welcome one
    if (notifications.length === 0) {
      const welcomeNotification = {
        userId: user._id,
        type: 'system',
        title: 'Welcome to Pholio!',
        message: 'We are excited to have you here. Start by customizing your profile.',
        read: false,
        createdAt: new Date(),
        link: '/dashboard'
      };
      
      await notificationsCollection.insertOne(welcomeNotification);
      notifications = [welcomeNotification as any];
    }

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  // Only allow admins or internal calls (for now just check session)
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId, type, title, message, link } = body;

    if (!userId || !title || !message) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const notificationsCollection = await getNotificationsCollection();
    const newNotification = {
      userId: new ObjectId(userId),
      type: type || 'system',
      title,
      message,
      read: false,
      link,
      createdAt: new Date(),
    };

    await notificationsCollection.insertOne(newNotification);

    return NextResponse.json(newNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
