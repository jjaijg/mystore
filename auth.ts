import NextAuth, { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import credentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db/prisma";
import { compare } from "./lib/encrypt";
import { cookies } from "next/headers";
import { authConfig } from "./auth.config";

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
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      // handle session update
      if (session?.user.name && trigger === "update") {
        token.name = session.user.name;
      }

      if (!user) return token;
      token.id = user.id;
      token.role = user.role as string;

      if (user.name === "NO_NAME" && user.email) {
        token.name = user.email.split("@")[0];
        // update db to reflect name change
        await prisma.user.update({
          where: { id: user.id },
          data: { name: token.name },
        });
      }

      if (trigger === "signIn" || trigger === "signUp") {
        const cookiesObj = await cookies();
        const sessionCartId = cookiesObj.get("sessionCartId")?.value;

        if (sessionCartId) {
          const sessionCart = await prisma.cart.findFirst({
            where: { sessionCartId },
          });

          if (sessionCart) {
            // delete current user cart
            await prisma.cart.deleteMany({
              where: {
                userId: user.id,
              },
            });

            // Assign new cart
            await prisma.cart.update({
              where: { id: sessionCart.id },
              data: {
                userId: user.id,
              },
            });
          }
        }
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
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
