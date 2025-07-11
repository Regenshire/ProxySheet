// === REGEN PHOTOSHOP MTG PRINT LAYOUT ENGINE v3.2 ===
// --- This file contains the code for the script.  The Config scripts must use an #include to this script to operate

// === Page Size Calculations ===
if (layout === "horizontal") {
    // Swap width and height for landscape
    var temp = pageWidthInches;
    pageWidthInches = pageHeightInches;
    pageHeightInches = temp;
}

var inchToPx = function(inches) { return Math.round(inches * dpi); };

var pageWidthPx = inchToPx(pageWidthInches);  // 2550 at 300 DPI, 6800 at 800 DPI
var pageHeightPx = inchToPx(pageHeightInches); // 3300 at 300 DPI, 8800 at 800 DPI

// === Layout-specific values ===
var rows = layout === "vertical" ? 3 : 2;
var cols = layout === "vertical" ? 3 : 4;
var totalCards = rows * cols;
var insetInches = 0.394;		// distance specified in Silhouette for Registration Mark Inset
var insetMM = insetInches * 25.4; // ≈ 10 mm
var insetX = mmToPixels(insetMM); 		// distance from left edge to reg mark
var insetY = mmToPixels(insetMM); 		// distance from top edge to reg mark

// === Convert MM to Pixels ===
function mmToPixels(mm) {
    return Math.round((mm / 25.4) * dpi);
}

// var cardW = mmToPixels(cardWidthMM - (useSilhouette ? silhouetteBleedAdjust * 2 : 0));
// var cardH = mmToPixels(cardHeightMM - (useSilhouette ? silhouetteBleedAdjust * 2 : 0));
var cardW = mmToPixels(cardWidthMM);  // 69 mm
var cardH = mmToPixels(cardHeightMM); // 94 mm
var cardWhome = mmToPixels(cardWidthMM - (useSilhouette ? silhouetteBleedAdjust * 2 : 0));
var cardHhome = mmToPixels(cardHeightMM - (useSilhouette ? silhouetteBleedAdjust * 2 : 0));

//var docW = cardW * cols;
var docW = cardWhome * cols;

var regLength = mmToPixels(7.70); //7.62
var regThickness = mmToPixels(1.1); //1.0
var regOffset = mmToPixels(5);
var squareSize = mmToPixels(5.8);  // 5.5
//var silhouetteMargin = useSilhouette ? regOffset + regLength + mmToPixels(silhouetteBleedAdjust) : 0;

var docH = useSilhouette ? cardHhome * rows + insetY * 2 : cardHhome * rows;
//var docH = cardHhome * rows + (useSilhouette ? silhouetteMargin * 2 : 0);


var white = new SolidColor();
white.rgb.red = 255;
white.rgb.green = 255;
white.rgb.blue = 255;

var doc = app.documents.add(pageWidthPx, pageHeightPx, dpi, "ProxySheet", NewDocumentMode.RGB);

var scriptFolder = File($.fileName).parent;
var cardFiles = File.openDialog("Select up to " + totalCards + " card images in order (left to right, top to bottom)", undefined, true);

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
          [x, y + squareSize]
        ]);
        doc.selection.fill(regLineColor);
        doc.selection.deselect();
        markLayer.name = "SilhouetteRegMarkSquare";
    }

    function drawLMark(x, y, corner) {
        var markLayer = doc.artLayers.add();

        if (corner === "topRight") {
            // ┐ shape
            doc.selection.select([[x, y], [x + regLength, y], [x + regLength, y + regThickness], [x, y + regThickness]]);
            doc.selection.fill(regLineColor);
            doc.selection.deselect();

            doc.selection.select([[x + regLength - regThickness, y], [x + regLength, y], [x + regLength, y + regLength], [x + regLength - regThickness, y + regLength]]);
            doc.selection.fill(regLineColor);
            doc.selection.deselect();
        } else if (corner === "bottomLeft") {
            // └ shape
            doc.selection.select([[x, y + regLength - regThickness], [x + regLength, y + regLength - regThickness], [x + regLength, y + regLength], [x, y + regLength]]);
            doc.selection.fill(regLineColor);
            doc.selection.deselect();

            doc.selection.select([[x, y], [x + regThickness, y], [x + regThickness, y + regLength], [x, y + regLength]]);
            doc.selection.fill(regLineColor);
            doc.selection.deselect();
        }

        markLayer.name = "SilhouetteRegMarkL";
    }

