# Changelog

All notable changes to ProxySheet are documented in this file. This changelog follows semantic versioning when possible and includes both UI and scripting engine changes.

---

## [1.03 BETA] – 2025-07-21

- Added catches for size overruns of images
- Added additional logging for Photoshop scripting to help diagnose issues

---

## [1.02 BETA] – 2025-07-20

- Bug fix

---

## [1.01 BETA] – 2025-07-20

- Minor updates to the Silhouette registration marks
- Added a favicon

---

## [1.00 BETA] – 2025-07-19

- Initial public release
- Renamed application to **ProxySheet – Photoshop Proxy Layout Tool**
- Brand new Electron-based graphical user interface (GUI)
- Fully integrated UI with support for:
  - Create tab for layout design
  - Saved Configs tab with folder sorting and metadata
  - Batch PDF export options (separate/combined)
  - Silhouette Studio template manager
  - History tab with rerunnable batch scripts
  - Tools tab for DPI and format conversion

---

## [5.10] – 2025-07-15

- SevenCard layout: full backside mirroring for duplex printing
- `selectEachCard = true` prompts for custom back image per card
- PDF export support added with `outputPDF = true`
  - Files saved to `/PDFOutput/`
  - `pdfExportPreset` allows print quality control

---

## [5.00] – 2025-07-15

- Added **SevenCard** layout for improved Silhouette registration
- Introduced batch history system:
  - `batchHistory = true` saves scripts and image paths
  - Rerunnable via History tab or Photoshop
  - Batch number printed on card (optional)
- New Silhouette Studio template: `Seven Card.studio3`

---

## [4.20] – 2025-07-14

- Added card export tool (JPG/PNG, bleed/no bleed)
- Convert MPC ↔ NoBleed format
- Supports DPI rescaling

---

## [4.10] – 2025-07-12

- Added support for back printing offsets:
  - `backOffsetXmm`, `backOffsetYmm`
- Included example config for Epson ET8500 printer

---

## [4.00] – 2025-07-11

- Separated logic into `RE_HelperFunctions.jsx`
- Added default fallback values for safer config execution
- Introduced `NoBleed` card support for trimmed cards (e.g. Scryfall)
- Added `excludeCardSlots` config variable
- Native crop mark rendering (removed static overlays)
- `addPerCardAdjustLayer = false` disables per-card layers

---

## [3.30] – 2025-07-10

- Multi-file scripting architecture
- Silhouette Cameo v5 support refined
- Print Note functionality added for documentation
- Added new Silhouette Studio template v3.3

---

## [2.50] – 2025-07-07

- Initial Silhouette Cameo support
- Added page sizing controls and auto-centering
- Added Silhouette-aware templates

---

## [2.00] – 2025-07-06

- Added layout toggle (vertical/horizontal)
- Switched to per-card crop marks (replaced full overlay)
