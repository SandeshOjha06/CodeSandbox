import { updatePlayground } from "@/app/dashboard/actions";
import { FileMap, PlaygroundWithFiles, File } from "@/types/files";
import { useState, useRef, useCallback } from "react";

export function useFileExplorer(playground: PlaygroundWithFiles, playgroundId: string) {
    const [files, setFiles] = useState<FileMap>(() => {
        if (!playground.files) return {}
        if (typeof playground.files === 'object') return playground.files
        try {
            return JSON.parse(playground.files as unknown as string)
        } catch {
            return {}
        }
    })

    //track currently open file
    const [activeFileId, setActiveFileId] = useState<string | null>(
        playground.activeFileId || null
    )

    const [isSaving, setIsSaving] = useState(false)

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const saveToDatabase = useCallback(
        async (newFiles: FileMap, newActiveId: string | null) => {
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
            finally {
                setIsSaving(false)
            }
        },
        [playgroundId]
    )

    //creating file
    const createFile = useCallback((name: string, language: string) => {
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
            ...files,
            [fileId]: newFile,
        }
        setFiles(updatedFiles)
        setActiveFileId(fileId)

        saveToDatabase(updatedFiles, fileId)

        return newFile

    }, [files, saveToDatabase])

    const selectFile = useCallback((fileId: string) => {
        if (!files[fileId]) {
            console.error("file not found", fileId);
            return
        }

        setActiveFileId(fileId)
        saveToDatabase(files, fileId)

    }, [files, saveToDatabase])

    const deleteFile = useCallback((fileId: string) => {

        const updatedFiles = { ...files }
        delete updatedFiles[fileId]

        //checking if active
        let newActiveId = activeFileId
        if (activeFileId === fileId) {
            const remainingFileId = Object.keys(updatedFiles)
            newActiveId = remainingFileId.length > 0 ? remainingFileId[0] : null
        }

        setFiles(updatedFiles)
        setActiveFileId(newActiveId)

        saveToDatabase(updatedFiles, newActiveId)

    }, [files, activeFileId, saveToDatabase])

    const updateFileContent = useCallback((fileId: string, newContent: string) => {
        if (!files[fileId]) {
            console.error("File not found")
            return
        }

        const updatedFiles = {
            ...files,
            [fileId]: {
                ...files[fileId],
                content: newContent,
                updatedAt: new Date()
            }
        }

        setFiles(updatedFiles)

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        saveTimeoutRef.current = setTimeout(() => {
            saveToDatabase(updatedFiles, activeFileId)
        }, 500)

    }, [files, activeFileId, saveToDatabase])

    const renameFile = useCallback(
        (fileId: string, newName: string) => {
            if (!newName.trim()) {
                console.error("File name cannot be empty")
                return
            }

            if (!files[fileId]) {
                console.error("File not found: ", fileId);
                return
            }

            const nameExists = Object.values(files).some(
                (file) => file.name === newName && file.id !== fileId
            )

            if (nameExists) {
                console.error("File name alredy exists: ", newName);
                return
            }

            const updatedFiles = {
                ...files,
                [fileId]: {
                    ...files[fileId],
                    name: newName,
                    updatedAt: new Date(),
                }
            }
            setFiles(updatedFiles)
            saveToDatabase(updatedFiles, activeFileId)
        },
        [files, activeFileId, saveToDatabase]
    )

    return {
        // State
        files,
        activeFileId,
        activeFile: activeFileId ? files[activeFileId] : null,
        isSaving,

        // Functions
        createFile,
        selectFile,
        deleteFile,
        updateFileContent,
        renameFile,
    }
}