//     drawSquareMark(regOffset, regOffset); // top-left (square)
    // drawLMark(doc.width - regOffset - regLength, regOffset, "topRight"); // top-right ┐
    // drawLMark(regOffset, doc.height - regOffset - regLength, "bottomLeft"); // bottom-left └
    drawSquareMark(insetX, insetY); // top-left
    drawLMark(pageWidthPx - insetX - regLength, insetY, "topRight"); // top-right ┐
    drawLMark(insetX, pageHeightPx - insetY - regLength, "bottomLeft"); // bottom-left └
}

// === Calculate card vertical offset ===
//var silhouetteInsetPx = silhouetteMargin;
var silhouetteInsetPx = useSilhouette ? insetX : 0;

// Total width/height of card block (not the document)
var cardBlockW = (cardWhome * cols);
var cardBlockH = (cardHhome * rows);

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
for (var i = 0; i < totalCards; i++) {
    var group = doc.layerSets.add();
    group.name = "Card Group " + (i + 1);

    var x = (i % cols) * cardWhome + cardStartX;
    var y = Math.floor(i / cols) * cardHhome + cardStartY;

    var baseLayer;

    if (cardFiles != null && i < cardFiles.length) {
        var img = app.open(cardFiles[i]);
        if (useSilhouette) {
	    // RESIZE TO THE ORIGINAL SIZE
	    img.resizeImage(UnitValue(cardW, "px"), UnitValue(cardH, "px"), null, ResampleMethod.BICUBIC);
            // MODIFY THE IMAGE BY CROPPING OUT THE SIDE BY THE AMOUNT OF THE BLEED ADJUST
            var trimPx = mmToPixels(silhouetteBleedAdjust);
            img.crop([trimPx, trimPx, img.width - trimPx, img.height - trimPx]);
        }
	else {
		img.resizeImage(UnitValue(cardW, "px"), UnitValue(cardH, "px"), null, ResampleMethod.BICUBIC);
	}
        
        img.selection.selectAll();
        img.selection.copy();
        img.close(SaveOptions.DONOTSAVECHANGES);

        doc.paste();
        baseLayer = doc.activeLayer;
        baseLayer.name = "Card " + (i + 1);
        baseLayer.translate(x - baseLayer.bounds[0].as("px"), y - baseLayer.bounds[1].as("px"));
        baseLayer.move(group, ElementPlacement.INSIDE);
    } else {
        baseLayer = doc.artLayers.add();
        baseLayer.name = "Blank " + (i + 1);
        doc.selection.select([[x, y], [x + cardWhome, y], [x + cardW, y + cardWhome], [x, y + cardHhome]]);
        doc.selection.fill(white);
        doc.selection.deselect();
        baseLayer.move(group, ElementPlacement.INSIDE);
    }

    // === Brightness/Contrast Adjustment ===
    var bcDesc = new ActionDescriptor();
    var bcRef = new ActionReference();
    bcRef.putClass(stringIDToTypeID("adjustmentLayer"));
    bcDesc.putReference(charIDToTypeID("null"), bcRef);
    var bcInnerDesc = new ActionDescriptor();
    var bcSettings = new ActionDescriptor();
    bcSettings.putInteger(charIDToTypeID("Brgh"), 0);
    bcSettings.putInteger(charIDToTypeID("Cntr"), 0);
    bcInnerDesc.putObject(charIDToTypeID("Type"), charIDToTypeID("BrgC"), bcSettings);
    bcDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("adjustmentLayer"), bcInnerDesc);
    executeAction(charIDToTypeID("Mk  "), bcDesc, DialogModes.NO);
    var bcLayer = doc.activeLayer;
    bcLayer.name = "Brightness/Contrast for Card " + (i + 1);
    bcLayer.move(group, ElementPlacement.INSIDE);
    bcLayer.grouped = true;

    // === Vibrance Adjustment ===
    var vibDesc = new ActionDescriptor();
    var vibRef = new ActionReference();
    vibRef.putClass(stringIDToTypeID("adjustmentLayer"));
    vibDesc.putReference(charIDToTypeID("null"), vibRef);
    var vibInnerDesc = new ActionDescriptor();
    var vibSettings = new ActionDescriptor();
    vibSettings.putInteger(stringIDToTypeID("vibrance"), 0);
    vibSettings.putInteger(stringIDToTypeID("saturation"), 0);
    vibInnerDesc.putObject(charIDToTypeID("Type"), stringIDToTypeID("vibrance"), vibSettings);
    vibDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("adjustmentLayer"), vibInnerDesc);
    executeAction(charIDToTypeID("Mk  "), vibDesc, DialogModes.NO);
    var vibLayer = doc.activeLayer;
    vibLayer.name = "Vibrance for Card " + (i + 1);
    vibLayer.move(group, ElementPlacement.INSIDE);
    vibLayer.grouped = true;

    // === Load and position 01-CutMarkOverlay.png at each card corner ===
    if (showCropMarks) {
        var markFile = File(scriptFolder + "/01-CutMarkOverlay.png");
        if (markFile.exists) {
            var markSize = mmToPixels(cutMarkSize);
            var adjustedCutOffset = cutOffset - (useSilhouette ? silhouetteBleedAdjust : 0);
            var offset = mmToPixels(adjustedCutOffset);
            // var offset = mmToPixels(cutOffset);
            var corners = [
                [x + offset - markSize / 2, y + offset - markSize / 2], // top-left
                [x + cardWhome - offset - markSize / 2, y + offset - markSize / 2], // top-right
                [x + offset - markSize / 2, y + cardHhome - offset - markSize / 2], // bottom-left
                [x + cardWhome - offset - markSize / 2, y + cardHhome - offset - markSize / 2] // bottom-right
            ];

            for (var c = 0; c < corners.length; c++) {
                var cutMark = app.open(markFile);
                cutMark.resizeImage(UnitValue(markSize, "px"), UnitValue(markSize, "px"), null, ResampleMethod.BICUBIC);
                cutMark.selection.selectAll();
                cutMark.selection.copy();
                cutMark.close(SaveOptions.DONOTSAVECHANGES);

                doc.paste();
                var markLayer = doc.activeLayer;
                markLayer.name = "CutMark " + (i + 1) + " - " + c;
                markLayer.translate(corners[c][0] - markLayer.bounds[0].as("px"), corners[c][1] - markLayer.bounds[1].as("px"));
                markLayer.move(group, ElementPlacement.INSIDE);
            }
        }
    }
}

