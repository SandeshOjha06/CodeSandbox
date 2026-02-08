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
import UserMenu from './user-menu'

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
      <div className="flex-1 flex flex-col gap-0 overflow-hidden">
        {/* HEADER */}
        <div className="border-b border-gray-800 bg-[#0a0a0a] px-8 py-4 flex items-center justify-between">
          {/* Left: Title */}
          <EditableTitle id={playgroundId} initialTitle={playground.title} />

          {/* Right: Actions */}
          <div className="flex gap-3 items-center">
            <AIToggle isOpen={showAI} onClick={() => setShowAI(!showAI)} />
            <DeleteButton id={playgroundId} />
            <UserMenu />
          </div>
        </div>

        {/* EDITOR & OUTPUT */}
        <div className="flex-1 flex gap-0 overflow-hidden">
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

          {/* AI Chat Sidebar */}
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