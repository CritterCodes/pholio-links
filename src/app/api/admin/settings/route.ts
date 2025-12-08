import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getSettingsCollection } from '@/lib/mongodb';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any).isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const settingsCollection = await getSettingsCollection();
    const settings = await settingsCollection.findOne({ type: 'global' });

    return NextResponse.json(settings || { maintenanceMode: false });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any).isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const { maintenanceMode } = body;

    const settingsCollection = await getSettingsCollection();
    
    await settingsCollection.updateOne(
      { type: 'global' },
      { 
        $set: { 
          type: 'global',
          maintenanceMode,
          updatedAt: new Date(),
          updatedBy: session.user.email
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, maintenanceMode });
  } catch (error) {
    console.error('Error updating settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
