"use server"

import { authOptions } from "@/auth"
import { playground } from "@/src/db/schema"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { db } from "@/src/db"
import {eq} from "drizzle-orm"

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