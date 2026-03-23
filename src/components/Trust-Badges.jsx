import { Shield, Lock, CheckCircle, Award } from "lucide-react";

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
  ];

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {badges.map((badge, index) => {
        const Icon = badge.icon; 

        return (
          <div
            key={badge.title}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              border: "1px solid #ccc",
              padding: "10px",
              borderRadius: "10px",
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div>
              <Icon size={20} />
            </div>
            <div>
              <div style={{ fontWeight: "bold" }}>{badge.title}</div>
              <div style={{ fontSize: "12px" }}>{badge.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TrustBadgesCompact() {
  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <Shield size={16} />
        <span>HIPAA</span>
      </div>

      <div>|</div>

      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <Lock size={16} />
        <span>Encryption</span>
      </div>

      <div>|</div>

      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <CheckCircle size={16} />
        <span>SOC 2</span>
      </div>
    </div>
  );
}