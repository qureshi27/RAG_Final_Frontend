const API_BASE_URL = "http://localhost:8000"

export interface DocumentUploadResponse {
  success: boolean
  message?: string
}

export interface QueryResponse {
  success: boolean
  response?: string
  message?: string
}

export async function uploadDocument(email: string, file: File): Promise<DocumentUploadResponse> {
  try {
    const formData = new FormData()
    formData.append("email", email)
    formData.append("file", file)

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: {
        accept: "application/json",
      },
      body: formData,
    })

    if (response.ok) {
      return {
        success: true,
        message: "Document uploaded successfully",
      }
    } else {
      return {
        success: false,
        message: "Failed to upload document",
      }
    }
  } catch (error) {
    return {
      success: false,
      message: "Network error. Please try again.",
    }
  }
}

export async function queryKnowledgeBase(email: string, sessionId: string, query: string): Promise<QueryResponse> {
  try {
    const formData = new URLSearchParams()
    formData.append("email", email)
    formData.append("session_id", sessionId)
    formData.append("query", query)

    const response = await fetch(`${API_BASE_URL}/retrieve`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })

    if (response.ok) {
      const data = await response.text()
      return {
        success: true,
        response: data,
      }
    } else {
      return {
        success: false,
        message: "Failed to query knowledge base",
      }
    }
  } catch (error) {
    return {
      success: false,
      message: "Network error. Please try again.",
    }
  }
}
