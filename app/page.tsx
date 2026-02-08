import React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code2, Zap, Save } from "lucide-react"

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
              <Code2 className="w-5 h-5 text-gray-300" />
            </div>
            <span className="text-lg font-bold text-gray-200">Code Sandbox</span>
          </div>
          <Link href="/auth/signin">
            <Button className="bg-gray-700 hover:bg-gray-600 text-gray-100">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="max-w-3xl space-y-6 mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-100">
            Code Anywhere,<br />
            <span className="text-gray-400">Anytime</span>
          </h1>
          <p className="text-xl text-gray-400">
            A powerful online code editor supporting JavaScript and Python.
            Write, execute, and save your code instantly without any setup.
          </p>
          <Link href="/auth/signin">
            <Button className="bg-gray-700 hover:bg-gray-600 text-gray-100 py-6 px-8 text-lg">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-[#1e1e1e] border border-gray-800 rounded-lg p-8 hover:border-gray-700 transition">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              Instant Execution
            </h3>
            <p className="text-gray-500">
              Run your code immediately with real-time output and error handling
            </p>
          </div>

          <div className="bg-[#1e1e1e] border border-gray-800 rounded-lg p-8 hover:border-gray-700 transition">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <Code2 className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              Multiple Languages
            </h3>
            <p className="text-gray-500">
              Write in JavaScript, Python, and more with proper syntax support
            </p>
          </div>

          <div className="bg-[#1e1e1e] border border-gray-800 rounded-lg p-8 hover:border-gray-700 transition">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <Save className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              Save & Organize
            </h3>
            <p className="text-gray-500">
              Automatically save and manage all your coding projects
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
