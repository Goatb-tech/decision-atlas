import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus } from "@phosphor-icons/react";
import { useAtlas } from "../context/AtlasContext";

export function NewScenarioPage() {
  const navigate = useNavigate();
  const { createScenarioAndRefresh } = useAtlas();
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [horizon, setHorizon] = useState("");
  const [currentLeaning, setCurrentLeaning] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateOption(index: number, value: string) {
    setOptions((current) => current.map((option, optionIndex) => (optionIndex === index ? value : option)));
  }

  function addOption() {
    setOptions((current) => (current.length >= 5 ? current : [...current, ""]));
  }

  function removeOption(index: number) {
    setOptions((current) => (current.length <= 2 ? current : current.filter((_, optionIndex) => optionIndex !== index)));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const initialOptions = options
      .map((label) => label.trim())
      .filter(Boolean)
      .map((label) => ({ label }));

    if (initialOptions.length < 2) {
      setError("Add at least two option names to build the comparison workspace.");
      return;
    }

    setSubmitting(true);
    try {
      const scenario = await createScenarioAndRefresh({
        title,
        prompt,
        horizon,
        currentLeaning,
        initialOptions,
      });

      navigate(`/scenarios/${scenario.id}`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to create scenario.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  }

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
      <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <section className="panel-glass space-y-6">
          <p className="text-xs uppercase tracking-[0.34em] text-slate-500">Builder</p>
          <h1 className="text-4xl tracking-tight text-white">Frame the decision before the noise starts.</h1>
          <p className="max-w-[55ch] text-base leading-8 text-slate-300">
            Give the scenario a clear prompt, pick the initial paths, and let the comparison workspace
            become the place where the decision matures instead of scattering across tabs.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
              Use option labels that reflect a real path, not vague categories.
            </div>
            <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
              Save your current leaning now if you want to measure how it changes later.
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-500">New scenario</p>
            <h2 className="mt-2 text-3xl tracking-tight text-white">Create a fresh atlas entry</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error ? <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

            <label className="field-group">
              <span className="field-label">Scenario title</span>
              <div className="input-shell">
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Should I build a product studio or join a growth-stage team?"
                  className="field-input"
                  required
                />
              </div>
            </label>

            <label className="field-group">
              <span className="field-label">Decision prompt</span>
              <div className="input-shell min-h-36 items-start py-4">
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Write the exact tradeoff you are trying to resolve."
                  className="field-input min-h-28 resize-none"
                  required
                />
              </div>
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="field-group">
                <span className="field-label">Horizon</span>
                <div className="input-shell">
                  <input
                    type="text"
                    value={horizon}
                    onChange={(event) => setHorizon(event.target.value)}
                    placeholder="Next 12 months"
                    className="field-input"
                  />
                </div>
              </label>

              <label className="field-group">
                <span className="field-label">Current leaning</span>
                <div className="input-shell">
                  <input
                    type="text"
                    value={currentLeaning}
                    onChange={(event) => setCurrentLeaning(event.target.value)}
                    placeholder="Leaning toward the studio path"
                    className="field-input"
                  />
                </div>
              </label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="field-label">Options</p>
                  <p className="text-sm text-slate-400">Start with 2 to 5 concrete paths.</p>
                </div>
                <button
                  type="button"
                  onClick={addOption}
                  disabled={options.length >= 5}
                  className="ghost-button"
                >
                  <Plus size={16} />
                  Add option
                </button>
              </div>

              <div className="grid gap-4">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] border border-white/10 bg-white/5 text-slate-300">
                      {index + 1}
                    </div>
                    <div className="input-shell">
                      <input
                        type="text"
                        value={option}
                        onChange={(event) => updateOption(index, event.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="field-input"
                        required={index < 2}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      disabled={options.length <= 2}
                      className="ghost-button shrink-0"
                    >
                      <Minus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={submitting} className="action-button">
              {submitting ? "Building workspace..." : "Create scenario"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
