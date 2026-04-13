import { useState } from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";


export default function LoginPage() {
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  const fillDemo = (role) => {
    if (role === "admin") { setEmail("admin@university.edu"); setPassword("admin123"); }
    else { setEmail("priya@university.edu"); setPassword("manager123"); }
  };

  const handleLogin =async () => {
    console.log("Login clicked with:", { email, password });

    try {
      const res = await login(email, password);
      console.log("Login response:", res);
      if (res.success) {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
      {/* Background geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
        <div className="absolute top-1/2 left-1/4 w-2 h-2 rounded-full bg-indigo-400 opacity-40" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 rounded-full bg-purple-400 opacity-40" />
        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-indigo-300 opacity-20" />
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Card */}
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
          {/* Header bar */}
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)" }} />

          <div className="p-8">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>UniTrack</h1>
                <p className="text-indigo-300 text-xs">Admissions Intelligence</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-white text-2xl font-bold mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>Welcome back</h2>
              <p className="text-slate-400 text-sm">Sign in to your dashboard</p>
            </div>

            {/* Demo credentials */}
            <div className="flex gap-2 mb-6">
              <button onClick={() => fillDemo("admin")} className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105" style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc" }}>
                Demo: Admin
              </button>
              <button onClick={() => fillDemo("manager")} className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105" style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.4)", color: "#c4b5fd" }}>
                Demo: Manager
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@university.edu"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", fontFamily: "inherit" }}
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all duration-200 pr-12"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", fontFamily: "inherit" }}
                    onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                    {showPass
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                style={{ background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1, #8b5cf6)", fontFamily: "inherit" }}
                onClick={handleLogin}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign In"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-slate-500 text-xs">Internal Dashboard • View Only</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-500 text-xs">Secure</span>
            </div>
          </div>

          <p className="text-slate-400 text-sm m-4 text-center">
  Don't have an account?{" "}
  <span
    onClick={() => navigate("/register")}
    className="text-indigo-400 cursor-pointer"
  >
    Register
  </span>
</p>
        </div>
      </div>
    </div>
  );
}