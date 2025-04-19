"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { config } from "@/lib/config"

type ThemeProviderProps = {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
}

export function ThemeProvider({ children, attribute = "class", defaultTheme = "dark" }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  // Apply theme variables from config
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Set CSS variables from config
      document.documentElement.style.setProperty("--theme-primary-color", config.theme.primaryColor)
      document.documentElement.style.setProperty("--theme-secondary-color", config.theme.secondaryColor)
      document.documentElement.style.setProperty("--theme-accent-color", config.theme.accentColor)
      document.documentElement.style.setProperty("--theme-background-start", config.theme.backgroundStart)
      document.documentElement.style.setProperty("--theme-background-end", config.theme.backgroundEnd)
      document.documentElement.style.setProperty("--theme-text-color", config.theme.textColor)
      document.documentElement.style.setProperty("--theme-card-opacity", config.theme.cardOpacity)
      document.documentElement.style.setProperty("--theme-glass-blur", config.theme.glassBlur)
    }
  }, [])

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Prevent theme flash on load
    return <>{children}</>
  }

  return <>{children}</>
}
