'use client'

import { Sparkles } from 'lucide-react'

interface AIToggleProps {
  isOpen: boolean
  onClick: () => void
}

export default function AIToggle({ isOpen, onClick }: AIToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition
        ${
          isOpen
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
        }
      `}
    >
      <Sparkles size={16} />
      AI
    </button>
  )
}