import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUsersCollection } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, emoji, duration } = await request.json();

    if (!message || message.length > 80) {
      return NextResponse.json(
        { message: 'Status must be between 1 and 80 characters' },
        { status: 400 }
      );
    }

    let expiresAt: Date | null = null;
    if (duration && duration !== 'permanent') {
      const now = new Date();
      switch (duration) {
        case '1h':
          expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
          break;
        case '4h':
          expiresAt = new Date(now.getTime() + 4 * 60 * 60 * 1000);
          break;
        case '24h':
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case '7d':
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          // If unknown duration, default to 24h or handle as error? 
          // Let's assume 'permanent' or null means no expiry.
          break;
      }
    }

    const usersCollection = await getUsersCollection();
    
    await usersCollection.updateOne(
      { email: session.user.email },
      {
        $set: {
          'profile.status': {
            message,
            emoji,
            expiresAt,
            createdAt: new Date(),
          }
        }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Set status error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usersCollection = await getUsersCollection();
    
    await usersCollection.updateOne(
      { email: session.user.email },
      {
        $unset: {
          'profile.status': ""
        }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete status error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
