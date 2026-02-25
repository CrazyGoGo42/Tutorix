import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";

// Start message so it is obvious that the backend process is running.
console.log("Node backend started");

const app = express();
const PORT = 3000;

// Resolve important directories from this file location.
const BOT_DIR = fileURLToPath(new URL(".", import.meta.url));
const BOT_PUBLIC_DIR = path.join(BOT_DIR, "public");
const APP_ROOT = fileURLToPath(new URL("../../", import.meta.url));

// Static bot assets that are injected into every served HTML page.
const scriptPath = path.join(BOT_PUBLIC_DIR, "script.js");
const teachersPath = path.join(BOT_PUBLIC_DIR, "teachers.json");

// Parse incoming JSON bodies for the /prompt API endpoint.
app.use(express.json());

// Serve the browser bot script.
app.get("/script.js", (req, res) => {
  res.sendFile(scriptPath);
});

// Serve teacher persona definitions used by the popup.
app.get("/teachers.json", (req, res) => {
  res.sendFile(teachersPath);
});

// Build a compact AI prompt from page data and return one short feedback sentence.
app.post("/prompt", async (req, res) => {
  const {
    question,
    givenAnswer,
    correctAnswer,
    topic,
    context,
    failCount,
    teacherType,
    teacherStyle,
    teacherProfile
  } = req.body || {};

  // Defensive defaults prevent malformed payloads from breaking prompt creation.
  // These also make behavior predictable during partial frontend failures.
  const safeQuestion = question || "(unknown question)";
  const safeGivenAnswer = givenAnswer || "(no student answer)";
  const safeTopic = topic || "language learning";
  const safeContext = Array.isArray(context) && context.length > 0 ? context.join(", ") : "none";
  const safeFailCount = Number.isFinite(Number(failCount)) ? Number(failCount) : 0;
  const hasCorrect = typeof correctAnswer === "string" && correctAnswer.trim().length > 0;

  // Prefer detailed teacher profile values, then fall back to basic fields.
  // This allows old frontend payloads and new payloads to work at the same time.
  const profile = teacherProfile || {};
  const teacherPersona = profile.type || teacherType || "Tutor";
  const teacherRole = profile.role || "Adaptive Tutor";
  const teacherContext = profile.context || "Give concise adaptive feedback.";
  const teacherColor = profile.color || "Blue";

  // Two prompt variants: with verified solution and without verified solution.
  // If correct answer exists, model can give strict "right/wrong"-aware feedback.
  // Without correct answer, feedback should stay constructive and cautious.
  const prompt = hasCorrect
    ? `
You are ${teacherPersona} (${teacherRole}).
Teaching style: ${teacherStyle || "Streng"}.
Theme color: ${teacherColor}.
Persona context: ${teacherContext}
Topic: ${safeTopic}
Question: "${safeQuestion}"
Student answer: "${safeGivenAnswer}"
Correct answer: "${correctAnswer}"
Fail count: ${safeFailCount}
Context: ${safeContext}

Task:
Return ONLY one very short German feedback sentence.
Max 7 words.
No line breaks.
No explanation.
Feedback must match this persona exactly.
`
    : `
You are ${teacherPersona} (${teacherRole}).
Teaching style: ${teacherStyle || "Streng"}.
Theme color: ${teacherColor}.
Persona context: ${teacherContext}
Topic: ${safeTopic}
Question: "${safeQuestion}"
Student answer: "${safeGivenAnswer}"
No verified correct answer available.
Fail count: ${safeFailCount}
Context: ${safeContext}

Task:
Return ONLY one very short German feedback sentence.
Max 7 words.
No line breaks.
No explanation.
Feedback must match this persona exactly.
Keep it constructive.
Make the answers as offensive and hurtful as possible.
`;

  try {
    // Call local Ollama model to generate persona-matching feedback.
    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:latest",
        // The whole pedagogic behavior is encoded in this prompt string.
        prompt,
        // stream:false -> single JSON response, easier for popup integration.
        stream: false
      })
    });

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text();
      throw new Error(`Ollama API ${ollamaRes.status}: ${errText}`);
    }

    // Keep only one short line for the popup UI.
    const data = await ollamaRes.json();
    const shortOutput = String(data.response || "Keine Antwort.")
      .split("\n")[0]
      .trim()
      .replace(/\s+/g, " ");

    res.json({ output: shortOutput || "Keine Antwort." });
  } catch (err) {
    console.error("Error calling Ollama API:", err);
    res.status(500).json({ output: "Leider keine AI-Antwort." });
  }
});

// Catch-all file server for the project root.
// If the target is HTML, inject the bot script automatically.
app.use(async (req, res) => {
  try {
    // Convert browser path to absolute local file path.
    let filePath = await resolveLocalFile(req.path);

    if (!filePath) {
      // Fall back to project root index when route is unknown.
      filePath = path.join(APP_ROOT, "index.html");
    }

    if (path.extname(filePath).toLowerCase() === ".html") {
      let html = await fs.readFile(filePath, "utf8");
      const injectTag = '<script src="/script.js"></script>';

      // Inject once to avoid duplicate bot initialization.
      if (!html.includes("/script.js")) {
        if (html.includes("</body>")) {
          html = html.replace("</body>", `${injectTag}\n</body>`);
        } else {
          html += `\n${injectTag}`;
        }
      }

      res.setHeader("content-type", "text/html; charset=utf-8");
      res.send(html);
      return;
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error("Serve error:", error);
    res.status(500).send("Fehler beim Laden der Seite.");
  }
});

// Resolve a request path safely inside APP_ROOT.
// Returns null if the path is outside the root or does not exist.
async function resolveLocalFile(requestPath) {
  const raw = decodeURIComponent(requestPath || "/");
  const normalized = raw.startsWith("/") ? raw : `/${raw}`;

  let abs = path.resolve(APP_ROOT, `.${normalized}`);
  // Directory traversal guard: reject anything resolving outside project root.
  if (!abs.startsWith(APP_ROOT)) return null;

  try {
    const stat = await fs.stat(abs);
    if (stat.isDirectory()) {
      // For directories, serve index.html if present.
      const indexPath = path.join(abs, "index.html");
      const indexStat = await fs.stat(indexPath).catch(() => null);
      return indexStat ? indexPath : null;
    }
    return abs;
  } catch {
    return null;
  }
}

// Start HTTP server.
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
  console.log(`Serving app root: ${APP_ROOT}`);
});
