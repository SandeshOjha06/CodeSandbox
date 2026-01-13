'use client'

import { useState, useEffect, useRef, useTransition } from "react"
import { toast } from "sonner"
import Editor from "@monaco-editor/react"
import { File } from "@/types/files"
import { Play, Code2, MoreHorizontal, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import ThemeToggle from "@/components/ui/theme-toggle"

interface CodeEditorProps {
  activeFile: File
  onContentChange: (newContent: string) => void
  onRun?: () => void
  isRunning?: boolean
}

export default function CodeEditor({ 
  activeFile, 
  onContentChange ,
  onRun,
  isRunning
}: CodeEditorProps) {
  const [code, setCode] = useState(activeFile.content ?? "")
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [language, setLanguage] = useState(activeFile.language ?? "javascript")
  const [wordWrap, setWordWrap] = useState(true)
  const [cursor, setCursor] = useState({ line: 1, col: 1 })

  const editorRef = useRef<any | null>(null)

  const [, startTransition] = useTransition()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Keyboard shortcuts (Run, Save, Format)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey
      // Run: Ctrl/Cmd + Enter
      if (mod && e.key === "Enter") {
        e.preventDefault()
        onRun?.()
      }

      // Save: Ctrl/Cmd + S
      if (mod && (e.key === "s" || e.key === "S")) {
        e.preventDefault()
        // Immediate save
        setStatus("saving")
        startTransition(() => {
          onContentChange(code)
          setStatus("saved")
          setTimeout(() => setStatus("idle"), 1500)
        })
      }

      // Format: Ctrl/Cmd + Shift + F
      if (mod && e.shiftKey && (e.key === "F" || e.key === "f")) {
        e.preventDefault()
        formatDocument()
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [code, onRun, onContentChange])

  function changeLanguage(next: string) {
    if (next === language) return
    setLanguage(next)
    // Changing `language` prop will re-render the editor with new language
  }

  function onEditorMount(editor: any) {
    editorRef.current = editor
    const pos = editor.getPosition()
    if (pos) setCursor({ line: pos.lineNumber, col: pos.column })

    const disposable = editor.onDidChangeCursorPosition(() => {
      const p = editor.getPosition()
      if (p) setCursor({ line: p.lineNumber, col: p.column })
    })

    return () => disposable.dispose()
  }

  function formatDocument() {
    try {
      editorRef.current?.getAction("editor.action.formatDocument")?.run()
      toast.success("Formatted document")
    } catch (e) {
      toast.error("Formatting not available for this language")
    }
  }

  function toggleWordWrap() {
    setWordWrap((w) => !w)
  }

  
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

 return (
  <div className="flex h-full flex-col gap-3">
    {/* HEADER */}
    <div className="flex items-center justify-between">
      {/* Left: File tab */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-md bg-[var(--card)] px-3 py-1.5">
          <FileText className="size-4 text-[var(--card-foreground)]" />
          <div className="flex flex-col leading-4">
            <span className="text-sm font-semibold text-[var(--card-foreground)]">{activeFile.name}</span>

          </div>
        </div>

        <span className={`text-xs font-medium ${status === 'saving' ? 'text-amber-400' : status === 'saved' ? 'text-green-400' : 'text-muted-foreground'}`}>
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : ''}
        </span>
      </div>

      {/* Right: Toolbar */}
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={formatDocument} className="hidden sm:inline-flex">
          <Code2 className="size-4" />
          <span className="text-xs">Format</span>
        </Button>

        {onRun && (
          <Button size="sm" onClick={onRun} disabled={isRunning} className="flex items-center gap-2">
            {isRunning ? <Spinner /> : <Play size={14} />}
            <span className="text-xs">{isRunning ? 'Running...' : 'Run'}</span>
          </Button>
        )}

        <Select value={language} onValueChange={(val) => changeLanguage(val)}>
          <SelectTrigger size="sm" className="w-36">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
            <SelectItem value="css">CSS</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost"><MoreHorizontal className="size-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>File</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => { navigator.clipboard?.writeText(activeFile.name); toast.success('Path copied') }}>Copy Path</DropdownMenuItem>
            <DropdownMenuItem onClick={() => formatDocument()}>Format Document <span className="ml-auto text-xs text-muted-foreground">⇧+Ctrl/Cmd+F</span></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleWordWrap}>{wordWrap ? 'Disable Word Wrap' : 'Enable Word Wrap'}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <div className="hidden sm:inline-flex">
          <ThemeToggle />
        </div>
      </div>
    </div>

    {/* EDITOR */}
    <div className="flex-1 overflow-hidden rounded-md border border-border">
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={code}
        onMount={onEditorMount}
        onChange={(value) => setCode(value ?? "")}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          wordWrap: wordWrap ? "on" : "off",
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
        }}
      />
    </div>

    {/* STATUS BAR */}
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2">{status === 'saving' ? <span className="text-amber-400">●</span> : status === 'saved' ? <span className="text-green-400">●</span> : <span className="opacity-0">●</span>} <span>{status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : 'Idle'}</span></span>
        <span>Ln {cursor.line}, Col {cursor.col}</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden sm:inline">{language}</span>
        <span className="hidden sm:inline">{wordWrap ? 'Wrap' : 'No Wrap'}</span>
      </div>
    </div>
  </div>
)
}