import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import FacebookProvider from 'next-auth/providers/facebook';
import AzureADProvider from 'next-auth/providers/azure-ad';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.username, credentials.username))
          .limit(1);

        if (!user[0] || !user[0].passwordHash) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user[0].passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user[0].id.toString(),
          username: user[0].username,
          email: user[0].email,
          name: user[0].displayName,
          image: user[0].avatar,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'credentials') {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email!))
          .limit(1);

        if (!existingUser[0]) {
          await db.insert(users).values({
            username: user.email!.split('@')[0] + '_' + Date.now(),
            email: user.email!,
            displayName: user.name!,
            avatar: user.image,
            provider: account.provider,
            providerId: account.providerAccountId,
            passwordHash: null,
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.email, session.user.email))
          .limit(1);
        if (dbUser[0]) {
          session.user.id = dbUser[0].id.toString();
          session.user.username = dbUser[0].username;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
