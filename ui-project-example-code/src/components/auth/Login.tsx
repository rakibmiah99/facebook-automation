import { useState } from "react";

interface LoginProps {
  onLogin: (user: { name: string; email: string; avatar: string }) => void;
  onGoRegister: () => void;
}

export default function Login({ onLogin, onGoRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      onLogin({ name, email, avatar: "" });
    }, 900);
  };

  return (
    <div className="min-h-full flex" style={{ background: "var(--color-bg)" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10"
        style={{ background: "var(--color-surface)", borderRight: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-primary)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" />
              <rect x="9" y="2" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.6" />
              <rect x="2" y="9" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.6" />
              <rect x="9" y="9" width="5" height="5" rx="1.5" fill="white" />
            </svg>
          </div>
          <span className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>Nexus</span>
        </div>

        <div>
          <blockquote className="text-xl font-medium leading-relaxed mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
            "Nexus gave our team a single source of truth. Delivery velocity went up 40% in the first quarter."
          </blockquote>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{ background: "var(--color-primary)", color: "white" }}
            >
              A
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>Aisha Nakamura</p>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>VP of Engineering, Helix Co.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {["48k", "99.9%", "4.9★"].map((stat, i) => (
            <div key={i}>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>{stat}</p>
              <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>
                {["Active users", "Uptime SLA", "User rating"][i]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>Sign in to your Nexus account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-muted)" }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all duration-150"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                  e.currentTarget.style.outline = "1px solid rgba(99,102,241,0.25)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                  e.currentTarget.style.outline = "none";
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>Password</label>
                <button type="button" className="text-xs" style={{ color: "var(--color-primary)" }}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm outline-none transition-all duration-150"
                  style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-primary)";
                    e.currentTarget.style.outline = "1px solid rgba(99,102,241,0.25)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                    e.currentTarget.style.outline = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-muted)" }}
                >
                  {showPass ? (
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M1 1l13 13M6.3 6.35A2 2 0 009.65 9.7M5 3.27C6.1 2.86 7 2.5 7.5 2.5c3 0 6 4 6 5 0 .6-.6 1.6-1.5 2.6M3 5.5C1.8 6.7 1 8 1 8c0 1 3 5 6.5 5 1.2 0 2.3-.5 3.3-1.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M1.5 7.5S4 3 7.5 3 13.5 7.5 13.5 7.5 11 12 7.5 12 1.5 7.5 1.5 7.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="7.5" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1.3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs py-2 px-3 rounded-lg" style={{ background: "rgba(244,63,94,0.1)", color: "var(--color-danger)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
              style={{
                background: loading ? "rgba(99,102,241,0.5)" : "var(--color-primary)",
                color: "white",
                fontFamily: "var(--font-display)",
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
          </div>

          <button
            className="mt-4 w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2.5 transition-all duration-150"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-hover)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.7 3.7 0 01-1.6 2.42v2h2.58c1.5-1.39 2.4-3.43 2.4-5.88z" fill="#4285F4"/>
              <path d="M8 16c2.16 0 3.97-.71 5.3-1.94l-2.58-2c-.72.48-1.63.76-2.72.76-2.09 0-3.86-1.41-4.5-3.3H.83v2.07A8 8 0 008 16z" fill="#34A853"/>
              <path d="M3.5 9.52A4.83 4.83 0 013.24 8c0-.53.09-1.04.26-1.52V4.41H.83A8 8 0 000 8c0 1.29.31 2.5.83 3.59l2.67-2.07z" fill="#FBBC05"/>
              <path d="M8 3.18c1.18 0 2.24.41 3.07 1.2l2.3-2.3A8 8 0 00.83 4.41L3.5 6.48C4.14 4.59 5.91 3.18 8 3.18z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm mt-6" style={{ color: "var(--color-muted)" }}>
            Don't have an account?{" "}
            <button onClick={onGoRegister} className="font-medium transition-colors" style={{ color: "var(--color-primary)" }}>
              Sign up free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
