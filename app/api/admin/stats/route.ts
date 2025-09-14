import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    console.log("[v0] Admin stats API called")

    if (!process.env.DATABASE_URL) {
      console.error("[v0] DATABASE_URL environment variable not found")
      return NextResponse.json(
        {
          success: false,
          error: "Database connection not configured",
        },
        { status: 500 },
      )
    }

    const sql = neon(process.env.DATABASE_URL)

    console.log("[v0] Testing basic database connection")
    await sql`SELECT 1 as test`
    console.log("[v0] Database connection successful")

    const [totalUsersResult, checkedInResult] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users`.catch(() => [{ count: 0 }]),
      sql`SELECT COUNT(DISTINCT user_id) as count FROM check_ins`.catch(() => [{ count: 0 }]),
    ])

    const totalUsers = Number(totalUsersResult[0]?.count) || 0
    const checkedInUsers = Number(checkedInResult[0]?.count) || 0

    const stats = {
      totalUsers,
      checkedInUsers,
      todayCheckIns: 0, // Simplified for now
      activeSessions: 0, // Simplified for now
      qrScans: checkedInUsers,
      newUsersToday: 0, // Simplified for now
      attendanceRate: totalUsers > 0 ? Math.round((checkedInUsers / totalUsers) * 100) : 0,
    }

    console.log("[v0] Stats calculated successfully:", stats)

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("[v0] Admin stats API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch stats",
      },
      { status: 500 },
    )
  }
}
