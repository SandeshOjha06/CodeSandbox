"use client"

import { useTransition } from "react"
import { deletePlayground } from "../actions"
import { toast } from "sonner"

export default function DeleteButton({ id }: {id : string}){
    const [isPending, startTransition] = useTransition()

    function handkeDelete(){
       toast.warning("Delete Playground?",
        {
            description: "This action cannot be undone.",
            action: {
                label: "Delete",
                onClick: () => {
                    startTransition(() => {
                        deletePlayground(id)
                    })

                    toast.success("Playground deleted. This might take a while...")
                }
            }
        }
       )
    }
    
            return(
                <button
                onClick={handkeDelete}
                disabled={isPending}
                className="rounded bg-red-600 px-4 py-3 text-sm text-white disabled:opacity"
                >
                   Delete
                </button>
            )
}