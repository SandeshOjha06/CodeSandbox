"use client"

import { startTransition, useEffect, useRef, useState, useTransition } from "react"
import { updatePlayground } from "../actions"
import { Save } from "lucide-react"

/**
 * Renders an editor UI for a playground with an editable title and a code editor that autosaves edits after a short debounce.
 *
 * @param playground - Playground data containing `id`, initial `code`, and `title`
 * @returns The editor's JSX element
 */
export default function Editor({ playground }: { playground: any }) {
  const [code, setCode] = useState(playground.code ?? "")
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")

  const [isPending, startTransition] = useTransition()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [title, setTitle] = useState(playground.title ?? "")

  //debounced autosave
  useEffect(() => {
    if (code === playground.code) return

    setStatus("saving")

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      startTransition(async () => {
        await updatePlayground({
          id: playground.id,
          code,
        })
        setStatus("saved")
      })
    }, 900)
  }, [code, playground.id, playground.code, startTransition])
  
  function manualSave() {
    setStatus("saving")
  
    startTransition(async () => {
      await updatePlayground({
        id: playground.id,
        code,
      })
      setStatus("saved")
    })
  }

  function saveTitle(){
    if(title === playground.title) return;

    startTransition(async() => {
      await updatePlayground({
        id: playground.id,
        title: title.trim() || "Untitled"
      })
      setStatus("saved")
    }) 


  }
  
   return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="
            bg-transparent
            text-lg font-semibold
            text-gray-200
            outline-none
            border-b border-transparent
            focus:border-blue-600
            max-w-md
          "
        />

        <span className="text-xs text-gray-400">
          {status === "saving" && "Saving…"}
          {status === "saved" && "Saved"}
        </span>
      </div>

      {/* Editor */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="
          flex-1 resize-none rounded-md
          bg-[#1e1e1e] p-4
          font-mono text-sm text-gray-200
          outline-none
          focus:ring-1 focus:ring-blue-600
        "
        placeholder="// Start coding..."
      />
    </div>
  )
}