"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

type AuthContextType = {
  token: string | null
  setToken: (token: string | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  logout: () => {},
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

  useEffect(() => {
    // Only run this effect on the client and when we have pathname and router
    if (isClient && pathname !== "/" && pathname !== "/login" && !token) {
      router.push("/")
    }
  }, [token, pathname, router, isClient])

  const logout = () => {
    if (isClient) {
      localStorage.removeItem("authToken")
      setToken(null)
      router.push("/")
    }
  }

  return <AuthContext.Provider value={{ token, setToken, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
