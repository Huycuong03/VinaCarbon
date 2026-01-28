import NextAuth, { NextAuthOptions, SessionStrategy } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { encode } from "@/lib/utils"; 

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
    async jwt({ token, user }) {
      if (user?.email) {
        token.apiKey = encode(
          user.email,
          process.env.NEXTAUTH_SECRET!
        );
      }

      return token;
    },

    async session({ session, token }) {
      session.apiKey = token.apiKey as string;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
