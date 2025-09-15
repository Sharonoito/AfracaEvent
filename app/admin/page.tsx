"use client"

export const dynamic = "force-dynamic";


import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, QrCode, BarChart3, Settings, UserCheck } from "lucide-react"
import Link from "next/link"

interface AdminStats {
  totalUsers: number
  checkedInUsers: number
  todayCheckIns: number
  activeSessions: number
  qrScans: number
  attendanceRate: number
  newUsersToday: number
}

// This would normally check admin authentication
async function checkAdminAuth() {
  // For demo purposes, we'll assume admin is authenticated
  // In production, check session/JWT token
  return true
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    checkedInUsers: 0,
    todayCheckIns: 0,
    activeSessions: 0,
    qrScans: 0,
    attendanceRate: 0,
    newUsersToday: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testApiWorking, setTestApiWorking] = useState<boolean | null>(null)

  useEffect(() => {
    async function testApi() {
      try {
        console.log("[v0] Testing basic API functionality")
        const response = await fetch("/api/test")
        const data = await response.json()
        console.log("[v0] Test API response:", data)
        setTestApiWorking(response.ok && data.success)
      } catch (err) {
        console.error("[v0] Test API failed:", err)
        setTestApiWorking(false)
      }
    }
    testApi()
  }, [])

  useEffect(() => {
    async function fetchStats() {
      try {
        console.log("[v0] Fetching admin stats")
        const response = await fetch("/api/admin/stats")

        console.log("[v0] Admin stats response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Admin stats error response:", errorText)
          throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`)
        }

        const data = await response.json()
        console.log("[v0] Admin stats response:", data)

        if (data.success) {
          setStats(data.stats)
        } else {
          throw new Error(data.error || "Failed to fetch stats")
        }
      } catch (err) {
        console.error("[v0] Error fetching admin stats:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch stats")
      } finally {
        setLoading(false)
      }
    }

    // Only fetch stats if test API is working
    if (testApiWorking === true) {
      fetchStats()
    } else if (testApiWorking === false) {
      setError("Basic API functionality is not working")
      setLoading(false)
    }
  }, [testApiWorking])

  const isAuthenticated = checkAdminAuth()

  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{testApiWorking === null ? "Testing API..." : "Loading admin dashboard..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">EventHub Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin/profile">
                <Button variant="ghost">Profile</Button>
              </Link>
              <Button variant="outline">Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="font-semibold text-red-800 mb-2">Error loading admin dashboard</h3>
            <p className="text-red-700 text-sm mb-3">{error}</p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                Retry
              </Button>
              <Link href="/api/test">
                <Button variant="outline" size="sm">
                  Test API
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* API Status Indicator */}
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 text-sm">
            API Status:{" "}
            {testApiWorking === true ? "✅ Working" : testApiWorking === false ? "❌ Failed" : "🔄 Testing..."}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.newUsersToday > 0 ? `+${stats.newUsersToday} new today` : "No new registrations today"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-ins Today</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayCheckIns.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stats.attendanceRate}% attendance rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSessions}</div>
              <p className="text-xs text-muted-foreground">Sessions today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QR Scans</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.qrScans.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total scans</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <Calendar className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Event Management</CardTitle>
              <CardDescription>Create, edit, and manage events and sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/events">
                <Button className="w-full">Manage Events</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>User Management</CardTitle>
              <CardDescription>View, edit, and manage attendee accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users">
                <Button className="w-full">Manage Users</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <UserCheck className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Manual Check-in</CardTitle>
              <CardDescription>Check in users who missed their QR code</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/checkin">
                <Button className="w-full">Manual Check-in</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>View detailed insights and generate reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/analytics">
                <Button className="w-full">View Analytics</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <QrCode className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle>QR Code Management</CardTitle>
              <CardDescription>Generate and manage QR codes for attendees</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/qr-codes">
                <Button className="w-full">Manage QR Codes</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <Settings className="h-8 w-8 text-gray-600 mb-2" />
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/settings">
                <Button className="w-full">System Settings</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
