import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DashboardSkeleton } from "@/components/Skeleton-loaders"
import { NoSymptomChecksEmpty, NoAppointmentsEmpty } from "@/components/EmptyState"
import { HealthInsightsChart, SymptomDistributionChart, MonthlyTrendsChart } from "@/components/HealthCharts"
import {
  Activity,
  Heart,
  Moon,
  Droplets,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  User,
  Stethoscope,
  Bell,
  ChevronRight,
  Sparkles,
} from "lucide-react"

// simple cn function (if not already created)
const cn = (...classes) => classes.filter(Boolean).join(" ")

export function Dashboard({ onNavigate, showEmptyState = false }) {
  const [isLoading, setIsLoading] = useState(true)
  const [healthScore, setHealthScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)

      let score = 0
      const interval = setInterval(() => {
        score += 2
        setHealthScore(Math.min(score, 85))
        if (score >= 85) clearInterval(interval)
      }, 30)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "low":
        return "bg-green-100 text-green-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "high":
        return "bg-red-100 text-red-700"
      default:
        return ""
    }
  }

  const recentChecks = [
    {
      id: "1",
      date: "Today",
      result: "Common Cold",
      severity: "low",
    },
  ]

  const upcomingAppointments = [
    {
      id: "1",
      doctor: "Dr. Sarah Johnson",
      specialization: "General Practitioner",
      date: "Mar 25",
      time: "10:00 AM",
    },
  ]

  const healthMetrics = [
    {
      label: "Heart Rate",
      value: "72",
      unit: "BPM",
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-100",
    },
    {
      label: "Sleep",
      value: "7.5",
      unit: "hours",
      icon: Moon,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <Button onClick={() => onNavigate("symptoms")}>
          <Stethoscope className="mr-2 h-4 w-4" />
          Check Symptoms
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        {healthMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4">
              <div className="flex justify-between">
                <span>{metric.label}</span>
                <metric.icon className={metric.color} />
              </div>
              <p className="text-xl font-bold">
                {metric.value} {metric.unit}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <HealthInsightsChart />
        <SymptomDistributionChart />
      </div>

      <MonthlyTrendsChart />

      {/* Recent Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Checks</CardTitle>
        </CardHeader>
        <CardContent>
          {showEmptyState ? (
            <NoSymptomChecksEmpty onAction={() => onNavigate("symptoms")} />
          ) : (
            recentChecks.map((check) => (
              <div key={check.id} className="flex justify-between p-3 border rounded">
                <span>{check.result}</span>
                <Badge className={getSeverityColor(check.severity)}>
                  {check.severity}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {showEmptyState ? (
            <NoAppointmentsEmpty onAction={() => onNavigate("doctors")} />
          ) : (
            upcomingAppointments.map((apt) => (
              <div key={apt.id} className="flex justify-between p-3 border rounded">
                <span>{apt.doctor}</span>
                <span>{apt.date}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

    </div>
  )
}