import express from "express";

console.log("Node backend started");

const app = express();

app.use(express.json());
app.use(express.static("public"));

// POST endpoint for AI prompts
app.post("/prompt", async (req, res) => {
  const {
    question,
    givenAnswer,
    correctAnswer,
    topic,
    context,
    failCount,
    teacherType,
    teacherMood
  } = req.body;

  // Short, 2-3 word hint prompt
  const prompt = `
You are a ${teacherMood || "friendly"} ${teacherType || "teacher"}.
The student answered "${givenAnswer}" for "${question}"${topic ? ` (topic: ${topic})` : ""}.
Correct answer: "${correctAnswer}".
Student has failed ${failCount || 0} times.
Context: ${context?.join(", ") || "none"}.
Give a short hint (2–3 words) that helps student improve.
`;

  try {
    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:latest",
        prompt,
        stream: false
      })
    });

    const data = await ollamaRes.json();
    res.json({ output: data.response });
  } catch (err) {
    console.error("Error calling Ollama API:", err);
    res.status(500).json({ output: "Error generating AI response" });
  }
});

app.listen(3000, () => {
  console.log("Server running: http://localhost:3000");
});
