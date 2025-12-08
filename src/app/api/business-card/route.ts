import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUsersCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user.profile?.businessCard || {
      layout: 'classic',
      showQr: true,
      showAvatar: true,
      showSubtitle: true,
      showPhone: false,
      showEmail: false,
      showWebsite: false,
      phoneNumber: '',
      email: '',
      website: '',
      backgroundImage: '',
      theme: 'default',
      customColors: {
        background: '#ffffff',
        text: '#000000',
        accent: '#3b82f6'
      }
    });
  } catch (error) {
    console.error('Business Card GET error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const usersCollection = await getUsersCollection();

    await usersCollection.updateOne(
      { email: session.user.email },
      { $set: { 'profile.businessCard': data } }
    );

    return NextResponse.json({ message: 'Business card settings saved' });
  } catch (error) {
    console.error('Business Card POST error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
