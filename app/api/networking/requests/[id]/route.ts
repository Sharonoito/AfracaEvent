import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const requestId = Number.parseInt(params.id)
    const { action } = await request.json()

    const status = action === "accept" ? "accepted" : "declined"

    await sql`
      UPDATE networking_connections
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${requestId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Handle request error:", error)
    return NextResponse.json({ error: "Failed to handle request" }, { status: 500 })
  }
}
