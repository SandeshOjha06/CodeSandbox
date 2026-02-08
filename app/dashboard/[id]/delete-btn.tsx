"use client"
import { useTransition } from "react"
import { deletePlayground } from "../actions"
import { toast } from "sonner"

export default function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    toast.warning("Delete Playground?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => {
          startTransition(() => {
            deletePlayground(id)
          })
          toast.success("Playground deleted...")
        }
      }
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 px-4 py-2 text-sm text-red-400 disabled:opacity-50 transition"
    >
      Delete
    </button>
  )
}