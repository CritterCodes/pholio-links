import { NextResponse } from 'next/server';
import { getSettingsCollection } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settingsCollection = await getSettingsCollection();
    const settings = await settingsCollection.findOne({ type: 'global' });

    return NextResponse.json({ 
      maintenanceMode: settings?.maintenanceMode || false 
    });
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    // Default to false in case of DB error to avoid locking everyone out accidentally
    return NextResponse.json({ maintenanceMode: false });
  }
}
