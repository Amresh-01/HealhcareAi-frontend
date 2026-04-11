import React, { useState, useEffect } from "react"
import axios from "axios"
import { API_BASE_URL } from "../../config"

import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

const MedicineSearch = () => {
  const token = localStorage.getItem("token")

  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")


  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    const delay = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/ml/medicine/suggest`,
          {
            params: { q: query },
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        setSuggestions(res.data.suggestions || [])
      } catch (err) {
        console.error("Suggest error:", err.message)
      }
    }, 400)

    return () => clearTimeout(delay)
  }, [query, token])

  const handleSearch = async (name) => {
    if (!name.trim()) return

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const res = await axios.get(
        `${API_BASE_URL}/ml/medicine/search`,
        {
          params: { name },
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setResult(res.data.data)
      setSuggestions([])
    } catch (err) {
      setError("Medicine not found")
      console.error(err.response?.data || err.message)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* 🔍 SEARCH INPUT */}
      <Card>
        <CardHeader>
          <CardTitle>Medicine Search</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <Input
            placeholder="Search medicine..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {/* 🔽 AUTOCOMPLETE */}
          {suggestions.length > 0 && (
            <div className="border rounded-md bg-background shadow">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setQuery(s)
                    handleSearch(s)
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-muted text-sm"
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ⏳ LOADING */}
      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin h-4 w-4" />
          Searching...
        </div>
      )}

      {/* ❌ ERROR */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* ✅ RESULT */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>{result.name}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">

            <p><strong>Type:</strong> {result.type}</p>

            <p>
              <strong>Category:</strong>{" "}
              <Badge>{result.category}</Badge>
            </p>

            <p><strong>Composition:</strong> {result.composition}</p>

            <p><strong>Uses:</strong> {result.uses}</p>

            <p><strong>Side Effects:</strong> {result.side_effects}</p>

            <p><strong>Manufacturer:</strong> {result.manufacturer}</p>

            <p><strong>Status:</strong> {result.status}</p>

            {/* 🔁 ALTERNATIVES */}
            <div>
              <strong>Alternatives:</strong>
              <div className="flex flex-wrap gap-2 mt-1">
                {result.alternatives?.length > 0 ? (
                  result.alternatives.map((alt, i) => (
                    <Badge key={i} variant="outline">
                      {alt}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground ml-2">
                    None
                  </span>
                )}
              </div>
            </div>

          </CardContent>
        </Card>
      )}

    </div>
  )
}

export default MedicineSearch