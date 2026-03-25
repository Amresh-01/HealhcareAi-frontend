import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { TrustBadges } from "@/components/Trust-Badges"
import {
  ArrowRight,
  Sparkles,
  Brain,
  Heart,
  Stethoscope,
  Shield,
  Clock,
  Users,
  Play,
  ChevronRight,
  Zap,
  Star,
} from "lucide-react"

export function HeroSection({ onNavigate }) {
  const [activeFeature, setActiveFeature] = useState(0)
  const [animatedStats, setAnimatedStats] = useState({
    users: 0,
    accuracy: 0,
    doctors: 0,
  })
  const [hoveredStat, setHoveredStat] = useState(null)
  const [typedText, setTypedText] = useState("")

  const fullText = "AI-Powered Health Assistant"

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1))
      i++
      if (i === fullText.length) clearInterval(interval)
    }, 60)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const interval = duration / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      setAnimatedStats({
        users: Math.floor(progress * 1000000),
        accuracy: Math.floor(progress * 98),
        doctors: Math.floor(progress * 500),
      })
      if (step >= steps) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms analyze your symptoms for accurate insights",
    },
    {
      icon: Clock,
      title: "Instant Results",
      description: "Get health recommendations in seconds",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data is encrypted and secure",
    },
    {
      icon: Users,
      title: "Doctor Network",
      description: "Connect with certified doctors instantly",
    },
  ]

  const stats = [
    {
      value: `${(animatedStats.users / 1000000).toFixed(1)}M+`,
      label: "Users Helped",
      icon: Users,
    },
    {
      value: `${animatedStats.accuracy}%`,
      label: "Accuracy Rate",
      icon: Star,
    },
    {
      value: "24/7",
      label: "AI Available",
      icon: Zap,
    },
    {
      value: `${animatedStats.doctors}+`,
      label: "Doctors",
      icon: Stethoscope,
    },
  ]

  const symptoms = ["Headache", "Fever", "Cough", "Fatigue", "Nausea"]

  return (
    <div className="relative overflow-hidden bg-black text-white min-h-screen">

      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-sky-500/20 blur-[120px] animate-pulse" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-sky-400/10 blur-[100px] animate-pulse delay-700" />
        <div className="absolute left-1/2 top-3/4 h-[300px] w-[300px] rounded-full bg-sky-600/10 blur-[80px] animate-pulse delay-1000" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-20">

        {/* Hero */}
        <div className="mx-auto max-w-4xl text-center">

          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-sm text-sky-400 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-sky-400 animate-pulse" />
              Trusted by 1M+ users worldwide
              <ChevronRight className="h-3 w-3" />
            </span>
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-5xl font-extrabold md:text-7xl leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-white bg-clip-text text-transparent">
              {typedText}
              <span className="animate-pulse text-sky-400">|</span>
            </span>
          </h1>

          <p className="mb-10 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Get instant AI health insights in seconds. Analyze symptoms, track your health,
            and connect with certified doctors — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="mb-10 flex flex-col gap-4 sm:flex-row justify-center">
            <button
              onClick={() => onNavigate("symptoms")}
              className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-8 py-4 text-sm font-semibold text-black shadow-lg shadow-sky-500/30 hover:bg-sky-400 hover:shadow-sky-400/40 hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <Stethoscope className="h-5 w-5 c" />
              Check Symptoms Now
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate("dashboard")}
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 px-8 py-4 text-sm font-semibold text-sky-400 hover:bg-sky-500/20 hover:border-sky-400 hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <Play className="h-4 w-4 group-hover:text-white transition-colors" />
              View Dashboard
            </button>
          </div>

          {/* Quick Symptom Chips */}
          <div className="mb-14 flex flex-wrap justify-center gap-2">
            <span className="text-sm text-gray-500 self-center mr-1">Quick check:</span>
            {symptoms.map((symptom) => (
              <button
                key={symptom}
                onClick={() => onNavigate("symptoms")}
                className="rounded-full border border-sky-500/30 bg-sky-500/5 px-3 py-1 text-xs text-sky-400 hover:bg-sky-500 hover:text-black hover:border-sky-500 transition-all duration-200 hover:scale-105"
              >
                {symptom}
              </button>
            ))}
          </div>

          {/* Animated Stats */}
          <div className="mb-20 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                onMouseEnter={() => setHoveredStat(i)}
                onMouseLeave={() => setHoveredStat(null)}
                className={`rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 cursor-default transition-all duration-300 backdrop-blur-sm
                  ${hoveredStat === i
                    ? "border-sky-400/60 bg-sky-500/15 scale-105 shadow-lg shadow-sky-500/20"
                    : "hover:border-sky-500/40"
                  }`}
              >
                <stat.icon className="h-5 w-5 text-sky-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-sky-400">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto max-w-5xl mb-20">
          <h2 className="text-center text-3xl font-bold mb-2 text-white">
            Why Choose{" "}
            <span className="text-sky-400">HealthCareAI?</span>
          </h2>
          <p className="text-center text-sm text-gray-400 mb-10">
            Everything you need for smart health decisions
          </p>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                onClick={() => setActiveFeature(i)}
                className={`rounded-2xl border p-6 cursor-pointer transition-all duration-300 backdrop-blur-sm
                  ${activeFeature === i
                    ? "border-sky-400/60 bg-sky-500/10 scale-105 shadow-lg shadow-sky-500/20"
                    : "border-sky-500/10 bg-white/5 hover:border-sky-500/30 hover:bg-sky-500/5 hover:scale-102"
                  }`}
              >
                <div className={`inline-flex p-2 rounded-xl mb-4 transition-all
                  ${activeFeature === i ? "bg-sky-500/20" : "bg-white/5"}`}
                >
                  <feature.icon className={`h-6 w-6 ${activeFeature === i ? "text-sky-400" : "text-gray-400"}`} />
                </div>
                <h3 className={`font-semibold mb-1 ${activeFeature === i ? "text-sky-400" : "text-white"}`}>
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400">{feature.description}</p>

                {activeFeature === i && (
                  <div className="mt-3 h-0.5 rounded-full bg-sky-500/30">
                    <div className="h-0.5 rounded-full bg-sky-400 animate-pulse w-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Demo Card */}
        <div className="mx-auto max-w-4xl mb-20">
          <div className="rounded-3xl border border-sky-500/20 bg-white/5 overflow-hidden shadow-2xl shadow-sky-500/10 backdrop-blur-sm hover:border-sky-400/40 transition-all duration-300">
            <div className="grid md:grid-cols-2">

              {/* Left */}
              <div className="p-8 border-b md:border-b-0 md:border-r border-sky-500/10">
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 border border-sky-500/20 px-3 py-1 text-xs text-sky-400 mb-4">
                  <Zap className="h-3 w-3" /> Live Demo
                </span>

                <h3 className="text-xl font-bold mb-5 text-white">
                  Experience AI Health Analysis
                </h3>

                <div className="space-y-3 text-sm mb-6">
                  {[
                    { symptom: "Headache", result: "Common Cold", color: "text-yellow-400" },
                    { symptom: "Chest Pain", result: "See Doctor", color: "text-red-400" },
                    { symptom: "Sleep Issues", result: "Lifestyle Tips", color: "text-green-400" },
                  ].map((item) => (
                    <div
                      key={item.symptom}
                      className="flex items-center gap-2 p-3 rounded-xl bg-black/30 border border-sky-500/10 hover:border-sky-500/30 transition-all"
                    >
                      <span className="text-sky-400">✔</span>
                      <span className="text-gray-300">{item.symptom}</span>
                      <ArrowRight className="h-3 w-3 text-gray-500" />
                      <span className={`font-semibold ${item.color}`}>{item.result}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigate("symptoms")}
                  className="group inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-black hover:bg-sky-400 hover:scale-105 transition-all shadow-lg shadow-sky-500/20"
                >
                  Try Now Free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Right - Metrics */}
              <div className="p-8 grid grid-cols-2 gap-4 content-center bg-black/20">
                {[
                  {
                    icon: Heart,
                    label: "Heart Rate",
                    value: "72 BPM",
                    status: "Normal",
                    color: "text-red-400",
                    bg: "bg-red-500/10",
                    border: "border-red-500/20",
                  },
                  {
                    icon: Brain,
                    label: "AI Analysis",
                    value: "Healthy",
                    status: "98% sure",
                    color: "text-sky-400",
                    bg: "bg-sky-500/10",
                    border: "border-sky-500/20",
                  },
                  {
                    icon: Shield,
                    label: "Risk Level",
                    value: "Low",
                    status: "Safe",
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    border: "border-green-500/20",
                  },
                  {
                    icon: Zap,
                    label: "Response",
                    value: "< 2 sec",
                    status: "Instant",
                    color: "text-yellow-400",
                    bg: "bg-yellow-500/10",
                    border: "border-yellow-500/20",
                  },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className={`${metric.bg} border ${metric.border} p-4 rounded-2xl hover:scale-105 transition-all duration-200 cursor-default`}
                  >
                    <metric.icon className={`h-5 w-5 ${metric.color} mb-2`} />
                    <p className="text-xs text-gray-400">{metric.label}</p>
                    <p className={`font-bold text-sm ${metric.color}`}>{metric.value}</p>
                    <p className={`text-xs ${metric.color} opacity-70`}>{metric.status}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Trust */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">Trusted & Secure Platform</p>
          <TrustBadges />
        </div>

      </div>
    </div>
  )
}