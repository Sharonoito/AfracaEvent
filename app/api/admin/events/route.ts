import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("[v0] Fetching events data")

    const events = await sql`
      SELECT 
        e.*,
        COUNT(DISTINCT u.id) as attendee_count,
        COUNT(DISTINCT es.id) as session_count
      FROM events e
      LEFT JOIN users u ON true  -- All users are potential attendees
      LEFT JOIN event_sessions es ON e.id = es.event_id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `

    console.log("[v0] Events data fetched successfully")

    return NextResponse.json({
      events: events.map((event) => ({
        id: event.id,
        title: event.name,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location,
        status: new Date(event.start_date) > new Date() ? "upcoming" : "active",
        attendees: Number.parseInt(event.attendee_count || 0),
        sessions: Number.parseInt(event.session_count || 0),
      })),
    })
  } catch (error) {
    console.error("[v0] Events API error:", error)
    return NextResponse.json({ error: "Failed to fetch events data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, startDate, endDate, location } = await request.json()

    const result = await sql`
      INSERT INTO events (name, description, start_date, end_date, location, created_at, updated_at)
      VALUES (${title}, ${description}, ${startDate}, ${endDate}, ${location}, NOW(), NOW())
      RETURNING *
    `

    return NextResponse.json({ success: true, event: result[0] })
  } catch (error) {
    console.error("[v0] Create event error:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
