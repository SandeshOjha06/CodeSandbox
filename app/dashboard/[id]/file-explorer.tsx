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
}

export default function FileExplorer({ fileExplorer }: FileExplorerProps) {
  // STATE: Dialog for creating new file
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileLanguage, setNewFileLanguage] = useState('javascript')

  // HELPER: Get icon based on language
  function getFileIcon(language: string) {
    switch(language) {
      case 'javascript':
        return <FileJson size={16} className="text-yellow-500" />
      case 'typescript':
        return <FileCode size={16} className="text-blue-500" />
      case 'css':
        return <FileCode size={16} className="text-purple-500" />
      case 'html':
        return <FileText size={16} className="text-orange-500" />
      case 'python':
        return <FileCode size={16} className="text-green-500" />
      default:
        return <FileText size={16} className="text-gray-500" />
    }
  }

  // HANDLER: Create new file
  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      alert('Please enter a file name')
      return
    }

    fileExplorer.createFile(newFileName, newFileLanguage)

    // Reset dialog
    setNewFileName('')
    setNewFileLanguage('javascript')
    setShowCreateDialog(false)
  }

  // RENDER
  return (
    <div className="w-64 bg-[#1e1e1e] border-r border-gray-700 flex flex-col h-full">
      {/* ===== HEADER ===== */}
      <div className="border-b border-gray-700 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Files
        </h2>
      </div>

      {/* ===== CREATE FILE BUTTON ===== */}
      <button
        onClick={() => setShowCreateDialog(true)}
        className="m-3 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2 transition font-medium"
      >
        <Plus size={16} />
        New File
      </button>

      {/* ===== FILE LIST ===== */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {Object.values(fileExplorer.files).length === 0 ? (
          <div className="text-gray-500 text-xs p-4 text-center">
            No files yet. Create one!
          </div>
        ) : (
          Object.values(fileExplorer.files).map((file) => (
            <div
              key={file.id}
              onClick={() => fileExplorer.selectFile(file.id)}
              className={`
                px-3 py-2 cursor-pointer flex items-center gap-2 text-sm
                transition rounded-md border-l-2 group
                ${
                  fileExplorer.activeFileId === file.id
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-medium'
                    : 'border-transparent text-gray-300 hover:bg-gray-800/50'
                }
              `}
            >
              {/* File icon */}
              <div className="flex-shrink-0">
                {getFileIcon(file.language)}
              </div>

              {/* File name */}
              <span className="flex-1 truncate">{file.name}</span>

              {/* Delete button (appears on hover) */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Delete "${file.name}"?`)) {
                    fileExplorer.deleteFile(file.id)
                  }
                }}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* ===== CREATE FILE DIALOG ===== */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] p-6 rounded-lg w-96 shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Create New File
            </h3>

            {/* File name input */}
            <input
              type="text"
              placeholder="File name (e.g. index.js)"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              autoFocus
              className="w-full bg-[#1e1e1e] text-white px-3 py-2 rounded mb-4 outline-none border border-gray-700 focus:border-blue-500 transition"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFile()
                if (e.key === 'Escape') setShowCreateDialog(false)
              }}
            />

            {/* Language selector */}
            <select
              value={newFileLanguage}
              onChange={(e) => setNewFileLanguage(e.target.value)}
              className="w-full bg-[#1e1e1e] text-white px-3 py-2 rounded mb-4 outline-none border border-gray-700 focus:border-blue-500 transition"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="css">CSS</option>
              <option value="html">HTML</option>
              <option value="python">Python</option>
            </select>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleCreateFile}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateDialog(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition"
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