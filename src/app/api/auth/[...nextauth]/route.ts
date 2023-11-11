import axios from "axios";
import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

const nextAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },

      async authorize(credentials, req) {
        const response = await axios.post(
          `${process.env.NEXTAUTH_URL}/login/`,
          {
            email: credentials?.email,
            password: credentials?.password,
          }
        );

        const user = await response.data;
        if (user && response.status === 200) {
          return user;
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      return { ...token, ...user };
    },
    async session({ session, token }) {
      session.user = token as any;
      return session;
    },
  },
};

const handler = NextAuth(nextAuthOptions);

export { handler as POST, handler as GET, nextAuthOptions };
