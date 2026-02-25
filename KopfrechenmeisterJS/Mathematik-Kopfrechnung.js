let currentKlasse = 1;  // Speichert die ausgewählte Klasse
let tasks = [];         // Speichert alle Aufgaben
let attempts = [];      // Speichert die Anzahl der Versuche pro Aufgabe
let maxAttempts = 3;    // Maximal 3 Versuche pro Aufgabe
let showOptions = [];   // Speichert ob Lösungsauswahl angezeigt wird
let taskResults = [];   // Speichert, ob eine Aufgabe bereits richtig/falsch gewertet wurde

// Globale Statistik (bleibt über alle Aufgaben erhalten)
let globalStats = {
    richtig: 0,
    falsch: 0,
    aufgaben: 0
};

// ===== 1. FUNKTION FÜR KLASSENAUSWAHL =====
function selectKlasse(klasse) {
    // 1. Aktuelle Klasse speichern und anzeigen
    currentKlasse = klasse;
    document.getElementById('current-klasse').innerHTML = klasse;
    
    // 2. Übungsbereich anzeigen
    document.getElementById('exercise-section').style.display = 'block';
    
    // 3. Neue Aufgaben generieren
    generateTasks();
}

// ===== 2. AUFGABEN GENERIEREN =====
function generateTasks() {
    // Alte Aufgaben löschen, aber Statistik BEHALTEN!
    tasks = [];
    attempts = [];
    showOptions = [];
    taskResults = [];
    
    // NUR 1 Aufgabe generieren
    for (let i = 0; i < 1; i++) {
        tasks.push(generateTask(currentKlasse));
        attempts.push(0);
        showOptions.push(false);
        taskResults.push(null); // null = noch nicht bewertet
    }
    
    showTasks();
    
    // Fortschritt für DIESE Aufgabe zurücksetzen
    document.getElementById('progress-text').innerHTML = '0/1 Aufgaben';
    document.getElementById('progress-fill').style.width = '0%';
}

// ===== 3. EINZELNE AUFGABE GENERIEREN =====
function generateTask(klasse) {
    // Klasse 1: Addition UND Subtraktion bis 10
    if (klasse == 1) {
        let a = Math.floor(Math.random() * 10) + 1;
        let b = Math.floor(Math.random() * 10) + 1;
        let op = Math.random() < 0.5 ? '+' : '-';
        
        if (op == '+') {
            return {
                text: a + ' + ' + b + ' = ?',
                answer: a + b
            };
        } else {
            if (a < b) [a, b] = [b, a];
            return {
                text: a + ' - ' + b + ' = ?',
                answer: a - b
            };
        }
    }
    
    // Klasse 2: Addition UND Subtraktion bis 20
    if (klasse == 2) {
        let a = Math.floor(Math.random() * 20) + 1;
        let b = Math.floor(Math.random() * 20) + 1;
        let op = Math.random() < 0.5 ? '+' : '-';
        
        if (op == '+') {
            return {
                text: a + ' + ' + b + ' = ?',
                answer: a + b
            };
        } else {
            if (a < b) [a, b] = [b, a];
            return {
                text: a + ' - ' + b + ' = ?',
                answer: a - b
            };
        }
    }
    
    // Klasse 3: Addition, Subtraktion UND Multiplikation
    if (klasse == 3) {
        let zufall = Math.random();
        
        if (zufall < 0.33) {
            let a = Math.floor(Math.random() * 10) + 1;
            let b = Math.floor(Math.random() * 10) + 1;
            return {
                text: a + ' × ' + b + ' = ?',
                answer: a * b
            };
        } else if (zufall < 0.66) {
            let a = Math.floor(Math.random() * 50) + 1;
            let b = Math.floor(Math.random() * 50) + 1;
            return {
                text: a + ' + ' + b + ' = ?',
                answer: a + b
            };
        } else {
            let a = Math.floor(Math.random() * 50) + 1;
            let b = Math.floor(Math.random() * 50) + 1;
            if (a < b) [a, b] = [b, a];
            return {
                text: a + ' - ' + b + ' = ?',
                answer: a - b
            };
        }
    }
    
    // Klasse 4 & 5: Addition, Subtraktion, Multiplikation
    let zufall = Math.random();
    
    if (zufall < 0.4) {
        let a = Math.floor(Math.random() * 100) + 1;
        let b = Math.floor(Math.random() * 100) + 1;
        return {
            text: a + ' + ' + b + ' = ?',
            answer: a + b
        };
    } else if (zufall < 0.7) {
        let a = Math.floor(Math.random() * 100) + 1;
        let b = Math.floor(Math.random() * 100) + 1;
        if (a < b) [a, b] = [b, a];
        return {
            text: a + ' - ' + b + ' = ?',
            answer: a - b
        };
    } else {
        let a = Math.floor(Math.random() * 20) + 1;
        let b = Math.floor(Math.random() * 20) + 1;
        return {
            text: a + ' × ' + b + ' = ?',
            answer: a * b
        };
    }
}

