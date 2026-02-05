import NextAuth, { NextAuthOptions, SessionStrategy } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { BACKEND_API_ENDPOINT } from "@/constants";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const sessionStrategy: SessionStrategy = "jwt";

const authOptions: NextAuthOptions = {
  session: {
    strategy: sessionStrategy,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (!user.email) return false;

        const credentials = {
          email: user.email,
          name: user.name,
          image: user.image,
        }
        const token = jwt.sign(credentials, process.env.NEXTAUTH_SECRET!);

        const response = await fetch(`${process.env.BACKEND_URL}${BACKEND_API_ENDPOINT.USERS}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        if (!response.ok) return false;

      } catch (errpr) {
        console.error("User sync failed", errpr);
        return false;
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const key = user.email + process.env.NEXTAUTH_SECRET!;
        token.userId = crypto.createHash("sha256").update(key).digest("hex")
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.userId as string;
      return session;
    }
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
