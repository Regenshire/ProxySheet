# ProxySheet – Photoshop Proxy Layout Tool

> **Layout. Print. Proxy. All in Photoshop.**

ProxySheet is a powerful desktop application and Photoshop scripting engine for laying out and printing high-quality Magic: The Gathering proxy cards. It provides a graphical UI for building layouts, managing configurations, exporting PDFs, and preparing cut-ready Silhouette Studio files.

---

## Requirements

- **Operating System**: Windows 10/11 or macOS 12+
- **Photoshop**: Adobe Photoshop 2021 or later (tested with 2023+)
- **Setup Notes**:
  - Photoshop scripting must be enabled
  - Extract the full release zip and keep the files together

---

## Getting Started

1. **Download and Run ProxySheet**

   - **Windows Users (Recommended)**:\
     Download the latest release `.zip` from the [Releases](https://github.com/Regenshire/MTGPhotoshopLayout/releases) page.\
     Extract it and double-click:

     ```
     ProxySheet.exe
     ```

   - **macOS / Advanced Users**:\
     Clone the repository and run with Node.js:

     ```bash
     git clone https://github.com/Regenshire/MTGPhotoshopLayout.git
     cd MTGPhotoshopLayout
     npm install
     npm start
     ```

2. **Make Sure Photoshop is Installed and Configured**

   - Requires **Adobe Photoshop 2021 or later**
   - Photoshop scripting must be enabled (default is enabled)

3. **Begin Using ProxySheet**

   - Use the **Create** tab to build new layouts
   - Use **Configs** to run and manage saved settings
   - Press **Run Now** to generate and launch the script in Photoshop

---

## 🧭 Key Functional Tabs

- **Create**: Design custom layout configurations with full control over page size, layout style, card format, cut marks, color adjustments, and back alignment.
- **Configs**: Browse saved scripts by folder, search, sort, and rerun or edit existing setups.
- **History**: Re-run exact config batches with saved image paths and settings. [BETA FEATURE - Does not work for PDF Batches]
- **Silhouette**: Launch `.studio` or `.studio3` cutting templates. Edit and tag metadata for searchability. Only have Letter and A4 templates currently built. Have 8 card and 7 card layouts. The 7 card layout reduces detection errors and improves cut reliability.
- **Tools**: Convert images (format, DPI, bleed), apply color adjustments, and prepare proxy-ready assets.

---

## ⚙️ Configuration Features

- **Layout**: Horizontal (2x4), Vertical (3x3), SevenCard
- **Paper Size**: Letter, A4, A3, Legal, Tabloid, or Custom
- **Card Format**:
  - MPC (with bleed)
  - NoBleed (Scryfall-style trimmed cards)
- **Silhouette Registration**: Detection registration marks for Silhouette Cameo cutting machine
- **Crop Settings**:
  - Toggle crop marks
  - Customize cut size and offset (mm)
- **Color Adjustments**:
  - Brightness, Contrast, Vibrance, Saturation
  - Gamma, Whitepoint, Blackpoint
- **Notes & Metadata**:
  - Add printed notes to sheet
  - Embed batch number visually in card lower right corner

---

## 🔄 Image Conversion Tool

Accessed via the **Tools** tab, it allows:

- DPI rescaling
- Format conversion (JPG, PNG)
- Optional black bleed padding (for NoBleed prep)
- Color correction adjustments (brightness, contrast, etc.)

---

## ✂️ Silhouette Studio Integration

- Launch `.studio3` files from the **Silhouette** tab
- Edit and sort templates with metadata (Title, Description, Tags, Order)
- Ready-to-cut files for SevenCard and normal eight card layouts, supports both MPC and No Bleed cards

---

## 🛠️ Advanced Features

- Exclude Slots: Hide specific card slots on a sheet by number.
- Slot Reuse Cache: Optimizes layer usage during export for speed.
- Back Offsets: Supports X/Y offset shifting for card backs (manual duplex alignment).
- Sheet Adjustments: The sheet has adjustment layers that can be applied for color/brightness/contrast control.
- Dynamic Adjustments: Each card can optionally receive per-card adjustment layers.
- Auto Batch Numbering: Each export is timestamped and saved under batchHistory.

---

## 📘 License

MIT License

---

## 👤 Author

Created by [Regenshire](https://github.com/Regenshire)\
Feedback and contributions are welcome!

---

## 📌 Links

- [GitHub Repo](https://github.com/Regenshire/MTGPhotoshopLayout)
- [Submit Issues](https://github.com/Regenshire/MTGPhotoshopLayout/issues)

---

## 📋 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for the full changelog and release history.
