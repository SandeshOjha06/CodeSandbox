'use client'

import { Trash2, Play } from 'lucide-react'

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
}

export default function OutputPanel({
  logs,
  error,
  time,
  isRunning,
  onRun,
  onClear,
}: OutputPanelProps) {
  const handleClear = () => {
    onClear()
    // console.log("Cleared");
    
  }

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e] border-t border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3 bg-[#0a0a0a]">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase text-gray-500">
            Output
          </h3>
          {time !== null && (
            <span className="text-xs text-gray-600">
              ({time.toFixed(1)}ms)
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-100 px-3 py-1.5 rounded text-xs font-medium transition"
          >
            <Play size={14} />
            {isRunning ? 'Running...' : 'Run'}
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-300 px-3 py-1.5 rounded text-xs transition"
            title="Clear output"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Output Area */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm space-y-1">
        {logs.length === 0 && !error && (
          <div className="text-gray-600 text-xs">
            {isRunning ? 'Running code...' : 'Click Run to execute code'}
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
            <div className="mt-1 whitespace-pre-wrap">{error}</div>
          </div>
        )}
      </div>
    </div>
  )
}