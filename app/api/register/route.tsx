export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Registration API called")

    const body = await request.json()
    const { name, email, company, jobTitle, bio, linkedinUrl, twitterUrl, selectedInterests } = body

    console.log(`[v0] Registration attempt for: ${email}`)

    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    let userId: string

    if (existingUsers.length > 0) {
      // Update existing user in users table
      userId = existingUsers[0].id
      console.log(`[v0] User exists, updating: ${userId}`)

      await sql`
        UPDATE users 
        SET name = ${name}, updated_at = NOW()
        WHERE id = ${userId}
      `
    } else {
      const newUsers = await sql`
        INSERT INTO users (id, name, email, created_at, updated_at)
        VALUES (gen_random_uuid(), ${name}, ${email}, NOW(), NOW())
        RETURNING id
      `
      userId = newUsers[0].id
      console.log(`[v0] New user created: ${userId}`)
    }

    // Create or update user profile with company and other details
    await sql`
      INSERT INTO user_profiles (user_id, bio, company, job_title, linkedin_url, twitter_url)
      VALUES (${userId}, ${bio}, ${company}, ${jobTitle}, ${linkedinUrl}, ${twitterUrl})
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        bio = EXCLUDED.bio,
        company = EXCLUDED.company,
        job_title = EXCLUDED.job_title,
        linkedin_url = EXCLUDED.linkedin_url,
        twitter_url = EXCLUDED.twitter_url,
        updated_at = NOW()
    `
    console.log("[v0] User profile created/updated successfully")

    // Handle interests
    if (selectedInterests && selectedInterests.length > 0) {
      await sql`DELETE FROM user_interest_mapping WHERE user_id = ${userId}`

      for (const interestName of selectedInterests) {
        // Get or create interest
        const interest = await sql`
          INSERT INTO user_interests (name) VALUES (${interestName})
          ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `

        // Map user to interest
        await sql`
          INSERT INTO user_interest_mapping (user_id, interest_id)
          VALUES (${userId}, ${interest[0].id})
          ON CONFLICT (user_id, interest_id) DO NOTHING
        `
      }
      console.log(`[v0] Updated ${selectedInterests.length} interests`)
    }

    const qrToken = `${userId}_${Date.now()}`
    const eventId = 1 // Default event ID
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    // First check if QR code exists for this user
    const existingQR = await sql`
      SELECT qr_token FROM qr_codes WHERE user_id = ${userId}
    `

    if (existingQR.length > 0) {
      // Update existing QR code
      await sql`
        UPDATE qr_codes 
        SET qr_token = ${qrToken}, event_id = ${eventId}, expires_at = ${expiresAt}, created_at = NOW()
        WHERE user_id = ${userId}
      `
    } else {
      // Insert new QR code
      await sql`
        INSERT INTO qr_codes (user_id, qr_token, event_id, expires_at, created_at)
        VALUES (${userId}, ${qrToken}, ${eventId}, ${expiresAt}, NOW())
      `
    }
    console.log("[v0] QR code generated successfully")

    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.NEXT_PUBLIC_APP_URL || "https://afraca-event.vercel.app"

    const qrUrl = `${baseUrl}/qr/${qrToken}`
    const qrImageUrl = `${baseUrl}/api/qr/image/${qrToken}`

    // Send email with QR code as external image URL for better email client compatibility
    try {
      const { data, error: emailError } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: [email],
        subject: "🎉 Welcome to Tech Innovation Summit 2024 - Your QR Code Inside!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Tech Innovation Summit 2024</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  🚀 Tech Innovation Summit 2024
                </h1>
                <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">
                  March 15-16, 2024 • Tech Convention Center
                </p>
              </div>

              <!-- Main Content -->
              <div style="padding: 40px 30px;">
                <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                  Welcome, ${name}! 👋
                </h2>
                
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                  Thank you for registering for the Tech Innovation Summit 2024! We're thrilled to have you join us for two days of cutting-edge technology, networking, and innovation.
                </p>

                <!-- QR Code Section -->
                <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 16px; padding: 30px; text-align: center; margin: 30px 0; border: 2px solid #e2e8f0;">
                  <h3 style="color: #2d3748; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
                    📱 Your Event QR Code
                  </h3>
                  
                  <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                    <!-- Use external image URL instead of base64 for better email client compatibility -->
                    <img src="${qrImageUrl}" alt="Your Event QR Code" style="display: block; width: 250px; height: 250px; margin: 0 auto;" />
                  </div>
                  
                  <p style="color: #718096; font-size: 14px; margin: 20px 0 0 0; font-weight: 500;">
                    💡 Save this QR code to your phone and show it at the entrance for instant check-in
                  </p>
                  
                  <p style="color: #a0aec0; font-size: 12px; margin: 15px 0 0 0;">
                    Can't see the QR code? 
                    <a href="${qrUrl}" style="color: #3182ce; text-decoration: none;">View it online here</a>
                  </p>
                </div>

                <!-- Event Details -->
                <div style="background-color: #ebf8ff; border-left: 4px solid #3182ce; padding: 25px; border-radius: 8px; margin: 30px 0;">
                  <h3 style="color: #2c5282; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                    📅 Event Details
                  </h3>
                  <div style="color: #2d3748; line-height: 1.8;">
                    <p style="margin: 8px 0;"><strong>📍 Location:</strong> Tech Convention Center, Downtown</p>
                    <p style="margin: 8px 0;"><strong>🕘 Time:</strong> 9:00 AM - 6:00 PM (both days)</p>
                    <p style="margin: 8px 0;"><strong>🎫 Registration:</strong> Opens at 8:30 AM</p>
                    <p style="margin: 8px 0;"><strong>🍽️ Lunch:</strong> Provided on both days</p>
                  </div>
                </div>

                <!-- What to Expect -->
                <div style="margin: 30px 0;">
                  <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                    🌟 What to Expect
                  </h3>
                  <ul style="color: #4a5568; line-height: 1.8; padding-left: 20px;">
                    <li>Keynote speeches from industry leaders</li>
                    <li>Interactive workshops and breakout sessions</li>
                    <li>Networking opportunities with 500+ attendees</li>
                    <li>Exhibition showcasing the latest tech innovations</li>
                    <li>Panel discussions on AI, blockchain, and future tech</li>
                  </ul>
                </div>

                <!-- Call to Action -->
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${qrUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                    🔗  View the website to connect
                  </a>
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 14px; margin: 0 0 10px 0;">
                  Questions? Contact us at <a href="mailto:support@techinnovationsummit.com" style="color: #3182ce;">support@techinnovationsummit.com</a>
                </p>
                <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                  Tech Innovation Summit 2024 • Powered by Innovation
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      })

      if (emailError) {
        console.log("[v0] Email sending failed:", emailError)
      } else {
        console.log("[v0] Email sent successfully")
      }
    } catch (emailError) {
      console.log("[v0] Email sending error:", emailError)
    }

    console.log(`[v0] Registration successful for: ${email}`)
    console.log(`[v0] QR Generated for: ${qrImageUrl}`)

    return NextResponse.json({
      success: true,
      message: "Registration successful! Check your email for your QR code.",
      qrToken,
    })
  } catch (error) {
    console.log("[v0] Registration error:", error)
    return NextResponse.json({ success: false, message: "Registration failed. Please try again." }, { status: 500 })
  }
}
