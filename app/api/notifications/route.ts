import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

// For demo purposes, we'll use a hardcoded user ID
const DEMO_USER_ID = "demo-user-123"

export async function GET(request: NextRequest) {
  try {
    // Get user notifications
    const notifications = await sql`
      SELECT 
        n.*,
        es.title as session_title
      FROM notifications n
      LEFT JOIN event_sessions es ON n.session_id = es.id
      WHERE n.user_id = ${DEMO_USER_ID} OR n.user_id IS NULL
      ORDER BY n.created_at DESC
      LIMIT 50
    `

    // Get unread count
    const unreadResult = await sql`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE (user_id = ${DEMO_USER_ID} OR user_id IS NULL) AND is_read = false
    `

    const unreadCount = Number.parseInt(unreadResult[0].count)

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Notifications fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