// ===== 4. AUFGABEN ANZEIGEN =====
function showTasks() {
    let html = '';
    
    for (let i = 0; i < tasks.length; i++) {
        html += '<div class="task-item">';
        html += '  <div class="task-header">';
        html += '    <span class="task-number">Aufgabe ' + (i+1) + '/1</span>';
        html += '  </div>';
        html += '  <div class="task-text">' + tasks[i].text + '</div>';
        html += '  <div class="task-input-group">';
        html += '    <input type="number" id="answer' + i + '" class="task-input" placeholder="Antwort">';
        html += '    <button onclick="checkAnswer(' + i + ')" class="check-btn" id="btn' + i + '">Prüfen</button>';
        html += '  </div>';
        html += '  <div id="feedback' + i + '" class="feedback"></div>';
        html += '  <div id="attempts' + i + '" style="margin-top:5px; color:#666;">Versuche: 0/3</div>';
        html += '  <div id="options' + i + '" style="margin-top:10px;"></div>';
        html += '</div>';
    }
    
    document.getElementById('tasks-container').innerHTML = html;
}

// ===== 5. LÖSUNGSAUSWAHL GENERIEREN =====
function generateOptions(i) {
    let richtig = tasks[i].answer;
    let options = [richtig];
    
    // 2 falsche Antworten generieren
    while (options.length < 3) {
        let falsch;
        if (richtig < 10) {
            falsch = Math.floor(Math.random() * 20) + 1;
        } else {
            falsch = richtig + Math.floor(Math.random() * 20) - 10;
        }
        
        // Nicht die richtige und nicht doppelt
        if (falsch != richtig && !options.includes(falsch)) {
            options.push(falsch);
        }
    }
    
    // Mischen
    options.sort(() => Math.random() - 0.5);
    
    let html = '<p style="margin-bottom:8px; font-weight:bold;">Wähle die richtige Antwort:</p><div style="display:flex; gap:10px; flex-wrap:wrap;">';
    
    for (let j = 0; j < options.length; j++) {
        html += '<button onclick="selectOption(' + i + ', ' + options[j] + ')" style="padding:10px 20px; background:#e0a8a8; color:white; border:none; border-radius:8px; cursor:pointer; font-size:1.1rem;">' + options[j] + '</button>';
    }
    
    html += '</div>';
    
    document.getElementById('options' + i).innerHTML = html;
    showOptions[i] = true;
}

// ===== 6. OPTION AUSWÄHLEN =====
function selectOption(i, wert) {
    let input = document.getElementById('answer' + i);
    let feedback = document.getElementById('feedback' + i);
    let button = document.getElementById('btn' + i);
    let attemptsDisplay = document.getElementById('attempts' + i);
    
    input.value = wert;
    
    if (wert == tasks[i].answer) {
        feedback.innerHTML = '✓ Richtig! Super gemacht! 🎉';
        feedback.className = 'feedback correct';
        button.disabled = true;
        input.disabled = true;
        document.getElementById('options' + i).innerHTML = '';
        
        // Aufgabe als richtig bewerten, wenn noch nicht bewertet
        if (taskResults[i] === null) {
            taskResults[i] = true;
            // Zur globalen Statistik hinzufügen
            globalStats.richtig++;
            globalStats.aufgaben++;
            updateStats();
        }
    } else {
        feedback.innerHTML = '✗ Falsch! Versuche es nochmal.';
        feedback.className = 'feedback wrong';
    }
}

