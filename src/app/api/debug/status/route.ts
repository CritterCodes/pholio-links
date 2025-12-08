import { NextRequest, NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({
      username: username.toLowerCase()
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      username: user.username,
      hasProfile: !!user.profile,
      statusRaw: user.profile?.status,
      statusExpiresAtType: user.profile?.status?.expiresAt ? typeof user.profile.status.expiresAt : 'undefined',
      now: new Date(),
      isExpired: user.profile?.status?.expiresAt ? new Date(user.profile.status.expiresAt) < new Date() : 'N/A'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
