"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, ThumbsUp, Send, CheckCircle } from "lucide-react"

interface QASessionProps {
  session: {
    id: number
    title: string
    description?: string
    is_active: boolean
    is_moderated: boolean
    session_title?: string
    speaker?: string
    question_count: number
  }
}

interface Question {
  id: number
  question: string
  upvotes: number
  is_answered: boolean
  user_name: string
  created_at: string
  answer?: string
  answered_at?: string
  user_upvoted?: boolean
}

export function QASession({ session }: QASessionProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchQuestions()
  }, [session.id])

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/qa/${session.id}/questions`)
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions)
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const submitQuestion = async () => {
    if (!newQuestion.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/qa/${session.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion }),
      })

      if (response.ok) {
        setNewQuestion("")
        fetchQuestions()
        toast({
          title: "Question submitted!",
          description: session.is_moderated ? "Your question is pending moderation" : "Your question has been posted",
        })
      } else {
        throw new Error("Failed to submit question")
      }
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const upvoteQuestion = async (questionId: number) => {
    try {
      const response = await fetch(`/api/qa/questions/${questionId}/upvote`, {
        method: "POST",
      })

      if (response.ok) {
        fetchQuestions()
      }
    } catch (error) {
      toast({
        title: "Upvote failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {session.title}
              {session.is_active && <Badge className="bg-green-100 text-green-800">Live</Badge>}
            </CardTitle>
            {session.session_title && (
              <CardDescription>
                {session.session_title} {session.speaker && `• ${session.speaker}`}
              </CardDescription>
            )}
            {session.description && <p className="text-sm text-gray-600 mt-2">{session.description}</p>}
          </div>
          <Badge variant="outline">{session.question_count} questions</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Submit Question */}
        {session.is_active && (
          <div className="space-y-3">
            <h4 className="font-medium">Ask a Question</h4>
            <Textarea
              placeholder="What would you like to ask?"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="min-h-[80px]"
            />
            <Button onClick={submitQuestion} disabled={isSubmitting || !newQuestion.trim()}>
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Question"}
            </Button>
            {session.is_moderated && (
              <p className="text-xs text-gray-500">Questions are moderated and may take a few minutes to appear</p>
            )}
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Questions
          </h4>

          {isLoading ? (
            <p className="text-sm text-gray-600">Loading questions...</p>
          ) : questions.length === 0 ? (
            <p className="text-sm text-gray-600">No questions yet. Be the first to ask!</p>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className={`border rounded-lg p-4 ${question.is_answered ? "bg-green-50 border-green-200" : "bg-gray-50"}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{question.question}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        by {question.user_name} • {new Date(question.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {question.is_answered && <CheckCircle className="h-4 w-4 text-green-600" />}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => upvoteQuestion(question.id)}
                        className={`flex items-center gap-1 ${question.user_upvoted ? "text-blue-600" : ""}`}
                      >
                        <ThumbsUp className="h-3 w-3" />
                        {question.upvotes}
                      </Button>
                    </div>
                  </div>

                  {question.answer && (
                    <div className="mt-3 p-3 bg-white rounded border-l-4 border-green-500">
                      <p className="text-sm font-medium text-green-800 mb-1">Answer:</p>
                      <p className="text-sm">{question.answer}</p>
                      {question.answered_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Answered on {new Date(question.answered_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
