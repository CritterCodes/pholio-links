import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUsersCollection } from '@/lib/mongodb';

/**
 * GET /api/custom-domain
 * Retrieve the user's custom domain
 */
export async function GET() {
  try {
    const authSession = await getServerSession(authOptions);

    if (!authSession?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email: authSession.user.email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      customDomain: user.profile?.customDomain || null,
      subscriptionTier: user.subscriptionTier,
    });
  } catch (error) {
    console.error('Error fetching custom domain:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom domain' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/custom-domain
 * Set or update a custom domain
 */
export async function POST(request: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);

    if (!authSession?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email: authSession.user.email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is Pro
    if (user.subscriptionTier !== 'paid') {
      return NextResponse.json(
        { error: 'Custom domains are only available for Pro members' },
        { status: 403 }
      );
    }

    const { customDomain } = await request.json();

    // Validate domain format
    if (!customDomain || typeof customDomain !== 'string') {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Basic domain validation
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
    if (!domainRegex.test(customDomain)) {
      return NextResponse.json(
        { error: 'Invalid domain format. Please enter a valid domain (e.g., example.com)' },
        { status: 400 }
      );
    }

    // Prevent using pholio.link domain
    if (customDomain.toLowerCase().includes('pholio.link')) {
      return NextResponse.json(
        { error: 'Cannot use pholio.link domain' },
        { status: 400 }
      );
    }

    // Check if domain is already taken by another user
    const existingUser = await usersCollection.findOne({
      'profile.customDomain': customDomain.toLowerCase(),
      email: { $ne: authSession.user.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'This domain is already taken' },
        { status: 409 }
      );
    }

    // Update user's custom domain
    await usersCollection.updateOne(
      { email: authSession.user.email },
      {
        $set: {
          'profile.customDomain': customDomain.toLowerCase(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      customDomain: customDomain.toLowerCase(),
      message: 'Custom domain updated successfully. Please update your DNS records.',
    });
  } catch (error) {
    console.error('Error setting custom domain:', error);
    return NextResponse.json(
      { error: 'Failed to set custom domain' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/custom-domain
 * Remove the custom domain
 */
export async function DELETE() {
  try {
    const authSession = await getServerSession(authOptions);

    if (!authSession?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const usersCollection = await getUsersCollection();

    // Remove custom domain
    await usersCollection.updateOne(
      { email: authSession.user.email },
      {
        $unset: {
          'profile.customDomain': '',
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Custom domain removed successfully',
    });
  } catch (error) {
    console.error('Error removing custom domain:', error);
    return NextResponse.json(
      { error: 'Failed to remove custom domain' },
      { status: 500 }
    );
  }
}
