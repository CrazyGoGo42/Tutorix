// ===== QUIZ VARIABLEN =====
let quizFragen = [];
let aktuelleFrageIndex = 0;
let richtigCount = 0;
let quizTimer;
let zeitUebrig = 900; // 15 Minuten
let quizAktiv = false;
let antwortGesperrt = false;

// ===== BEIM LADEN DER SEITE =====
window.onload = function() {
    // Klasse aus URL holen (z.B. quiz.html?klasse=3)
    const urlParams = new URLSearchParams(window.location.search);
    const klasse = urlParams.get('klasse') || '1';
    
    // Klasse im Willkommensbereich anzeigen
    document.getElementById('quiz-klasse-anzeige').innerHTML = klasse;
    document.getElementById('quiz-klasse').innerHTML = klasse;
};

// ===== QUIZ WIRKLICH STARTEN (bei Button-Klick) =====
function quizWirklichStarten() {
    // Willkommen ausblenden, Quiz anzeigen
    document.getElementById('willkommen-container').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    
    // Klasse holen
    const klasse = document.getElementById('quiz-klasse').innerHTML;
    
    // Quiz starten
    starteQuiz(klasse);
}

// ===== QUIZ STARTEN =====
function starteQuiz(klasse) {
    quizAktiv = true;
    
    // 10 Fragen generieren
    generiereFragen(klasse);
    
    // Timer starten
    starteTimer();
    
    // Erste Frage anzeigen
    zeigeFrage();
}

// ===== FRAGEN GENERIEREN =====
function generiereFragen(klasse) {
    quizFragen = [];
    
    for (let i = 0; i < 10; i++) {
        let frage = generiereAufgabe(parseInt(klasse));
        quizFragen.push({
            text: frage.text,
            richtig: frage.answer,
            optionen: generiereOptionen(frage.answer, klasse)
        });
    }
}

