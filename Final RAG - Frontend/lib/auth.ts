export interface User {
  email: string
  role: "admin" | "user"
  sessionId?: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  user?: User
}

const API_BASE_URL = "http://localhost:8000"

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    // Check for fixed admin credentials
    if (email === "admin@uol.edu.pk" && password === "admin123") {
      const adminUser: User = {
        email: "admin@uol.edu.pk",
        role: "admin",
        sessionId: generateSessionId(),
      }

      // Store in localStorage
      localStorage.setItem("user", JSON.stringify(adminUser))

      return {
        success: true,
        user: adminUser,
      }
    }

    // For other users, call the backend API
    const formData = new URLSearchParams()
    formData.append("email", email)
    formData.append("password", password)

    const response = await fetch(`${API_BASE_URL}/signin`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })

    if (response.ok) {
      const user: User = {
        email,
        role: "user",
        sessionId: generateSessionId(),
      }

      localStorage.setItem("user", JSON.stringify(user))

      return {
        success: true,
        user,
      }
    } else {
      return {
        success: false,
        message: "Invalid credentials",
      }
    }
  } catch (error) {
    return {
      success: false,
      message: "Network error. Please try again.",
    }
  }
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    const formData = new URLSearchParams()
    formData.append("email", email)
    formData.append("password", password)

    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })

    if (response.ok) {
      const user: User = {
        email,
        role: "user",
        sessionId: generateSessionId(),
      }

      localStorage.setItem("user", JSON.stringify(user))

      return {
        success: true,
        user,
      }
    } else {
      return {
        success: false,
        message: "Registration failed",
      }
    }
  } catch (error) {
    return {
      success: false,
      message: "Network error. Please try again.",
    }
  }
}

export function signOut(): void {
  localStorage.removeItem("user")
}

export function getCurrentUser(): User | null {
  try {
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
