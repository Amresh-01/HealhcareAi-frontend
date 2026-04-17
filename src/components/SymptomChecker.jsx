import { useState, useEffect } from "react"
import axios from "axios"
import { X, Search, Loader2, CheckCircle, AlertCircle, Trash2, Sparkles, Activity, Plus } from "lucide-react"
import { API_BASE_URL } from "../../config"

export function SymptomChecker() {
  const [searchQuery, setSearchQuery] = useState("")
  const [allSymptoms, setAllSymptoms] = useState([])
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  // Popular symptoms fallback
  const popularSymptoms = ["Fever", "Cough", "Headache", "Fatigue", "Sore throat", "sharp abdominal pain",
    "headache",
    "vomiting",
    "sharp chest pain",
    "shortness of breath",
    "cough",
    "nausea",
    "dizziness",
    "fever",
    "back pain",
    "abnormal appearing skin",
    "depressive or psychotic symptoms",
    "leg pain",
    "skin swelling",
    "nasal congestion",
    "lower abdominal pain",
    "sore throat",
    "skin lesion",
    "skin rash",
    "abnormal involuntary movements",
    "pain in eye",
    "depression",
    "skin growth",
    "weakness",
    "anxiety and nervousness"
  ];

  // Remove duplicates from popular fallback for cleaner mapping
  const uniquePopularSymptoms = [...new Set(popularSymptoms.map(s => s.toLowerCase()))]

  // Fetch symptoms from backend
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/ml/symptoms?all=true`)
        setAllSymptoms(res.data.data?.symptoms || [])
      } catch (err) {
        console.error(err)
        setError("Failed to load symptoms from server.")
      }
    }
    fetchSymptoms()
  }, [])

  const filteredSymptoms = allSymptoms.filter(
    (s) =>
      s.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedSymptoms.includes(s)
  )

  const addSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) return
    setSelectedSymptoms((prev) => [...prev, symptom])
    setSearchQuery("")
  }

  const removeSymptom = (symptom) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s !== symptom))
  }

  const clearAll = () => {
    setSelectedSymptoms([])
    setResult(null)
    setError("")
  }

  const getColorClass = (p) =>
    p >= 70 ? "bg-red-500" :
      p >= 40 ? "bg-amber-500" :
        "bg-emerald-500"

  const analyzeSymptoms = async () => {
    if (!selectedSymptoms.length) return
    setIsAnalyzing(true)
    setResult(null)
    setError("")

    try {
      const response = await axios.post(
        `${API_BASE_URL}/ml/disease`,
        { symptoms: selectedSymptoms },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      const data = response.data

      setResult({
        normalizedSymptoms: data.data.normalizedSymptoms,
        conditions: data.data.result.predictions.map((p) => ({
          name: p.disease,
          probability: Math.round(p.confidence * 100),
        })),
        recommendations: [
          "Stay hydrated (2–3L water daily)",
          "Get 7–8 hours of sleep",
          "Avoid stress & monitor symptoms",
          "Consult a doctor if symptoms persist > 3 days",
        ],
      })
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Network or server error occurred")
    }
    setIsAnalyzing(false)
  }

  return (
    <div className="space-y-8 text-foreground w-full max-w-3xl mx-auto">

      {/* Input Section */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 overflow-visible relative z-20">
        <div className="flex items-center gap-2 mb-6">
          {/* <Activity className="h-5 w-5 text-primary" /> */}
          <h2 className="text-xl font-bold tracking-tight">Symptom Assessment</h2>
        </div>

        {/* Search */}
        <div className="relative group mb-6">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search and add your symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-input bg-background text-foreground placeholder-muted-foreground pl-12 pr-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all shadow-sm"
          />

          {searchQuery && (
            <div className="absolute z-50 mt-2 w-full rounded-xl border border-border bg-popover shadow-xl shadow-primary/5 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
              {filteredSymptoms.length > 0 ? (
                <div className="p-1">
                  {filteredSymptoms.slice(0, 8).map((symptom) => (
                    <div
                      key={symptom}
                      onClick={() => addSymptom(symptom)}
                      className="flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer rounded-lg hover:bg-muted transition text-popover-foreground transition-colors"
                    >
                      <span>{symptom}</span>
                      <Plus className="h-4 w-4 opacity-50" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No matching symptoms found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Symptoms */}
        {selectedSymptoms.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-semibold text-foreground">Selected Symptoms ({selectedSymptoms.length})</p>
              <button onClick={clearAll} className="text-xs font-medium flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors">
                <Trash2 className="h-3 w-3" /> Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-6 p-4 rounded-xl bg-muted/50 border border-border border-dashed">
              {selectedSymptoms.map((s) => (
                <span
                  key={s}
                  className="group flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-primary/10 text-primary border border-primary/20 shadow-sm"
                >
                  {s}
                  <button onClick={() => removeSymptom(s)} className="text-primary/70 hover:text-red-500 transition-colors focus:outline-none">
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>

            {/* Analyze Button */}
            <button
              onClick={analyzeSymptoms}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" /> Analyzing Symptoms...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" /> Generate Assessment
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Popular Suggestions (only show if no results yet to keep UI clean) */}
      {!result && (
        <div className="px-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
            Quick Add
          </p>
          <div className="flex flex-wrap gap-2">
            {uniquePopularSymptoms.slice(0, 30).map((s) => (
              <button
                key={s}
                onClick={() => addSymptom(s)}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors shadow-sm capitalize"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="rounded-2xl border border-border bg-card shadow-lg shadow-primary/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
          <div className="bg-muted/30 border-b border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Activity className="h-5 w-5 text-primary" />
                Analysis Results
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Based on {selectedSymptoms.length} reported symptoms</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium border border-amber-200 shadow-sm w-fit">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>AI Guidance Only - Not a Diagnosis</span>
              </div>
              
              {result.conditions && result.conditions.length > 0 && result.conditions[0].probability > 50 && (
                 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-[11px] font-bold border border-red-500/20 shadow-sm w-fit animate-pulse">
                   <Activity className="h-3 w-3" />
                   Priority Risk Detected: Transmitted to Triage AI
                 </div>
              )}
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Conditions */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Possible Conditions</h4>
              <div className="space-y-5">
                {result.conditions.map((c, idx) => (
                  <div key={c.name} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-semibold text-foreground text-base capitalize">{c.name.replace(/_/g, " ")}</span>
                      <span className="font-bold text-muted-foreground text-sm">{c.probability}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full ${getColorClass(c.probability)} transition-all duration-1000 ease-out`}
                        style={{ width: `${c.probability}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-border" />

            {/* Recommendations */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Next Steps
              </h4>
              <ul className="grid gap-3">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-3 text-sm text-foreground bg-muted/30 p-3 rounded-lg border border-border/50">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 p-4 bg-muted/50 rounded-xl border border-border text-xs text-muted-foreground text-center">
              This tool provides possible conditions based on symptoms for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Please consult a healthcare provider for any health concerns.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}