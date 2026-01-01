import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/src/db";
import { playground } from "@/src/db/schema";
import {eq, desc} from "drizzle-orm"
import Link from "next/link";

export default async function Sidebar() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const playgrounds = await db
    .select()
    .from(playground)
    .where(eq(playground.userId, session.user.id))
    .orderBy(desc(playground.createdAt))

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e] text-gray-200">
      {/* Header */}
      <div className="border-b border-gray-700 px-4 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Playgrounds
        </h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto px-2 py-3">
        {playgrounds.length === 0 ? (
          <p className="px-2 text-sm text-gray-500">
            No code history yet
          </p>
        ) : (
          <ul className="space-y-1">
            {playgrounds.map((pg) => (
              <li key={pg.id}>
                <Link
                  href={`/dashboard/${pg.id}`}
                  className="
                    block rounded-md px-3 py-2 text-sm
                    text-gray-300
                    hover:bg-[#2a2a2a]
                    hover:text-white
                    transition
                  "
                >
                  <div className="truncate font-medium">
                    {pg.title ?? "Untitled Playground"}
                  </div>
                  <div className="truncate text-xs text-gray-500">
                    {pg.language ?? "Unknown language"}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-700 px-4 py-3 text-xs text-gray-500">
        Click a playground to open
      </div>
    </div>
  )
}
