'use client'

import { useState, useEffect, useRef, useTransition } from "react"
import Editor from "@monaco-editor/react"
import { File } from "@/types/files"
import { Play, Sparkles } from 'lucide-react'

interface CodeEditorProps {
  activeFile: File
  onContentChange: (newContent: string) => void
  onRun?: () => void
  isRunning?: boolean
  onGenerateCode?: () => void
}

export default function CodeEditor({ 
  activeFile, 
  onContentChange,
  onRun,
  isRunning,
  onGenerateCode
}: CodeEditorProps) {
  const [code, setCode] = useState(activeFile.content ?? "")
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [language, setLanguage] = useState(activeFile.language ?? "javascript")
  
  const [, startTransition] = useTransition()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Update code when activeFile changes
  useEffect(() => {
    console.log('Setting code from activeFile:', activeFile.content.substring(0, 50))
    setCode(activeFile.content ?? "")
    setLanguage(activeFile.language ?? "javascript")
  }, [activeFile.id, activeFile.content])

  // Auto-save when code changes
  useEffect(() => {
    if (code === activeFile.content) return

    setStatus("saving")

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      startTransition(async () => {
        console.log('Saving code:', code.substring(0, 50))
        onContentChange(code)
        setStatus("saved")
        setTimeout(() => setStatus("idle"), 2000)
      })
    }, 900)
  }, [code, activeFile.id, onContentChange])

  function changeLanguage(next: string) {
    if (next === language) return
    setLanguage(next)
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        {/* Left: Status + File Name */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8B949E]">
            {status === "saving" && "Saving…"}
            {status === "saved" && "Saved"}
          </span>
          <span className="text-sm font-semibold text-[#E6EBED]">
            {activeFile.name}
          </span>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex gap-2">
          {/* Generate Code Button */}
          {onGenerateCode && (
            <button
              onClick={onGenerateCode}
              className="
                flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600
                text-gray-100 px-3 py-1.5 rounded-md text-xs font-medium
                transition-colors duration-150
              "
              title="Generate code with AI"
            >
              <Sparkles size={14} />
              Generate
            </button>
          )}

          {/* Run Button */}
          {onRun && (
            <button
              onClick={onRun}
              disabled={isRunning}
              className="
                flex items-center gap-1 bg-gray-700 hover:bg-gray-600
                disabled:opacity-50 text-gray-100 px-3 py-1.5 rounded-md
                text-xs font-medium transition-colors duration-150
              "
              title="Run code"
            >
              <Play size={14} />
              {isRunning ? 'Running...' : 'Run'}
            </button>
          )}

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="
              bg-[#2a2a2a] text-sm text-gray-200 rounded-md px-3 py-1.5
              border border-gray-700 focus:border-gray-600
              transition-colors duration-150 cursor-pointer
            "
            title="Select programming language"
          >
            <option value="node">Node.js</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
          </select>
        </div>
      </div>

      {/* EDITOR */}
      <div className="flex-1 overflow-hidden rounded-md border border-gray-800">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(value) => {
            console.log('Editor onChange:', value?.substring(0, 50))
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