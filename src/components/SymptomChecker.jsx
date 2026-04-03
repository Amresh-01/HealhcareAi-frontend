import { useState, useEffect } from "react"
import axios from "axios"
import { X, Search, Loader2, CheckCircle, AlertCircle, Trash2, Sparkles } from "lucide-react"
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
    "anxiety and nervousness"]

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

  const getColor = (p) =>
    p >= 70 ? "from-red-500 to-pink-500" :
    p >= 40 ? "from-yellow-400 to-orange-400" :
    "from-green-400 to-emerald-500"

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
    <div className="space-y-6 text-gray-300">

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search symptoms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#030b1a] text-white placeholder-gray-400 pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#0ea5e9] outline-none transition"
        />

        {searchQuery && (
          <div className="absolute z-10 mt-2 w-full rounded-xl border border-white/10 bg-[#020817] shadow-xl max-h-44 overflow-y-auto animate-fade-in">
            {filteredSymptoms.length > 0 ? (
              filteredSymptoms.slice(0, 6).map((symptom) => (
                <div
                  key={symptom}
                  onClick={() => addSymptom(symptom)}
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-white/5 transition text-white"
                >
                  {symptom}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-400">
                No symptoms found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Popular */}
      <div>
        <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Popular
        </p>
        <div className="flex flex-wrap gap-2">
          {popularSymptoms.map((s) => (
            <button
              key={s}
              onClick={() => addSymptom(s)}
              className="px-3 py-1 text-xs rounded-full border border-white/10 hover:bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] hover:text-black transition-all hover:scale-105"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* Selected */}
      {selectedSymptoms.length > 0 && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-2 text-white">
            <p className="text-sm font-medium">Selected ({selectedSymptoms.length})</p>
            <button onClick={clearAll} className="text-xs flex items-center gap-1 text-red-500 hover:scale-105">
              <Trash2 className="h-3 w-3" /> Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSymptoms.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-gradient-to-r from-[#0ea5e9]/20 to-[#22d3ee]/20 border border-white/10 text-white"
              >
                {s}
                <button onClick={() => removeSymptom(s)}>
                  <X className="h-3 w-3 hover:text-red-500" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Analyze */}
      <button
        onClick={analyzeSymptoms}
        disabled={!selectedSymptoms.length || isAnalyzing}
        className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] text-black hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="animate-spin h-4 w-4" /> Ai Analyzing...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4" /> Analyze Symptoms
          </>
        )}
      </button>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {/* Results */}
      {result && (
        <div className="space-y-4 border border-white/10 p-4 rounded-xl bg-[#030b1a] text-white animate-fade-in">
          <h3 className="flex items-center gap-2 font-semibold">
            <AlertCircle className="h-4 w-4 text-[#0ea5e9]" /> Possible Conditions
          </h3>

          {result.conditions.map((c) => (
            <div key={c.name}>
              <div className="flex justify-between text-sm text-white">
                <span>{c.name}</span>
                <span>{c.probability}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${getColor(c.probability)} transition-all duration-700`}
                  style={{ width: `${c.probability}%` }}
                />
              </div>
            </div>
          ))}

          <h3 className="flex items-center gap-2 font-semibold mt-4">
            <CheckCircle className="h-4 w-4 text-green-400" /> Recommendations
          </h3>

          <ul className="text-sm space-y-1 text-gray-300">
            {result.recommendations.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>

          <p className="text-xs text-gray-400 border-t border-white/10 pt-2">
            ⚠️ This is AI-generated. Not a medical diagnosis.
          </p>
        </div>
      )}
    </div>
  )
}