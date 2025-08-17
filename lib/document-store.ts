// Mock document store - in real implementation, this would connect to your backend
export interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadedBy: string
  uploadedAt: Date
  category: string
  description?: string
  downloadUrl?: string
}

class DocumentStore {
  private documents: Document[] = []

  addDocument(doc: Omit<Document, "id" | "uploadedAt">): Document {
    const newDoc: Document = {
      ...doc,
      id: Date.now().toString(),
      uploadedAt: new Date(),
    }
    this.documents.push(newDoc)
    this.saveToStorage()
    return newDoc
  }

  getDocuments(): Document[] {
    return [...this.documents].sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
  }

  deleteDocument(id: string): boolean {
    const index = this.documents.findIndex((doc) => doc.id === id)
    if (index !== -1) {
      this.documents.splice(index, 1)
      this.saveToStorage()
      return true
    }
    return false
  }

  searchDocuments(query: string): Document[] {
    const lowercaseQuery = query.toLowerCase()
    return this.documents.filter(
      (doc) =>
        doc.name.toLowerCase().includes(lowercaseQuery) ||
        doc.category.toLowerCase().includes(lowercaseQuery) ||
        doc.description?.toLowerCase().includes(lowercaseQuery),
    )
  }

  getDocumentsByCategory(category: string): Document[] {
    return this.documents.filter((doc) => doc.category === category)
  }

  getStats() {
    const totalDocs = this.documents.length
    const totalSize = this.documents.reduce((sum, doc) => sum + doc.size, 0)
    const categories = [...new Set(this.documents.map((doc) => doc.category))]
    const recentUploads = this.documents.filter((doc) => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return doc.uploadedAt > weekAgo
    }).length

    return {
      totalDocuments: totalDocs,
      totalSize,
      categories: categories.length,
      recentUploads,
      categoryBreakdown: categories.map((cat) => ({
        name: cat,
        count: this.documents.filter((doc) => doc.category === cat).length,
      })),
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem("documents", JSON.stringify(this.documents))
    }
  }

  loadFromStorage() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("documents")
      if (stored) {
        try {
          this.documents = JSON.parse(stored).map((doc: any) => ({
            ...doc,
            uploadedAt: new Date(doc.uploadedAt),
          }))
        } catch (error) {
          console.error("Failed to load documents from storage:", error)
        }
      }
    }
  }
}

export const documentStore = new DocumentStore()
