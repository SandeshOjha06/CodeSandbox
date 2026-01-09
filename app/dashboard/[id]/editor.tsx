'use client'

import { useState, useEffect, useRef, useTransition } from "react"
import { toast } from "sonner"
import Editor from "@monaco-editor/react"
import { File } from "@/types/files"

interface CodeEditorProps {
  activeFile: File
  onContentChange: (newContent: string) => void
}

export default function CodeEditor({ 
  activeFile, 
  onContentChange 
}: CodeEditorProps) {
  const [code, setCode] = useState(activeFile.content ?? "")
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [language, setLanguage] = useState(activeFile.language ?? "javascript")
  
  const [, startTransition] = useTransition()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  
  useEffect(() => {
    setCode(activeFile.content ?? "")
    setLanguage(activeFile.language ?? "javascript")
  }, [activeFile.id])

  // Auto-save when code changes
  useEffect(() => {
    if (code === activeFile.content) return

    setStatus("saving")

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
  }, [code, activeFile.id, onContentChange])

  function changeLanguage(next: string) {
    if (next === language) return
    setLanguage(next)
    // Update language if needed
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        {/* Left: Status + File Name */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {status === "saving" && "Saving…"}
            {status === "saved" && "Saved"}
          </span>
          <span className="text-sm font-semibold text-gray-300">
            {activeFile.name}
          </span>
        </div>

        {/* Right: Language Selector */}
        <select
          value={language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-[#1e1e1e] text-sm text-gray-200 rounded px-2 py-1"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
        </select>
      </div>

      {/* EDITOR */}
      <div className="flex-1 overflow-hidden rounded-md">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value ?? "")}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            wordWrap: "on",
            smoothScrolling: true,
            cursorSmoothCaretAnimation: "on",
          }}
        />
      </div>
    </div>
  )
}