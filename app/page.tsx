import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, QrCode, MessageSquare } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">EventHub</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Register</Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline">Admin</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-balance">Welcome to Tech Innovation Summit 2024</h2>
          <p className="text-xl text-gray-600 mb-8 text-pretty max-w-3xl mx-auto">
            Join us for a comprehensive 5-day conference covering the latest in technology, innovation, and digital
            transformation. Network with industry leaders and expand your knowledge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Register Now
              </Button>
            </Link>
            <Link href="/schedule">
              <Button size="lg" variant="outline">
                View Schedule
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <QrCode className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>QR Check-in</CardTitle>
              <CardDescription>Quick and easy event check-in with personalized QR codes</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Live Schedule</CardTitle>
              <CardDescription>Real-time event schedules with instant updates and notifications</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Smart Networking</CardTitle>
              <CardDescription>Connect with attendees based on shared interests and goals</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Interactive Q&A</CardTitle>
              <CardDescription>Participate in live Q&A sessions, polls, and feedback surveys</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Event Details */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-2xl">Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-2">Dates & Location</h3>
                <p className="text-gray-600 mb-2">March 18-22, 2024</p>
                <p className="text-gray-600">San Francisco Convention Center</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">What to Expect</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• 15+ Expert-led sessions</li>
                  <li>• Hands-on workshops</li>
                  <li>• Networking opportunities</li>
                  <li>• Startup pitch competition</li>
                  <li>• Innovation showcase</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
