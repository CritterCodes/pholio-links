declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    username: string;
    subscriptionTier: 'free' | 'paid';
  }

  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      subscriptionTier: 'free' | 'paid';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    username?: string;
    subscriptionTier?: 'free' | 'paid';
  }
}