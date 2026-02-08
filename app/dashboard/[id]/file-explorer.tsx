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
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileLanguage, setNewFileLanguage] = useState('javascript')

  function getFileIcon(language: string) {
    switch (language) {
      case 'javascript':
      case 'node':
        return <FileJson size={16} className="text-yellow-500" />
      // case 'typescript':
      //   return <FileCode size={16} className="text-blue-500" />
      // case 'css':
      //   return <FileCode size={16} className="text-purple-500" />
      // case 'html':
      //   return <FileText size={16} className="text-orange-500" />
      case 'python':
        return <FileCode size={16} className="text-green-500" />
      default:
        return <FileText size={16} className="text-gray-500" />
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

  return (
    <div className="w-64 bg-[#1e1e1e] border-r border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-800 p-4 bg-[#0a0a0a]">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Files
        </h2>
      </div>

      {/* Create File Button */}
      <button
        onClick={() => setShowCreateDialog(true)}
        className="m-3 bg-gray-700 hover:bg-gray-600 text-gray-100 px-3 py-2 rounded text-sm flex items-center gap-2 transition font-medium"
      >
        <Plus size={16} />
        New File
      </button>

      {/* File List */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {Object.values(fileExplorer.files).length === 0 ? (
          <div className="text-gray-600 text-xs p-4 text-center">
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
                ${fileExplorer.activeFileId === file.id
                  ? 'bg-gray-800 border-gray-600 text-gray-100 font-medium'
                  : 'border-transparent text-gray-400 hover:bg-gray-800/50'
                }
              `}
            >
              <div className="flex-shrink-0">{getFileIcon(file.language)}</div>
              <span className="flex-1 truncate">{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Delete "${file.name}"?`)) {
                    fileExplorer.deleteFile(file.id)
                  }
                }}
                className="opacity-0 group-hover:opacity-100 text-red-500/70 hover:text-red-500 transition flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Create File Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] p-6 rounded-lg w-96 shadow-2xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-gray-100">
              Create New File
            </h3>

            <input
              type="text"
              placeholder="File name (e.g. index.js)"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              autoFocus
              className="w-full bg-[#2a2a2a] text-gray-100 px-3 py-2 rounded mb-4 outline-none border border-gray-700 focus:border-gray-600 transition"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFile()
                if (e.key === 'Escape') setShowCreateDialog(false)
              }}
            />

            <select
              value={newFileLanguage}
              onChange={(e) => setNewFileLanguage(e.target.value)}
              className="w-full bg-[#2a2a2a] text-gray-100 px-3 py-2 rounded mb-4 outline-none border border-gray-700 focus:border-gray-600 transition"
            >
              {/* <option value="node">Node.js</option> */}
              <option value="javascript">JavaScript</option>
              {/* <option value="typescript">TypeScript</option> */}
              <option value="python">Python</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={handleCreateFile}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-100 px-4 py-2 rounded text-sm font-medium transition"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateDialog(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-400 px-4 py-2 rounded text-sm transition"
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