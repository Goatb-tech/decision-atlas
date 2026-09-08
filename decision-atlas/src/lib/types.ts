export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type ReflectionEntry = {
  id: string;
  scenarioId: string;
  body: string;
  learned: string;
  leaning: string;
  createdAt: string;
};

export type SnapshotScore = {
  id: string;
  snapshotId: string;
  optionId: string | null;
  optionLabel: string;
  thesis: string;
  upside: string;
  downside: string;
  reversibility: string;
  timeToResults: string;
  effortCost: string;
  confidence: number;
  position: number;
};

export type ScenarioSnapshot = {
  id: string;
  scenarioId: string;
  summary: string;
  createdAt: string;
  averageConfidence: number;
  scores: SnapshotScore[];
};

export type ScenarioOption = {
  id: string;
  scenarioId: string;
  label: string;
  thesis: string;
  upside: string;
  downside: string;
  reversibility: string;
  timeToResults: string;
  effortCost: string;
  confidence: number;
  position: number;
  updatedAt: string;
};

export type ScenarioSummary = {
  id: string;
  title: string;
  prompt: string;
  horizon: string;
  status: string;
  currentLeaning: string;
  createdAt: string;
  updatedAt: string;
  optionCount: number;
  averageConfidence: number;
  latestReflection: ReflectionEntry | null;
  latestSnapshot: ScenarioSnapshot | null;
};

export type Scenario = {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  horizon: string;
  status: string;
  currentLeaning: string;
  createdAt: string;
  updatedAt: string;
  averageConfidence: number;
  options: ScenarioOption[];
  reflections: ReflectionEntry[];
  snapshots: ScenarioSnapshot[];
};

export type DashboardSummary = {
  totalScenarios: number;
  activeScenarios: number;
  totalSnapshots: number;
  averageConfidence: number;
};

export type ConfidenceTrendPoint = {
  label: string;
  value: number;
  createdAt: string;
};

export type LatestReflection = ReflectionEntry & {
  scenarioTitle: string;
};

export type BootstrapPayload = {
  scenarios: ScenarioSummary[];
  summary: DashboardSummary;
  latestReflection: LatestReflection | null;
  confidenceTrend: ConfidenceTrendPoint[];
};
