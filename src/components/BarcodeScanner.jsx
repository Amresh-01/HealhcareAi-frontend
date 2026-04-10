import React, { useState, useEffect, useRef, useCallback } from "react"
import { Html5Qrcode } from "html5-qrcode"
import axios from "axios"
import { API_BASE_URL } from "../../config"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

import {
  Loader2,
  ScanBarcode,
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Package,
  AlertTriangle,
  Zap,
  Building2,
  Pill,
  Box,
  Globe,
  FileText,
  ShieldCheck,
  Layers,
  Fingerprint,
  Info,
  Activity,
  TrendingUp,
  TrendingDown,
  Scale,
  Droplet,
  Flame,
  Apple,
  ThumbsUp,
  ThumbsDown,
  AlertCircle
} from "lucide-react"

// Beep sound on success
const beep = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg")

/* ────────────────────────────────────────────────────────────── */
/*  Helper Components                                             */
/* ────────────────────────────────────────────────────────────── */
const InfoCard = ({ icon: Icon, label, value, colorClass = "text-primary", suffix = "" }) => {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/30 transition-all group">
      <div className={`p-2 rounded-lg bg-background shadow-sm group-hover:scale-110 transition-transform ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">{label}</p>
        <p className="text-sm font-semibold truncate text-foreground">{value}{suffix}</p>
      </div>
    </div>
  )
}

const NutrientCard = ({ label, value, unit, icon: Icon, colorClass }) => {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${colorClass}`} />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-bold text-foreground">
        {value}{unit && ` ${unit}`}
      </span>
    </div>
  )
}

const DetailSection = ({ title, icon: Icon, children }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 px-1">
      <Icon className="h-4 w-4 text-primary/70" />
      <h3 className="text-sm font-bold tracking-tight text-foreground/80 uppercase">{title}</h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {children}
    </div>
  </div>
)

