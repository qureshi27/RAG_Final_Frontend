"use client"

import { DocumentStats } from "./document-stats"
import { QueryInterface } from "./query-interface"

interface UserDashboardProps {
  view: "stats" | "query"
}

export function UserDashboard({ view }: UserDashboardProps) {
  if (view === "query") {
    return <QueryInterface />
  }

  return <DocumentStats />
}
