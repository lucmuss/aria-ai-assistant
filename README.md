# ARIA Thunderbird AI Email Assistant

ARIA ist eine Thunderbird Erweiterung fuer KI-gestuetzte E-Mail-Antworten mit OpenAI oder lokalen Modellen wie Ollama und LM Studio. Die Erweiterung beschleunigt das Beantworten von E-Mails, nutzt den aktuellen Mail-Kontext und unterstuetzt optional Voice Input mit Speech-to-Text.

Diese README ist die zentrale, vollstaendige Dokumentation fuer Installation, Konfiguration, Nutzung, CI/CD und Release.

## Inhaltsverzeichnis

- [1. Was ist dieses Projekt?](#1-was-ist-dieses-projekt)
- [2. Features](#2-features)
- [3. Installation](#3-installation)
- [4. Quickstart (5 Minuten)](#4-quickstart-5-minuten)
- [5. Konfiguration](#5-konfiguration)
- [6. Nutzung](#6-nutzung)
- [7. CI/CD und Release](#7-cicd-und-release)
- [8. Sicherheit und Datenschutz](#8-sicherheit-und-datenschutz)
- [9. Troubleshooting](#9-troubleshooting)
- [10. FAQ](#10-faq)
- [11. Beitragen und Entwicklung](#11-beitragen-und-entwicklung)
- [12. Lizenz](#12-lizenz)

## 1. Was ist dieses Projekt?

ARIA (AI Response and Intelligence Assistant) ist eine Thunderbird Compose-Erweiterung fuer schnellere, bessere E-Mail-Antworten.

Kernidee:
- E-Mail-Kontext aus dem aktuellen Reply/Compose holen
- Benutzeranweisung (Text oder Sprache) erfassen
- Antwort ueber Chat-API generieren
- Ergebnis direkt in den Entwurf einfuegen

Geeignet fuer:
- Support und Kundenkommunikation
- Termin- und Projektabstimmung
- schnelle, konsistente Standardantworten
- mehrsprachige E-Mail-Konversationen

## 2. Features

### KI-Antworten in Thunderbird
- Antwortgenerierung aus realem Mail-Kontext
- konfigurierbare Modelle, Temperatur und Max Tokens
- Tone und Length Steuerung
- anpassbarer System Prompt inklusive Prompt Library

### Voice Input (Speech-to-Text)
- Mikrofonaufnahme im Popup
- Transkription ueber konfigurierbare STT API
- robuste Fehlerbehandlung fuer Audio/Recorder/API

### Produktivitaet
- Autoresponse Button fuer schnelle Bestaetigungsantworten
- Statistikanzeige (Input Tokens, Output Tokens, Model, Laufzeit, Kosten)
- Export/Import von Einstellungen

### Aktueller Sprachumfang
- UI Sprachen aktuell: `en`, `de`

## 3. Installation

### Voraussetzungen
- Thunderbird `>= 115`
- API Zugriff auf mindestens einen Chat Provider
- optional Mikrofon und STT API fuer Voice Input

### Option A: Installation aus GitHub Release
1. Repository Releases oeffnen.
2. Neueste `.xpi` Datei herunterladen.
3. In Thunderbird: Add-ons und Themes.
4. Zahnrad Icon klicken und `Install Add-on From File` waehlen.
5. `.xpi` auswaehlen und installieren.

### Option B: Temporaere Entwickler-Installation
1. Repository klonen.
2. In Thunderbird: Add-ons und Themes.
3. Zahnrad Icon klicken und `Debug Add-ons` oeffnen.
4. `Load Temporary Add-on` waehlen.
5. Datei `aria-ai-assistant/manifest.json` laden.

## 4. Quickstart (5 Minuten)

1. ARIA im Compose Fenster oeffnen.
2. `Settings` oeffnen.
3. Unter `Chat API Settings` konfigurieren:
   - API URL
   - API Key
   - Model
4. `Save` klicken.
5. `Test API` ausfuehren.
6. Zurueck ins Popup, Anweisung eingeben.
7. `Submit` klicken.

Nach wenigen Sekunden steht die KI-Antwort im Entwurf.

## 5. Konfiguration

### 5.1 Chat API Settings

Empfohlene OpenAI Konfiguration:
- API URL: `https://api.openai.com/v1/chat/completions`
- Model: `gpt-4o-mini` (guenstig und schnell)

Lokale Modelle:
- Ollama API URL: `http://localhost:11434/v1/chat/completions`
- LM Studio API URL: `http://localhost:1234/v1/chat/completions`
- API Key kann bei lokalen Backends optional sein

Wichtige Felder:
- `temperature`: Kreativitaet der Antworten
- `maxTokens`: maximale Antwortlaenge
- `chatTone`: none, formal, casual, friendly
- `chatLength`: none, short, medium, long

### 5.2 Extension Settings
- `contextSize`: wie viele vorherige Nachrichten einbezogen werden
- `includeSender`: Absenderadresse in Prompt-Kontext aufnehmen
- `clearEmailAfterSubmit`: Entwurf vor Einfuegen leeren

### 5.3 System Prompt Settings
- gespeicherte System Prompts laden
- eigene Prompts unter eigenem Namen speichern
- aktuellen Prompt als aktive Default-Vorgabe setzen

### 5.4 Speech-to-Text Settings

Beispiel OpenAI Whisper:
- STT API URL: `https://api.openai.com/v1/audio/transcriptions`
- Model: `whisper-1`
- Language: `de`, `en` oder leer fuer Auto

Hinweise:
- STT API Key ist optional, falls dein STT Endpoint ohne Bearer Auth arbeitet
- bei erstem Voice Start fragt Thunderbird nach Mikrofonzugriff

### 5.5 Konfiguration testen
- `Test API` prueft Chat Endpoint
- `Test STT API` prueft Transkriptionsendpoint mit `test.wav`

## 6. Nutzung

### 6.1 Standard-Workflow fuer KI-Antwort
1. E-Mail oeffnen oder auf E-Mail antworten.
2. ARIA Popup oeffnen.
3. Anweisung eingeben.
4. `Submit` klicken.
5. Ergebnis pruefen und bei Bedarf bearbeiten.

### 6.2 Autoresponse
- `Autoresponse` setzt einen vordefinierten Prompt und startet direkt die Generierung.
- sinnvoll fuer kurze Empfangs- und Terminbestaetigungen.

### 6.3 Voice Input Workflow
1. `Voice Input` klicken.
2. sprechen.
3. `Stop Recording` klicken.
4. Transkript wird ins Prompt Feld geschrieben.
5. optional editieren und `Submit` klicken.

Popup Shortcuts:
- `Ctrl/Cmd + Shift + V`: Voice Input starten
- `Ctrl/Cmd + Shift + A`: Autoresponse ausfuehren

### 6.4 Prompt Best Practices
- Aufgabe konkret formulieren.
- Zielton nennen: formal, freundlich, kurz, detailliert.
- kritische Fakten explizit angeben.

Beispiele:
- `Schreibe eine professionelle Zusage fuer den Termin am Dienstag um 14:00 Uhr.`
- `Formuliere eine freundliche Absage mit Dank fuer das Angebot.`
- `Antwort auf Englisch, knapp und sachlich.`

## 7. CI/CD und Release

Dieses Repository nutzt GitHub Actions.

Workflow Datei:
- `.github/workflows/extension-ci.yml`

Ablauf:
1. `lint` mit `web-ext lint`
2. `build` erzeugt Release-Artefakte (`.xpi` und `.zip`)
3. Push auf `main` oder `master` erzeugt automatisches Commit Prerelease
4. Tag Push `vX.Y.Z` erzeugt offizielles GitHub Release

### Lokale Release-Vorbereitung

```bash
git checkout master
# oder: git checkout main

# Version in aria-ai-assistant/manifest.json aktualisieren
# CHANGELOG.md aktualisieren

git add aria-ai-assistant/manifest.json CHANGELOG.md
git commit -m "release: v1.0.1"
git push

# offizielles Release
git tag v1.0.1
git push origin v1.0.1
```

## 8. Sicherheit und Datenschutz

- keine externe Datensammlung durch ARIA selbst
- lokale Speicherung von Settings in Thunderbird Storage
- API Datenverkehr nur zu den von dir konfigurierten Endpoints
- Voice Audio wird nur waehrend der STT Anfrage uebertragen

Weitere Details:
- `PRIVACY.md`

## 9. Troubleshooting

### Fehler: API settings missing
Ursache:
- Chat API URL, API Key oder Model fehlen.

Loesung:
- Settings oeffnen und alle Pflichtfelder setzen.
- danach `Test API` ausfuehren.

### Fehler: No message or reply draft open
Ursache:
- ARIA benoetigt offenen Compose/Reply Kontext.

Loesung:
- zuerst auf eine E-Mail antworten oder Compose oeffnen.

### Voice Input startet nicht
Ursache:
- kein Mikrofonzugriff oder keine Recorder-Unterstuetzung.

Loesung:
- Mikrofonberechtigung in Thunderbird/System erlauben.
- STT Endpoint pruefen.
- `Test STT API` ausfuehren.

### STT gibt keinen Text zurueck
Ursache:
- leere/zu kurze Aufnahme oder STT Modellproblem.

Loesung:
- klarer sprechen, laenger aufnehmen, Sprache korrekt setzen.

### API request failed
Ursache:
- falsche URL, Key, Netzwerk oder fehlende Credits.

Loesung:
- Endpoint und Key verifizieren.
- mit minimalem Testprompt pruefen.

## 10. FAQ

### Kann ich ARIA ohne OpenAI nutzen?
Ja. Du kannst lokale oder andere OpenAI-kompatible Endpoints nutzen, z. B. Ollama oder LM Studio.

### Muss ich Voice Input nutzen?
Nein. Voice Input ist optional. Textprompts funktionieren ohne STT Konfiguration.

### Unterstuetzt ARIA mehrere Sprachen?
Ja. Die UI hat aktuell Deutsch und Englisch. Antworten orientieren sich am E-Mail-Kontext und deinen Anweisungen.

### Wo finde ich die wichtigsten Dokus?
- Quick Einstieg: `QUICKSTART.md`
- Datenschutz: `PRIVACY.md`
- Aenderungen: `CHANGELOG.md`
- Einreichung: `SUBMISSION_CHECKLIST.md`

## 11. Beitragen und Entwicklung

### Repository lokal starten

```bash
git clone https://github.com/lucmuss/aria-ai-assistant.git
cd aria-ai-assistant
```

### Projektstruktur

```text
aria-ai-assistant/
├── aria-ai-assistant/
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── settings.html
│   ├── settings.js
│   ├── style.css
│   ├── background.js
│   ├── modules/
│   ├── locales/
│   └── icons/
├── .github/workflows/
├── README.md
├── QUICKSTART.md
├── CHANGELOG.md
└── PRIVACY.md
```

### Beitrag leisten
1. Fork erstellen.
2. Feature Branch erstellen.
3. Aenderungen umsetzen und lokal testen.
4. Pull Request mit klarer Beschreibung erstellen.

## 12. Lizenz

MIT Lizenz. Details in `LICENSE`.
