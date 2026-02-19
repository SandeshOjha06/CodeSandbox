'use client'
import { useState } from 'react'
import { useAI } from '@/hooks/useAI'
import { Send, Trash2, X, Sparkles } from 'lucide-react'

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
    <div className="w-80 bg-[#1e1e1e] border-l border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-800 p-4 flex items-center justify-between bg-[#0a0a0a]">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-200">AI Assistant</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearChat}
            className="p-1 hover:bg-gray-800 rounded transition text-gray-500"
            title="Clear chat"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition text-gray-500"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-gray-600 text-xs text-center mt-8">
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
                <div className="bg-gray-700 text-gray-100 px-3 py-2 rounded-lg max-w-xs">
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
      <div className="border-t border-gray-800 p-4 space-y-2">
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
            className="flex-1 bg-[#2a2a2a] text-gray-100 px-3 py-2 rounded text-sm outline-none border border-gray-700 focus:border-gray-600 transition"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-100 px-3 py-2 rounded text-sm transition flex items-center gap-1"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-xs text-gray-600">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}