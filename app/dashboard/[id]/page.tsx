import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { authOptions } from "@/auth"
import { db } from "@/src/db"
import { playground } from "@/src/db/schema"
import {eq} from "drizzle-orm" 
import Editor from "./editor"
import DeleteButton from "./delete-btn"

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

   
  return (
    <div className="flex h-full flex-col gap-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-200">
         
        </h1>

        <DeleteButton id={pg.id} />
      </div>

      {/* EDITOR */}
      <Editor playground={pg} />

    </div>
  )
}