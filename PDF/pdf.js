// ===== VARIABLEN =====
let aktuelleAufgaben = [];

// ===== BEIM LADEN DER SEITE =====
window.onload = function() {
    // Vorschau-Container ausblenden
    document.getElementById('vorschau-container').style.display = 'none';
};

// ===== VORSCHAU ANZEIGEN =====
function pdfVorschauAnzeigen() {
    // Aufgaben generieren
    generiereAufgabenFuerPDF();
    
    // Vorschau-Container anzeigen
    document.getElementById('vorschau-container').style.display = 'block';
    
    // Aufgaben in Vorschau anzeigen
    let vorschauHtml = '';
    for (let i = 0; i < aktuelleAufgaben.length; i++) {
        vorschauHtml += `<div class="vorschau-aufgabe">${i+1}. ${aktuelleAufgaben[i].text}</div>`;
    }
    document.getElementById('vorschau-aufgaben').innerHTML = vorschauHtml;
}

// ===== VORSCHAU SCHLIESSEN =====
function vorschauSchliessen() {
    document.getElementById('vorschau-container').style.display = 'none';
}

// ===== AUFGABEN GENERIEREN =====
function generiereAufgabenFuerPDF() {
    // Einstellungen auslesen
    let klasse = document.getElementById('pdf-klasse').value;
    let anzahl = parseInt(document.getElementById('aufgaben-anzahl').value);
    let schwierigkeit = document.getElementById('schwierigkeit').value;
    
    // Checkboxen auslesen
    let typPlus = document.getElementById('typ-plus').checked;
    let typMinus = document.getElementById('typ-minus').checked;
    let typMal = document.getElementById('typ-mal').checked;
    let typGeteilt = document.getElementById('typ-geteilt').checked;
    
    // Verfügbare Operationen sammeln
    let operationen = [];
    if (typPlus) operationen.push('+');
    if (typMinus) operationen.push('-');
    if (typMal && klasse >= 2) operationen.push('×');
    if (typGeteilt && klasse >= 3) operationen.push('÷');
    
    // Wenn nichts ausgewählt, Standard setzen
    if (operationen.length === 0) {
        operationen = ['+', '-'];
        if (klasse >= 2) operationen.push('×');
    }
    
    // Aufgaben generieren
    aktuelleAufgaben = [];
    for (let i = 0; i < anzahl; i++) {
        let aufgabe = generierePDFAufgabe(klasse, operationen, schwierigkeit);
        aktuelleAufgaben.push(aufgabe);
    }
}

// ===== EINZELNE PDF-AUFGABE GENERIEREN =====
function generierePDFAufgabe(klasse, operationen, schwierigkeit) {
    let op = operationen[Math.floor(Math.random() * operationen.length)];
    let a, b, ergebnis;
    
    klasse = parseInt(klasse);
    
    // Schwierigkeitsgrad anpassen
    let maxZahl;
    if (schwierigkeit === 'leicht') {
        maxZahl = klasse === 1 ? 10 : klasse === 2 ? 20 : 50;
    } else if (schwierigkeit === 'mittel') {
        maxZahl = klasse === 1 ? 10 : klasse === 2 ? 30 : 100;
    } else {
        maxZahl = klasse === 1 ? 15 : klasse === 2 ? 40 : 200;
    }
    
    // Aufgabe je nach Operation generieren
    if (op === '+') {
        a = Math.floor(Math.random() * maxZahl) + 1;
        b = Math.floor(Math.random() * maxZahl) + 1;
        ergebnis = a + b;
        return {
            text: a + ' + ' + b + ' = ______',
            loesung: a + ' + ' + b + ' = ' + ergebnis,
            ergebnis: ergebnis
        };
    }
    
    else if (op === '-') {
        a = Math.floor(Math.random() * maxZahl) + 1;
        b = Math.floor(Math.random() * maxZahl) + 1;
        if (a < b) [a, b] = [b, a];
        ergebnis = a - b;
        return {
            text: a + ' - ' + b + ' = ______',
            loesung: a + ' - ' + b + ' = ' + ergebnis,
            ergebnis: ergebnis
        };
    }
    
    else if (op === '×') {
        if (klasse <= 2) {
            a = Math.floor(Math.random() * 5) + 1;
            b = Math.floor(Math.random() * 5) + 1;
        } else if (klasse <= 3) {
            a = Math.floor(Math.random() * 10) + 1;
            b = Math.floor(Math.random() * 10) + 1;
        } else {
            a = Math.floor(Math.random() * 12) + 1;
            b = Math.floor(Math.random() * 12) + 1;
        }
        ergebnis = a * b;
        return {
            text: a + ' × ' + b + ' = ______',
            loesung: a + ' × ' + b + ' = ' + ergebnis,
            ergebnis: ergebnis
        };
    }
    
    else if (op === '÷') {
        // Division mit ganzen Zahlen
        b = Math.floor(Math.random() * 10) + 1;
        ergebnis = Math.floor(Math.random() * 10) + 1;
        a = b * ergebnis;
        return {
            text: a + ' ÷ ' + b + ' = ______',
            loesung: a + ' ÷ ' + b + ' = ' + ergebnis,
            ergebnis: ergebnis
        };
    }
}

// ===== PDF ERSTELLEN =====
function pdfErstellen(typ) {
    // Aufgaben generieren (falls noch nicht vorhanden)
    if (aktuelleAufgaben.length === 0) {
        generiereAufgabenFuerPDF();
    }
    
    // PDF erstellen mit jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Titel
    let klasse = document.getElementById('pdf-klasse').value;
    let datum = new Date().toLocaleDateString('de-DE');
    
    if (typ === 'uebungen') {
        doc.setFontSize(22);
        doc.setTextColor(224, 168, 168);
        doc.text('Kopfrechnen - Übungsblatt', 105, 20, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Klasse: ' + klasse, 20, 35);
        doc.text('Datum: ' + datum, 20, 42);
        
        // Aufgaben
        doc.setFontSize(16);
        let y = 55;
        for (let i = 0; i < aktuelleAufgaben.length; i++) {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.text((i+1) + '.  ' + aktuelleAufgaben[i].text, 20, y);
            y += 10;
        }
        
        // Speichern
        doc.save('uebungsblatt_klasse_' + klasse + '.pdf');
    }
    
    else if (typ === 'loesungen') {
        doc.setFontSize(22);
        doc.setTextColor(224, 168, 168);
        doc.text('Kopfrechnen - Lösungsblatt', 105, 20, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Klasse: ' + klasse, 20, 35);
        doc.text('Datum: ' + datum, 20, 42);
        
        // Lösungen
        doc.setFontSize(16);
        let y = 55;
        for (let i = 0; i < aktuelleAufgaben.length; i++) {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.text((i+1) + '.  ' + aktuelleAufgaben[i].loesung, 20, y);
            y += 10;
        }
        
        // Speichern
        doc.save('loesungsblatt_klasse_' + klasse + '.pdf');
    }
    
    // Erfolgsmeldung
    setTimeout(function() {
        alert('✅ PDF wurde erstellt und geöffnet!\n\nDu kannst es jetzt speichern oder drucken.');
    }, 500);
}
