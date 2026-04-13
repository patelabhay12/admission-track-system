import { useState } from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const { register, error, loading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register({ name, email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>

      {/* Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-indigo-500 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-500 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        <div className="rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>

          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <div className="p-8">
            {/* Heading */}
            <h2 className="text-white text-2xl font-bold mb-1">Create Account</h2>
            <p className="text-slate-400 text-sm mb-6">Register to access dashboard</p>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div>
                <label className="text-slate-300 text-sm">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full mt-1 px-4 py-3 rounded-xl text-white bg-white/10 border border-white/20 outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-slate-300 text-sm">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@university.edu"
                  className="w-full mt-1 px-4 py-3 rounded-xl text-white bg-white/10 border border-white/20 outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-slate-300 text-sm">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full mt-1 px-4 py-3 rounded-xl text-white bg-white/10 border border-white/20 outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    👁
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-[1.02] transition"
              >
                {loading ? "Creating..." : "Register"}
              </button>
            </form>

            {/* Footer */}
            <p className="text-slate-400 text-sm mt-4 text-center">
  Don't have an account?{" "}
  <span
    onClick={() => navigate("/login")}
    className="text-indigo-400 cursor-pointer"
  >
    Login
  </span>
</p>
          </div>
        </div>
      </div>
    </div>
  );
}