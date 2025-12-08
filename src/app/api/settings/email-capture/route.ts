import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUsersCollection } from '@/lib/mongodb';

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const { enabled, title, description, successMessage } = body;

    const usersCollection = await getUsersCollection();
    
    await usersCollection.updateOne(
      { email: session.user.email },
      { 
        $set: { 
          'profile.emailCapture': {
            enabled,
            title: title || 'Join my newsletter',
            description: description || 'Stay updated with my latest content.',
            successMessage: successMessage || 'Thanks for subscribing!',
          } 
        } 
      }
    );

    return new NextResponse('Settings updated', { status: 200 });
  } catch (error) {
    console.error('Error updating email capture settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
