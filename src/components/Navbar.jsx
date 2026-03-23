import { useState } from "react"
import { Link, NavLink } from "react-router-dom"

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

export function Navbar({ isDarkMode, onToggleDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/symptoms", label: "Symptoms" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/doctors", label: "Doctors" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        <Link to="/" className="flex items-center gap-2 hover:scale-105 transition">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">
            HealthCare<span className="text-primary">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative px-4 py-2 text-sm font-medium transition ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 bg-primary" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ✅ Right Section */}
        <div className="flex items-center gap-2">

          {/* Dark Mode */}
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

          {/* ✅ Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-4 pt-8">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-lg text-sm ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </SheetContent>
          </Sheet>

        </div>
      </div>
    </header>
  )
}