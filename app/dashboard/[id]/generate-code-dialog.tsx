'use client'

import { useState } from 'react'
import { Bot, X, Loader } from 'lucide-react'

interface GenerateCodeDialogProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (code: string) => void
  currentLanguage: string
}

export default function GenerateCodeDialog({
  isOpen,
  onClose,
  onGenerate,
  currentLanguage,
}: GenerateCodeDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [language, setLanguage] = useState(currentLanguage)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('Sending to API:', { prompt: prompt.trim(), language })

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          language,
        }),
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate code')
      }

      const data = await response.json()
      console.log('Received data:', data)

      // Extract code from response
      let generatedCode = ''
      if (typeof data === 'string') {
        generatedCode = data
      } else if (data.code) {
        generatedCode = data.code
      } else if (data.content) {
        generatedCode = data.content
      }

      // Remove markdown code blocks if present
      if (generatedCode.includes('```')) {
        // Extract code between ``` markers
        const match = generatedCode.match(/```(?:\w+)?\n([\s\S]*?)\n```/);
        if (match && match[1]) {
          generatedCode = match[1]
        }
      }

      console.log('Extracted code:', generatedCode)

      if (!generatedCode) {
        throw new Error('No code received from API')
      }

      // Call onGenerate with the code
      onGenerate(generatedCode)

      // Reset form
      setPrompt('')
      setLanguage(currentLanguage)
      onClose()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      console.error('Generation error:', errorMsg)
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1e1e1e] border border-gray-800 rounded-lg w-96 shadow-2xl">
        {/* HEADER */}
        <div className="border-b border-[#2b2b2b] px-6 py-4 flex items-center justify-between bg-[#181818]">
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-[#007fd4]" />
            <h2 className="text-sm font-semibold text-gray-100 uppercase tracking-wide">
              Generate Code
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="
              p-1 hover:bg-[#2a2d2e] rounded-md transition-colors duration-150
              text-gray-400 hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-4 bg-[#1e1e1e]">
          {/* Prompt Input */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              What would you like to build?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Create a function that calculates factorial recursively..."
              className="
                w-full bg-[#3c3c3c] text-gray-100 px-3 py-2.5 rounded-sm
                outline-none border border-[#3c3c3c] focus:border-[#007fd4]
                transition-colors duration-150 placeholder-gray-500
                resize-none h-24 font-mono text-sm leading-relaxed
              "
              disabled={isLoading}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleGenerate()
                }
              }}
            />
            <p className="text-[10px] text-gray-500 mt-2 flex justify-between">
              <span>Be specific for better results.</span>
              <span>Ctrl+Enter to generate</span>
            </p>
          </div>

          {/* Language Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Target Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="
                w-full bg-[#3c3c3c] text-gray-100 px-3 py-2 rounded-sm
                outline-none border border-[#3c3c3c] focus:border-[#007fd4]
                transition-colors duration-150 text-sm appearance-none
              "
              disabled={isLoading}
            >
              <option value="node">Node.js</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-700/50 rounded-sm p-3 flex gap-2 items-start">
              <span className="text-red-400">⚠️</span>
              <p className="text-red-400 text-xs font-mono">{error}</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t border-[#2b2b2b] px-6 py-4 flex gap-3 bg-[#181818] justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="
              bg-transparent hover:bg-[#2a2d2e] disabled:opacity-50
              text-gray-300 hover:text-white px-4 py-2 rounded-sm text-xs font-medium
              transition-colors duration-150 disabled:cursor-not-allowed
            "
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="
              bg-[#007fd4] hover:bg-[#026ec1] disabled:opacity-50
              text-white px-4 py-2 rounded-sm text-xs font-medium
              transition-colors duration-150 disabled:cursor-not-allowed
              flex items-center justify-center gap-2 min-w-[100px]
            "
          >
            {isLoading ? (
              <>
                <Loader size={14} className="animate-spin" />
                Generating
              </>
            ) : (
              <>
                <Bot size={16} />
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}