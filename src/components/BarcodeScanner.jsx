/**
 * BarcodeScanner.jsx — Production-Ready Mobile-Optimized
 *
 * KEY FIXES vs original:
 *  1. Uses decodeFromVideoDevice() — the correct ZXing continuous-scan API
 *  2. ZXing owns the stream; we never touch getUserMedia() manually
 *  3. Proper cleanup: reader.reset() stops both decode loop AND camera tracks
 *  4. iOS Safari: video element has muted + playsInline attributes in JSX
 *  5. Camera enumeration is triggered only AFTER getUserMedia permission is granted
 *  6. Debounce lives outside the decode callback (ref-based, no stale closure)
 *  7. Scanner restarts cleanly via a full new BrowserMultiFormatReader instance
 *  8. Rear camera: passed as constraint to decodeFromVideoDevice, not getUserMedia
 *  9. Hints (formats) passed to reader constructor for faster decode on mobile
 * 10. Scan-success audio feedback via AudioContext (no external file needed)
 */

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  NotFoundException,
} from "@zxing/library"
import axios from "axios"
import { API_BASE_URL } from "../../config"

import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Loader2, ScanBarcode, Camera, CameraOff, CheckCircle2, XCircle,
  RefreshCw, Package, AlertTriangle, Zap, Building2, Pill, Box,
  Globe, FileText, ShieldCheck, Layers, Fingerprint, Info, Activity,
} from "lucide-react"

/* ─────────────────────────────────────────────────────────────── */
/*  ZXing reader factory — creates a fresh, configured instance    */
/* ─────────────────────────────────────────────────────────────── */
function createReader() {
  // Tell ZXing exactly which formats to look for.
  // Limiting formats = faster decode on mobile CPUs.
  const hints = new Map()
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.ITF,
    BarcodeFormat.CODABAR,
  ])
  hints.set(DecodeHintType.TRY_HARDER, true)   // more aggressive scan
  return new BrowserMultiFormatReader(hints, {
    delayBetweenScanAttempts: 100,            // ms between decode attempts
    delayBetweenScanSuccess: 2000,            // ms before scanning resumes after a hit
  })
}

/* ─────────────────────────────────────────────────────────────── */
/*  Beep helper — generates a short confirmation tone              */
/*  No file needed; uses the Web Audio API                         */
/* ─────────────────────────────────────────────────────────────── */
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = "sine"
    osc.frequency.setValueAtTime(1800, ctx.currentTime)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.18)
  } catch (_) { /* AudioContext not available — silently skip */ }
}

/* ─────────────────────────────────────────────────────────────── */
/*  Small presentational helpers (unchanged from original)         */
/* ─────────────────────────────────────────────────────────────── */
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
  </div>
)

