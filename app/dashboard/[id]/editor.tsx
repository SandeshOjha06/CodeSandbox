"use client"

import { useState, useTransition } from "react"
import updatePlayground from "../actions"

export default function Editor({ playground }: { playground: any }) {
  const [code, setCode] = useState(playground.code ?? "")
  const [isPending, startTransition] = useTransition()

  function save() {
    startTransition(() => {
      updatePlayground(playground.id, { code })
    })
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <h1 className="text-xl font-semibold text-gray-200">
        {playground.title}
      </h1>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="flex-1 resize-none rounded bg-[#1e1e1e] p-4 font-mono text-sm text-gray-200 outline-none"
        placeholder="// Start coding..."
      />

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={isPending}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  )
}
