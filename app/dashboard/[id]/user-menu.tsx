'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { LogOut, ChevronDown, User } from 'lucide-react'

export default function UserMenu() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  if (!session?.user) return null

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="relative">
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium transition"
      >
        <div className="flex items-center gap-2 flex-1">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-5 h-5 rounded-full"
            />
          ) : (
            <User size={16} />
          )}
          <span className="max-w-xs truncate">{session.user.name || session.user.email}</span>
        </div>
        <ChevronDown size={16} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1e1e1e] border border-gray-800 rounded-lg shadow-xl z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-xs text-gray-500 uppercase">Signed in as</p>
            <p className="text-sm font-medium text-gray-200 truncate">
              {session.user.email}
            </p>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 flex items-center gap-2 transition"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}

      {/* Close menu when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}