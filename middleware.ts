import NextAuth from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  publicRoutes,
  authRoutes,
} from "@/routes";
import { NextRequest } from "next/server";

export const { auth } = NextAuth(authOptions)

export default auth((req: NextRequest) => {
  const { nextUrl } = req;
  const authReq = req as NextRequest & {auth?: any}
  const isLoggedIn = !!authReq.auth

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if(isApiAuthRoute) return;

  if(isAuthRoute){
    if(isLoggedIn){
        return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return;
  }

  
  if (!isLoggedIn && !isPublicRoute && !isApiAuthRoute) {
    return Response.redirect(new URL("/auth/sign-in", nextUrl));
  }

  return;

})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};