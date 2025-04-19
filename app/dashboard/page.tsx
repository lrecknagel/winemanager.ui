"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WineCooler from "@/components/wine-cooler"
import SearchComponent from "@/components/search-component"
import type { WineDetail } from "@/lib/types"
import WineDetailPopup from "@/components/wine-detail-popup"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function Dashboard() {
  const { token } = useAuth()
  const [coolerData, setCoolerData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedWine, setSelectedWine] = useState<WineDetail | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!token) return

    async function fetchCoolerData() {
      try {
        const response = await fetch("http://localhost:3000/cooler/Petrus", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch cooler data")
        }

        const data = await response.json()
        setCoolerData(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load wine cooler data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCoolerData()
  }, [token, toast])

  if (!token) {
    return redirect("/")
  }

  const handleWineSelect = async (vintageId: number) => {
    try {
      const response = await fetch(`<BACKEND>/vintage/${vintageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch wine details")
      }

      const data = await response.json()
      setSelectedWine(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load wine details",
        variant: "destructive",
      })
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900/30 to-rose-900/30 bg-fixed p-4">
      <div className="glass-card rounded-xl p-4 mb-4">
        <h1 className="text-2xl font-bold text-white">Wine Manager</h1>
      </div>

      <Tabs defaultValue="cooler" className="w-full">
        <TabsList className="glass-card w-full mb-4">
          <TabsTrigger value="cooler" className="w-1/2">
            Wine Cooler
          </TabsTrigger>
          <TabsTrigger value="search" className="w-1/2">
            Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cooler" className="mt-0">
          {loading ? (
            <div className="glass-card p-8 rounded-xl flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          ) : (
            <WineCooler data={coolerData} onWineSelect={handleWineSelect} />
          )}
        </TabsContent>

        <TabsContent value="search" className="mt-0">
          <SearchComponent token={token} onWineSelect={handleWineSelect} />
        </TabsContent>
      </Tabs>

      {selectedWine && <WineDetailPopup wine={selectedWine} onClose={() => setSelectedWine(null)} />}
    </main>
  )
}
