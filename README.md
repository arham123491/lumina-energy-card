# Lumina Energy Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
![Version](https://img.shields.io/badge/version-1.1.21-blue.svg)

Limuna Energy Card repository is <https://github.com/ratava/lumina-energy-card>.

![Lumina Energy Card Background](dist/lumina_background.jpg)

[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg?style=for-the-badge&logo=paypal)](https://www.paypal.me/giorgiosalierno)


**Language / Lingua / Sprache:** [English](#english) | [Italiano](#italiano) | [Deutsch](#deutsch)

---

## Quick Install (Custom HACS Repository)

1. Open HACS in Home Assistant and choose **Frontend**.
1. Click the three-dot menu and select **Custom repositories**.
1. Paste `https://github.com/ratava/lumina-energy-card`, set the category to **Frontend**, and click **Add**.
1. Close the dialog, locate **Lumina Energy Card** in the Frontend list, and install it.
1. Restart Home Assistant if requested, then add the card from the Lovelace visual editor.

---

## English

### Overview (EN)

Lumina Energy Card is a Home Assistant custom Lovelace card that renders animated energy flows, aggregates PV strings and batteries, and surfaces optional EV charging metrics in a cinematic layout.

### Key Features (EN)

- Up to six PV sensors with smart per-string or totalised labels
- Up to four battery systems with SOC averaging and liquid-fill battery visualisation
- Animated grid, load, PV, battery and EV flows with dynamic colour, speed, and selectable dash/dot/arrow styles
- Configurable grid animation threshold (default 100 W) to suppress low-level import/export chatter
- Adjustable animation speed multiplier (-3x to 3x, default 1x, pause/reverse supported) and per-flow visibility thresholds
- Optional EV panel with power and SOC display, configurable colour, and typography
- Daily production badge plus full typography controls for header, PV, battery, load, grid, and EV text
- Load warning/critical colour overrides and a configurable low SOC threshold for the battery liquid fill
- Update interval slider (0–60 s, default 30 s) with optional real-time refresh when set to 0

### Installation (EN)

#### HACS (EN)

1. Open HACS in Home Assistant and choose **Frontend**.
1. Use the three-dot menu → **Custom repositories**.
1. Enter `https://github.com/ratava/lumina-energy-card`, pick **Frontend**, and click **Add**.
1. Locate **Lumina Energy Card** under Frontend and click **Install**.
1. Restart Home Assistant if prompted.

#### Manual Installation (EN)

1. Download `dist/lumina-energy-card.js` from the [latest release](https://github.com/ratava/lumina-energy-card/releases).
1. Copy the file to `/config/www/community/lumina-energy-card/`.
1. Place `dist/lumina_background.jpg` in the same directory.
1. Add the Lovelace resource:

```yaml
lovelace:
  resources:
    - url: /local/community/lumina-energy-card/lumina-energy-card.js
      type: module
```

1. Restart Home Assistant to load the resource.

### Configuration (EN)

1. Edit your dashboard and click **Add Card**.
1. Search for **Lumina Energy Card**.
1. Fill in the fields using the entity pickers and switches.
1. Adjust the **Update Interval** slider to control refresh cadence.

Minimal YAML example:

```yaml
type: custom:lumina-energy-card
sensor_pv1: sensor.solar_production
sensor_daily: sensor.daily_production
sensor_bat1_soc: sensor.battery_soc
sensor_bat1_power: sensor.battery_power
sensor_home_load: sensor.home_consumption
sensor_grid_power: sensor.grid_power
background_image: /local/community/lumina-energy-card/lumina_background.jpg
```

### Options (EN)

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `card_title` | string | `LUMINA ENERGY` | Optional header text |
| `background_image` | string | `/local/community/lumina-energy-card/lumina_background.jpg` | Background asset path |
| `language` | string | `en` | Accepts `en`, `it`, or `de` |
| `display_unit` | string | `kW` | Display values in `W` or `kW` |
| `update_interval` | number | `30` | Refresh cadence (0–60, step 5; 0 disables throttling) |
| `animation_speed_factor` | number | `1` | Flow animation multiplier (-3–3, 0 pauses, negatives reverse) |
| `animation_style` | string | `dashes` | Flow animation motif (`dashes`, `dots`, `arrows`) |
| `header_font_size` | number | `16` | Typography for the header (12–32 px) |
| `pv_font_size` | number | `16` | Typography for PV text (12–28 px) |
| `battery_soc_font_size` | number | `20` | Typography for SOC label (12–32 px) |
| `battery_power_font_size` | number | `14` | Typography for battery power (10–28 px) |
| `load_font_size` | number | `15` | Typography for load label (10–28 px) |
| `grid_font_size` | number | `15` | Typography for grid label (10–28 px) |
| `car_power_font_size` | number | `15` | Typography for EV power (10–28 px) |
| `car_soc_font_size` | number | `12` | Typography for EV SOC (8–24 px) |
| `daily_label_font_size` | number | `12` | Typography for the daily label (8–24 px) |
| `daily_value_font_size` | number | `20` | Typography for the daily total (12–32 px) |
| `sensor_pv_total` | entity | — | Optional aggregate PV production sensor |
| `show_pv_strings` | boolean | `false` | Display combined total plus each PV string |
| `sensor_pv1` | entity | — | Primary PV sensor (required) |
| `sensor_daily` | entity | — | Daily production sensor (required) |
| `sensor_bat1_soc` | entity | — | Battery SOC sensor (required) |
| `sensor_bat1_power` | entity | — | Battery power sensor (required) |
| `sensor_home_load` | entity | — | Home load sensor (required) |
| `sensor_grid_power` | entity | — | Grid import/export sensor (required) |
| `sensor_grid_import` | entity | — | Optional import-only sensor (positive values) |
| `sensor_grid_export` | entity | — | Optional export-only sensor (positive values) |
| `pv_primary_color` | string | `#0080ff` | PV 1 flow animation colour |
| `pv_secondary_color` | string | `#80ffff` | PV 2 flow animation colour |
| `load_flow_color` | string | `#0080ff` | Home load flow animation colour |
| `load_threshold_warning` | number | — | Load warning threshold (W or kW based on display unit) |
| `load_warning_color` | string | `#ff8000` | Load warning colour (orange) |
| `load_threshold_critical` | number | — | Load critical threshold (W or kW based on display unit) |
| `load_critical_color` | string | `#ff0000` | Load critical colour (red) |
| `battery_charge_color` | string | `#00FFFF` | Battery charge flow colour (cyan) |
| `battery_discharge_color` | string | `#FFFFFF` | Battery discharge flow colour (white) |
| `grid_import_color` | string | `#FF3333` | Grid import flow colour (red) |
| `grid_export_color` | string | `#00ff00` | Grid export flow colour (green) |
| `car_flow_color` | string | `#00FFFF` | EV flow animation colour (cyan) |
| `battery_fill_high_color` | string | `#00ffff` | Battery liquid fill colour when SOC is above low threshold (cyan) |
| `battery_fill_low_color` | string | `#ff0000` | Battery liquid fill colour when SOC is at or below low threshold (red) |
| `battery_fill_low_threshold` | number | `25` | SOC percentage where the battery liquid switches to the low colour |
| `grid_activity_threshold` | number | `100` | Minimum absolute grid power (W) before grid flow animates |
| `grid_threshold_warning` | number | — | Trigger warning colour when grid magnitude meets this value (W or kW) |
| `grid_warning_color` | string | `#ff8000` | Grid warning colour (orange) |
| `grid_threshold_critical` | number | — | Trigger critical colour when magnitude meets this value (W or kW) |
| `grid_critical_color` | string | `#ff0000` | Grid critical colour (red) |
| `invert_grid` | boolean | `false` | Flip grid sign if needed |
| `sensor_car_power` | entity | — | Optional EV charging power |
| `sensor_car_soc` | entity | — | Optional EV SOC sensor |
| `show_car_soc` | boolean | `false` | Show Electric Vehicle panel (power and SOC) |
| `car_pct_color` | string | `#00FFFF` | EV SOC text colour |

### Background & Troubleshooting (EN)

- Default background: `/local/community/lumina-energy-card/lumina_background.jpg` (copy your image next to the JS file to customise).
- Recommended dimensions: 800×450 (16:9).
- Missing card: ensure the resource entry exists and clear browser cache.
- Zero readings: confirm entity IDs and sensor availability.
- Editor lag: increase `update_interval` or reduce dashboard refresh load.

### Support & License (EN)

- License: MIT (see [LICENSE](LICENSE)).
- Issues & feature requests: submit via [GitHub](https://github.com/ratava/lumina-energy-card).

### Changelog (EN)

- **1.1.20 (2025)** – Tuned arrow animation scaling, added grid animation threshold, EV panel toggle, and documentation refresh.
- **1.1.18 (2025)** – Added selectable flow animation styles (dashes, dots, arrows) and refreshed documentation.
- **1.1.13 (2025)** – Added smooth flow duration easing with dynamic rate scaling, cleanup guards, and a 0s update interval option for real-time refresh.
- **1.1.1 (2025)** – Polished localisation text and prepped packaging for the single-file release.
- **1.1.0 (2025)** – Localised the Lovelace editor labels/helpers for English, Italian, and German while keeping the single-file distribution.
- **1.0.8 (2025)** – Converted typography controls to simple text inputs alongside EV settings for quicker edits.
- **1.0.7 (2025)** – Restored typography controls inside the new form-based editor layout.
- **1.0.5 (2025)** – Rebuilt the Lovelace editor with Home Assistant form selectors so entity pickers and sliders update config instantly.
- **1.0.4 (2025)** – Merged the editor into the main bundle, added localized configuration tabs, and moved typography controls into their own tab.
- **1.0.3 (2025)** – Added animation speed scaling, typography sliders, and inline entity examples in the editor.
- **1.0.2 (2025)** – Update to base code.
- **1.0.1 (2025)** – Moved distributable files into `dist/` and aligned manual install docs with new filenames.

---

## Italiano

### Panoramica (IT)

Lumina Energy Card è una scheda Lovelace per Home Assistant che offre grafica animata dei flussi energetici, gestione di stringhe FV multiple, batterie e monitor EV opzionale in un'unica interfaccia.

### Funzionalità Chiave (IT)

- Fino a 6 sensori fotovoltaici con etichettatura intelligente
- Fino a 4 batterie con media SOC e visualizzazione liquida 3D
- Flussi animati con colori dinamici e stili selezionabili (tratteggi, punti, frecce) per rete, casa, FV, batterie ed EV
- Soglia di attivazione configurabile per i flussi di rete (default 100 W) per nascondere import/export minimi
- Soglie avviso/emergenza import-export allineate all'unità di visualizzazione (W/kW)
- Moltiplicatore di velocità per regolare le animazioni dei flussi (-3x a 3x, default 1x, pausa/inversione)
- Pannello EV opzionale con potenza e SOC personalizzabili
- Badge produzione giornaliera, titolo, sfondo e unità configurabili
- Colori di avviso/critico per il carico e soglia SOC bassa della batteria configurabile per il riempimento
- Controlli tipografici per titolo, FV, batterie, carichi, rete ed EV
- Slider intervallo aggiornamento (0–60 s) con refresh continuo se impostato a 0

### Installazione HACS (IT)

1. Apri HACS → **Frontend**.
1. Menu a tre puntini → **Repository personalizzati**.
1. Inserisci `https://github.com/ratava/lumina-energy-card`, seleziona **Frontend** e premi **Aggiungi**.
1. Installa **Lumina Energy Card** dalla sezione Frontend.
1. Riavvia Home Assistant se richiesto.

### Installazione Manuale (IT)

1. Scarica `dist/lumina-energy-card.js` dall'[ultima release](https://github.com/ratava/lumina-energy-card/releases).
1. Copia il file in `/config/www/community/lumina-energy-card/`.
1. Copia `dist/lumina_background.jpg` nella stessa cartella.
1. Aggiungi la risorsa Lovelace come mostrato nella sezione inglese.
1. Riavvia Home Assistant.

### Configurazione Rapida (IT)

- Aggiungi la scheda tramite editor visivo e seleziona le entità con gli entity picker.
- YAML minimo:

```yaml
type: custom:lumina-energy-card
sensor_pv1: sensor.produzione_solare
sensor_daily: sensor.produzione_giornaliera
sensor_bat1_soc: sensor.batteria_soc
sensor_bat1_power: sensor.batteria_potenza
sensor_home_load: sensor.consumo_casa
sensor_grid_power: sensor.potenza_rete
background_image: /local/community/lumina-energy-card/lumina_background.jpg
```

### Suggerimenti (IT)

- Obbligatori: `sensor_pv1`, `sensor_daily`, `sensor_bat1_soc`, `sensor_bat1_power`, `sensor_home_load`, `sensor_grid_power`.
- Per uno sfondo personalizzato copia l'immagine nella stessa cartella del JS e aggiorna `background_image`.
- Imposta `invert_grid: true` se i valori di rete risultano invertiti.

---

## Deutsch

### Überblick (DE)

Die Lumina Energy Card zeigt animierte Energieflüsse in Home Assistant, unterstützt mehrere PV-Stränge, Batteriespeicher und eine optionale EV-Anzeige.

### Wichtige Funktionen (DE)

- Bis zu 6 PV-Sensoren mit intelligenter Beschriftung
- Bis zu 4 Batteriesysteme mit SOC-Durchschnitt und kombiniertem Leistungswert
- Animierte Leitungen für Netz, Haus, PV, Batterie und EV mit Farbcodierung, Geschwindigkeitsregelung und wählbaren Strich/Punkt/Pfeil-Stilen
- Konfigurierbare Netzfluss-Animationsschwelle (Standard 100 W) blendet minimale Import/Exportwerte aus
- Warn- und kritische Import/Export-Schwellenwerte passen sich automatisch an die gewählte Anzeigeeinheit (W/kW) an
- Einstellbarer Animationsfaktor für schnellere oder langsamere Flussvisualisierung (-3x bis 3x, Standard 1x, Pause/Rücklauf)
- Optionales EV-Panel inklusive SOC-Farbe
- Tagesertrag, Kartentitel, Hintergrund und Einheiten anpassbar
- Warn- und kritische Lastfarben sowie ein konfigurierbarer niedriger SOC-Schwellwert fuer die Batteriefuellung
- Typografie-Regler für Titel, PV, Batterie, Last, Netz und EV-Text
- Update-Intervall-Regler (0–60 s) ermöglicht Live-Refresh bei 0 s

### Installation HACS (DE)

1. Öffne HACS und wähle **Frontend**.
1. Dreipunkt-Menü → **Benutzerdefinierte Repositories**.
1. Trage `https://github.com/ratava/lumina-energy-card` ein, wähle **Frontend** und klicke **Hinzufügen**.
1. Installiere **Lumina Energy Card** aus Frontend.
1. Starte Home Assistant bei Bedarf neu.

### Manuelle Installation (DE)

1. Lade `dist/lumina-energy-card.js` aus dem [aktuellen Release](https://github.com/ratava/lumina-energy-card/releases).
1. Kopiere die Datei nach `/config/www/community/lumina-energy-card/`.
1. Lege `dist/lumina_background.jpg` im selben Ordner ab.
1. Ergänze die Lovelace-Ressource wie im englischen Abschnitt.
1. Starte Home Assistant neu.

### Schnelle Konfiguration (DE)

- Karte über den visuellen Editor hinzufügen und Entitäten wählen.
- Minimales YAML:

```yaml
type: custom:lumina-energy-card
sensor_pv1: sensor.pv_leistung
sensor_daily: sensor.pv_tagessumme
sensor_bat1_soc: sensor.batterie_soc
sensor_bat1_power: sensor.batterie_leistung
sensor_home_load: sensor.hausverbrauch
sensor_grid_power: sensor.netzleistung
background_image: /local/community/lumina-energy-card/lumina_background.jpg
```

### Hinweise (DE)

- Pflichtwerte: PV1, Daily, Batterie SOC/Power, Hauslast, Netzleistung.
- Für eigene Hintergründe Bild neben die JS-Datei kopieren und `background_image` anpassen.
- Bei invertierten Netz-Werten `invert_grid: true` setzen.

---

## Repository Details

- `hacs.json` declares the card as a frontend resource (`content_in_root: false`) and points to `dist/lumina-energy-card.js`.
- `.github/workflows/hacs-validation.yml` runs the official HACS validation action on pushes, pull requests, and manual triggers.
- `CODEOWNERS` registers @Giorgio866 and @ratava as maintainers for automated reviews.
- The project is released under the MIT License (see [LICENSE](LICENSE)).

---

© 2025 ratava, Giorgio866, and contributors. Released under the MIT License.
