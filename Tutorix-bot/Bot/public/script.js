(function () {
  // Storage keys and defaults for user preferences.
  let SETTINGS_KEY = "tutorix_bot_settings_v4";
  let FAILS_KEY = "tutorix_bot_fails_v4";
  let defaults = {
    teacherId: "Spock",
    teacherStyle: "Streng",
    autoDetect: true
  };

  let settings = loadStore(SETTINGS_KEY, defaults);
  let fails = loadStore(FAILS_KEY, {});
  let teachers = [];
  let activeTeacher = null;
  let botBaseUrl = window.location.origin;
  let avatarAnimId = null;

  // Bootstrap: inject styles, build UI, then load teacher profiles.
  // Order matters:
  // 1) styles first (so popup is not unstyled),
  // 2) UI second (so we can write status text),
  // 3) data load third (so dropdown has teacher options).
  injectStyles();
  let ui = createPopup();
  setText("Bot startet...");

  loadTeachers()
    .then(function () {
      bindEvents();
      setText("Bot aktiv. Ich warte auf den Seiten-Button.");
    })
    .catch(function () {
      teachers = [fallbackTeacher()];
      applyTeacherFromSettings();
      bindEvents();
      setText("Bot aktiv (Fallback-Profil).");
    });

  // Inject popup CSS once to keep the script self-contained on any host page.
  function injectStyles() {
    // Prevent duplicate <style> tags if script is injected more than once.
    if (document.getElementById("tb-style")) return;
    let style = document.createElement("style");
    style.id = "tb-style";
    style.textContent = ""
      + ".tb-popup{position:fixed;right:16px;bottom:16px;width:340px;max-width:calc(100vw - 20px);z-index:2147483000;border-radius:20px;overflow:hidden;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;backdrop-filter:blur(14px) saturate(140%);-webkit-backdrop-filter:blur(14px) saturate(140%);background:linear-gradient(160deg,rgba(255,255,255,.42),rgba(255,255,255,.2));border:1px solid rgba(255,255,255,.45);box-shadow:0 10px 30px rgba(15,23,42,.22),inset 0 1px 0 rgba(255,255,255,.35);}"
      + ".tb-head{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;color:#0f172a;background:rgba(255,255,255,.26);border-bottom:1px solid rgba(255,255,255,.35);}"
      + ".tb-title-wrap{display:flex;align-items:center;gap:10px;}"
      + ".tb-avatar{width:54px;height:54px;border-radius:50%;border:1px solid rgba(255,255,255,.6);display:block;box-shadow:0 3px 10px rgba(2,6,23,.2);}"
      + ".tb-title{font-size:14px;font-weight:700;} .tb-meta{font-size:12px;opacity:.8;}"
      + ".tb-settings-toggle{border:1px solid rgba(255,255,255,.55);background:rgba(255,255,255,.3);color:#0f172a;border-radius:8px;padding:6px 8px;cursor:pointer;}"
      + ".tb-body{padding:10px;background:transparent;}"
      + ".tb-status{border-radius:12px;padding:10px;font-size:13px;line-height:1.35;min-height:70px;border:1px solid rgba(255,255,255,.55);background:rgba(255,255,255,.33);white-space:pre-wrap;color:#0f172a;}"
      + ".tb-actions{display:flex;gap:8px;margin-top:8px;}"
      + ".tb-btn{border:1px solid rgba(255,255,255,.65);background:rgba(255,255,255,.38);color:#0f172a;border-radius:10px;padding:8px 10px;font-size:12px;font-weight:700;cursor:pointer;}"
      + ".tb-settings{display:none;margin-top:10px;border-top:1px solid rgba(255,255,255,.5);padding-top:10px;} .tb-settings.active{display:block;}"
      + ".tb-settings label{display:block;font-size:12px;margin-top:6px;}"
      + ".tb-settings select{width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,.65);background:rgba(255,255,255,.45);margin-top:4px;}"
      + ".tb-settings small{display:block;margin-top:8px;font-size:11px;}"
      + ".tb-popup.tb-text-light .tb-settings label{color:#f1f5f9;}"
      + ".tb-popup.tb-text-light .tb-settings small{color:#e2e8f0;}"
      + ".tb-popup.tb-text-dark .tb-settings label{color:#0f172a;}"
      + ".tb-popup.tb-text-dark .tb-settings small{color:#334155;}"
      + "@media (max-width:768px){.tb-popup{right:10px;left:10px;width:auto;bottom:10px;}}";
    document.head.appendChild(style);
  }

  // Create the floating popup and return references to important UI nodes.
  function createPopup() {
    let popup = document.createElement("aside");
    popup.className = "tb-popup";
    popup.innerHTML = ''
      + '<div class="tb-head">'
      + '  <div class="tb-title-wrap">'
      + '    <canvas class="tb-avatar" id="tbAvatar" width="54" height="54"></canvas>'
      + '    <div><div class="tb-title">Tutorix AI</div><div class="tb-meta" id="tbMeta"></div></div>'
      + '  </div>'
      + '  <button class="tb-settings-toggle" id="tbSettingsToggle" type="button">⚙</button>'
      + '</div>'
      + '<div class="tb-body">'
      + '  <div class="tb-status" id="tbStatus"></div>'
      + '  <div class="tb-actions">'
      + '    <button class="tb-btn" id="tbAutoBtn" type="button"></button>'
      + '  </div>'
      + '  <div class="tb-settings" id="tbSettingsPanel">'
      + '    <label for="tbTeacherSelect">Lehrer Profil</label>'
      + '    <select id="tbTeacherSelect"></select>'
      + '    <label for="tbTeacherStyle">Lehr Style</label>'
      + '    <select id="tbTeacherStyle"><option value="Streng">Streng</option><option value="Motivierend">Motivierend</option><option value="Sokratisch">Sokratisch</option></select>'
      + '    <div class="tb-actions"><button class="tb-btn" id="tbSaveSettings" type="button">Speichern</button></div>'
      + '    <small>Die Bubble prueft automatisch bei Seiten-Buttons.</small>'
      + '  </div>'
      + '</div>';
    document.body.appendChild(popup);
    // Run one immediate contrast pass, then keep it synced on window resize.
    setPopupTextContrast(popup);
    window.addEventListener("resize", function () { setPopupTextContrast(popup); });

    return {
      avatar: popup.querySelector("#tbAvatar"),
      meta: popup.querySelector("#tbMeta"),
      status: popup.querySelector("#tbStatus"),
      autoBtn: popup.querySelector("#tbAutoBtn"),
      settingsToggle: popup.querySelector("#tbSettingsToggle"),
      settingsPanel: popup.querySelector("#tbSettingsPanel"),
      teacherSelect: popup.querySelector("#tbTeacherSelect"),
      teacherStyle: popup.querySelector("#tbTeacherStyle"),
      saveSettings: popup.querySelector("#tbSaveSettings")
    };
  }

  // Load teacher personas from the backend and activate the selected one.
  function loadTeachers() {
    // Fetch from same origin as current page because backend injects script there.
    return fetch(botBaseUrl + "/teachers.json")
      .then(function (res) {
        // Fail early when teachers file is missing to trigger fallback profile.
        if (!res.ok) throw new Error("teachers.json not found");
        return res.json();
      })
      .then(function (data) {
        // Safety: avoid running with malformed config.
        if (!Array.isArray(data) || data.length === 0) throw new Error("Invalid teacher data");
        teachers = data;
        fillTeacherSelect();
        // Apply saved teacher/style and start matching avatar.
        applyTeacherFromSettings();
      });
  }

  // Fill the teacher dropdown with all loaded personas.
  function fillTeacherSelect() {
    ui.teacherSelect.innerHTML = "";
    teachers.forEach(function (t) {
      let opt = document.createElement("option");
      opt.value = teacherIdOf(t);
      opt.textContent = t.type;
      ui.teacherSelect.appendChild(opt);
    });
  }

  // Apply persisted user settings and refresh avatar + UI state.
  function applyTeacherFromSettings() {
    // If saved id no longer exists, fall back to first teacher.
    let found = teachers.find(function (t) { return teacherIdOf(t) === settings.teacherId; });
    activeTeacher = found || teachers[0] || fallbackTeacher();
    settings.teacherId = teacherIdOf(activeTeacher);

    ui.teacherSelect.value = settings.teacherId;
    settings.teacherStyle = normalizeStyle(settings.teacherStyle);
    ui.teacherStyle.value = settings.teacherStyle;
    // Persist normalized values, so next reload is consistent.
    saveStore(SETTINGS_KEY, settings);
    startNoiseAvatarAnimation(ui.avatar, colorToGradient(activeTeacher.color), seedFromText(activeTeacher.type));
    updateMeta();
    updateAutoButton();
  }

  // Bind all user and page detection events.
  function bindEvents() {
    ui.settingsToggle.addEventListener("click", function () {
      ui.settingsPanel.classList.toggle("active");
    });

    ui.teacherSelect.addEventListener("change", function () {
      settings.teacherId = ui.teacherSelect.value;
      let t = teachers.find(function (x) { return teacherIdOf(x) === settings.teacherId; });
      activeTeacher = t || activeTeacher;
      startNoiseAvatarAnimation(ui.avatar, colorToGradient(activeTeacher.color), seedFromText(activeTeacher.type));
      updateMeta();
    });

    ui.saveSettings.addEventListener("click", function () {
      settings.teacherStyle = normalizeStyle(ui.teacherStyle.value);
      saveStore(SETTINGS_KEY, settings);
      updateMeta();
      setText("Einstellungen gespeichert.");
    });

    ui.autoBtn.addEventListener("click", function () {
      settings.autoDetect = !settings.autoDetect;
      saveStore(SETTINGS_KEY, settings);
      updateAutoButton();
      setText(settings.autoDetect ? "Auto-Erkennung ist AN." : "Auto-Erkennung ist AUS.");
    });

    document.addEventListener("submit", function (event) {
      if (!settings.autoDetect) return;
      // First run catches instant DOM state.
      analyze(event.target);
      // Second run catches async UI updates after submit handlers.
      setTimeout(function () { analyze(event.target); }, 320);
    }, true);

    document.addEventListener("click", function (event) {
      if (!settings.autoDetect) return;
      let target = event.target.closest("button,input[type='submit']");
      if (!target) return;
      let txt = ((target.textContent || "") + " " + (target.value || "")).toLowerCase();
      if (target.type !== "submit" && !/submit|pruef|prüf|check|weiter|answer|ok/.test(txt)) return;
      // Prefer closest task container to avoid mixing data from whole page.
      let src = target.closest(".task-item") || target.closest("form") || target.closest(".quiz-content") || target.parentElement;
      if (!src) return;
      setTimeout(function () { analyze(src); }, 220);
    }, true);
  }

  // Build payload from the current page state and send it to the backend.
  function analyze(sourceNode) {
    let payload = buildPayload(sourceNode);
    if (!payload) return;
    sendPrompt(payload);
  }

  // Collect question, answer, context, and teacher metadata for the AI call.
  function buildPayload(sourceNode) {
    // Always keep scope as small as possible: specific block > full page.
    // If sourceNode is a real DOM element, use it.
    // Otherwise fall back to the whole document body.
    let root = sourceNode instanceof HTMLElement ? sourceNode : document.body;
    // If source is inside a <form>, use form as scope.
    // This avoids reading unrelated content from other page parts.
    let scope = root.closest("form") || root;
    // Read question text from known selectors.
    let question = readQuestion(scope);
    // Read the user input / selected answer.
    let givenAnswer = readGivenAnswer(scope);
    // Try to detect a verified correct answer (if page exposes one).
    let correctAnswer = readCorrectAnswer(scope);
    // Extra context for Kopfrechnen pages (class level).
    let classLevel = readClassLevel();

    // If mandatory data is missing, skip request.
    if (!question || !givenAnswer) return null;

    // Use normalized question text as stable key for fail-count tracking.
    // norm(...) makes matching robust against case and punctuation changes.
    let key = norm(question);
    // Read previous fail count (default 0 when missing).
    let failCount = Number(fails[key] || 0);

    // Update fail statistics only when we know a correct solution.
    if (correctAnswer) {
      // Reset count on correct answer, increment on wrong answer.
      if (norm(givenAnswer) === norm(correctAnswer)) failCount = 0;
      else failCount = failCount + 1;
      // Persist updated value in in-memory map...
      fails[key] = failCount;
      // ...and in localStorage.
      saveStore(FAILS_KEY, fails);
    }

    // Context array is sent to backend and then embedded into AI prompt.
    let context = [window.location.pathname];
    // Add school class (Klasse X) when available.
    if (classLevel) context.push("Klasse " + classLevel);

    // Return complete payload object for /prompt endpoint.
    return {
      // What the task asks.
      question: question,
      // What student entered/clicked.
      givenAnswer: givenAnswer,
      // Verified solution if detectable, else empty string.
      correctAnswer: correctAnswer,
      // Lightweight topic classifier.
      topic: detectTopic(),
      // Location/context hints for better AI response.
      context: context,
      // Number of recent fails for this question key.
      failCount: failCount,
      // Redundant teacher fields kept for compatibility.
      teacherType: activeTeacher.type,
      teacherStyle: settings.teacherStyle,
      // Full persona object used by backend prompt template.
      teacherProfile: {
        type: activeTeacher.type,
        role: activeTeacher.role,
        color: activeTeacher.color,
        context: activeTeacher.context
      }
    };
  }

  // Try multiple selectors to read the current question text robustly.
  function readQuestion(scope) {
    // Kopfrechnen cards store task text in .task-text.
    // First, try to stay local inside one task card.
    let taskScope = scope.closest(".task-item") || scope.querySelector(".task-item");
    if (taskScope) {
      // In Kopfrechnen this is the primary question element.
      let taskText = taskScope.querySelector(".task-text");
      if (taskText && clean(taskText.textContent)) return clean(taskText.textContent);
    }
    let el = scope.querySelector(".quiz-question, [data-question], .question, legend, h1, h2, h3, p");
    // Fallback order is important: more specific selectors first.
    if (el && clean(el.textContent)) return clean(el.textContent);
    // Last fallback: first label text in scope.
    let label = scope.querySelector("label");
    if (label && clean(label.textContent)) return clean(label.textContent);
    // No supported question element found.
    return "";
  }

  // Read the student's current answer from known quiz/task input patterns.
  function readGivenAnswer(scope) {
    // Prioritize local task input so we do not read unrelated fields.
    let taskScope = scope.closest(".task-item") || scope.querySelector(".task-item");
    if (taskScope) {
      // Supports dynamic ids like answer0, answer1 and class .task-input.
      let taskInput = taskScope.querySelector("input.task-input, input[id^='answer']");
      if (taskInput && clean(taskInput.value)) return clean(taskInput.value);
    }
    // Option-style quizzes can store chosen answer as selected option element.
    let selected = scope.querySelector(".quiz-option.selected");
    if (selected) return clean(selected.textContent);
    // Common answer field patterns for form-based learning pages.
    let input = scope.querySelector("input[name*='answer' i], input[id*='answer' i], input[name*='antwort' i], textarea");
    if (input && clean(input.value)) return clean(input.value);
    // Generic fallback: any input or textarea.
    let anyInput = scope.querySelector("input, textarea");
    if (anyInput && clean(anyInput.value)) return clean(anyInput.value);
    // No answer found.
    return "";
  }

  // Try to detect a verified correct answer from hidden fields or feedback text.
  function readCorrectAnswer(scope) {
    let taskScope = scope.closest(".task-item") || scope.querySelector(".task-item");
    if (taskScope) {
      // Some pages write the solution into feedback text after checking.
      let feedback = taskScope.querySelector(".feedback");
      if (feedback) {
        // Example matched text: "Lösung: 12"
        // Regex captures signed integers: -3, 0, 42.
        let m = clean(feedback.textContent).match(/lösung:\s*([-]?\d+)/i);
        if (m && m[1]) return m[1];
      }
    }
    // Hidden fields are common for static quiz implementations.
    let hidden = scope.querySelector("input[name*='correct' i], input[id*='correct' i], input[name*='solution' i]");
    if (hidden && clean(hidden.value)) return clean(hidden.value);
    // Option-style quizzes may tag correct option in DOM.
    let correctOption = scope.querySelector(".quiz-option.correct");
    if (correctOption) return clean(correctOption.textContent);
    // Unknown/undetectable correct answer.
    return "";
  }

  // Read selected class level from Kopfrechnen pages if available.
  function readClassLevel() {
    let el = document.getElementById("current-klasse");
    if (!el) return "";
    return clean(el.textContent);
  }

  // Send payload to backend and display the short AI response in the popup.
  function sendPrompt(payload) {
    // Visual "thinking" state while waiting for backend.
    setText("...");
    // POST payload as JSON to local backend.
    fetch(botBaseUrl + "/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        // Convert non-2xx status to rejected promise.
        if (!res.ok) throw new Error("HTTP " + res.status);
        // Parse backend JSON response.
        return res.json();
      })
      .then(function (data) {
        // Keep UI stable even if backend returns empty content.
        setText((data.output || "Keine Antwort").trim());
      })
      .catch(function () {
        // Generic fallback for network/backend/model errors.
        setText("Keine AI-Antwort.");
      });
  }

  // Seeded Perlin-style noise generator used for animated avatar texture.
  class SimplexNoise {
    constructor(seed) {
      // Default seed keeps function deterministic even when no seed is passed.
      if (typeof seed === "undefined") seed = 0;
      // p = base permutation table with 0..255.
      this.p = [];
      // Deterministic RNG ensures same teacher always gets same pattern base.
      let rng = this.seededRandom(seed);
      // Fill table with ordered values first...
      for (let i = 0; i < 256; i++) this.p[i] = i;
      // Fisher-Yates shuffle creates pseudo-random permutation table.
      for (let i = 255; i > 0; i--) {
        let j = Math.floor(rng() * (i + 1));
        // Manual swap to avoid temporary array allocation.
        let tmp = this.p[i];
        this.p[i] = this.p[j];
        this.p[j] = tmp;
      }
      // Duplicate table so index + 1 is safe without modulo checks.
      this.perm = this.p.concat(this.p);
    }

    seededRandom(seed) {
      return function () {
        // Small linear congruential generator (LCG).
        seed = (seed * 9301 + 49297) % 233280;
        // Normalize into [0, 1).
        return seed / 233280;
      };
    }

    fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
      return a + t * (b - a);
    }

    grad(hash, x, y, z) {
      // Low 4 bits select one of 16 gradient directions.
      let h = hash & 15;
      // Select two axes based on hash for direction diversity.
      let u = h < 8 ? x : y;
      let v = h < 8 ? y : z;
      // Flip signs depending on hash bits.
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    perlin3(x, y, z) {
      // Grid cell index (integer part), wrapped to 0..255.
      let xi = Math.floor(x) & 255;
      let yi = Math.floor(y) & 255;
      let zi = Math.floor(z) & 255;

      // Fractional position inside the current cell.
      let xf = x - Math.floor(x);
      let yf = y - Math.floor(y);
      let zf = z - Math.floor(z);

      // Smooth interpolation weights.
      let u = this.fade(xf);
      let v = this.fade(yf);
      let w = this.fade(zf);

      // Hash corner indices for the 8 cube corners.
      let p = this.perm;
      let aaa = p[p[p[xi] + yi] + zi];
      let aab = p[p[p[xi] + yi] + zi + 1];
      let aba = p[p[p[xi] + yi + 1] + zi];
      let abb = p[p[p[xi] + yi + 1] + zi + 1];
      let baa = p[p[p[xi + 1] + yi] + zi];
      let bab = p[p[p[xi + 1] + yi] + zi + 1];
      let bba = p[p[p[xi + 1] + yi + 1] + zi];
      let bbb = p[p[p[xi + 1] + yi + 1] + zi + 1];

      // Compute gradient contribution at each corner.
      let g0 = this.grad(aaa, xf, yf, zf);
      let g1 = this.grad(aab, xf, yf, zf - 1);
      let g2 = this.grad(aba, xf, yf - 1, zf);
      let g3 = this.grad(abb, xf, yf - 1, zf - 1);
      let g4 = this.grad(baa, xf - 1, yf, zf);
      let g5 = this.grad(bab, xf - 1, yf, zf - 1);
      let g6 = this.grad(bba, xf - 1, yf - 1, zf);
      let g7 = this.grad(bbb, xf - 1, yf - 1, zf - 1);

      // Trilinear interpolation from 8 corners -> final noise value.
      let l0 = this.lerp(w, g0, g1);
      let l1 = this.lerp(w, g2, g3);
      let l2 = this.lerp(w, g4, g5);
      let l3 = this.lerp(w, g6, g7);
      let l4 = this.lerp(v, l0, l1);
      let l5 = this.lerp(v, l2, l3);
      return this.lerp(u, l4, l5);
    }
  }

  // Linear color interpolation helper.
  function mix(a, b, t) {
    return Math.round(a * (1 - t) + b * t);
  }

  // Draw and animate the avatar with smooth noise-based color blending.
  function startNoiseAvatarAnimation(canvas, colors, seed) {
    // Stop previous animation loop before starting a new one.
    if (avatarAnimId) {
      cancelAnimationFrame(avatarAnimId);
      avatarAnimId = null;
    }

    let ctx = canvas.getContext("2d");
    // Convert selected gradient hex colors into numeric RGB components.
    let cA = hexToRgb((colors && colors[0]) || "#4f46e5");
    let cB = hexToRgb((colors && colors[1]) || "#0891b2");
    let size = 54;
    // Beginner knobs: speed controls animation velocity, detail controls pattern frequency.
    const NOISE_SPEED = 1;
    const NOISE_DETAIL = 5;
    let noiseGen = new SimplexNoise(seed || 0);
    // z1/z2 move through 3D noise over time, producing animation.
    let z1 = 0;
    let z2 = 1000;
    // Force fixed render size so visual stays consistent across pages.
    canvas.width = size;
    canvas.height = size;

    function noise(x, y) {
      // Mix two noise samples with different frequency axes for richer texture.
      let n1 = noiseGen.perlin3(x * (0.01 * NOISE_DETAIL), y * (0.01 * NOISE_DETAIL), z1);
      let n2 = noiseGen.perlin3(y * (0.012 * NOISE_DETAIL), x * (0.008 * NOISE_DETAIL), z2);
      return (n1 + n2) * 0.5 + 0.5;
    }

    function draw(deltaTime) {
      // Clear previous frame.
      ctx.clearRect(0, 0, size, size);
      // Save state so clip can be reverted cleanly.
      ctx.save();
      ctx.beginPath();
      // Round avatar mask.
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();

      for (let y = 0; y < size; y += 2) {
        for (let x = 0; x < size; x += 2) {
          let n = noise(x, y);
          let r = mix(cA.r, cB.r, n);
          let g = mix(cA.g, cB.g, n);
          let b = mix(cA.b, cB.b, n);
          ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
          // Paint 2x2 blocks for performance; still looks smooth at 54px.
          ctx.fillRect(x, y, 2, 2);
        }
      }

      let gradient = ctx.createRadialGradient(size * 0.3, size * 0.3, 10, size * 0.3, size * 0.3, size);
      // Subtle specular highlight for depth.
      gradient.addColorStop(0, "rgba(255,255,255,0.18)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Restore pre-clip drawing state.
      ctx.restore();

      // Advance noise time based on frame delta for frame-rate independent motion.
      z1 += deltaTime * (0.3 * NOISE_SPEED);
      z2 += deltaTime * (0.22 * NOISE_SPEED);
    }

    let lastTime = performance.now();
    function animate(now) {
      // Convert ms -> seconds for stable speed math.
      let deltaTime = (now - lastTime) * 0.001;
      // Update reference for next frame.
      lastTime = now;
      // Render one frame.
      draw(deltaTime);
      // Queue next frame and keep id to allow cancellation.
      avatarAnimId = requestAnimationFrame(animate);
    }

    avatarAnimId = requestAnimationFrame(animate);
  }

  // Convert a hex color string (#rrggbb) to RGB numbers.
  function hexToRgb(hex) {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16)
    };
  }

  // Auto-switch label text color for better readability on bright/dark pages.
  function setPopupTextContrast(popup) {
    // Read computed body color because many pages define backgrounds in CSS, not inline.
    let c = getComputedStyle(document.body).backgroundColor || "rgb(255,255,255)";
    let nums = c.match(/\d+(\.\d+)?/g) || [255, 255, 255];
    let r = Number(nums[0]) || 255;
    let g = Number(nums[1]) || 255;
    let b = Number(nums[2]) || 255;
    // Weighted brightness formula approximates perceived luminance.
    let brightness = (r * 299 + g * 587 + b * 114) / 1000;

    popup.classList.remove("tb-text-light", "tb-text-dark");
    if (brightness > 160) popup.classList.add("tb-text-dark");
    else popup.classList.add("tb-text-light");
  }

  // Refresh compact meta line under the bot title.
  function updateMeta() {
    ui.meta.textContent = activeTeacher.type + " | " + settings.teacherStyle;
  }

  // Update the auto-detection button label.
  function updateAutoButton() {
    ui.autoBtn.textContent = settings.autoDetect ? "Auto: AN" : "Auto: AUS";
  }

  // Central method to update popup status text.
  function setText(text) {
    ui.status.textContent = text;
  }

  // Basic topic detection from URL and page title.
  function detectTopic() {
    let t = (window.location.pathname + " " + document.title).toLowerCase();
    if (t.indexOf("mathe") >= 0 || t.indexOf("kopfrechnung") >= 0) return "math";
    if (t.indexOf("trainer") >= 0 || t.indexOf("sprache") >= 0) return "language learning";
    return "exercise";
  }

  // Normalize whitespace.
  function clean(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  // Compare strings in a forgiving way (lowercase + stripped punctuation).
  function norm(text) {
    return clean(text).toLowerCase().replace(/[^a-z0-9äöüß ]/gi, "");
  }

  // Fallback persona if teachers.json cannot be loaded.
  function fallbackTeacher() {
    return {
      type: "Tutor",
      role: "Helpful Guide",
      color: "Blue",
      context: "Gives short adaptive feedback.",
      moods: ["Friendly"],
      id: "Tutor"
    };
  }

  // Enforce allowed teaching styles.
  function normalizeStyle(value) {
    let v = String(value || "").toLowerCase();
    if (v === "motivierend") return "Motivierend";
    if (v === "sokratisch") return "Sokratisch";
    return "Streng";
  }

  // Stable teacher ID helper.
  function teacherIdOf(teacher) {
    return teacher.id || teacher.type || "Teacher";
  }

  // Create a repeatable numeric seed from text.
  function seedFromText(text) {
    let s = 0;
    let t = String(text || "Teacher");
    for (let i = 0; i < t.length; i++) s += t.charCodeAt(i) * (i + 1);
    return s || 11;
  }

  // Map semantic color names to gradient color pairs.
  function colorToGradient(colorName) {
    let c = String(colorName || "").toLowerCase();
    if (c === "red") return ["#ef4444", "#7f1d1d"];
    if (c === "green") return ["#22c55e", "#14532d"];
    if (c === "blue") return ["#3b82f6", "#1e3a8a"];
    return ["#4f46e5", "#0891b2"];
  }

  // Safe localStorage read with fallback merge support.
  function loadStore(key, fallback) {
    try {
      let raw = localStorage.getItem(key);
      if (!raw) return fallback;
      let parsed = JSON.parse(raw);
      // Merge keeps new default keys even when old storage object is incomplete.
      if (typeof fallback === "object" && fallback !== null) {
        return Object.assign({}, fallback, parsed);
      }
      return parsed;
    } catch (e) {
      return fallback;
    }
  }

  // Save data to localStorage as JSON.
  function saveStore(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
})();
