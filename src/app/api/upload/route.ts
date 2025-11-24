import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    // For demo purposes, we'll use a hardcoded user ID
    // Replace with proper session validation
    const testUserId = '674404c12fd885b8dd50c8a0';
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as 'profiles' | 'gallery' | 'splash' | 'heroes';

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    if (!folder || !['profiles', 'gallery', 'splash', 'heroes'].includes(folder)) {
      return NextResponse.json(
        { message: 'Invalid folder specified' },
        { status: 400 }
      );
    }

    // File size validation (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // File type validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      );
    }

    // Upload to S3
    const fileUrl = await uploadFile(file, testUserId, folder);

    return NextResponse.json({
      message: 'File uploaded successfully',
      url: fileUrl,
    });
  } catch (error) {
    console.error('File upload error:', error);
    
    // Handle specific S3 errors
    if (error instanceof Error && error.message.includes('AWS credentials')) {
      return NextResponse.json(
        { message: 'File upload service not configured' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}