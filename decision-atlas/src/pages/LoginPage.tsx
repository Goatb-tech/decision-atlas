import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { At, Eye, EyeSlash, LockKey } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await login(email, password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error || "Unable to sign in.");
      return;
    }

    navigate("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-84px)] max-w-[1400px] items-center px-4 py-10 md:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="panel-glass flex flex-col justify-between gap-8 p-8">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-500">Persistent access</p>
            <h1 className="text-4xl leading-tight tracking-tight text-white">
              Return to the same atlas without rebuilding the map.
            </h1>
            <p className="max-w-[48ch] text-base leading-8 text-slate-300">
              Decision Atlas keeps your scenarios, snapshots, and reflections ready after each refresh,
              so the product feels anchored instead of disposable.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-sm leading-7 text-slate-300">
            “The best part is coming back later and seeing what I used to believe before the facts
            changed.”
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="panel mx-auto w-full max-w-xl p-8"
        >
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-500">Sign in</p>
            <h2 className="mt-3 text-3xl tracking-tight text-white">Open your saved scenarios</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Your local session will stay sticky so you can jump back in quickly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

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
                  placeholder="••••••••"
                  className="field-input"
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

            <button type="submit" disabled={submitting} className="action-button w-full justify-center">
              {submitting ? "Opening atlas..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Need an account?{" "}
            <Link to="/register" className="text-[var(--accent)] transition hover:text-white">
              Create one
            </Link>
          </p>
        </motion.section>
      </div>
    </main>
  );
}
