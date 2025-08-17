"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Sparkles } from "lucide-react"

interface SuggestedQueriesProps {
  onQuerySelect: (query: string) => void
}

export function SuggestedQueries({ onQuerySelect }: SuggestedQueriesProps) {
  const suggestedQueries = [
    {
      category: "Admissions",
      queries: [
        "What are the admission requirements for Computer Science?",
        "How do I apply for undergraduate programs?",
        "What documents are needed for admission?",
        "When is the admission deadline?",
      ],
    },
    {
      category: "Academic",
      queries: [
        "Tell me about the faculty of Engineering",
        "What are the graduation requirements?",
        "How is the grading system structured?",
        "What research opportunities are available?",
      ],
    },
    {
      category: "Campus Life",
      queries: [
        "What scholarships are available for students?",
        "How do I apply for hostel accommodation?",
        "Tell me about the campus facilities",
        "What extracurricular activities are offered?",
      ],
    },
    {
      category: "General",
      queries: [
        "What are the fee structures for different programs?",
        "How can I contact the admissions office?",
        "What is the university's history?",
        "Where is the university located?",
      ],
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5" />
          <span>Suggested Questions</span>
          <Sparkles className="h-4 w-4 text-accent" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {suggestedQueries.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide">
                {category.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {category.queries.map((query, queryIndex) => (
                  <Button
                    key={queryIndex}
                    variant="outline"
                    className="h-auto p-3 text-left justify-start whitespace-normal bg-transparent hover:bg-accent/5 hover:border-accent/50 transition-colors"
                    onClick={() => onQuerySelect(query)}
                  >
                    <span className="text-sm">{query}</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
