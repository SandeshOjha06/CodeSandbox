"use client"

import React, { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError(null)
    try {
      await signIn("google", { callbackUrl })
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.")
      setIsGoogleLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    setIsGithubLoading(true)
    setError(null)
    try {
      await signIn("github", { callbackUrl })
    } catch (err) {
      setError("Failed to sign in with GitHub. Please try again.")
      setIsGithubLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-800 mb-4">
            <span className="text-gray-200 font-bold text-xl">&lt;/&gt;</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-200 mb-2">
            Code Sandbox
          </h1>
          <p className="text-gray-500">
            Write, run, and share code instantly
          </p>
        </div>

        {/* Card */}
        <Card className="bg-[#1e1e1e] border-gray-800 shadow-2xl">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl text-gray-200">
              Welcome back
            </CardTitle>
            <CardDescription className="text-gray-500">
              Sign in with your preferred provider to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-700/50 rounded-md p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isGithubLoading}
              className="w-full bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-6 text-base transition-colors"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            {/* GitHub Sign In Button */}
            <Button
              onClick={handleGithubSignIn}
              disabled={isGoogleLoading || isGithubLoading}
              className="w-full bg-gray-800 hover:bg-gray-700 text-gray-100 font-semibold py-6 text-base transition-colors border border-gray-700"
            >
              {isGithubLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Continue with GitHub
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1e1e1e] text-gray-500">or</span>
              </div>
            </div>

            {/* Info Text */}
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <span className="text-gray-400 font-medium">
                One will be created automatically
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        {/* <p className="text-center text-xs text-gray-600 mt-6">
          By signing in, you agree to our Terms of Service
        </p> */}
      </div>
    </div>
  )
}