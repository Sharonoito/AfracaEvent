"use client"
export const dynamic = "force-dynamic";


import { sql } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Users, Search, ArrowLeft, Building, Briefcase } from "lucide-react"
import Link from "next/link"
import { AttendeeCard } from "@/components/attendee-card"
import { ConnectionRequests } from "@/components/connection-requests"

// For demo purposes, we'll use a hardcoded user ID
const DEMO_USER_ID = "demo-user-123"

export default async function NetworkingPage() {
  try {
    // Get current user's interests for matching
    const userInterests = await sql`
      SELECT ui.name
      FROM user_interest_mapping uim
      JOIN user_interests ui ON uim.interest_id = ui.id
      WHERE uim.user_id = ${DEMO_USER_ID}
    `

    const userInterestNames = userInterests.map((interest) => interest.name)

    // Get suggested attendees based on shared interests
    const suggestedAttendees = await sql`
      SELECT DISTINCT
        u.id,
        u.name,
        u.email,
        up.bio,
        up.company,
        up.job_title,
        up.linkedin_url,
        up.twitter_url,
        ARRAY_AGG(DISTINCT ui.name) as interests,
        COUNT(DISTINCT uim.interest_id) as shared_interests_count
      FROM users_sync u
      JOIN user_profiles up ON u.id = up.user_id
      JOIN user_interest_mapping uim ON u.id = uim.user_id
      JOIN user_interests ui ON uim.interest_id = ui.id
      WHERE u.id != ${DEMO_USER_ID}
      AND ui.name = ANY(${userInterestNames})
      GROUP BY u.id, u.name, u.email, up.bio, up.company, up.job_title, up.linkedin_url, up.twitter_url
      ORDER BY shared_interests_count DESC, u.name
      LIMIT 20
    `

    // Get all attendees for browsing
    const allAttendees = await sql`
      SELECT 
        u.id,
        u.name,
        u.email,
        up.bio,
        up.company,
        up.job_title,
        up.linkedin_url,
        up.twitter_url,
        ARRAY_AGG(DISTINCT ui.name) as interests
      FROM users_sync u
      JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN user_interest_mapping uim ON u.id = uim.user_id
      LEFT JOIN user_interests ui ON uim.interest_id = ui.id
      WHERE u.id != ${DEMO_USER_ID}
      GROUP BY u.id, u.name, u.email, up.bio, up.company, up.job_title, up.linkedin_url, up.twitter_url
      ORDER BY u.name
      LIMIT 50
    `

    // Get existing connections
    const connections = await sql`
      SELECT 
        u.id,
        u.name,
        u.email,
        up.company,
        up.job_title,
        nc.status,
        nc.created_at
      FROM networking_connections nc
      JOIN users_sync u ON (
        CASE 
          WHEN nc.requester_id = ${DEMO_USER_ID} THEN u.id = nc.recipient_id
          ELSE u.id = nc.requester_id
        END
      )
      JOIN user_profiles up ON u.id = up.user_id
      WHERE (nc.requester_id = ${DEMO_USER_ID} OR nc.recipient_id = ${DEMO_USER_ID})
      AND nc.status = 'accepted'
      ORDER BY nc.created_at DESC
    `

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
                <h1 className="text-2xl font-bold text-gray-900">Networking</h1>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/schedule">
                  <Button variant="ghost">Schedule</Button>
                </Link>
                <Link href="/qa">
                  <Button variant="ghost">Q&A</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Connect with Fellow Attendees</h2>
            <p className="text-gray-600">
              Discover and connect with other attendees based on shared interests and professional backgrounds
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="suggested" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="suggested">Suggested ({suggestedAttendees.length})</TabsTrigger>
                  <TabsTrigger value="browse">Browse All ({allAttendees.length})</TabsTrigger>
                  <TabsTrigger value="connections">My Connections ({connections.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="suggested">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Suggested Connections
                        </CardTitle>
                        <CardDescription>
                          People who share your interests: {userInterestNames.join(", ")}
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    {suggestedAttendees.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-6">
                        {suggestedAttendees.map((attendee) => (
                          <AttendeeCard
                            key={attendee.id}
                            attendee={attendee}
                            sharedInterests={attendee.interests.filter((interest: string) =>
                              userInterestNames.includes(interest),
                            )}
                          />
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No suggested connections found based on your interests.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="browse">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Browse All Attendees</CardTitle>
                        <CardDescription>Discover all event attendees and their backgrounds</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4 text-gray-400" />
                          <Input placeholder="Search by name, company, or job title..." className="flex-1" />
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                      {allAttendees.map((attendee) => (
                        <AttendeeCard key={attendee.id} attendee={attendee} />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="connections">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>My Connections</CardTitle>
                        <CardDescription>People you've connected with at this event</CardDescription>
                      </CardHeader>
                    </Card>

                    {connections.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-6">
                        {connections.map((connection) => (
                          <Card key={connection.id}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-lg">{connection.name}</CardTitle>
                                  <CardDescription>{connection.email}</CardDescription>
                                </div>
                                <Badge variant="secondary">Connected</Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {connection.job_title && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Briefcase className="h-4 w-4" />
                                    <span>{connection.job_title}</span>
                                  </div>
                                )}
                                {connection.company && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Building className="h-4 w-4" />
                                    <span>{connection.company}</span>
                                  </div>
                                )}
                                <p className="text-xs text-gray-500">
                                  Connected on {new Date(connection.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">You haven't made any connections yet.</p>
                          <Button onClick={() => window.location.reload()}>
                            <Users className="h-4 w-4 mr-2" />
                            Start Networking
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <ConnectionRequests />

              <Card>
                <CardHeader>
                  <CardTitle>Networking Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium mb-1">Be Genuine</h4>
                    <p className="text-gray-600">
                      Focus on building authentic relationships rather than just collecting contacts.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Ask Questions</h4>
                    <p className="text-gray-600">Show interest in others' work and experiences.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Follow Up</h4>
                    <p className="text-gray-600">Connect on LinkedIn or send a follow-up message after the event.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {userInterestNames.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                  <Link href="/profile/edit" className="block mt-3">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Edit Interests
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
    console.error("Networking page error:", error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>There was an error loading the networking page. Please try again.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }
}
