'use client'

import { useState } from 'react'
import { useFileExplorer } from '@/hooks/useFileExplorer'
import { PlaygroundWithFiles } from '@/types/files'
import Editor from './editor'
import FileExplorer from './file-explorer'
import EditableTitle from './edit-title'
import DeleteButton from './delete-btn'
import EditorContainer from './editor-container'
import AIChat from './ai-chat'
import AIToggle from './ai-toggle'

interface EditorLayoutProps {
  playground: PlaygroundWithFiles
  playgroundId: string
}

export default function EditorLayout({
  playground,
  playgroundId,
}: EditorLayoutProps) {
  const fileExplorer = useFileExplorer(playground, playgroundId)
  const [showAI, setShowAI] = useState(false)
  const activeFile = fileExplorer.activeFile

  return (
    <div className="flex h-full gap-0">
      {/* FILE EXPLORER */}
      <FileExplorer fileExplorer={fileExplorer} />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <EditableTitle id={playgroundId} initialTitle={playground.title} />
          <div className="flex gap-2 items-center">
            <AIToggle isOpen={showAI} onClick={() => setShowAI(!showAI)} />
            <DeleteButton id={playgroundId} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Editor + Output */}
          {activeFile ? (
            <EditorContainer
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

          {/* AI Chat */}
          <AIChat
            activeFileContent={activeFile?.content || ''}
            isOpen={showAI}
            onClose={() => setShowAI(false)}
          />
        </div>
      </div>
    </div>
  )
}