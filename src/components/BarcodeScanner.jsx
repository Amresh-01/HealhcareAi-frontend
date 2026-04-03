import React, { useState, useEffect, useRef, useCallback } from "react"
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library"
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
  ChevronDown,
  ChevronUp,
  Building2,
  Pill,
  Box,
  Globe,
  FileText,
  ShieldCheck,
  Layers,
  Fingerprint,
  Info,
  Activity
} from "lucide-react"

/* ────────────────────────────────────────────────────────────── */
/*  Helper Components                                             */
/* ────────────────────────────────────────────────────────────── */
const InfoCard = ({ icon: Icon, label, value, colorClass = "text-primary" }) => {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/30 transition-all group">
      <div className={`p-2 rounded-lg bg-background shadow-sm group-hover:scale-110 transition-transform ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">{label}</p>
        <p className="text-sm font-semibold truncate text-foreground">{value}</p>
      </div>
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

const InfoRow = ({ label, value }) =>
  value ? (
    <div className="flex justify-between gap-2 py-1 border-b border-border/40 last:border-0 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right break-words max-w-[60%]">{value}</span>
    </div>
  ) : null

const BarcodeScanner = () => {
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const debounceRef = useRef(null)

  const [scanning, setScanning] = useState(false)
  const [scannedCode, setScannedCode] = useState("")
  const [manualCode, setManualCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [cameraError, setCameraError] = useState("")
  const [flash, setFlash] = useState(false)
  const [showRaw, setShowRaw] = useState(false)
  const [cameras, setCameras] = useState([])
  const [selectedCam, setSelectedCam] = useState("")

  const token = localStorage.getItem("token")

  /* ── enumerate cameras using native browser API ── */
  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setCameraError("Camera enumeration not supported in this browser.")
      return
    }
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === "videoinput")
        setCameras(videoDevices)
        if (videoDevices.length > 0) {
          // prefer back/rear camera on mobile
          const rear = videoDevices.find((d) =>
            /back|rear|environment/i.test(d.label)
          )
          setSelectedCam(rear?.deviceId || videoDevices[0].deviceId)
        }
      })
      .catch(() => setCameraError("Could not list cameras."))
  }, [])

  /* ── stop scanner on unmount ── */
  useEffect(() => {
    return () => stopScanner()
  }, [])

  /* ── call backend whenever scannedCode changes ── */
  useEffect(() => {
    if (scannedCode) callApi(scannedCode)
  }, [scannedCode])

  /* ── start camera ── */
  const startScanner = useCallback(async () => {
    setError("")
    setCameraError("")
    setResult(null)
    setScannedCode("")

    // Always create a fresh reader instance
    try { readerRef.current?.reset() } catch (_) { }
    readerRef.current = new BrowserMultiFormatReader()

    try {
      setScanning(true)

      const constraints = selectedCam
        ? { deviceId: { exact: selectedCam } }
        : { facingMode: "environment" }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: constraints,
        audio: false,
      })

      videoRef.current.srcObject = stream
      await videoRef.current.play()

      readerRef.current.decodeFromStream(stream, videoRef.current, (res, err) => {
        if (res) {
          if (debounceRef.current) return
          debounceRef.current = setTimeout(() => {
            debounceRef.current = null
          }, 3000)

          const code = res.getText()
          triggerFlash()
          stopScanner()
          setScannedCode(code)
        }
        if (err && !(err instanceof NotFoundException)) {
          console.warn("ZXing decode error:", err)
        }
      })
    } catch (e) {
      setScanning(false)
      setCameraError(
        e.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access in your browser settings."
          : e.name === "NotFoundError"
            ? "No camera found on this device."
            : e.message || "Failed to start camera."
      )
    }
  }, [selectedCam])

  /* ── stop camera ── */
  const stopScanner = () => {
    try {
      readerRef.current?.reset()
    } catch (_) { }
    // Also stop all tracks on the video element's stream
    try {
      const stream = videoRef.current?.srcObject
      stream?.getTracks().forEach((t) => t.stop())
      if (videoRef.current) videoRef.current.srcObject = null
    } catch (_) { }
    setScanning(false)
  }

  /* ── green flash animation ── */
  const triggerFlash = () => {
    setFlash(true)
    setTimeout(() => setFlash(false), 500)
  }

  /* ── call backend API ── */
  const callApi = async (barcode) => {
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
      setResult(res.data)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to fetch product info. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  /* ── manual look-up ── */
  const handleManualLookup = () => {
    if (!manualCode.trim()) return
    setScannedCode("")
    setResult(null)
    setError("")
    callApi(manualCode.trim())
  }

  /* ── reset everything ── */
  const handleReset = () => {
    stopScanner()
    setScannedCode("")
    setManualCode("")
    setResult(null)
    setError("")
    setCameraError("")
  }

  /* ── derive product data from any response shape ── */
  const product = result?.data || result?.product || result

  /* ──────────────────────────────────────────────────────────── */
  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">

      {/* ── header card ── */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ScanBarcode className="h-6 w-6 text-primary" />
            Barcode Medicine Scanner
          </CardTitle>
          <CardDescription>
            Point your camera at a medicine barcode or enter the code manually to get product info.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* ── camera selector + controls ── */}
      <Card>
        <CardContent className="pt-5 space-y-4">

          {/* camera picker */}
          {cameras.length > 1 && (
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-muted-foreground shrink-0" />
              <select
                className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedCam}
                onChange={(e) => {
                  stopScanner()
                  setSelectedCam(e.target.value)
                }}
              >
                {cameras.map((cam) => (
                  <option key={cam.deviceId} value={cam.deviceId}>
                    {cam.label || `Camera ${cam.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* viewfinder */}
          <div
            className={`relative w-full rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center transition-all duration-300 ${flash ? "ring-4 ring-green-400" : "ring-1 ring-border"
              }`}
          >
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${scanning ? "opacity-100" : "opacity-0"}`}
              muted
              playsInline
            />

            {/* overlay when not scanning */}
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <CameraOff className="h-10 w-10 opacity-40" />
                <p className="text-sm opacity-60">Camera is off</p>
              </div>
            )}

            {/* scanning crosshair */}
            {scanning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-28 border-2 border-green-400 rounded-md shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-green-400 text-xs font-medium tracking-wide animate-pulse">
                    Align barcode here
                  </span>
                  {/* corner accents */}
                  <span className="absolute -top-px -left-px h-4 w-4 border-t-2 border-l-2 border-green-300 rounded-tl" />
                  <span className="absolute -top-px -right-px h-4 w-4 border-t-2 border-r-2 border-green-300 rounded-tr" />
                  <span className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-green-300 rounded-bl" />
                  <span className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-green-300 rounded-br" />
                  {/* scan line */}
                  <span className="absolute left-0 right-0 top-1/2 h-0.5 bg-green-400/70 animate-[scanline_1.8s_ease-in-out_infinite]" />
                </div>
              </div>
            )}
          </div>

          {/* camera error */}
          {cameraError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {cameraError}
            </div>
          )}

          {/* start / stop buttons */}
          <div className="flex gap-2">
            {!scanning ? (
              <Button onClick={startScanner} className="flex-1">
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
            ) : (
              <Button onClick={stopScanner} variant="outline" className="flex-1">
                <CameraOff className="mr-2 h-4 w-4" />
                Stop Camera
              </Button>
            )}
            <Button onClick={handleReset} variant="ghost" size="icon" title="Reset">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── manual input ── */}
      <Card>
        <CardContent className="pt-5">
          <p className="text-sm text-muted-foreground mb-2 font-medium">Manual barcode entry</p>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. 012345678905"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualLookup()}
              className="flex-1"
            />
            <Button onClick={handleManualLookup} disabled={loading || !manualCode.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── scanned code display ── */}
      {(scannedCode || loading) && (
        <Card className="border-primary/30">
          <CardContent className="pt-5 flex items-center gap-3">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            <div>
              <p className="text-xs text-muted-foreground">
                {loading ? "Looking up…" : "Scanned code"}
              </p>
              <p className="font-mono text-sm font-semibold tracking-wide">
                {scannedCode || manualCode}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── api error ── */}
      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="pt-5 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* ── result ── */}
      {result && !loading && (
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden animate-result result-glow">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary/30" />

          <CardHeader className="pb-4 relative">
            <div className="absolute top-4 right-6">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 font-bold text-xs">
                {product?.product_type || "Medication"}
              </Badge>
            </div>
            <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tight pt-2">
              <div className="p-2.5 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Package className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="leading-none">{product?.brand_name || product?.name || product?.product_name || "Product Found"}</span>
                {product?.generic_name && (
                  <span className="text-xs font-medium text-muted-foreground mt-1.5 uppercase tracking-widest">{product.generic_name}</span>
                )}
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8 pt-2">
            {/* Status Section */}
            {product?.status && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Status: {product.status}</span>
              </div>
            )}

            {/* Core Info Grid */}
            <DetailSection title="Core Information" icon={Info}>
              <InfoCard icon={Building2} label="Manufacturer" value={product?.manufacturer_name || product?.manufacturer} colorClass="text-blue-500" />
              <InfoCard icon={Pill} label="Dosage Form" value={product?.dosage_form} colorClass="text-purple-500" />
              <InfoCard icon={Globe} label="Route" value={Array.isArray(product?.route) ? product.route.join(", ") : product?.route} colorClass="text-emerald-500" />
              <InfoCard icon={Layers} label="Strength" value={Array.isArray(product?.active_ingredients)
                ? product.active_ingredients.map((i) => `${i.name} ${i.strength}`).join(", ")
                : product?.strength
              } colorClass="text-orange-500" />
              <InfoCard icon={Fingerprint} label="NDC / ID" value={product?.product_ndc || product?.ndc} colorClass="text-pink-500" />
              <InfoCard icon={ScanBarcode} label="UPC/Barcode" value={product?.barcode || scannedCode || manualCode} colorClass="text-cyan-500" />
            </DetailSection>

            {/* Packaging information */}
            {product?.packaging?.length > 0 && (
              <DetailSection title="Packaging Details" icon={Box}>
                {product.packaging.map((p, i) => (
                  <div key={i} className="col-span-full flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 text-sm italic text-muted-foreground leading-relaxed">
                    <FileText className="h-4 w-4 mt-0.5 shrink-0 text-primary/40" />
                    {p.description}
                  </div>
                ))}
              </DetailSection>
            )}

            {/* Extra information catch-all - display any other fields to ensure "all information" is shown */}
            {Object.entries(product || {}).filter(([k, v]) =>
              !["name", "brand_name", "product_name", "generic_name", "status", "manufacturer_name", "manufacturer", "dosage_form", "route", "active_ingredients", "strength", "product_type", "product_ndc", "ndc", "barcode", "packaging", "data", "product"].includes(k) &&
              v !== null && v !== undefined && (typeof v !== "object" || (Array.isArray(v) && v.length > 0))
            ).length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <Activity className="h-4 w-4 text-primary/70" />
                    <h3 className="text-sm font-bold tracking-tight text-foreground/80 uppercase">Additional Attributes</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(product || {}).filter(([k, v]) =>
                      !["name", "brand_name", "product_name", "generic_name", "status", "manufacturer_name", "manufacturer", "dosage_form", "route", "active_ingredients", "strength", "product_type", "product_ndc", "ndc", "barcode", "packaging", "data", "product"].includes(k) &&
                      v !== null && v !== undefined && (typeof v !== "object" || (Array.isArray(v) && v.length > 0))
                    ).map(([k, v]) => (
                      <div key={k} className="px-3 py-2 rounded-xl bg-secondary/30 border border-border/40 flex flex-col gap-1 hover:bg-secondary/50 transition-colors">
                        <span className="text-[9px] font-black text-primary/60 uppercase tracking-tighter">{k.replace(/_/g, ' ')}</span>
                        <span className="text-xs font-semibold text-foreground truncate">
                          {Array.isArray(v) ? v.join(", ") : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>

          <CardHeader className="pt-0 pb-6">
            <div className="px-6 py-2 rounded-full bg-primary/5 border border-primary/10 w-fit mx-auto">
              <p className="text-[10px] text-center font-bold uppercase tracking-widest text-primary/50 flex items-center gap-2">
                <ShieldCheck className="h-3 w-3" /> AI Verified Clinical Data
              </p>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* scanline and card entry keyframes */}
      <style>{`
        @keyframes scanline {
          0%   { top: 10%; }
          50%  { top: 90%; }
          100% { top: 10%; }
        }
        .result-glow {
          box-shadow: 0 0 40px -10px rgba(var(--primary-rgb), 0.15);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-result {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default BarcodeScanner
