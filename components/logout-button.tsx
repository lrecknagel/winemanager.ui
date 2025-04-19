"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"

export default function LogoutButton() {
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-theme-text hover:bg-white/10">
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  )
}
