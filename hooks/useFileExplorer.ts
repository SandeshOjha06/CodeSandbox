import { updatePlayground } from "@/app/dashboard/actions";
import { Field } from "@/components/ui/field";
import { FileMap, PlaygroundWithFiles } from "@/types/files";
import { useState, useRef, useCallback } from "react";

export function useFileExplorer(playground: PlaygroundWithFiles,playgroundId: string){
    const [files, setFiles] = useState<FileMap>(() => {
        try {
            return JSON.parse(playground.files || '{}')
        } catch  {
            return{}
        }
    })

    //track currently open file
    const [activeFileId, setActiveFiledId] = useState<string | null>(
        playground.activeFileId || null
    )

    const [isSaving, setIsSaving] = useState(false)

   const saveTimeoutRef =  useRef<NodeJS.Timeout | null>(null) 

   const saveToDatabase = useCallback(
    async(newFiles: FileMap, newActiveId: string | null){
        setIsSaving(true)
        try {
            await updatePlayground({
                id: playgroundId,
                files: newFiles,
                activeFileId: newActiveId,
            })
        } catch (error) {
            console.error("Failed to save to database: ", error);
            
        }
        finally{
            setIsSaving(false)
        }
    },
    [playgroundId]
   )

   //creating file
   const createFile = useCallback((name: string, language: string)=>{
    const fileId = 'file-' + Date.now() + '-' + Math.random().toString(36).substring(7)

    //creating new file object
    const newFile: File = {
        id: fileId,
        name: name,
        content: '',
        language: language,
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    const updatedFiles = {
        ...files
        [fileId]: newFile,

    }
    setFiles(updatedFiles)
    setActiveFiledId(fileId) // auto selects the new file

    saveToDatabase(updatedFiles, fileId)

    return newFile
  
   },[files, saveToDatabase])

   const selectFile = useCallback((fileId:string) => {
    if(!files[fileId]) {
        console.error("file not found", fileId);
        return
    }

    setActiveFiledId(fileId)
    saveToDatabase(files, fileId)
    
   }, [files, saveToDatabase])
}