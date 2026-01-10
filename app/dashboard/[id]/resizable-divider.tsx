'use client'

interface ResizableDividerProps {
  onDrag: (percentage: number) => void
}

export default function ResizableDivider({ onDrag }: ResizableDividerProps) {
  const handleMouseDown = () => {
    const container = document.getElementById('editor-split-container')
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const newPos = ((e.clientY - rect.top) / rect.height) * 100

      // Constrain between 30% and 80%
      if (newPos > 30 && newPos < 80) {
        onDrag(newPos)
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      className="h-1 bg-gray-700 hover:bg-blue-500 cursor-row-resize transition"
      title="Drag to resize"
    />
  )
}