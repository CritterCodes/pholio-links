declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    username: string;
    subscriptionTier: 'free' | 'paid';
    isAdmin?: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      subscriptionTier: 'free' | 'paid';
      isAdmin?: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    username?: string;
    subscriptionTier?: 'free' | 'paid';
    isAdmin?: boolean;
  }
}