export const dynamic = "force-dynamic";
export const runtime = "edge";


import { sql } from "@/lib/database"

// For demo purposes, we'll use a hardcoded user ID
const DEMO_USER_ID = "demo-user-123"

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      controller.enqueue(data)

      // Set up polling for new notifications
      const interval = setInterval(async () => {
        try {
          // Check for new notifications in the last 30 seconds
          const newNotifications = await sql`
            SELECT *
            FROM notifications
            WHERE (user_id = ${DEMO_USER_ID} OR user_id IS NULL)
            AND created_at > NOW() - INTERVAL '30 seconds'
            ORDER BY created_at DESC
          `

          for (const notification of newNotifications) {
            const data = encoder.encode(`data: ${JSON.stringify(notification)}\n\n`)
            controller.enqueue(data)
          }
        } catch (error) {
          console.error("SSE polling error:", error)
        }
      }, 5000) // Poll every 5 seconds

      // Clean up on close
      return () => {
        clearInterval(interval)
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
