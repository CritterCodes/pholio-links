import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getBugReportsCollection, getUsersCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email: session.user.email });

    if (!user || !user.isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const bugReportsCollection = await getBugReportsCollection();
    const reports = await bugReportsCollection.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching bug reports:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
