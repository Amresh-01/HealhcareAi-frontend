import { Link } from "react-router-dom"
import { LoginForm } from "@/components/auth/LoginForm"

export default function Login() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden px-4">

      {/* Soft Gradient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.18),transparent_40%)]" />

      {/* Subtle Blur Overlay */}
      <div className="absolute inset-0 backdrop-blur-[80px]" />

      {/* Card */}
      <div className="relative group w-full max-w-md p-7 rounded-2xl border bg-zinc-900/80 backdrop-blur-md shadow-xl space-y-6 transition-all duration-300 hover:shadow-blue-500/10 hover:border-blue-500/30">

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold text-white">
            Welcome Back 👋
          </h1>
          <p className="text-sm text-gray-400">
            Login to continue to HealthCareAI
          </p>
        </div>

        {/* Form */}
        <LoginForm />

        {/* Bottom Link */}
        <p className="text-sm text-center text-gray-400">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-500 font-medium transition hover:text-blue-400 hover:underline"
          >
            Sign up
          </Link>
        </p>

      </div>

    </div>
  )
}