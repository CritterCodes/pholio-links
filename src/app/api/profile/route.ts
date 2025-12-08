import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUsersCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    const usersCollection = await getUsersCollection();
    let user;

    if (username) {
      // Public profile fetch by username
      user = await usersCollection.findOne({
        username: username.toLowerCase()
      });
    } else {
      // Authenticated user fetch their own profile
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      user = await usersCollection.findOne({
        email: session.user.email
      });
    }

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check status expiration
    let status = user.profile?.status;
    if (status?.expiresAt && new Date(status.expiresAt) < new Date()) {
      status = undefined;
    }

    // Return user profile data with all the new fields
    return NextResponse.json({
      displayName: user.profile?.name || user.name || '',
      profileImage: user.profile?.profileImage || '',
      heroImage: user.profile?.heroImage || '',
      subtitle: user.profile?.subtitle || '',
      bio: user.profile?.bio || '',
      status,
      emailCapture: user.profile?.emailCapture,
      links: user.profile?.links || [],
      socialLinks: user.profile?.socialLinks || [],
      blocks: user.profile?.blocks || [],
      theme: user.profile?.theme || {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        linkStyle: 'rounded',
        linkColor: '#3b82f6',
        backgroundType: 'solid',
        gradientFrom: '#ffffff',
        gradientTo: '#f3f4f6',
        font: 'Inter, sans-serif',
      },
    });
  } catch (error) {
    console.error('Profile GET error:', error);
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

    const { displayName, profileImage, heroImage, subtitle, bio, links, socialLinks, blocks } = await request.json();

    // Basic validation
    if (displayName && displayName.length > 100) {
      return NextResponse.json(
        { message: 'Display name must be less than 100 characters' },
        { status: 400 }
      );
    }

    if (subtitle && subtitle.length > 100) {
      return NextResponse.json(
        { message: 'Subtitle must be less than 100 characters' },
        { status: 400 }
      );
    }

    if (bio && bio.length > 1000) {
      return NextResponse.json(
        { message: 'Bio must be less than 1000 characters' },
        { status: 400 }
      );
    }

    const usersCollection = await getUsersCollection();
    
    // Update the entire profile within user document
    const updateData = {
      'profile.name': displayName?.trim() || '',
      'profile.subtitle': subtitle?.trim() || '',
      'profile.bio': bio?.trim() || '',
      'profile.profileImage': profileImage || '',
      'profile.heroImage': heroImage || '',
      'profile.links': links || [],
      'profile.socialLinks': socialLinks || [],
      'profile.blocks': blocks || [],
      updatedAt: new Date()
    };

    const result = await usersCollection.updateOne(
      { email: session.user.email },
      { $set: updateData },
      { upsert: true }
    );

    if (!result.acknowledged) {
      return NextResponse.json(
        { message: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: {
        displayName: displayName?.trim() || '',
        subtitle: subtitle?.trim() || '',
        bio: bio?.trim() || '',
        profileImage: profileImage || '',
        links: links || [],
        socialLinks: socialLinks || [],
        blocks: blocks || [],
      },
    });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}