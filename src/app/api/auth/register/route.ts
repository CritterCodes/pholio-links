import { NextRequest, NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';
import { hashPassword, validateEmail, validateUsername } from '@/lib/utils';
import { UserInsert, ContentBlock } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json();

    // Validation
    if (!email || !username || !password) {
      return NextResponse.json(
        { message: 'Email, username, and password are required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!validateUsername(username)) {
      return NextResponse.json(
        { message: 'Username must be 3-20 characters and contain only letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const usersCollection = await getUsersCollection();

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json(
          { message: 'A user with this email already exists' },
          { status: 409 }
        );
      }
      if (existingUser.username === username.toLowerCase()) {
        return NextResponse.json(
          { message: 'This username is already taken' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Default layout blocks
    const defaultBlocks: ContentBlock[] = [
      { id: 'profile-image', type: 'profile-image', order: 0, isVisible: true },
      { id: 'title', type: 'title', order: 1, isVisible: true },
      { id: 'subtitle', type: 'subtitle', order: 2, isVisible: true },
      { id: 'social-icons', type: 'social-icons', order: 3, isVisible: true },
      { id: 'bio', type: 'bio', order: 4, isVisible: true },
      { id: 'links', type: 'links', order: 5, isVisible: true },
    ];

    // Create user with embedded profile, links, and galleries
    const newUser: UserInsert = {
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      hashedPassword,
      subscriptionTier: 'free',
      profile: {
        name: username,
        title: 'Welcome to my profile',
        bio: 'Edit your bio to tell people about yourself!',
        layout: defaultBlocks,
        isActive: true,
      },
      links: [],
      galleries: [],
      splashScreen: {
        enabled: false,
        backgroundColor: '#ffffff',
        textColor: '#000000',
        title: 'Welcome',
        subtitle: 'Check out my links below',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await usersCollection.insertOne(newUser);

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}