// ===== 7. EINZELNE ANTWORT PRÜFEN =====
function checkAnswer(i) {
    let input = document.getElementById('answer' + i);
    let feedback = document.getElementById('feedback' + i);
    let button = document.getElementById('btn' + i);
    let antwort = parseInt(input.value);
    let attemptsDisplay = document.getElementById('attempts' + i);
    
    // Prüfen ob eine Zahl eingegeben wurde
    if (isNaN(antwort)) {
        feedback.innerHTML = '⚠️ Bitte eine Zahl eingeben!';
        feedback.className = 'feedback wrong';
        return;
    }
    
    // Versuch hochzählen
    attempts[i]++;
    attemptsDisplay.innerHTML = 'Versuche: ' + attempts[i] + '/3';
    
    // Ist die Antwort richtig?
    if (antwort == tasks[i].answer) {
        feedback.innerHTML = '✓ Richtig! Super gemacht! 🎉';
        feedback.className = 'feedback correct';
        button.disabled = true;
        input.disabled = true;
        
        // Aufgabe als richtig bewerten, wenn noch nicht bewertet
        if (taskResults[i] === null) {
            taskResults[i] = true;
            // Zur globalen Statistik hinzufügen
            globalStats.richtig++;
            globalStats.aufgaben++;
            updateStats();
        }
    } else {
        // Falsche Antwort
        if (attempts[i] >= maxAttempts && !showOptions[i]) {
            // 3 Versuche verbraucht - Lösungsauswahl anzeigen
            feedback.innerHTML = '✗ 3x falsch. Hier sind 3 Möglichkeiten:';
            feedback.className = 'feedback wrong';
            generateOptions(i);
            
            // Aufgabe als falsch bewerten, wenn noch nicht bewertet
            if (taskResults[i] === null) {
                taskResults[i] = false;
                // Zur globalen Statistik hinzufügen
                globalStats.falsch++;
                globalStats.aufgaben++;
                updateStats();
            }
        } else if (attempts[i] >= maxAttempts && showOptions[i]) {
            // Hat schon Optionen, aber klickt weiter auf Prüfen
            feedback.innerHTML = '✗ Bitte wähle eine der 3 Möglichkeiten aus!';
            feedback.className = 'feedback wrong';
        } else {
            // Noch Versuche übrig
            let reste = maxAttempts - attempts[i];
            feedback.innerHTML = '✗ Falsch! Noch ' + reste + ' Versuch' + (reste > 1 ? 'e' : '');
            feedback.className = 'feedback wrong';
        }
    }
    
    // Fortschritt aktualisieren
    updateProgress();
}

// ===== 8. STATISTIK AKTUALISIEREN =====
function updateStats() {
    // Statistik aus globalStats anzeigen
    document.getElementById('correct-count').innerHTML = globalStats.richtig;
    document.getElementById('wrong-count').innerHTML = globalStats.falsch;
    document.getElementById('attempts-count').innerHTML = globalStats.aufgaben;
    
    // Prozent berechnen
    let prozent = 0;
    if (globalStats.aufgaben > 0) {
        prozent = Math.round((globalStats.richtig / globalStats.aufgaben) * 100);
    }
    document.getElementById('success-rate').innerHTML = prozent + '%';
    
    // Punkte berechnen (10 Punkte pro richtige Aufgabe)
    document.getElementById('score-text').innerHTML = 'Punkte: ' + (globalStats.richtig * 10);
}

// ===== 9. LÖSUNGEN ANZEIGEN =====
function showAllSolutions() {
    for (let i = 0; i < tasks.length; i++) {
        let input = document.getElementById('answer' + i);
        let feedback = document.getElementById('feedback' + i);
        let button = document.getElementById('btn' + i);
        
        input.value = tasks[i].answer;
        feedback.innerHTML = '✓ Lösung: ' + tasks[i].answer;
        feedback.className = 'feedback correct';
        button.disabled = true;
        input.disabled = true;
        document.getElementById('options' + i).innerHTML = '';
        
        // Aufgabe als richtig bewerten, wenn noch nicht bewertet
        if (taskResults[i] === null) {
            taskResults[i] = true;
            // Zur globalen Statistik hinzufügen
            globalStats.richtig++;
            globalStats.aufgaben++;
        }
    }
    
    updateStats();
    updateProgress();
}

// ===== 10. NEUE AUFGABEN GENERIEREN =====
function generateNewTasks() {
    generateTasks();
}

// ===== 11. FORTSCHRITT AKTUALISIEREN =====
function updateProgress() {
    let aufgabenBeantwortet = 0;
    
    for (let i = 0; i < tasks.length; i++) {
        if (taskResults[i] !== null) {
            aufgabenBeantwortet++;
        }
    }
    
    document.getElementById('progress-text').innerHTML = aufgabenBeantwortet + '/1 Aufgaben';
    document.getElementById('progress-fill').style.width = (aufgabenBeantwortet * 100) + '%';
}

// ===== 12. STATISTIK ZURÜCKSETZEN (NEUE FUNKTION) =====
function resetStats() {
    globalStats = {
        richtig: 0,
        falsch: 0,
        aufgaben: 0
    };
    updateStats();
}



// ===== 13. QUIZ (WEITERLEITUNG) =====
function startQuiz() {
   if (!currentKlasse) {
        alert('Bitte zuerst eine Klasse auswählen!');
        return;
    }
    
    // Zur Quiz-Seite weiterleiten mit ausgewählter Klasse
    window.location.href = 'quiz.html?klasse=' + currentKlasse;
}

// ===== 14. PDF =====
function generatePDF() {
    alert('PDF-Funktion kommt bald!');
}
function generateExercisePDF() {
    if (!currentKlasse) {
        alert('Bitte zuerst eine Klasse auswählen!');
        return;
    }
    window.location.href = 'pdf.html';
}

function generateSolutionPDF() {
    if (!currentKlasse) {
        alert('Bitte zuerst eine Klasse auswählen!');
        return;
    }
    window.location.href = 'pdf.html';
}
