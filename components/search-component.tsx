"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { debounce } from "@/lib/utils"
import { config } from "@/lib/config"
import { useAuth } from "@/components/auth-provider"

type SearchResult = {
  id: string
  score: number
  document: {
    wine: {
      vintage_id: number
      name: string
      name_seo: string
      year: number
      winery: string
      grapes: string
      foods: string
    }
    cooler_position?: {
      layer_id: number
      layer_name: string
      column: number
      row: number
      level: number
    }
  }
}

type SearchComponentProps = {
  token: string | null
  onWineSelect: (vintageId: number) => void
}

export default function SearchComponent({ token, onWineSelect }: SearchComponentProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()
  const { handleApiError } = useAuth()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const fetchResults = useCallback(
    async (term: string) => {
      if (!isClient || !token || term.length < 3) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`${config.backendUrl}/search?term=${encodeURIComponent(term)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          if (response.status === 403) {
            handleApiError({ status: 403 })
            return
          }
          throw new Error("Search failed")
        }

        const data = await response.json()
        setResults(data)
      } catch (error) {
        toast({
          title: "Search failed",
          description: "Could not fetch search results",
          variant: "destructive",
        })
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [token, toast, isClient, handleApiError],
  )

  // Debounce search to avoid too many requests
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      fetchResults(term)
    }, 500),
    [fetchResults],
  )

  useEffect(() => {
    if (isClient && searchTerm.length >= 3) {
      debouncedSearch(searchTerm)
    } else {
      setResults([])
    }
  }, [searchTerm, debouncedSearch, isClient])

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search wines (min 3 characters)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="glass-input pl-10"
        />
      </div>

      {loading && (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
      )}

      {!loading && searchTerm.length < 3 && (
        <p className="text-white/60 text-center text-sm p-4">Enter at least 3 characters to search</p>
      )}

      {!loading && searchTerm.length >= 3 && results.length === 0 && (
        <p className="text-white/60 text-center text-sm p-4">No results found for "{searchTerm}"</p>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((result) => (
            <div
              key={result.id}
              className="glass-card-inner p-3 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => onWineSelect(result.document.wine.vintage_id)}
            >
              <h3 className="text-white font-medium">{result.document.wine.name}</h3>
              <p className="text-white/70 text-sm">{result.document.wine.winery}</p>
              <p className="text-white/60 text-xs">{result.document.wine.year}</p>

              {result.document.cooler_position && (
                <div className="mt-2 text-xs text-white/50">
                  <p>
                    Location: {result.document.cooler_position.layer_name}, Row {result.document.cooler_position.row},
                    Level {result.document.cooler_position.level}, Column {result.document.cooler_position.column}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
