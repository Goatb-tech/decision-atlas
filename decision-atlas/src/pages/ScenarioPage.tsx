import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowsClockwise,
  ArrowUpRight,
  FloppyDiskBack,
  Plus,
  Pulse,
  Timer,
} from "@phosphor-icons/react";
import {
  createReflection,
  createScenarioOption,
  createSnapshot,
  fetchScenario,
  updateScenario,
  updateScenarioOption,
} from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Scenario, ScenarioOption } from "../lib/types";

function OptionCard({
  option,
  userId,
  onUpdate,
}: {
  option: ScenarioOption;
  userId: string;
  onUpdate: (scenario: Scenario) => void;
}) {
  const [draft, setDraft] = useState(option);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(option);
  }, [option]);

  async function handleSave() {
    setSaving(true);
    try {
      const { scenario } = await updateScenarioOption({
        optionId: draft.id,
        userId,
        label: draft.label,
        thesis: draft.thesis,
        upside: draft.upside,
        downside: draft.downside,
        reversibility: draft.reversibility,
        timeToResults: draft.timeToResults,
        effortCost: draft.effortCost,
        confidence: draft.confidence,
      });
      onUpdate(scenario);
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.article
      layout
      className="panel-glass space-y-4"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <input
            value={draft.label}
            onChange={(event) => setDraft({ ...draft, label: event.target.value })}
            className="w-full bg-transparent text-2xl tracking-tight text-white outline-none placeholder:text-slate-500"
            placeholder="Option label"
          />
          <p className="text-sm text-slate-400">Position {draft.position + 1}</p>
        </div>
        <div className="rounded-full border border-white/10 bg-[rgba(124,225,207,0.12)] px-4 py-2 text-sm text-[var(--accent)]">
          {draft.confidence}%
        </div>
      </div>

      <div className="space-y-4">
        {[
          ["Thesis", "thesis", "What is the cleanest case for this path?"],
          ["Upside", "upside", "What gets meaningfully better if this wins?"],
          ["Downside", "downside", "What makes this expensive, fragile, or risky?"],
          ["Reversibility", "reversibility", "How hard is it to unwind or pivot later?"],
          ["Time to results", "timeToResults", "When would this path start paying back?"],
          ["Cost / effort", "effortCost", "What does this ask from you in money, energy, and focus?"],
        ].map(([label, key, placeholder]) => (
          <label key={key} className="field-group">
            <span className="field-label">{label}</span>
            <div className="input-shell min-h-28 items-start py-3">
              <textarea
                value={draft[key as keyof ScenarioOption] as string}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    [key]: event.target.value,
                  })
                }
                className="field-input min-h-20 resize-none"
                placeholder={placeholder}
              />
            </div>
          </label>
        ))}
      </div>

      <label className="field-group">
        <span className="field-label">Confidence score</span>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={draft.confidence}
            onChange={(event) => setDraft({ ...draft, confidence: Number(event.target.value) })}
            className="w-full accent-[var(--accent)]"
          />
        </div>
      </label>

      <button type="button" onClick={handleSave} disabled={saving} className="action-button">
        {saving ? "Saving..." : "Save option"}
        <FloppyDiskBack size={18} />
      </button>
    </motion.article>
  );
}

