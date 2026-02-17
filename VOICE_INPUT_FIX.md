# Voice Input (Spracheingabe) - Fehlerbehebung & Anleitung

> **Update (2026-02):** Die Extension nutzt jetzt den nativen `getUserMedia`-Prompt von Thunderbird/WebExtensions. Eine `microphone`-Manifest-Permission ist dafür nicht notwendig.  
> Shortcuts wurden auf `Ctrl/Cmd + Shift + V` (Voice) und `Ctrl/Cmd + Shift + A` (Autoresponse) geändert, damit Standard-Shortcuts wie Einfügen/Alles markieren nicht überschrieben werden.

## 🔧 Behobene Probleme

### 1. **KRITISCH: Fehlende Mikrofonberechtigung**
**Problem:** Das `manifest.json` enthielt keine Mikrofonberechtigung, wodurch die Spracheingabe nicht funktionieren konnte.

**Lösung:** 
- Mikrofonberechtigung zu `manifest.json` hinzugefügt
- Permission `<all_urls>` für API-Aufrufe hinzugefügt
- Optional permission für `microphone` aktiviert

```json
"permissions": [
  "storage",
  "messagesRead",
  "compose",
  "tabs",
  "accountsRead",
  "<all_urls>"
],
"optional_permissions": [
  "microphone"
]
```

### 2. **Inkonsistente Fehlerbehandlung**
**Problem:** Hartcodierte deutsche Fehlermeldungen in `stt-recorder.js`

**Lösung:**
- Alle Fehlermeldungen nutzen jetzt das i18n-System
- Neuer i18n-Schlüssel `errorNoActiveRecording` hinzugefügt
- Konsistente Fehlerbehandlung über alle Module

### 3. **Unzureichendes Benutzer-Feedback**
**Problem:** Keine visuellen Hinweise während der Aufnahme

**Lösung:**
- Verbesserte Button-Status-Anzeigen
- Klare Feedback-Nachrichten während Aufnahme und Transkription
- Bessere Fehlerbehandlung mit aussagekräftigen Meldungen

### 4. **Inkonsistentes GUI-Verhalten**
**Problem:** Buttons verhielten sich nicht einheitlich

**Lösung:**
- Standardisierte Button-Styles in `style.css`
- Konsistente Hover-, Active- und Disabled-States
- Verbesserte Dark-Mode-Unterstützung für Buttons
- Einheitliche Übergangsanimationen

## 📋 Wie die Spracheingabe funktioniert

### Voraussetzungen
1. **STT API konfigurieren:**
   - Öffnen Sie die Einstellungen (⚙️ Settings)
   - Navigieren Sie zu "Speech-to-Text Einstellungen"
   - Geben Sie ein:
     - STT API URL (z.B. `https://api.openai.com/v1/audio/transcriptions`)
     - STT API Key (Ihr OpenAI API-Schlüssel)
     - Modell (z.B. `whisper-1`)
     - Sprache (optional, z.B. `de` für Deutsch oder leer für automatisch)

2. **Mikrofon-Berechtigung:**
   - Beim ersten Klick auf "🎤 Spracheingabe" wird Ihr Browser nach Mikrofonzugriff fragen
   - Klicken Sie auf "Erlauben" / "Allow"

### Verwendung

1. **Spracheingabe starten:**
   - Öffnen Sie das ARIA-Popup beim Erstellen einer E-Mail
   - Klicken Sie auf "🎤 Spracheingabe" oder drücken Sie `Ctrl+V` (bzw. `Cmd+V` auf Mac)
   - Der Button ändert sich zu "⏹️ Aufnahme stoppen"

2. **Sprechen:**
   - Sprechen Sie Ihre Anweisungen für die KI deutlich ins Mikrofon
   - Die Aufnahme läuft, bis Sie sie manuell stoppen

3. **Aufnahme beenden:**
   - Klicken Sie auf "⏹️ Aufnahme stoppen"
   - Status ändert sich zu "Transkribiere..."
   - Die Audio wird zur STT API gesendet

4. **Ergebnis:**
   - Der transkribierte Text erscheint im Eingabefeld
   - Sie können den Text bei Bedarf noch bearbeiten
   - Klicken Sie auf "📤 Abschicken" um die E-Mail zu generieren

### Tastaturkürzel
- **Spracheingabe starten:** `Ctrl+V` / `Cmd+V`
- **Automatische Antwort:** `Ctrl+A` / `Cmd+A`
- **Abschicken:** `Enter` (im Textfeld)

## 🎨 GUI-Verbesserungen

### Button-Verhalten
- **Hover-Effekt:** Buttons heben sich leicht an und zeigen einen Schatten
- **Active-State:** Buttons zeigen visuelles Feedback beim Klicken
- **Disabled-State:** Deaktivierte Buttons sind ausgegraut und nicht klickbar
- **Konsistente Farben:** Grüne Buttons für Hauptaktionen (Submit, Save)

