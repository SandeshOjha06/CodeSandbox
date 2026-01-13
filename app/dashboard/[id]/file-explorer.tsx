'use client'

import { useState } from 'react'
import { Plus, Trash2, FileJson, FileCode, FileText } from 'lucide-react'
import { File } from '@/types/files'

interface FileExplorerProps {
  fileExplorer: {
    files: Record<string, File>
    activeFileId: string | null
    selectFile: (id: string) => void
    deleteFile: (id: string) => void
    createFile: (name: string, language: string) => void
  }
  collapsed?: boolean
  onToggleCollapse?: () => void
  onRequestCreateFile?: () => void
}

export default function FileExplorer({ fileExplorer, collapsed = false, onToggleCollapse, onRequestCreateFile }: FileExplorerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileLanguage, setNewFileLanguage] = useState('javascript')

  // support being controlled by parent (slide-in panel)
  const handleOpenCreate = () => {
    if (typeof (arguments as any) !== 'undefined') {
      // noop for type safety
    }

    if (typeof onRequestCreateFile === 'function') {
      onRequestCreateFile()
    } else {
      setShowCreateDialog(true)
    }
  }

  function getFileIcon(language: string) {
    switch (language) {
      case 'javascript':
        return <FileJson size={16} className="text-yellow-400" />
      case 'typescript':
        return <FileCode size={16} className="text-blue-400" />
      case 'css':
        return <FileCode size={16} className="text-purple-400" />
      case 'html':
        return <FileText size={16} className="text-orange-400" />
      case 'python':
        return <FileCode size={16} className="text-green-400" />
      default:
        return <FileText size={16} className="text-gray-400" />
    }
  }

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      alert('Please enter a file name')
      return
    }

    fileExplorer.createFile(newFileName, newFileLanguage)
    setNewFileName('')
    setNewFileLanguage('javascript')
    setShowCreateDialog(false)
  }

  // collapsed UI
  if (collapsed) {
    return (
      <div className="w-12 bg-[var(--card)] border-r border-[var(--border)] flex flex-col h-full items-center py-2">
        <button
          onClick={onToggleCollapse}
          aria-label="Expand files"
          className="mb-3 p-2 rounded hover:bg-[var(--popover-hover)] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button onClick={handleOpenCreate} aria-label="New file" className="p-2 rounded hover:bg-[var(--popover-hover)] transition-colors">
          <Plus size={16} />
        </button>

        <div className="mt-auto mb-2 text-[var(--muted-foreground)] text-xs">Files</div>
      </div>
    )
  }

  return (
    <div className="w-64 bg-[var(--card)] border-r border-[var(--border)] flex flex-col h-full transition-width duration-200">
      {/* HEADER */}
      <div className="border-b border-[var(--border)] px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
            Files
          </h2>
          <button onClick={onToggleCollapse} aria-label="Collapse files" className="p-1 rounded hover:bg-[var(--popover-hover)] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* CREATE FILE BUTTON */}
      <button
        onClick={handleOpenCreate}
        className={"m-3 bg-[var(--primary)] hover:opacity-95 text-[var(--primary-foreground)] px-4 py-2 rounded-md text-sm flex items-center gap-2 transition duration-150 font-medium shadow-sm hover:shadow-md"}
      >
        <Plus size={16} />
        New File
      </button>

      {/* FILE LIST */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {Object.values(fileExplorer.files).length === 0 ? (
          <div className="text-[var(--muted-foreground)] text-xs p-4 text-center">
            No files yet. Create one!
          </div>
        ) : (
          Object.values(fileExplorer.files).map((file) => (
            <div
              key={file.id}
              onClick={() => fileExplorer.selectFile(file.id)}
              className={`
                px-3 py-2.5 cursor-pointer flex items-center gap-2.5 text-sm
                transition-all duration-150 rounded-md border-l-2 group
                ${
                  fileExplorer.activeFileId === file.id
                    ? 'bg-[var(--primary)] bg-opacity-20 border-[var(--primary)] text-[var(--card-foreground)] font-medium ring-1 ring-[var(--primary)] ring-opacity-30'
                    : 'border-transparent text-[var(--muted-foreground)] hover:bg-[var(--popover)] hover:text-[var(--card-foreground)]'
                }
              `}
            >
              {/* File icon */}
              <div className="flex-shrink-0">{getFileIcon(file.language)}</div>

              {/* File name */}
              <span className="flex-1 truncate">{file.name}</span>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Delete "${file.name}"?`)) {
                    fileExplorer.deleteFile(file.id)
                  }
                }}
                className="
                  opacity-0 group-hover:opacity-100 text-[var(--danger)] hover:text-[var(--danger-foreground)]
                  transition-opacity duration-150 flex-shrink-0
                "
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* CREATE FILE DIALOG (fallback) */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] p-6 rounded-lg w-96 shadow-2xl border border-[var(--border)]">
            <h3 className="text-lg font-semibold mb-4 text-[var(--card-foreground)]">
              Create New File
            </h3>

            {/* File name input */}
            <input
              type="text"
              placeholder="File name (e.g. index.js)"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              autoFocus
              className="
                w-full bg-[var(--background)] text-[var(--card-foreground)] px-3 py-2.5 rounded-md mb-4
                outline-none border border-[var(--border)] focus:border-[var(--primary)]
                transition-colors duration-150 placeholder-[var(--muted-foreground)]
              "
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFile()
                if (e.key === 'Escape') setShowCreateDialog(false)
              }}
            />

            {/* Language selector */}
            <select
              value={newFileLanguage}
              onChange={(e) => setNewFileLanguage(e.target.value)}
              className="
                w-full bg-[var(--background)] text-[var(--card-foreground)] px-3 py-2.5 rounded-md mb-6
                outline-none border border-[var(--border)] focus:border-[var(--primary)]
                transition-colors duration-150
              "
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="css">CSS</option>
              <option value="html">HTML</option>
              <option value="python">Python</option>
            </select>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCreateFile}
                className="
                  flex-1 bg-[var(--primary)] hover:bg-[var(--primary-foreground)] text-[var(--primary-foreground)] px-4 py-2.5
                  rounded-md text-sm font-medium transition-colors duration-150
                "
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateDialog(false)}
                className="
                  flex-1 bg-[var(--card)] hover:bg-[var(--popover)] text-[var(--card-foreground)] px-4 py-2.5
                  rounded-md text-sm transition-colors duration-150
                "
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}