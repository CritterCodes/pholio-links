import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error('AWS credentials not configured');
}

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'pholio-bucket';

export async function uploadFile(
  file: File,
  userId: string,
  folder: 'profiles' | 'gallery' | 'splash' | 'heroes'
): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${folder}/${userId}/${Date.now()}.${fileExtension}`;
  
  const fileBuffer = await file.arrayBuffer();
  
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: Buffer.from(fileBuffer),
      ContentType: file.type,
    },
  });

  await upload.done();
  
  // Return the public URL
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_S3_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;
}

export async function deleteFile(url: string): Promise<void> {
  // Extract the key from the S3 URL
  const key = url.split('.amazonaws.com/')[1];
  
  if (!key) {
    throw new Error('Invalid S3 URL');
  }

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

export async function uploadProfileImage(file: File, userId: string): Promise<string> {
  return uploadFile(file, userId, 'profiles');
}

export async function uploadGalleryImage(file: File, userId: string): Promise<string> {
  return uploadFile(file, userId, 'gallery');
}

export async function uploadSplashImage(file: File, userId: string): Promise<string> {
  return uploadFile(file, userId, 'splash');
}