// ===== EINE AUFGABE GENERIEREN (gleiche Logik wie Hauptseite) =====
function generiereAufgabe(klasse) {
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
    
    else if (klasse == 2) {
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
    
    else {
        let zufall = Math.random();
        
        if (zufall < 0.4) {
            let a = Math.floor(Math.random() * 50) + 1;
            let b = Math.floor(Math.random() * 50) + 1;
            return {
                text: a + ' + ' + b + ' = ?',
                answer: a + b
            };
        } else if (zufall < 0.7) {
            let a = Math.floor(Math.random() * 50) + 1;
            let b = Math.floor(Math.random() * 50) + 1;
            if (a < b) [a, b] = [b, a];
            return {
                text: a + ' - ' + b + ' = ?',
                answer: a - b
            };
        } else {
            let a = Math.floor(Math.random() * 10) + 1;
            let b = Math.floor(Math.random() * 10) + 1;
            return {
                text: a + ' × ' + b + ' = ?',
                answer: a * b
            };
        }
    }
}

// ===== ANTWORT-OPTIONEN GENERIEREN =====
function generiereOptionen(richtigeAntwort, klasse) {
    let optionen = [richtigeAntwort];
    
    while (optionen.length < 4) {
        let falsch;
        
        if (klasse <= 2) {
            falsch = richtigeAntwort + Math.floor(Math.random() * 5) - 2;
            if (falsch < 1) falsch = richtigeAntwort + 1;
        } else {
            falsch = richtigeAntwort + Math.floor(Math.random() * 10) - 4;
            if (falsch < 1) falsch = richtigeAntwort + 2;
        }
        
        if (falsch != richtigeAntwort && !optionen.includes(falsch)) {
            optionen.push(falsch);
        }
    }
    
    // Mischen
    return optionen.sort(() => Math.random() - 0.5);
}

// ===== FRAGE ANZEIGEN =====
function zeigeFrage() {
    if (!quizAktiv) return;
    
    if (aktuelleFrageIndex >= quizFragen.length) {
        zeigeErgebnis();
        return;
    }
    
    let frage = quizFragen[aktuelleFrageIndex];
    
    // Frage anzeigen
    document.getElementById('frage-text').innerHTML = frage.text;
    
    // Frage-Nummer aktualisieren
    document.getElementById('frage-aktuell').innerHTML = aktuelleFrageIndex + 1;
    document.getElementById('frage-total').innerHTML = quizFragen.length;
    
    // Fortschrittsbalken
    let fortschritt = (aktuelleFrageIndex / quizFragen.length) * 100;
    document.getElementById('fortschritt-balken').style.width = fortschritt + '%';
    
    // Antwort-Buttons erstellen
    let antwortHtml = '';
    for (let i = 0; i < frage.optionen.length; i++) {
        antwortHtml += `<button onclick="pruefeAntwort(${i})" class="antwort-btn" id="btn-${i}">${frage.optionen[i]}</button>`;
    }
    document.getElementById('antwort-container').innerHTML = antwortHtml;
    
    // Feedback ausblenden
    let feedback = document.getElementById('feedback');
    feedback.style.display = 'none';
    feedback.className = 'feedback';
    
    // Antworten entsperren
    antwortGesperrt = false;
}

// ===== ANTWORT PRÜFEN =====
function pruefeAntwort(buttonIndex) {
    if (antwortGesperrt || !quizAktiv) return;
    
    // Antwort sperren (keine weiteren Klicks)
    antwortGesperrt = true;
    
    let frage = quizFragen[aktuelleFrageIndex];
    let gewaehlteAntwort = frage.optionen[buttonIndex];
    let istRichtig = (gewaehlteAntwort === frage.richtig);
    
    // Alle Buttons deaktivieren und einfärben
    for (let i = 0; i < 4; i++) {
        let btn = document.getElementById('btn-' + i);
        if (btn) {
            btn.disabled = true;
            
            if (frage.optionen[i] === frage.richtig) {
                btn.style.background = '#4CAF50';
            }
            else if (i === buttonIndex && !istRichtig) {
                btn.style.background = '#f44336';
            }
        }
    }
    
    // Feedback anzeigen
    let feedback = document.getElementById('feedback');
    if (istRichtig) {
        richtigCount++;
        document.getElementById('richtig-zaehler').innerHTML = richtigCount;
        feedback.innerHTML = '✓ Richtig! 🎉';
        feedback.className = 'feedback correct';
    } else {
        feedback.innerHTML = '✗ Falsch! Die richtige Antwort ist: ' + frage.richtig;
        feedback.className = 'feedback wrong';
    }
    
    // Nächste Frage nach 1.5 Sekunden
    setTimeout(function() {
        aktuelleFrageIndex++;
        zeigeFrage();
    }, 1500);
}

// ===== TIMER STARTEN =====
function starteTimer() {
    zeitUebrig = 900; // 15 Minuten
    
    quizTimer = setInterval(function() {
        if (!quizAktiv) {
            clearInterval(quizTimer);
            return;
        }
        
        zeitUebrig--;
        
        // Timer anzeigen (MM:SS)
        let min = Math.floor(zeitUebrig / 60);
        let sek = zeitUebrig % 60;
        document.getElementById('quiz-timer').innerHTML = 
            (min < 10 ? '0' + min : min) + ':' + 
            (sek < 10 ? '0' + sek : sek);
        
        // Zeit abgelaufen
        if (zeitUebrig <= 0) {
            clearInterval(quizTimer);
            if (quizAktiv) {
                alert('⏰ Zeit abgelaufen!');
                zeigeErgebnis();
            }
        }
    }, 1000);
}

// ===== ERGEBNIS ANZEIGEN =====
function zeigeErgebnis() {
    quizAktiv = false;
    clearInterval(quizTimer);
    
    // Frage-Bereich ausblenden, Ergebnis anzeigen
    document.getElementById('frage-container').style.display = 'none';
    document.getElementById('ergebnis-container').style.display = 'block';
    
    // Richtige Antworten anzeigen
    document.getElementById('ergebnis-richtig').innerHTML = richtigCount;
    
    // Note berechnen
    let prozent = (richtigCount / 10) * 100;
    let note;
    let noteText;
    let farbe;
    
    if (prozent >= 95) { 
        note = 1; 
        noteText = 'Ausgezeichnet! 🌟';
        farbe = '#4CAF50';
    } else if (prozent >= 80) { 
        note = 2; 
        noteText = 'Gut gemacht! 👍';
        farbe = '#8BC34A';
    } else if (prozent >= 60) { 
        note = 3; 
        noteText = 'Befriedigend! 👌';
        farbe = '#FFC107';
    } else if (prozent >= 45) { 
        note = 4; 
        noteText = 'Ausreichend! 📝';
        farbe = '#FF9800';
    } else if (prozent >= 20) { 
        note = 5; 
        noteText = 'Mangelhaft! Übe weiter! 💪';
        farbe = '#f44336';
    } else { 
        note = 6; 
        noteText = 'Nicht aufgeben! 🌱';
        farbe = '#d32f2f';
    }
    
    // Note anzeigen
    let noteDisplay = document.getElementById('note-display');
    noteDisplay.innerHTML = note;
    noteDisplay.style.background = farbe;
    document.getElementById('note-text').innerHTML = noteText;
}

// ===== NEUES QUIZ STARTEN =====
function neuesQuiz() {
    // Alles zurücksetzen
    aktuelleFrageIndex = 0;
    richtigCount = 0;
    quizAktiv = true;
    antwortGesperrt = false;
    
    // Anzeigen zurücksetzen
    document.getElementById('richtig-zaehler').innerHTML = '0';
    document.getElementById('quiz-timer').innerHTML = '15:00';
    document.getElementById('ergebnis-container').style.display = 'none';
    document.getElementById('frage-container').style.display = 'block';
    
    // Neue Fragen generieren
    const klasse = document.getElementById('quiz-klasse').innerHTML;
    generiereFragen(klasse);
    
    // Timer neu starten
    if (quizTimer) clearInterval(quizTimer);
    starteTimer();
    
    // Erste Frage anzeigen
    zeigeFrage();
}

// ===== ZURÜCK ZUR HAUPTSEITE =====
function zurueckZuUebungen() {
    window.location.href = 'Mathematik-Kopfrechnung.html';
}