const BarcodeScanner = () => {
  const scannerRef = useRef(null)
  const token = localStorage.getItem("token")

  const [scanning, setScanning] = useState(false)
  const [scannedCode, setScannedCode] = useState("")
  const [manualCode, setManualCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [cameraError, setCameraError] = useState("")
  const [flash, setFlash] = useState(false)
  const [history, setHistory] = useState([])

  /* ── STOP SCANNER ── */
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
        scannerRef.current = null
      } catch (err) {
        console.warn("Scanner stop error:", err)
      }
    }
    setScanning(false)
  }, [])

  /* ── START SCANNER (UPI STYLE) ── */
  const lastScanRef = useRef("")

  const startScanner = useCallback(async () => {
    setError("")
    setCameraError("")
    setResult(null)
    setScannedCode("")

    try {
      setScanning(true)

      // Ensure previous scanner is stopped
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop()
          scannerRef.current.clear()
        } catch (e) {
          console.warn("Previous scanner cleanup:", e)
        }
      }

      const html5QrCode = new Html5Qrcode("reader")
      scannerRef.current = html5QrCode

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 180 },
        aspectRatio: 1.777778
      }

      const handleScanSuccess = async (decodedText) => {
        if (lastScanRef.current === decodedText) return

        lastScanRef.current = decodedText

        beep.play().catch(() => { })

        setFlash(true)
        setTimeout(() => setFlash(false), 500)

        setScannedCode(decodedText)

        try {
          if (scannerRef.current) {
            await scannerRef.current.stop()
            await scannerRef.current.clear()
            scannerRef.current = null
          }
        } catch (err) {
          console.warn("Stop error:", err)
        }

        setScanning(false)
      }

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        handleScanSuccess
      )

    } catch (err) {
      console.error(err)
      setScanning(false)
      setCameraError(err.message || "Failed to access camera.")
    }
  }, [])
  
  /* ── AUTO-START ON MOUNT ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!scanning) startScanner()
    }, 500)

    return () => {
      clearTimeout(timer)
      stopScanner()
    }
  }, [])

  /* ── BACKEND API CALL ── */
  const handleApi = useCallback(async (barcode) => {
    if (!barcode.trim()) return
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const res = await axios.post(
        `${API_BASE_URL}/ml/barcode`,
        { barcode },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      // Extract data from response structure
      const responseData = res.data?.data || res.data
      setResult(responseData)

      // update history
      const displayName = responseData?.productName || 
                         responseData?.name || 
                         "Product"
      setHistory(prev => [
        { barcode, name: displayName },
        ...prev.slice(0, 4)
      ])
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Product not found in database. Ensure the code is clear."
      )
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (scannedCode) handleApi(scannedCode)
  }, [scannedCode, handleApi])

  /* ── UI HELPERS ── */
  const handleManualLookup = () => {
    if (!manualCode.trim()) return
    setScannedCode("")
    setResult(null)
    setError("")
    handleApi(manualCode.trim())
  }

  const handleReset = () => {
    stopScanner()
    setScannedCode("")
    setManualCode("")
    setResult(null)
    setError("")
  }

  const product = result || {}

  const getGradeColor = (grade) => {
    if (!grade) return "text-primary bg-primary/10 border-primary/20"
    switch(grade?.charAt(0)) {
      case 'A': return "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20"
      case 'B': return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      case 'C': return "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
      case 'D': return "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20"
      case 'E': return "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20"
      default: return "text-primary bg-primary/10 border-primary/20"
    }
  }

  const getRecommendationIcon = (recommendation) => {
    if (!recommendation) return <Activity className="h-5 w-5" />
    const rec = recommendation.toLowerCase()
    if (rec.includes("avoid") || rec.includes("limit")) return <ThumbsDown className="h-5 w-5" />
    if (rec.includes("recommend") || rec.includes("good")) return <ThumbsUp className="h-5 w-5" />
    return <AlertCircle className="h-5 w-5" />
  }

  const getRecommendationColor = (recommendation) => {
    if (!recommendation) return "text-primary"
    const rec = recommendation.toLowerCase()
    if (rec.includes("avoid") || rec.includes("limit")) return "text-red-500"
    if (rec.includes("recommend") || rec.includes("good")) return "text-green-500"
    return "text-yellow-500"
  }

  const getCategoryIcon = (category) => {
    if (!category) return <Activity className="h-5 w-5" />
    if (category?.toLowerCase().includes("healthy")) return <TrendingUp className="h-5 w-5" />
    if (category?.toLowerCase().includes("moderate")) return <Scale className="h-5 w-5" />
    if (category?.toLowerCase().includes("unhealthy")) return <TrendingDown className="h-5 w-5" />
    return <Activity className="h-5 w-5" />
  }

  /* ──────────────────────────────────────────────────────────── */
  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10 px-4 pt-6">

      {/* ── HEADER OVERLAY ── */}
      <h2 className="text-2xl font-black text-center flex items-center justify-center gap-3">
        <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-lg">
          <ScanBarcode className="h-6 w-6" />
        </div>
        Clinical Scanner
      </h2>

      {/* ── UPI-STYLE VIEWFINDER ── */}
      <Card className={`relative overflow-hidden transition-all duration-500 border-0 shadow-2xl rounded-[32px] ${flash ? "ring-4 ring-green-400" : "ring-1 ring-border/50"
        }`}>
        <CardContent className="p-0">
          <div id="reader" className={`w-full aspect-video bg-black ${scanning ? "block" : "hidden"}`} />

          {!scanning && (
            <div className="aspect-video bg-muted/20 flex flex-col items-center justify-center gap-4 text-muted-foreground transition-all duration-300">
              <div className="p-6 rounded-full bg-background border shadow-inner">
                <CameraOff className="h-10 w-10 opacity-30" />
              </div>
              <p className="text-sm font-bold tracking-widest uppercase opacity-60">Optics Standby</p>
            </div>
          )}

          {scanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[260px] h-[190px] border-2 border-white/40 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 left-0 right-0 h-1 bg-green-400 animate-scanline blur-[1px] shadow-[0_0_10px_2px_rgba(74,222,128,0.5)]" />

                {/* corners */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-xl" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-xl" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-xl" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-xl" />

                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 whitespace-nowrap">
                  <Loader2 className="h-3 w-3 animate-spin text-green-400" />
                  <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white">Auto-Catch Active</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 bg-background/80 backdrop-blur-md border-t flex flex-col sm:flex-row gap-3">
            {!scanning ? (
              <Button onClick={startScanner} className="flex-1 h-14 text-lg font-bold rounded-2xl gap-2 shadow-lg shadow-primary/20">
                <Camera className="h-5 w-5" />
                Start Vision System
              </Button>
            ) : (
              <Button onClick={stopScanner} variant="destructive" className="flex-1 h-14 text-lg font-bold rounded-2xl gap-2">
                <CameraOff className="h-5 w-5" />
                Stop Optics
              </Button>
            )}
            <Button onClick={handleReset} variant="outline" size="icon" className="h-14 w-14 rounded-2xl">
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {cameraError && (
        <Card className="border-destructive/30 bg-destructive/5 overflow-hidden rounded-2xl">
          <CardContent className="pt-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm font-semibold text-destructive">{cameraError}</p>
          </CardContent>
        </Card>
      )}

      {/* ── MANUAL INPUT & HISTORY ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="md:col-span-3 border-0 shadow-sm bg-muted/30 rounded-[28px]">
          <CardContent className="pt-5 flex gap-2">
            <Input
              placeholder="Enter barcode manually..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualLookup()}
              className="flex-1 bg-background h-12 rounded-xl"
            />
            <Button onClick={handleManualLookup} disabled={loading || !manualCode.trim()} className="h-12 w-12 rounded-xl">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            </Button>
          </CardContent>
        </Card>

        {history.length > 0 && (
          <Card className="md:col-span-2 border-0 shadow-sm bg-muted/10 rounded-[28px] overflow-hidden">
            <CardContent className="pt-5 flex flex-col gap-2">
              <h4 className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest pl-1">Scan History</h4>
              <div className="flex flex-col gap-1.5">
                {history.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-background/50 p-2 rounded-lg border border-border/40 hover:bg-background transition-colors cursor-pointer" onClick={() => handleApi(item.barcode)}>
                    <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[100px]">{item.barcode}</span>
                    <span className="text-xs font-bold text-primary truncate max-w-[120px] text-right">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── SYSTEM STATUS ── */}
      {(scannedCode || loading || error) && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className={`border-0 shadow-xl rounded-[28px] ${error ? "bg-destructive/5" : "bg-primary/5"}`}>
            <CardContent className="pt-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${error ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : error ? <XCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-1">
                    {loading ? "Neural System Analyzing" : error ? "Lookup Failure" : "Identified Product SKU"}
                  </p>
                  <p className="font-mono text-lg font-bold tracking-tight">
                    {scannedCode || manualCode || "..."}
                  </p>
                </div>
              </div>
              {error && <p className="text-xs text-destructive font-bold max-w-[200px] text-right bg-destructive/10 px-3 py-1 rounded-full">{error}</p>}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── PRODUCT DATA RESULT ── */}
      {result && !loading && (
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-background via-background to-primary/5 rounded-[40px] overflow-hidden animate-result result-glow">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary/30" />

          <CardHeader className="pb-4 relative pt-8 px-8">
            <div className="absolute top-8 right-8 flex gap-2 flex-wrap justify-end">
              {product.grade && (
                <Badge variant="outline" className={`${getGradeColor(product.grade)} px-4 py-1.5 font-black text-[10px] uppercase tracking-widest rounded-full border`}>
                  Grade {product.grade}
                </Badge>
              )}
              {product.category && (
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-1.5 font-black text-[10px] uppercase tracking-widest rounded-full">
                  {product.category}
                </Badge>
              )}
            </div>
            <CardTitle className="flex items-center gap-5 text-3xl font-black tracking-tighter">
              <div className="p-4 rounded-3xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30">
                <Apple className="h-8 w-8" />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight">
                  {product.productName || product.name || "Product Found"}
                </span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-10 pt-4 px-8 pb-10">
            {/* Health Score and Recommendation Section */}
            <div className="space-y-4">
              {/* Health Score */}
              {product.score !== undefined && (
                <div className="flex items-center gap-4 p-5 rounded-[24px] bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-black text-primary">
                        {Math.round((product.score || 0) * 100)}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-primary text-primary-foreground">
                      {getCategoryIcon(product.category)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Health Score</p>
                    <p className="text-sm font-semibold mt-1">
                      {product.score && product.score >= 0.7 ? "Excellent nutritional profile" :
                       product.score && product.score >= 0.5 ? "Moderate nutritional value" :
                       "Consider healthier alternatives"}
                    </p>
                  </div>
                </div>
              )}

              {/* Recommendation */}
              {product.recommendation && (
                <div className={`flex items-center gap-4 p-5 rounded-[24px] border-2 ${getRecommendationColor(product.recommendation)}/20 bg-gradient-to-r ${getRecommendationColor(product.recommendation)}/5 to-transparent`}>
                  <div className={`p-3 rounded-full ${getRecommendationColor(product.recommendation)}/10`}>
                    {getRecommendationIcon(product.recommendation)}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Recommendation</p>
                    <p className={`text-lg font-black ${getRecommendationColor(product.recommendation)}`}>
                      {product.recommendation}
                    </p>
                  </div>
                </div>
              )}

              {/* Reasons */}
              {product.reason && product.reason.length > 0 && (
                <div className="space-y-2 p-5 rounded-[24px] bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <p className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">Clinical Analysis</p>
                  </div>
                  {product.reason.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nutritional Information */}
            {product.nutrients && (
              <DetailSection title="Nutritional Analysis" icon={Activity}>
                <NutrientCard 
                  label="Sugars" 
                  value={product.nutrients.sugars} 
                  unit="g" 
                  icon={Droplet}
                  colorClass="text-red-500"
                />
                <NutrientCard 
                  label="Fat" 
                  value={product.nutrients.fat} 
                  unit="g" 
                  icon={Activity}
                  colorClass="text-yellow-500"
                />
                <NutrientCard 
                  label="Salt" 
                  value={product.nutrients.salt} 
                  unit="g" 
                  icon={Scale}
                  colorClass="text-blue-500"
                />
              </DetailSection>
            )}

            {/* Product Details */}
            <DetailSection title="Product Information" icon={Info}>
              <InfoCard
                icon={ScanBarcode}
                label="Barcode"
                value={scannedCode || manualCode}
                colorClass="text-purple-500"
              />
              <InfoCard
                icon={Package}
                label="Product Name"
                value={product.productName}
                colorClass="text-blue-500"
              />
              <InfoCard
                icon={ShieldCheck}
                label="Grade"
                value={product.grade}
                colorClass="text-green-500"
              />
              <InfoCard
                icon={AlertTriangle}
                label="Category"
                value={product.category}
                colorClass="text-orange-500"
              />
              <InfoCard
                icon={Activity}
                label="Health Score"
                value={`${Math.round((product.score || 0) * 100)}%`}
                colorClass="text-primary"
              />
              <InfoCard
                icon={ThumbsUp}
                label="Recommendation"
                value={product.recommendation}
                colorClass={getRecommendationColor(product.recommendation)}
              />
            </DetailSection>

            {/* Additional Metadata */}
            {Object.entries(product || {}).filter(([k, v]) =>
              !["productName", "name", "grade", "category", "score", "recommendation", "reason", "nutrients"].includes(k) &&
              v !== null && v !== undefined && (typeof v !== "object" || (Array.isArray(v) && v.length > 0))
            ).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Activity className="h-4 w-4 text-primary/70" />
                  <h3 className="text-sm font-black tracking-tight text-foreground/80 uppercase">Additional Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(product || {}).filter(([k, v]) =>
                    !["productName", "name", "grade", "category", "score", "recommendation", "reason", "nutrients"].includes(k) &&
                    v !== null && v !== undefined && (typeof v !== "object" || (Array.isArray(v) && v.length > 0))
                  ).map(([k, v]) => (
                    <div key={k} className="px-4 py-3 rounded-2xl bg-secondary/20 border border-border/30 flex flex-col gap-1 hover:bg-secondary/40 transition-all">
                      <span className="text-[9px] font-black text-primary/60 uppercase tracking-tighter leading-none mb-1">{k.replace(/_/g, ' ')}</span>
                      <span className="text-xs font-bold text-foreground truncate">
                        {Array.isArray(v) ? v.join(", ") : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          <CardHeader className="pt-0 pb-8">
            <div className="px-8 py-3 rounded-full bg-primary/5 border border-primary/10 w-fit mx-auto shadow-sm">
              <p className="text-[10px] text-center font-black uppercase tracking-[0.3em] text-primary/50 flex items-center gap-2">
                <ShieldCheck className="h-3 w-3" /> HealthCareAi Clinical Guard
              </p>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* ── ANIMATIONS ── */}
      <style>{`
            @keyframes scanline {
              0% { top: 0%; opacity: 0; }
              5% { opacity: 1; }
              95% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
            .animate-scanline {
              animation: scanline 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
            .result-glow {
              box-shadow: 0 40px 100px -20px rgba(var(--primary-rgb), 0.2);
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-result {
              animation: fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
            #reader {
              border: none !important;
            }
            #reader video {
              border-radius: 32px;
              object-fit: cover !important;
            }
          `}</style>
    </div>
  )
}

export default BarcodeScanner