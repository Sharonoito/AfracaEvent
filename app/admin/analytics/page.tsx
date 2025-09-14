"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Users, Calendar, TrendingUp, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      console.log("[v0] Fetching analytics data")
      const response = await fetch("/api/admin/analytics")
      if (!response.ok) throw new Error("Failed to fetch analytics")
      const data = await response.json()
      console.log("[v0] Analytics data received:", data)
      setAnalyticsData(data)
    } catch (err) {
      console.error("[v0] Analytics fetch error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchAnalytics}>Retry</Button>
        </div>
      </div>
    )
  }

  const checkinRate =
    analyticsData.totalAttendees > 0
      ? Math.round((analyticsData.checkedInToday / analyticsData.totalAttendees) * 100)
      : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
            </div>
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalAttendees.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-in Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{checkinRate}%</div>
              <p className="text-xs text-muted-foreground">{analyticsData.checkedInToday} checked in today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QR Code Scans</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.qrScans.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total scans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.sessionAnalytics.length > 0
                  ? Math.round(
                      analyticsData.sessionAnalytics.reduce((acc, s) => acc + s.percentage, 0) /
                        analyticsData.sessionAnalytics.length,
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">Average session attendance</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Session Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Session Attendance</CardTitle>
              <CardDescription>Attendance rates for each session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.sessionAnalytics.length > 0 ? (
                  analyticsData.sessionAnalytics.map((session, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{session.name}</span>
                        <Badge variant="outline">{session.percentage}%</Badge>
                      </div>
                      <Progress value={session.percentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {session.attendees} / {session.capacity} attendees
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No session data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Engagement Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>Interactive feature usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium">Networking Connections</div>
                    <div className="text-sm text-muted-foreground">Total connections made</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{analyticsData.networkingConnections}</div>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium">Poll Responses</div>
                    <div className="text-sm text-muted-foreground">Total poll participations</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{analyticsData.pollResponses}</div>
                </div>

                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <div>
                    <div className="font-medium">Q&A Questions</div>
                    <div className="text-sm text-muted-foreground">Questions submitted</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{analyticsData.qaQuestions}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Popular Interests */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Popular Interests</CardTitle>
              <CardDescription>Most common attendee interests for networking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analyticsData.popularInterests.length > 0 ? (
                  analyticsData.popularInterests.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{item.interest}</div>
                        <div className="text-sm text-muted-foreground">{item.count} attendees</div>
                      </div>
                      <Badge variant="outline">{item.percentage}%</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-2">No interest data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
