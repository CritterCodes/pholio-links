import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUsersCollection } from '@/lib/mongodb';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usersCollection = await getUsersCollection();
    
    // Find user
    const user = await usersCollection.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Filter out disabled social links with empty URLs
    const activeSocialLinks = (user.profile?.socialLinks || []).filter(
      (link: any) => link.enabled && link.url && link.url.trim() !== ''
    );

    // Update user with cleaned social links
    await usersCollection.updateOne(
      { email: session.user.email },
      {
        $set: {
          'profile.socialLinks': activeSocialLinks,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      message: 'Social links cleaned up successfully',
      removedCount: (user.profile?.socialLinks?.length || 0) - activeSocialLinks.length,
      activeCount: activeSocialLinks.length
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}