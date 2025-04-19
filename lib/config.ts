// Configuration values from environment variables
export const config = {
  // Backend URL with fallback
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.example.com",

  // Theme colors with fallbacks
  theme: {
    primaryColor: process.env.NEXT_PUBLIC_THEME_PRIMARY_COLOR || "#6d28d9",
    secondaryColor: process.env.NEXT_PUBLIC_THEME_SECONDARY_COLOR || "#be185d",
    accentColor: process.env.NEXT_PUBLIC_THEME_ACCENT_COLOR || "#7c3aed",
    backgroundStart: process.env.NEXT_PUBLIC_THEME_BACKGROUND_START || "#1e1b4b",
    backgroundEnd: process.env.NEXT_PUBLIC_THEME_BACKGROUND_END || "#4c1d95",
    textColor: process.env.NEXT_PUBLIC_THEME_TEXT_COLOR || "#ffffff",
    cardOpacity: process.env.NEXT_PUBLIC_THEME_CARD_OPACITY || "0.1",
    glassBlur: process.env.NEXT_PUBLIC_THEME_GLASS_BLUR || "10px",
  },
}
