import { NextResponse } from 'next/server';
import { getFansCollection, getUsersCollection } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { username, email } = await req.json();

    if (!username || !email) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new NextResponse('Invalid email address', { status: 400 });
    }

    const usersCollection = await getUsersCollection();
    const creator = await usersCollection.findOne({ username: username.toLowerCase() });

    if (!creator) {
      return new NextResponse('Creator not found', { status: 404 });
    }

    const fansCollection = await getFansCollection();

    // Check if already subscribed
    const existingFan = await fansCollection.findOne({
      userId: creator._id,
      email: email.toLowerCase()
    });

    if (existingFan) {
      return new NextResponse('Already subscribed', { status: 409 });
    }

    await fansCollection.insertOne({
      userId: creator._id,
      email: email.toLowerCase(),
      createdAt: new Date()
    });

    // Optional: Create a notification for the creator
    // We could call the internal notification API or insert directly.
    // For simplicity/performance, let's skip for now or add later.

    return new NextResponse('Subscribed successfully', { status: 200 });
  } catch (error) {
    console.error('Error subscribing fan:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
