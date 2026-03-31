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
  Pill,
} from "lucide-react"

const HealthScanner = () => {
  const [review, setReview] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  const token = localStorage.getItem("token")

 
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/ml/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log("HISTORY:", res.data) 

      setHistory(res.data.data || [])
    } catch (err) {
      console.error("History error:", err.response?.data || err.message)
    }
  }


  useEffect(() => {
    if (token) {
      fetchHistory()
    }
  }, [token])

  const handleAnalyze = async () => {
    if (!review.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const res = await axios.post(
        `${API_BASE_URL}/ml/analyze`,
        { review },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setResult(res.data.data.result)

      fetchHistory() // refresh history after new prediction
    } catch (err) {
      console.error("Analyze error:", err.response?.data || err.message)
    }

    setLoading(false)
  }

  const getPercent = (c) => {
    if (!c) return 0
    return parseFloat(c) || 0
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI NLP Health Analyzer
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Input */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Textarea
            placeholder="Describe your symptoms or health issue..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
          />

          <Button onClick={handleAnalyze} disabled={loading} className="w-full">
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
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-500 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Analysis Result
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Condition</p>
              <p className="text-lg font-semibold">
                {result.predicted_condition}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Confidence: {result.confidence}
              </p>

              <div className="h-2 bg-muted rounded-full mt-1">
                <div
                  className="h-2 bg-green-500 rounded-full"
                  style={{
                    width: `${getPercent(result.confidence)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Pill className="h-4 w-4 text-blue-500" />
                Recommended Drugs
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {(result.top_3_recommended_drugs || []).map((drug, i) => (
                  <div key={i} className="border rounded-lg p-3 bg-muted/30">
                    <p className="font-medium">{drug.drugName}</p>
                    <p className="text-sm text-muted-foreground">
                      Rating: {drug.avg_rating || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Useful: {drug.total_useful_count || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* =========================
         HISTORY
      ========================= */}
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

          {history.map((item) =>
            item.predictions?.map((pred, index) => {
              const output = pred.output || {}

              return (
                <div
                  key={`${item._id}-${index}`}
                  className="border rounded-lg p-4 space-y-2 bg-muted/20"
                >
                  {/* USER EMAIL */}
                  {item.userHealthId?.email && (
                    <p className="text-xs text-muted-foreground">
                      User: {item.userHealthId.email}
                    </p>
                  )}

                  {/* SYMPTOMS */}
                  <p className="text-sm">
                    <span className="font-semibold">Symptoms:</span>{" "}
                    {pred.input?.symptoms?.join(", ") || "N/A"}
                  </p>

                  {/* DISEASE + CONFIDENCE */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {output.predictions?.[0]?.disease || "N/A"}
                    </Badge>

                    <Badge variant="outline">
                      Confidence:{" "}
                      {output.predictions?.[0]?.confidence || "N/A"}
                    </Badge>
                  </div>

                  {/* TIME */}
                  <p className="text-xs text-muted-foreground">
                    {new Date(pred.createdAt).toLocaleString()}
                  </p>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default HealthScanner