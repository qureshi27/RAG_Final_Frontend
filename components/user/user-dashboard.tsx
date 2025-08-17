"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DocumentStats } from "./document-stats"
import { QueryInterface } from "./query-interface"

interface UserDashboardProps {
  view: "stats" | "query" | "dashboard"
  isAdmin?: boolean
}

export function UserDashboard({ view, isAdmin = false }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState(isAdmin ? "stats" : "query")

  if (view === "query") {
    return <QueryInterface />
  }

  if (view === "stats") {
    return <DocumentStats />
  }

  if (isAdmin) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Knowledge Base Overview</CardTitle>
          <CardDescription>Document statistics and knowledge base information</CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentStats />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Knowledge Base</CardTitle>
        <CardDescription>Access document statistics and query the knowledge base</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="query">Ask Question</TabsTrigger>
            <TabsTrigger value="stats">Document Stats</TabsTrigger>
          </TabsList>
          <TabsContent value="query" className="mt-6">
            <QueryInterface />
          </TabsContent>
          <TabsContent value="stats" className="mt-6">
            <DocumentStats />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
