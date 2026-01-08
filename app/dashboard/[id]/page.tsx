import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { authOptions } from "@/auth"
import { db } from "@/src/db"
import { playground } from "@/src/db/schema"
import { eq } from "drizzle-orm"
import Editor from "./editor"
import EditableTitle from "./edit-title"
import DeleteButton from "./delete-btn"
import FileExplorer from "./file-explorer"

export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) notFound()
  
  const [pg] = await db
    .select()
    .from(playground)
    .where(eq(playground.id, id))
  
  if (!pg) notFound()
  if (pg.userId !== session.user.id) notFound()

  return (
    <div className="flex h-full gap-0">
      {/* FILE EXPLORER (Left Sidebar) */}
      <FileExplorer playground={pg} playgroundId={pg.id} />

      {/* MAIN CONTENT (Right Side) */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Header: Title + Delete Button */}
        <div className="flex items-center justify-between">
          <EditableTitle id={pg.id} initialTitle={pg.title} />
          <DeleteButton id={pg.id} />
        </div>

        {/* Editor */}
        <Editor playground={pg} />
      </div>
    </div>
  )
}