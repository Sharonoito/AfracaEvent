import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Admin users API called")

    if (!process.env.DATABASE_URL) {
      console.error("[v0] DATABASE_URL not found")
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 })
    }

    const sql = neon(process.env.DATABASE_URL)

    console.log("[v0] Fetching users from database")
    const users = await sql`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.created_at
      FROM users u
      ORDER BY u.created_at DESC
      LIMIT 100
    `

    console.log("[v0] Found users:", users.length)

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name || "Unknown",
      email: user.email,
      company: "Not specified",
      role: "Attendee",
      status: "active",
      checkedIn: false,
      registrationDate: user.created_at,
    }))

    console.log("[v0] Users formatted successfully")

    return NextResponse.json({
      success: true,
      users: formattedUsers,
    })
  } catch (error) {
    console.error("[v0] Admin users API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch users",
      },
      { status: 500 },
    )
  }
}
