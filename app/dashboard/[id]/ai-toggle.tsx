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
            ? 'bg-gray-700 text-gray-100'
            : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
        }
      `}
    >
      <Sparkles size={16} />
      AI
    </button>
  )
}