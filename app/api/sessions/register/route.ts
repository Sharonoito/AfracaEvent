import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

// For demo purposes, we'll use a hardcoded user ID
const DEMO_USER_ID = "demo-user-123"

export async function POST(request: NextRequest) {
  try {
    const { sessionId, action } = await request.json()

    if (action === "register") {
      // Check if session is full
      const sessionInfo = await sql`
        SELECT 
          es.max_capacity,
          COUNT(sr.id) as registered_count
        FROM event_sessions es
        LEFT JOIN session_registrations sr ON es.id = sr.session_id
        WHERE es.id = ${sessionId}
        GROUP BY es.id, es.max_capacity
      `

      const session = sessionInfo[0]
      if (session.max_capacity && session.registered_count >= session.max_capacity) {
        return NextResponse.json({ error: "Session is full" }, { status: 400 })
      }

      // Register user for session
      await sql`
        INSERT INTO session_registrations (user_id, session_id, registered_at)
        VALUES (${DEMO_USER_ID}, ${sessionId}, NOW())
        ON CONFLICT (user_id, session_id) DO NOTHING
      `
    } else if (action === "unregister") {
      // Unregister user from session
      await sql`
        DELETE FROM session_registrations 
        WHERE user_id = ${DEMO_USER_ID} AND session_id = ${sessionId}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Session registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
