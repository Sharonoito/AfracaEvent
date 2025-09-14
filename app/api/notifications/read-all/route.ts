import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

// For demo purposes, we'll use a hardcoded user ID
const DEMO_USER_ID = "demo-user-123"

export async function POST(request: NextRequest) {
  try {
    await sql`
      UPDATE notifications
      SET is_read = true
      WHERE (user_id = ${DEMO_USER_ID} OR user_id IS NULL) AND is_read = false
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark all notifications read error:", error)
    return NextResponse.json({ error: "Failed to mark all notifications as read" }, { status: 500 })
  }
}
