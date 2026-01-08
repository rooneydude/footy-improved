// NextAuth.js Configuration
// 📚 Library Research Agent: nextauthjs/next-auth (27,967 ⭐)
// ✅ Code Quality Agent: Follows NextAuth.js best practices

import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';

// Build providers array dynamically based on available env vars
const providers: NextAuthOptions['providers'] = [];

// Add Google OAuth if configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Add GitHub OAuth if configured (support both GITHUB_ID and GITHUB_CLIENT_ID)
const githubId = process.env.GITHUB_CLIENT_ID || process.env.GITHUB_ID;
const githubSecret = process.env.GITHUB_CLIENT_SECRET || process.env.GITHUB_SECRET;
if (githubId && githubSecret) {
  providers.push(
    GitHubProvider({
      clientId: githubId,
      clientSecret: githubSecret,
    })
  );
}

// Add Demo account provider for development/testing
// ✅ Code Quality Agent: Demo provider available in dev, when no OAuth, or when explicitly enabled
const enableDemo = providers.length === 0 || 
  process.env.NODE_ENV === 'development' || 
  process.env.ENABLE_DEMO_ACCOUNT === 'true';
if (enableDemo) {
  providers.push(
    CredentialsProvider({
      id: 'demo',
      name: 'Demo Account',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'demo@footytracker.app' },
      },
      async authorize(credentials) {
        if (credentials?.email === 'demo@footytracker.app') {
          // Find or create demo user
          let user = await prisma.user.findUnique({
            where: { email: 'demo@footytracker.app' },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: 'demo@footytracker.app',
                name: 'Demo User',
                image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
              },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        }
        return null;
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  providers,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

export default authOptions;
