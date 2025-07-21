// === REGEN PHOTOSHOP MTG PRINT LAYOUT ENGINE v5.1 ===
// --- This file contains the code for the script.  The Config scripts must use an #include to this script to operate

// === SAFETY: Fallback Defaults for Missing Config Variables ===
// Page/Layout
if (typeof pageWidthInches === "undefined") pageWidthInches = 8.5;
if (typeof pageHeightInches === "undefined") pageHeightInches = 11;
if (typeof layout === "undefined") layout = "horizontal";
if (typeof cardFormat === "undefined") cardFormat = "MPC";
if (typeof cardBack === "undefined") cardBack = false;
if (typeof backOffsetXmm === "undefined") backOffsetXmm = 0.0;
if (typeof backOffsetYmm === "undefined") backOffsetYmm = 0.0;
if (typeof selectEachCard === "undefined") selectEachCard = false;
if (typeof paperType === "undefined") paperType = "Custom";

// === Apply Format Presets If cardFormat is Specified ===
if (cardFormat === "MPC") {
    if (typeof cardWidthMM === "undefined") cardWidthMM = 69;
    if (typeof cardHeightMM === "undefined") cardHeightMM = 94;
    if (typeof cutOffset === "undefined") cutOffset = 3.04;
    if (typeof cutMarkSize === "undefined") cutMarkSize = 4.5;
    if (typeof showCropMarks === "undefined") showCropMarks = true;
} else if (cardFormat === "NoBleed") {
    if (typeof cardWidthMM === "undefined") cardWidthMM = 63;
    if (typeof cardHeightMM === "undefined") cardHeightMM = 88;
    if (typeof cutOffset === "undefined") cutOffset = 1.0;
    if (typeof cutMarkSize === "undefined") cutMarkSize = 4.5;
    if (typeof showCropMarks === "undefined") showCropMarks = true;
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

// Notes
if (typeof notesOn === "undefined") notesOn = false;
if (typeof noteFontSize === "undefined") noteFontSize = 9;
if (typeof manualNote === "undefined") manualNote = "";

// Color Adjustments
if (typeof bright === "undefined") bright = 0;
if (typeof contr === "undefined") contr = 0;
if (typeof vib === "undefined") vib = 0;
if (typeof sat === "undefined") sat = 0;
if (typeof gmm === "undefined") gmm = 1.0;
if (typeof whitepoint === "undefined") whitepoint = 255;
if (typeof blackpoint === "undefined") blackpoint = 0;
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


// HELPER FUNCTIONS
var scriptFolder = File($.fileName).parent;

#include "RE_HelperFunctions.jsx"

logError("Script Started - Logging initialized");

if (batchHistory === true && batchNumber === null){
    determineBatchNumber();
}

var initialConfigVars = getInitialConfigSnapshot();

function main() {

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

    // Save original 

    // === Page Size Calculations ===
    if (layout === "horizontal" || layout === "horizontal2x5" || layout === "horizontal2x6" || layout === "horizontal3x6" ||layout === "SevenCard") {
        // Swap width and height for landscape
        var temp = pageWidthInches;
        pageWidthInches = pageHeightInches;
        pageHeightInches = temp;
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
    } else if (layout === "SevenCard") {
        rows = 2;
        cols = 4;
        totalCards = 7; // Only 7 active cards    
    } else {
        rows = layout === "vertical" ? 3 : 2;
        cols = layout === "vertical" ? 3 : 4;
        totalCards = rows * cols;
    }

    var silhouetteBleedAdjust = 2.0; // in MM – trim the outer edges of each card when using Silhouette by this much on each side. DEFAULT 2.2
    var insetInches = 0.394; // distance specified in Silhouette for Registration Mark Inset
    var insetMM = insetInches * 25.4; // ≈ 10 mm
    var insetX = mmToPixels(insetMM); // distance from left edge to reg mark
    var insetY = mmToPixels(insetMM); // distance from top edge to reg mark

    var cardW = mmToPixels(cardWidthMM); // 69 mm
    var cardH = mmToPixels(cardHeightMM); // 94 mm
    var cardWhome = mmToPixels(
        cardWidthMM - (useSilhouette ? silhouetteBleedAdjust * 2 : 0)
    );
    var cardHhome = mmToPixels(
        cardHeightMM - (useSilhouette ? silhouetteBleedAdjust * 2 : 0)
    );

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

    if (pageWidthPx > 40000 || pageHeightPx > 40000 || dpi > 4000) {
        alert("Document creation skipped: invalid page size or DPI.\n" +
        "Width: " + pageWidthPx + "px\n" +
        "Height: " + pageHeightPx + "px\n" +
        "DPI: " + dpi);
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

    // === Add Silhouette Cameo 5 registration marks ===
    if (useSilhouette) {
        placeSilhouettePSDLayer(doc, scriptFolder);
    }

    // === Calculate card vertical offset ===
    var silhouetteInsetPx = useSilhouette ? insetX : 0;

    // Total width/height of card block (not the document)
    var cardBlockW = cardDisplayW * cols;
    var cardBlockH = cardDisplayH * rows;

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

    for (var i = 0; i < totalCards; i++) {
        var group = doc.layerSets.add();
        group.name = "Card Group " + (i + 1);

        var slotNumber = i + 1;
        var isExcluded = excludedSlots[slotNumber] === true;
        var cardHadImage = false;

        // === Card placement logic ===
        var x, y;

        if (layout === "SevenCard") {
            if (i === 0) {
                // Card 1: vertically centered, far left or far right
                y = Math.round((pageHeightPx - cardDisplayH) / 2);

                if (cardBack) {
                    x = cardStartX + 3 * cardDisplayW;
                } else {
                    x = cardStartX;
                }
            } else {
                // Cards 2–7: grid
                var localIndex = i - 1;
                var row = Math.floor(localIndex / 3);
                var col = localIndex % 3;
                var colFlipped = cardBack ? (2 - col) : col;

                if (cardBack) {
                    x = cardStartX + colFlipped * cardDisplayW;
                } else {
                    x = cardStartX + cardDisplayW + colFlipped * cardDisplayW;
                }

                y = cardStartY + row * cardDisplayH;
            }
        } else {
            // General layout (2x4, 2x5, 2x6, 3x5, etc.)
            var row = Math.floor(i / cols);
            var col = i % cols;
            x = col * cardDisplayW + cardStartX;
            y = row * cardDisplayH + cardStartY;
        }

        /*
        var x, y;

        if (layout === "SevenCard") {
            if (i === 0) {
                // Card 1: vertically centered, far left or right
                y = Math.round((pageHeightPx - cardDisplayH) / 2);

                if (cardBack) {
                    // BACK: Card 1 on far right
                    x = cardStartX + 3 * cardDisplayW;
                } else {
                    // FRONT: Card 1 on far left
                    x = cardStartX;
                }

            } else {
                // Cards 2-4 (top row), 6-8 (bottom row) — 3x2 grid
                var localIndex = i - 1;
                var row = Math.floor(localIndex / 3);
                var col = localIndex % 3;

                var colFlipped = !cardBack ? col : 2 - col;  // ← flip entire grid

                if (cardBack) {
                    // CARD BACK
                    x = cardStartX + colFlipped * cardDisplayW;
                } else {
                    // CARD FRONTS
                    x = cardStartX + cardDisplayW + colFlipped * cardDisplayW;
                }

                y = cardStartY + row * cardDisplayH;
            }
        }
        else {
            x = (i % cols) * cardDisplayW + cardStartX;
            y = Math.floor(i / cols) * cardDisplayH + cardStartY;
        }
        */
        var baseLayer;

        if (isExcluded) {
            // Excluded slot: render blank, no image, no overlays, no adjustments
            baseLayer = drawCardBackground(
                x,
                y,
                cardWhome,
                cardHhome,
                white,
                "Excluded " + slotNumber,
                group
            );
            continue;
        }

        // Batch Mode
        if (cardFiles != null && cardFiles[i] != null) {
            var currentFile = cardFiles[i];
            if (!(currentFile instanceof File)) {
                currentFile = new File(currentFile);
            }

            imageIndex++; // Only increment once
            var trimPx = useSilhouette ? mmToPixels(silhouetteBleedAdjust) : 0;

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

            // === Draw outer black background if NoBleed
            if (cardFormat === "NoBleed") {
                var black = new SolidColor();
                black.rgb.red = 0;
                black.rgb.green = 0;
                black.rgb.blue = 0;
                
                drawCardBackground(
                    x,
                    y,
                    cardDisplayW,
                    cardDisplayH,
                    black,
                    "Black Border for Card " + slotNumber,
                    group
                );
                
            }

            // === Paste and position card image
            app.activeDocument = doc;

            try {
                if (
                    baseLayer.bounds[2].as("px") > baseLayer.bounds[0].as("px") &&
                    baseLayer.bounds[3].as("px") > baseLayer.bounds[1].as("px")
                )
                {
                    if (cardFormat === "NoBleed" && useSilhouette) {
                        baseLayer.translate(
                            x +
                                (cardFormat === "NoBleed" ? mmToPixels(3) : 0) -
                                baseLayer.bounds[0].as("px"),
                            y +
                                (cardFormat === "NoBleed" ? mmToPixels(3) : 0) -
                                baseLayer.bounds[1].as("px")
                        );
                    } else {
                        baseLayer.translate(
                            x +
                                (cardFormat === "NoBleed" ? mmToPixels(1) : 0) -
                                baseLayer.bounds[0].as("px"),
                            y +
                                (cardFormat === "NoBleed" ? mmToPixels(1) : 0) -
                                baseLayer.bounds[1].as("px")
                        );
                    }
                } else {
                    throw new Error("Layer has invalid bounds and was skipped.");
                }
            } catch (e) {
                logError('Error - Paste and position card image ' + currentFile.name);
                logError('e: ' + e.message);
                alert("Skipped card placement due to image error:\n" + e.message);
                continue;
            }
            try {
                baseLayer.move(group, ElementPlacement.INSIDE);
            }
            catch (e) {
                logError('Error - Placing Layer in Group ' + currentFile.name);
            }
            

            if (displayBatchNumber === true && batchNumber !== null) {
            //  var formattedNumber = "# " + batchNumber.toString().padStart(3, "0");
                var formattedNumber = padNumber(batchNumber, 3);

                addBatchNumberLabel(group, x, y, dpi, formattedNumber);
            }

        } else {
                // Fallback blank card
                try {
                baseLayer = drawCardBackground(
                    x,
                    y,
                    cardWhome,
                    cardHhome,
                    white,
                    "Blank " + slotNumber,
                    group
                );
            }
            catch (e) {
                logError('Error - Drawing Blank Card');
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
        //if (showCropMarks && cardHadImage && !batchLightMode) {
        if (showCropMarks && cardHadImage) {
            var markSize = mmToPixels(cutMarkSize);
            var adjustedCutOffset = cutOffset - (useSilhouette ? silhouetteBleedAdjust : 0);
            var offset = mmToPixels(adjustedCutOffset);
        
            var cardOffsetX = getCardOffsetX(x);
            var cardOffsetY = getCardOffsetY(y);
        
            var corners = [
                [cardOffsetX + offset, cardOffsetY + offset], // top-left
                [cardOffsetX + cardWhome - offset, cardOffsetY + offset], // top-right
                [cardOffsetX + offset, cardOffsetY + cardHhome - offset], // bottom-left
                [cardOffsetX + cardWhome - offset, cardOffsetY + cardHhome - offset] // bottom-right
            ];
        
            for (var c = 0; c < corners.length; c++) {
                try {
                    drawCropMark(corners[c][0], corners[c][1], markSize);
                }
                catch (e) {
                    logError('Error - Draw Crop Mark - ' + currentFile.name);
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

    // === Silhouette Registration Improvement Triangle ===
    /*
    if (useSilhouette && cardFormat != "NoBleed" && layout != "SevenCard") {
        var slot5Index = 4; // zero-based index
        var slot5Col = slot5Index % cols;
        var slot5Row = Math.floor(slot5Index / cols);
        var slot5X = cardStartX + slot5Col * cardDisplayW;
        var slot5Y = cardStartY + slot5Row * cardDisplayH + cardHhome - mmToPixels(2); // nudge 2px inward

        placeSilhouetteDetectionAid(doc, scriptFolder, slot5X, slot5Y, dpi);
    } 
    */


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

        textItem.position = [textPosX, textPosY];
    }

    if (cardBack && (backOffsetXmm !== 0 || backOffsetYmm !== 0)) {
        var xShift = mmToPixels(backOffsetXmm);
        var yShift = mmToPixels(backOffsetYmm);
        shiftEntireDocumentByOffset(xShift, yShift);
    }

    if (outputPDF === true) {
        //var pdfFolder = new Folder(scriptFolder.fullName + "/../PDFOutput");
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
