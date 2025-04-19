"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type MatrixItem = {
  id: number
  row: number
  level: number
  column: number
  content: string
  vintage_id: number
}

type Layer = {
  id: number
  name: string
  rows: number
  levels: number
  columns: number
  matrix: MatrixItem[]
}

type Chamber = {
  name: string
  layers: Layer[]
}

type WineCoolerProps = {
  data: Chamber[]
  onWineSelect: (vintageId: number) => void
}

export default function WineCooler({ data, onWineSelect }: WineCoolerProps) {
  const [expandedChamber, setExpandedChamber] = useState<string | null>(null)
  const [expandedLayer, setExpandedLayer] = useState<number | null>(null)

  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <p className="text-white text-center">No wine cooler data available</p>
      </div>
    )
  }

  const toggleChamber = (chamberName: string) => {
    if (expandedChamber === chamberName) {
      setExpandedChamber(null)
      setExpandedLayer(null)
    } else {
      setExpandedChamber(chamberName)
      setExpandedLayer(null)
    }
  }

  const toggleLayer = (layerId: number) => {
    if (expandedLayer === layerId) {
      setExpandedLayer(null)
    } else {
      setExpandedLayer(layerId)
    }
  }

  return (
    <div className="space-y-4">
      {data.map((chamber) => (
        <div key={chamber.name} className="glass-card rounded-xl overflow-hidden">
          <div
            className="p-4 flex items-center justify-between cursor-pointer"
            onClick={() => toggleChamber(chamber.name)}
          >
            <h2 className="text-xl font-semibold text-white">{chamber.name}</h2>
            {expandedChamber === chamber.name ? (
              <ChevronDown className="h-5 w-5 text-white" />
            ) : (
              <ChevronRight className="h-5 w-5 text-white" />
            )}
          </div>

          {expandedChamber === chamber.name && (
            <div className="px-4 pb-4 space-y-3">
              {chamber.layers.map((layer) => (
                <div key={layer.id} className="glass-card-inner rounded-lg overflow-hidden">
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleLayer(layer.id)}
                  >
                    <h3 className="text-lg font-medium text-white">{layer.name}</h3>
                    {expandedLayer === layer.id ? (
                      <ChevronDown className="h-4 w-4 text-white" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-white" />
                    )}
                  </div>

                  {expandedLayer === layer.id && (
                    <div className="p-3">
                      <div className="grid grid-cols-1 gap-4">
                        {Array.from({ length: layer.levels }).map((_, levelIndex) => (
                          <div key={levelIndex} className="space-y-2">
                            <h4 className="text-sm font-medium text-white/80">Level {levelIndex + 1}</h4>
                            <div
                              className="grid"
                              style={{ gridTemplateColumns: `repeat(${layer.columns}, minmax(0, 1fr))` }}
                            >
                              {Array.from({ length: layer.rows * layer.columns }).map((_, cellIndex) => {
                                const row = Math.floor(cellIndex / layer.columns) + 1
                                const column = (cellIndex % layer.columns) + 1
                                const bottle = layer.matrix.find(
                                  (item) => item.row === row && item.column === column && item.level === levelIndex + 1,
                                )

                                return (
                                  <div
                                    key={cellIndex}
                                    className={cn(
                                      "aspect-square border border-white/20 rounded-md m-1 p-1 flex items-center justify-center text-center text-xs",
                                      bottle ? "bg-white/20 cursor-pointer" : "bg-white/5",
                                    )}
                                    onClick={() => bottle && onWineSelect(bottle.vintage_id)}
                                    title={bottle?.content || "Empty"}
                                  >
                                    {bottle ? (
                                      <span className="line-clamp-3 text-white">
                                        {bottle.content.split(" ").slice(0, 2).join(" ")}...
                                      </span>
                                    ) : (
                                      <span className="text-white/40">Empty</span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
