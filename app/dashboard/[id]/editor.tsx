'use client'

import { useState, useEffect, useRef, useTransition } from "react"
import NextImage from "next/image"
import Editor from "@monaco-editor/react"
import { File } from "@/types/files"
import { Play, Sparkles } from 'lucide-react'

interface CodeEditorProps {
  activeFile: File
  onContentChange: (newContent: string) => void
  onRun?: () => void
  isRunning?: boolean
  onGenerateCode?: () => void
  skipSaveRef?: React.MutableRefObject<boolean>
  generationTrigger?: number
}

export default function CodeEditor({
  activeFile,
  onContentChange,
  onRun,
  isRunning,
  onGenerateCode,
  skipSaveRef,
  generationTrigger = 0
}: CodeEditorProps) {
  const [code, setCode] = useState(activeFile.content ?? "")
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [language, setLanguage] = useState(activeFile.language ?? "javascript")

  const [, startTransition] = useTransition()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const prevFileIdRef = useRef<string | null>(null)

  // Update code when generationTrigger changes (forced update from AI)
  useEffect(() => {
    if (generationTrigger > 0 && activeFile.content) {
      setCode(activeFile.content)
    }
  }, [generationTrigger, activeFile.content])

  // When file changes, reset everything
  useEffect(() => {
    // If file ID changed, we're switching files
    if (prevFileIdRef.current !== activeFile.id) {
      // Clear the save timeout to prevent old file from being saved
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Reset status
      setStatus("idle")

      // Load new file content
      setCode(activeFile.content ?? "")
      setLanguage(activeFile.language ?? "javascript")

      // Update ref
      prevFileIdRef.current = activeFile.id
    }
  }, [activeFile.id])

  // Auto-save when code changes (debounced)
  useEffect(() => {
    // Skip if flag is set (during code generation)
    if (skipSaveRef?.current) {
      return
    }

    // Don't save if code hasn't actually changed
    if (code === activeFile.content) return

    // Don't save if code contains markdown backticks
    if (code.includes('```')) {
      return
    }

    setStatus("saving")

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      startTransition(async () => {
        onContentChange(code)
        setStatus("saved")
        setTimeout(() => setStatus("idle"), 2000)
      })
    }, 900)

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [code, activeFile.id, activeFile.content, onContentChange, skipSaveRef])

  function changeLanguage(next: string) {
    if (next === language) return
    setLanguage(next)
  }

  const handleRun = () => {
    if (onRun) {
      onRun()
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        {/* Left: Status + File Name */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">
            {status === "saving" && "Saving…"}
            {status === "saved" && "Saved"}
          </span>
          <span className="text-sm font-semibold text-gray-200">
            {activeFile.name}
          </span>
        </div>

        {/* Right: Action Buttons */}
      </div>

      {/* EDITOR */}
      <div className="flex-1 overflow-hidden rounded-md border border-gray-800">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(value) => {
            setCode(value ?? "")
          }}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            wordWrap: "on",
            smoothScrolling: true,
            cursorSmoothCaretAnimation: "on",
            padding: { top: 16, bottom: 16 },
            fontFamily: 'Fira Code, Monaco, monospace',
            lineHeight: 1.6,
          }}
        />
      </div>
    </div>
  )
}