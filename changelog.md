# Changelog

All notable changes to ProxySheet are documented in this file. This changelog follows semantic versioning when possible and includes both UI and scripting engine changes.

---

## [1.08 BETA] – 2025-08-07

- Added support for large UV Printers in the form of a Grid (5x23, 115 Cards) layout.
- Added Card Gap functionality to add gaps between cards (non-Silhouette prints)
- Added a Crop Bleed (mm) field to allow a user to specify a crop of the bleed to reduce how much bleed is printed (non-Silhouette prints)
- Renamed the Cut Mark fields and set those fields to be hidden when not using Cut Marks
- Added support for single back selection when doing back only pages so you can choose one back and have it apply to all card slots
- Added Horizontal (Auto) & Vertical (Auto) layouts. These layouts automatically adjust based on your paper size, allowing for custom paper sizes where we don't have pre-built layouts. These layouts are currently only available when not using Silhouette since Silhouette requires very precise layouts to work with provided templates.
- Added support for inputting Page Width and Height in either MM or Inches.
- Updated the layout with two column sections to reduce required screen real estate.
- Fixed various bugs related to opening the application and loading previous values

---

## [1.07 BETA] – 2025-08-01

- Added an Adjument Measurement Tool to ProxySheet. This helps with configuring adjustments for back alignment.

---

## [1.06 BETA] – 2025-07-30

- Tested and made adjustments to the new LEGAL Sized Vertical Layout for Silhouette cutting called Silhouette Legal (10-Card).
- Added corrected support for mirrored back cards to the Silhouette Legal (10-Card) layout.

---

## [1.05 BETA] – 2025-07-27

- Added a new LEGAL Sized Vertical Layout for Silhouette cutting called Silhouette Legal (10-Card). This new layout allows for the placement of 10 cards on a legal sized piece of paper with Silhouette marks. The cards are layouted with two horizontal rows and 2 vertical rows to allow for fitting 10 cards on the sheet and providing space for the Silhouette marks.
- Added additional logging
- Added an Other Scripts folder for additional tools
- Added a get_Expansion.py script for downloading deck lists based on a MTG Expansion codes

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
