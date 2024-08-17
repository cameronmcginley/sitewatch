import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { fetchUser, createUser } from "@/lib/api/users";
import { SIGN_IN_URL } from "@/lib/constants";
import { prettyLog } from "@/utils/logger";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      prettyLog("JWT callback - Token", token);
      prettyLog("JWT callback - User", user);
      prettyLog("JWT callback - Account", account);

      if (user) {
        let dbUser = await fetchUser(user.id);
        dbUser = dbUser?.[0];
        prettyLog("Fetched dbUser", dbUser);

        if (!dbUser) {
          dbUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: new Date().toISOString(),
            userType: "default",
            provider: account?.provider,
          };
          prettyLog("Creating new user", dbUser);
          await createUser(dbUser);
        }

        token.id = dbUser.id;
        token.createdAt = dbUser.createdAt;
        token.userType = dbUser.userType;
      }

      prettyLog("JWT callback - Token after processing", token);
      return token;
    },
    async session({ session, token }) {
      prettyLog("Session callback - Session", session);
      prettyLog("Session callback - Token", token);

      session.user.id = token.id;
      session.user.createdAt = token.createdAt;
      session.user.userType = token.userType;

      prettyLog("Session callback - Session after processing", session);
      return session;
    },
  },
  pages: {
    signIn: SIGN_IN_URL,
    error: "/error",
  },
  debug: true,
});
