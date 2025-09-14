import { sql } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { NotificationCenter } from "@/components/notification-center"
import { Calendar, MapPin, Users, Download } from "lucide-react"
import Link from "next/link"

// For demo purposes, we'll use a hardcoded user ID
// In a real app, this would come from authentication
const DEMO_USER_ID = "demo-user-123"

export default async function DashboardPage() {
  try {
    // Get user's QR code and event details
    const userQRData = await sql`
      SELECT 
        qc.qr_token,
        e.name as event_name,
        e.description,
        e.start_date,
        e.end_date,
        e.location,
        e.website_url,
        u.name as user_name,
        u.email
      FROM qr_codes qc
      JOIN events e ON qc.event_id = e.id
      JOIN users_sync u ON qc.user_id = u.id
      WHERE qc.user_id = ${DEMO_USER_ID}
      LIMIT 1
    `

    // Get user's registered sessions
    const registeredSessions = await sql`
      SELECT 
        es.id,
        es.title,
        es.speaker,
        es.session_date,
        es.start_time,
        es.end_time,
        es.location,
        sr.attended
      FROM session_registrations sr
      JOIN event_sessions es ON sr.session_id = es.id
      WHERE sr.user_id = ${DEMO_USER_ID}
      ORDER BY es.session_date, es.start_time
    `

    // Get upcoming sessions (next 3 days)
    const upcomingSessions = await sql`
      SELECT 
        id,
        title,
        speaker,
        session_date,
        start_time,
        end_time,
        location,
        max_capacity
      FROM event_sessions
      WHERE session_date >= CURRENT_DATE AND session_date <= CURRENT_DATE + INTERVAL '3 days'
      ORDER BY session_date, start_time
      LIMIT 5
    `

    const qrData = userQRData[0]
    const qrCodeUrl = qrData
      ? `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/qr/${qrData.qr_token}`
      : ""

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-gray-900">
                  EventHub
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/schedule">
                  <Button variant="ghost">Schedule</Button>
                </Link>
                <Link href="/networking">
                  <Button variant="ghost">Networking</Button>
                </Link>
                <NotificationCenter />
                <Button variant="ghost">Sign Out</Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {qrData?.user_name || "Attendee"}!</h1>
            <p className="text-gray-600">Here's your event dashboard for {qrData?.event_name}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Event Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold">{qrData?.event_name}</h3>
                      <p className="text-gray-600 text-sm">{qrData?.description}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {qrData && (
                          <>
                            {new Date(qrData.start_date).toLocaleDateString()} -{" "}
                            {new Date(qrData.end_date).toLocaleDateString()}
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {qrData?.location}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <CardDescription>Next sessions in the event schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <h4 className="font-medium">{session.title}</h4>
                        <p className="text-sm text-gray-600">by {session.speaker}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>{new Date(session.session_date).toLocaleDateString()}</span>
                          <span>
                            {session.start_time} - {session.end_time}
                          </span>
                          <span>{session.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/schedule" className="block mt-4">
                    <Button variant="outline" className="w-full bg-transparent">
                      View Full Schedule
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* My Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle>My Registered Sessions</CardTitle>
                  <CardDescription>Sessions you've registered for</CardDescription>
                </CardHeader>
                <CardContent>
                  {registeredSessions.length > 0 ? (
                    <div className="space-y-3">
                      {registeredSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{session.title}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(session.session_date).toLocaleDateString()} at {session.start_time}
                            </p>
                          </div>
                          {session.attended && <span className="text-green-600 text-sm font-medium">Attended</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">You haven't registered for any sessions yet.</p>
                      <Link href="/schedule">
                        <Button>Browse Sessions</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - QR Code */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your QR Code</CardTitle>
                  <CardDescription>Use this QR code for event check-in</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  {qrCodeUrl && (
                    <>
                      <div className="bg-white p-4 rounded-lg inline-block mb-4">
                        <QRCodeGenerator value={qrCodeUrl} size={200} />
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Scan this code at the event entrance or show it to event staff
                      </p>
                      <Button variant="outline" className="w-full bg-transparent">
                        <Download className="h-4 w-4 mr-2" />
                        Download QR Code
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/schedule" className="block">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Schedule
                    </Button>
                  </Link>
                  <Link href="/networking" className="block">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Users className="h-4 w-4 mr-2" />
                      Find Attendees
                    </Button>
                  </Link>
                  <Link href="/qa" className="block">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Users className="h-4 w-4 mr-2" />
                      Q&A Sessions
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Dashboard error:", error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>There was an error loading your dashboard. Please try again.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }
}
