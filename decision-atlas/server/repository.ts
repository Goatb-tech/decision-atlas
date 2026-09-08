import bcrypt from "bcryptjs";
import { createId, db, now } from "./db";

type UserRow = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

type ScenarioRow = {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  horizon: string;
  status: string;
  current_leaning: string;
  created_at: string;
  updated_at: string;
};

type OptionRow = {
  id: string;
  scenario_id: string;
  label: string;
  thesis: string;
  upside: string;
  downside: string;
  reversibility: string;
  time_to_results: string;
  effort_cost: string;
  confidence: number;
  position: number;
  updated_at: string;
};

type ReflectionRow = {
  id: string;
  scenario_id: string;
  body: string;
  learned: string;
  leaning: string;
  created_at: string;
};

type SnapshotRow = {
  id: string;
  scenario_id: string;
  summary: string;
  created_at: string;
};

type SnapshotScoreRow = {
  id: string;
  snapshot_id: string;
  option_id: string | null;
  option_label: string;
  thesis: string;
  upside: string;
  downside: string;
  reversibility: string;
  time_to_results: string;
  effort_cost: string;
  confidence: number;
  position: number;
};

function mapUser(row: UserRow | undefined | null) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
  };
}

function mapOption(row: OptionRow) {
  return {
    id: row.id,
    scenarioId: row.scenario_id,
    label: row.label,
    thesis: row.thesis,
    upside: row.upside,
    downside: row.downside,
    reversibility: row.reversibility,
    timeToResults: row.time_to_results,
    effortCost: row.effort_cost,
    confidence: row.confidence,
    position: row.position,
    updatedAt: row.updated_at,
  };
}

function mapReflection(row: ReflectionRow) {
  return {
    id: row.id,
    scenarioId: row.scenario_id,
    body: row.body,
    learned: row.learned,
    leaning: row.leaning,
    createdAt: row.created_at,
  };
}

function mapSnapshotScore(row: SnapshotScoreRow) {
  return {
    id: row.id,
    snapshotId: row.snapshot_id,
    optionId: row.option_id,
    optionLabel: row.option_label,
    thesis: row.thesis,
    upside: row.upside,
    downside: row.downside,
    reversibility: row.reversibility,
    timeToResults: row.time_to_results,
    effortCost: row.effort_cost,
    confidence: row.confidence,
    position: row.position,
  };
}

function averageConfidence(optionRows: OptionRow[]) {
  if (optionRows.length === 0) {
    return 0;
  }

  return Math.round(
    optionRows.reduce((total, option) => total + option.confidence, 0) / optionRows.length,
  );
}

function touchScenario(scenarioId: string) {
  db.prepare("UPDATE scenarios SET updated_at = ? WHERE id = ?").run(now(), scenarioId);
}

function getScenarioRowById(scenarioId: string, userId: string) {
  return db
    .prepare(
      "SELECT * FROM scenarios WHERE id = ? AND user_id = ?",
    )
    .get(scenarioId, userId) as ScenarioRow | undefined;
}

function getOptionRowsForScenario(scenarioId: string) {
  return db
    .prepare("SELECT * FROM scenario_options WHERE scenario_id = ? ORDER BY position ASC, updated_at DESC")
    .all(scenarioId) as OptionRow[];
}

function getReflectionRowsForScenario(scenarioId: string) {
  return db
    .prepare("SELECT * FROM reflection_entries WHERE scenario_id = ? ORDER BY datetime(created_at) DESC")
    .all(scenarioId) as ReflectionRow[];
}

function getSnapshotRowsForScenario(scenarioId: string) {
  return db
    .prepare("SELECT * FROM scenario_snapshots WHERE scenario_id = ? ORDER BY datetime(created_at) DESC")
    .all(scenarioId) as SnapshotRow[];
}

function getScoresForSnapshot(snapshotId: string) {
  return db
    .prepare("SELECT * FROM snapshot_scores WHERE snapshot_id = ? ORDER BY position ASC")
    .all(snapshotId) as SnapshotScoreRow[];
}

function mapSnapshot(row: SnapshotRow) {
  const scores = getScoresForSnapshot(row.id).map(mapSnapshotScore);
  const average =
    scores.length > 0
      ? Math.round(scores.reduce((total, score) => total + score.confidence, 0) / scores.length)
      : 0;

  return {
    id: row.id,
    scenarioId: row.scenario_id,
    summary: row.summary,
    createdAt: row.created_at,
    averageConfidence: average,
    scores,
  };
}

