'use client'

import { useState } from 'react'
import { Sparkles, X, Loader } from 'lucide-react'

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
        <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-[#0a0a0a]">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-100">
              Generate Code
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="
              p-1 hover:bg-gray-800 rounded-md transition-colors duration-150
              text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-4">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              What would you like to code?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Create a function that calculates factorial recursively..."
              className="
                w-full bg-[#2a2a2a] text-gray-100 px-3 py-2.5 rounded-md
                outline-none border border-gray-700 focus:border-gray-600
                transition-colors duration-150 placeholder-gray-600
                resize-none h-24 font-mono text-sm
              "
              disabled={isLoading}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleGenerate()
                }
              }}
            />
            <p className="text-xs text-gray-600 mt-1">
              Ctrl+Enter to generate
            </p>
          </div>

          {/* Language Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="
                w-full bg-[#2a2a2a] text-gray-100 px-3 py-2.5 rounded-md
                outline-none border border-gray-700 focus:border-gray-600
                transition-colors duration-150
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
            <div className="bg-red-900/20 border border-red-700/50 rounded-md p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Info Tip */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-md p-3">
            <p className="text-gray-400 text-xs leading-relaxed">
              💡 <strong>Tip:</strong> Be specific in your prompt for better results. Include details about what the code should do, expected inputs/outputs, and any special requirements.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-800 px-6 py-4 flex gap-3 bg-[#0a0a0a]">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="
              flex-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50
              text-gray-200 px-4 py-2.5 rounded-md text-sm font-medium
              transition-colors duration-150 disabled:cursor-not-allowed
            "
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="
              flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50
              text-gray-100 px-4 py-2.5 rounded-md text-sm font-medium
              transition-colors duration-150 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
          >
            {isLoading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}