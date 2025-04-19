export type Wine = {
  vintage_id: number
  name: string
  name_seo: string
  year: number
  winery: string
  grapes: string
  foods: string
  type?: string
}

export type WineDetail = {
  name: string
  name_seo: string
  description: string
  winery: string
  grapes: string
  foods: string
  type?: string
}

export type CoolerPosition = {
  layer_id: number
  layer_name: string
  column: number
  row: number
  level: number
}

export type SearchResult = {
  id: string
  score: number
  document: {
    wine: Wine
    cooler_position?: CoolerPosition
  }
}
