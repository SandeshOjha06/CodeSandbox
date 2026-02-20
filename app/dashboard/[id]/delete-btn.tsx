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
      className="bg-red-600/90 hover:bg-red-500 text-white px-2 py-1.5 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
      title="Delete Playground"
    >
      <span className="text-xs font-medium">Delete</span>
    </button>
  )
}