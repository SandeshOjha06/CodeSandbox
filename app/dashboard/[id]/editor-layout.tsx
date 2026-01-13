'use client'

import { useState, useRef, useEffect } from 'react'
import { useFileExplorer } from '@/hooks/useFileExplorer'
import { PlaygroundWithFiles } from '@/types/files'
import Editor from './editor'
import FileExplorer from './file-explorer'
import EditableTitle from './edit-title'
import DeleteButton from './delete-btn'
import EditorContainer from './editor-container'
import AIChat from './ai-chat'
import { Sparkles, Plus, X, Columns } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const [split, setSplit] = useState(false)
  const [splitRatio, setSplitRatio] = useState(0.5)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const draggingRef = useRef(false)
  const activeFile = fileExplorer.activeFile

  const files = Object.values(fileExplorer.files)

  const MIN_RATIO = 0.2
  const MAX_RATIO = 0.8

  // Collapsible file explorer & slide-in new file sidebar
  const [fileExplorerCollapsed, setFileExplorerCollapsed] = useState(false)
  const [newFileSidebarOpen, setNewFileSidebarOpen] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileLanguage, setNewFileLanguage] = useState('javascript')

  const openNewFilePanel = () => {
    setNewFileSidebarOpen(true)
    setNewFileName('')
    setNewFileLanguage('javascript')
  }

  const closeNewFilePanel = () => setNewFileSidebarOpen(false)

  const handleCreateFileFromPanel = () => {
    if (!newFileName.trim()) {
      // simple validation
      return
    }

    fileExplorer.createFile(newFileName.trim(), newFileLanguage)
    closeNewFilePanel()
  }

  const startDrag = (clientX: number) => {
    const el = containerRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const newRatio = Math.max(MIN_RATIO, Math.min(MAX_RATIO, (clientX - rect.left) / rect.width))
    setSplitRatio(newRatio)
    draggingRef.current = true
    document.body.style.cursor = 'col-resize'
  }

  const stopDrag = () => {
    draggingRef.current = false
    document.body.style.cursor = ''
  }

  const onMouseMove = (e: MouseEvent) => {
    if (!draggingRef.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const newRatio = Math.max(MIN_RATIO, Math.min(MAX_RATIO, (e.clientX - rect.left) / rect.width))
    setSplitRatio(newRatio)
  }

  const onTouchMove = (e: TouchEvent) => {
    if (!draggingRef.current || !containerRef.current) return
    const touch = e.touches[0]
    const rect = containerRef.current.getBoundingClientRect()
    const newRatio = Math.max(MIN_RATIO, Math.min(MAX_RATIO, (touch.clientX - rect.left) / rect.width))
    setSplitRatio(newRatio)
  }

  useEffect(() => {
    const onUp = () => stopDrag()
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchend', onUp)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchend', onUp)
    }
  }, [])

  return (
    <div className="flex h-full bg-[var(--background)] text-[var(--foreground)]">
      {/* FILE EXPLORER SIDEBAR */}
      <div className={`transition-width duration-200 ${fileExplorerCollapsed ? 'w-12' : 'w-64'}`}>
        <FileExplorer
          fileExplorer={fileExplorer}
          collapsed={fileExplorerCollapsed}
          onToggleCollapse={() => setFileExplorerCollapsed((s) => !s)}
          onRequestCreateFile={openNewFilePanel}
        />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER BAR */}
        <div className="border-b border-[var(--border)] bg-[var(--card)] px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Title */}
            <div>
              <h1 className="text-lg font-semibold text-[var(--card-foreground)]">
                {playground.title}
              </h1>
              {activeFile && (
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {activeFile.name}
                </p>
              )}
            </div>

            {/* Right: Action Buttons */}
            <div className="flex gap-2 items-center">
              <Button size="sm" variant="outline" onClick={() => fileExplorer.createFile('untitled.js', 'javascript')}>
                <Plus className="size-4" />
                <span className="text-xs">New File</span>
              </Button>

              <Button size="sm" variant={split ? 'default' : 'outline'} onClick={() => setSplit((s) => !s)}>
                <Columns className="size-4" />
                <span className="text-xs">{split ? 'Single' : 'Split'}</span>
              </Button>

              {/* AI Toggle Button */}
              <button
                onClick={() => setShowAI(!showAI)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-md font-medium text-sm
                  transition-all duration-150
                  ${
                    showAI
                      ? 'bg-[var(--primary)] text-[var(--card-foreground)] shadow-sm'
                      : 'bg-[var(--card)] text-[var(--card-foreground)] hover:bg-[var(--popover)]'
                  }
                `}
              >
                <Sparkles size={16} />
                <span className="text-sm">AI</span>
              </button>

              {/* Delete Button */}
              <DeleteButton id={playgroundId} />
            </div>
          </div>

          {/* TABS */}
          {!fileExplorerCollapsed && (
            <div className="mt-3 w-full overflow-x-auto">
              <div className="flex gap-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md cursor-pointer ${file.id === fileExplorer.activeFileId ? 'bg-[var(--primary)] text-[var(--card-foreground)] ring-1 ring-[var(--primary)] ring-opacity-30' : 'bg-[var(--card)] text-[var(--card-foreground)] hover:bg-[var(--popover)]'}`}
                    onClick={() => fileExplorer.selectFile(file.id)}
                  >
                    <span className="text-sm font-medium">{file.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); fileExplorer.deleteFile(file.id) }} className="opacity-70 hover:opacity-100">
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex gap-4 overflow-hidden p-4">
          {/* EDITOR + OUTPUT */}
          <div className={`flex-1 flex ${split ? 'gap-3' : ''} flex-col overflow-hidden`}>
            {activeFile ? (
              <div ref={containerRef} className={`flex-1 flex items-stretch min-h-0 ${split ? '' : 'flex-col'}`}>
                {split ? (
                  <>
                    <div className="min-h-0" style={{ flexBasis: `${splitRatio * 100}%`, flexGrow: 0, flexShrink: 0, minWidth: 200 }}>
                      <EditorContainer
                        activeFile={activeFile}
                        onContentChange={(newContent) =>
                          fileExplorer.updateFileContent(activeFile.id, newContent)
                        }
                      />
                    </div>

                    {/* Resizer */}
                    <div
                      role="separator"
                      aria-orientation="vertical"
                      onMouseDown={(e) => startDrag(e.clientX)}
                      onTouchStart={(t) => startDrag(t.touches[0].clientX)}
                      className="w-2 cursor-col-resize bg-transparent hover:bg-[rgba(150,150,150,0.06)] transition-colors"
                    >
                      <div className="h-full w-full flex items-center justify-center">
                        <div className="w-px h-10 bg-[var(--border)] opacity-60" />
                      </div>
                    </div>

                    <div className="min-h-0 flex-1" style={{ minWidth: 200 }}>
                      <EditorContainer
                        activeFile={activeFile}
                        onContentChange={(newContent) =>
                          fileExplorer.updateFileContent(activeFile.id, newContent)
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <EditorContainer
                      activeFile={activeFile}
                      onContentChange={(newContent) =>
                        fileExplorer.updateFileContent(activeFile.id, newContent)
                      }
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-[var(--muted-foreground)] text-sm mb-2">
                    No file selected
                  </p>
                  <p className="text-[var(--muted-foreground)] text-xs">
                    Create or select a file to start coding
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI CHAT PANEL */}
          {showAI && (
            <AIChat
              activeFileContent={activeFile?.content || ''}
              isOpen={showAI}
              onClose={() => setShowAI(false)}
            />
          )}
        </div>
      </div>

      {/* Slide-in New File Sidebar */}
      {newFileSidebarOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={closeNewFilePanel} />

          <aside className={`absolute left-0 top-0 bottom-0 w-96 bg-[var(--card)] border-r border-[var(--border)] p-6 shadow-2xl transform transition-transform duration-200`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--card-foreground)]">Create New File</h3>
              <button onClick={closeNewFilePanel} className="p-1 rounded hover:bg-[var(--popover-hover)]">✕</button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="File name (e.g. index.js)"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                autoFocus
                className="w-full bg-[var(--background)] text-[var(--card-foreground)] px-3 py-2.5 rounded-md mb-1 outline-none border border-[var(--border)] focus:border-[var(--primary)]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFileFromPanel()
                  if (e.key === 'Escape') closeNewFilePanel()
                }}
              />

              <select
                value={newFileLanguage}
                onChange={(e) => setNewFileLanguage(e.target.value)}
                className="w-full bg-[var(--background)] text-[var(--card-foreground)] px-3 py-2.5 rounded-md outline-none border border-[var(--border)] focus:border-[var(--primary)]"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="css">CSS</option>
                <option value="html">HTML</option>
                <option value="python">Python</option>
              </select>

              <div className="flex gap-3 mt-2">
                <button onClick={handleCreateFileFromPanel} className="flex-1 bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-md">Create</button>
                <button onClick={closeNewFilePanel} className="flex-1 bg-[var(--card)] text-[var(--card-foreground)] px-4 py-2 rounded-md">Cancel</button>
              </div>
            </div>
          </aside>
        </div>
      )}

    </div>
  )
}