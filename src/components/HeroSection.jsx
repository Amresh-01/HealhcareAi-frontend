import { ArrowRight, Brain, Clock, Shield, Sparkles, Activity, FileText, ChevronRight, Stethoscope } from "lucide-react"
import { TrustBadges } from "@/components/Trust-Badges"
import { Button } from "@/components/ui/button"

export function HeroSection({ onNavigate }) {
  const features = [
    {
      icon: Brain,
      title: "AI Symptom Checker",
      description: "Our advanced intelligence engine provides accurate health assessments instantly.",
    },
    {
      icon: Clock,
      title: "Available 24/7",
      description: "Access reliable health guidance anytime, anywhere, day or night.",
    },
    {
      icon: Shield,
      title: "Bank-Grade Privacy",
      description: "Your health data is encrypted and strictly confidential.",
    },
    {
      icon: FileText,
      title: "Detailed Reports",
      description: "Get comprehensive summaries to share with your healthcare provider.",
    },
  ]

  const symptoms = ["Headache", "Fever", "Back Pain", "Cough", "Fatigue", "Skin Rash"]

  return (
    <div className="relative overflow-hidden bg-background text-foreground font-sans min-h-screen">
      {/* Subtle Background Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px"
        }}
        aria-hidden="true"
      />
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 z-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 z-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6 pt-24 pb-16 lg:pt-32 lg:pb-24">

        <div className="flex flex-col lg:flex-row gap-16 items-center">

          {/* Left Column - Content */}
          <div className="flex-1 lg:max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary mb-8 transition-colors hover:bg-primary/10 cursor-default">
              <Activity className="h-4 w-4" />
              <span>New: Enhanced Symptom Analysis Engine</span>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] md:leading-[1.1]">
              Smarter healthcare, <span className="text-primary block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">delivered instantly.</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl">
              Experience the future of personal health. Our AI-powered assistant analyzes your symptoms and provides credible, immediate guidance—helping you make informed decisions when it matters most.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                onClick={() => onNavigate("symptoms")}
                size="lg"
                className="h-14 px-8 text-base font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer"
              >
                Start Symptom Check
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                onClick={() => onNavigate("dashboard")}
                variant="outline"
                size="lg"
                className="h-14 px-8 text-base font-semibold bg-background hover:bg-muted transition-all cursor-pointer"
              >
                <Stethoscope className="mr-2 h-5 w-5 text-muted-foreground" />
                Provider Login
              </Button>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-4">Common concerns right now:</p>
              <div className="flex flex-wrap gap-2">
                {symptoms.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => onNavigate("symptoms")}
                    className="inline-flex items-center rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors shadow-sm cursor-pointer"
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Visual Mockup */}
          <div className="flex-1 w-full max-w-xl lg:max-w-none relative mt-10 lg:mt-0">
            <div className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden transform md:rotate-2 hover:rotate-0 transition-transform duration-500">
              {/* Fake Browser header */}
              <div className="h-12 border-b border-border bg-muted/50 backdrop-blur flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="mx-auto bg-background border border-border rounded text-[10px] text-muted-foreground font-mono px-16 py-1 flex items-center shadow-sm">
                  app.healthcare.ai/chat
                </div>
              </div>

              {/* Mockup content */}
              <div className="p-6 sm:p-8 bg-muted/20 min-h-[350px]">
                <div className="space-y-6">
                  {/* Chat bubble AI */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-sm">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-card border border-border p-4 rounded-2xl rounded-tl-none shadow-sm text-sm text-card-foreground max-w-[85%]">
                      <p className="mb-2">Hello! I'm your AI health assistant. I can help you understand your symptoms.</p>
                      <p className="font-medium">What's bothering you today?</p>
                    </div>
                  </div>

                  {/* Chat bubble User */}
                  <div className="flex gap-4 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-[10px] font-bold text-primary-foreground">YOU</span>
                    </div>
                    <div className="bg-primary text-primary-foreground p-4 rounded-2xl rounded-tr-none shadow-sm text-sm max-w-[85%]">
                      <p>I've had a dull headache for the past two days and feel slightly lethargic. Should I be worried?</p>
                    </div>
                  </div>

                  {/* Typing Indicator */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-sm">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 w-fit">
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-2.5 flex items-center">
                    <div className="w-full text-muted-foreground text-sm">Type your symptoms here...</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                    <ArrowRight className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="border-y border-border bg-card">
        <div className="container mx-auto px-6 py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 tracking-tight">Enterprise-grade capabilities, <br className="hidden md:block" />designed for everyone.</h2>
            <p className="text-muted-foreground text-lg">Our platform is built on medically reviewed literature and state-of-the-art machine learning models.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 bg-background text-left">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300 border border-primary/10">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-muted/30 py-12 border-b border-border">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-8">Trusted by industry leaders and medical professionals</p>
          <div className="opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <TrustBadges />
          </div>
        </div>
      </div>
    </div>
  )
}