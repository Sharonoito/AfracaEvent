import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const notificationId = Number.parseInt(params.id)

    await sql`
      UPDATE notifications
      SET is_read = true
      WHERE id = ${notificationId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark notification read error:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}
