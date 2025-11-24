import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUsersCollection } from '@/lib/mongodb';

interface ThemeData {
  backgroundColor: string;
  textColor: string;
  linkStyle: 'rounded' | 'square' | 'pill';
  linkColor: string;
  backgroundType: 'solid' | 'gradient' | 'image';
  gradientFrom: string;
  gradientTo: string;
  font: string;
  backgroundImage?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({
      email: session.user.email
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Return theme data with defaults
    const defaultTheme = {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      linkStyle: 'rounded',
      linkColor: '#3b82f6',
      backgroundType: 'solid',
      gradientFrom: '#ffffff',
      gradientTo: '#f3f4f6',
      font: 'Inter, sans-serif',
    };

    return NextResponse.json(user.profile?.theme || defaultTheme);
  } catch (error) {
    console.error('Theme GET error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const themeData: ThemeData = await request.json();

    // Basic validation
    if (!themeData.backgroundColor || !themeData.textColor || !themeData.linkColor) {
      return NextResponse.json(
        { message: 'Missing required theme colors' },
        { status: 400 }
      );
    }

    if (!['rounded', 'square', 'pill'].includes(themeData.linkStyle)) {
      return NextResponse.json(
        { message: 'Invalid link style' },
        { status: 400 }
      );
    }

    if (!['solid', 'gradient', 'image'].includes(themeData.backgroundType)) {
      return NextResponse.json(
        { message: 'Invalid background type' },
        { status: 400 }
      );
    }

    const usersCollection = await getUsersCollection();
    
    // Update theme in profile
    const updateData = {
      'profile.theme': {
        backgroundColor: themeData.backgroundColor,
        textColor: themeData.textColor,
        linkStyle: themeData.linkStyle,
        linkColor: themeData.linkColor,
        backgroundType: themeData.backgroundType,
        gradientFrom: themeData.gradientFrom,
        gradientTo: themeData.gradientTo,
        font: themeData.font,
        backgroundImage: themeData.backgroundImage || undefined,
      },
      updatedAt: new Date()
    };

    const result = await usersCollection.updateOne(
      { email: session.user.email },
      { $set: updateData },
      { upsert: true }
    );

    if (!result.acknowledged) {
      return NextResponse.json(
        { message: 'Failed to update theme' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Theme updated successfully',
      theme: updateData['profile.theme'],
    });
  } catch (error) {
    console.error('Theme PUT error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}