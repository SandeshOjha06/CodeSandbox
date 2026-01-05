"use client"

import { useEffect,useRef,useState,useTransition } from "react"
import { updatePlayground } from "../actions"

export default function EditableTitle({id,initialTitle}:{
    id: string,
    initialTitle: string
}){
    const [title, setTitle] = useState(initialTitle)
    const [editing, setEditing] = useState(false)
    const [isPending, startTransition] = useTransition()
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if(editing){
            inputRef.current?.focus()
            inputRef.current?.select()
        }
    },[editing])

    function save(){
        setEditing(false)

        if(title.trim() === "" || title === initialTitle) return

        startTransition(() => {
            updatePlayground({
                id,
                title: title.trim()
            })
        })
    }

    function cancel(){
        setTitle(initialTitle)
        setEditing(false)
    }

    if(!editing){
        return(
             <h1
        onClick={() => setEditing(true)}
        className="cursor-text text-xl font-semibold text-gray-200 hover:text-white"
        title="Click to rename"
      >
        {title}
      </h1>
        )
    }

   return (
    <input
      ref={inputRef}
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save()
        if (e.key === "Escape") cancel()
      }}
      className="
        rounded bg-[#1e1e1e] px-2 py-1
        text-xl font-semibold text-gray-200
        outline-none ring-1 ring-blue-500
      "
    />
  )

}