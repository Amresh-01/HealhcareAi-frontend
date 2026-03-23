import { useState, useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"

import {Navbar}  from "./components/Navbar"
import { Footer } from "./components/Footer"

import { HeroSection } from "./pages/HeroSection"
import { Dashboard } from "./pages/Dashboard"
import { DoctorCards } from "./pages/DoctorCards"
import { SymptomChecker } from "./components/SymptomChecker"

import { AIChatAssistance } from "./components/AIChatAssistance"

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isChatExpanded, setIsChatExpanded] = useState(false)

  const location = useLocation()

  // Example: hide footer on chat-heavy pages if needed
  const hideFooter = location.pathname === "/dashboard"

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDarkMode(prefersDark)

    if (prefersDark) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <>
      <div className="min-h-screen flex flex-col bg-background">

        {/* Navbar */}
        <Navbar
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        {/* MAIN CONTENT */}
        <div className="flex flex-1">
          <main className="flex-1 p-4 overflow-y-auto pb-20">

            {/* ROUTES */}
            <Routes>
              <Route path="/" element={<HeroSection />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/doctors" element={<DoctorCards />} />
              <Route path="/symptoms" element={<SymptomChecker />} />
            </Routes>

          </main>
        </div>

        {/* Footer (conditionally render) */}
        {!hideFooter && <Footer />}

      </div>

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-primary text-white px-4 py-3 rounded-full shadow-lg hover:scale-105 transition"
        >
          💬 Ask AI
        </button>
      )}

      {/* AI Chat Assistant */}
      <AIChatAssistance
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        isExpanded={isChatExpanded}
        onToggleExpand={() => setIsChatExpanded(!isChatExpanded)}
      />
    </>
  )
}