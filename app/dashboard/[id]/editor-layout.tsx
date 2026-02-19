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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-full gap-0">
      {/* FILE EXPLORER */}
      <FileExplorer
        fileExplorer={fileExplorer}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col gap-0 overflow-hidden">
        {/* HEADER */}
        <div className="border-b border-[#2b2b2b] bg-[#181818] px-4 py-2 flex items-center justify-between h-[39px] shrink-0">
          {/* Left: Title */}
          <EditableTitle id={playgroundId} initialTitle={playground.title} />

          {/* Right: Actions */}
          <div className="flex gap-2 items-center">
            <AIToggle isOpen={showAI} onClick={() => setShowAI(!showAI)} />
            <DeleteButton id={playgroundId} />
            <UserMenu />
          </div>
        </div>

        {/* EDITOR & OUTPUT */}
        <div className="flex-1 flex gap-1 overflow-hidden">
          {/* Editor + Output */}
          {activeFile ? (
            <EditorContainer
              activeFile={activeFile}
              onContentChange={(newContent) =>
                fileExplorer.updateFileContent(activeFile.id, newContent)
              }
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 bg-[#1e1e1e]">
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

        {/* STATUS BAR */}
        <footer className="h-5 bg-[#007ad0] text-white flex items-center px-3 text-[11px] select-none justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
              <span>main*</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
              Ln {activeFile?.content ? activeFile.content.split('\n').length : 1}, Col 1
            </div>
            <div className="hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
              UTF-8
            </div>
            <div className="hover:bg-white/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
              {activeFile?.language ? activeFile.language.toUpperCase() : 'PLAIN TEXT'}
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}