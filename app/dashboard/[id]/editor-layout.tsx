'use client'

import { useFileExplorer } from '@/hooks/useFileExplorer'
import { PlaygroundWithFiles } from '@/types/files'
import Editor from './editor'
import FileExplorer from './file-explorer'
import EditableTitle from './edit-title'
import DeleteButton from './delete-btn'

interface EditorLayoutProps {
  playground: PlaygroundWithFiles
  playgroundId: string
}

export default function EditorLayout({ 
  playground, 
  playgroundId 
}: EditorLayoutProps) {
  const fileExplorer = useFileExplorer(playground, playgroundId)

  const activeFile = fileExplorer.activeFile

  return (
    <div className="flex h-full gap-0">
      <FileExplorer playground={playground} playgroundId={playgroundId} />

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex items-center justify-between">
          <EditableTitle id={playgroundId} initialTitle={playground.title} />
          <DeleteButton id={playgroundId} />
        </div>
        {activeFile ? (
          <Editor 
            activeFile={activeFile}
            onContentChange={(newContent) => 
              fileExplorer.updateFileContent(activeFile.id, newContent)
            }
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>No file selected. Create or select a file to start coding.</p>
          </div>
        )}
      </div>
    </div>
  )
}