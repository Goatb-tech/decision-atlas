import cors from "cors";
import express from "express";
import {
  createReflection,
  createScenario,
  createScenarioOption,
  createSnapshot,
  getBootstrap,
  getScenarioById,
  getUserById,
  loginUser,
  registerUser,
  updateScenario,
  updateScenarioOption,
} from "./repository";

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: "2mb" }));

function ensureNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function badRequest(res: express.Response, message: string) {
  return res.status(400).json({ error: message });
}

function notFound(res: express.Response, message: string) {
  return res.status(404).json({ error: message });
}

function getUserOrThrow(userId: string) {
  const user = getUserById(userId);
  if (!user) {
    const error = new Error("User not found");
    (error as Error & { status?: number }).status = 404;
    throw error;
  }

  return user;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "decision-atlas-api" });
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (!ensureNonEmptyString(name) || !ensureNonEmptyString(email) || !ensureNonEmptyString(password)) {
      return badRequest(res, "Name, email, and password are required.");
    }

    if (password.trim().length < 6) {
      return badRequest(res, "Password must be at least 6 characters.");
    }

    const user = await registerUser({ name, email, password });
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (!ensureNonEmptyString(email) || !ensureNonEmptyString(password)) {
      return badRequest(res, "Email and password are required.");
    }

    const user = await loginUser({ email, password });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

app.get("/api/users/:userId/bootstrap", (req, res, next) => {
  try {
    getUserOrThrow(req.params.userId);
    res.json(getBootstrap(req.params.userId));
  } catch (error) {
    next(error);
  }
});

app.post("/api/scenarios", (req, res, next) => {
  try {
    const { userId, title, prompt = "", horizon = "", currentLeaning = "", initialOptions = [] } = req.body ?? {};
    if (!ensureNonEmptyString(userId) || !ensureNonEmptyString(title)) {
      return badRequest(res, "userId and title are required.");
    }

    getUserOrThrow(userId);

    const optionLabels = Array.isArray(initialOptions)
      ? initialOptions.filter((option) => ensureNonEmptyString(option?.label))
      : [];

    if (optionLabels.length < 2) {
      return badRequest(res, "At least two initial options are required.");
    }

    const scenario = createScenario({
      userId,
      title,
      prompt,
      horizon,
      currentLeaning,
      initialOptions: optionLabels,
    });

    res.status(201).json({ scenario });
  } catch (error) {
    next(error);
  }
});

app.get("/api/scenarios/:scenarioId", (req, res, next) => {
  try {
    const userId = typeof req.query.userId === "string" ? req.query.userId : "";
    if (!ensureNonEmptyString(userId)) {
      return badRequest(res, "userId is required.");
    }

    const scenario = getScenarioById(req.params.scenarioId, userId);
    if (!scenario) {
      return notFound(res, "Scenario not found.");
    }

    res.json({ scenario });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/scenarios/:scenarioId", (req, res, next) => {
  try {
    const { userId, title, prompt, horizon, status, currentLeaning } = req.body ?? {};
    if (!ensureNonEmptyString(userId)) {
      return badRequest(res, "userId is required.");
    }

    const scenario = updateScenario(req.params.scenarioId, userId, {
      title,
      prompt,
      horizon,
      status,
      currentLeaning,
    });

    if (!scenario) {
      return notFound(res, "Scenario not found.");
    }

    res.json({ scenario });
  } catch (error) {
    next(error);
  }
});

app.post("/api/scenarios/:scenarioId/options", (req, res, next) => {
  try {
    const { userId, label } = req.body ?? {};
    if (!ensureNonEmptyString(userId) || !ensureNonEmptyString(label)) {
      return badRequest(res, "userId and label are required.");
    }

    const scenario = createScenarioOption({
      scenarioId: req.params.scenarioId,
      userId,
      label,
    });

    if (!scenario) {
      return notFound(res, "Scenario not found.");
    }

    res.status(201).json({ scenario });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/options/:optionId", (req, res, next) => {
  try {
    const { userId, label, thesis, upside, downside, reversibility, timeToResults, effortCost, confidence } =
      req.body ?? {};
    if (!ensureNonEmptyString(userId)) {
      return badRequest(res, "userId is required.");
    }

    const scenario = updateScenarioOption(req.params.optionId, userId, {
      label,
      thesis,
      upside,
      downside,
      reversibility,
      timeToResults,
      effortCost,
      confidence: typeof confidence === "number" ? confidence : undefined,
    });

    if (!scenario) {
      return notFound(res, "Option not found.");
    }

    res.json({ scenario });
  } catch (error) {
    next(error);
  }
});

app.post("/api/scenarios/:scenarioId/snapshots", (req, res, next) => {
  try {
    const { userId, summary = "" } = req.body ?? {};
    if (!ensureNonEmptyString(userId)) {
      return badRequest(res, "userId is required.");
    }

    const scenario = createSnapshot({
      scenarioId: req.params.scenarioId,
      userId,
      summary,
    });

    if (!scenario) {
      return notFound(res, "Scenario not found.");
    }

    res.status(201).json({ scenario });
  } catch (error) {
    next(error);
  }
});

app.post("/api/scenarios/:scenarioId/reflections", (req, res, next) => {
  try {
    const { userId, body, learned = "", leaning = "" } = req.body ?? {};
    if (!ensureNonEmptyString(userId) || !ensureNonEmptyString(body)) {
      return badRequest(res, "userId and body are required.");
    }

    const scenario = createReflection({
      scenarioId: req.params.scenarioId,
      userId,
      body,
      learned,
      leaning,
    });

    if (!scenario) {
      return notFound(res, "Scenario not found.");
    }

    res.status(201).json({ scenario });
  } catch (error) {
    next(error);
  }
});

app.use((error: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = error.status ?? 500;
  const message = error.message || "Unexpected server error";
  res.status(status).json({ error: message });
});

app.listen(port, () => {
  console.log(`Decision Atlas API listening on http://localhost:${port}`);
});
