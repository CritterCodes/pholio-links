import { NextResponse } from 'next/server';
import { getAnalyticsCollection, getUsersCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { UAParser } from 'ua-parser-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, username, linkId, visitorId, referrer } = body;
    const userAgent = req.headers.get('user-agent') || '';

    if (!username || !type) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Get profile owner
    const usersCollection = await getUsersCollection();
    const profileOwner = await usersCollection.findOne({ username });

    if (!profileOwner) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Parse User Agent
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    const analyticsCollection = await getAnalyticsCollection();

    await analyticsCollection.insertOne({
      profileOwnerId: profileOwner._id,
      type, // 'view' | 'click'
      linkId: linkId ? new ObjectId(linkId) : null,
      visitorId, // Client-generated hash or ID
      timestamp: new Date(),
      metadata: {
        browser: browser.name,
        os: os.name,
        device: device.type || 'desktop',
        referrer: referrer || 'direct',
        country: req.headers.get('x-vercel-ip-country') || 'unknown',
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
