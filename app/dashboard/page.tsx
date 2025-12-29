import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { db } from "@/src/db"
import { playground } from "@/src/db/schema"
import { eq, desc } from "drizzle-orm"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) return null

  let playgrounds = []
  
  try {
    playgrounds = await db
      .select()
      .from(playground)
      .where(eq(playground.userId, session.user.id))
      .orderBy(desc(playground.id))
    
    //console.log(playgrounds)
  } catch (error) {
    console.error(error)
  }

  return (
    <div>
      <h1>Your Playgrounds</h1>
      {playgrounds.length === 0 ? (
        <p>No code history yet. Create your first playground.</p>
      ) : (
        <ul>
          {playgrounds.map((pg) => (
            <li key={pg.id}>
              Playground ID: {pg.id}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}