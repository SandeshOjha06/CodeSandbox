import React from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/auth"
import Sidebar from "./sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) redirect("/auth/signin")

  return (
  <div className="flex h-screen bg-[#121212] text-gray-200">
    <aside className="w-64 border-r border-gray-800">
      <Sidebar />
    </aside>

    <main className="flex-1 overflow-auto p-8 bg-[#121212]">
      {children}
    </main>
  </div>
)

}

