import type { TimeFormat, UserRole } from "@rallly/database";
import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import type { NextRequest } from "next/server";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      id: string;
      isGuest: boolean;
      timeZone?: string | null;
      timeFormat?: TimeFormat | null;
      locale?: string | null;
      weekStart?: number | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    locale?: string | null;
    timeZone?: string | null;
    timeFormat?: TimeFormat | null;
    weekStart?: number | null;
    banned?: boolean | null;
    role?: UserRole | null;
  }

  interface NextAuthRequest extends NextRequest {
    auth: Session | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    locale?: string | null;
    timeZone?: string | null;
    timeFormat?: TimeFormat | null;
    weekStart?: number | null;
  }
}
