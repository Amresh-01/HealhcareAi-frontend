import { useState } from "react"
import { Button } from "@/components/ui/button.jsx"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet.jsx"
import { Activity, Menu, Moon, Sun, User, Settings, LogOut } from "lucide-react"

export function Navbar({ currentPage, onPageChange, isDarkMode, onToggleDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: "home", label: "Home" },
    { id: "symptoms", label: "Symptoms" },
    { id: "dashboard", label: "Dashboard" },
    { id: "doctors", label: "Doctors" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange("home")}
            className="flex items-center gap-2 hover:scale-105 transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">
              HealthCare<span className="text-primary">AI</span>
            </span>
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`relative px-4 py-2 text-sm font-medium ${
                currentPage === item.id
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
              {currentPage === item.id && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 bg-primary" />
              )}
            </button>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">

          {/* Dark Mode Toggle */}
          <Button variant="ghost" size="icon" onClick={onToggleDarkMode}>
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">john@example.com</p>
                </div>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-4 pt-8">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onPageChange(item.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`px-4 py-3 text-left text-sm rounded-lg ${
                      currentPage === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

        </div>
      </div>
    </header>
  )
}