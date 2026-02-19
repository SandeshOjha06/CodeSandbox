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
      className="text-gray-400 hover:text-red-400 p-1.5 rounded-md hover:bg-red-900/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
      title="Delete Playground"
    >
      <span className="text-xs font-medium">Delete</span>
    </button>
  )
}