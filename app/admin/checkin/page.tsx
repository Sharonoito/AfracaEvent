"use client"

export const dynamic = "force-dynamic";


import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, UserCheck, QrCode, Mail, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AdminCheckinPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      console.log("[v0] Fetching users for check-in")
      const response = await fetch("/api/admin/users")
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      console.log("[v0] Users received:", data)
      setUsers(data.users || [])
    } catch (err) {
      console.error("[v0] Users fetch error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleManualCheckin = async (userId) => {
    try {
      console.log(`[v0] Manual check-in for user ${userId}`)
      const response = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "checkin" }),
      })

      if (!response.ok) throw new Error("Failed to check in user")

      // Refresh users list
      fetchUsers()

      // Update selected user if it's the same one
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, checkedIn: true })
      }
    } catch (err) {
      console.error("[v0] Manual check-in error:", err)
      setError(err.message)
    }
  }

  const handleResendQR = async (userId) => {
    try {
      console.log(`[v0] Resending QR code to user ${userId}`)
      const response = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "resend_qr" }),
      })

      if (!response.ok) throw new Error("Failed to resend QR code")

      // Refresh users list
      fetchUsers()
    } catch (err) {
      console.error("[v0] Resend QR error:", err)
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading users...</p>
        </div>
      </div>
    )
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Manual Check-in</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">Error: {error}</p>
            <Button onClick={fetchUsers} size="sm" className="mt-2">
              Retry
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search and User List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Find Attendee</CardTitle>
                <CardDescription>Search for attendees who need manual check-in or QR code assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedUser?.id === user.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={`/abstract-geometric-shapes.png?height=40&width=40&query=${user.name}`}
                                />
                                <AvatarFallback>
                                  {user.name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("") || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name || "Unknown"}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                <div className="text-sm text-muted-foreground">{user.company || "No company"}</div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              {user.checkedIn ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Checked In
                                </Badge>
                              ) : (
                                <Badge variant="outline">Not Checked In</Badge>
                              )}
                              {!user.qrCodeSent && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  No QR Code
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No users found</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Check-in Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Check-in Actions</CardTitle>
                <CardDescription>Perform manual check-in or QR code operations</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedUser ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={`/abstract-geometric-shapes.png?height=48&width=48&query=${selectedUser.name}`}
                          />
                          <AvatarFallback>
                            {selectedUser.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{selectedUser.name || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Company:</strong> {selectedUser.company || "Not specified"}
                        </div>
                        <div>
                          <strong>Registered:</strong> {selectedUser.registrationDate || "Unknown"}
                        </div>
                        <div className="flex items-center gap-2">
                          <strong>Status:</strong>
                          {selectedUser.checkedIn ? (
                            <Badge className="bg-green-100 text-green-800">Checked In</Badge>
                          ) : (
                            <Badge variant="outline">Not Checked In</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <strong>QR Code:</strong>
                          {selectedUser.qrCodeSent ? (
                            <Badge className="bg-blue-100 text-blue-800">Sent</Badge>
                          ) : (
                            <Badge variant="destructive">Not Sent</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {!selectedUser.checkedIn && (
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => handleManualCheckin(selectedUser.id)}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Manual Check-in
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => handleResendQR(selectedUser.id)}
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        {selectedUser.qrCodeSent ? "Resend QR Code" : "Send QR Code"}
                      </Button>

                      <Button variant="outline" className="w-full bg-transparent">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                    </div>

                    <div className="pt-4 border-t">
                      <Label htmlFor="notes">Admin Notes</Label>
                      <textarea
                        id="notes"
                        className="w-full mt-1 p-2 border rounded-md text-sm"
                        rows={3}
                        placeholder="Add notes about this check-in..."
                      />
                      <Button size="sm" className="mt-2">
                        Save Notes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select an attendee from the list to perform check-in actions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
