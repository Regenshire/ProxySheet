// === REGEN PHOTOSHOP MTG PRINT LAYOUT ENGINE v4.0 ===
// --- This file contains the code for the script.  The Config scripts must use an #include to this script to operate

// === SAFETY: Fallback Defaults for Missing Config Variables ===
// Page/Layout
if (typeof pageWidthInches === "undefined") pageWidthInches = 8.5;
if (typeof pageHeightInches === "undefined") pageHeightInches = 11;
if (typeof layout === "undefined") layout = "horizontal";
if (typeof cardFormat === "undefined") cardFormat = "MPC";

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

// HELPER FUNCTIONS
#include "RE_HelperFunctions.jsx"

// === Page Size Calculations ===
if (layout === "horizontal") {
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
var rows = layout === "vertical" ? 3 : 2;
var cols = layout === "vertical" ? 3 : 4;
var totalCards = rows * cols;
var silhouetteBleedAdjust = 2.2; // in MM – trim the outer edges of each card when using Silhouette by this much on each side. DEFAULT 2.2
var insetInches = 0.394; // distance specified in Silhouette for Registration Mark Inset
var insetMM = insetInches * 25.4; // ≈ 10 mm
var insetX = mmToPixels(insetMM); // distance from left edge to reg mark
var insetY = mmToPixels(insetMM); // distance from top edge to reg mark

// === Convert MM to Pixels ===
function mmToPixels(mm) {
    return Math.round((mm / 25.4) * dpi);
}

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

var scriptFolder = File($.fileName).parent;

// Count excluded slots
var excludedCount = 0;
for (var key in excludedSlots) {
    if (excludedSlots.hasOwnProperty(key)) excludedCount++;
}

// Clamp allowed image count to at least 0
var allowedImages = Math.max(0, totalCards - excludedCount);

var cardFiles = File.openDialog(
    "Select up to " +
        allowedImages +
        " card images in order (left to right, top to bottom)",
    undefined,
    true
);

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
    var regLineColor = new SolidColor();
    regLineColor.rgb.red = 0;
    regLineColor.rgb.green = 0;
    regLineColor.rgb.blue = 0;

    function drawSquareMark(x, y) {
        var markLayer = doc.artLayers.add();
        doc.selection.select([
            [x, y],
            [x + squareSize, y],
            [x + squareSize, y + squareSize],
            [x, y + squareSize],
        ]);
        doc.selection.fill(regLineColor);
        doc.selection.deselect();
        markLayer.name = "SilhouetteRegMarkSquare";
    }

    function drawLMark(x, y, corner) {
        var markLayer = doc.artLayers.add();

        if (corner === "topRight") {
            // ┐ shape
            doc.selection.select([
                [x, y],
                [x + regLength, y],
                [x + regLength, y + regThickness],
                [x, y + regThickness],
            ]);
            doc.selection.fill(regLineColor);
            doc.selection.deselect();

            doc.selection.select([
                [x + regLength - regThickness, y],
                [x + regLength, y],
                [x + regLength, y + regLength],
                [x + regLength - regThickness, y + regLength],
            ]);
            doc.selection.fill(regLineColor);
            doc.selection.deselect();
        } else if (corner === "bottomLeft") {
            // └ shape
            doc.selection.select([
                [x, y + regLength - regThickness],
                [x + regLength, y + regLength - regThickness],
                [x + regLength, y + regLength],
                [x, y + regLength],
            ]);
            doc.selection.fill(regLineColor);
            doc.selection.deselect();

            doc.selection.select([
                [x, y],
                [x + regThickness, y],
                [x + regThickness, y + regLength],
                [x, y + regLength],
            ]);
            doc.selection.fill(regLineColor);
            doc.selection.deselect();
        }

        markLayer.name = "SilhouetteRegMarkL";
    }

    drawSquareMark(insetX, insetY); // top-left
    drawLMark(pageWidthPx - insetX - regLength, insetY, "topRight"); // top-right ┐
    drawLMark(insetX, pageHeightPx - insetY - regLength, "bottomLeft"); // bottom-left └
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
for (var i = 0; i < totalCards; i++) {
    var group = doc.layerSets.add();
    group.name = "Card Group " + (i + 1);

    var slotNumber = i + 1;
    var isExcluded = excludedSlots[slotNumber] === true;
    var cardHadImage = false;

    //var x = (i % cols) * cardWhome + cardStartX;
    //var y = Math.floor(i / cols) * cardHhome + cardStartY;

    var x = (i % cols) * cardDisplayW + cardStartX;
    var y = Math.floor(i / cols) * cardDisplayH + cardStartY;

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

    if (cardFiles != null && imageIndex < cardFiles.length) {
        var currentFile = cardFiles[imageIndex];

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
            y
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
        baseLayer.move(group, ElementPlacement.INSIDE);
    } else {
        // Fallback blank card
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

    // === Brightness/Contrast Adjustment ===
    if (addPerCardAdjustLayer) {
        addBrightnessContrastAdjustment(
            0, // brightness
            0, // contrast
            "Brightness/Contrast for Card " + (i + 1),
            group,
            true // clip to card image
        );
    }    

    // === Vibrance Adjustment ===
    if (addPerCardAdjustLayer) {
        addVibranceAdjustment(
            0, // vibrance
            0, // saturation
            "Vibrance for Card " + (i + 1),
            group,
            true // clip to card image
        );
    }   

    // === Load and position CutMarkOverlay.png if not excluded ===
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
            drawCropMark(corners[c][0], corners[c][1], markSize);
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
if (useSilhouette && cardFormat != "NoBleed") {
    var triangleLayer = doc.artLayers.add();
    triangleLayer.name = "Detection Triangle";

    // Triangle color (white)
    var white = new SolidColor();
    white.rgb.red = 255;
    white.rgb.green = 255;
    white.rgb.blue = 255;
    app.foregroundColor = white;

    // Find position of lower-left card
    var leftCardX = cardStartX;
    var leftCardY = cardStartY + (rows - 1) * cardHhome;

    // Triangle size (in pixels)
    var triangleSize = mmToPixels(2.75);
    var offset = 2;

    // Triangle points (offset slightly outside card edge)
    var p1 = [leftCardX - offset, leftCardY + cardHhome + offset]; // bottom-left
    var p2 = [p1[0] + triangleSize, p1[1]]; // bottom-right
    var p3 = [p1[0], p1[1] - triangleSize]; // top-left

    // Draw filled triangle
    doc.selection.select([p1, p2, p3]);
    doc.selection.fill(app.foregroundColor);
    doc.selection.deselect();
}

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
