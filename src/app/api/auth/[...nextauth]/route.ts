import axios from "axios";
import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import Cookies from "js-cookie";

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
        const storedUser: any = response.data;
        const userRole = storedUser?.is_teacher ? "teachers" : "students";

        const roleResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/${userRole}/${storedUser.id}`,
          {
            headers: { Authorization: `Bearer ${storedUser.accessToken}` },
          }
        );
        const { classes } = roleResponse.data;
        const user = {
          ...storedUser,
          role: userRole,
          selectedClass: classes[0].unique_id,
        };

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
    async jwt({ token, user }) {
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
