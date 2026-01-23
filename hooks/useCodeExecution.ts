'use client'

import { useState, useCallback } from 'react'

interface Log {
  type: 'log' | 'error' | 'warn' | 'info'
  message: string
}

export function useCodeExecution() {
  const [logs, setLogs] = useState<Log[]>([])
  const [error, setError] = useState<string | null>(null)
  const [time, setTime] = useState<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const run = useCallback(async (code: string, language: string = 'node') => {
    setIsRunning(true)
    setLogs([])
    setError(null)
    setTime(null)

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Execution failed')
      }

      const result = await response.json()

      if (result.stdout) {
        const output = result.stdout.trim().split('\n')
        setLogs(
          output.map((line: string) => ({
            type: 'log' as const,
            message: line || '(empty line)',
          }))
        )
      }

      if (result.stderr) {
        setError(result.stderr)
      }

      if (!result.stdout && !result.stderr) {
        setLogs([{ type: 'log' as const, message: '(no output)' }])
      }

      setTime(result.time)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      console.error('Execution error:', errorMsg)
    } finally {
      setIsRunning(false)
    }
  }, [])

  const clear = useCallback(() => {
    setLogs([])
    setError(null)
    setTime(null)
  }, [])

  return { logs, error, time, isRunning, run, clear }
}