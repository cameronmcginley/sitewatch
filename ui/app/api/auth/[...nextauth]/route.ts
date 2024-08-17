import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { fetchUser, createUser } from "@/lib/api/users";
import { SIGN_IN_URL } from "@/lib/constants";
import { prettyLog } from "@/utils/logger";
// import "crypto-browserify";

// export const runtime = "edge";
export const runtime = "nodejs";

const authOptions: NextAuthOptions = {
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

      // On first sign-in, user will be defined
      if (user) {
        let dbUser = await fetchUser(user.id);
        dbUser = dbUser?.[0];
        prettyLog("Fetched dbUser", dbUser);

        // Validate user data with database, update info if needed
        // if (dbUser) {
        //   if (dbUser.email !== user.email) {
        //     dbUser.email = user.email;

        //     console.log(
        //       "Discrepancy between dbUser and auth user:",
        //       dbUser,
        //       user
        //     );
        //     console.log("Updating user data:", dbUser);

        //     await updateUser(dbUser);
        //   }
        // }

        // First time sign in, create in DB
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

        // Attach additional user data to the token
        token.id = dbUser.id;
        token.createdAt = dbUser.createdAt;
        token.userType = dbUser.userType;
      }

      prettyLog("JWT callback - Token after processing", token);
      return token;
    },
    async session({ session, token }: any) {
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
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
