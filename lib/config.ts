// Configuration values from environment variables
export const config = {
  // Backend URL with fallback
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.example.com",

  // Theme colors with fallbacks
  theme: {
    primaryFrom: process.env.NEXT_PUBLIC_THEME_PRIMARY_FROM || "purple-900",
    primaryTo: process.env.NEXT_PUBLIC_THEME_PRIMARY_TO || "rose-900",
  },
}
