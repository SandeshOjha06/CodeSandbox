'use client'
import { useState, useMemo } from 'react'

import {
  File,
  Trash2,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  FilePlus,
  FolderPlus
} from 'lucide-react'
import { toast } from 'sonner'
import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiHtml5,
  SiCss3,
  SiJson,
  SiMarkdown
} from 'react-icons/si'
// import { VscNewFile, VscNewFolder } from 'react-icons/vsc'

import { File as FileType } from '@/types/files'

interface FileExplorerProps {
  fileExplorer: {
    files: Record<string, FileType>
    activeFileId: string | null
    selectFile: (id: string) => void
    deleteFile: (id: string) => void
    createFile: (name: string, language: string) => void
    renameFile: (id: string, newName: string) => void
  }
  collapsed: boolean
  onToggleCollapse: () => void
}

// Helper to determine icon based on file extension/language
function getFileIcon(filename: string, language: string) {
  const ext = filename.split('.').pop()?.toLowerCase()

  if (language === 'python' || ext === 'py') return <SiPython className="text-[#3776AB]" />
  if (language === 'javascript' || ext === 'js' || ext === 'jsx') return <SiJavascript className="text-[#F7DF1E]" />
  if (language === 'typescript' || ext === 'ts' || ext === 'tsx') return <SiTypescript className="text-[#3178C6]" />
  if (language === 'html' || ext === 'html') return <SiHtml5 className="text-[#E34F26]" />
  if (language === 'css' || ext === 'css') return <SiCss3 className="text-[#1572B6]" />
  if (language === 'json' || ext === 'json') return <SiJson className="text-[#F7DF1E]" />
  if (ext === 'md') return <SiMarkdown className="text-gray-400" />
  if (ext === 'rs') return <span className="text-orange-500 font-bold text-xs">Rs</span>
  if (ext === 'go') return <span className="text-cyan-500 font-bold text-xs">Go</span>
  if (ext === 'java') return <span className="text-red-500 font-bold text-xs">J</span>

  return <File size={14} className="text-gray-400" />
}

type TreeNode = {
  id?: string
  name: string
  type: 'file' | 'folder'
  children?: Record<string, TreeNode>
  file?: FileType
}

