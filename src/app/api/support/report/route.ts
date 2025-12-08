import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getBugReportsCollection, getUsersCollection } from '@/lib/mongodb';
import { BugReport } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { title, description, imageUrl } = body;

    if (!title || !description) {
      return new NextResponse('Title and description are required', { status: 400 });
    }

    let userId;
    let email;

    if (session?.user?.email) {
      const usersCollection = await getUsersCollection();
      const user = await usersCollection.findOne({ email: session.user.email });
      if (user) {
        userId = user._id;
        email = user.email;
      }
    }

    const bugReportsCollection = await getBugReportsCollection();
    
    const newReport: BugReport = {
      userId,
      email: email || body.email, // Allow email from body if not logged in (though this route might be protected, let's be flexible)
      title,
      description,
      imageUrl,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await bugReportsCollection.insertOne(newReport);

    return NextResponse.json({ message: 'Report submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error submitting bug report:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
