"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Check, UserPlus } from "lucide-react"

interface SessionRegistrationButtonProps {
  sessionId: number
  isRegistered: boolean
  isFull?: boolean
}

export function SessionRegistrationButton({
  sessionId,
  isRegistered: initialIsRegistered,
  isFull = false,
}: SessionRegistrationButtonProps) {
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleRegistration = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/sessions/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          action: isRegistered ? "unregister" : "register",
        }),
      })

      if (response.ok) {
        setIsRegistered(!isRegistered)
        toast({
          title: isRegistered ? "Unregistered successfully" : "Registered successfully",
          description: isRegistered
            ? "You've been removed from this session"
            : "You're now registered for this session",
        })
      } else {
        throw new Error("Registration failed")
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isRegistered) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleRegistration}
        disabled={isLoading}
        className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
      >
        <Check className="h-4 w-4 mr-1" />
        {isLoading ? "Updating..." : "Registered"}
      </Button>
    )
  }

  if (isFull) {
    return (
      <Button variant="outline" size="sm" disabled className="text-red-600 border-red-600 bg-transparent">
        Session Full
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRegistration}
      disabled={isLoading}
      className="text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent"
    >
      <UserPlus className="h-4 w-4 mr-1" />
      {isLoading ? "Registering..." : "Register"}
    </Button>
  )
}
