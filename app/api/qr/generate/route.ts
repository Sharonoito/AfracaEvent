export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { nanoid } from "nanoid"

export async function POST(request: NextRequest) {
  try {
    const { userId, eventId } = await request.json()

    // Generate new QR token
    const qrToken = nanoid(32)

    // Create or update QR code
    await sql`
      INSERT INTO qr_codes (user_id, event_id, qr_token, created_at, expires_at)
      VALUES (${userId}, ${eventId}, ${qrToken}, NOW(), NOW() + INTERVAL '30 days')
      ON CONFLICT (user_id, event_id)
      DO UPDATE SET 
        qr_token = EXCLUDED.qr_token,
        created_at = NOW(),
        expires_at = NOW() + INTERVAL '30 days',
        is_used = false,
        used_at = null
    `

    const qrCodeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/qr/${qrToken}`

    return NextResponse.json({
      success: true,
      qrToken,
      qrCodeUrl,
    })
  } catch (error) {
    console.error("QR generation error:", error)
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 })
  }
}
