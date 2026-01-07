// NextAuth.js API Route Handler
// 📚 Library Research Agent: nextauthjs/next-auth (27,967 ⭐)
// ✅ Code Quality Agent: Standard NextAuth App Router setup

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
