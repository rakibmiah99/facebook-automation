import { useState } from "react";

interface RegisterProps {
  onRegister: (user: { name: string; email: string; avatar: string }) => void;
  onGoLogin: () => void;
}

const roles = ["Engineer", "Designer", "Product Manager", "Team Lead", "Founder", "Other"];

export default function Register({ onRegister, onGoLogin }: RegisterProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    company: "",
    role: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email required";
    if (form.password.length < 8) errs.password = "Minimum 8 characters";
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match";
    return errs;
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role) { setErrors({ role: "Please select a role" }); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onRegister({ name: form.name, email: form.email, avatar: "" });
    }, 1000);
  };

  const strength = (() => {
    if (!form.password) return 0;
    let s = 0;
    if (form.password.length >= 8) s++;
    if (/[A-Z]/.test(form.password)) s++;
    if (/[0-9]/.test(form.password)) s++;
    if (/[^A-Za-z0-9]/.test(form.password)) s++;
    return s;
  })();

  const strengthColor = ["", "#f43f5e", "#f59e0b", "#10b981", "#6366f1"][strength];
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];

  const Field = ({
    label, id, type = "text", value, onChange, error, placeholder, suffix
  }: {
    label: string; id: string; type?: string; value: string;
    onChange: (v: string) => void; error?: string; placeholder?: string; suffix?: React.ReactNode;
  }) => (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-muted)" }}>{label}</label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all duration-150"
          style={{
            background: "var(--color-surface-2)",
            border: `1px solid ${error ? "var(--color-danger)" : "var(--color-border)"}`,
            color: "var(--color-text)",
            paddingRight: suffix ? "44px" : undefined,
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = "var(--color-primary)";
              e.currentTarget.style.outline = "1px solid rgba(99,102,241,0.25)";
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? "var(--color-danger)" : "var(--color-border)";
            e.currentTarget.style.outline = "none";
          }}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
      {error && <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>{error}</p>}
    </div>
  );

  return (
    <div className="min-h-full flex items-center justify-center p-6" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--color-primary)" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" />
              <rect x="9" y="2" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.6" />
              <rect x="2" y="9" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.6" />
              <rect x="9" y="9" width="5" height="5" rx="1.5" fill="white" />
            </svg>
          </div>
          <span className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>Nexus</span>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all"
                style={{
                  background: step >= s ? "var(--color-primary)" : "var(--color-surface-2)",
                  color: step >= s ? "white" : "var(--color-muted)",
                }}
              >
                {step > s ? "✓" : s}
              </div>
              <span className="text-xs" style={{ color: step >= s ? "var(--color-text)" : "var(--color-muted)" }}>
                {s === 1 ? "Account" : "Profile"}
              </span>
              {s < 2 && <div className="flex-1 h-px" style={{ background: step > 1 ? "var(--color-primary)" : "var(--color-border)" }} />}
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          {step === 1 ? (
            <>
              <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>Create your account</h1>
              <p className="text-sm mb-5" style={{ color: "var(--color-muted)" }}>Free forever. No credit card required.</p>

              <form onSubmit={handleStep1} className="space-y-4">
                <Field
                  label="Full name" id="name" value={form.name}
                  onChange={(v) => update("name", v)} error={errors.name} placeholder="Alex Johnson"
                />
                <Field
                  label="Work email" id="email" type="email" value={form.email}
                  onChange={(v) => update("email", v)} error={errors.email} placeholder="alex@company.com"
                />
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-muted)" }}>Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm outline-none transition-all duration-150"
                      style={{
                        background: "var(--color-surface-2)",
                        border: `1px solid ${errors.password ? "var(--color-danger)" : "var(--color-border)"}`,
                        color: "var(--color-text)",
                      }}
                      onFocus={(e) => { if (!errors.password) { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.outline = "1px solid rgba(99,102,241,0.25)"; } }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = errors.password ? "var(--color-danger)" : "var(--color-border)"; e.currentTarget.style.outline = "none"; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--color-muted)" }}
                    >
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <path d="M1.5 7.5S4 3 7.5 3 13.5 7.5 13.5 7.5 11 12 7.5 12 1.5 7.5 1.5 7.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="7.5" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1.3"/>
                      </svg>
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded-full transition-all"
                            style={{ background: i <= strength ? strengthColor : "var(--color-surface-2)" }}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
                    </div>
                  )}
                  {errors.password && <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>{errors.password}</p>}
                </div>
                <Field
                  label="Confirm password" id="confirm" type="password" value={form.confirm}
                  onChange={(v) => update("confirm", v)} error={errors.confirm} placeholder="••••••••"
                />

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg text-sm font-semibold mt-2 transition-opacity"
                  style={{ background: "var(--color-primary)", color: "white", fontFamily: "var(--font-display)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                >
                  Continue →
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>Tell us about yourself</h1>
              <p className="text-sm mb-5" style={{ color: "var(--color-muted)" }}>Help us personalize your experience.</p>

              <form onSubmit={handleStep2} className="space-y-4">
                <Field
                  label="Company (optional)" id="company" value={form.company}
                  onChange={(v) => update("company", v)} placeholder="Acme Inc."
                />
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-muted)" }}>Your role</label>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((r) => {
                      const sel = form.role === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => { update("role", r); setErrors({}); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                          style={{
                            background: sel ? "var(--color-primary)" : "var(--color-surface-2)",
                            color: sel ? "white" : "var(--color-muted)",
                            border: `1px solid ${sel ? "var(--color-primary)" : "var(--color-border)"}`,
                          }}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                  {errors.role && <p className="text-xs mt-1.5" style={{ color: "var(--color-danger)" }}>{errors.role}</p>}
                </div>

                <div
                  className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }}>
                    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    By creating an account, you agree to our{" "}
                    <span style={{ color: "var(--color-primary)" }}>Terms of Service</span> and{" "}
                    <span style={{ color: "var(--color-primary)" }}>Privacy Policy</span>.
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text)",
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
                    style={{
                      background: loading ? "rgba(99,102,241,0.5)" : "var(--color-primary)",
                      color: "white",
                      fontFamily: "var(--font-display)",
                    }}
                    onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                  >
                    {loading ? "Creating account..." : "Create account"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm mt-4" style={{ color: "var(--color-muted)" }}>
          Already have an account?{" "}
          <button onClick={onGoLogin} className="font-medium" style={{ color: "var(--color-primary)" }}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
