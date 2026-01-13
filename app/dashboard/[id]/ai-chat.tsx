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
    <div className="w-80 bg-[#0D1117] border-l border-[#30363D] flex flex-col h-full shadow-lg">
      {/* HEADER */}
      <div className="border-b border-[#30363D] px-4 py-3 flex items-center justify-between bg-[#1C2128]">
        <div>
          <h3 className="text-sm font-semibold text-[#E6EBED]">AI Assistant</h3>
          <p className="text-xs text-[#8B949E] mt-0.5">Powered by Groq</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={clearChat}
            className="
              p-1.5 hover:bg-[#30363D] rounded-md transition-colors duration-150
              text-[#8B949E] hover:text-[#E6EBED]
            "
            title="Clear chat"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={onClose}
            className="
              p-1.5 hover:bg-[#30363D] rounded-md transition-colors duration-150
              text-[#8B949E] hover:text-[#E6EBED]
            "
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-[#8B949E] text-xs text-center mt-8">
            <p className="mb-3">Ask me anything about your code!</p>
            <div className="space-y-1 text-left ml-4">
              <p>✓ Explain code</p>
              <p>✓ Debug issues</p>
              <p>✓ Improve code</p>
              <p>✓ Generate code</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === 'user' ? (
              <div className="flex justify-end">
                <div className="bg-[#58A6FF] text-white px-3 py-2 rounded-lg max-w-xs shadow-sm">
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <div className="bg-[#2D333B] text-[#E6EBED] px-3 py-2 rounded-lg max-w-xs">
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#2D333B] text-[#E6EBED] px-3 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-3 w-3 border-2 border-[#58A6FF] border-t-transparent rounded-full" />
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-[#FF7B72] bg-opacity-10 border border-[#FF7B72] border-opacity-30 rounded-md p-2">
            <p className="text-[#FF7B72] text-xs">{error}</p>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="border-t border-[#30363D] p-4 space-y-3 bg-[#1C2128]">
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
            className="
              flex-1 bg-[#0D1117] text-[#E6EBED] px-3 py-2.5 rounded-md text-sm
              outline-none border border-[#30363D] focus:border-[#58A6FF]
              transition-colors duration-150 placeholder-[#8B949E]
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="
              bg-[#58A6FF] hover:bg-[#1A5CE0] disabled:opacity-50
              text-white px-3 py-2.5 rounded-md text-sm transition-colors duration-150
              flex items-center gap-1 disabled:cursor-not-allowed
            "
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-xs text-[#8B949E]">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}