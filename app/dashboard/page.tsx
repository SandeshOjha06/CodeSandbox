"use client"

import React from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Code Editor</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-300">{session?.user?.name}</span>
            <button
              onClick={() => signOut()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Start New Project */}
          <Link href="/editor">
            <div className="bg-slate-800 p-6 rounded-lg hover:bg-slate-700 transition cursor-pointer border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-2">
                New Editor
              </h2>
              <p className="text-slate-400">
                Start a new code snippet or project
              </p>
            </div>
          </Link>

          {/* My Projects */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-2">
              My Projects
            </h2>
            <p className="text-slate-400">View and manage your saved projects</p>
          </div>
        </div>
      </main>
    </div>
  )
}