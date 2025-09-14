import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

// For demo purposes, we'll use a hardcoded user ID
const DEMO_USER_ID = "demo-user-123"

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const sessionId = Number.parseInt(params.sessionId)

    const questions = await sql`
      SELECT 
        qq.*,
        u.name as user_name,
        qa.answer,
        qa.answered_at,
        EXISTS(
          SELECT 1 FROM qa_upvotes quv 
          WHERE quv.question_id = qq.id AND quv.user_id = ${DEMO_USER_ID}
        ) as user_upvoted
      FROM qa_questions qq
      JOIN users_sync u ON qq.user_id = u.id
      LEFT JOIN qa_answers qa ON qq.id = qa.question_id
      WHERE qq.qa_session_id = ${sessionId} AND qq.is_approved = true
      ORDER BY qq.upvotes DESC, qq.created_at DESC
    `

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Fetch questions error:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const sessionId = Number.parseInt(params.sessionId)
    const { question } = await request.json()

    await sql`
      INSERT INTO qa_questions (qa_session_id, user_id, question, is_approved, created_at)
      VALUES (${sessionId}, ${DEMO_USER_ID}, ${question}, true, NOW())
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Submit question error:", error)
    return NextResponse.json({ error: "Failed to submit question" }, { status: 500 })
  }
}
