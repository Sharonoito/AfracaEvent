import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

// For demo purposes, we'll use a hardcoded user ID
const DEMO_USER_ID = "demo-user-123"

export async function GET(request: NextRequest, { params }: { params: { pollId: string } }) {
  try {
    const pollId = Number.parseInt(params.pollId)

    // Get poll options with vote counts
    const options = await sql`
      SELECT 
        po.*,
        ROUND((po.vote_count::float / GREATEST(SUM(po2.vote_count) OVER(), 1)) * 100, 1) as percentage,
        EXISTS(
          SELECT 1 FROM poll_votes pv 
          WHERE pv.option_id = po.id AND pv.user_id = ${DEMO_USER_ID}
        ) as user_voted
      FROM poll_options po
      LEFT JOIN poll_options po2 ON po.poll_id = po2.poll_id
      WHERE po.poll_id = ${pollId}
      GROUP BY po.id, po.option_text, po.vote_count
      ORDER BY po.id
    `

    // Check if user has voted
    const userVotes = await sql`
      SELECT option_id FROM poll_votes
      WHERE poll_id = ${pollId} AND user_id = ${DEMO_USER_ID}
    `

    const hasVoted = userVotes.length > 0

    return NextResponse.json({
      options,
      hasVoted,
      userVotes: userVotes.map((v) => v.option_id),
    })
  } catch (error) {
    console.error("Fetch poll error:", error)
    return NextResponse.json({ error: "Failed to fetch poll" }, { status: 500 })
  }
}
