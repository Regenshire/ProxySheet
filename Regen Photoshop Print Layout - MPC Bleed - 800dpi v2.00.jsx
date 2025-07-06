// === CONFIG ===
var layout = "vertical"; // "vertical" (3x3) or "horizontal" (2x4)
var cardWidthMM = 69;
var cardHeightMM = 94;
var dpi = 800;

// BLEED SETTINGS
var cutMarkSize = 4.5; // in MM - Default 4.5
var cutOffset = 3.04; // in MM - Default 3.04

// BRIGHTNESS/CONTRAST/COLOR CORRECTION
var bright = 13;
var contr = 20;
var vib = 15;
var sat = 38;

var gmm = 1.05;
var whitepoint = 255;
var blackpoint = 0;




// === Layout-specific values ===
var rows = layout === "vertical" ? 3 : 2;
var cols = layout === "vertical" ? 3 : 4;
var totalCards = rows * cols;

// === Convert MM to Pixels ===
function mmToPixels(mm) {
    return Math.round((mm / 25.4) * dpi);
}

var cardW = mmToPixels(cardWidthMM);
var cardH = mmToPixels(cardHeightMM);
var docW = cardW * cols;
var docH = cardH * rows;

var white = new SolidColor();
white.rgb.red = 255;
white.rgb.green = 255;
white.rgb.blue = 255;

var doc = app.documents.add(docW, docH, dpi, "ProxySheet", NewDocumentMode.RGB);

var scriptFolder = File($.fileName).parent;
var cardFiles = File.openDialog("Select up to " + totalCards + " card images in order (left to right, top to bottom)", undefined, true);

// === Load and place each card ===
for (var i = 0; i < totalCards; i++) {
    var group = doc.layerSets.add();
    group.name = "Card Group " + (i + 1);

    var x = (i % cols) * cardW;
    var y = Math.floor(i / cols) * cardH;
    var baseLayer;

    if (cardFiles != null && i < cardFiles.length) {
        var img = app.open(cardFiles[i]);
        img.resizeImage(UnitValue(cardW, "px"), UnitValue(cardH, "px"), null, ResampleMethod.BICUBIC);
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
        doc.selection.select([[x, y], [x + cardW, y], [x + cardW, y + cardH], [x, y + cardH]]);
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
    var markFile = File(scriptFolder + "/01-CutMarkOverlay.png");
    if (markFile.exists) {
        var markSize = mmToPixels(cutMarkSize);
        var offset = mmToPixels(cutOffset);
        var corners = [
            [x + offset - markSize / 2, y + offset - markSize / 2], // top-left
            [x + cardW - offset - markSize / 2, y + offset - markSize / 2], // top-right
            [x + offset - markSize / 2, y + cardH - offset - markSize / 2], // bottom-left
            [x + cardW - offset - markSize / 2, y + cardH - offset - markSize / 2] // bottom-right
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
