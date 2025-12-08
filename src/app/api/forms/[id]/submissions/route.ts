import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getFormsCollection, getFormSubmissionsCollection, getUsersCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return new NextResponse('Invalid ID', { status: 400 });
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email: session.user.email });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const formsCollection = await getFormsCollection();
    const form = await formsCollection.findOne({ 
      _id: new ObjectId(id),
      userId: user._id 
    });

    if (!form) {
      return new NextResponse('Form not found', { status: 404 });
    }

    const submissionsCollection = await getFormSubmissionsCollection();
    const submissions = await submissionsCollection
      .find({ formId: new ObjectId(id) })
      .sort({ submittedAt: -1 })
      .toArray();

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
