import { sql } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SessionRegistrationButton } from "@/components/session-registration-button"

// For demo purposes, we'll use a hardcoded user ID
const DEMO_USER_ID = "demo-user-123"

export default async function SchedulePage() {
  try {
    // Get event details
    const eventData = await sql`
      SELECT * FROM events WHERE id = 1
    `

    // Get all sessions grouped by date
    const sessions = await sql`
      SELECT 
        es.*,
        COALESCE(sr.user_id IS NOT NULL, false) as is_registered,
        COUNT(sr2.id) as registered_count
      FROM event_sessions es
      LEFT JOIN session_registrations sr ON es.id = sr.session_id AND sr.user_id = ${DEMO_USER_ID}
      LEFT JOIN session_registrations sr2 ON es.id = sr2.session_id
      WHERE es.event_id = 1
      GROUP BY es.id, sr.user_id
      ORDER BY es.session_date, es.start_time
    `

    const event = eventData[0]

    // Group sessions by date
    const sessionsByDate = sessions.reduce((acc: any, session: any) => {
      const date = session.session_date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(session)
      return acc
    }, {})

    const eventDates = Object.keys(sessionsByDate).sort()

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Event Schedule</h1>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/networking">
                  <Button variant="ghost">Networking</Button>
                </Link>
                <Link href="/qa">
                  <Button variant="ghost">Q&A</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Event Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{event?.name}</h2>
            <div className="flex items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>
                  {event && (
                    <>
                      {new Date(event.start_date).toLocaleDateString()} -{" "}
                      {new Date(event.end_date).toLocaleDateString()}
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{event?.location}</span>
              </div>
            </div>
          </div>

          {/* Schedule Tabs */}
          <Tabs defaultValue={eventDates[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              {eventDates.map((date, index) => (
                <TabsTrigger key={date} value={date} className="flex flex-col">
                  <span className="font-medium">Day {index + 1}</span>
                  <span className="text-xs">
                    {new Date(date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {eventDates.map((date) => (
              <TabsContent key={date} value={date}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <Badge variant="outline">{sessionsByDate[date].length} sessions</Badge>
                  </div>

                  <div className="grid gap-6">
                    {sessionsByDate[date].map((session: any) => (
                      <Card key={session.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl mb-2">{session.title}</CardTitle>
                              <CardDescription className="text-base mb-3">{session.description}</CardDescription>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    {session.start_time} - {session.end_time}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{session.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>
                                    {session.registered_count}/{session.max_capacity || "∞"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {session.speaker && <Badge variant="secondary">{session.speaker}</Badge>}
                              <SessionRegistrationButton
                                sessionId={session.id}
                                isRegistered={session.is_registered}
                                isFull={session.max_capacity && session.registered_count >= session.max_capacity}
                              />
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Legend */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Schedule Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Registered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Full</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>Past Session</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Schedule page error:", error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>There was an error loading the schedule. Please try again.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }
}
