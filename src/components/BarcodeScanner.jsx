import React, { useState, useEffect, useRef, useCallback } from "react"
import { BrowserMultiFormatReader, NotFoundException, BarcodeFormat, DecodeHintType } from "@zxing/library"
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
  const [cameras, setCameras] = useState([])
  const [selectedCam, setSelectedCam] = useState("")

  const token = localStorage.getItem("token")

  /* ── Detect Cameras ── */
  useEffect(() => {
    const listDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter((d) => d.kind === "videoinput")
        setCameras(videoDevices)
        if (videoDevices.length > 0) {
          const rear = videoDevices.find((d) =>
            /back|rear|environment/i.test(d.label)
          )
          setSelectedCam(rear?.deviceId || videoDevices[0].deviceId)
        }
      } catch (err) {
        setCameraError("Camera detection failed.")
      }
    }
    listDevices()
  }, [])

  /* ── Stop Scanner ── */
  const stopScanner = useCallback(() => {
    try {
      readerRef.current?.reset()
    } catch (_) { }

    try {
      const stream = videoRef.current?.srcObject
      stream?.getTracks().forEach((t) => t.stop())
      if (videoRef.current) videoRef.current.srcObject = null
    } catch (_) { }

    setScanning(false)
  }, [])

  useEffect(() => {
    return () => stopScanner()
  }, [stopScanner])

  /* ── Flash Animation ── */
  const triggerFlash = () => {
    setFlash(true)
    setTimeout(() => setFlash(false), 500)
  }

  /* ── Start Scanner ── */
  const startScanner = useCallback(async () => {
    setError("")
    setCameraError("")
    setResult(null)
    setScannedCode("")

    // Configure robust hints
    const hints = new Map()
    const formats = [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.ITF,
    ]
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats)
    hints.set(DecodeHintType.TRY_HARDER, true)

    readerRef.current = new BrowserMultiFormatReader(hints)

    try {
      setScanning(true)

      const constraints = {
        video: {
          deviceId: selectedCam ? { exact: selectedCam } : undefined,
          facingMode: selectedCam ? undefined : { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      videoRef.current.srcObject = stream
      await videoRef.current.play()

      // Apply autofocus/torch if supported
      const track = stream.getVideoTracks()[0]
      const caps = track.getCapabilities?.()

      if (caps?.focusMode?.includes("continuous")) {
        track.applyConstraints({ advanced: [{ focusMode: "continuous" }] }).catch(() => { })
      }
      if (caps?.torch) {
        // We only enable torch briefly on scan or let it be manual? 
        // User snippet suggests enabling it on start.
        track.applyConstraints({ advanced: [{ torch: true }] }).catch(() => { })
      }

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
          console.warn("Scan error:", err)
        }
      })
    } catch (e) {
      setScanning(false)
      setCameraError(
        e.name === "NotAllowedError"
          ? "Camera permission denied."
          : e.name === "NotFoundError"
            ? "No camera found."
            : "Failed to access camera."
      )
    }
  }, [selectedCam, stopScanner])

  /* ── Backend API ── */
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
        "Failed to bridge clinical data. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (scannedCode) callApi(scannedCode)
  }, [scannedCode])

  const handleManualLookup = () => {
    if (!manualCode.trim()) return
    setScannedCode("")
    setResult(null)
    setError("")
    callApi(manualCode.trim())
  }

  const handleReset = () => {
    stopScanner()
    setScannedCode("")
    setManualCode("")
    setResult(null)
    setError("")
  }

  const product = result?.data || result?.product || result

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10 px-4 pt-4">
      {/* ── header card ── */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ScanBarcode className="h-6 w-6 text-primary" />
            Barcode Medicine Scanner
          </CardTitle>
          <CardDescription>
            High-precision scanning with AI-driven medicine analysis.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* ── viewfinder card ── */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div
            className={`relative w-full bg-black aspect-video flex items-center justify-center transition-all duration-300 ${flash ? "ring-4 ring-green-400" : ""
              }`}
          >
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${scanning ? "opacity-100" : "opacity-0"}`}
              muted
              playsInline
            />

            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground/50">
                <CameraOff className="h-10 w-10" />
                <p className="text-sm font-medium">Camera standby</p>
              </div>
            )}

            {scanning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-28 border-2 border-green-400/50 rounded-md shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-green-400 text-xs font-bold animate-pulse whitespace-nowrap">
                    Align Barcode in Center
                  </span>
                  <span className="absolute left-0 right-0 top-1/2 h-0.5 bg-green-400/40 animate-[scanline_1.8s_ease-in-out_infinite]" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-muted/20 border-t flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              {!scanning ? (
                <Button onClick={startScanner} className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Enable Scanner
                </Button>
              ) : (
                <Button onClick={stopScanner} variant="destructive" className="flex-1">
                  <CameraOff className="mr-2 h-4 w-4" />
                  Disable
                </Button>
              )}
              <Button onClick={handleReset} variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {cameras.length > 1 && (
              <select
                className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary min-w-[140px]"
                value={selectedCam}
                onChange={(e) => {
                  stopScanner()
                  setSelectedCam(e.target.value)
                }}
              >
                {cameras.map((cam) => (
                  <option key={cam.deviceId} value={cam.deviceId}>
                    {cam.label || `Camera ${cam.deviceId.slice(0, 4)}`}
                  </option>
                ))}
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {cameraError && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3 font-medium">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {cameraError}
        </div>
      )}

      {/* ── manual input ── */}
      <Card className="border-0 shadow-sm bg-muted/30">
        <CardContent className="pt-5 flex gap-2">
          <Input
            placeholder="Search barcode manually..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleManualLookup()}
            className="flex-1 bg-background"
          />
          <Button onClick={handleManualLookup} disabled={loading || !manualCode.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          </Button>
        </CardContent>
      </Card>

      {/* ── status & results ── */}
      {(scannedCode || loading || error) && (
        <Card className={`border-l-4 ${error ? "border-l-destructive" : "border-l-primary"}`}>
          <CardContent className="pt-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : error ? (
                <XCircle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                  {loading ? "System Analyzing" : error ? "Lookup Failure" : "Identified SKU"}
                </p>
                <p className="font-mono text-sm font-bold truncate max-w-[200px]">
                  {scannedCode || manualCode || "..."}
                </p>
              </div>
            </div>
            {error && <p className="text-xs text-destructive font-medium max-w-[200px] text-right">{error}</p>}
          </CardContent>
        </Card>
      )}

      {result && !loading && (
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden animate-result result-glow">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary/30" />

          <CardHeader className="pb-4 relative">
            <div className="absolute top-4 right-6">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 font-bold text-xs uppercase tracking-tighter">
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
                  <span className="text-xs font-medium text-muted-foreground mt-1.5 uppercase tracking-widest leading-none">{product.generic_name}</span>
                )}
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8 pt-2">
            {product?.status && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Clinical Status: {product.status}</span>
              </div>
            )}

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

            {Object.entries(product || {}).filter(([k, v]) =>
              !["name", "brand_name", "product_name", "generic_name", "status", "manufacturer_name", "manufacturer", "dosage_form", "route", "active_ingredients", "strength", "product_type", "product_ndc", "ndc", "barcode", "packaging", "data", "product"].includes(k) &&
              v !== null && v !== undefined && (typeof v !== "object" || (Array.isArray(v) && v.length > 0))
            ).length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <Activity className="h-4 w-4 text-primary/70" />
                    <h3 className="text-sm font-bold tracking-tight text-foreground/80 uppercase">Clinical Metadata</h3>
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
                <ShieldCheck className="h-3 w-3" /> HealthCareAi Clinical Guard
              </p>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* scanline keyframes */}
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