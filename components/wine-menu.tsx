"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { config } from "@/lib/config"
import { useAuth } from "@/components/auth-provider"
import type { SearchResult } from "@/lib/types"

type WineMenuProps = {
  token: string | null
  onWineSelect: (vintageId: number) => void
}

type WineCategory = {
  type: string
  displayName: string
  wines: SearchResult[]
}

export default function WineMenu({ token, onWineSelect }: WineMenuProps) {
  const [wines, setWines] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<WineCategory[]>([])
  const { toast } = useToast()
  const { handleApiError } = useAuth()

  useEffect(() => {
    async function fetchAllWines() {
      if (!token) return

      try {
        setLoading(true)
        const response = await fetch(`${config.backendUrl}/search?term=*`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          if (response.status === 403) {
            handleApiError({ status: 403 })
            return
          }
          throw new Error("Failed to fetch wines")
        }

        const data = await response.json()
        setWines(data)

        // Group wines by type
        const wineGroupNameMapping: { [key: string]: string } = {
          schaumwein: 'Schaumweine',
          weißwein: 'Weißwein',
          rotwein: 'Rotwein',
          roséwein: 'Roséwein',
          unbekannt: 'Andere Weine',
        }

        const wineGroups = Object.groupBy(
          data,
          (_: SearchResult) => _.document.wine.type?.toLowerCase() || ""
        )

        const wineCategories: WineCategory[] = Object.entries(wineGroups).map(([type, wines]) => ({
          type,
          displayName: wineGroupNameMapping[type],
          wines: wines ?? []
        }))

        setCategories(wineCategories)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load wine data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAllWines()
  }, [token, toast, handleApiError])

  if (loading) {
    return (
      <div className="glass-card p-8 rounded-xl flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-theme-text" />
      </div>
    )
  }

  if (wines.length === 0) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <p className="text-theme-text text-center">No wines found in your collection</p>
      </div>
    )
  }

  return (
    <div className="wine-menu">
      <div className="wine-menu-header glass-card p-6 rounded-xl mb-4 text-center">
        <h2 className="text-2xl font-serif text-theme-text mb-1">Wine Collection</h2>
        <p className="text-theme-text/70 italic">A curated selection of fine wines</p>
      </div>

      {categories.map((category) => (
        <div key={category.type} className="mb-6">
          <div className="wine-menu-category glass-card p-4 rounded-xl mb-3">
            <h3 className="text-xl font-serif text-theme-text border-b border-theme-text/20 pb-2">
              {category.displayName}
            </h3>
          </div>

          <div className="wine-menu-items glass-card p-6 rounded-xl">
            <div className="space-y-4">
              {category.wines.map((wine) => (
                <div
                  key={wine.id}
                  className="wine-menu-item cursor-pointer hover:bg-white/10 transition-colors p-3 rounded-lg"
                  onClick={() => onWineSelect(wine.document.wine.vintage_id)}
                >
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-theme-text font-medium">{wine.document.wine.name}</h4>
                    <span className="text-theme-text/60 text-sm">{wine.document.wine.year}</span>
                  </div>
                  <p className="text-theme-text/70 text-sm">{wine.document.wine.winery}</p>
                  <p className="text-theme-text/60 text-xs mt-1">{wine.document.wine.grapes}</p>

                  {wine.document.cooler_position && (
                    <div className="mt-2 text-xs text-theme-text/50 italic">
                      <p>
                        {wine.document.cooler_position.layer_name}, Row {wine.document.cooler_position.row}, Level{" "}
                        {wine.document.cooler_position.level}, Column {wine.document.cooler_position.column}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
