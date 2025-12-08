import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUsersCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const settings = user.profile?.emailCapture || {
      enabled: false,
      successMessage: 'Thanks for joining!',
      title: 'Join my community',
      description: 'Get updates on my latest work'
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching fans settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { enabled, successMessage, title, description } = body;

    const usersCollection = await getUsersCollection();
    
    await usersCollection.updateOne(
      { email: session.user.email },
      {
        $set: {
          'profile.emailCapture': {
            enabled,
            successMessage,
            title: title || 'Join my community',
            description: description || 'Get updates on my latest work'
          }
        }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating fans settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