### Dark Mode
- Vollständige Dark-Mode-Unterstützung
- Angepasste Button-Farben für bessere Lesbarkeit
- Konsistente Schatten und Übergänge

## 🐛 Fehlerbehebung

### "Mikrofonzugriff verweigert"
**Lösung:** 
- Überprüfen Sie die Browser-Einstellungen
- Stellen Sie sicher, dass Thunderbird Mikrofonzugriff hat
- Versuchen Sie, die Berechtigung zurückzusetzen und erneut zu erteilen

### "STT API Fehler"
**Lösungen:**
- Überprüfen Sie Ihre STT API-Einstellungen
- Stellen Sie sicher, dass der API-Key gültig ist
- Testen Sie die Verbindung mit "🧪 STT API testen"
- Überprüfen Sie Ihre Internetverbindung

### "Keine Transkription zurückgegeben"
**Lösungen:**
- Sprechen Sie deutlicher ins Mikrofon
- Überprüfen Sie, ob das richtige Mikrofon ausgewählt ist
- Stellen Sie sicher, dass die Aufnahme ausreichend Audio enthält
- Überprüfen Sie die Sprach-Einstellung in den STT-Einstellungen

## 📊 Vollständige Liste der Änderungen

### Datei: `manifest.json`
- ✅ Mikrofonberechtigung hinzugefügt (`microphone`)
- ✅ `<all_urls>` Permission für API-Aufrufe

### Datei: `modules/stt-recorder.js`
- ✅ Hartcodierte deutsche Texte entfernt
- ✅ i18n-System für alle Fehlermeldungen implementiert
- ✅ Konsistente Fehlerbehandlung

### Datei: `popup.js`
- ✅ Verbesserte Fehlerbehandlung in `handleVoiceInput()`
- ✅ Besseres Benutzer-Feedback während Aufnahme
- ✅ Button-Status-Updates bei Fehlern

### Datei: `style.css`
- ✅ Standardisierte Button-Styles
- ✅ Konsistente Hover/Active/Disabled States
- ✅ Verbesserte Dark-Mode-Unterstützung
- ✅ Einheitliche Übergangsanimationen

### Datei: `locales/de/messages.json`
- ✅ Neuer Schlüssel: `errorNoActiveRecording`

### Datei: `locales/en/messages.json`
- ✅ Neuer Schlüssel: `errorNoActiveRecording`

## ✅ Testen der Implementierung

1. **Mikrofonberechtigung testen:**
   ```
   1. Öffnen Sie ARIA-Popup
   2. Klicken Sie auf "🎤 Spracheingabe"
   3. Erlauben Sie Mikrofonzugriff wenn gefragt
   4. Sprechen Sie einen Testsatz
   5. Klicken Sie auf "⏹️ Aufnahme stoppen"
   6. Überprüfen Sie die Transkription
   ```

2. **Fehlerbehandlung testen:**
   ```
   1. Deaktivieren Sie Mikrofon in Browser-Einstellungen
   2. Versuchen Sie Spracheingabe zu starten
   3. Überprüfen Sie ob eine sinnvolle Fehlermeldung erscheint
   ```

3. **GUI-Konsistenz testen:**
   ```
   1. Hovern Sie über alle Buttons
   2. Klicken Sie auf Buttons
   3. Testen Sie im Light- und Dark-Mode
   4. Überprüfen Sie Disabled-States
   ```

## 📝 Notizen für Entwickler

- Die Spracheingabe nutzt die Browser-native `MediaRecorder` API
- Audio wird als `audio/wav` Blob zur STT API gesendet
- Transkription erfolgt server-seitig über die konfigurierte STT API
- Alle Benutzer-Feedbacks nutzen das i18n-System für Multi-Language-Support

## 🔒 Sicherheit & Datenschutz

- Audio wird NUR an die konfigurierte STT API gesendet
- Keine lokale Speicherung der Audioaufnahmen
- Mikrofonzugriff wird nur während aktiver Aufnahme benötigt
- Stream wird nach Aufnahme automatisch beendet

## 🚀 Empfohlene Nutzung

1. Konfigurieren Sie die STT API in den Einstellungen
2. Testen Sie die Verbindung mit "🧪 STT API testen"
3. Nutzen Sie Spracheingabe für schnelle E-Mail-Anweisungen
4. Kombinieren Sie mit Tastaturkürzeln für maximale Effizienz
5. Verwenden Sie die Autoresponse-Funktion für häufige Antworten

---

**Version:** 1.0.1  
**Datum:** 05.01.2025  
**Status:** ✅ Vollständig geprüft und funktionsfähig
