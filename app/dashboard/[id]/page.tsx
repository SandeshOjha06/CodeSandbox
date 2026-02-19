import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { authOptions } from "@/auth"
import { db } from "@/src/db"
import { playground } from "@/src/db/schema"
import { eq } from "drizzle-orm"
import EditorLayout from "./editor-layout"
import { PlaygroundWithFiles } from "@/types/files"

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
  if (pg.userId !== (session.user.id as string)) notFound()

  const parsed: PlaygroundWithFiles = {
    id: pg.id,
    userId: pg.userId,
    title: pg.title,
    activeFileId: pg.activeFileId,
    files: pg.files ? (typeof pg.files === 'string' ? JSON.parse(pg.files) : pg.files) : {},
    createdAt: pg.createdAt ?? new Date(),
    updatedAt: pg.updatedAt ?? new Date(),
  }

  return (
    <EditorLayout playground={parsed} playgroundId={pg.id} />
  )
}