"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function SidebarList({ playgrounds }: { playgrounds: any[] }) {
  const pathname = usePathname()

  return (
    <div className="flex-1 overflow-auto px-2 py-3">
      <ul className="space-y-1">
        {playgrounds.map((pg) => {
          const isActive = pathname === `/dashboard/${pg.id}`

          return (
            <li key={pg.id}>
              <Link
                href={`/dashboard/${pg.id}`}
                className={`
                  block rounded-md px-3 py-2 transition
                  ${
                    isActive
                      ? "bg-gray-800 text-gray-100"
                      : "text-gray-400 hover:bg-gray-800/50"
                  }
                `}
              >
                <div className="truncate font-medium text-sm">
                  {pg.title ?? "Untitled Playground"}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}