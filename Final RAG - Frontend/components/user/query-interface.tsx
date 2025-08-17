"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { queryKnowledgeBase } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, Trash2, Bot, User, FileText, Copy, RefreshCw, Send } from "lucide-react"

interface QueryMessage {
  id: string
  type: "user" | "bot" | "error"
  content: string
  timestamp: Date
  query?: string
  source?: string[] | string
}

const parseApiResponse = (rawResponse: string) => {
  try {
    const parsed = JSON.parse(rawResponse)
    if (parsed.response && parsed.source) {
      return {
        response: parsed.response,
        source: Array.isArray(parsed.source) ? parsed.source : [parsed.source],
      }
    }
  } catch (e) {
    // If not JSON, try to extract source from text patterns
    const sourceMatch =
      rawResponse.match(/Source:\s*(.+?)(?:\n|$)/i) ||
      rawResponse.match(/Reference:\s*(.+?)(?:\n|$)/i) ||
      rawResponse.match(/From:\s*(.+?)(?:\n|$)/i)

    if (sourceMatch) {
      const source = sourceMatch[1].trim()
      const response = rawResponse.replace(sourceMatch[0], "").trim()
      return { response, source: [source] }
    }
  }

  // If no source found, return the full response
  return { response: rawResponse, source: null }
}

export function QueryInterface() {
  const [query, setQuery] = useState("")
  const [messages, setMessages] = useState<QueryMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return

    const userSpecificKey = `query-history-${user.email}`
    const savedMessages = localStorage.getItem(userSpecificKey)
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
        setMessages(parsed)
      } catch (err) {
        console.error("Failed to load conversation history:", err)
      }
    }
  }, [])

  useEffect(() => {
    const user = getCurrentUser()
    if (messages.length > 0 && user) {
      const userSpecificKey = `query-history-${user.email}`
      localStorage.setItem(userSpecificKey, JSON.stringify(messages))
    }
  }, [messages])

  const handleSubmit = async (queryText?: string) => {
    const currentQuery = queryText || query
    if (!currentQuery.trim()) return

    const user = getCurrentUser()
    if (!user) {
      setError("Please log in to ask questions")
      return
    }

    setIsLoading(true)
    setError("")

    // Add user message
    const userMessage: QueryMessage = {
      id: Date.now().toString(),
      type: "user",
      content: currentQuery,
      timestamp: new Date(),
      query: currentQuery,
    }

    setMessages((prev) => [...prev, userMessage])
    setQuery("")

    try {
      const result = await queryKnowledgeBase(user.email, user.sessionId || "default", currentQuery)

      if (result.success && result.response) {
        const { response, source } = parseApiResponse(result.response)

        const botMessage: QueryMessage = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: response,
          source: source,
          timestamp: new Date(),
          query: currentQuery,
        }

        setMessages((prev) => [...prev, botMessage])
      } else {
        const errorMessage: QueryMessage = {
          id: (Date.now() + 1).toString(),
          type: "error",
          content: result.message || "I couldn't find relevant information for your query.",
          timestamp: new Date(),
          query: currentQuery,
        }

        setMessages((prev) => [...prev, errorMessage])
        toast({
          title: "Query Failed",
          description: "I couldn't find relevant information. Try rephrasing your question.",
          variant: "destructive",
        })
      }
    } catch (err) {
      const errorMessage: QueryMessage = {
        id: (Date.now() + 1).toString(),
        type: "error",
        content: "Sorry, I encountered an error while processing your query. Please try again.",
        timestamp: new Date(),
        query: currentQuery,
      }

      setMessages((prev) => [...prev, errorMessage])
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const handleSuggestedQuery = (suggestedQuery: string) => {
    setQuery(suggestedQuery)
  }

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast({
        title: "Copied!",
        description: "Response copied to clipboard.",
      })
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const retryQuery = (originalQuery: string) => {
    setQuery(originalQuery)
  }

  const clearConversation = () => {
    const user = getCurrentUser()
    if (user) {
      const userSpecificKey = `query-history-${user.email}`
      setMessages([])
      localStorage.removeItem(userSpecificKey)
      toast({
        title: "Conversation Cleared",
        description: "All messages have been removed.",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Ask Questions</span>
            </CardTitle>
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearConversation}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Messages */}
          <div className="space-y-4 min-h-[300px] max-h-[500px] overflow-y-auto border rounded-lg p-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Welcome to UOL Knowledge Base!</p>
                <p>Ask me anything about the university.</p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] p-4 rounded-lg ${
                        message.type === "user"
                          ? "bg-accent text-accent-foreground"
                          : message.type === "error"
                            ? "bg-destructive/10 text-destructive border border-destructive/20"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        <span className="text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</span>
                      </div>

                      <div className="space-y-3">
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

                        {message.type === "bot" && message.source && (
                          <div className="border-t border-current/10 pt-3">
                            <div className="flex items-start space-x-2 text-xs">
                              <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <div className="space-y-1">
                                <span className="font-medium opacity-70">Sources:</span>
                                <div className="space-y-1">
                                  {Array.isArray(message.source) ? (
                                    message.source.map((src, index) => (
                                      <div
                                        key={index}
                                        className="bg-background/50 px-2 py-1 rounded text-foreground/80 text-xs"
                                      >
                                        📄 {src}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="bg-background/50 px-2 py-1 rounded text-foreground/80 text-xs">
                                      📄 {message.source}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {message.type === "bot" && (
                        <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-current/10">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(message.content)}
                            className="h-6 px-2 text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      )}

                      {message.type === "error" && message.query && (
                        <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-current/10">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => retryQuery(message.query!)}
                            className="h-6 px-2 text-xs"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-muted-foreground p-4 rounded-lg max-w-[85%]">
                      <div className="flex items-center space-x-2 mb-2">
                        <Bot className="h-4 w-4" />
                        <span className="text-xs opacity-70">Now</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-current rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-current rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-sm">Searching knowledge base...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="flex space-x-2">
            <Textarea
              placeholder="Ask a question about the university..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button onClick={() => handleSubmit()} disabled={!query.trim() || isLoading} size="lg">
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">Press Enter to send, Shift+Enter for new line</p>
        </CardContent>
      </Card>
    </div>
  )
}
