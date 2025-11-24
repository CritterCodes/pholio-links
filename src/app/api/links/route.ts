import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUsersCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Sort links by order
    const sortedLinks = (user.links || []).sort((a: any, b: any) => a.order - b.order);

    return NextResponse.json({
      links: sortedLinks.map((link: any) => ({
        _id: link._id.toString(),
        title: link.title,
        url: link.url,
        isActive: link.isActive,
        order: link.order,
        linkType: link.linkType,
      })),
    });
  } catch (error) {
    console.error('Links GET error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { title, url, linkType } = await request.json();

    // Validation
    if (!title || !url) {
      return NextResponse.json(
        { message: 'Title and URL are required' },
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

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get the next order number
    const maxOrder = user.links?.length 
      ? Math.max(...user.links.map((link: { order: number }) => link.order))
      : -1;
    const nextOrder = maxOrder + 1;

    const newLink = {
      _id: new ObjectId(),
      title: title.trim(),
      url: url.trim(),
      linkType: linkType || 'regular',
      isActive: true,
      order: nextOrder,
      createdAt: new Date(),
    };

    await usersCollection.updateOne(
      { email: session.user.email },
      { 
        $push: { links: newLink },
        $set: { updatedAt: new Date() }
      }
    );

    return NextResponse.json({
      message: 'Link created successfully',
      linkId: newLink._id.toString(),
      ...newLink,
      _id: newLink._id.toString(),
    });
  } catch (error) {
    console.error('Links POST error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}