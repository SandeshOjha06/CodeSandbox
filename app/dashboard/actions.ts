"use server"

import { authOptions } from "@/auth"
import { playground } from "@/src/db/schema"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { db } from "@/src/db"
import {eq, and} from "drizzle-orm"

/**
 * Create a new playground for the currently authenticated user and navigate to its dashboard.
 *
 * Creates a new playground record owned by the session user with a default title
 * ("Untitled Playground N" where N is the next index) and default language "javascript",
 * then redirects the client to /dashboard/{newPlayground.id}.
 *
 * @throws Error - If there is no authenticated user session ("Unauthorized").
 */
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
    }).returning()



    redirect(`/dashboard/${newPlayground.id}`)
}
/**
 * Update fields of an existing playground owned by the authenticated user.
 *
 * Only the provided `title`, `code`, and `language` values are applied; `updatedAt` is set to the current date.
 *
 * @param id - The ID of the playground to update
 * @param title - New title to set, if provided
 * @param code - New code content to set, if provided
 * @param language - New language to set, if provided
 * @throws Error when there is no authenticated user ("Unauthorized")
 */
export async function updatePlayground({
  id,
  title,
  code,
  language,
}: {
  id: string
  title?: string
  code?: string
  language?: string
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  await db
    .update(playground)
    .set({
      ...(title !== undefined && { title }),
      ...(code !== undefined && { code }),
      ...(language !== undefined && { language }),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(playground.id, id),
        eq(playground.userId, session.user.id)
      )
    )
}