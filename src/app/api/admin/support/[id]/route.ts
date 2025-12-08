import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getBugReportsCollection, getUsersCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email: session.user.email });

    if (!user || !user.isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (!ObjectId.isValid(id)) {
      return new NextResponse('Invalid ID', { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return new NextResponse('Invalid status', { status: 400 });
    }

    const bugReportsCollection = await getBugReportsCollection();
    const result = await bugReportsCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return new NextResponse('Report not found', { status: 404 });
    }

    return NextResponse.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating bug report:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
