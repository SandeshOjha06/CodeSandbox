'use client'
import NextImage from 'next/image'

interface AIToggleProps {
  isOpen: boolean
  onClick: () => void
}

export default function AIToggle({ isOpen, onClick }: AIToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 border
        ${isOpen
          ? 'bg-[#2a2a2a] border-blue-500/50 text-blue-400'
          : 'bg-transparent border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a]'
        }
      `}
      title="Toggle AI Assistant"
    >
      <div className="relative w-3.5 h-3.5">
        <NextImage
          src="/bot.svg"
          alt="AI"
          fill
          className={`invert ${isOpen ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}
        />
      </div>
      <span>AI Chat</span>
    </button>
  )
}