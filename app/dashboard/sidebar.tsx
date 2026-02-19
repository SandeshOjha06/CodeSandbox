import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db } from "@/src/db"
import { playground } from "@/src/db/schema"
import { eq, desc } from "drizzle-orm"
import SidebarList from "./sidebar-list"
import NewProjectButton from "./new-project-btn"

export default async function Sidebar() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const playgrounds = await db
    .select()
    .from(playground)
    .where(eq(playground.userId, session.user.id as string))
    .orderBy(desc(playground.createdAt))

  return (
    <div className="flex h-full flex-col bg-[#151515]">
      <div className="border-b border-gray-800 px-4 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Playgrounds
        </h2>
      </div>
      <div className="px-3 py-3">
        <NewProjectButton />
      </div>

      <SidebarList playgrounds={playgrounds} />
    </div>
  )
}
