"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { UserCheck, UserX, Users } from "lucide-react"

interface ConnectionRequest {
  id: number
  requester_id: string
  requester_name: string
  requester_email: string
  requester_company?: string
  requester_job_title?: string
  message?: string
  created_at: string
}

export function ConnectionRequests() {
  const [requests, setRequests] = useState<ConnectionRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/networking/requests")
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests)
      }
    } catch (error) {
      console.error("Failed to fetch connection requests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequest = async (requestId: number, action: "accept" | "decline") => {
    try {
      const response = await fetch(`/api/networking/requests/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        setRequests((prev) => prev.filter((req) => req.id !== requestId))
        toast({
          title: action === "accept" ? "Connection accepted!" : "Request declined",
          description:
            action === "accept" ? "You're now connected with this person" : "The connection request has been declined",
        })
      } else {
        throw new Error(`Failed to ${action} request`)
      }
    } catch (error) {
      toast({
        title: "Action failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connection Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Connection Requests
        </CardTitle>
        {requests.length > 0 && (
          <CardDescription>
            <Badge variant="secondary">{requests.length} pending</Badge>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-sm text-gray-600">No pending requests</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-3 space-y-3">
                <div>
                  <h4 className="font-medium text-sm">{request.requester_name}</h4>
                  <p className="text-xs text-gray-600">{request.requester_email}</p>
                  {request.requester_job_title && request.requester_company && (
                    <p className="text-xs text-gray-500">
                      {request.requester_job_title} at {request.requester_company}
                    </p>
                  )}
                </div>

                {request.message && <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">"{request.message}"</p>}

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleRequest(request.id, "accept")} className="flex-1">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRequest(request.id, "decline")}
                    className="flex-1 bg-transparent"
                  >
                    <UserX className="h-3 w-3 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
