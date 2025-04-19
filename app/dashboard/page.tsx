"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WineCooler from "@/components/wine-cooler"
import SearchComponent from "@/components/search-component"
import type { WineDetail } from "@/lib/types"
import WineDetailPopup from "@/components/wine-detail-popup"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { config } from "@/lib/config"

export default function Dashboard() {
  const { token, handleApiError } = useAuth()
  const [coolerData, setCoolerData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedWine, setSelectedWine] = useState<WineDetail | null>(null)
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !token) return

    async function fetchCoolerData() {
      try {
        const response = await fetch(`${config.backendUrl}/cooler/Petrus`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          if (response.status === 403) {
            handleApiError({ status: 403 })
            return
          }
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
  }, [token, toast, isClient, handleApiError])

  const handleWineSelect = async (vintageId: number) => {
    if (!isClient || !token) return

    try {
      const response = await fetch(`${config.backendUrl}/vintage/${vintageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 403) {
          handleApiError({ status: 403 })
          return
        }
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

  // Show loading state until client-side rendering is complete
  if (!isClient) {
    return (
      <main
        className={`min-h-screen bg-gradient-to-br from-${config.theme.primaryFrom}/30 to-${config.theme.primaryTo}/30 bg-fixed p-4`}
      >
        <div className="glass-card p-8 rounded-xl flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      </main>
    )
  }

  // If we're on the client but not authenticated, show a message
  if (isClient && !token) {
    return (
      <main
        className={`min-h-screen bg-gradient-to-br from-${config.theme.primaryFrom}/30 to-${config.theme.primaryTo}/30 bg-fixed p-4`}
      >
        <div className="glass-card p-8 rounded-xl flex items-center justify-center">
          <p className="text-white">Please log in to access the dashboard</p>
        </div>
      </main>
    )
  }

  return (
    <main
      className={`min-h-screen bg-gradient-to-br from-${config.theme.primaryFrom}/30 to-${config.theme.primaryTo}/30 bg-fixed p-4`}
    >
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
