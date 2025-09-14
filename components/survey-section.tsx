"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, ExternalLink } from "lucide-react"
import Link from "next/link"

interface SurveySectionProps {
  survey: {
    id: number
    title: string
    description?: string
    is_active: boolean
    is_anonymous: boolean
    response_count: number
  }
}

export function SurveySection({ survey }: SurveySectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {survey.title}
              {survey.is_active && <Badge className="bg-green-100 text-green-800">Active</Badge>}
            </CardTitle>
            {survey.description && <CardDescription>{survey.description}</CardDescription>}
          </div>
          <div className="text-right">
            <Badge variant="outline">{survey.response_count} responses</Badge>
            {survey.is_anonymous && (
              <Badge variant="outline" className="ml-2">
                Anonymous
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Help us improve by sharing your feedback and experiences</p>
          <Link href={`/surveys/${survey.id}`}>
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              Take Survey
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
