import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Check if user exists
    const user = await sql`
      SELECT id, name FROM users_sync WHERE email = ${email}
    `

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found. Please register first." }, { status: 404 })
    }

    // TODO: Generate secure login token and send email
    // This would integrate with an email service to send a magic link

    return NextResponse.json({
      success: true,
      message: "Login link sent to your email",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
