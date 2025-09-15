export const dynamic = "force-dynamic";


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, ArrowLeft, Users, BarChart3 } from "lucide-react"
import Link from "next/link"
import { QASession } from "@/components/qa-session"
import { PollSection } from "@/components/poll-section"
import { SurveySection } from "@/components/survey-section"

export default async function QAPage() {
  try {
    // Get active Q&A sessions
    const qaSessions = await sql`
      SELECT 
        qa.id,
        qa.title,
        qa.description,
        qa.is_active,
        qa.is_moderated,
        es.title as session_title,
        es.speaker,
        COUNT(qq.id) as question_count
      FROM qa_sessions qa
      LEFT JOIN event_sessions es ON qa.session_id = es.id
      LEFT JOIN qa_questions qq ON qa.id = qq.qa_session_id AND qq.is_approved = true
      GROUP BY qa.id, qa.title, qa.description, qa.is_active, qa.is_moderated, es.title, es.speaker
      ORDER BY qa.is_active DESC, qa.id DESC
    `

    // Get active polls
    const activePolls = await sql`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.is_active,
        p.is_anonymous,
        p.multiple_choice,
        es.title as session_title,
        COUNT(pv.id) as total_votes
      FROM polls p
      LEFT JOIN event_sessions es ON p.session_id = es.id
      LEFT JOIN poll_votes pv ON p.id = pv.poll_id
      WHERE p.is_active = true
      GROUP BY p.id, p.title, p.description, p.is_active, p.is_anonymous, p.multiple_choice, es.title
      ORDER BY p.id DESC
    `

    // Get active surveys
    const activeSurveys = await sql`
      SELECT 
        s.id,
        s.title,
        s.description,
        s.is_active,
        s.is_anonymous,
        COUNT(sr.id) as response_count
      FROM surveys s
      LEFT JOIN survey_responses sr ON s.id = sr.survey_id
      WHERE s.is_active = true
      GROUP BY s.id, s.title, s.description, s.is_active, s.is_anonymous
      ORDER BY s.id DESC
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
                <h1 className="text-2xl font-bold text-gray-900">Interactive Sessions</h1>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/schedule">
                  <Button variant="ghost">Schedule</Button>
                </Link>
                <Link href="/networking">
                  <Button variant="ghost">Networking</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Engage & Participate</h2>
            <p className="text-gray-600">
              Join Q&A sessions, participate in polls, and share your feedback through surveys
            </p>
          </div>

          <Tabs defaultValue="qa" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="qa" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Q&A Sessions ({qaSessions.length})
              </TabsTrigger>
              <TabsTrigger value="polls" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Live Polls ({activePolls.length})
              </TabsTrigger>
              <TabsTrigger value="surveys" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Surveys ({activeSurveys.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="qa">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Q&A Sessions
                    </CardTitle>
                    <CardDescription>Ask questions and get answers from speakers and experts</CardDescription>
                  </CardHeader>
                </Card>

                {qaSessions.length > 0 ? (
                  <div className="space-y-6">
                    {qaSessions.map((session) => (
                      <QASession key={session.id} session={session} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No active Q&A sessions at the moment.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="polls">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Live Polls
                    </CardTitle>
                    <CardDescription>Vote on live polls and see real-time results</CardDescription>
                  </CardHeader>
                </Card>

                {activePolls.length > 0 ? (
                  <div className="space-y-6">
                    {activePolls.map((poll) => (
                      <PollSection key={poll.id} poll={poll} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No active polls at the moment.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="surveys">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Event Surveys
                    </CardTitle>
                    <CardDescription>Share your feedback and help us improve future events</CardDescription>
                  </CardHeader>
                </Card>

                {activeSurveys.length > 0 ? (
                  <div className="space-y-6">
                    {activeSurveys.map((survey) => (
                      <SurveySection key={survey.id} survey={survey} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No active surveys at the moment.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Q&A page error:", error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>There was an error loading the interactive sessions. Please try again.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }
}
