"use client"

import { useState } from "react"
import { DocumentUpload } from "./document-upload"
import { DocumentList } from "./document-list"
import { UserManagement } from "./user-management"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, FileText, Users, Activity, Upload, List } from "lucide-react"
import { documentStore } from "@/lib/document-store"
import type { User } from "@/lib/auth"

interface AdminDashboardProps {
  user: User
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<"overview" | "upload" | "documents" | "users">("overview")
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const stats = documentStore.getStats()

  const renderContent = () => {
    switch (currentView) {
      case "upload":
        return <DocumentUpload user={user} onUploadSuccess={handleUploadSuccess} />
      case "documents":
        return <DocumentList key={refreshKey} />
      case "users":
        return <UserManagement />
      default:
        return (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDocuments}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalDocuments === 0 ? "No documents uploaded yet" : "Documents in knowledge base"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">1 admin user</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.recentUploads}</div>
                  <p className="text-xs text-muted-foreground">Added this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Online</div>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setCurrentView("upload")}
              >
                <CardContent className="p-6 text-center">
                  <Upload className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Upload Documents</h3>
                  <p className="text-sm text-muted-foreground">Add new documents to the knowledge base</p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setCurrentView("documents")}
              >
                <CardContent className="p-6 text-center">
                  <List className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Manage Documents</h3>
                  <p className="text-sm text-muted-foreground">View, search, and organize documents</p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setCurrentView("users")}
              >
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">User Management</h3>
                  <p className="text-sm text-muted-foreground">Add and manage user accounts</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex flex-wrap gap-2">
        <Button variant={currentView === "overview" ? "default" : "outline"} onClick={() => setCurrentView("overview")}>
          Overview
        </Button>
        <Button variant={currentView === "upload" ? "default" : "outline"} onClick={() => setCurrentView("upload")}>
          Upload
        </Button>
        <Button
          variant={currentView === "documents" ? "default" : "outline"}
          onClick={() => setCurrentView("documents")}
        >
          Documents
        </Button>
        <Button variant={currentView === "users" ? "default" : "outline"} onClick={() => setCurrentView("users")}>
          Users
        </Button>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  )
}