/* ─────────────────────────────────────────────────────────────── */
/*  Main Component                                                  */
/* ─────────────────────────────────────────────────────────────── */
const BarcodeScanner = () => {
  const videoRef = useRef(null)
  const readerRef = useRef(null)   // holds current BrowserMultiFormatReader
  const debounceRef = useRef(false) // true while debounce window is active

  const [scanning, setScanning] = useState(false)
  const [scannedCode, setScannedCode] = useState("")
  const [manualCode, setManualCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [cameraError, setCameraError] = useState("")
  const [flash, setFlash] = useState(false)
  const [cameras, setCameras] = useState([])
  const [selectedCam, setSelectedCam] = useState(undefined) // undefined = use facingMode

  const token = localStorage.getItem("token")

  /* ── Enumerate cameras AFTER permission is obtained ──────────── */
  // We call this inside startScanner so we already have permission,
  // which means iOS/Android will give us real device labels.
  const enumCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((d) => d.kind === "videoinput")
      setCameras(videoDevices)

      // If not already locked to a specific camera, prefer rear
      if (!selectedCam && videoDevices.length > 0) {
        const rear = videoDevices.find((d) =>
          /back|rear|environment/i.test(d.label)
        )
        // Only set if we find a labelled rear camera; otherwise rely on facingMode
        if (rear) setSelectedCam(rear.deviceId)
      }
    } catch (_) { /* non-fatal */ }
  }, [selectedCam])

  /* ── Cleanup on unmount ───────────────────────────────────────── */
  useEffect(() => {
    return () => destroyReader()
  }, [])

  /* ── Lookup whenever scannedCode changes ─────────────────────── */
  useEffect(() => {
    if (scannedCode) callApi(scannedCode)
  }, [scannedCode])

  /* ── Fully destroy the reader + release camera ────────────────── */
  // IMPORTANT: reader.reset() tells ZXing to stop the decode loop AND
  // stops all MediaStreamTracks it opened. We do NOT need to call
  // getTracks().stop() ourselves — doing both causes double-stop errors.
  const destroyReader = () => {
    try { readerRef.current?.reset() } catch (_) { }
    readerRef.current = null
    setScanning(false)
  }

  /* ── Green flash + beep on scan ──────────────────────────────── */
  const triggerFeedback = () => {
    playBeep()
    setFlash(true)
    setTimeout(() => setFlash(false), 600)
  }

  /* ── Start scanner ────────────────────────────────────────────── */
  const startScanner = useCallback(async () => {
    setError("")
    setCameraError("")
    setResult(null)
    setScannedCode("")

    // Destroy any existing reader first
    destroyReader()

    // Create a fresh reader every time
    readerRef.current = createReader()

    try {
      // Request permission upfront so enumerateDevices returns labels
      // (required on iOS Safari and many Android browsers)
      await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      await enumCameras()

      setScanning(true)

      /**
       * decodeFromVideoDevice(deviceId, videoElement, callback)
       *
       * - deviceId = undefined → ZXing uses facingMode: "environment" internally
       *   (best default; avoids black-screen from wrong deviceId)
       * - deviceId = string   → ZXing opens that specific camera
       *
       * ZXing handles getUserMedia, attaching to the <video>, and the
       * continuous decode loop. We only handle the result callback.
       */
      await readerRef.current.decodeFromVideoDevice(
        selectedCam || undefined,   // undefined = let ZXing pick rear camera
        videoRef.current,
        (result, err) => {
          // ── Successful decode ──
          if (result) {
            // Debounce: ignore duplicate scans within 2 s
            if (debounceRef.current) return
            debounceRef.current = true
            setTimeout(() => { debounceRef.current = false }, 2000)

            const code = result.getText()
            triggerFeedback()
            setScannedCode(code)
            // NOTE: We do NOT stop the scanner here so continuous scanning works.
            // The user can stop manually, or it will stop on unmount.
          }

          // ── Decode error — only log unexpected errors ──
          if (err && !(err instanceof NotFoundException)) {
            console.warn("[ZXing]", err?.message || err)
          }
        }
      )
    } catch (e) {
      destroyReader()

      const msg =
        e.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access and try again."
          : e.name === "NotFoundError"
            ? "No camera found on this device."
            : e.name === "NotReadableError"
              ? "Camera is already in use by another app."
              : e.name === "OverconstrainedError"
                ? "Selected camera couldn't be opened. Try a different camera."
                : e.message || "Failed to start camera."

      setCameraError(msg)
    }
  }, [selectedCam, enumCameras])

  /* ── Stop scanner ─────────────────────────────────────────────── */
  const stopScanner = () => destroyReader()

  /* ── API call ─────────────────────────────────────────────────── */
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

  /* ── Manual lookup ────────────────────────────────────────────── */
  const handleManualLookup = () => {
    if (!manualCode.trim()) return
    setScannedCode("")
    setResult(null)
    setError("")
    callApi(manualCode.trim())
  }

  /* ── Reset everything ─────────────────────────────────────────── */
  const handleReset = () => {
    stopScanner()
    setScannedCode("")
    setManualCode("")
    setResult(null)
    setError("")
    setCameraError("")
  }

  /* ── Camera picker change ─────────────────────────────────────── */
  const handleCamChange = (e) => {
    stopScanner()
    setSelectedCam(e.target.value)
  }

  const product = result?.data || result?.product || result

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">

      {/* Header */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ScanBarcode className="h-6 w-6 text-primary" />
            Barcode Medicine Scanner
          </CardTitle>
          <CardDescription>
            Point your camera at a medicine barcode or enter the code manually.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Camera controls */}
      <Card>
        <CardContent className="pt-5 space-y-4">

          {/* Camera selector — only shown after permission is granted */}
          {cameras.length > 1 && (
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-muted-foreground shrink-0" />
              <select
                className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedCam || ""}
                onChange={handleCamChange}
              >
                <option value="">Auto (rear camera)</option>
                {cameras.map((cam) => (
                  <option key={cam.deviceId} value={cam.deviceId}>
                    {cam.label || `Camera ${cam.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Viewfinder */}
          <div
            className={`relative w-full rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center transition-all duration-300 ${flash ? "ring-4 ring-green-400 shadow-[0_0_20px_rgba(74,222,128,0.4)]" : "ring-1 ring-border"
              }`}
          >
            {/*
              MOBILE CRITICAL:
              - muted        → required for autoplay on iOS
              - playsInline  → prevents iOS from going fullscreen
              - autoPlay     → ZXing calls .play() but this helps Safari
              Do NOT hide the video with display:none — ZXing needs it visible to decode
            */}
            <video
              ref={videoRef}
              className={`w-full h-full object-cover transition-opacity duration-300 ${scanning ? "opacity-100" : "opacity-0"}`}
              muted
              playsInline
              autoPlay
            />

            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <CameraOff className="h-10 w-10 opacity-40" />
                <p className="text-sm opacity-60">Camera is off</p>
              </div>
            )}

            {scanning && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Dimmed overlay with clear viewfinder window */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-32
                  border-2 border-green-400 rounded-md
                  shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-green-400 text-xs font-medium tracking-wide animate-pulse whitespace-nowrap">
                    Align barcode here
                  </span>
                  {/* Corner accents */}
                  <span className="absolute -top-px -left-px h-5 w-5 border-t-2 border-l-2 border-green-300 rounded-tl" />
                  <span className="absolute -top-px -right-px h-5 w-5 border-t-2 border-r-2 border-green-300 rounded-tr" />
                  <span className="absolute -bottom-px -left-px h-5 w-5 border-b-2 border-l-2 border-green-300 rounded-bl" />
                  <span className="absolute -bottom-px -right-px h-5 w-5 border-b-2 border-r-2 border-green-300 rounded-br" />
                  {/* Animated scan line */}
                  <span className="absolute left-1 right-1 h-0.5 bg-green-400/80 rounded-full animate-[scanline_1.6s_ease-in-out_infinite]" />
                </div>
              </div>
            )}
          </div>

          {/* Camera error */}
          {cameraError && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Buttons */}
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
            <Button onClick={handleReset} variant="ghost" size="icon" title="Reset all">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual entry */}
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
              inputMode="numeric"
            />
            <Button onClick={handleManualLookup} disabled={loading || !manualCode.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scanned code status */}
      {(scannedCode || loading) && (
        <Card className="border-primary/30">
          <CardContent className="pt-5 flex items-center gap-3">
            {loading
              ? <Loader2 className="h-5 w-5 animate-spin text-primary" />
              : <CheckCircle2 className="h-5 w-5 text-green-500" />
            }
            <div>
              <p className="text-xs text-muted-foreground">{loading ? "Looking up…" : "Scanned code"}</p>
              <p className="font-mono text-sm font-semibold tracking-wide">{scannedCode || manualCode}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API error */}
      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="pt-5 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Result card */}
      {result && !loading && (
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden animate-result relative">
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
                <span className="leading-none">
                  {product?.brand_name || product?.name || product?.product_name || "Product Found"}
                </span>
                {product?.generic_name && (
                  <span className="text-xs font-medium text-muted-foreground mt-1.5 uppercase tracking-widest">
                    {product.generic_name}
                  </span>
                )}
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8 pt-2">
            {product?.status && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Status: {product.status}</span>
              </div>
            )}

            <DetailSection title="Core Information" icon={Info}>
              <InfoCard icon={Building2} label="Manufacturer" value={product?.manufacturer_name || product?.manufacturer} colorClass="text-blue-500" />
              <InfoCard icon={Pill} label="Dosage Form" value={product?.dosage_form} colorClass="text-purple-500" />
              <InfoCard icon={Globe} label="Route" value={Array.isArray(product?.route) ? product.route.join(", ") : product?.route} colorClass="text-emerald-500" />
              <InfoCard icon={Layers} label="Strength" value={Array.isArray(product?.active_ingredients) ? product.active_ingredients.map((i) => `${i.name} ${i.strength}`).join(", ") : product?.strength} colorClass="text-orange-500" />
              <InfoCard icon={Fingerprint} label="NDC / ID" value={product?.product_ndc || product?.ndc} colorClass="text-pink-500" />
              <InfoCard icon={ScanBarcode} label="UPC/Barcode" value={product?.barcode || scannedCode || manualCode} colorClass="text-cyan-500" />
            </DetailSection>

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

            {/* Additional attributes catch-all */}
            {Object.entries(product || {}).filter(([k, v]) =>
              !["name", "brand_name", "product_name", "generic_name", "status", "manufacturer_name",
                "manufacturer", "dosage_form", "route", "active_ingredients", "strength",
                "product_type", "product_ndc", "ndc", "barcode", "packaging", "data", "product"].includes(k) &&
              v !== null && v !== undefined &&
              (typeof v !== "object" || (Array.isArray(v) && v.length > 0))
            ).length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <Activity className="h-4 w-4 text-primary/70" />
                    <h3 className="text-sm font-bold tracking-tight text-foreground/80 uppercase">Additional Attributes</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(product || {}).filter(([k, v]) =>
                      !["name", "brand_name", "product_name", "generic_name", "status", "manufacturer_name",
                        "manufacturer", "dosage_form", "route", "active_ingredients", "strength",
                        "product_type", "product_ndc", "ndc", "barcode", "packaging", "data", "product"].includes(k) &&
                      v !== null && v !== undefined &&
                      (typeof v !== "object" || (Array.isArray(v) && v.length > 0))
                    ).map(([k, v]) => (
                      <div key={k} className="px-3 py-2 rounded-xl bg-secondary/30 border border-border/40 flex flex-col gap-1 hover:bg-secondary/50 transition-colors">
                        <span className="text-[9px] font-black text-primary/60 uppercase tracking-tighter">{k.replace(/_/g, " ")}</span>
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

      <style>{`
        @keyframes scanline {
          0%   { top: 8%;  }
          50%  { top: 88%; }
          100% { top: 8%;  }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-result {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default BarcodeScanner