export default function FileExplorer({ fileExplorer, collapsed, onToggleCollapse }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']))
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileLanguage, setNewFileLanguage] = useState('javascript')
  const [isFolderCreation, setIsFolderCreation] = useState(false)

  // Build tree from flat file list (virtual folders based on '/' in names)
  const fileTree = useMemo(() => {
    const root: Record<string, TreeNode> = {}

    // Sort files to ensure stable order
    const sortedFiles = Object.values(fileExplorer.files).sort((a, b) =>
      a.name.localeCompare(b.name)
    )

    sortedFiles.forEach(file => {
      const parts = file.name.split('/')
      let currentLevel = root

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1
        const path = parts.slice(0, index + 1).join('/')

        if (!currentLevel[part]) {
          if (isFile) {
            currentLevel[part] = {
              id: file.id,
              name: part,
              type: 'file',
              file
            }
          } else {
            currentLevel[part] = {
              name: part,
              type: 'folder',
              children: {}
            }
          }
        }

        if (!isFile) {
          currentLevel = currentLevel[part].children!
        }
      })
    })

    return root
  }, [fileExplorer.files])

  const toggleFolder = (path: string) => {
    const next = new Set(expandedFolders)
    if (next.has(path)) {
      next.delete(path)
    } else {
      next.add(path)
    }
    setExpandedFolders(next)
  }

  const handleCreateFile = () => {
    if (!newFileName.trim()) return

    if (isFolderCreation) {
      // Create a .keep file to persist the folder
      // Assuming newFileName is just the folder name or path
      fileExplorer.createFile(`${newFileName}/.keep`, 'plaintext')
    } else {
      let finalName = newFileName
      // Auto-append extension if missing based on selected language
      if (newFileLanguage === 'javascript' && !finalName.endsWith('.js') && !finalName.endsWith('.jsx')) {
        finalName += '.js'
      } else if (newFileLanguage === 'python' && !finalName.endsWith('.py')) {
        finalName += '.py'
      }

      fileExplorer.createFile(finalName, newFileLanguage)
    }

    setNewFileName('')
    setShowCreateDialog(false)
    setIsFolderCreation(false)
  }

  // Recursive Tree Renderer
  const renderTree = (nodes: Record<string, TreeNode>, depth = 0, parentPath = '') => {
    // Sort: Folders first, then files
    const sortedKeys = Object.keys(nodes).sort((a, b) => {
      const nodeA = nodes[a]
      const nodeB = nodes[b]
      if (nodeA.type === nodeB.type) return a.localeCompare(b)
      return nodeA.type === 'folder' ? -1 : 1
    })

    return sortedKeys.map(key => {
      const node = nodes[key]
      const path = parentPath ? `${parentPath}/${key}` : key
      const isExpanded = expandedFolders.has(path)
      const indent = depth * 12

      if (node.type === 'folder') {
        return (
          <div key={path} className="group">
            <div
              className="flex items-center gap-1 py-1 px-2 hover:bg-[#2a2d2e] cursor-pointer text-gray-400 hover:text-gray-100 transition-colors relative"
              style={{ paddingLeft: `${indent + 8}px` }}
              onClick={() => toggleFolder(path)}
            >
              <span className="opacity-70">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
              <span className="text-[#dcb67a] mr-1.5">
                {isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />}
              </span>
              <span className="text-sm font-medium truncate select-none flex-1">{node.name}</span>

              <div className="flex gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setNewFileName(`${path}/`)
                    setIsFolderCreation(false)
                    setShowCreateDialog(true)
                  }}
                  className="hover:text-blue-400 p-0.5"
                  title="New File in Folder"
                >
                  <FilePlus size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()

                    const handleDeleteFolder = () => {
                      const prefix = path + '/'
                      Object.values(fileExplorer.files).forEach(f => {
                        if (f.name.startsWith(prefix) || f.name === path) {
                          fileExplorer.deleteFile(f.id)
                        }
                      })
                      toast.success(`Deleted folder ${node.name}`)
                    }

                    toast("Delete Folder?", {
                      description: `This will delete "${node.name}" and all files inside.`,
                      action: {
                        label: "Delete",
                        onClick: handleDeleteFolder
                      }
                    })
                  }}
                  className="hover:text-red-400 p-0.5"
                  title="Delete Folder"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {isExpanded && node.children && (
              <div>{renderTree(node.children, depth + 1, path)}</div>
            )}
          </div>
        )

      } else {
        // HIDE .keep files
        if (node.name === '.keep') return null

        const isActive = fileExplorer.activeFileId === node.id
        return (
          <div
            key={node.id}
            onClick={() => fileExplorer.selectFile(node.id!)}
            className={`group
              flex items-center gap-1.5 py-1 px-2 cursor-pointer text-sm
              transition-colors border-l-2
              ${isActive
                ? 'bg-[#37373d] text-white border-[#007fd4]'
                : 'border-transparent text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-100'
              }
            `}
            style={{ paddingLeft: `${indent + 20}px` }}
            title={node.file?.name} // Full path on hover
          >
            <span className="flex-shrink-0">
              {getFileIcon(node.name, node.file!.language)}
            </span>
            <span className="truncate flex-1 font-normal opacity-90">
              {node.name}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation()
                const handleDelete = () => {
                  fileExplorer.deleteFile(node.id!)
                  toast.success(`Deleted ${node.name}`)
                }

                toast("Delete File?", {
                  description: `Are you sure you want to delete "${node.name}"?`,
                  action: {
                    label: "Delete",
                    onClick: handleDelete
                  }
                })
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity px-1"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )
      }
    })
  }

  if (collapsed) {
    return (
      <div className="w-10 bg-[#181818] flex flex-col h-full border-r border-[#2b2b2b] items-center py-2 select-none">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2d2e] rounded mb-2"
          title="Expand Sidebar"
        >
          <ChevronRight size={16} />
        </button>

        <div className="flex flex-col gap-2 mt-2">
          <div className="p-2 text-gray-500" title="Files">
            <Folder size={16} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 bg-[#181818] flex flex-col h-full border-r border-[#2b2b2b] select-none transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 text-[11px] font-bold text-gray-500 bg-[#181818] uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <button onClick={onToggleCollapse} className="hover:text-gray-100"><ChevronDown size={14} /></button>
          <span>Explorer</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => { setShowCreateDialog(true); setIsFolderCreation(false); }}
            className="hover:text-gray-100 p-1 rounded hover:bg-[#2a2d2e] transition"
            title="New File"
          >
            <FilePlus size={14} />
          </button>
          <button
            onClick={() => { setShowCreateDialog(true); setIsFolderCreation(true); }}
            className="hover:text-gray-100 p-1 rounded hover:bg-[#2a2d2e] transition"
            title="New Folder"
          >
            <FolderPlus size={14} />
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-1">
          {Object.keys(fileTree).length === 0 ? (
            <div className="text-gray-500 text-xs px-6 py-4 italic text-center">
              No files open
              <br />
              <span className="opacity-50 text-[10px] mt-1 block">Click + to create file</span>
            </div>
          ) : (
            renderTree(fileTree)
          )}
        </div>
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-[20vh]" onClick={() => setShowCreateDialog(false)}>
          <div
            className="bg-[#252526] w-[400px] shadow-2xl rounded-md border border-[#454545] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-3 border-b border-[#454545] bg-[#1e1e1e]">
              <h3 className="text-gray-200 text-xs font-semibold uppercase">
                {isFolderCreation ? 'Create New Folder' : 'Create New File'}
              </h3>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-3">
                {!isFolderCreation && (
                  <div>
                    <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Language</label>
                    <div className="flex gap-2">
                      <button
                        className={`flex-1 px-3 py-2 rounded text-xs border transition-colors flex items-center justify-center gap-2 ${newFileLanguage === 'javascript'
                          ? 'bg-[#007fd4]/20 border-[#007fd4] text-white'
                          : 'bg-[#3c3c3c] border-transparent text-gray-400 hover:text-gray-200'
                          }`}
                        onClick={() => setNewFileLanguage('javascript')}
                      >
                        <SiJavascript size={14} className={newFileLanguage === 'javascript' ? 'text-[#F7DF1E]' : ''} />
                        <span>JavaScript</span>
                      </button>
                      <button
                        className={`flex-1 px-3 py-2 rounded text-xs border transition-colors flex items-center justify-center gap-2 ${newFileLanguage === 'python'
                          ? 'bg-[#007fd4]/20 border-[#007fd4] text-white'
                          : 'bg-[#3c3c3c] border-transparent text-gray-400 hover:text-gray-200'
                          }`}
                        onClick={() => setNewFileLanguage('python')}
                      >
                        <SiPython size={14} className={newFileLanguage === 'python' ? 'text-[#3776AB]' : ''} />
                        <span>Python</span>
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Name</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder={isFolderCreation ? "folder-name" : newFileLanguage === 'python' ? "script.py" : "app.js"}
                    className="w-full bg-[#3c3c3c] text-gray-100 border border-[#3c3c3c] focus:border-[#007fd4] outline-none px-3 py-2 text-sm rounded-sm placeholder-gray-500"
                    value={newFileName}
                    onChange={e => setNewFileName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleCreateFile()
                      if (e.key === 'Escape') setShowCreateDialog(false)
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="px-3 py-1.5 text-xs text-gray-300 hover:bg-[#3c3c3c] rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFile}
                  disabled={!newFileName.trim()}
                  className="px-3 py-1.5 text-xs bg-[#007fd4] hover:bg-[#026ec1] text-white rounded disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}