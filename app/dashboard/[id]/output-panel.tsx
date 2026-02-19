'use client'

import { useState, useRef, useEffect } from 'react'
import { Trash2, Play, ChevronDown, ChevronRight, Terminal } from 'lucide-react'

interface Log {
  type: 'log' | 'error' | 'warn' | 'info'
  message: string
}

interface OutputPanelProps {
  logs: Log[]
  error: string | null
  time: number | null
  isRunning: boolean
  onRun: () => void
  onClear: () => void
  stdin: string
  onStdinChange: (value: string) => void
}

export default function OutputPanel({
  logs,
  error,
  time,
  isRunning,
  onRun,
  onClear,
  stdin,
  onStdinChange,
}: OutputPanelProps) {
  const [showInput, setShowInput] = useState(false)
  const outputEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll output to bottom
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs, error])

  const handleRun = () => {
    onRun()
  }

  const handleClear = () => {
    onClear()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      handleRun()
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e] border-t border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2 bg-[#0a0a0a] shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-semibold uppercase text-gray-500">
            Output
          </h3>
          {time !== null && (
            <span className="text-[10px] text-gray-600 bg-[#1e1e1e] px-1.5 py-0.5 rounded">
              {time.toFixed(0)}ms
            </span>
          )}
        </div>

        <div className="flex gap-1.5 items-center">
          {/* Input Toggle */}
          <button
            onClick={() => {
              setShowInput(!showInput)
              if (!showInput) {
                setTimeout(() => textareaRef.current?.focus(), 100)
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all border ${showInput
              ? 'bg-[#1a3a2a] border-green-700/50 text-green-400'
              : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-[#2a2a2a]'
              }`}
            title="Toggle stdin input"
          >
            <Terminal size={13} />
            <span>Input</span>
          </button>

          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition"
            title={showInput ? 'Run with input (Ctrl+Enter)' : 'Run code'}
          >
            <Play size={13} />
            {isRunning ? 'Running...' : 'Run'}
          </button>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="p-1.5 bg-transparent hover:bg-[#2a2a2a] text-gray-500 hover:text-gray-300 rounded transition"
            title="Clear output"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Input Section (collapsible) */}
      {showInput && (
        <div className="border-b border-gray-800 bg-[#0d1117] px-4 py-3 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Terminal size={12} className="text-green-500" />
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              Standard Input (stdin)
            </span>
            <span className="text-[10px] text-gray-600 ml-auto">
              Ctrl+Enter to run
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={stdin}
            onChange={(e) => onStdinChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={"Provide input for your program here.\nExample: 5\\nhello world"}
            rows={3}
            className="w-full bg-[#161b22] text-green-300 placeholder-gray-600 px-3 py-2 rounded text-xs outline-none border border-[#30363d] focus:border-green-700/50 focus:ring-1 focus:ring-green-700/30 transition font-mono resize-none leading-relaxed"
          />
        </div>
      )}

      {/* Output Area */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm space-y-0.5">
        {logs.length === 0 && !error && (
          <div className="text-gray-600 text-xs text-center mt-10 space-y-1">
            <div>{isRunning ? 'Running code...' : 'Output will appear here'}</div>
            {!isRunning && (
              <div className="text-[10px] text-gray-700">
                Need stdin? Click the <span className="text-gray-500">Input</span> button above
              </div>
            )}
          </div>
        )}

        {logs.map((log, i) => (
          <div
            key={i}
            className={
              log.type === 'error'
                ? 'text-red-400'
                : log.type === 'warn'
                  ? 'text-yellow-400'
                  : log.type === 'info'
                    ? 'text-blue-400'
                    : 'text-gray-300'
            }
          >
            <span className="text-gray-700 mr-2">›</span>
            {log.message}
          </div>
        ))}

        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-700/50 rounded text-red-400 text-xs">
            <div className="font-semibold">Error:</div>
            <div className="mt-1 whitespace-pre-wrap font-mono">{error}</div>
          </div>
        )}
        <div ref={outputEndRef} />
      </div>
    </div>
  )
}