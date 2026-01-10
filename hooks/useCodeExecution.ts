'use client'

import { useRef, useState, useCallback } from "react"

interface Log{
    type: 'log' | 'error' | 'warn' | 'info'
    message: string
}

interface ExecutionState {
    logs: Log[]
    error: string | null
    time: number | null
    isRunning: boolean
}

export function useCodeExecution() {
    const workerRef = useRef<Worker | null>(null)
    const [state, setState] = useState<ExecutionState>({
        logs: [],
        error: null,
        time: null,
        isRunning: false,
    })

    const initWorker = useCallback(() => {
        if(!workerRef.current && typeof window !== 'undefined'){
           try {
             workerRef.current = new Worker(
                new URL('@/src/workers/code-executor.worker.ts', import.meta.url),
          { type: 'module' }
             )

             workerRef.current.onmessage = (e) => {
                setState({
                    logs: e.data.logs || [],
                    error: e.data.error || null,
                    time: e.data.executionTime || null,
                    isRunning: false,
                }
                )

                
             }
            
        workerRef.current.onerror = (err) => {
          setState({
            logs: [],
            error: err.message,
            time: null,
            isRunning: false,
          })
             }
           } catch (err) {
            console.error("Failed to initialize worker: ", err);
            
           }
        }
    }, [])


    const run = useCallback((code: string, language: string = 'javascript') => {
    initWorker()
    setState({ logs: [], error: null, time: null, isRunning: true })

    if (workerRef.current) {
      workerRef.current.postMessage({ code, language })
    }
  }, [initWorker])

  const clear = useCallback(() => {
    setState({ logs: [], error: null, time: null, isRunning: false })
  }, [])

  return { ...state, run, clear }
}