// === Create Brightness/Contrast Adjustment Layer ===
(function () {
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(stringIDToTypeID("adjustmentLayer"));
    desc.putReference(charIDToTypeID("null"), ref);

    var desc2 = new ActionDescriptor();
    var desc3 = new ActionDescriptor();

    desc3.putInteger(charIDToTypeID("Brgh"), bright);
    desc3.putInteger(charIDToTypeID("Cntr"), contr);

    desc2.putObject(charIDToTypeID("Type"), charIDToTypeID("BrgC"), desc3);
    desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("adjustmentLayer"), desc2);

    executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
})();

// === Create Vibrance Adjustment Layer ===
(function () {
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(stringIDToTypeID("adjustmentLayer"));
    desc.putReference(charIDToTypeID("null"), ref);

    var desc2 = new ActionDescriptor();
    var desc3 = new ActionDescriptor();

    desc3.putInteger(stringIDToTypeID("vibrance"), vib);
    desc3.putInteger(stringIDToTypeID("saturation"), sat);

    desc2.putObject(charIDToTypeID("Type"), stringIDToTypeID("vibrance"), desc3);
    desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("adjustmentLayer"), desc2);

    executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
})();

// Create a new Levels Adjustment Layer (empty/default settings)
var makeDesc = new ActionDescriptor();
var adjLayerRef = new ActionReference();
adjLayerRef.putClass(charIDToTypeID("AdjL"));                   // "AdjL" = Adjustment Layer class
makeDesc.putReference(charIDToTypeID("null"), adjLayerRef);
var typeDesc = new ActionDescriptor();
var lvlDesc = new ActionDescriptor();
lvlDesc.putEnumerated(stringIDToTypeID("presetKind"), 
                      stringIDToTypeID("presetKindType"), 
                      stringIDToTypeID("presetKindDefault"));   // use default preset (no custom settings yet)
