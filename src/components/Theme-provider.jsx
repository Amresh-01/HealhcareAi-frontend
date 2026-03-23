import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDarkMode(prefersDark)
    if (prefersDark) document.documentElement.classList.add("dark")
  }, [])

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}