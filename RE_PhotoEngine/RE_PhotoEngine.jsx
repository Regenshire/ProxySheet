// === REGEN PHOTOSHOP MTG PRINT LAYOUT ENGINE v5.1 ===
// --- This file contains the code for the script.  The Config scripts must use an #include to this script to operate

// === SAFETY: Fallback Defaults for Missing Config Variables ===
// Page/Layout defaults
if (typeof pageWidthInches === "undefined" || pageWidthInches === "") pageWidthInches = 8.5;
if (typeof pageHeightInches === "undefined" || pageHeightInches === "") pageHeightInches = 11;
if (typeof layout === "undefined" || layout === "") layout = "horizontal";
if (typeof cardFormat === "undefined" || cardFormat === "") cardFormat = "MPC";
if (typeof cardBack === "undefined" || cardBack === "") cardBack = false;
if (typeof backOffsetXmm === "undefined" || backOffsetXmm === "") backOffsetXmm = 0.0;
if (typeof backOffsetYmm === "undefined" || backOffsetYmm === "") backOffsetYmm = 0.0;
if (typeof selectEachCard === "undefined" || selectEachCard === "") selectEachCard = false;
if (typeof paperType === "undefined" || paperType === "") paperType = "Custom";

// === Apply Format Presets If cardFormat is Specified ===
if (cardFormat === "MPC") {
    if (typeof cardWidthMM === "undefined" || cardWidthMM === "") cardWidthMM = 69;
    if (typeof cardHeightMM === "undefined" || cardHeightMM === "") cardHeightMM = 94;
    if (typeof cutOffset === "undefined" || cutOffset === "") cutOffset = 3.04;
    if (typeof cutMarkSize === "undefined" || cutMarkSize === "") cutMarkSize = 4.5;
    if (typeof showCropMarks === "undefined" || showCropMarks === "") showCropMarks = true;
    if (typeof cardGap === "undefined" || cardGap === "") cardGap = 0.00;
    if (typeof cropBleed === "undefined" || cropBleed === "") cropBleed = 0.00;
} else if (cardFormat === "NoBleed") {
    if (typeof cardWidthMM === "undefined" || cardWidthMM === "") cardWidthMM = 63;
    if (typeof cardHeightMM === "undefined" || cardHeightMM === "") cardHeightMM = 88;
    if (typeof cutOffset === "undefined" || cutOffset === "") cutOffset = 1.0;
    if (typeof cutMarkSize === "undefined" || cutMarkSize === "") cutMarkSize = 4.5;
    if (typeof showCropMarks === "undefined" || showCropMarks === "") showCropMarks = true;
    if (typeof cardGap === "undefined" || cardGap === "") cardGap = 0.00;
    if (typeof cropBleed === "undefined" || cropBleed === "") cropBleed = 0.00;
}

// Card dimensions / DPI
if (typeof cardWidthMM === "undefined") cardWidthMM = 69;
if (typeof cardHeightMM === "undefined") cardHeightMM = 94;
if (typeof dpi === "undefined") dpi = 800;

// Bleed / Cut settings
if (typeof cutMarkSize === "undefined") cutMarkSize = 4.5;
if (typeof cutOffset === "undefined") cutOffset = 3.04;
if (typeof showCropMarks === "undefined") showCropMarks = true;

// Silhouette & Image Adjustments
if (typeof useSilhouette === "undefined") useSilhouette = false;
if (typeof excludeCardSlots === "undefined") excludeCardSlots = "";
if (typeof adjustmentMeasureSheet === "undefined") adjustmentMeasureSheet = false;

// Notes
if (typeof notesOn === "undefined") notesOn = false;
if (typeof noteFontSize === "undefined") noteFontSize = 9;
if (typeof manualNote === "undefined") manualNote = "";

// Color Adjustments
if (typeof bright === "undefined" || bright === "") bright = 0;
if (typeof contr === "undefined" || contr === "") contr = 0;
if (typeof vib === "undefined" || vib === "") vib = 0;
if (typeof sat === "undefined" || sat === "") sat = 0;
if (typeof gmm === "undefined" || gmm === "") gmm = 1.0;
if (typeof whitepoint === "undefined" || whitepoint === "") whitepoint = 255;
if (typeof blackpoint === "undefined" || blackpoint === "") blackpoint = 0;
if (typeof addPerCardAdjustLayer === "undefined") addPerCardAdjustLayer = true;

// Export Functions
if (typeof exportSingles === "undefined") exportSingles = false;
if (typeof exportFormat === "undefined") exportFormat = "jpg";
if (typeof exportAddBleed === "undefined") exportAddBleed = "";
if (typeof outputPDF === "undefined") outputPDF = false;
if (typeof pdfExportPreset === "undefined") pdfExportPreset = "High Quality Print";
if (typeof debugOn === "undefined") debugOn = false;

// Batch History
if (typeof batchHistory === "undefined") batchHistory = false;
if (typeof batchHistoryMin === "undefined") batchHistoryMin = 1;
if (typeof displayBatchNumber === "undefined") displayBatchNumber = false;
if (typeof batchNumber === "undefined") batchNumber = null;
if (typeof batchSkipPrompt === "undefined") batchSkipPrompt = false;
if (typeof batchLightMode === "undefined") batchLightMode = false;
if (typeof batchNextConfig === "undefined") batchNextConfig = "";

