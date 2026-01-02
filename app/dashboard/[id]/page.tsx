import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { authOptions } from "@/auth"
import { db } from "@/src/db"
import { playground } from "@/src/db/schema"
import {eq} from "drizzle-orm" 
import Editor from "./editor"

export default async function PlaygroundPage({
  params,
}: {
    params: Promise<{id:string}>
})
{
    const { id } = await params

    const session = await getServerSession(authOptions)

    if (!session?.user?.id){
        notFound()
    }

    const [pg] = await db.select()
    .from(playground)
    .where(eq(playground.id, id))

    if(!pg) notFound()
    if(pg.userId != session.user.id) notFound()

    return(
       <Editor playground={pg} />
    )
}