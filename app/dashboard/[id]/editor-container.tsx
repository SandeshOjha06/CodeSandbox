'use client'

import { useState } from 'react'
import Editor from './editor'
import OutputPanel from './output-panel'
import ResizableDivider from './resizable-divider'
import { File } from '@/types/files'
import { useCodeExecution } from '@/hooks/useCodeExecution'

interface EditorContainerProps {
  activeFile: File
  onContentChange: (newContent: string) => void
}

export default function EditorContainer({
  activeFile,
  onContentChange,
}: EditorContainerProps) {
  const [editorHeight, setEditorHeight] = useState(65) // 65% editor, 35% output
  const { logs, error, time, isRunning, run, clear } = useCodeExecution()

  const handleRun = () => {
    run(activeFile.content, activeFile.language)
  }

  return (
    <div
      id="editor-split-container"
      className="flex-1 flex flex-col gap-0 overflow-hidden"
    >
      {/* Editor */}
      <div style={{ height: `${editorHeight}%` }} className="overflow-hidden">
        <Editor
          activeFile={activeFile}
          onContentChange={onContentChange}
          onRun={handleRun}
          isRunning={isRunning}
        />
      </div>

      {/* Divider */}
      <ResizableDivider onDrag={setEditorHeight} />

      {/* Output */}
      <div
        style={{ height: `${100 - editorHeight}%` }}
        className="overflow-hidden"
      >
        <OutputPanel
          logs={logs}
          error={error}
          time={time}
          isRunning={isRunning}
          onRun={handleRun}
          onClear={clear}
        />
      </div>
    </div>
  )
}