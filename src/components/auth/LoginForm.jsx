import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { API_BASE_URL } from "../../../config" 

export function LoginForm() {
  const [name,setName]=useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!email || !password || !name) {
      setError("name and Email password are required")
      return
    }

    setLoading(true)

    try {
      const response = await axios.post(`${API_BASE_URL}/user/login`, {
        name,
        email,
        password,
      })

      const { user, accessToken, refreshToken } = response.data.data

      // Store user and tokens in localStorage
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("token", accessToken)
      localStorage.setItem("refreshToken", refreshToken)

      setLoading(false)
      navigate("/") 
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="space-y-1">
        <label className="text-sm font-medium">Full Name</label>
        <Input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded-xl"
        />
      </div>

      <div>
        <label className="text-sm text-gray-400">Email</label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        />
      </div>

      <div>
        <label className="text-sm text-gray-400">Password</label>
        <div className="relative mt-1">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 pr-10 px-5"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 hover:bg-blue-500"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  )
}