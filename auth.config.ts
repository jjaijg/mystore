import { NextResponse } from "next/server";
import { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  callbacks: {
    async authorized({ request, auth }) {
      // Array of regex of paths to protect
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.*)/,
        /\/order\/(.*)/,
        /\/admin/,
      ];

      // Get pathname from the req url object
      const { pathname } = request.nextUrl;

      // check if user is not authenicated & accessing a protected route
      if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;

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
