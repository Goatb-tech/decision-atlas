import { createContext, startTransition, useContext, useEffect, useState } from "react";
import { createScenario, fetchBootstrap } from "../lib/api";
import { useAuth } from "./AuthContext";
import type { BootstrapPayload, Scenario } from "../lib/types";

type AtlasValue = BootstrapPayload & {
  loading: boolean;
  syncing: boolean;
  error: string;
  hydrate: () => Promise<void>;
  createScenarioAndRefresh: (payload: {
    title: string;
    prompt: string;
    horizon: string;
    currentLeaning: string;
    initialOptions: Array<{ label: string }>;
  }) => Promise<Scenario>;
};

const emptyBootstrap: BootstrapPayload = {
  scenarios: [],
  summary: {
    totalScenarios: 0,
    activeScenarios: 0,
    totalSnapshots: 0,
    averageConfidence: 0,
  },
  latestReflection: null,
  confidenceTrend: [],
};

const AtlasContext = createContext<AtlasValue | null>(null);

export function AtlasProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [bootstrap, setBootstrap] = useState<BootstrapPayload>(emptyBootstrap);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  async function hydrate() {
    if (!user) {
      startTransition(() => {
        setBootstrap(emptyBootstrap);
        setError("");
      });
      return;
    }

    setSyncing(true);
    try {
      const response = await fetchBootstrap(user.id);
      startTransition(() => {
        setBootstrap(response);
        setError("");
      });
    } catch (nextError) {
      startTransition(() => {
        setError(nextError instanceof Error ? nextError.message : "Unable to refresh dashboard.");
      });
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }

  useEffect(() => {
    if (!user) {
      setBootstrap(emptyBootstrap);
      setLoading(false);
      setSyncing(false);
      setError("");
      return;
    }

    setLoading(true);
    void hydrate();
  }, [user]);

  async function createScenarioAndRefresh(payload: {
    title: string;
    prompt: string;
    horizon: string;
    currentLeaning: string;
    initialOptions: Array<{ label: string }>;
  }) {
    if (!user) {
      throw new Error("You must be signed in to create a scenario.");
    }

    const { scenario } = await createScenario({
      userId: user.id,
      ...payload,
    });

    void hydrate();
    return scenario;
  }

  return (
    <AtlasContext.Provider
      value={{
        ...bootstrap,
        loading,
        syncing,
        error,
        hydrate,
        createScenarioAndRefresh,
      }}
    >
      {children}
    </AtlasContext.Provider>
  );
}

export function useAtlas() {
  const context = useContext(AtlasContext);
  if (!context) {
    throw new Error("useAtlas must be used within an AtlasProvider");
  }

  return context;
}
