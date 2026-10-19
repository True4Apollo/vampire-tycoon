# Vampire Tycoon – Blut von Nebelhain (v2.0)
Idle-Tycoon (deutsch), PWA + Capacitor-ready. Alle Figuren, Orte und Assets sind frei erfunden bzw. selbst erstellt.

## Lokal starten
    python3 -m http.server 8080   # dann http://localhost:8080

## Tests (Headless Chrome)
    npm i puppeteer-core && node tests/e2e.js   # erwartet einen Server auf :8765

## iOS / App Store
    npm install
    npm run build          # kopiert Web-Dateien nach www/
    npx cap add ios
    npx cap sync && npx cap open ios   # Xcode: Signing, Icons, Build → TestFlight
Vor dem Release: appId in capacitor.config.json ändern (z. B. de.deinname.vampiretycoon).
