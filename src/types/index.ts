import { ObjectId } from 'mongodb';

export interface Notification {
  _id?: ObjectId;
  userId: ObjectId;
  type: 'growth' | 'billing' | 'product' | 'system';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: Date;
}

export interface User {
  _id: ObjectId;
  email: string;
  username: string; // for subdomain (user.pholio.links)
  hashedPassword: string;
  subscriptionTier: 'free' | 'paid';
  stripeCustomerId?: string;
  isAdmin?: boolean; // Admin flag
  
  // Profile information
  profile: {
    name: string;
    title: string;
    bio: string;
    profileImage?: string; // S3 URL
    layout: ContentBlock[];
    customDomain?: string; // paid accounts only
    isActive: boolean;
  };
  
  // Links
  links: {
    _id: ObjectId;
    title: string;
    url: string;
    icon?: string; // icon name or S3 URL
    order: number;
    isActive: boolean;
    linkType: 'social' | 'regular'; // social icons vs full buttons
    createdAt: Date;
  }[];
  
  // Galleries (for premium users)
  galleries: {
    _id: ObjectId;
    title: string;
    description?: string;
    imageUrl: string; // S3 URL
    thumbnailUrl?: string; // S3 URL
    order: number;
    isActive: boolean;
    createdAt: Date;
  }[];
  
  // Splash screen settings
  splashScreen: {
    enabled: boolean;
    backgroundColor: string;
    textColor: string;
    logo?: string; // S3 URL
    title: string;
    subtitle: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureRequest {
  _id: ObjectId;
  title: string;
  description: string;
  status: 'pending' | 'planned' | 'in_progress' | 'completed' | 'rejected';
  votes: number;
  userId: ObjectId; // Requester
  username: string; // Denormalized for display
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser extends User {
  id: string;
}

// Block-based design system types
export type BlockType = 'profile-image' | 'title' | 'subtitle' | 'bio' | 'social-icons' | 'links';

export interface ContentBlock {
  id: string;
  type: BlockType;
  order: number;
  isVisible: boolean;
  settings?: Record<string, string | number | boolean>;
}

export interface Domain {
  _id: ObjectId;
  userId: ObjectId;
  domain: string;
  isVerified: boolean;
  dnsRecords: Record<string, string>[];
  createdAt: Date;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  subscriptionTier: 'free' | 'paid';
}

// Form types
export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface LoginData {
  emailOrUsername: string;
  password: string;
}

export interface ProfileFormData {
  name: string;
  title: string;
  bio: string;
  profileImage?: string;
}

export interface LinkFormData {
  title: string;
  url: string;
  icon?: string;
}

export interface SplashScreenData {
  enabled: boolean;
  backgroundColor: string;
  textColor: string;
  logo?: string;
  title: string;
  subtitle: string;
}

// Database insertion types (without _id)
export type UserInsert = Omit<User, '_id'>;