function mapScenario(row: ScenarioRow) {
  const optionRows = getOptionRowsForScenario(row.id);
  const reflectionRows = getReflectionRowsForScenario(row.id);
  const snapshotRows = getSnapshotRowsForScenario(row.id);

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    prompt: row.prompt,
    horizon: row.horizon,
    status: row.status,
    currentLeaning: row.current_leaning,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    averageConfidence: averageConfidence(optionRows),
    options: optionRows.map(mapOption),
    reflections: reflectionRows.map(mapReflection),
    snapshots: snapshotRows.map(mapSnapshot),
  };
}

function mapScenarioSummary(row: ScenarioRow) {
  const optionRows = getOptionRowsForScenario(row.id);
  const latestReflection = db
    .prepare(
      "SELECT * FROM reflection_entries WHERE scenario_id = ? ORDER BY datetime(created_at) DESC LIMIT 1",
    )
    .get(row.id) as ReflectionRow | undefined;
  const latestSnapshot = db
    .prepare(
      "SELECT * FROM scenario_snapshots WHERE scenario_id = ? ORDER BY datetime(created_at) DESC LIMIT 1",
    )
    .get(row.id) as SnapshotRow | undefined;

  return {
    id: row.id,
    title: row.title,
    prompt: row.prompt,
    horizon: row.horizon,
    status: row.status,
    currentLeaning: row.current_leaning,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    optionCount: optionRows.length,
    averageConfidence: averageConfidence(optionRows),
    latestReflection: latestReflection ? mapReflection(latestReflection) : null,
    latestSnapshot: latestSnapshot ? mapSnapshot(latestSnapshot) : null,
  };
}

function listScenarioRows(userId: string) {
  return db
    .prepare("SELECT * FROM scenarios WHERE user_id = ? ORDER BY datetime(updated_at) DESC")
    .all(userId) as ScenarioRow[];
}

export function getUserById(userId: string) {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as UserRow | undefined;
  return mapUser(row);
}

export async function registerUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail);

  if (existing) {
    throw new Error("Email already registered");
  }

  const id = createId();
  const createdAt = now();
  const passwordHash = await bcrypt.hash(password, 10);

  db.prepare(
    "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(id, name.trim(), normalizedEmail, passwordHash, createdAt);

  return getUserById(id);
}

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail) as
    | (UserRow & { password_hash: string })
    | undefined;

  if (!row) {
    throw new Error("Invalid email or password");
  }

  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) {
    throw new Error("Invalid email or password");
  }

  return mapUser(row);
}

