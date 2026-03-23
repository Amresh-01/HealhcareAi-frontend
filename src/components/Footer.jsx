import { Link } from "react-router-dom"
import { Activity, Github, Twitter, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#010612] text-[#e2e8f0]">
      <div className="container mx-auto px-4 py-12">

        <div className="grid gap-10 md:grid-cols-4">

          {/* Logo */}
          <div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] text-black">
                <Activity className="h-5 w-5" />
              </div>

              <span className="text-xl font-bold">
                HealthCare<span className="text-[#0ea5e9]">AI</span>
              </span>
            </div>

            <p className="mt-4 text-sm text-[#94a3b8]">
              AI-powered health insights platform for smarter decisions.
            </p>

            {/* Social */}
            <div className="flex gap-4 mt-5">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <div
                  key={i}
                  className="p-2 rounded-full border border-white/10 cursor-pointer 
                  hover:bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] 
                  hover:text-black transition-all hover:scale-110"
                >
                  <Icon className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-[#94a3b8]">
              <li>
                <Link to="/symptoms" className="hover:text-[#22d3ee] transition">
                  Symptom Checker
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#22d3ee] transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-[#22d3ee] transition">
                  Doctors
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-[#94a3b8]">
              <li className="hover:text-[#22d3ee] cursor-pointer">About</li>
              <li className="hover:text-[#22d3ee] cursor-pointer">Careers</li>
              <li className="hover:text-[#22d3ee] cursor-pointer">Contact</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Stay Updated</h4>

            <p className="text-sm text-[#94a3b8] mb-3">
              Get latest health insights
            </p>

            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-[#030b1a] border border-white/10 outline-none focus:ring-2 focus:ring-[#0ea5e9]"
              />

              <button className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] text-black hover:scale-105 transition">
                Join
              </button>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">

          <p className="text-sm text-[#94a3b8]">
            © 2026 HealthCareAI. All rights reserved.
          </p>

          <div className="flex gap-4 text-sm text-[#94a3b8]">
            <span className="hover:text-[#22d3ee] cursor-pointer">Privacy</span>
            <span className="hover:text-[#22d3ee] cursor-pointer">Terms</span>
            <span className="hover:text-[#22d3ee] cursor-pointer">Cookies</span>
          </div>

        </div>

      </div>
    </footer>
  )
}