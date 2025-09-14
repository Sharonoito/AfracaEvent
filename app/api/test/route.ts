import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[v0] Test API called successfully")
    return NextResponse.json({
      success: true,
      message: "API is working",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Test API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Test API failed",
      },
      { status: 500 },
    )
  }
}
