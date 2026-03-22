import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { TrustBadges } from "@/components/TrustBadges"
import {
  Activity,
  ArrowRight,
  Sparkles,
  Brain,
  Heart,
  Stethoscope,
  Shield,
  Clock,
  Users,
  CheckCircle,
  Play,
} from "lucide-react"

export function HeroSection({ onNavigate }) {
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
      description: "Connect with certified doctors",
    },
  ]

  const stats = [
    { value: "1M+", label: "Users Helped" },
    { value: "98%", label: "Accuracy Rate" },
    { value: "24/7", label: "AI Available" },
    { value: "500+", label: "Doctors" },
  ]

  return (
    <div className="relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16">

        {/* Hero */}
        <div className="mx-auto max-w-4xl text-center">

          <Badge className="mb-6 px-4 py-2">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            Trusted by 1M+ users
          </Badge>

          <h1 className="mb-6 text-4xl font-bold md:text-6xl">
            AI-Powered{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Symptom Checker
            </span>
          </h1>

          <p className="mb-8 text-lg text-muted-foreground">
            Get instant AI health insights. Analyze symptoms and connect with doctors.
          </p>

          <div className="mb-12 flex flex-col gap-4 sm:flex-row justify-center">
            <Button size="lg" onClick={() => onNavigate("symptoms")}>
              <Stethoscope className="mr-2 h-5 w-5" />
              Check Symptoms
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate("dashboard")}
            >
              <Play className="mr-2 h-4 w-4" />
              View Dashboard
            </Button>
          </div>

          {/* Stats */}
          <div className="mb-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border p-4">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto max-w-5xl mb-16">
          <h2 className="text-center text-2xl font-bold mb-8">
            Why Choose HealthCareAI?
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="p-6">
                  <feature.icon className="h-6 w-6 text-primary mb-4" />
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Demo Card */}
        <div className="mx-auto max-w-4xl mb-16">
          <Card>
            <CardContent className="p-8 grid md:grid-cols-2 gap-6">
              
              <div>
                <h3 className="text-xl font-bold mb-4">
                  Experience AI Health Analysis
                </h3>

                <div className="space-y-2 text-sm">
                  <p>✔ Headache → Cold</p>
                  <p>✔ Chest Pain → Doctor Visit</p>
                  <p>✔ Sleep Issues → Lifestyle Tips</p>
                </div>

                <Button
                  className="mt-4"
                  onClick={() => onNavigate("symptoms")}
                >
                  Try Now
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-lg">
                  <Heart className="h-6 w-6 text-red-500" />
                  <p>Heart Rate</p>
                  <p className="font-bold">72 BPM</p>
                </div>

                <div className="bg-card p-4 rounded-lg">
                  <Brain className="h-6 w-6 text-purple-500" />
                  <p>AI Analysis</p>
                  <p className="text-green-500 font-bold">Healthy</p>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Trust */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Trusted & Secure Platform
          </p>
          <TrustBadges />
        </div>

      </div>
    </div>
  )
}