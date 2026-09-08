import type { BootstrapPayload, Scenario, User } from "./types";

const API_BASE = "/api";

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return null as T;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data as T;
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return request<{ user: User }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: { email: string; password: string }) {
  return request<{ user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchBootstrap(userId: string) {
  return request<BootstrapPayload>(`/users/${userId}/bootstrap`);
}

export async function createScenario(payload: {
  userId: string;
  title: string;
  prompt: string;
  horizon: string;
  currentLeaning: string;
  initialOptions: Array<{ label: string }>;
}) {
  return request<{ scenario: Scenario }>("/scenarios", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchScenario(scenarioId: string, userId: string) {
  return request<{ scenario: Scenario }>(
    `/scenarios/${scenarioId}?userId=${encodeURIComponent(userId)}`,
  );
}

export async function updateScenario(payload: {
  scenarioId: string;
  userId: string;
  title: string;
  prompt: string;
  horizon: string;
  status: string;
  currentLeaning: string;
}) {
  return request<{ scenario: Scenario }>(`/scenarios/${payload.scenarioId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function createScenarioOption(payload: {
  scenarioId: string;
  userId: string;
  label: string;
}) {
  return request<{ scenario: Scenario }>(`/scenarios/${payload.scenarioId}/options`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateScenarioOption(payload: {
  optionId: string;
  userId: string;
  label: string;
  thesis: string;
  upside: string;
  downside: string;
  reversibility: string;
  timeToResults: string;
  effortCost: string;
  confidence: number;
}) {
  return request<{ scenario: Scenario }>(`/options/${payload.optionId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function createSnapshot(payload: {
  scenarioId: string;
  userId: string;
  summary: string;
}) {
  return request<{ scenario: Scenario }>(`/scenarios/${payload.scenarioId}/snapshots`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createReflection(payload: {
  scenarioId: string;
  userId: string;
  body: string;
  learned: string;
  leaning: string;
}) {
  return request<{ scenario: Scenario }>(`/scenarios/${payload.scenarioId}/reflections`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
