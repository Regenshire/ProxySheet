# ProxySheet – Photoshop Proxy Layout Tool

> **Layout. Print. Proxy. All in Photoshop.**

ProxySheet is a powerful desktop application and Photoshop scripting engine for laying out and printing high-quality Magic: The Gathering proxy cards. It provides a graphical UI for building layouts, managing configurations, exporting PDFs, and preparing cut-ready Silhouette Studio files.

<img width="1389" height="1197" alt="Image" src="https://github.com/user-attachments/assets/60c760a2-9443-4fb1-88e8-93da118de367" />

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

     ⚠️ When launching ProxySheet.exe for the first time, you may see a Windows SmartScreen warning. Use your best judgement when evaluating any application you download from the internet.

     Click “More info” > “Run anyway” to proceed. This happens because the app is unsigned.

     If you do not want to use the executable, but want to use the application, you can also download the repository and use the bash commands below. NPM install does a vulnerability check of the packages it installs as part of its process.

   - **macOS / Advanced Users**:\
     Clone the repository and run with Node.js:

     ```bash
     git clone https://github.com/Regenshire/MTGPhotoshopLayout.git
     cd MTGPhotoshopLayout
     npm install
     npm start
     ```

1. **Make Sure Photoshop is Installed and Configured**

   - Requires **Adobe Photoshop 2021 or later**
   - Photoshop scripting must be enabled (default is enabled)

1. **Begin Using ProxySheet**

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
  - Custom card sizes by specifying width and height
- **Silhouette Cameo Registration**: Detection registration marks for Silhouette Cameo cutting machine
- **Crop Settings**:
  - Toggle crop marks
  - Customize cut size and offset (mm)
- **Color Adjustments**:
  - Brightness, Contrast, Vibrance, Saturation, Gamma, Whitepoint, Blackpoint can all be controlled in the scripts
  - Cards also receive their own individual Color Adjustment layers for individual adjustment within Photoshop. This feature is excluded for PDF Batch Exports and Image conversions, but is available for single page configs.
- **Back Alignment**:
  - Card Back Offset Support
  - Ability to Prompt for each Card Back
- **PDF Batch Export**:
  - Multipage Batch Export support
  - Supports Card backs for both standard and double-sided cards
  - Double-sided cards are automated by matching the filename of the card with the back cards specified using a [Back] or {Back} tag in the filename. For example: If you have "The Kami War {227}.jpg" and "The Kami War {227} [Back].jpg" in the same folder, it will detect this as a double-sided card with the Back being the file with [Back] in the name.
  - Allows you to select a back for all non-double-sided cards
  - Supports excluding Back images by selecting the No Back Images option
  - Supports combined or seperate files for fronts and backs
- **Notes & Metadata**:
  - Add printed notes to sheet
  - Embed batch number visually in card lower right corner

---

## 📝 PDF Batch Export

ProxySheet includes a powerful **Batch Export system** designed for high-volume printing of proxies. Instead of building a single layout manually, you can automatically split dozens or hundreds of card images into multiple pages — and generate print-ready PDFs in one pass. Adobe Photoshop does not natively support multi-page workflows. This batch system creates each page in Adobe Photoshop (allowing for adjustment layers) and then outputs them as individual PDF files. It then merges those files together into a single document.

The PDF Batch Export system supports double-sided cards. It identifies these cards when it searches the folder and detects two cards with the same name, but one with a [Back] or {Back} tag in the filename. For example, if you have "The Kami War {227}.jpg" and "The Kami War {227} [Back].jpg" in the same folder, it will detect this as a double-sided card with the back of the card being the file with [Back] in the name. The Batch system seperates Double-Sided cards into their own sheets for printing convenience.

### 🚀 How It Works

1. **Enable Batch Export**

   - On the **Create** tab, check `Multipage Batch Export`

2. **Select Card Folder**

   - You'll be prompted to choose a folder of card images.
   - ProxySheet automatically groups them into sheets based on your selected layout and paper size.

3. **Back Side Options**

   - Choose whether to use a **single back image** or **per-card backs**.
   - You can also enable `No Back Images` if printing fronts only.

4. **Run Batch**

   - ProxySheet creates `.jsx` scripts for each sheet (front and optional back)
   - These are executed in Photoshop automatically
   - Progress is tracked in real-time via a **Processing Overlay** with sentinel status

5. **PDF Merging**

   - Once Photoshop has generated all the pages, ProxySheet merges them into one or more PDFs:
     - 📜 `ProxySheet_Batch_001_Combined.pdf` — interleaved front/back
     - 📜 `ProxySheet_Batch_001_Front.pdf` and `_Back.pdf` — if separate export is enabled

6. **Output Location**

   - Final PDFs are saved to the `/PDFOutput/` folder
   - Temporary files are cleaned automatically

### ⚙️ Export Configuration Options

