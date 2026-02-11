'use client'
import { useState, useEffect, useRef } from 'react'
import Editor from './editor'
import OutputPanel from './output-panel'
import ResizableDivider from './resizable-divider'
import GenerateCodeDialog from './generate-code-dialog'
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
  const [editorHeight, setEditorHeight] = useState(65)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const { logs, error, time, isRunning, run, clear } = useCodeExecution()
  const skipSaveRef = useRef(false)

  // add input
 const handleRun = (input?: string) => {
  run(activeFile.content, activeFile.language, input)
}

  const handleGenerateCode = (generatedCode: string) => {
    // no backticks
    if (generatedCode.includes('```')) {
      console.error('Generated code still contains markdown!')
      return
    }
    
    // Set flag to skip next auto-save
    skipSaveRef.current = true
    
    // insert code
    onContentChange(generatedCode)
    
    // Reset flag after a short delay
    setTimeout(() => {
      skipSaveRef.current = false
    }, 100)
    
    // Close dialog
    setShowGenerateDialog(false)
  }

  return (
    <>
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
            onGenerateCode={() => setShowGenerateDialog(true)}
            skipSaveRef={skipSaveRef}
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

      {/* Generate Code Dialog */}
      <GenerateCodeDialog
        isOpen={showGenerateDialog}
        onClose={() => setShowGenerateDialog(false)}
        onGenerate={handleGenerateCode}
        currentLanguage={activeFile.language}
      />
    </>
  )
}