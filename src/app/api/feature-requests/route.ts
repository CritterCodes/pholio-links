import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getFeatureRequestsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const featureRequestsCollection = await getFeatureRequestsCollection();
    const requests = await featureRequestsCollection
      .find({})
      .sort({ votes: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching feature requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const featureRequestsCollection = await getFeatureRequestsCollection();
    
    const newRequest = {
      title,
      description,
      status: 'pending',
      votes: 0,
      userId: new ObjectId(session.user.id),
      username: (session.user as any).username,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await featureRequestsCollection.insertOne(newRequest);

    return NextResponse.json({ ...newRequest, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating feature request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
