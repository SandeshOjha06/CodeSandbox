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
  return (
    <div className="flex h-full flex-col bg-[#0D1117] border-t border-[#30363D] rounded-t-lg">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#30363D] px-4 py-3 bg-[#1C2128]">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#8B949E]">
            Output
          </h3>
          {time !== null && (
            <span className="text-xs text-[#8B949E] bg-[#0D1117] px-2 py-1 rounded">
              {time.toFixed(1)}ms
            </span>
          )}
          {error && (
            <span className="text-xs text-[#FF7B72] bg-[#FF7B72] bg-opacity-10 px-2 py-1 rounded">
              Error
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onRun}
            disabled={isRunning}
            className="
              flex items-center gap-1.5 bg-[#3FB950] hover:bg-[#2DA043] disabled:opacity-50
              text-white px-3 py-1.5 rounded-md text-xs font-medium
              transition-colors duration-150 disabled:cursor-not-allowed
            "
          >
            <Play size={14} />
            {isRunning ? 'Running...' : 'Run'}
          </button>

          <button
            onClick={onClear}
            className="
              flex items-center gap-1.5 bg-[#30363D] hover:bg-[#3D444D]
              text-[#E6EBED] px-3 py-1.5 rounded-md text-xs
              transition-colors duration-150
            "
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* OUTPUT AREA */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm space-y-1">
        {logs.length === 0 && !error && (
          <div className="text-[#8B949E] text-xs pt-4">
            {isRunning ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-3 w-3 border-2 border-[#58A6FF] border-t-transparent rounded-full" />
                Running code...
              </div>
            ) : (
              'Click Run to execute code'
            )}
          </div>
        )}

        {/* Console Logs */}
        {logs.map((log, i) => (
          <div
            key={i}
            className={`
              flex gap-2
              ${
                log.type === 'error'
                  ? 'text-[#FF7B72]'
                  : log.type === 'warn'
                  ? 'text-[#FB8500]'
                  : log.type === 'info'
                  ? 'text-[#58A6FF]'
                  : 'text-[#E6EBED]'
              }
            `}
          >
            <span className="text-[#8B949E] flex-shrink-0">›</span>
            <span className="flex-1 break-words">{log.message}</span>
          </div>
        ))}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-[#FF7B72] bg-opacity-10 border border-[#FF7B72] border-opacity-30 rounded-md">
            <div className="text-[#FF7B72] font-semibold text-xs mb-1">Error:</div>
            <div className="text-[#FF7B72] text-xs whitespace-pre-wrap font-mono">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}