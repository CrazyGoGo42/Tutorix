let selectedContext = [];

function setContext(context) {
  if (!selectedContext.includes(context)) {
    selectedContext.push(context);
  } else {
    selectedContext = selectedContext.filter(c => c !== context);
  }
  console.log("Selected context:", selectedContext);
}

async function sendPrompt() {
  const question = document.getElementById("question").value;
  const givenAnswer = document.getElementById("givenAnswer").value;
  const correctAnswer = document.getElementById("correctAnswer").value;
  const topic = document.getElementById("topic")?.value || "";
  const failCount = parseInt(document.getElementById("failCount")?.value || "0", 10);
  const difficulty = document.getElementById("difficulty")?.value || "medium";
  const teacherType = document.getElementById("teacherType").value;
  const teacherMood = document.getElementById("teacherMood").value;

  const payload = {
    question,
    givenAnswer,
    correctAnswer,
    topic,
    context: selectedContext,
    failCount,
    difficulty,
    teacherType,
    teacherMood
  };

  document.getElementById("output").textContent = "Generating AI response...";

  try {
    const res = await fetch("/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    document.getElementById("output").textContent = data.output;
  } catch (err) {
    console.error("Error sending prompt:", err);
    document.getElementById("output").textContent = "Error sending prompt to AI.";
  }
}
