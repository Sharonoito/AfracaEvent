import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

// For demo purposes, we'll use a hardcoded user ID
const DEMO_USER_ID = "demo-user-123"

export async function GET(request: NextRequest) {
  try {
    // Get pending connection requests for the current user
    const requests = await sql`
      SELECT 
        nc.id,
        nc.requester_id,
        nc.message,
        nc.created_at,
        u.name as requester_name,
        u.email as requester_email,
        up.company as requester_company,
        up.job_title as requester_job_title
      FROM networking_connections nc
      JOIN users_sync u ON nc.requester_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE nc.recipient_id = ${DEMO_USER_ID} AND nc.status = 'pending'
      ORDER BY nc.created_at DESC
    `

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("Fetch requests error:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}
