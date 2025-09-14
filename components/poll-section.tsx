"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { BarChart3, Vote, Check } from "lucide-react"

interface PollSectionProps {
  poll: {
    id: number
    title: string
    description?: string
    is_active: boolean
    is_anonymous: boolean
    multiple_choice: boolean
    session_title?: string
    total_votes: number
  }
}

interface PollOption {
  id: number
  option_text: string
  vote_count: number
  percentage: number
  user_voted: boolean
}

export function PollSection({ poll }: PollSectionProps) {
  const [options, setOptions] = useState<PollOption[]>([])
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPollData()
  }, [poll.id])

  const fetchPollData = async () => {
    try {
      const response = await fetch(`/api/polls/${poll.id}`)
      if (response.ok) {
        const data = await response.json()
        setOptions(data.options)
        setHasVoted(data.hasVoted)
        setSelectedOptions(data.userVotes || [])
      }
    } catch (error) {
      console.error("Failed to fetch poll data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptionSelect = (optionId: number) => {
    if (hasVoted) return

    if (poll.multiple_choice) {
      setSelectedOptions((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId],
      )
    } else {
      setSelectedOptions([optionId])
    }
  }

  const submitVote = async () => {
    if (selectedOptions.length === 0) return

    setIsVoting(true)
    try {
      const response = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIds: selectedOptions }),
      })

      if (response.ok) {
        setHasVoted(true)
        fetchPollData()
        toast({
          title: "Vote submitted!",
          description: "Thank you for participating in the poll",
        })
      } else {
        throw new Error("Failed to submit vote")
      }
    } catch (error) {
      toast({
        title: "Vote failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {poll.title}
              {poll.is_active && <Badge className="bg-blue-100 text-blue-800">Live</Badge>}
            </CardTitle>
            {poll.session_title && <CardDescription>{poll.session_title}</CardDescription>}
            {poll.description && <p className="text-sm text-gray-600 mt-2">{poll.description}</p>}
          </div>
          <div className="text-right">
            <Badge variant="outline">{poll.total_votes} votes</Badge>
            {poll.is_anonymous && (
              <Badge variant="outline" className="ml-2">
                Anonymous
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-gray-600">Loading poll...</p>
        ) : (
          <>
            <div className="space-y-3">
              {options.map((option) => (
                <div
                  key={option.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    hasVoted
                      ? option.user_voted
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50"
                      : selectedOptions.includes(option.id)
                        ? "bg-blue-50 border-blue-200"
                        : "hover:bg-gray-50"
                  } ${!hasVoted && !poll.is_active ? "cursor-not-allowed opacity-50" : ""}`}
                  onClick={() => poll.is_active && handleOptionSelect(option.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{option.option_text}</span>
                      {hasVoted && option.user_voted && <Check className="h-4 w-4 text-blue-600" />}
                    </div>
                    <span className="text-sm text-gray-600">
                      {option.vote_count} ({option.percentage}%)
                    </span>
                  </div>
                  {hasVoted && <Progress value={option.percentage} className="h-2" />}
                </div>
              ))}
            </div>

            {poll.is_active && !hasVoted && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-500">
                  {poll.multiple_choice ? "Select one or more options" : "Select one option"}
                </p>
                <Button onClick={submitVote} disabled={isVoting || selectedOptions.length === 0} size="sm">
                  <Vote className="h-4 w-4 mr-2" />
                  {isVoting ? "Voting..." : "Submit Vote"}
                </Button>
              </div>
            )}

            {hasVoted && <p className="text-sm text-green-600 font-medium">✓ You have voted in this poll</p>}

            {!poll.is_active && <p className="text-sm text-gray-500">This poll has ended</p>}
          </>
        )}
      </CardContent>
    </Card>
  )
}