export function getBootstrap(userId: string) {
  const scenarioRows = listScenarioRows(userId);
  const scenarioSummaries = scenarioRows.slice(0, 6).map(mapScenarioSummary);
  const totalSnapshots = db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM scenario_snapshots ss
       JOIN scenarios s ON s.id = ss.scenario_id
       WHERE s.user_id = ?`,
    )
    .get(userId) as { count: number };

  const allOptionRows = db
    .prepare(
      `SELECT so.* FROM scenario_options so
       JOIN scenarios s ON s.id = so.scenario_id
       WHERE s.user_id = ?`,
    )
    .all(userId) as OptionRow[];

  const latestReflectionRow = db
    .prepare(
      `SELECT r.*, s.title AS scenario_title
       FROM reflection_entries r
       JOIN scenarios s ON s.id = r.scenario_id
       WHERE s.user_id = ?
       ORDER BY datetime(r.created_at) DESC
       LIMIT 1`,
    )
    .get(userId) as (ReflectionRow & { scenario_title: string }) | undefined;

  const snapshotRows = db
    .prepare(
      `SELECT ss.*, s.title AS scenario_title
       FROM scenario_snapshots ss
       JOIN scenarios s ON s.id = ss.scenario_id
       WHERE s.user_id = ?
       ORDER BY datetime(ss.created_at) DESC
       LIMIT 6`,
    )
    .all(userId) as (SnapshotRow & { scenario_title: string })[];

  const confidenceTrend =
    snapshotRows.length > 0
      ? snapshotRows
          .map((row) => {
            const scores = getScoresForSnapshot(row.id);
            const average =
              scores.length > 0
                ? Math.round(scores.reduce((total, score) => total + score.confidence, 0) / scores.length)
                : 0;

            return {
              label: row.scenario_title,
              value: average,
              createdAt: row.created_at,
            };
          })
          .reverse()
      : scenarioSummaries
          .slice()
          .reverse()
          .map((scenario) => ({
            label: scenario.title,
            value: scenario.averageConfidence,
            createdAt: scenario.updatedAt,
          }));

  return {
    scenarios: scenarioSummaries,
    summary: {
      totalScenarios: scenarioRows.length,
      activeScenarios: scenarioRows.filter((scenario) => scenario.status === "active").length,
      totalSnapshots: totalSnapshots.count,
      averageConfidence: averageConfidence(allOptionRows),
    },
    latestReflection: latestReflectionRow
      ? {
          ...mapReflection(latestReflectionRow),
          scenarioTitle: latestReflectionRow.scenario_title,
        }
      : null,
    confidenceTrend,
  };
}

export function createScenario({
  userId,
  title,
  prompt = "",
  horizon = "",
  currentLeaning = "",
  initialOptions = [],
}: {
  userId: string;
  title: string;
  prompt?: string;
  horizon?: string;
  currentLeaning?: string;
  initialOptions?: Array<{ label: string }>;
}) {
  const scenarioId = createId();
  const timestamp = now();

  const normalizedOptions = initialOptions
    .map((option) => option.label.trim())
    .filter(Boolean)
    .slice(0, 5);

  const transaction = db.transaction(() => {
    db.prepare(
      `INSERT INTO scenarios (
        id, user_id, title, prompt, horizon, status, current_leaning, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?)`,
    ).run(
      scenarioId,
      userId,
      title.trim(),
      prompt.trim(),
      horizon.trim(),
      currentLeaning.trim(),
      timestamp,
      timestamp,
    );

    const insertOption = db.prepare(
      `INSERT INTO scenario_options (
        id, scenario_id, label, thesis, upside, downside, reversibility, time_to_results, effort_cost, confidence, position, updated_at
      ) VALUES (?, ?, ?, '', '', '', '', '', '', 50, ?, ?)`,
    );

    normalizedOptions.forEach((label, index) => {
        insertOption.run(createId(), scenarioId, label, index, timestamp);
      });
  });

  transaction();

  return getScenarioById(scenarioId, userId);
}

export function getScenarioById(scenarioId: string, userId: string) {
  const row = getScenarioRowById(scenarioId, userId);
  return row ? mapScenario(row) : null;
}

export function updateScenario(
  scenarioId: string,
  userId: string,
  updates: Partial<{
    title: string;
    prompt: string;
    horizon: string;
    status: string;
    currentLeaning: string;
  }>,
) {
  const current = getScenarioRowById(scenarioId, userId);
  if (!current) {
    return null;
  }

  const next = {
    title: updates.title?.trim() ?? current.title,
    prompt: updates.prompt?.trim() ?? current.prompt,
    horizon: updates.horizon?.trim() ?? current.horizon,
    status: updates.status?.trim() ?? current.status,
    currentLeaning: updates.currentLeaning?.trim() ?? current.current_leaning,
    updatedAt: now(),
  };

  db.prepare(
    `UPDATE scenarios
     SET title = ?, prompt = ?, horizon = ?, status = ?, current_leaning = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`,
  ).run(
    next.title,
    next.prompt,
    next.horizon,
    next.status,
    next.currentLeaning,
    next.updatedAt,
    scenarioId,
    userId,
  );

  return getScenarioById(scenarioId, userId);
}

export function createScenarioOption({
  scenarioId,
  userId,
  label,
}: {
  scenarioId: string;
  userId: string;
  label: string;
}) {
  const scenario = getScenarioRowById(scenarioId, userId);
  if (!scenario) {
    return null;
  }

  const optionCount = db
    .prepare("SELECT COUNT(*) AS count FROM scenario_options WHERE scenario_id = ?")
    .get(scenarioId) as { count: number };

  if (optionCount.count >= 5) {
    throw new Error("A scenario can only contain up to 5 options.");
  }

  const optionId = createId();
  const timestamp = now();

  db.prepare(
    `INSERT INTO scenario_options (
      id, scenario_id, label, thesis, upside, downside, reversibility, time_to_results, effort_cost, confidence, position, updated_at
    ) VALUES (?, ?, ?, '', '', '', '', '', '', 50, ?, ?)`,
  ).run(optionId, scenarioId, label.trim(), optionCount.count, timestamp);

  touchScenario(scenarioId);

  return getScenarioById(scenarioId, userId);
}

export function updateScenarioOption(
  optionId: string,
  userId: string,
  updates: Partial<{
    label: string;
    thesis: string;
    upside: string;
    downside: string;
    reversibility: string;
    timeToResults: string;
    effortCost: string;
    confidence: number;
  }>,
) {
  const current = db
    .prepare(
      `SELECT so.*, s.user_id
       FROM scenario_options so
       JOIN scenarios s ON s.id = so.scenario_id
       WHERE so.id = ? AND s.user_id = ?`,
    )
    .get(optionId, userId) as (OptionRow & { user_id: string }) | undefined;

  if (!current) {
    return null;
  }

  const next = {
    label: updates.label?.trim() ?? current.label,
    thesis: updates.thesis?.trim() ?? current.thesis,
    upside: updates.upside?.trim() ?? current.upside,
    downside: updates.downside?.trim() ?? current.downside,
    reversibility: updates.reversibility?.trim() ?? current.reversibility,
    timeToResults: updates.timeToResults?.trim() ?? current.time_to_results,
    effortCost: updates.effortCost?.trim() ?? current.effort_cost,
    confidence:
      typeof updates.confidence === "number"
        ? Math.max(0, Math.min(100, Math.round(updates.confidence)))
        : current.confidence,
    updatedAt: now(),
  };

  db.prepare(
    `UPDATE scenario_options
     SET label = ?, thesis = ?, upside = ?, downside = ?, reversibility = ?, time_to_results = ?, effort_cost = ?, confidence = ?, updated_at = ?
     WHERE id = ?`,
  ).run(
    next.label,
    next.thesis,
    next.upside,
    next.downside,
    next.reversibility,
    next.timeToResults,
    next.effortCost,
    next.confidence,
    next.updatedAt,
    optionId,
  );

  touchScenario(current.scenario_id);

  return getScenarioById(current.scenario_id, userId);
}

export function createSnapshot({
  scenarioId,
  userId,
  summary = "",
}: {
  scenarioId: string;
  userId: string;
  summary?: string;
}) {
  const scenario = getScenarioRowById(scenarioId, userId);
  if (!scenario) {
    return null;
  }

  const optionRows = getOptionRowsForScenario(scenarioId);
  const snapshotId = createId();
  const timestamp = now();

  const transaction = db.transaction(() => {
    db.prepare(
      "INSERT INTO scenario_snapshots (id, scenario_id, summary, created_at) VALUES (?, ?, ?, ?)",
    ).run(
      snapshotId,
      scenarioId,
      summary.trim() || `Checkpoint for ${scenario.title}`,
      timestamp,
    );

    const insertScore = db.prepare(
      `INSERT INTO snapshot_scores (
        id, snapshot_id, option_id, option_label, thesis, upside, downside, reversibility, time_to_results, effort_cost, confidence, position
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    optionRows.forEach((option) => {
      insertScore.run(
        createId(),
        snapshotId,
        option.id,
        option.label,
        option.thesis,
        option.upside,
        option.downside,
        option.reversibility,
        option.time_to_results,
        option.effort_cost,
        option.confidence,
        option.position,
      );
    });
  });

  transaction();
  touchScenario(scenarioId);

  return getScenarioById(scenarioId, userId);
}

export function createReflection({
  scenarioId,
  userId,
  body,
  learned = "",
  leaning = "",
}: {
  scenarioId: string;
  userId: string;
  body: string;
  learned?: string;
  leaning?: string;
}) {
  const scenario = getScenarioRowById(scenarioId, userId);
  if (!scenario) {
    return null;
  }

  db.prepare(
    `INSERT INTO reflection_entries (id, scenario_id, body, learned, leaning, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(createId(), scenarioId, body.trim(), learned.trim(), leaning.trim(), now());

  if (leaning.trim()) {
    db.prepare("UPDATE scenarios SET current_leaning = ?, updated_at = ? WHERE id = ?").run(
      leaning.trim(),
      now(),
      scenarioId,
    );
  } else {
    touchScenario(scenarioId);
  }

  return getScenarioById(scenarioId, userId);
}
