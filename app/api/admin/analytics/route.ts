import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("[v0] Starting analytics data fetch")

    // Get total users
    const totalUsersResult = await sql`SELECT COUNT(*) as count FROM users`
    const totalUsers = Number.parseInt(totalUsersResult[0].count)

    // Get total check-ins today
    const todayCheckinsResult = await sql`
      SELECT COUNT(*) as count 
      FROM check_ins 
      WHERE DATE(checked_in_at) = CURRENT_DATE
    `
    const todayCheckins = Number.parseInt(todayCheckinsResult[0].count)

    // Get total QR scans
    const qrScansResult = await sql`SELECT COUNT(*) as count FROM check_ins`
    const totalQrScans = Number.parseInt(qrScansResult[0].count)

    // Get session analytics
    const sessionAnalytics = await sql`
      SELECT 
        es.title,
        es.max_capacity,
        COUNT(sr.id) as registered_count,
        COUNT(CASE WHEN sr.attended = true THEN 1 END) as attended_count
      FROM event_sessions es
      LEFT JOIN session_registrations sr ON es.id = sr.session_id
      GROUP BY es.id, es.title, es.max_capacity
      ORDER BY registered_count DESC
      LIMIT 5
    `

    // Get networking connections
    const networkingResult = await sql`SELECT COUNT(*) as count FROM networking_connections`
    const networkingConnections = Number.parseInt(networkingResult[0].count)

    // Get poll responses
    const pollResponsesResult = await sql`SELECT COUNT(*) as count FROM poll_votes`
    const pollResponses = Number.parseInt(pollResponsesResult[0].count)

    // Get Q&A questions
    const qaQuestionsResult = await sql`SELECT COUNT(*) as count FROM qa_questions`
    const qaQuestions = Number.parseInt(qaQuestionsResult[0].count)

    // Get popular interests
    const popularInterests = await sql`
      SELECT 
        ui.name,
        COUNT(uim.user_id) as user_count
      FROM user_interests ui
      LEFT JOIN user_interest_mapping uim ON ui.id = uim.interest_id
      GROUP BY ui.id, ui.name
      ORDER BY user_count DESC
      LIMIT 6
    `

    console.log("[v0] Analytics data fetched successfully")

    return NextResponse.json({
      totalAttendees: totalUsers,
      checkedInToday: todayCheckins,
      qrScans: totalQrScans,
      networkingConnections,
      pollResponses,
      qaQuestions,
      sessionAnalytics: sessionAnalytics.map((session) => ({
        name: session.title,
        attendees: Number.parseInt(session.attended_count || 0),
        capacity: session.max_capacity || 100,
        percentage: session.max_capacity
          ? Math.round((Number.parseInt(session.attended_count || 0) / session.max_capacity) * 100)
          : 0,
      })),
      popularInterests: popularInterests.map((interest) => ({
        interest: interest.name,
        count: Number.parseInt(interest.user_count || 0),
        percentage: totalUsers > 0 ? Math.round((Number.parseInt(interest.user_count || 0) / totalUsers) * 100) : 0,
      })),
    })
  } catch (error) {
    console.error("[v0] Analytics API error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
