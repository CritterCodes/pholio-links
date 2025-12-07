import { NextRequest, NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: 'Domain required' }, { status: 400 });
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({
      'profile.customDomain': domain.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json({ username: null }, { status: 404 });
    }

    return NextResponse.json({ username: user.username });
  } catch (error) {
    console.error('Error looking up domain:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
