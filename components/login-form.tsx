"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { config } from "@/lib/config"

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { setToken } = useAuth()

  useEffect(() => {
    setIsClient(true)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isClient) return

    setIsLoading(true)

    try {
      const response = await fetch(`${config.backendUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      const data = await response.json()

      // Store the token in localStorage
      localStorage.setItem("authToken", data.token)
      setToken(data.token)

      toast({
        title: "Login successful",
        description: "Welcome to your Wine Manager",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="glass-card p-6 rounded-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-white">
            Username
          </Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="glass-input"
            placeholder="Enter your username"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="glass-input"
            placeholder="Enter your password"
          />
        </div>
        <Button type="submit" className="w-full glass-button" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  )
}
