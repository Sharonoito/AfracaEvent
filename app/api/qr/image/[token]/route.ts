import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import QRCode from "qrcode"

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    console.log('token accepted...' + token)

    // Verify the QR token exists
    const qrRecord = await sql`
      SELECT user_id FROM qr_codes WHERE qr_token = ${token}
    `

    if (qrRecord.length === 0) {
      return new NextResponse("QR code not found", { status: 404 })
    }

    console.log('Record',qrRecord)

    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3002"
        : process.env.NEXT_PUBLIC_APP_URL || "https://your-deployed-app.vercel.app"

    const qrUrl = `${baseUrl}/qr/${token}`

    try {
      console.log('Buffer attempt')
      // Try toBuffer first (works in Node.js server environment)
      const qrCodeBuffer = await QRCode.toBuffer(qrUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        type: "png",
      })

      return new NextResponse(new Uint8Array(qrCodeBuffer), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        },
      })
    } catch (bufferError) {
      console.log('Buffer fallback attempt')

      // Fallback to toDataURL if toBuffer fails
      const qrCodeDataURL = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })

      // Convert data URL to buffer
      const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, "")
      const buffer = Buffer.from(base64Data, "base64")

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        },
      })
    }
  } catch (error) {
    console.error("QR image generation error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
