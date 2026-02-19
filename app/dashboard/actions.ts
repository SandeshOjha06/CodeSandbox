"use server"

import { authOptions } from "@/auth"
import { playground } from "@/src/db/schema"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { db } from "@/src/db"
import { eq, and } from "drizzle-orm"
import { FileMap } from "@/types/files"

export default async function addPlayground() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const existing = await db
    .select()
    .from(playground)
    .where(eq(playground.userId, session.user.id))

  const nxt = existing.length + 1

  const [newPlayground] = await db
    .insert(playground)
    .values({
      userId: session.user.id,
      title: `Untitled Playground ${nxt}`,
      language: "javascript",
      code: "",
      files: "{}",
      activeFileId: null,
    })
    .returning()

  redirect(`/dashboard/${newPlayground.id}`)
}

export async function updatePlayground({
  id,
  title,
  files,
  activeFileId,
}: {
  id: string
  title?: string
  files?: FileMap
  activeFileId?: string | null
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Build update object dynamically
  const updateData: any = {
    updatedAt: new Date(),
  }

  if (title !== undefined) {
    updateData.title = title
  }

  if (files !== undefined) {
    updateData.files = JSON.stringify(files)
  }

  if (activeFileId !== undefined) {
    updateData.activeFileId = activeFileId
  }

  const result = await db
    .update(playground)
    .set(updateData)
    .where(
      and(
        eq(playground.id, id),
        eq(playground.userId, session.user.id)
      )
    )
    .returning()

  return result[0]
}

export async function deletePlayground(id: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  await db
    .delete(playground)
    .where(
      and(
        eq(playground.id, id),
        eq(playground.userId, session.user.id)
      )
    )

  redirect("/dashboard")
}