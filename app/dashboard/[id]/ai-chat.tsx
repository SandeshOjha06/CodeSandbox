'use client'

import { useState } from 'react'
import { useAI } from '@/hooks/useAI'
import { Send, Trash2, X } from 'lucide-react'

interface AIChatProps {
  activeFileContent: string
  isOpen: boolean
  onClose: () => void
}

export default function AIChat({
  activeFileContent,
  isOpen,
  onClose,
}: AIChatProps) {
  const { messages, isLoading, error, sendMessage, clearChat } = useAI()
  const [input, setInput] = useState('')

  const handleSend = async () => {
    if (!input.trim()) return

    await sendMessage(input, activeFileContent)
    setInput('')
  }

  if (!isOpen) return null

  return (
    <div className="w-80 bg-[#1e1e1e] border-l border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-700 p-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
        <div className="flex gap-2">
          <button
            onClick={clearChat}
            className="p-1 hover:bg-gray-800 rounded transition text-gray-400"
            title="Clear chat"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition text-gray-400"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-gray-500 text-xs text-center mt-8">
            <p>Ask me anything about your code!</p>
            <p className="mt-2">I can help you:</p>
            <ul className="mt-2 space-y-1">
              <li>✓ Explain code</li>
              <li>✓ Debug issues</li>
              <li>✓ Improve code</li>
              <li>✓ Generate code</li>
            </ul>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === 'user' ? (
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white px-3 py-2 rounded-lg max-w-xs">
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-gray-100 px-3 py-2 rounded-lg max-w-xs">
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-100 px-3 py-2 rounded-lg">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-700/50 rounded p-2">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 p-4 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask a question..."
            className="flex-1 bg-[#2a2a2a] text-white px-3 py-2 rounded text-sm outline-none border border-gray-700 focus:border-blue-500 transition"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded text-sm transition flex items-center gap-1"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}