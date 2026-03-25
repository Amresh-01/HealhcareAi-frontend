import { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"

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

const user = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "/avatar.png",
}

const navItems = [
  { path: "/", label: "Home" },
  { path: "/symptoms", label: "Symptoms" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/doctors", label: "Doctors" },
]

function NavItems({ onClose }) {
  return navItems.map((item) => (
    <NavLink
      key={item.path}
      to={item.path}
      onClick={onClose}
      className={({ isActive }) =>
        `relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md hover:text-primary ${
          isActive ? "text-primary" : "text-muted-foreground"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {item.label}
          {isActive && (
            <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary transition-all duration-300" />
          )}
        </>
      )}
    </NavLink>
  ))
}

function MobileNavItems({ onClose }) {
  return navItems.map((item) => (
    <NavLink
      key={item.path}
      to={item.path}
      onClick={onClose}
      className={({ isActive }) =>
        `px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`
      }
    >
      {item.label}
    </NavLink>
  ))
}

export function Navbar({ isDarkMode, onToggleDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const navigate = useNavigate()

  const handleLogout = () => {
    setIsAuthenticated(false)
    navigate("/")
  }

  const getUserInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 transition-transform duration-200 hover:scale-105"
          aria-label="HealthCareAI Home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            HealthCare<span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          <NavItems />
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="rounded-xl hover:bg-muted transition-colors duration-200"
          >
            {isDarkMode
              ? <Sun className="h-4 w-4 transition-transform duration-300 rotate-0 hover:rotate-12" />
              : <Moon className="h-4 w-4 transition-transform duration-300 hover:-rotate-12" />
            }
          </Button>

          {/* Auth: Desktop */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 w-10 rounded-full p-0 ring-2 ring-transparent hover:ring-primary/30 transition-all duration-200"
                  aria-label="Open user menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-60 rounded-xl shadow-lg p-1">
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold leading-tight">{user.name}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{user.email}</p>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="rounded-lg cursor-pointer gap-2 px-3 py-2 text-sm">
                  <Link to="/profile">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="rounded-lg cursor-pointer gap-2 px-3 py-2 text-sm">
                  <Link to="/settings">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-lg cursor-pointer gap-2 px-3 py-2 text-sm text-red-500 focus:text-red-500 focus:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-xl border-border hover:border-primary/50 hover:text-primary transition-all duration-200 px-5"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="rounded-xl px-5 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open mobile menu"
                className="rounded-xl hover:bg-muted transition-colors duration-200"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-72 p-0">
              <div className="flex flex-col h-full">

                {/* Mobile Header */}
                <div className="flex items-center gap-2 px-6 py-5 border-b">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                    <Activity className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-base">
                    Health<span className="text-primary">AI</span>
                  </span>
                </div>

                {/* Mobile Nav Items */}
                <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile navigation">
                  <MobileNavItems onClose={() => setMobileMenuOpen(false)} />
                </nav>

                {/* Mobile Auth */}
                <div className="mt-auto px-4 py-5 border-t">
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 px-2 py-2">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                            {getUserInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl hover:bg-muted transition-colors duration-200"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl hover:bg-muted transition-colors duration-200"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => { setMobileMenuOpen(false); handleLogout() }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl text-red-500 hover:bg-red-500/10 transition-colors duration-200 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Button
                        variant="outline"
                        asChild
                        className="border-border hover:border-primary/50 hover:text-primary transition-all duration-200 w-full h-14 text-lg rounded-xl"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link to="/login">Login44</Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link to="/signup">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>

              </div>
            </SheetContent>
          </Sheet>

        </div>
      </div>
    </header>
  )
}