"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Building, Briefcase, ExternalLink, UserPlus, MessageSquare } from "lucide-react"

interface AttendeeCardProps {
  attendee: {
    id: string
    name: string
    email: string
    bio?: string
    company?: string
    job_title?: string
    linkedin_url?: string
    twitter_url?: string
    interests: string[]
  }
  sharedInterests?: string[]
}

export function AttendeeCard({ attendee, sharedInterests = [] }: AttendeeCardProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionSent, setConnectionSent] = useState(false)
  const { toast } = useToast()

  const handleConnect = async () => {
    setIsConnecting(true)

    try {
      const response = await fetch("/api/networking/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: attendee.id,
          message: `Hi ${attendee.name}, I'd like to connect with you at the Tech Innovation Summit!`,
        }),
      })

      if (response.ok) {
        setConnectionSent(true)
        toast({
          title: "Connection request sent!",
          description: `Your request has been sent to ${attendee.name}`,
        })
      } else {
        throw new Error("Failed to send connection request")
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{attendee.name}</CardTitle>
            <CardDescription>{attendee.email}</CardDescription>
          </div>
          {sharedInterests.length > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {sharedInterests.length} shared
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Professional Info */}
        <div className="space-y-2">
          {attendee.job_title && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="h-4 w-4" />
              <span>{attendee.job_title}</span>
            </div>
          )}
          {attendee.company && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building className="h-4 w-4" />
              <span>{attendee.company}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {attendee.bio && <p className="text-sm text-gray-600 line-clamp-3">{attendee.bio}</p>}

        {/* Interests */}
        {attendee.interests && attendee.interests.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Interests</h4>
            <div className="flex flex-wrap gap-1">
              {attendee.interests.slice(0, 4).map((interest) => (
                <Badge
                  key={interest}
                  variant="outline"
                  className={sharedInterests.includes(interest) ? "bg-blue-50 border-blue-200 text-blue-700" : ""}
                >
                  {interest}
                </Badge>
              ))}
              {attendee.interests.length > 4 && <Badge variant="outline">+{attendee.interests.length - 4} more</Badge>}
            </div>
          </div>
        )}

        {/* Social Links */}
        {(attendee.linkedin_url || attendee.twitter_url) && (
          <div className="flex gap-2">
            {attendee.linkedin_url && (
              <Button variant="outline" size="sm" asChild className="bg-transparent">
                <a href={attendee.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  LinkedIn
                </a>
              </Button>
            )}
            {attendee.twitter_url && (
              <Button variant="outline" size="sm" asChild className="bg-transparent">
                <a href={attendee.twitter_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Twitter
                </a>
              </Button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {connectionSent ? (
            <Button variant="outline" disabled className="flex-1 bg-transparent">
              <MessageSquare className="h-4 w-4 mr-2" />
              Request Sent
            </Button>
          ) : (
            <Button onClick={handleConnect} disabled={isConnecting} className="flex-1">
              <UserPlus className="h-4 w-4 mr-2" />
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
