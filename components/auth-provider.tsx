"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

type AuthContextType = {
  token: string | null
  setToken: (token: string | null) => void
  logout: () => void
  handleApiError: (error: any) => void
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  logout: () => {},
  handleApiError: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Mark that we're on the client
    setIsClient(true)

    // Check for token in localStorage on initial load
    const storedToken = localStorage.getItem("authToken")
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  // Handle API errors, specifically 403 errors
  const handleApiError = (error: any) => {
    // If we get a 403 error, the token is invalid or expired
    if (error?.status === 403) {
      logout()
      router.push("/")
    }
  }

  const logout = () => {
    if (isClient) {
      localStorage.removeItem("authToken")
      setToken(null)
      router.push("/")
    }
  }

  return <AuthContext.Provider value={{ token, setToken, logout, handleApiError }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
