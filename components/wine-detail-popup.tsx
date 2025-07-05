"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { WineDetail } from "@/lib/types"
import Image from "next/image"

type WineDetailPopupProps = {
  wine: WineDetail
  onClose: () => void
}

export default function WineDetailPopup({ wine, onClose }: WineDetailPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-xl w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <h2 className="text-xl font-bold text-theme-text">Wine Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-theme-text">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-theme-text">{wine.name}</h3>
              <p className="text-theme-text/70">{wine.winery}</p>
            </div>
            {(wine as any).thumb && (
              <div className="wine-thumb-vignette wine-detail-thumb">
                <Image
                  src={(wine as any).thumb}
                  alt={wine.name}
                  width={120}
                  height={160}
                  className="wine-thumb-img"
                  loading="lazy"
                  style={{ objectFit: 'cover', borderRadius: '1.25rem' }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-theme-text/80">Description</h4>
            <p className="text-theme-text/70 text-sm">{wine.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-theme-text/80">Grapes</h4>
              <p className="text-theme-text/70 text-sm">{wine.grapes}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-theme-text/80">Pairs with</h4>
              <p className="text-theme-text/70 text-sm">{wine.foods}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
