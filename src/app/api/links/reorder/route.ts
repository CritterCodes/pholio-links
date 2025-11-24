import { NextRequest, NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { linkOrders } = await request.json();

    if (!linkOrders || !Array.isArray(linkOrders)) {
      return NextResponse.json(
        { message: 'Link orders array is required' },
        { status: 400 }
      );
    }

    const usersCollection = await getUsersCollection();
    
    // Get the user to update link orders in their embedded array
    const user = await usersCollection.findOne({ email: session.user.email });
    
    if (!user || !user.links) {
      return NextResponse.json({ error: 'User or links not found' }, { status: 404 });
    }

    // Update each link's order
    for (const { id, order } of linkOrders) {
      await usersCollection.updateOne(
        { 
          email: session.user.email,
          'links._id': new ObjectId(id)
        },
        { 
          $set: { 
            'links.$.order': order,
            'links.$.updatedAt': new Date(),
            updatedAt: new Date()
          }
        }
      );
    }

    return NextResponse.json({
      message: 'Link order updated successfully',
    });
  } catch (error) {
    console.error('Link reorder error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}