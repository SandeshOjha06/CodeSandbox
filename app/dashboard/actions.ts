"use server"

import { authOptions } from "@/auth"
import { playground } from "@/src/db/schema"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { db } from "@/src/db"
import {eq, and} from "drizzle-orm"
import { FileMap } from "@/types/files"


export default async function addPlayground(){
    const session = await getServerSession(authOptions)

    if(!session?.user?.id){
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
        files: {},
        activeFileId: null
    }).returning()



    redirect(`/dashboard/${newPlayground.id}`)
}
export async function updatePlayground({
  id,
  title,
  files,
  activeFileId,
  // code,
  // language,
}: {
  id: string
  title?: string
  files?: FileMap
  activeFileId: string | null
  // code?: string
  // language?: string
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  await db
    .update(playground)
    .set({
      ...(title !== undefined && { title }),
      // ...(code !== undefined && { code }),
      // ...(language !== undefined && { language }),
      ...(files !== undefined && {files: JSON.stringify(files)}),
      ...(activeFileId !==undefined && { activeFileId }),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(playground.id, id),
        eq(playground.userId, session.user.id)
      )
    )
}

export async function deletePlayground(id:string){
    const session = await getServerSession(authOptions)
    if(!session?.user?.id){
        throw new Error("Unauthorized")
    }

    await db
    .delete(playground)
    .where(
        and(
            eq(playground.id,id),
            eq(playground.userId,session.user.id)
        )
    )

    redirect("/dashboard")
}