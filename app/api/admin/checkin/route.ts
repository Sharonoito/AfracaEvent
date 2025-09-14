import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { userId, eventId = 1 } = await request.json()

    console.log("[v0] Manual check-in requested for user:", userId)

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Check if user exists
    const userResult = await sql`SELECT id, name, email FROM users WHERE id = ${userId}`
    if (userResult.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Check if user is already checked in
    const existingCheckIn = await sql`
      SELECT id FROM check_ins WHERE user_id = ${userId} AND event_id = ${eventId}
    `

    if (existingCheckIn.length > 0) {
      return NextResponse.json({ success: false, error: "User is already checked in" }, { status: 400 })
    }

    // Get or create QR code for this user
    const qrCodeResult = await sql`
      SELECT id FROM qr_codes WHERE user_id = ${userId} AND event_id = ${eventId}
    `

    let qrCodeId
    if (qrCodeResult.length === 0) {
      // Create new QR code
      const newQrCode = await sql`
        INSERT INTO qr_codes (user_id, event_id, qr_token, created_at, expires_at)
        VALUES (${userId}, ${eventId}, ${`manual-${Date.now()}`}, NOW(), NOW() + INTERVAL '30 days')
        RETURNING id
      `
      qrCodeId = newQrCode[0].id
    } else {
      qrCodeId = qrCodeResult[0].id
    }

    // Create check-in record
    const checkInResult = await sql`
      INSERT INTO check_ins (user_id, event_id, qr_code_id, checked_in_at, ip_address, user_agent)
      VALUES (${userId}, ${eventId}, ${qrCodeId}, NOW(), '127.0.0.1', 'Admin Manual Check-in')
      RETURNING id, checked_in_at
    `

    console.log("[v0] Manual check-in successful for user:", userId)

    return NextResponse.json({
      success: true,
      checkIn: {
        id: checkInResult[0].id,
        userId,
        checkedInAt: checkInResult[0].checked_in_at,
        method: "manual",
      },
    })
  } catch (error) {
    console.error("[v0] Manual check-in error:", error)
    return NextResponse.json({ success: false, error: "Failed to check in user" }, { status: 500 })
  }
}
