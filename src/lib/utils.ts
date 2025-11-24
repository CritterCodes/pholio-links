import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import bcrypt from 'bcryptjs';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function validateUsername(username: string): boolean {
  // Username must be 3-20 characters, alphanumeric and hyphens only
  const usernameRegex = /^[a-zA-Z0-9-]{3,20}$/;
  return usernameRegex.test(username);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getSubdomain(host: string): string | null {
  if (!host) return null;
  
  const parts = host.split('.');
  
  // For development (localhost:3000)
  if (host.includes('localhost')) {
    return null;
  }
  
  // For production (user.pholio.links)
  if (parts.length >= 3 && parts[1] === 'pholio' && parts[2] === 'links') {
    return parts[0];
  }
  
  return null;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
}