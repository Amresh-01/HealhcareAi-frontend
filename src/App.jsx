// import { useState, useEffect } from "react"
// import { Navbar } from "@/components/Navbar"
// import { HeroSection } from "@/components/HeroSection"
// import { SymptomChecker } from "@/components/SymptomChecker"
// import { Dashboard } from "@/components/Dashboard"
// import { DoctorCards } from "@/components/DoctorCards"
// import { AIChatAssistant, ChatTriggerButton } from "@/components/AIChatAssistant"
// import { TrustBadgesCompact } from "@/components/TrustBadges"
// import { Activity, Github, Twitter, Linkedin, Mail } from "lucide-react"

// export default function App() {
//   const [currentPage, setCurrentPage] = useState("home")
//   const [isDarkMode, setIsDarkMode] = useState(false)
//   const [isChatOpen, setIsChatOpen] = useState(false)
//   const [isChatExpanded, setIsChatExpanded] = useState(false)

//   useEffect(() => {
//     const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
//     setIsDarkMode(prefersDark)

//     if (prefersDark) {
//       document.documentElement.classList.add("dark")
//     }
//   }, [])

//   const toggleDarkMode = () => {
//     setIsDarkMode(!isDarkMode)
//     document.documentElement.classList.toggle("dark")
//   }

//   const renderPage = () => {
//     switch (currentPage) {
//       case "home":
//         return <HeroSection onNavigate={setCurrentPage} />

//       case "symptoms":
//         return (
//           <div className="container mx-auto px-4 py-8">
//             <h1 className="text-3xl font-bold">AI Symptom Checker</h1>
//             <div className="mt-6 max-w-3xl mx-auto">
//               <SymptomChecker />
//             </div>
//           </div>
//         )

//       case "dashboard":
//         return (
//           <div className="container mx-auto px-4 py-8">
//             <Dashboard onNavigate={setCurrentPage} />
//           </div>
//         )

//       case "doctors":
//         return (
//           <div className="container mx-auto px-4 py-8">
//             <h1 className="text-3xl font-bold">Find a Doctor</h1>
//             <DoctorCards />
//           </div>
//         )

//       default:
//         return <HeroSection onNavigate={setCurrentPage} />
//     }
//   }

//   return (
//     <div className="min-h-screen bg-background">
      
//       <Navbar
//         currentPage={currentPage}
//         onPageChange={setCurrentPage}
//         isDarkMode={isDarkMode}
//         onToggleDarkMode={toggleDarkMode}
//       />

      
//       <main className="pb-20">{renderPage()}</main>

      
//       <footer className="border-t bg-card/50">
//         <div className="container mx-auto px-4 py-12">

//           <div className="grid gap-8 md:grid-cols-4">

//             {/* Brand */}
//             <div>
//               <div className="flex items-center gap-2">
//                 <div className="h-9 w-9 flex items-center justify-center bg-primary text-white rounded-lg">
//                   <Activity className="h-5 w-5" />
//                 </div>
//                 <span className="text-xl font-bold">
//                   HealthCare<span className="text-primary">AI</span>
//                 </span>
//               </div>

//               <p className="mt-4 text-sm text-muted-foreground">
//                 AI-powered health insights platform.
//               </p>

//               <div className="flex gap-4 mt-4">
//                 <Twitter className="h-5 w-5" />
//                 <Github className="h-5 w-5" />
//                 <Linkedin className="h-5 w-5" />
//                 <Mail className="h-5 w-5" />
//               </div>
//             </div>

//             {/* Links */}
//             <div>
//               <h4 className="font-semibold mb-4">Product</h4>
//               <button onClick={() => setCurrentPage("symptoms")}>Symptoms</button>
//               <br />
//               <button onClick={() => setCurrentPage("dashboard")}>Dashboard</button>
//             </div>

//           </div>

//           <div className="mt-8 border-t pt-6 text-center">
//             <p className="text-sm text-muted-foreground">
//               © 2026 HealthCareAI
//             </p>
//             <TrustBadgesCompact />
//           </div>
//         </div>
//       </footer>

//       {!isChatOpen && (
//         <ChatTriggerButton onClick={() => setIsChatOpen(true)} />
//       )}

//       <AIChatAssistant
//         isOpen={isChatOpen}
//         onClose={() => setIsChatOpen(false)}
//         isExpanded={isChatExpanded}
//         onToggleExpand={() => setIsChatExpanded(!isChatExpanded)}
//       />
//     </div>
//   )
// }