// === Constants ===
var scriptFolder = File($.fileName).parent;
var backSlotMap = [8, 9, 5, 6, 7, 2, 3, 4, 0, 1]

// HELPER FUNCTIONS
#include "RE_HelperFunctions.jsx"

logError("Script Started - Logging initialized");

if (batchHistory === true && batchNumber === null){
    determineBatchNumber();
}

var initialConfigVars = getInitialConfigSnapshot();

function main() {

    if (adjustmentMeasureSheet === true) {
        generateAlignmentBackWithOffset(backOffsetXmm, backOffsetYmm);
        return;
    }

    // === Check for Export Singles Mode ===
    if (exportSingles) {
        exportSinglesFromFolder({
            dpi: dpi,
            cardFormat: cardFormat,
            cardWidthMM: cardWidthMM,
            cardHeightMM: cardHeightMM,
            silhouetteBleedAdjust: silhouetteBleedAdjust,
            exportFormat: exportFormat,
            bright: bright,
            contr: contr,
            vib: vib,
            sat: sat,
            gmm: gmm,
            whitepoint: whitepoint,
            blackpoint: blackpoint,
            debugOn: debugOn,
            noBleedAddBleed: exportAddBleed
        });
        return;
    }

    // === Page Size Calculations ===
    // Force orientation only when the page is “wrong” for the requested layout.
    var isHorizontalLayout =
        (layout === "horizontal" || layout === "horizontal2x5" || layout === "horizontal2x6" ||
        layout === "horizontal3x6" || layout === "SevenCard"   || layout === "horizontalAuto");

    var isVerticalLayout =
        (layout === "vertical" || layout === "vertical3x3" || layout === "verticalAuto"); // keep any names you use

    // If a horizontal layout was requested but the page is portrait, rotate to landscape.
    if (isHorizontalLayout && pageWidthInches < pageHeightInches) {
        var __t1 = pageWidthInches;
        pageWidthInches  = pageHeightInches;
        pageHeightInches = __t1;
    }

    // If a vertical layout was requested but the page is landscape, rotate to portrait.
    if (isVerticalLayout && pageWidthInches > pageHeightInches) {
        var __t2 = pageWidthInches;
        pageWidthInches  = pageHeightInches;
        pageHeightInches = __t2;
    }


    var inchToPx = function (inches) {
        return Math.round(inches * dpi);
    };

    var pageWidthPx = inchToPx(pageWidthInches); // 2550 at 300 DPI, 6800 at 800 DPI
    var pageHeightPx = inchToPx(pageHeightInches); // 3300 at 300 DPI, 8800 at 800 DPI

    // === Layout-specific values ===
    var rows, cols, totalCards;

    if (layout === "vertical") {
        rows = 3;
        cols = 3;
        totalCards = 9;
    } else if (layout === "vertical3x2") {
        rows = 3;
        cols = 2;
        totalCards = rows * cols; 
    } else if (layout === "vertical4x3") {
        rows = 4;
        cols = 3;
        totalCards = rows * cols;
    } else if (layout === "vertical4x4") {
        rows = 4;
        cols = 4;
        totalCards = rows * cols;
    } else if (layout === "vertical5x3") {
        rows = 5;
        cols = 3;
        totalCards = rows * cols;
    } else if (layout === "horizontal") {
        rows = 2;
        cols = 4;
        totalCards = rows * cols;
    } else if (layout === "horizontal2x5") {
        rows = 2;
        cols = 5;
        totalCards = rows * cols;
    } else if (layout === "horizontal2x6") {
        rows = 2;
        cols = 6;
        totalCards = rows * cols;
    } else if (layout === "horizontal3x6") {
        rows = 3;
        cols = 6;
        totalCards = rows * cols;
    } else if (layout === "verticalAuto") {
        var autoV = CalculatePageSlots('vertical');
        rows = autoV.rows;
        cols = autoV.cols;
        totalCards = rows * cols;
    } else if (layout === "horizontalAuto") {
        var autoH = CalculatePageSlots('horizontal');
        rows = autoH.rows;
        cols = autoH.cols;
        totalCards = rows * cols;
    } else if (layout === "SevenCard") {
        rows = 2;
        cols = 4;
        totalCards = 7; // Only 7 active cards
    } else if (layout === "Silhouette10Card") {
        rows = 4;
        cols = 3;
        totalCards = 10;  
    } else if (layout === "grid5x23") {
        rows = 5;
        cols = 23;
        totalCards = rows * cols;
    } else {
        rows = layout === "vertical" ? 3 : 2;
        cols = layout === "vertical" ? 3 : 4;
        totalCards = rows * cols;
    }

    if (totalCards > 40 && layout !== "grid5x23" && layout != "horizontalAuto" && layout != "verticalAuto") {
        logError('Error - Layout exceeds safe card limit. Max supported: 40 cards per sheet.');
        alert("Layout exceeds safe card limit. Max supported: 40 cards per sheet.");
        throw new Error("Aborted due to layout card overrun.");
    }

    var silhouetteBleedAdjust = cropBleed; // in MM – trim the outer edges of each card when using Silhouette by this much on each side. DEFAULT 2.0 for Silhouette

    if (useSilhouette && cropBleed == 0.00){
        silhouetteBleedAdjust = 2.00;
    }

    var insetInches = 0.394; // distance specified in Silhouette for Registration Mark Inset
    var insetMM = insetInches * 25.4; // ≈ 10 mm
    var insetX = mmToPixels(insetMM); // distance from left edge to reg mark
    var insetY = mmToPixels(insetMM); // distance from top edge to reg mark

    var cardW = mmToPixels(cardWidthMM); // 69 mm
    var cardH = mmToPixels(cardHeightMM); // 94 mm

    /*
    var cardWhome = mmToPixels(
        cardWidthMM - (useSilhouette ? silhouetteBleedAdjust * 2 : 0)
    );
    var cardHhome = mmToPixels(
        cardHeightMM - (useSilhouette ? silhouetteBleedAdjust * 2 : 0)
    );
    */

    var cardWhome = mmToPixels(cardWidthMM - silhouetteBleedAdjust * 2);
    var cardHhome = mmToPixels(cardHeightMM - silhouetteBleedAdjust * 2);

    // === Adjust layout size for outer black border (NoBleed format only)
    var cardDisplayW, cardDisplayH;

    if (useSilhouette) {
        // Use trimmed silhouette cell size for both MPC and NoBleed
        cardDisplayW = mmToPixels(69 - silhouetteBleedAdjust * 2);
        cardDisplayH = mmToPixels(94 - silhouetteBleedAdjust * 2);
    } else if (cardFormat === "NoBleed") {
        // Add black border for NoBleed printed directly
        var borderPaddingPx = mmToPixels(1);
        cardDisplayW = cardWhome + borderPaddingPx * 2;
        cardDisplayH = cardHhome + borderPaddingPx * 2;
    } else {
        cardDisplayW = cardWhome;
        cardDisplayH = cardHhome;
    }

    var docW = cardDisplayW * cols;

    var regLength = mmToPixels(7.7);
    var regThickness = mmToPixels(1.1);
    var regOffset = mmToPixels(5);
    var squareSize = mmToPixels(5.8);

    var docH = useSilhouette
        ? cardDisplayH * rows + insetY * 2
        : cardDisplayH * rows;

    // === Parse Excluded Card Slots (1-based) ===
    var excludedSlots = {};
    if (excludeCardSlots && excludeCardSlots.toString().length > 0) {
        var parts = excludeCardSlots.toString().split(",");
        for (var i = 0; i < parts.length; i++) {
            var valStr = String(parts[i]); // safely convert to string
            var trimmed = valStr.replace(/^\s+|\s+$/g, ""); // manual trim (ExtendScript-safe)
            var val = parseInt(trimmed, 10);
            if (!isNaN(val) && val >= 1 && val <= totalCards) {
                excludedSlots[val] = true;
            }
        }
    }

    // === Log and sanity check document dimensions before creation
    logError(
    "Creating document with pageWidthPx = " + pageWidthPx +
    ", pageHeightPx = " + pageHeightPx +
    ", dpi=" + dpi
    );

    // Expanded limits to support very large print-shop pages
    var MAX_SIDE_PX = 151000;   // allow up to 90,000 px per side
    var MAX_DPI    = 4000;     // sanity guard

    if (pageWidthPx > MAX_SIDE_PX || pageHeightPx > MAX_SIDE_PX || dpi > MAX_DPI) {
        alert(
            "Document creation skipped: invalid page size or DPI.\n" +
            "Width: " + pageWidthPx + " px (limit " + MAX_SIDE_PX + ")\n" +
            "Height: " + pageHeightPx + " px (limit " + MAX_SIDE_PX + ")\n" +
            "DPI: " + dpi + " (limit " + MAX_DPI + ")"
        );
        throw new Error("Aborted due to oversized document parameters");
    }

    var white = new SolidColor();
    white.rgb.red = 255;
    white.rgb.green = 255;
    white.rgb.blue = 255;

    var doc = app.documents.add(
        pageWidthPx,
        pageHeightPx,
        dpi,
        "ProxySheet",
        NewDocumentMode.RGB
    );    

    if (outputPDF === true) {
        var sentinelPath = scriptFolder.fullName + "/../TempConfig/sentinal_batch_status.txt";
        var displayName = (typeof exportBaseName !== "undefined") ? exportBaseName : File($.fileName).name;
        writeSentinal(sentinelPath, "RUNNING: " + displayName);
    }

    // Count excluded slots
    var excludedCount = 0;
    for (var key in excludedSlots) {
        if (excludedSlots.hasOwnProperty(key)) excludedCount++;
    }

    // Clamp allowed image count to at least 0
    var allowedImages = Math.max(0, totalCards - excludedCount);

    // === Load Card Files (supporting batch restore) ===
    var cardFiles = null;
    var openedImages = null;

    if (typeof batchImagePaths !== "undefined" && batchImagePaths.length > 0) {

        if (typeof batchSkipPrompt !== "undefined" && batchSkipPrompt === true) {
            var useSaved = true;
        }
        else {
            var useSaved = confirm(
                "This batch includes saved card image paths.\n\nWould you like to load the original files automatically?"
            );
        }

        if (useSaved) {
            cardFiles = [];
            openedImages = {};
            var missingCount = 0;

            for (var i = 0; i < batchImagePaths.length; i++) {
                var f = File(batchImagePaths[i]);
                if (f.exists) {
                    cardFiles.push(f);
                } else {
                    missingCount++;
                }
            }

            if (missingCount > 0) {
                alert(
                    "⚠️ " + missingCount + " file(s) could not be found.\nYou will need to reselect all images."
                );
                cardFiles = null;
            }
        }
    }

    // Fallback if user declined or files were missing
    if (cardFiles === null) {
        var folderPrompt =
            typeof batchImageDirectory !== "undefined"
                ? Folder(batchImageDirectory)
                : undefined;

        if (selectEachCard === true) {
            // === Individual card selection per slot ===
            cardFiles = [];

            for (var i = 0; i < totalCards; i++) {
                var slotNumber = i + 1;

                // Skip excluded slots
                if (excludedSlots[slotNumber] === true) {
                    cardFiles.push(null); // Preserve index alignment
                    continue;
                }

                var promptTitle = "Select image for Card Slot " + slotNumber;
                var selectedFile = File.openDialog(promptTitle, "Images:*.jpg;*.jpeg;*.png");

                if (selectedFile) {
                    cardFiles.push(selectedFile);
                } else {
                    alert("Card slot " + slotNumber + " was skipped or canceled.");
                    cardFiles.push(null);
                }
            }

        } else {
            // === Original bulk select logic ===
            cardFiles = File.openDialog(
                "Select up to " + allowedImages + " card images in order (left to right, top to bottom)",
                undefined,
                true
            );
        }

    }


    // Clip selection if too many were selected
    if (cardFiles && cardFiles.length > allowedImages) {
        alert(
            "You selected more than " +
                allowedImages +
                " files. Only the first " +
                allowedImages +
                " will be used."
        );
        cardFiles = cardFiles.slice(0, allowedImages);
    }

    // === If Card Back Sheet (bulk), allow a single selection to fill all slots ===
    if (cardBack === true && selectEachCard !== true && cardFiles && cardFiles.length === 1) {
        var useAll = confirm(
            "You selected 1 card back image.\n\nUse it for all " + (totalCards - excludedCount) + " cards?"
        );
        if (useAll) {
            var singleBack = cardFiles[0];
            var expanded = [];
            for (var s = 0; s < totalCards; s++) {
                var slotNum = s + 1;
                if (excludedSlots[slotNum] === true) {
                    expanded.push(null); // preserve index alignment for excluded slots
                } else {
                    expanded.push(singleBack); // use the same file for every active slot
                }
            }
            cardFiles = expanded;
        }
    }

    // === Add Silhouette Cameo 5 registration marks ===
    if (useSilhouette) {
        placeSilhouettePSDLayer(doc, scriptFolder);
    }

    // === Calculate card vertical offset ===
    var silhouetteInsetPx = useSilhouette ? insetX : 0;

    // Total width/height of card block (not the document)
    var gapPx = mmToPixels(cardGap);
    //var cardBlockW = cardDisplayW * cols;
    //var cardBlockH = cardDisplayH * rows;
    var cardBlockW = cardDisplayW * cols + gapPx * (cols - 1);
    var cardBlockH = cardDisplayH * rows + gapPx * (rows - 1);

    // Compute X and Y offset to center the cards WITHIN the page with an inset
    var cardStartX = Math.round((pageWidthPx - cardBlockW) / 2);
    var cardStartY = Math.round((pageHeightPx - cardBlockH) / 2);


    if (useSilhouette) {
        var availableW = pageWidthPx - silhouetteInsetPx * 2;
        var availableH = pageHeightPx - silhouetteInsetPx * 2;

        cardStartX = silhouetteInsetPx + Math.round((availableW - cardBlockW) / 2);
        cardStartY = silhouetteInsetPx + Math.round((availableH - cardBlockH) / 2);
    }

        // === Load and place each card ===
        var imageIndex = 0;
        var layerReuseCache = {};

        // PREDEFINE slotPositions if using Silhouette10Card
        var slotPositions = null;
        if (layout === "Silhouette10Card") {
        slotPositions = [
            [cardStartX, cardStartY], // 1
            [cardStartX + cardDisplayW, cardStartY], // 2
            [cardStartX, cardStartY + cardDisplayH], // 3
            [cardStartX + cardDisplayW, cardStartY + cardDisplayH], // 4
            [cardStartX + 2 * cardDisplayW, cardStartY + cardDisplayH], // 5
            [cardStartX, cardStartY + 2 * cardDisplayH], // 6
            [cardStartX + cardDisplayW, cardStartY + 2 * cardDisplayH], // 7
            [cardStartX + 2 * cardDisplayW, cardStartY + 2 * cardDisplayH], // 8
            [cardStartX + cardDisplayW, cardStartY + 3 * cardDisplayH], // 9
            [cardStartX + 2 * cardDisplayW, cardStartY + 3 * cardDisplayH] // 10
        ];
        }

        for (var i = 0; i < totalCards; i++) {
            var mappedIndex = i; // default slot index, remapped later for cardBack
            var group = doc.layerSets.add();
            group.name = "Card Group " + (i + 1);

            var slotNumber = i + 1;
            var isExcluded = excludedSlots[slotNumber] === true;
            var cardHadImage = false;

            var x, y;
            
            if (layout === "Silhouette10Card") {
                if (cardBack === true) {
                    // Silhouette10Card BACK layout mapping
                    // BACK slot order: 9,10,6,7,8,3,4,5,1,2
                    backSlotMap = [8, 9, 5, 6, 7, 2, 3, 4, 0, 1];
                    mappedIndex = backSlotMap[i];

                    logError("Placing card " + (i + 1) + " | mappedIndex: " + mappedIndex + " | Back: " + cardBack);

                    if (mappedIndex === 0) {
                        // Slot 9 (Row 1, right-aligned, rotated)
                        var slot10Right = cardStartX + 3 * cardDisplayW;
                        var slot10X = slot10Right - cardDisplayH;
                        x = slot10X - cardDisplayH;
                        y = cardStartY + cardDisplayH - cardDisplayW;
                    } else if (mappedIndex === 1) {
                        // Slot 10 (next to Slot 9)
                        x = cardStartX + 3 * cardDisplayW - cardDisplayH;
                        y = cardStartY + cardDisplayH - cardDisplayW;
                    } else if (mappedIndex === 8) {
                        // Slot 1 - Bottom left of Slot 2
                        x = cardStartX;
                        y = cardStartY + 3 * cardDisplayH;
                    } else if (mappedIndex === 9) {
                        // Slot 2 - Aligned to left edge of Slot 3
                        x = cardStartX + cardDisplayH;
                        y = cardStartY + 3 * cardDisplayH;
                    } else {
                        // All other slots (3–8)
                        var pos = slotPositions[mappedIndex];
                        x = pos[0];
                        y = pos[1];
                    }                

                    if (i < 2 || i >= 8) {
                        // Adjust for -90° rotation
                        var shiftX = Math.round((cardDisplayH - cardDisplayW) / 2);
                        var shiftY = Math.round((cardDisplayW - cardDisplayH) / 2);
                        x += shiftX;
                        y += shiftY;
                    }

                } else {
                    // Front Card Logic
                    if (i === 0) {
                        // Slot 1 (Row 1, left-aligned, rotated)
                        x = cardStartX;
                        y = cardStartY + cardDisplayH - cardDisplayW;
                    } else if (i === 1) {
                        // Slot 2 (next to Slot 1)
                        x = cardStartX + cardDisplayH;
                        y = cardStartY + cardDisplayH - cardDisplayW;
                    } else if (i === 8) {
                        // Slot 9 - Bottom left of Slot 10
                        var slot10Right = cardStartX + 3 * cardDisplayW;
                        var slot10X = slot10Right - cardDisplayH;
                        x = slot10X - cardDisplayH;
                        y = cardStartY + 3 * cardDisplayH;
                    } else if (i === 9) {
                        // Slot 10 - Aligned to right edge of Slot 8
                        x = cardStartX + 3 * cardDisplayW - cardDisplayH;
                        y = cardStartY + 3 * cardDisplayH;
                    } else {
                        // All other slots (3–8)
                        var pos = slotPositions[i];
                        x = pos[0];
                        y = pos[1];
                    }

                    // Rotation anchor correction for rotated cards (1,2,9,10)
                    if (i < 2 || i >= 8) {
                        var shiftX = Math.round((cardDisplayH - cardDisplayW) / 2);
                        var shiftY = Math.round((cardDisplayW - cardDisplayH) / 2);
                        x += shiftX;
                        y += shiftY;
                    }
                }
            }
            else if (layout === "SevenCard") {
                // Respect gap only when not using Silhouette
                var gX = gapPx, gY = gapPx;

                if (i === 0) {
                    // Center vertically, left or right column depending on back/front
                    y = Math.round((pageHeightPx - (cardDisplayH)) / 2); // single card, no vertical grid math
                    // For SevenCard, there are 4 columns total → three gaps between columns
                    // Slot 1 sits in the outer column; add gap between columns where appropriate
                    x = cardBack
                        ? cardStartX + 3 * cardDisplayW + 3 * gX
                        : cardStartX;
                } else {
                    var localIndex = i - 1;
                    var row = Math.floor(localIndex / 3);
                    var col = localIndex % 3;
                    var colFlipped = cardBack ? 2 - col : col;

                    // Front: slots 2–7 occupy columns 2–4 visually (1 gap before them)
                    // Back: mirrored horizontally
                    x = cardBack
                        //? cardStartX + colFlipped * (cardDisplayW + gX) + (cardDisplayW + gX) // columns 2–4 mirrored
                        ? cardStartX + colFlipped * (cardDisplayW + gX) // columns 1–3 mirrored, no extra shift
                        : cardStartX + (cardDisplayW + gX) + colFlipped * (cardDisplayW + gX); // shift one column to the right

                    y = cardStartY + row * (cardDisplayH + gY);
                }
            }

            /* else if (layout === "SevenCard") {
                
                if (i === 0) {
                    y = Math.round((pageHeightPx - cardDisplayH) / 2);
                    x = cardBack ? cardStartX + 3 * cardDisplayW : cardStartX;
                } else {
                    var localIndex = i - 1;
                    var row = Math.floor(localIndex / 3);
                    var col = localIndex % 3;
                    var colFlipped = cardBack ? 2 - col : col;
                    x = cardBack
                        ? cardStartX + colFlipped * cardDisplayW
                        : cardStartX + cardDisplayW + colFlipped * cardDisplayW;
                    y = cardStartY + row * cardDisplayH;
                }
            } */
            else {
                var row = Math.floor(i / cols);
                var col = i % cols;
                //x = col * cardDisplayW + cardStartX;
                //y = row * cardDisplayH + cardStartY;
                x = col * (cardDisplayW + gapPx) + cardStartX;
                y = row * (cardDisplayH + gapPx) + cardStartY;
            }

            var baseLayer;

            if (isExcluded) {
                baseLayer = drawCardBackground(x, y, cardWhome, cardHhome, white, "Excluded " + slotNumber, group);
                continue;
            }

            // === Place card image ===
            if (cardFiles != null && cardFiles[i] != null) {
                var currentFile = cardFiles[i];
                if (!(currentFile instanceof File)) currentFile = new File(currentFile);
                if (!currentFile.exists) {
                logError("Skipped missing card image: " + currentFile.name);
                continue;
                }

                imageIndex++;
                //var trimPx = useSilhouette ? mmToPixels(silhouetteBleedAdjust) : 0;
                var trimPx = mmToPixels(silhouetteBleedAdjust);

                baseLayer = placeImageInDocument(
                currentFile,
                cardW,
                cardH,
                trimPx,
                doc,
                group,
                "Card " + slotNumber,
                x,
                y,
                layerReuseCache
                );
                cardHadImage = true;

                // Add black border for NoBleed
                if (cardFormat === "NoBleed") {
                    var black = new SolidColor();
                    black.rgb.red = 0;
                    black.rgb.green = 0;
                    black.rgb.blue = 0;
                    drawCardBackground(x, y, cardDisplayW, cardDisplayH, black, "Black Border for Card " + slotNumber, group);
                }

                app.activeDocument = doc;

                try {
                    if (
                        baseLayer.bounds[2].as("px") > baseLayer.bounds[0].as("px") &&
                        baseLayer.bounds[3].as("px") > baseLayer.bounds[1].as("px")
                    ) {
                        var xAdj = cardFormat === "NoBleed" ? (useSilhouette ? mmToPixels(3) : mmToPixels(1)) : 0;
                        var yAdj = xAdj;
                        baseLayer.translate(x + xAdj - baseLayer.bounds[0].as("px"), y + yAdj - baseLayer.bounds[1].as("px"));
                    } else {
                        throw new Error("Layer has invalid bounds and was skipped.");
                    }
                } catch (e) {
                    logError("Error - Paste and position card image " + currentFile.name);
                    logError("e: " + e.message);
                    alert("Skipped card placement due to image error:\n" + e.message);
                    continue;
                }

                try {
                    baseLayer.move(group, ElementPlacement.INSIDE);
                } catch (e) {
                    logError("Error - Placing Layer in Group " + currentFile.name);
                }

                // === ROTATE Silhouette10Card slots 1, 2, 9, 10 ===
                if (layout === "Silhouette10Card") {
                    var shouldRotate = false;
                    var rotateDegree = 90.0;

                    if (cardBack === true) {
                        shouldRotate = true;

                        // Determine rotation degree per mappedIndex
                        if (mappedIndex === 0 || mappedIndex === 1 || mappedIndex === 8 || mappedIndex === 9) {
                            rotateDegree = -270.0;
                        } else {
                            rotateDegree = -180.0;
                        }
                    } else {
                        shouldRotate = (i === 0 || i === 1 || i === 8 || i === 9); // Front-side rotated slots
                        rotateDegree = 90.0;
                    }

                    if (shouldRotate) {
                        try {
                            logError("Rotating card " + (i + 1) + " | mappedIndex: " + mappedIndex + " | Back: " + cardBack);

                            var groupName = "Card Group " + (i + 1);
                            var currentGroup = doc.layerSets.getByName(groupName);

                            var idselect = charIDToTypeID("slct");
                            var desc = new ActionDescriptor();
                            var ref = new ActionReference();
                            ref.putName(charIDToTypeID("Lyr "), groupName);
                            desc.putReference(charIDToTypeID("null"), ref);
                            executeAction(idselect, desc, DialogModes.NO);

                            var rotateDesc = new ActionDescriptor();
                            var rotateRef = new ActionReference();
                            rotateRef.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
                            rotateDesc.putReference(charIDToTypeID("null"), rotateRef);
                            rotateDesc.putUnitDouble(charIDToTypeID("Angl"), charIDToTypeID("#Ang"), rotateDegree);
                            executeAction(charIDToTypeID("Trnf"), rotateDesc, DialogModes.NO);
                        } catch (e) {
                            logError("❌ Rotation failed for Card Group " + (i + 1));
                            logError("e: " + e.message);
                        }
                    }
                }
            } else {
                // Fallback blank card
                try {
                    baseLayer = drawCardBackground(x, y, cardWhome, cardHhome, white, "Blank " + slotNumber, group);
                } catch (e) {
                    logError("Error - Drawing Blank Card");
                }

                 // === ROTATE Silhouette10Card slots 1, 2, 9, 10 ===
                if (layout === "Silhouette10Card") {
                    var shouldRotate = false;
                    var rotateDegree = 90.0;

                    if (cardBack === true) {
                        // mappedIndex is already declared earlier in your layout logic
                        shouldRotate = (mappedIndex === 0 || mappedIndex === 1 || mappedIndex === 8 || mappedIndex === 9);
                        rotateDegree = -90.0;
                    } else {
                        shouldRotate = (i === 0 || i === 1 || i === 8 || i === 9); // Front-side rotated slots
                    }

                    if (shouldRotate && baseLayer) {
                        try {
                            app.activeDocument.activeLayer = baseLayer;

                            var rotateDesc = new ActionDescriptor();
                            var rotateRef = new ActionReference();
                            rotateRef.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
                            rotateDesc.putReference(charIDToTypeID("null"), rotateRef);
                            rotateDesc.putUnitDouble(charIDToTypeID("Angl"), charIDToTypeID("#Ang"), rotateDegree);
                            executeAction(charIDToTypeID("Trnf"), rotateDesc, DialogModes.NO);

                            logError("Rotated fallback blank card " + slotNumber + " by " + rotateDegree + " degrees");
                        } catch (e) {
                            logError("Rotation failed for fallback blank card " + slotNumber);
                            logError("e: " + e.message);
                        }
                    }
                }

            }

            // === Brightness/Contrast Adjustment ===
            if (addPerCardAdjustLayer && !batchLightMode) {
                try {
                    addBrightnessContrastAdjustment(
                        0, // brightness
                        0, // contrast
                        "Brightness/Contrast for Card " + (i + 1),
                        group,
                        true // clip to card image
                    );
                } catch (e) {
                    logError('Error - Card Brightness/Contrast Adjustment Layer - ' + group.name);
                    logError('e: ' + e.message);
                    alert("Error:\n" + e.message);
                    continue;
                }
            }    

            // === Vibrance Adjustment ===
            if (addPerCardAdjustLayer && !batchLightMode) {
                try {
                    addVibranceAdjustment(
                        0, // vibrance
                        0, // saturation
                        "Vibrance for Card " + (i + 1),
                        group,
                        true // clip to card image
                    );
                } catch (e) {
                    logError('Error - Card Vibrance Adjustment Layer - ' + group.name);
                    logError('e: ' + e.message);
                    alert("Error:\n" + e.message);
                    continue;
                }
            }   

            // === Load and position CutMarkOverlay.png if not excluded ===
            if (showCropMarks && cardHadImage) {
                var markSize = mmToPixels(cutMarkSize);
                var adjustedCutOffset = cutOffset - (useSilhouette ? silhouetteBleedAdjust : 0);
                var offset = mmToPixels(adjustedCutOffset);

                var cardOffsetX = getCardOffsetX(x);
                var cardOffsetY = getCardOffsetY(y);

                var w = cardWhome;
                var h = cardHhome;

                // Correct for rotation
                var rotated = (layout === "Silhouette10Card" && (i === 0 || i === 1 || i === 8 || i === 9));
                if (rotated) {
                    // Apply 90° CW rotation math around the center
                    var cx = cardOffsetX + w / 2;
                    var cy = cardOffsetY + h / 2;

                    // Rotate each corner from the unrotated position
                    var points = new Array(
                        [-w / 2 + offset, -h / 2 + offset], // TL
                        [ w / 2 - offset, -h / 2 + offset], // TR
                        [-w / 2 + offset,  h / 2 - offset], // BL
                        [ w / 2 - offset,  h / 2 - offset]  // BR
                    );

                    var corners = [];
                    for (var j = 0; j < points.length; j++) {
                        var px = points[j][0];
                        var py = points[j][1];
                        var xRot = py;   // 90° rotation: x' = y
                        var yRot = -px;  // y' = -x
                        corners.push([Math.round(cx + xRot), Math.round(cy + yRot)]);
                    }

                } else {
                    // Standard non-rotated card
                    var corners = [
                        [cardOffsetX + offset, cardOffsetY + offset],                             // top-left
                        [cardOffsetX + w - offset, cardOffsetY + offset],                         // top-right
                        [cardOffsetX + offset, cardOffsetY + h - offset],                         // bottom-left
                        [cardOffsetX + w - offset, cardOffsetY + h - offset]                      // bottom-right
                    ];
                }

                for (var c = 0; c < corners.length; c++) {
                    try {
                        var mark = drawCropMark(corners[c][0], corners[c][1], markSize);
                        mark.move(group, ElementPlacement.INSIDE); // still group it
                    } catch (e) {
                        logError('Error - Draw Crop Mark');
                        logError('e: ' + e.message);
                    }
                }
            }        
    }

    // === Sheet Adjustment Layers ===
    var sheetGroup = doc.layerSets.add();
    sheetGroup.name = "Sheet Adjustments";

    addBrightnessContrastAdjustment(bright, contr, "Brightness/Contrast (Global)", sheetGroup, false);
    addVibranceAdjustment(vib, sat, "Vibrance (Global)", sheetGroup, false);
    addLevelsAdjustmentLayer(blackpoint, whitepoint, gmm, sheetGroup);
  
    // === Add Note Layer in Lower Right ===
    if (notesOn) {
        var noteText =
            "DPI: " +
            dpi +
            " | Brightness: " +
            bright +
            " | Contrast: " +
            contr +
            " | Vibrance: " +
            vib +
            " | Saturation: " +
            sat +
            " | gmm: " +
            gmm +
            " | whitepoint: " +
            whitepoint +
            " | blackpoint: " +
            blackpoint;

        if (cardBack && (backOffsetXmm != 0 || backOffsetYmm != 0)) {
            noteText += " | Offset: " + backOffsetXmm + " / " + backOffsetYmm;
        }

        var fullNoteText = noteText;
        if (manualNote && manualNote.length > 0) {
            fullNoteText += "\r" + manualNote;
        }

        // Create text layer
        var textLayer = doc.artLayers.add();
        textLayer.kind = LayerKind.TEXT;
        textLayer.name = "NOTE";

        var textItem = textLayer.textItem;
        textItem.contents = fullNoteText;
        textItem.font = "ArialMT"; // Arial
        textItem.size = noteFontSize;
        textItem.justification = Justification.RIGHT;

        // Assign color after defining content/font
        var black = new SolidColor();
        black.rgb.red = 0;
        black.rgb.green = 0;
        black.rgb.blue = 0;
        textItem.color = black;

        // === Compute position: aligned to bottom-right of card grid ===
        var textMargin = mmToPixels(6);
        var textPosX = cardStartX + cardBlockW - textMargin;
        var textPosY = cardStartY + cardBlockH + textMargin;

        if (layout === "Silhouette10Card") {
            // Custom note position and font size for Silhouette10Card
            var scale = dpi / 800.0;
            textItem.position = [Math.round(800 * scale), Math.round(10758 * scale)];
            textItem.size = 9;
            textItem.justification = Justification.LEFT;
        } else if (paperType === "Legal") {
            // Custom note position and font size for Silhouette10Card
            var scale = dpi / 800.0;
            textItem.position = [Math.round(800 * scale), Math.round(10950 * scale)];
            textItem.size = 9;
            textItem.justification = Justification.LEFT;
        } else {
            textItem.position = [textPosX, textPosY];
        }
    }

    if (cardBack && (backOffsetXmm !== 0 || backOffsetYmm !== 0)) {
        var xShift = mmToPixels(backOffsetXmm);
        var yShift = mmToPixels(backOffsetYmm);
        shiftEntireDocumentByOffset(xShift, yShift);
    }

    if (outputPDF === true) {
        var pdfFolder = new Folder(scriptFolder.fullName + "/../TempConfig/TempPDF");
        if (!pdfFolder.exists) pdfFolder.create();

        var safeName = (typeof exportBaseName !== "undefined") ? exportBaseName : "Batch_PageX";
        var pdfFile = new File(pdfFolder + "/" + safeName + ".pdf");

        var pdfOptions = new PDFSaveOptions();
        pdfOptions.pDFPreset = pdfExportPreset;

        var shouldFlatten = (pdfExportPreset !== "High Quality Print");
        var docRef = app.activeDocument;

        try {
            if (shouldFlatten) {
                docRef.flatten();
            }

            docRef.saveAs(pdfFile, pdfOptions, true);
        } catch (e) {
            logError('Error - PDF export failed using preset ' + pdfExportPreset);
            logError('e: ' + e.message);
            alert("PDF export failed using preset '" + pdfExportPreset + "':\n\n" + e.message);
        }

        doc.close(SaveOptions.DONOTSAVECHANGES); 
    }

    if (batchHistory === true) {
        saveBatchHistory(initialConfigVars, scriptFolder, cardFiles, batchNumber);
    }

    if (outputPDF === true && batchNextConfig != ""){
        callNextConfig(batchNextConfig);
    }

    if (outputPDF === true && batchNextConfig === "") {
        var sentinelPath = scriptFolder.fullName + "/../TempConfig/sentinal_batch_status.txt";
        writeSentinal(sentinelPath, "DONE");
        //alert("Batch complete.");
    }
}

main();
