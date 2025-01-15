import NextAuth, { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import credentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db/prisma";
import { compareSync } from "bcrypt-ts-edge";
export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    credentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const user = await prisma.user.findFirst({
          where: { email: credentials.email as string },
        });

        if (user && user.password) {
          const isPwMatch = compareSync(
            credentials.password as string,
            user.password
          );

          if (isPwMatch)
            return {
              is: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          else return null;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user, trigger }) {
      if (token.sub) session.user.id = token.sub;

      if (trigger === "update") {
        session.user.name = user.name;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
