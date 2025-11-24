import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import clientPromise from './mongodb';
import { verifyPassword } from './utils';
import { getUsersCollection } from './mongodb';
import { AuthUser } from '@/types';

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: 'jwt' as const,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        // Allow cookies to be shared across subdomains
        domain: process.env.NODE_ENV === 'production' ? '.pholio.link' : undefined,
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        emailOrUsername: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.emailOrUsername || !credentials?.password) {
          throw new Error('Email/username and password are required');
        }

        try {
          const usersCollection = await getUsersCollection();
          
          // Check if input is email or username
          const isEmail = credentials.emailOrUsername.includes('@');
          const query = isEmail 
            ? { email: credentials.emailOrUsername.toLowerCase() }
            : { username: credentials.emailOrUsername.toLowerCase() };
          
          const user = await usersCollection.findOne(query);

          if (!user) {
            throw new Error('Invalid credentials');
          }

          const isPasswordValid = await verifyPassword(
            credentials.password,
            user.hashedPassword
          );

          if (!isPasswordValid) {
            throw new Error('Invalid credentials');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            subscriptionTier: user.subscriptionTier,
          } as AuthUser;
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.username = (user as AuthUser).username;
        token.subscriptionTier = (user as AuthUser).subscriptionTier;
        token.email = user.email;
      } else if (token.email) {
        // Refresh subscription tier from database on every token refresh
        try {
          const usersCollection = await getUsersCollection();
          const dbUser = await usersCollection.findOne({ email: token.email });
          if (dbUser) {
            token.subscriptionTier = dbUser.subscriptionTier || 'free';
          }
        } catch (error) {
          console.error('Error refreshing subscription tier:', error);
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email!,
          username: token.username as string,
          subscriptionTier: token.subscriptionTier as 'free' | 'paid',
        };
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signUp: '/register',
  },
  secret: process.env.NEXTAUTH_SECRET,
};