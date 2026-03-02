# Tutorix

**GitHub:** https://github.com/CrazyGoGo42/Tutorix
**Gitea:** https://git.bib.de/PBT3H24APA/Tutorix

---

Tutorix ist eine lokale Lernplattform, die wir als Schulprojekt entwickelt haben. Sie besteht aus zwei Lernmodulen und einem KI-Assistenten, der beim Ueben Feedback gibt.

## Was steckt drin

**Kopfrechenmeister** ist ein Mathematiktrainer fuer die Klassen 1 bis 5. Nach der Klassenwahl werden zufaellige Aufgaben generiert, die zum jeweiligen Niveau passen. Man gibt die Antwort ein, klickt auf "Pruefen" und bekommt sofort Rueckmeldung. Wer es etwas geordneter mag, kann einen 15-Minuten-Quiz starten, der am Ende eine Note gibt. Ausserdem lassen sich fertige Aufgabenblaetter als PDF herunterladen.

**Tutorix Trainer** ist ein Vokabeltrainer fuer Griechisch. Es gibt zehn Schwierigkeitsstufen, die man der Reihe nach freischalten kann. Das System zeigt Vokabeln und prueft ob man sie behalten hat. Drei falsche Antworten bedeuten, dass man die Runde nochmal versuchen muss.

**Der KI-Assistent** laeuft im Hintergrund als kleines Popup unten rechts im Fenster. Er reagiert automatisch, wenn man eine Aufgabe prueft, und gibt einen kurzen Kommentar dazu. Man kann zwischen drei Lehrerpersoenlichkeiten waehlen: Spock (sachlich und logisch), Rick Sanchez (chaotisch aber kreativ) und Master Roshi (sehr direkt und fordernd). Die KI laeuft komplett lokal ueber Ollama, es werden keine Daten nach aussen geschickt.

## Installation

Das Programm laeuft unter Windows. Zum Starten einfach zuerst `install.bat` ausfuehren. Das Skript prueft ob Node.js, Git und Ollama installiert sind und holt sie bei Bedarf automatisch nach. Ausserdem laedt es das KI-Modell herunter, was beim ersten Mal ein paar Minuten dauern kann. Falls die `start.bat` nicht funktioniert muss man in cmd im datepfad `Tutorix-bot/Bot/` und dann den Befehl `node server.js` ausfuehren.

Danach genuegt ein Doppelklick auf `start.bat`. Der Server startet und die Startseite oeffnet sich im Browser unter `http://localhost:3000`.

## Technik

Das Frontend ist in reinem HTML, CSS und JavaScript geschrieben, ohne externe Frameworks. Der Server laeuft auf Node.js mit Express und stellt alle Seiten bereit. Die KI basiert auf dem Modell `llama3.2` ueber Ollama, das lokal auf dem Rechner laeuft.
