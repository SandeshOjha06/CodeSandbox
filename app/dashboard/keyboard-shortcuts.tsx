"use client"

import { useEffect, useRef, useTransition } from "react"
import addPlayground from "./actions"

export default function KeyboardShortcuts() {
  const [, startTransition] = useTransition()
  const locked = useRef(false)

  useEffect(() => {
    //new window --> ctrl+shift+n
    function handler(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes("MAC")
      const cmd = isMac ? e.metaKey : e.ctrlKey

      const isCreate = cmd && e.shiftKey && e.key.toLowerCase() === "n"
      if (!isCreate) return

      e.preventDefault()
      if (locked.current) return

      locked.current = true

      startTransition(() => {
        addPlayground()
        setTimeout(() => {
          locked.current = false
        }, 700)
      })
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return null
}
