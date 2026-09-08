import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { At, Eye, EyeSlash, IdentificationCard, LockKey } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const result = await register(name, email, password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error || "Unable to create account.");
      return;
    }

    navigate("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-84px)] max-w-[1400px] items-center px-4 py-10 md:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.86fr_1.14fr]">
        <section className="panel-glass space-y-6 p-8">
          <p className="text-xs uppercase tracking-[0.34em] text-slate-500">New account</p>
          <h1 className="text-4xl leading-tight tracking-tight text-white">
            Start with one real decision and keep the full trail.
          </h1>
          <p className="text-base leading-8 text-slate-300">
            Create your account once, then use the atlas as a durable place to compare options
            instead of scattering tradeoffs across notes, chats, and half-finished docs.
          </p>
          <div className="grid gap-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              1. Create a scenario with 2 to 5 paths.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              2. Save a checkpoint before new information changes the balance.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              3. Add reflections so future-you can see the path, not just the outcome.
            </div>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="panel mx-auto w-full max-w-xl p-8"
        >
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-500">Create account</p>
            <h2 className="mt-3 text-3xl tracking-tight text-white">Claim your atlas</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

            <label className="field-group">
              <span className="field-label">Full name</span>
              <div className="input-shell">
                <IdentificationCard size={18} className="text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ari Bennett"
                  className="field-input"
                  required
                />
              </div>
            </label>

            <label className="field-group">
              <span className="field-label">Email</span>
              <div className="input-shell">
                <At size={18} className="text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="field-input"
                  required
                />
              </div>
            </label>

            <label className="field-group">
              <span className="field-label">Password</span>
              <div className="input-shell">
                <LockKey size={18} className="text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  className="field-input"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="text-slate-400 transition hover:text-white"
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <label className="field-group">
              <span className="field-label">Confirm password</span>
              <div className="input-shell">
                <LockKey size={18} className="text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat your password"
                  className="field-input"
                  minLength={6}
                  required
                />
              </div>
            </label>

            <button type="submit" disabled={submitting} className="action-button w-full justify-center">
              {submitting ? "Creating atlas..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-[var(--accent)] transition hover:text-white">
              Sign in
            </Link>
          </p>
        </motion.section>
      </div>
    </main>
  );
}
