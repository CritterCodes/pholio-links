import { NextRequest, NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const body = await request.json();
    const { title, url, description, isActive, linkType } = body;

    // Validation for title and url if they're being updated
    if (title !== undefined) {
      if (!title || title.length > 100) {
        return NextResponse.json(
          { message: 'Title is required and must be less than 100 characters' },
          { status: 400 }
        );
      }
    }

    if (url !== undefined) {
      if (!url) {
        return NextResponse.json(
          { message: 'URL is required' },
          { status: 400 }
        );
      }
      
      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { message: 'Please provide a valid URL' },
          { status: 400 }
        );
      }
    }

    const usersCollection = await getUsersCollection();
    
    // Build update object for the specific link in the array
    const updateFields: Record<string, string | boolean | Date | null> = {};
    
    if (title !== undefined) updateFields['links.$.title'] = title.trim();
    if (url !== undefined) updateFields['links.$.url'] = url.trim();
    if (description !== undefined) updateFields['links.$.description'] = description?.trim() || null;
    if (isActive !== undefined) updateFields['links.$.isActive'] = isActive;
    if (linkType !== undefined) updateFields['links.$.linkType'] = linkType;
    
    updateFields['links.$.updatedAt'] = new Date();
    updateFields['updatedAt'] = new Date();

    const result = await usersCollection.updateOne(
      { 
        email: session.user.email,
        'links._id': new ObjectId(id)
      },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Link updated successfully',
    });
  } catch (error) {
    console.error('Link PUT error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;

    const usersCollection = await getUsersCollection();
    
    const result = await usersCollection.updateOne(
      { email: session.user.email },
      { 
        $pull: { links: { _id: new ObjectId(id) } },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Link deleted successfully',
    });
  } catch (error) {
    console.error('Link DELETE error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}