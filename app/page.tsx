"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { UserDashboard } from "@/components/user/user-dashboard"
import { getCurrentUser, signOut, type User } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { BookOpen, BarChart3, MessageSquare } from "lucide-react"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isSignup, setIsSignup] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<"dashboard" | "admin" | "query">("dashboard")

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const handleAuthSuccess = () => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }

  const handleSignOut = () => {
    signOut()
    setUser(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="h-12 w-12 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">UOL Knowledge Base</h1>
            <p className="text-muted-foreground">University of Lahore Document Management System</p>
          </div>

          {isSignup ? (
            <SignupForm onSuccess={handleAuthSuccess} onToggleMode={() => setIsSignup(false)} />
          ) : (
            <LoginForm onSuccess={handleAuthSuccess} onToggleMode={() => setIsSignup(true)} />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-accent" />
            <div>
              <h1 className="text-xl font-bold">UOL Knowledge Base</h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {user.email} ({user.role})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user.role === "admin" ? (
              <div className="flex space-x-2">
                <Button
                  variant={currentView === "dashboard" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("dashboard")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </Button>
                <Button
                  variant={currentView === "admin" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("admin")}
                >
                  Admin Panel
                </Button>
                <Button
                  variant={currentView === "query" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("query")}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Query
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant={currentView === "dashboard" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("dashboard")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Stats
                </Button>
                <Button
                  variant={currentView === "query" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("query")}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ask Questions
                </Button>
              </div>
            )}
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {user.role === "admin" ? (
          currentView === "admin" ? (
            <AdminDashboard user={user} />
          ) : currentView === "query" ? (
            <UserDashboard view="query" />
          ) : (
            <UserDashboard view="dashboard" isAdmin={true} />
          )
        ) : currentView === "query" ? (
          <UserDashboard view="query" />
        ) : (
          <UserDashboard view="dashboard" />
        )}
      </main>
    </div>
  )
}