export function ScenarioPage() {
  const { scenarioId = "" } = useParams();
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metaSaving, setMetaSaving] = useState(false);
  const [snapshotSaving, setSnapshotSaving] = useState(false);
  const [reflectionSaving, setReflectionSaving] = useState(false);
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [snapshotSummary, setSnapshotSummary] = useState("");
  const [reflectionBody, setReflectionBody] = useState("");
  const [reflectionLearned, setReflectionLearned] = useState("");
  const [reflectionLeaning, setReflectionLeaning] = useState("");

  useEffect(() => {
    async function load() {
      if (!userId) {
        return;
      }

      setLoading(true);
      try {
        const response = await fetchScenario(scenarioId, userId);
        setScenario(response.scenario);
        setError("");
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Unable to load scenario.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [scenarioId, userId]);

  if (!user) {
    return null;
  }

  async function handleMetaSave() {
    if (!scenario) {
      return;
    }

    setMetaSaving(true);
    try {
      const { scenario: nextScenario } = await updateScenario({
        scenarioId: scenario.id,
        userId,
        title: scenario.title,
        prompt: scenario.prompt,
        horizon: scenario.horizon,
        status: scenario.status,
        currentLeaning: scenario.currentLeaning,
      });
      setScenario(nextScenario);
    } finally {
      setMetaSaving(false);
    }
  }

  async function handleAddOption() {
    if (!scenario || !newOptionLabel.trim()) {
      return;
    }

    const { scenario: nextScenario } = await createScenarioOption({
      scenarioId: scenario.id,
      userId,
      label: newOptionLabel,
    });
    setScenario(nextScenario);
    setNewOptionLabel("");
  }

  async function handleSnapshot() {
    if (!scenario) {
      return;
    }

    setSnapshotSaving(true);
    try {
      const { scenario: nextScenario } = await createSnapshot({
        scenarioId: scenario.id,
        userId,
        summary: snapshotSummary,
      });
      setScenario(nextScenario);
      setSnapshotSummary("");
    } finally {
      setSnapshotSaving(false);
    }
  }

  async function handleReflection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scenario) {
      return;
    }

    setReflectionSaving(true);
    try {
      const { scenario: nextScenario } = await createReflection({
        scenarioId: scenario.id,
        userId,
        body: reflectionBody,
        learned: reflectionLearned,
        leaning: reflectionLeaning,
      });
      setScenario(nextScenario);
      setReflectionBody("");
      setReflectionLearned("");
      setReflectionLeaning("");
    } finally {
      setReflectionSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
      {loading ? (
        <div className="space-y-4">
          <div className="h-40 animate-pulse rounded-[2rem] border border-white/10 bg-white/5" />
          <div className="grid gap-4 xl:grid-cols-3">
            <div className="h-96 animate-pulse rounded-[2rem] border border-white/10 bg-white/5" />
            <div className="h-96 animate-pulse rounded-[2rem] border border-white/10 bg-white/5 xl:col-span-2" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : scenario ? (
        <div className="space-y-6">
          <section className="panel">
            <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.34em] text-slate-500">Scenario workspace</p>
                <input
                  value={scenario.title}
                  onChange={(event) => setScenario({ ...scenario, title: event.target.value })}
                  className="w-full bg-transparent text-4xl tracking-tight text-white outline-none placeholder:text-slate-500"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="field-group">
                    <span className="field-label">Horizon</span>
                    <div className="input-shell">
                      <input
                        value={scenario.horizon}
                        onChange={(event) => setScenario({ ...scenario, horizon: event.target.value })}
                        className="field-input"
                        placeholder="Next 6 months"
                      />
                    </div>
                  </label>
                  <label className="field-group">
                    <span className="field-label">Current leaning</span>
                    <div className="input-shell">
                      <input
                        value={scenario.currentLeaning}
                        onChange={(event) =>
                          setScenario({ ...scenario, currentLeaning: event.target.value })
                        }
                        className="field-input"
                        placeholder="No leaning recorded yet"
                      />
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <label className="field-group">
                  <span className="field-label">Decision prompt</span>
                  <div className="input-shell min-h-40 items-start py-4">
                    <textarea
                      value={scenario.prompt}
                      onChange={(event) => setScenario({ ...scenario, prompt: event.target.value })}
                      className="field-input min-h-32 resize-none"
                    />
                  </div>
                </label>

                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={handleMetaSave} disabled={metaSaving} className="action-button">
                    {metaSaving ? "Saving..." : "Save scenario"}
                    <FloppyDiskBack size={18} />
                  </button>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    Average confidence: {scenario.averageConfidence}%
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    <Timer size={16} className="mr-2 inline text-[var(--accent)]" />
                    {scenario.snapshots.length} snapshots
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
            <aside className="space-y-6">
              <div className="panel-glass space-y-4">
                <p className="text-xs uppercase tracking-[0.34em] text-slate-500">Add path</p>
                <div className="input-shell">
                  <input
                    value={newOptionLabel}
                    onChange={(event) => setNewOptionLabel(event.target.value)}
                    placeholder="Hybrid consulting runway"
                    className="field-input"
                    disabled={scenario.options.length >= 5}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddOption}
                  disabled={scenario.options.length >= 5}
                  className="ghost-button"
                >
                  <Plus size={16} />
                  {scenario.options.length >= 5 ? "Maximum reached" : "Add option"}
                </button>
              </div>

              <div className="panel-glass space-y-4">
                <p className="text-xs uppercase tracking-[0.34em] text-slate-500">Create snapshot</p>
                <div className="input-shell min-h-28 items-start py-4">
                  <textarea
                    value={snapshotSummary}
                    onChange={(event) => setSnapshotSummary(event.target.value)}
                    className="field-input min-h-20 resize-none"
                    placeholder="Why are you freezing this state right now?"
                  />
                </div>
                <button type="button" onClick={handleSnapshot} disabled={snapshotSaving} className="action-button">
                  {snapshotSaving ? "Saving checkpoint..." : "Save checkpoint"}
                  <Pulse size={18} />
                </button>
              </div>

              <form onSubmit={handleReflection} className="panel space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.34em] text-slate-500">Reflection</p>
                  <h2 className="mt-2 text-2xl tracking-tight text-white">Record what changed</h2>
                </div>

                <label className="field-group">
                  <span className="field-label">What changed?</span>
                  <div className="input-shell min-h-28 items-start py-4">
                    <textarea
                      value={reflectionBody}
                      onChange={(event) => setReflectionBody(event.target.value)}
                      className="field-input min-h-20 resize-none"
                      placeholder="What new information shifted the balance?"
                      required
                    />
                  </div>
                </label>

                <label className="field-group">
                  <span className="field-label">What did you learn?</span>
                  <div className="input-shell min-h-24 items-start py-4">
                    <textarea
                      value={reflectionLearned}
                      onChange={(event) => setReflectionLearned(event.target.value)}
                      className="field-input min-h-16 resize-none"
                      placeholder="What insight should future-you remember?"
                    />
                  </div>
                </label>

                <label className="field-group">
                  <span className="field-label">Current leaning</span>
                  <div className="input-shell">
                    <input
                      value={reflectionLeaning}
                      onChange={(event) => setReflectionLeaning(event.target.value)}
                      className="field-input"
                      placeholder="Leaning toward the hybrid option"
                    />
                  </div>
                </label>

                <button type="submit" disabled={reflectionSaving} className="action-button">
                  {reflectionSaving ? "Saving reflection..." : "Save reflection"}
                  <ArrowUpRight size={18} />
                </button>
              </form>
            </aside>

            <section className="space-y-6">
              <div className="grid gap-4 xl:grid-cols-2">
                {scenario.options.map((option) => (
                  <OptionCard
                    key={option.id}
                    option={option}
                    userId={userId}
                    onUpdate={setScenario}
                  />
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <section className="panel">
                  <div className="mb-5 flex items-center gap-3">
                    <ArrowsClockwise size={20} className="text-[var(--accent)]" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.34em] text-slate-500">Snapshots</p>
                      <h2 className="mt-1 text-2xl tracking-tight text-white">Frozen decision states</h2>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {scenario.snapshots.length > 0 ? (
                      scenario.snapshots.map((snapshot) => (
                        <div key={snapshot.id} className="rounded-[1.7rem] border border-white/10 bg-white/5 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm text-slate-500">
                                {new Date(snapshot.createdAt).toLocaleString()}
                              </p>
                              <h3 className="mt-1 text-lg font-medium text-white">{snapshot.summary}</h3>
                            </div>
                            <div className="rounded-full border border-white/10 bg-[rgba(124,225,207,0.12)] px-3 py-1 text-sm text-[var(--accent)]">
                              {snapshot.averageConfidence}%
                            </div>
                          </div>
                          <div className="mt-4 grid gap-2">
                            {snapshot.scores.map((score) => (
                              <div key={score.id} className="rounded-2xl border border-white/8 bg-white/3 px-3 py-2">
                                <div className="flex items-center justify-between text-sm text-slate-300">
                                  <span>{score.optionLabel}</span>
                                  <span>{score.confidence}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[1.8rem] border border-dashed border-white/10 bg-white/4 p-5 text-sm leading-7 text-slate-400">
                        Save your first checkpoint once the scenario reaches a meaningful state.
                      </div>
                    )}
                  </div>
                </section>

                <section className="panel-glass">
                  <div className="mb-5 flex items-center gap-3">
                    <Pulse size={20} className="text-[var(--accent)]" weight="duotone" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.34em] text-slate-500">Reflections</p>
                      <h2 className="mt-1 text-2xl tracking-tight text-white">What moved the map</h2>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {scenario.reflections.length > 0 ? (
                      scenario.reflections.map((reflection) => (
                        <div key={reflection.id} className="rounded-[1.7rem] border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-slate-500">
                            {new Date(reflection.createdAt).toLocaleString()}
                          </p>
                          <p className="mt-3 text-sm leading-7 text-slate-200">{reflection.body}</p>
                          {reflection.learned ? (
                            <p className="mt-3 text-sm leading-7 text-slate-400">
                              <span className="text-slate-500">Learned:</span> {reflection.learned}
                            </p>
                          ) : null}
                          {reflection.leaning ? (
                            <div className="mt-4 inline-flex rounded-full border border-white/10 bg-[rgba(124,225,207,0.12)] px-3 py-1 text-sm text-[var(--accent)]">
                              Leaning: {reflection.leaning}
                            </div>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[1.8rem] border border-dashed border-white/10 bg-white/4 p-5 text-sm leading-7 text-slate-400">
                        Record the first reflection once you learn something that changes the balance.
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </section>
          </section>
        </div>
      ) : null}
    </main>
  );
}
