import React, { useState, useEffect } from "react"
import axios from "axios"
import { API_BASE_URL } from "../../config"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

import {
  Loader2,
  Sparkles,
  CheckCircle,
  History,
} from "lucide-react"

const HealthScanner = () => {
  const [review, setReview] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState("")

  const token = localStorage.getItem("token")

  /* =========================
     FETCH HISTORY
  ========================= */
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/ml/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setHistory(res?.data?.data || [])
    } catch (err) {
      console.error("History error:", err.response?.data || err.message)
    }
  }

  useEffect(() => {
    if (token) fetchHistory()
  }, [token])

  /* =========================
     ANALYZE TEXT
  ========================= */
  const handleAnalyze = async () => {
    if (!review.trim()) return

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const res = await axios.post(
        `${API_BASE_URL}/ml/analyze`,
        { text: review },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const apiResult = res?.data?.data?.result || null

      setResult(apiResult)

      fetchHistory()
    } catch (err) {
      console.error("Analyze error:", err.response?.data || err.message)
      setError("Failed to analyze input")
    } finally {
      setLoading(false)
    }
  }

  /* =========================
     SCORE COLOR
  ========================= */
  const getScoreColor = (score = 0) => {
    if (score > 80) return "bg-green-500"
    if (score > 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* HEADER */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Health Analyzer
          </CardTitle>
        </CardHeader>
      </Card>

      {/* INPUT */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Textarea
            placeholder="Describe what you ate today..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
          />

          <Button
            onClick={handleAnalyze}
            disabled={loading || !review.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Analyze
              </>
            )}
          </Button>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* RESULT */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-500 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Health Analysis Result
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            {/* DETECTED ITEMS */}
            <div>
              <p className="text-sm text-muted-foreground">Detected Items</p>

              <div className="flex flex-wrap gap-2 mt-1">
                {Array.isArray(result?.detectedItems) &&
                result.detectedItems.length > 0 ? (
                  result.detectedItems.map((item, i) => (
                    <Badge key={i}>{item}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No items detected
                  </p>
                )}
              </div>
            </div>

            {/* CALORIES */}
            <div>
              <p className="text-sm text-muted-foreground">Calories</p>
              <p className="text-lg font-semibold">
                {result?.calories || 0} kcal
              </p>
            </div>

            {/* ACTIVITY */}
            <div>
              <p className="text-sm text-muted-foreground">Activity Level</p>
              <Badge variant="outline">
                {result?.activityLevel || "Unknown"}
              </Badge>
            </div>

            {/* SCORE */}
            <div>
              <p className="text-sm text-muted-foreground">
                Health Score: {result?.healthScore || 0}/100
              </p>

              <div className="h-2 bg-muted rounded-full mt-1">
                <div
                  className={`h-2 rounded-full ${getScoreColor(result?.healthScore)}`}
                  style={{ width: `${result?.healthScore || 0}%` }}
                />
              </div>
            </div>

            {/* RISK FLAGS */}
            <div>
              <p className="text-sm text-muted-foreground">Risk Flags</p>

              {Array.isArray(result?.riskFlags) &&
              result.riskFlags.length > 0 ? (
                result.riskFlags.map((risk, i) => (
                  <Badge key={i} variant="destructive" className="mr-2">
                    {risk}
                  </Badge>
                ))
              ) : (
                <p className="text-green-500 text-sm">No risks detected</p>
              )}
            </div>

            {/* RECOMMENDATION */}
            <div>
              <p className="text-sm text-muted-foreground">Recommendation</p>
              <p className="font-medium">
                {result?.recommendation || "No recommendation"}
              </p>
            </div>

          </CardContent>
        </Card>
      )}

      {/* HISTORY */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            History
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {history.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No history found
            </p>
          )}

          {history.map((item) => (
            <div
              key={item._id}
              className="border rounded-lg p-4 space-y-2 bg-muted/20"
            >
              <p className="text-xs text-muted-foreground">
                {item?.createdAt
                  ? new Date(item.createdAt).toLocaleString()
                  : "No date"}
              </p>

              <p className="text-sm">
                <span className="font-semibold">Input:</span>{" "}
                {item?.inputText || "N/A"}
              </p>

              <p className="text-sm">
                <span className="font-semibold">Items:</span>{" "}
                {Array.isArray(item?.detectedItems) &&
                item.detectedItems.length > 0
                  ? item.detectedItems.join(", ")
                  : "None"}
              </p>

              <p className="text-sm">
                <span className="font-semibold">Calories:</span>{" "}
                {item?.calories || 0} kcal
              </p>

              <p className="text-sm">
                <span className="font-semibold">Score:</span>{" "}
                {item?.healthScore || 0}/100
              </p>

              <p className="text-sm">
                <span className="font-semibold">Recommendation:</span>{" "}
                {item?.recommendation || "No recommendation"}
              </p>
            </div>
          ))}

        </CardContent>
      </Card>

    </div>
  )
}

export default HealthScanner