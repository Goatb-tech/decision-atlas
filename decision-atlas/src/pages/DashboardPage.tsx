import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Graph,
  NotePencil,
  Pulse,
  CompassTool,
  Sparkle,
  Stack,
} from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { useAtlas } from "../context/AtlasContext";
import { Sparkline } from "../components/Sparkline";

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="panel-glass min-h-36">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <p className="mt-5 text-4xl tracking-tight text-white">{value}</p>
      <p className="mt-3 text-sm leading-7 text-slate-400">{helper}</p>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { scenarios, summary, latestReflection, confidenceTrend, loading, error } = useAtlas();

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]"
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs uppercase tracking-[0.34em] text-slate-500">Dashboard</p>
              <h1 className="text-4xl tracking-tight text-white md:text-5xl">
                Welcome back, <span className="text-[var(--accent)]">{user?.name}</span>.
              </h1>
              <p className="max-w-[62ch] text-base leading-8 text-slate-300">
                Your atlas is tracking where confidence is climbing, where reversibility is falling,
                and which scenarios deserve a fresh checkpoint next.
              </p>
            </div>

            <Link to="/scenarios/new" className="action-button">
              Start new scenario
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Scenarios"
              value={summary.totalScenarios}
              helper="How many active decisions you are tracking right now."
            />
            <MetricCard
              label="Active paths"
              value={summary.activeScenarios}
              helper="Scenarios still in motion and not archived into a final call."
            />
            <MetricCard
              label="Snapshots"
              value={summary.totalSnapshots}
              helper="Frozen checkpoints that preserve what the tradeoffs looked like then."
            />
            <MetricCard
              label="Avg confidence"
              value={`${summary.averageConfidence}%`}
              helper="Average confidence across the options currently on your board."
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="panel">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Confidence trend</p>
                  <h2 className="mt-2 text-2xl tracking-tight text-white">
                    Where your conviction is moving
                  </h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                  <Graph size={16} className="mr-2 inline text-[var(--accent)]" />
                  Recent checkpoints
                </div>
              </div>
              <Sparkline points={confidenceTrend} />
            </section>

            <section className="panel-glass">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-[rgba(124,225,207,0.14)] p-3 text-[var(--accent)]">
                  <NotePencil size={22} weight="duotone" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Latest reflection</p>
                  <h2 className="mt-1 text-2xl tracking-tight text-white">What changed most recently</h2>
                </div>
              </div>

              {latestReflection ? (
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                    {latestReflection.scenarioTitle}
                  </p>
                  <p className="text-base leading-8 text-slate-200">{latestReflection.body}</p>
                  {latestReflection.learned ? (
                    <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
                      <span className="text-slate-500">Learned:</span> {latestReflection.learned}
                    </div>
                  ) : null}
                  {latestReflection.leaning ? (
                    <div className="inline-flex rounded-full border border-white/10 bg-[rgba(124,225,207,0.12)] px-4 py-2 text-sm text-[var(--accent)]">
                      Current leaning: {latestReflection.leaning}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-[1.8rem] border border-dashed border-white/10 bg-white/4 p-5 text-sm leading-7 text-slate-400">
                  Add a reflection after your first scenario checkpoint and it will surface here.
                </div>
              )}
            </section>
          </div>
        </div>

        <section className="panel">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recent scenarios</p>
              <h2 className="mt-2 text-2xl tracking-tight text-white">Return to the live decisions</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              <Stack size={16} className="mr-2 inline text-[var(--accent)]" />
              Sticky sessions
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-[1.8rem] border border-white/10 bg-white/5" />
              ))}
            </div>
          ) : scenarios.length > 0 ? (
            <div className="space-y-4">
              {scenarios.map((scenario, index) => (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <Link
                    to={`/scenarios/${scenario.id}`}
                    className="group block rounded-[1.9rem] border border-white/10 bg-white/5 p-5 transition hover:border-[rgba(124,225,207,0.28)] hover:bg-white/7"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[rgba(124,225,207,0.12)] px-3 py-1 text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
                            {scenario.horizon || "Open horizon"}
                          </span>
                          <span className="rounded-full bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-400">
                            {scenario.optionCount} options
                          </span>
                        </div>
                        <h3 className="text-2xl tracking-tight text-white transition group-hover:text-[var(--accent)]">
                          {scenario.title}
                        </h3>
                        <p className="text-sm leading-7 text-slate-400">
                          {scenario.prompt || "A scenario without a written prompt yet."}
                        </p>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                        {scenario.averageConfidence}%
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <div className="rounded-[1.3rem] border border-white/8 bg-[rgba(255,255,255,0.03)] p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <CompassTool size={16} className="text-[var(--accent)]" />
                          Current leaning
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-400">
                          {scenario.currentLeaning || "No leaning recorded yet."}
                        </p>
                      </div>
                      <div className="rounded-[1.3rem] border border-white/8 bg-[rgba(255,255,255,0.03)] p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Sparkle size={16} className="text-[var(--accent)]" />
                          Latest checkpoint
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-400">
                          {scenario.latestSnapshot?.summary ||
                            scenario.latestReflection?.body ||
                            "No snapshot or reflection yet."}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/4 p-7 text-slate-300">
              <div className="mb-4 inline-flex rounded-2xl bg-[rgba(124,225,207,0.14)] p-3 text-[var(--accent)]">
                <Pulse size={22} weight="duotone" />
              </div>
              <h3 className="text-2xl tracking-tight text-white">No scenarios yet</h3>
              <p className="mt-3 max-w-[46ch] text-sm leading-7 text-slate-400">
                Create your first atlas entry and start comparing the paths that keep competing for your attention.
              </p>
              <Link to="/scenarios/new" className="action-button mt-6 inline-flex">
                Create the first scenario
                <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </section>
      </motion.section>
    </main>
  );
}
