import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

// For demo purposes, we'll use a hardcoded user ID
const DEMO_USER_ID = "demo-user-123"

export async function POST(request: NextRequest, { params }: { params: { pollId: string } }) {
  try {
    const pollId = Number.parseInt(params.pollId)
    const { optionIds } = await request.json()

    // Check if user already voted
    const existingVotes = await sql`
      SELECT id FROM poll_votes
      WHERE poll_id = ${pollId} AND user_id = ${DEMO_USER_ID}
    `

    if (existingVotes.length > 0) {
      return NextResponse.json({ error: "Already voted" }, { status: 400 })
    }

    // Insert votes and update counts
    for (const optionId of optionIds) {
      await sql`
        INSERT INTO poll_votes (poll_id, option_id, user_id, created_at)
        VALUES (${pollId}, ${optionId}, ${DEMO_USER_ID}, NOW())
      `

      await sql`
        UPDATE poll_options
        SET vote_count = vote_count + 1
        WHERE id = ${optionId}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Vote error:", error)
    return NextResponse.json({ error: "Failed to submit vote" }, { status: 500 })
  }
}