| Option                             | Description                                   |
| ---------------------------------- | --------------------------------------------- |
| `Multipage Batch Export`           | Enables batch splitting                       |
| `No Back Images`                   | Skips back side entirely                      |
| `Separate PDFs for Front and Back` | Produces two files instead of one interleaved |
| `Enable Silhouette Registration`   | Adds support for Silhouette cutting machines  |
| `Show Crop/Cut Marks`              | Adds corner alignment markers for trimming    |
| `Offset X/Y (Back)`                | Adjusts back alignment for duplex printers    |

### ✅ Benefits

- Fully automated page splitting for **hundreds of proxies**
- Optimized layouts based on card format, paper size, and layout style
- Accurate **front-to-back alignment** for duplex printing
- Optional cut marks and white notes for manual trimming
- Output is fully **print-shop ready**

### 📌 Results

Here is an example of a traditional 9 card Letter batch with both front and back.
<img width="1878" height="1217" alt="Image" src="https://github.com/user-attachments/assets/dbfcef78-b469-4635-9b99-a3d2d4c5841a" />

Here is an example of a 7 card letter layout for Silhouette with the selected card back. The seven card layout reduces cutting errors by giving space around the left most registration marks.
<img width="2075" height="805" alt="Image" src="https://github.com/user-attachments/assets/7f9276dc-704e-40ea-8bd3-b7f1679c1619" />

Here is an example of a 7 card letter layout for Silhouette for douhle sided cards. Both of these sets of sheets came from the same batch. The batch seperated the double-sided cards into their own segment of pages.
<img width="2074" height="804" alt="Image" src="https://github.com/user-attachments/assets/ee2230b8-ae0b-4e20-b9b6-4ea2ac443499" />

---

## ✂️ Silhouette Studio Support

- Launch `.studio3` files from the **Silhouette** tab
- Edit and sort templates with metadata (Title, Description, Tags, Order)
- Ready-to-cut files for SevenCard and normal eight card layouts, supports both MPC and No Bleed cards. Additional templates will be added in the future.
- Requires the Silhouette Studio software to use

<img width="1389" height="1196" alt="Image" src="https://github.com/user-attachments/assets/d03adbc6-f54b-46a2-97b6-f2e8d5cee0d1" />

<img width="1938" height="1352" alt="Image" src="https://github.com/user-attachments/assets/031d3e82-2e87-43b6-b2fb-d095d947efbb" />

---

## 🔄 Image Conversion Tool

Accessed via the **Tools** tab, the Image Conversion tool allows users to convert a directory of cards to a consistent format of cards with a bleed if it does not have one, as well as applying Color Correction adjustments to each card. Options include:

- DPI rescaling
- Format conversion (JPG, PNG)
- Optional black bleed padding (for NoBleed prep)
- Color correction adjustments (brightness, contrast, etc.)

<img width="1392" height="1197" alt="Image" src="https://github.com/user-attachments/assets/63d639ef-1aa1-47bd-bf88-a8d74eab76db" />

---

## 🛠️ Advanced Features

- Exclude Slots: Hide specific card slots on a sheet by number.
- Slot Reuse Cache: Optimizes layer usage during export for speed.
- Back Offsets: Supports X/Y offset shifting for card backs (manual duplex alignment).
- Sheet Adjustments: The sheet has adjustment layers that can be applied for color/brightness/contrast control.
- Dynamic Adjustments: Each card can optionally receive per-card adjustment layers.
- Auto Batch Numbering: Each export is timestamped and saved under batchHistory.

---

## TROUBLESHOOTING

### What to do when you click Run Now it does not open Photoshop and gives an error from another application such as Adobe Illustrator.

This means that your system does not have Adobe Photoshop set as the default application for opening .jsx. .JSX files are Extendscript files that run scripting in Adobe Photoshop. These are the heart of how ProxySheet works and they need to be opened by Photoshop. Here are instructions for setting Adobe Photshop as the default application for .jsx files.

#### For Windows

1. Locate a JSX file: Open File Explorer and go to the installation folder for ProxySheet and go to the \app\USER_CONFIGS\MPC Bleed subfolder.
2. Right-click on one of the .jsx files there and choose "Open With" from the context menu.
3. Choose "Photoshop":
4. If Photoshop appears in the list, select it. If it's not listed, click "Choose another app" (or similar). You may need to click "More apps" at the bottom of the list and then scroll to find Photoshop or navigate to the Photoshop executable file.
5. Check "Always use this app to open .jsx files": Make sure the checkbox for "Always use this app to open .jsx files" is checked. This ensures that all future JSX files will open in Photoshop by default.
6. Click "OK": Click OK to save the changes.

#### For Mac

1. Locate a JSX file: Open Finder and find a .jsx file on your computer.
2. Right-click and choose "Get Info": Right-click (or Control-click) on the JSX file and choose "Get Info" from the context menu.
3. Expand "Open with": In the Info window, expand the "Open with" section if it's not already open.
4. Choose "Photoshop": Select the most recent version of Photoshop installed on your computer from the dropdown menu.
5. Click "Change All": Click "Change All" to apply this setting to all .jsx files on your Mac.
6. Click "Continue": When prompted, click "Continue" to confirm the change.
7. Close the Info window: Close the Info window by clicking the red "x" icon in the top left corner.

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
