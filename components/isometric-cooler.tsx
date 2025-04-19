"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useGesture } from "@use-gesture/react"
import { motion } from "framer-motion"

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

type IsometricCoolerProps = {
  data: Chamber[]
  onWineSelect: (vintageId: number) => void
}

export default function IsometricCooler({ data, onWineSelect }: IsometricCoolerProps) {
  const [activeChamberId, setActiveChamberId] = useState<string | null>(null)
  const [activeLayerId, setActiveLayerId] = useState<number | null>(null)
  const [rotation, setRotation] = useState({ x: 30, y: -30 })
  const [scale, setScale] = useState(1)
  const [hoveredBottle, setHoveredBottle] = useState<MatrixItem | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [initialRender, setInitialRender] = useState(true)

  // Set initial active chamber and layer
  useEffect(() => {
    if (data && data.length > 0) {
      setActiveChamberId(data[0].name)
      if (data[0].layers.length > 0) {
        setActiveLayerId(data[0].layers[0].id)
      }
    }

    // Set initial render to false after a short delay
    const timer = setTimeout(() => {
      setInitialRender(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [data])

  // Get active chamber and layer
  const activeChamber = data?.find((c) => c.name === activeChamberId) || data?.[0]
  const activeLayer = activeChamber?.layers.find((l) => l.id === activeLayerId) || activeChamber?.layers[0]

  // Set up gesture handling for rotation and zooming
  const bind = useGesture(
    {
      onDrag: ({ movement: [mx, my], first, memo }) => {
        if (first) {
          memo = { x: rotation.x, y: rotation.y }
        }

        setRotation({
          x: Math.min(Math.max(memo.x + my * 0.5, 0), 60), // Limit x rotation
          y: memo.y - mx * 0.5,
        })

        return memo
      },
      onPinch: ({ offset: [d] }) => {
        const newScale = 0.5 + d / 50
        setScale(Math.min(Math.max(newScale, 0.5), 2))
      },
    },
    {
      drag: {
        filterTaps: true,
      },
    },
  )

  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <p className="text-theme-text text-center">No wine cooler data available</p>
      </div>
    )
  }

  // Chamber selection buttons
  const renderChamberButtons = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {data.map((chamber) => (
        <button
          key={chamber.name}
          className={cn(
            "px-3 py-1 rounded-md text-sm font-medium transition-colors",
            activeChamberId === chamber.name
              ? "bg-theme-accent text-white"
              : "bg-white/10 text-theme-text hover:bg-white/20",
          )}
          onClick={() => {
            setActiveChamberId(chamber.name)
            if (chamber.layers.length > 0) {
              setActiveLayerId(chamber.layers[0].id)
            }
          }}
        >
          {chamber.name}
        </button>
      ))}
    </div>
  )

  // Layer selection buttons
  const renderLayerButtons = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {activeChamber?.layers.map((layer) => (
        <button
          key={layer.id}
          className={cn(
            "px-3 py-1 rounded-md text-sm font-medium transition-colors",
            activeLayerId === layer.id ? "bg-theme-accent text-white" : "bg-white/10 text-theme-text hover:bg-white/20",
          )}
          onClick={() => setActiveLayerId(layer.id)}
        >
          {layer.name}
        </button>
      ))}
    </div>
  )

  // Render the 3D wine rack
  const renderWineRack = () => {
    if (!activeLayer) return null

    return (
      <div className="wine-rack">
        {Array.from({ length: activeLayer.levels }).map((_, levelIndex) => {
          // Level 1 is at the bottom
          const levelNum = levelIndex + 1
          const levelOffset = levelIndex * 40 // Vertical spacing between levels

          return (
            <div
              key={`level-${levelNum}`}
              className="wine-rack-level"
              style={{
                transform: `translateY(${-levelOffset}px)`,
              }}
            >
              {/* Rack frame */}
              <div className="wine-rack-frame">
                {/* Front horizontal bars */}
                <div className="wine-rack-bar wine-rack-bar-front-top"></div>
                <div className="wine-rack-bar wine-rack-bar-front-bottom"></div>

                {/* Back horizontal bars */}
                <div className="wine-rack-bar wine-rack-bar-back-top"></div>
                <div className="wine-rack-bar wine-rack-bar-back-bottom"></div>

                {/* Vertical posts */}
                <div className="wine-rack-post wine-rack-post-front-left"></div>
                <div className="wine-rack-post wine-rack-post-front-right"></div>
                <div className="wine-rack-post wine-rack-post-back-left"></div>
                <div className="wine-rack-post wine-rack-post-back-right"></div>

                {/* Side bars */}
                <div className="wine-rack-bar wine-rack-bar-left-top"></div>
                <div className="wine-rack-bar wine-rack-bar-left-bottom"></div>
                <div className="wine-rack-bar wine-rack-bar-right-top"></div>
                <div className="wine-rack-bar wine-rack-bar-right-bottom"></div>
              </div>

              {/* Wine bottles grid */}
              <div className="wine-bottles-container">
                {Array.from({ length: activeLayer.rows }).map((_, rowIndex) => {
                  // Row 1 is at the front
                  const rowNum = activeLayer.rows - rowIndex
                  const rowOffset = rowIndex * (100 / activeLayer.rows) // Percentage-based positioning

                  return (
                    <div
                      key={`level-${levelNum}-row-${rowNum}`}
                      className="wine-bottles-row"
                      style={{
                        top: `${rowOffset}%`,
                        width: "100%",
                        height: `${100 / activeLayer.rows}%`,
                      }}
                    >
                      {Array.from({ length: activeLayer.columns }).map((_, colIndex) => {
                        const column = colIndex + 1
                        const bottle = activeLayer.matrix.find(
                          (item) => item.row === rowNum && item.column === column && item.level === levelNum,
                        )

                        const colWidth = 100 / activeLayer.columns // Percentage-based width

                        return (
                          <div
                            key={`level-${levelNum}-row-${rowNum}-col-${column}`}
                            className="wine-bottle-slot"
                            style={{
                              width: `${colWidth}%`,
                              left: `${colIndex * colWidth}%`,
                            }}
                            onClick={() => bottle && onWineSelect(bottle.vintage_id)}
                            onMouseEnter={() => setHoveredBottle(bottle || null)}
                            onMouseLeave={() => setHoveredBottle(null)}
                          >
                            {bottle ? (
                              <div className="wine-bottle">
                                <div className="wine-bottle-body"></div>
                                <div className="wine-bottle-neck"></div>
                                <div className="wine-bottle-cap"></div>
                              </div>
                            ) : (
                              <div className="wine-bottle-empty"></div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 rounded-xl">
        {renderChamberButtons()}
        {renderLayerButtons()}
      </div>

      <div className="glass-card p-6 rounded-xl">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-theme-text">
            {activeChamber?.name} - {activeLayer?.name}
          </h2>
          <p className="text-sm text-theme-text/70 mt-1">Drag to rotate • Pinch to zoom • Click a bottle for details</p>
        </div>

        <div ref={containerRef} className="wine-cooler-container" {...bind()} style={{ touchAction: "none" }}>
          <motion.div
            className={cn("wine-cooler-scene", initialRender && "invisible")}
            animate={{
              rotateX: rotation.x,
              rotateY: rotation.y,
              scale: scale,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            {renderWineRack()}
          </motion.div>
        </div>

        {hoveredBottle && (
          <div className="mt-4 p-3 bg-black/30 rounded-lg">
            <p className="text-theme-text font-medium">{hoveredBottle.content}</p>
            <p className="text-theme-text/70 text-sm">
              Row {hoveredBottle.row}, Column {hoveredBottle.column}, Level {hoveredBottle.level}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
