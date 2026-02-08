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

      const { code } = await response.json()

      console.log('Received code:', code)

      onGenerate(code)

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
      <div className="bg-[#1C2128] border border-[#30363D] rounded-lg w-96 shadow-2xl">
        {/* HEADER */}
        <div className="border-b border-[#30363D] px-6 py-4 flex items-center justify-between bg-[#0D1117]">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#FB8500]" />
            <h2 className="text-lg font-semibold text-[#E6EBED]">
              Generate Code
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="
              p-1 hover:bg-[#30363D] rounded-md transition-colors duration-150
              text-[#8B949E] disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-4">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-[#E6EBED] mb-2">
              What would you like to code?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Create a function that calculates factorial recursively..."
              className="
                w-full bg-[#0D1117] text-[#E6EBED] px-3 py-2.5 rounded-md
                outline-none border border-[#30363D] focus:border-[#58A6FF]
                transition-colors duration-150 placeholder-[#8B949E]
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
            <p className="text-xs text-[#8B949E] mt-1">
              Ctrl+Enter to generate
            </p>
          </div>

          {/* Language Selector */}
          <div>
            <label className="block text-sm font-medium text-[#E6EBED] mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="
                w-full bg-[#0D1117] text-[#E6EBED] px-3 py-2.5 rounded-md
                outline-none border border-[#30363D] focus:border-[#58A6FF]
                transition-colors duration-150
              "
              disabled={isLoading}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-[#FF7B72] bg-opacity-10 border border-[#FF7B72] border-opacity-30 rounded-md p-3">
              <p className="text-[#FF7B72] text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t border-[#30363D] px-6 py-4 flex gap-3 bg-[#0D1117]">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="
              flex-1 bg-[#30363D] hover:bg-[#3D444D] disabled:opacity-50
              text-[#E6EBED] px-4 py-2.5 rounded-md text-sm font-medium
              transition-colors duration-150 disabled:cursor-not-allowed
            "
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="
              flex-1 bg-[#FB8500] hover:bg-[#E89500] disabled:opacity-50
              text-white px-4 py-2.5 rounded-md text-sm font-medium
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