typeDesc.putObject(charIDToTypeID("Type"), charIDToTypeID("Lvls"), lvlDesc);  // "Lvls" = Levels adjustment
makeDesc.putObject(charIDToTypeID("Usng"), charIDToTypeID("AdjL"), typeDesc);
executeAction(charIDToTypeID("Mk  "), makeDesc, DialogModes.NO);

// Adjust the active Levels adjustment layer's settings
var setDesc = new ActionDescriptor();
var targetRef = new ActionReference();
targetRef.putEnumerated(charIDToTypeID("AdjL"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
setDesc.putReference(charIDToTypeID("null"), targetRef);
var valsDesc = new ActionDescriptor();
valsDesc.putEnumerated(stringIDToTypeID("presetKind"), 
                       stringIDToTypeID("presetKindType"), 
                       stringIDToTypeID("presetKindCustom"));  // now using custom settings

// Specify channel (composite RGB)
var channelList = new ActionList();
var chDesc = new ActionDescriptor();
var chRef = new ActionReference();
chRef.putEnumerated(charIDToTypeID("Chnl"), charIDToTypeID("Chnl"), charIDToTypeID("Cmps"));
chDesc.putReference(charIDToTypeID("Chnl"), chRef);

// Input levels (shadow and highlight)
var inList = new ActionList();
inList.putInteger(blackpoint);    // shadow input (black point)
inList.putInteger(whitepoint);   // highlight input (white point)
chDesc.putList(charIDToTypeID("Inpt"), inList);

// Gamma (midtone)
chDesc.putDouble(charIDToTypeID("Gmm "), gmm);
// [Optional] Output levels (uncomment to use custom output settings)
// var outList = new ActionList();
// outList.putInteger(0);    // shadow output (min output level)
// outList.putInteger(255);  // highlight output (max output level)
// chDesc.putList(charIDToTypeID("Otpt"), outList);
channelList.putObject(charIDToTypeID("LvlA"), chDesc);   // "LvlA" = one levels adjustment entry
valsDesc.putList(charIDToTypeID("Adjs"), channelList);   // "Adjs" = list of adjustments
setDesc.putObject(charIDToTypeID("T   "), charIDToTypeID("Lvls"), valsDesc);
executeAction(charIDToTypeID("setd"), setDesc, DialogModes.NO);

// === Silhouette Registration Improvement Triangle ===
if (useSilhouette) {
    var triangleLayer = doc.artLayers.add();
    triangleLayer.name = "Detection Triangle";

    // Triangle color (white)
    var yellow = new SolidColor();
    yellow.rgb.red = 255;
    yellow.rgb.green = 255;
    yellow.rgb.blue = 255;
    app.foregroundColor = yellow;

    // Find position of lower-left card
    var leftCardX = cardStartX;
    var leftCardY = cardStartY + (rows - 1) * cardHhome;

    // Triangle size (in pixels)
    var triangleSize = mmToPixels(2.5);  // Adjust as needed

    // Define triangle path (bottom-left corner of card)
    var triangle = [
        [leftCardX, leftCardY + cardHhome],                                      // bottom-left corner
        [leftCardX + triangleSize, leftCardY + cardHhome],                      // right of bottom-left
        [leftCardX, leftCardY + cardHhome - triangleSize]                       // up from bottom-left
    ];

    doc.selection.select(triangle);
    doc.selection.fill(app.foregroundColor);
    doc.selection.deselect();
}

// === Add Note Layer in Lower Right ===
if(notesOn) {
    var noteText = "Brightness: " + bright +
               " | Contrast: " + contr +
               " | Vibrance: " + vib +
               " | Saturation: " + sat +
               " | gmm: " + gmm +
               " | whitepoint: " + whitepoint +
               " | blackpoint: " + blackpoint;

	
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

    // ✅ Assign color after defining content/font
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
