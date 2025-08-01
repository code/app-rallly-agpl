import { prisma } from "@rallly/database";
import { posthog } from "@rallly/posthog/server";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import { cache } from "react";

import { CustomPrismaAdapter } from "./auth/adapters/prisma";
import { isEmailBanned, isEmailBlocked } from "./auth/helpers/is-email-blocked";
import { mergeGuestsIntoUser } from "./auth/helpers/merge-user";
import { EmailProvider } from "./auth/providers/email";
import { GoogleProvider } from "./auth/providers/google";
import { GuestProvider } from "./auth/providers/guest";
import { MicrosoftProvider } from "./auth/providers/microsoft";
import { OIDCProvider } from "./auth/providers/oidc";
import { RegistrationTokenProvider } from "./auth/providers/registration-token";
import { nextAuthConfig } from "./next-auth.config";

const {
  auth: originalAuth,
  handlers,
  signIn,
  signOut,
} = NextAuth({
  ...nextAuthConfig,
  adapter: CustomPrismaAdapter({
    migrateData: async (userId) => {
      const session = await auth();
      if (session?.user && session.user.email === null) {
        await mergeGuestsIntoUser(userId, [session.user.id]);
      }
    },
  }),
  providers: [
    RegistrationTokenProvider,
    EmailProvider,
    GuestProvider,
    ...([GoogleProvider(), OIDCProvider(), MicrosoftProvider()].filter(
      Boolean,
    ) as Provider[]),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 60,
  },
  cookies: {
    sessionToken: {
      options: {
        maxAge: 60 * 60 * 24 * 60,
      },
    },
  },
  events: {
    createUser({ user }) {
      if (user.id) {
        posthog?.capture({
          distinctId: user.id,
          event: "register",
          properties: {
            method: "sso",
            $set: {
              name: user.name,
              email: user.email,
              tier: "hobby",
              timeZone: user.timeZone ?? undefined,
              locale: user.locale ?? undefined,
            },
          },
        });
      }
    },
    signIn({ user, account }) {
      if (user.id) {
        posthog?.capture({
          distinctId: user.id,
          event: "login",
          properties: {
            method: account?.provider,
            $set: {
              name: user.name,
              email: user.email,
              timeZone: user.timeZone ?? undefined,
              locale: user.locale ?? undefined,
            },
          },
        });
      }
    },
  },
  callbacks: {
    ...nextAuthConfig.callbacks,
    async signIn({ user, email, profile }) {
      if (email?.verificationRequest) {
        const isRegisteredUser =
          (await prisma.user.count({
            where: {
              email: user.email as string,
            },
          })) > 0;
        if (!isRegisteredUser) {
          return "/login?error=EmailNotVerified";
        }
      }

      if (user.banned) {
        return "/login?error=Banned";
      }

      // Make sure email is allowed
      const emailToTest = user.email || profile?.email;
      if (emailToTest) {
        if (isEmailBlocked(emailToTest) || (await isEmailBanned(emailToTest))) {
          return "/login?error=EmailBlocked";
        }
      }

      // If this is an existing registered user
      if (user.id && user.role && user.email) {
        // merge guest user into existing user
        const session = await auth();
        if (session?.user && !session.user.email) {
          await mergeGuestsIntoUser(user.id, [session.user.id]);
        }
      }

      return true;
    },
    async jwt({ token }) {
      const userId = token.sub;
      const isGuest = userId?.startsWith("guest-");

      if (userId && !isGuest) {
        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            name: true,
            email: true,
            image: true,
          },
        });

        if (user) {
          token.name = user.name;
          token.email = user.email;
          token.picture = user.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
        session.user.name = token.name;
        session.user.email = token.email ? token.email : "";
        session.user.image = token.picture;
        session.user.isGuest = !token.email;
      }

      return session;
    },
  },
});

const auth = cache(async () => {
  try {
    const session = await originalAuth();
    if (session) {
      return session;
    }
  } catch (e) {
    console.error("FAILED TO GET SESSION", e);
  }
});

/**
 * If email is not set it means the user is a guest
 * @returns
 */
export const getUserId = async () => {
  const session = await auth();
  return session?.user?.email ? session.user.id : undefined;
};

export const getLoggedIn = async () => {
  const session = await auth();
  return !!session?.user?.email;
};

export { auth, handlers, signIn, signOut };
