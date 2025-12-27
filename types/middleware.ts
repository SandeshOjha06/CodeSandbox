import { NextRequest } from "next/server";
import { Session } from "next-auth";

export type AuthenticatedRequest = NextRequest & {
    auth: Session | null
}