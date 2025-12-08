import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getFormsCollection, getUsersCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email: session.user.email });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const formsCollection = await getFormsCollection();
    const forms = await formsCollection.find({ userId: user._id }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email: session.user.email });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Check if user is Pro or Admin
    if (user.subscriptionTier !== 'paid' && !user.isAdmin) {
      return new NextResponse('Upgrade required', { status: 403 });
    }

    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return new NextResponse('Title is required', { status: 400 });
    }

    const formsCollection = await getFormsCollection();
    const newForm = {
      userId: user._id,
      title,
      description: description || '',
      fields: [],
      submitButtonText: 'Submit',
      successMessage: 'Thank you for your submission!',
      isActive: true,
      views: 0,
      submissionsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await formsCollection.insertOne(newForm);

    return NextResponse.json({ ...newForm, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating form:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
