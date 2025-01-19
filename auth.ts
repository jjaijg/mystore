import NextAuth, { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import credentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db/prisma";
import { NextResponse } from "next/server";
import { compare } from "./lib/encrypt";

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma) as NextAuthConfig["adapter"],
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
          const isPwMatch = await compare(
            credentials.password as string,
            user.password
          );

          if (isPwMatch)
            return {
              id: user.id,
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
    async jwt({ token, user }) {
      if (!user) return token;

      token.role = user.role as string;

      if (user.name === "NO_NAME" && user.email) {
        token.name = user.email.split("@")[0];
        // update db to reflect name change
        await prisma.user.update({
          where: { id: user.id },
          data: { name: token.name },
        });
      }

      return token;
    },
    async session({ session, token, user, trigger }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
        session.user.name = token.name;
      }
      if (trigger === "update") {
        session.user.name = user.name;
      }
      return session;
    },
    async authorized({ request }) {
      // Check for cart session cookie
      if (!request.cookies.get("sessionCartId")) {
        // Generate new session cartId cookie
        const sessionCartId = crypto.randomUUID();

        // clone request headers
        const newReqHeaders = new Headers(request.headers);

        // create new response and add new headers
        const response = NextResponse.next({
          request: {
            headers: newReqHeaders,
          },
        });

        // set newly generated sessionCartId in the response cookies
        response.cookies.set("sessionCartId", sessionCartId);
        return response;
      } else {
        return true;
      }
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
