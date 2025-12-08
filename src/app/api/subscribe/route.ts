import { NextResponse } from 'next/server';
import { getSubscribersCollection, getUsersCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const subscribersCollection = await getSubscribersCollection();
    
    // Check for duplicate
    const existing = await subscribersCollection.findOne({ 
      userId: user._id, 
      email: email.toLowerCase() 
    });

    if (existing) {
      return new NextResponse('Already subscribed', { status: 409 });
    }

    await subscribersCollection.insertOne({
      userId: user._id,
      email: email.toLowerCase(),
      createdAt: new Date(),
    });

    return new NextResponse('Subscribed successfully', { status: 200 });
  } catch (error) {
    console.error('Error subscribing:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
