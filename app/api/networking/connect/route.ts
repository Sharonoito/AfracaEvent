import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

// For demo purposes, we'll use a hardcoded user ID
const DEMO_USER_ID = "demo-user-123"

export async function POST(request: NextRequest) {
  try {
    const { recipientId, message } = await request.json()

    // Check if connection already exists
    const existingConnection = await sql`
      SELECT id FROM networking_connections
      WHERE (requester_id = ${DEMO_USER_ID} AND recipient_id = ${recipientId})
      OR (requester_id = ${recipientId} AND recipient_id = ${DEMO_USER_ID})
    `

    if (existingConnection.length > 0) {
      return NextResponse.json({ error: "Connection already exists" }, { status: 400 })
    }

    // Create connection request
    await sql`
      INSERT INTO networking_connections (requester_id, recipient_id, message, status, created_at, updated_at)
      VALUES (${DEMO_USER_ID}, ${recipientId}, ${message}, 'pending', NOW(), NOW())
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Connection request error:", error)
    return NextResponse.json({ error: "Failed to send connection request" }, { status: 500 })
  }
}
