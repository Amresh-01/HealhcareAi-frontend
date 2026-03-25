import { Shield, Lock, CheckCircle, Award } from "lucide-react"

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Your data is protected",
    },
    {
      icon: Lock,
      title: "256-bit Encryption",
      description: "Bank-level security",
    },
    {
      icon: CheckCircle,
      title: "FDA Guidelines",
      description: "Following best practices",
    },
    {
      icon: Award,
      title: "SOC 2 Certified",
      description: "Enterprise ready",
    },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {badges.map((badge, index) => {
        const Icon = badge.icon

        return (
          <div
            key={badge.title}
            className="group flex items-center gap-3 px-5 py-4 rounded-xl 
            bg-white/5 backdrop-blur-lg border  border-white/10 
            hover:bg-sky-500/20 hover:bg-white%/10
            transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Icon */}
            <div className="p-2 rounded-lg bg-primary/20 text-primary group-hover:scale-110 transition">
              <Icon size={18} />
            </div>

            {/* Text */}
            <div>
              <p className="text-sm font-semibold text-white">
                {badge.title}
              </p>
              <p className="text-xs text-gray-400">
                {badge.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}