"use client"

import { useState, useEffect } from "react"
import { CloudCog, Loader2, Filter } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { config } from "@/lib/config"
import { useAuth } from "@/components/auth-provider"
import type { SearchResult, Wine } from "@/lib/types"
import Image from "next/image"

type WineWithThumb = {
  thumb?: string
}

type WineMenuProps = {
  token: string | null
  onWineSelect: (vintageId: number) => void
}

type WineCategory = {
  type: string
  displayName: string
  wines: (Omit<SearchResult, 'document'> & { document: { wine: Wine & { thumb?: string }, cooler_position?: any } })[]
}

export default function WineMenu({ token, onWineSelect }: WineMenuProps) {
  const [wines, setWines] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  // Filter states
  const [selectedDrinkWindow, setSelectedDrinkWindow] = useState<string>("")
  const [selectedFoods, setSelectedFoods] = useState<string[]>([])
  const [selectedGrapes, setSelectedGrapes] = useState<string[]>([])
  const [selectedLayer, setSelectedLayer] = useState<string>("__all__")
  const { toast } = useToast()
  const { handleApiError } = useAuth()

  // Extract unique filter options from wines
  const foodsSet = new Set<string>()
  const grapesSet = new Set<string>()
  const layerSet = new Set<string>()
  wines.forEach((w) => {
    w.document.wine.foods?.split(",").map(f => f.trim()).forEach(f => f && foodsSet.add(f))
    w.document.wine.grapes?.split(",").map(g => g.trim()).forEach(g => g && grapesSet.add(g))
    if (w.document.cooler_position?.layer_name) layerSet.add(w.document.cooler_position.layer_name)
  })
  const foods = Array.from(foodsSet).sort()
  const grapes = Array.from(grapesSet).sort()
  const layers = Array.from(layerSet).sort()

  // Helper: get drink window status
  function getDrinkWindowStatus(w: SearchResult): string {
    // Try to get drink_window from document, fallback to wine.drink_window if present
    const status = (w.document as any).drink_window?.status ?? (w.document.wine as any).drink_window?.status
    if (status === 4 || status === 5) return "perfect"
    if (status === 6) return "overdue"
    return "unknown"
  }

  // Filtering logic
  const filteredWines = wines.filter((w) => {
    // Drink window
    if (selectedDrinkWindow) {
      const status = getDrinkWindowStatus(w)
      if (selectedDrinkWindow !== status) return false
    }
    // Foods
    if (selectedFoods.length > 0) {
      const wineFoods = w.document.wine.foods?.split(",").map(f => f.trim()) || []
      if (!selectedFoods.every(f => wineFoods.includes(f))) return false
    }
    // Grapes
    if (selectedGrapes.length > 0) {
      const wineGrapes = w.document.wine.grapes?.split(",").map(g => g.trim()) || []
      if (!selectedGrapes.every(g => wineGrapes.includes(g))) return false
    }
    // Layer
    if (selectedLayer && selectedLayer !== "__all__") {
      if (w.document.cooler_position?.layer_name !== selectedLayer) return false
    }
    return true
  })

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

        console.log(data)

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

        // setCategories(wineCategories) // This line is removed
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

  // Group filtered wines by type for rendering
  const wineGroupNameMapping: { [key: string]: string } = {
    schaumwein: 'Schaumweine',
    weißwein: 'Weißwein',
    rotwein: 'Rotwein',
    roséwein: 'Roséwein',
    unbekannt: 'Andere Weine',
  }
  const wineGroups = Object.groupBy(
    filteredWines,
    (_: SearchResult) => _.document.wine.type?.toLowerCase() || ""
  )
  const categories: WineCategory[] = Object.entries(wineGroups).map(([type, wines]) => ({
    type,
    displayName: wineGroupNameMapping[type],
    wines: wines ?? []
  }))

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
      <div className="wine-menu-header glass-card p-6 rounded-xl mb-4 text-center relative">
        <h2 className="text-2xl font-serif text-theme-text mb-1">Wine Collection</h2>
        <p className="text-theme-text/70 italic">A curated selection of fine wines</p>
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4" aria-label="Filter wines">
              <Filter className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold text-base">Filter Wines</span>
              <Button variant="ghost" size="sm" onClick={() => {
                setSelectedDrinkWindow("")
                setSelectedFoods([])
                setSelectedGrapes([])
                setSelectedLayer("__all__")
              }}>Clear</Button>
            </div>
            <div className="mb-4">
              <div className="font-medium mb-1">Drink Window</div>
              <RadioGroup value={selectedDrinkWindow} onValueChange={setSelectedDrinkWindow} className="flex gap-2">
                <div className="flex items-center gap-1">
                  <RadioGroupItem value="unknown" id="dw-unknown" />
                  <label htmlFor="dw-unknown" className="text-sm">Unknown</label>
                </div>
                <div className="flex items-center gap-1">
                  <RadioGroupItem value="perfect" id="dw-perfect" />
                  <label htmlFor="dw-perfect" className="text-sm">Perfect</label>
                </div>
                <div className="flex items-center gap-1">
                  <RadioGroupItem value="overdue" id="dw-overdue" />
                  <label htmlFor="dw-overdue" className="text-sm">Overdue</label>
                </div>
              </RadioGroup>
            </div>
            <div className="mb-4">
              <div className="font-medium mb-1">Foods</div>
              <div className="flex flex-wrap gap-2">
                {foods.map(food => (
                  <Badge
                    key={food}
                    variant={selectedFoods.includes(food) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedFoods(selectedFoods.includes(food) ? selectedFoods.filter(f => f !== food) : [...selectedFoods, food])}
                  >
                    {food}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <div className="font-medium mb-1">Grapes</div>
              <div className="flex flex-wrap gap-2">
                {grapes.map(grape => (
                  <Badge
                    key={grape}
                    variant={selectedGrapes.includes(grape) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedGrapes(selectedGrapes.includes(grape) ? selectedGrapes.filter(g => g !== grape) : [...selectedGrapes, grape])}
                  >
                    {grape}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mb-2">
              <div className="font-medium mb-1">Cooler Layer</div>
              <Select value={selectedLayer} onValueChange={setSelectedLayer}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select layer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {layers.map(layer => (
                    <SelectItem key={layer} value={layer}>{layer}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
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
                  className="wine-menu-item cursor-pointer hover:bg-white/10 transition-colors p-3 rounded-lg flex items-center gap-4"
                  onClick={() => onWineSelect(wine.document.wine.vintage_id)}
                >
                  {wine.document.wine.thumb && (
                    <div className="wine-thumb-vignette">
                      <Image
                        src={wine.document.wine.thumb}
                        alt={wine.document.wine.name}
                        width={64}
                        height={85}
                        className="wine-thumb-img"
                        loading="lazy"
                        style={{ objectFit: 'cover', borderRadius: '0.75rem' }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-theme-text font-medium truncate">{wine.document.wine.name}</h4>
                      <span className="text-theme-text/60 text-sm">{wine.document.wine.year}</span>
                    </div>
                    <p className="text-theme-text/70 text-sm truncate">{wine.document.wine.winery}</p>
                    <p className="text-theme-text/60 text-xs mt-1 truncate">{wine.document.wine.grapes}</p>
                    {wine.document.cooler_position && (
                      <div className="mt-2 text-xs text-theme-text/50 italic">
                        <p>
                          {wine.document.cooler_position.layer_name}, Row {wine.document.cooler_position.row}, Level {wine.document.cooler_position.level}, Column {wine.document.cooler_position.column}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
