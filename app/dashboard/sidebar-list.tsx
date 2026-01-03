"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

/**
 * Renders a sidebar list of playgrounds with navigation links and highlights the current route.
 *
 * @param playgrounds - Array of playground objects (each should have `id`, optional `title`, and optional `language`) used to build the list
 * @returns The sidebar React element containing either a "No code history yet" message or a list of links to `/dashboard/{id}`
 */
export default function SidebarList({ playgrounds }: { playgrounds: any[] }) {
  const pathname = usePathname()

  return (
    <div className="flex-1 overflow-auto px-2 py-3">
      {playgrounds.length === 0 ? (
        <p className="px-2 text-sm text-gray-500">
          No code history yet
        </p>
      ) : (
        <ul className="space-y-1">
          {playgrounds.map((pg) => {
            const isActive = pathname === `/dashboard/${pg.id}`

            return (
              <li key={pg.id}>
                <Link
                  href={`/dashboard/${pg.id}`}
                  className={`
                    block rounded-md px-3 py-2 text-sm transition
                    ${
                      isActive
                        ? "bg-blue-600/20 text-blue-400"
                        : "text-gray-300 hover:bg-gray-800"
                    }
                  `}
                >
                  <div className="truncate font-medium">
                    {pg.title ?? "Untitled Playground"}
                  </div>
                  <div className="truncate text-xs text-gray-500">
                    {pg.language ?? "Unknown"}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}