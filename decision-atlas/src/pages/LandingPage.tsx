import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Compass,
  Graph,
  Path,
  Pulse,
  Sparkle,
} from "@phosphor-icons/react";

const features = [
  {
    title: "Compare 2 to 5 paths without flattening them",
    body: "Hold thesis, upside, downside, reversibility, effort, timing, and confidence in one place.",
    icon: Graph,
  },
  {
    title: "Save checkpoints before your thinking shifts",
    body: "Freeze a scenario into a snapshot so later edits never rewrite what you believed in that moment.",
    icon: Pulse,
  },
  {
    title: "Track how your leaning evolves over time",
    body: "Reflection entries create a clear trail of what changed, what you learned, and where you stand now.",
    icon: Path,
  },
];

export function LandingPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative">
      <main className="mx-auto flex min-h-[calc(100dvh-84px)] max-w-[1400px] items-center px-4 py-12 md:px-8">
        <section className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            >
              <Sparkle size={16} className="text-[var(--accent)]" />
              Motion-first scenario lab
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <h1 className="max-w-3xl text-5xl leading-none tracking-[-0.06em] text-white md:text-7xl">
                Stop deciding in circles.
                <span className="block text-[var(--accent)]">Map the tradeoffs instead.</span>
              </h1>
              <p className="max-w-[62ch] text-lg leading-8 text-slate-300">
                Decision Atlas turns major choices into a living strategic map. Compare paths,
                save checkpoints, and return weeks later with the full trail of how your thinking moved.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/register" className="action-button">
                Open your atlas
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="ghost-button">
                Resume a saved session
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {features.map((feature, index) => (
                <motion.article
                  key={feature.title}
                  className="panel-glass min-h-44"
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: [0, index % 2 === 0 ? -4 : 4, 0],
                        }
                  }
                  transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut" }}
                >
                  <feature.icon size={26} className="mb-5 text-[var(--accent)]" weight="duotone" />
                  <h2 className="text-lg font-medium text-white">{feature.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{feature.body}</p>
                </motion.article>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="panel relative overflow-hidden rounded-[2.6rem] p-7">
              <div className="flex items-center justify-between border-b border-white/8 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.34em] text-slate-500">
                    Live scenario
                  </p>
                  <h2 className="mt-2 text-2xl tracking-tight text-white">
                    Build software studio or join a team?
                  </h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                  Confidence map
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  { label: "Independent studio", confidence: 74, accent: "w-[74%]" },
                  { label: "Join an established team", confidence: 68, accent: "w-[68%]" },
                  { label: "Hybrid contract runway", confidence: 61, accent: "w-[61%]" },
                ].map((option, index) => (
                  <motion.div
                    key={option.label}
                    className="rounded-[1.8rem] border border-white/10 bg-white/4 p-5"
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : {
                            x: [0, index === 1 ? 8 : -4, 0],
                          }
                    }
                    transition={{ duration: 7 + index, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-medium text-white">{option.label}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          Snapshot-friendly tradeoff model with frozen checkpoints.
                        </p>
                      </div>
                      <div className="rounded-full border border-white/10 bg-[rgba(124,225,207,0.12)] px-3 py-1 text-sm text-[var(--accent)]">
                        {option.confidence}%
                      </div>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/6">
                      <motion.div
                        className={`h-full rounded-full bg-[var(--accent)] ${option.accent}`}
                        animate={shouldReduceMotion ? undefined : { opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="mt-6 rounded-[2rem] border border-white/10 bg-[rgba(124,225,207,0.08)] p-5"
                animate={shouldReduceMotion ? undefined : { scale: [1, 1.02, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3 text-slate-200">
                  <Compass size={18} className="text-[var(--accent)]" weight="duotone" />
                  Latest reflection
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Joining a team still wins on speed and mentorship, but the studio option keeps
                  climbing as the runway becomes less risky.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
