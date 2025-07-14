
// === Convert MM to Pixels ===
function mmToPixels(mm) {
    return Math.round((mm / 25.4) * dpi);
}

function getCardOffsetX(x) {
    if (cardFormat === "NoBleed" && useSilhouette) return x + mmToPixels(3);
    if (cardFormat === "NoBleed") return x + mmToPixels(1);
    return x;
}

function getCardOffsetY(y) {
    if (cardFormat === "NoBleed" && useSilhouette) return y + mmToPixels(3);
    if (cardFormat === "NoBleed") return y + mmToPixels(1);
    return y;
}

function addBrightnessContrastAdjustment(
    brightVal,
    contrVal,
    layerName,
    targetGroup,
    clipToLayer
) {
    // Prepare a new Brightness/Contrast adjustment layer descriptor
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(stringIDToTypeID("adjustmentLayer"));
    desc.putReference(charIDToTypeID("null"), ref);
    // Inner descriptors for the adjustment settings
    var desc2 = new ActionDescriptor();
    var desc3 = new ActionDescriptor();
    desc3.putInteger(charIDToTypeID("Brgh"), brightVal); // Brightness value
    desc3.putInteger(charIDToTypeID("Cntr"), contrVal); // Contrast value
    desc2.putObject(charIDToTypeID("Type"), charIDToTypeID("BrgC"), desc3);
    desc.putObject(
        charIDToTypeID("Usng"),
        stringIDToTypeID("adjustmentLayer"),
        desc2
    );
    // Create the adjustment layer
    executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
    // The newly created layer becomes the activeLayer
    var newLayer = app.activeDocument.activeLayer;
    if (layerName) newLayer.name = layerName; // Name the layer if provided
    if (targetGroup) newLayer.move(targetGroup, ElementPlacement.INSIDE);
    if (clipToLayer) newLayer.grouped = true; // Clip to layer below if requested
    return newLayer;
}

function addVibranceAdjustment(
    vibVal,
    satVal,
    layerName,
    targetGroup,
    clipToLayer
) {
    // Prepare a new Vibrance adjustment layer descriptor
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(stringIDToTypeID("adjustmentLayer"));
    desc.putReference(charIDToTypeID("null"), ref);
    // Inner descriptors for vibrance settings
    var desc2 = new ActionDescriptor();
    var desc3 = new ActionDescriptor();
    desc3.putInteger(stringIDToTypeID("vibrance"), vibVal); // Vibrance value
    desc3.putInteger(stringIDToTypeID("saturation"), satVal); // Saturation value
    desc2.putObject(
        charIDToTypeID("Type"),
        stringIDToTypeID("vibrance"),
        desc3
    );
    desc.putObject(
        charIDToTypeID("Usng"),
        stringIDToTypeID("adjustmentLayer"),
        desc2
    );
    // Create the adjustment layer
    executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
    var newLayer = app.activeDocument.activeLayer;
    if (layerName) newLayer.name = layerName;
    if (targetGroup) newLayer.move(targetGroup, ElementPlacement.INSIDE);
    if (clipToLayer) newLayer.grouped = true;
    return newLayer;
}

function addLevelsAdjustmentLayer(blackPoint, whitePoint, gamma, targetGroup) {
    var makeDesc = new ActionDescriptor();
    var adjLayerRef = new ActionReference();
    adjLayerRef.putClass(charIDToTypeID("AdjL"));
    makeDesc.putReference(charIDToTypeID("null"), adjLayerRef);

    var typeDesc = new ActionDescriptor();
    var lvlDesc = new ActionDescriptor();
    lvlDesc.putEnumerated(
        stringIDToTypeID("presetKind"),
        stringIDToTypeID("presetKindType"),
        stringIDToTypeID("presetKindDefault")
    );

    typeDesc.putObject(charIDToTypeID("Type"), charIDToTypeID("Lvls"), lvlDesc);
    makeDesc.putObject(
        charIDToTypeID("Usng"),
        charIDToTypeID("AdjL"),
        typeDesc
    );
    executeAction(charIDToTypeID("Mk  "), makeDesc, DialogModes.NO);

    // Move to group if specified
    var newLayer = app.activeDocument.activeLayer;
    if (targetGroup) {
        newLayer.move(targetGroup, ElementPlacement.INSIDE);
    }

    // Custom settings
    var setDesc = new ActionDescriptor();
    var targetRef = new ActionReference();
    targetRef.putEnumerated(
        charIDToTypeID("AdjL"),
        charIDToTypeID("Ordn"),
        charIDToTypeID("Trgt")
    );
    setDesc.putReference(charIDToTypeID("null"), targetRef);

    var valsDesc = new ActionDescriptor();
    valsDesc.putEnumerated(
        stringIDToTypeID("presetKind"),
        stringIDToTypeID("presetKindType"),
        stringIDToTypeID("presetKindCustom")
    );

    var channelList = new ActionList();
    var chDesc = new ActionDescriptor();
    var chRef = new ActionReference();
    chRef.putEnumerated(
        charIDToTypeID("Chnl"),
        charIDToTypeID("Chnl"),
        charIDToTypeID("Cmps")
    );
    chDesc.putReference(charIDToTypeID("Chnl"), chRef);

    var inList = new ActionList();
    inList.putInteger(blackPoint);
    inList.putInteger(whitePoint);
    chDesc.putList(charIDToTypeID("Inpt"), inList);

    chDesc.putDouble(charIDToTypeID("Gmm "), gamma);
    channelList.putObject(charIDToTypeID("LvlA"), chDesc);
    valsDesc.putList(charIDToTypeID("Adjs"), channelList);
    setDesc.putObject(charIDToTypeID("T   "), charIDToTypeID("Lvls"), valsDesc);
    executeAction(charIDToTypeID("setd"), setDesc, DialogModes.NO);
}

// RE_HelperFunctions.jsx
function placeImageInDocument(
    imageFile,
    targetWidthPx,
    targetHeightPx,
    cropMarginPx,
    destDoc,
    destGroup,
    layerName,
    posX,
    posY
) {
    // Open the image file as a new document
    var imgDoc = app.open(imageFile);
    // Resize if target dimensions are provided
    if (targetWidthPx && targetHeightPx) {
        imgDoc.resizeImage(
            UnitValue(targetWidthPx, "px"),
            UnitValue(targetHeightPx, "px"),
            null,
            ResampleMethod.BICUBIC
        );
    }
    // Crop margins from all sides if requested (e.g., to remove bleed)
    if (cropMarginPx && cropMarginPx > 0) {
        imgDoc.crop([
            cropMarginPx,
            cropMarginPx,
            imgDoc.width - cropMarginPx,
            imgDoc.height - cropMarginPx,
        ]);
    }
    // Copy all contents and close the source document without saving
    imgDoc.selection.selectAll();
    imgDoc.selection.copy();
    imgDoc.close(SaveOptions.DONOTSAVECHANGES);
    // Ensure the destination document is active, then paste
    if (destDoc) app.activeDocument = destDoc;
    app.activeDocument.paste();
    var newLayer = app.activeDocument.activeLayer;
    if (layerName) newLayer.name = layerName;
    // Position the layer so its top-left corner is at (posX, posY)
    if (typeof posX !== "undefined" && typeof posY !== "undefined") {
        newLayer.translate(
            posX - newLayer.bounds[0].as("px"),
            posY - newLayer.bounds[1].as("px")
        );
    }
    if (destGroup) newLayer.move(destGroup, ElementPlacement.INSIDE);
    return newLayer;
}

function drawCropMark(x, y, size, armThickness, armLength) {
    var doc = app.activeDocument;
    var markLayer = doc.artLayers.add();
    markLayer.name = "CropMark_" + x + "_" + y;

    var thickness =
        typeof armThickness === "number" ? armThickness : Math.round(size / 11);
    var length = typeof armLength === "number" ? armLength : size;

    var centerSize = Math.round(size / 5);
    var tipLength = Math.round(size / 7);

    // Define colors
    var yellow = new SolidColor();
    yellow.rgb.red = 252;
    yellow.rgb.green = 255;
    yellow.rgb.blue = 0;

    var red = new SolidColor();
    red.rgb.red = 255;
    red.rgb.green = 0;
    red.rgb.blue = 0;

    var black = new SolidColor();
    black.rgb.red = 0;
    black.rgb.green = 0;
    black.rgb.blue = 0;

    // === Yellow Arms ===
    var yellowRegions = [];

    // Horizontal arm
    var hLeft = x - Math.round(length / 2);
    var hRight = x + Math.round(length / 2);
    var hTop = y - Math.round(thickness / 2);
    var hBottom = y + Math.round(thickness / 2);
    yellowRegions.push([
        [hLeft, hTop],
        [hRight, hTop],
        [hRight, hBottom],
        [hLeft, hBottom],
    ]);

    // Vertical arm
    var vTop = y - Math.round(length / 2);
    var vBottom = y + Math.round(length / 2);
    var vLeft = x - Math.round(thickness / 2);
    var vRight = x + Math.round(thickness / 2);
    yellowRegions.push([
        [vLeft, vTop],
        [vRight, vTop],
        [vRight, vBottom],
        [vLeft, vBottom],
    ]);

    // Fill yellow areas
    doc.selection.select(yellowRegions[0]);
    for (var i = 1; i < yellowRegions.length; i++) {
        doc.selection.select(yellowRegions[i], SelectionType.EXTEND);
    }
    doc.selection.fill(yellow);
    doc.selection.deselect();

    // === Red End Caps ===
    var redRegions = [];

    // Left + Right tips (horizontal ends)
    redRegions.push([
        [hLeft, hTop],
        [hLeft + tipLength, hTop],
        [hLeft + tipLength, hBottom],
        [hLeft, hBottom],
    ]);
    redRegions.push([
        [hRight - tipLength, hTop],
        [hRight, hTop],
        [hRight, hBottom],
        [hRight - tipLength, hBottom],
    ]);

    // Top + Bottom tips (vertical ends)
    redRegions.push([
        [vLeft, vTop],
        [vRight, vTop],
        [vRight, vTop + tipLength],
        [vLeft, vTop + tipLength],
    ]);
    redRegions.push([
        [vLeft, vBottom - tipLength],
        [vRight, vBottom - tipLength],
        [vRight, vBottom],
        [vLeft, vBottom],
    ]);

    // Fill red tips
    doc.selection.select(redRegions[0]);
    for (var j = 1; j < redRegions.length; j++) {
        doc.selection.select(redRegions[j], SelectionType.EXTEND);
    }
    doc.selection.fill(red);
    doc.selection.deselect();

    // === Center Dot ===
    var dotLeft = x - Math.round(centerSize / 2);
    var dotRight = x + Math.round(centerSize / 2);
    var dotTop = y - Math.round(centerSize / 2);
    var dotBottom = y + Math.round(centerSize / 2);
    doc.selection.select([
        [dotLeft, dotTop],
        [dotRight, dotTop],
        [dotRight, dotBottom],
        [dotLeft, dotBottom],
    ]);
    doc.selection.fill(black);
    doc.selection.deselect();

    return markLayer;
}

function drawCardBackground(
    x,
    y,
    width,
    height,
    fillColor,
    layerName,
    targetGroup
) {
    var doc = app.activeDocument;
    var layer = doc.artLayers.add();
    if (layerName) layer.name = layerName;

    doc.selection.select([
        [x, y],
        [x + width, y],
        [x + width, y + height],
        [x, y + height],
    ]);

    doc.selection.fill(fillColor);
    doc.selection.deselect();

    if (targetGroup) {
        layer.move(targetGroup, ElementPlacement.INSIDE);
    }

    return layer;
}

function shiftEntireDocumentByOffset(xOffsetPx, yOffsetPx) {
    var doc = app.activeDocument;

    // Move top-level artLayers, skipping background and adjustment layers
    for (var i = 0; i < doc.artLayers.length; i++) {
        var layer = doc.artLayers[i];
        var name = layer.name.toLowerCase();

        if (
            !layer.isBackgroundLayer &&
            name.indexOf("brightness/contrast for card") !== 0 &&
            name.indexOf("vibrance for card") !== 0
        ) {
            try {
                layer.translate(xOffsetPx, yOffsetPx);
            } catch (e) {
                // Skip on error
            }
        }
    }

    // Move top-level groups, skip "Sheet Adjustments"
    for (var j = 0; j < doc.layerSets.length; j++) {
        var group = doc.layerSets[j];
        var groupName = group.name.toLowerCase();

        if (groupName !== "sheet adjustments") {
            try {
                group.translate(xOffsetPx, yOffsetPx);
            } catch (e) {
                // Skip on error
            }
        }
    }
}

// === Silhouette Suppor ===
function placeSilhouettePSDLayer(doc, scriptFolder) {
    try {
        var regFile = File(scriptFolder + "/Assets/SIL_LETTER_REG.psd");
        if (!regFile.exists) throw new Error("Silhouette registration PSD not found.");

        app.activeDocument = doc; // Make sure it's the frontmost doc

        // Place as smart object
        var idPlc = charIDToTypeID("Plc ");
        var desc = new ActionDescriptor();

        desc.putPath(charIDToTypeID("null"), regFile);
        desc.putEnumerated(charIDToTypeID("FTcs"), charIDToTypeID("QCSt"), charIDToTypeID("Qcsa")); // Align center
        desc.putUnitDouble(charIDToTypeID("Wdth"), charIDToTypeID("#Prc"), 100.0);
        desc.putUnitDouble(charIDToTypeID("Hght"), charIDToTypeID("#Prc"), 100.0);
        desc.putBoolean(charIDToTypeID("Lnkd"), false); // Not linked, embed directly

        executeAction(idPlc, desc, DialogModes.NO);

        // Rename the layer
        doc.activeLayer.name = "Silhouette Registration Marks";

    } catch (e) {
        alert("❌ Failed to place Silhouette registration PSD as Smart Object:\n" + e.message);
    }
}

function placeSilhouetteDetectionAid(doc, scriptFolder, x, y, dpi) {
    try {
        var aidFile = File(scriptFolder + "/Assets/SIL_Detection_Aid.png");
        if (!aidFile.exists) throw new Error("Detection aid PNG not found.");

        app.activeDocument = doc;

        // Open PNG temporarily
        var imgDoc = app.open(aidFile);

        // Calculate desired size in pixels
        var baseDPI = 800.0;
        var scaleFactor = dpi / baseDPI;

        var targetWidth = imgDoc.width.as("px") * scaleFactor;
        var targetHeight = imgDoc.height.as("px") * scaleFactor;

        imgDoc.resizeImage(
            UnitValue(targetWidth, "px"),
            UnitValue(targetHeight, "px"),
            null,
            ResampleMethod.BICUBIC
        );

        imgDoc.selection.selectAll();
        imgDoc.selection.copy();
        imgDoc.close(SaveOptions.DONOTSAVECHANGES);

        app.activeDocument = doc;
        doc.paste();
        var pastedLayer = doc.activeLayer;
        pastedLayer.name = "Silhouette Detection Aid";

        // Align to (x, y) = bottom-left corner
        var layerWidth = pastedLayer.bounds[2].as("px") - pastedLayer.bounds[0].as("px");
        var layerHeight = pastedLayer.bounds[3].as("px") - pastedLayer.bounds[1].as("px");

        pastedLayer.translate(
            x - pastedLayer.bounds[0].as("px"),
            y - pastedLayer.bounds[1].as("px") - (layerHeight / 2.15)
        );
        pastedLayer.move(doc, ElementPlacement.PLACEATBEGINNING);

    } catch (e) {
        alert("⚠️ Detection Aid PNG failed to place:\n" + e.message);
    }
}

// === Export Singles Function ===
// If exportSingles = true, this function will run instead of the normal layout process.
// It will open each image in a selected folder, crop the bleed if MPC, and export to JPG or PNG.

function addNoBleedPadding(doc, bleedSizePx, mode) {
    try {
        // Step 1: Get background color BEFORE resizing canvas
        var borderColor = getEdgeAverageDarkColor(doc); // Sample edge from current card

        // Step 2: Resize canvas outward
        // Step 1: Sample border color BEFORE resizing
        var sampledColor = getEdgeAverageDarkColor(doc);

        // Step 2: Resize canvas outward
        var origWidth = doc.width.as("px");
        var origHeight = doc.height.as("px");
        var newWidth = origWidth + bleedSizePx * 2;
        var newHeight = origHeight + bleedSizePx * 2;
        doc.resizeCanvas(UnitValue(newWidth, "px"), UnitValue(newHeight, "px"), AnchorPosition.MIDDLECENTER);

        // Step 3: Create fill layer with sampled color
        if (mode === "Black") {
            var bleedLayer = doc.artLayers.add();
            bleedLayer.name = "Bleed Fill";
            bleedLayer.move(doc, ElementPlacement.PLACEATEND);

            doc.selection.selectAll();
            doc.selection.fill(sampledColor);
            doc.selection.deselect();

        }

    } catch (e) {
        // Fails silently
    }
}


function getEdgeAverageDarkColor(doc) {
    var sampler = doc.colorSamplers;
    sampler.removeAll();

    var w = doc.width.as("px");
    var h = doc.height.as("px");

    // Adjusted wing sample points - avoid corners
    var wingMarginX = Math.round(w * 0.03);  // 3% in from sides
    var wingHeight = Math.round(h * 0.93);  // 93% down from top

    var points = [
        [wingMarginX, wingHeight],           // left wing
        [w - wingMarginX, wingHeight],       // right wing
        [wingMarginX, wingHeight - 5],      // above left wing
        [w - wingMarginX, wingHeight - 5]   // above right wing
    ];

    var minR = 255, minG = 255, minB = 255;

    for (var i = 0; i < points.length; i++) {
        var s = sampler.add([UnitValue(points[i][0], "px"), UnitValue(points[i][1], "px")]);
        var c = s.color.rgb;
        if (c.red < minR) minR = c.red;
        if (c.green < minG) minG = c.green;
        if (c.blue < minB) minB = c.blue;
    }

    sampler.removeAll();

    var darkColor = new SolidColor();
    darkColor.rgb.red = minR;
    darkColor.rgb.green = minG;
    darkColor.rgb.blue = minB;

//    alert("Sampled RGB (min): " + Math.round(minR) + ", " + Math.round(minG) + ", " + Math.round(minB));

    if (minR <= 250 && minG <= 250 && minB <= 250) {
        return darkColor;
    } else {
        var black = new SolidColor();
        black.rgb.red = 0;
        black.rgb.green = 0;
        black.rgb.blue = 0;
        return black;
    }
}

function exportSinglesFromFolder(config) {
    var dpi = config.dpi || 800;
    var cropBleed = config.cardFormat === "MPC";
    var cropMarginPx = cropBleed ? mmToPixels(config.silhouetteBleedAdjust || 3.0) : 0;
    var cardWidthPx = mmToPixels(config.cardWidthMM || 69);
    var cardHeightPx = mmToPixels(config.cardHeightMM || 94);
    var exportFormat = (config.exportFormat || "jpg").toLowerCase();
    var debugOn = config.debugOn === true;
    var noBleedAddBleed = config.noBleedAddBleed || "";

    var bright = typeof config.bright === "number" ? config.bright : 0;
    var contr = typeof config.contr === "number" ? config.contr : 0;
    var vib = typeof config.vib === "number" ? config.vib : 0;
    var sat = typeof config.sat === "number" ? config.sat : 0;
    var gmm = typeof config.gmm === "number" ? config.gmm : 1.0;
    var whitepoint = typeof config.whitepoint === "number" ? config.whitepoint : 255;
    var blackpoint = typeof config.blackpoint === "number" ? config.blackpoint : 0;

    var inputFolder = Folder.selectDialog("Select a folder containing card images to export");
    if (!inputFolder) {
        alert("No folder selected. Exiting.");
        return;
    }

    var files = inputFolder.getFiles(function(f) {
        return f instanceof File && f.name.match(/\.(png|jpg|jpeg)$/i);
    });

    if (files.length === 0) {
        alert("No image files found in the folder.");
        return;
    }

    var outputFolder = Folder.selectDialog("Select an output folder for the exported images");
    if (!outputFolder) {
        alert("No output folder selected. Exiting.");
        return;
    }

    for (var i = 0; i < files.length; i++) {
        var imgFile = files[i];
        var doc = open(imgFile);
        doc.resizeImage(UnitValue(cardWidthPx, "px"), UnitValue(cardHeightPx, "px"), null, ResampleMethod.BICUBIC);

        if (cropMarginPx > 0) {
            doc.crop([
                cropMarginPx,
                cropMarginPx,
                doc.width - cropMarginPx,
                doc.height - cropMarginPx
            ]);
        }

        if (config.cardFormat === "NoBleed" && (noBleedAddBleed === "Black" || noBleedAddBleed === "AI")) {
            var bleedPx = mmToPixels(3.0);
            addNoBleedPadding(doc, bleedPx, noBleedAddBleed);
        }

        doc.resizeImage(null, null, dpi, ResampleMethod.NONE);

        if (bright !== 0 || contr !== 0) {
            addBrightnessContrastAdjustment(bright, contr, "Brightness/Contrast", null, false);
        }
        if (vib !== 0 || sat !== 0) {
            addVibranceAdjustment(vib, sat, "Vibrance", null, false);
        }
        if (gmm !== 1.0 || whitepoint !== 255 || blackpoint !== 0) {
            addLevelsAdjustment(gmm, whitepoint, blackpoint, "Levels", null, false);
        }

        if (debugOn) {
            alert("DEBUG: Previewing " + imgFile.name + "\nDPI: " + dpi +
                "\nBright: " + bright + " | Contrast: " + contr +
                "\nVibrance: " + vib + " | Saturation: " + sat +
                "\nGamma: " + gmm + " | Whitepoint: " + whitepoint + " | Blackpoint: " + blackpoint);
        }

        doc.flatten();

        var baseName = imgFile.name.replace(/\.[^\.]+$/, "");
        var saveFile = new File(outputFolder + "/" + baseName + "." + exportFormat);

        var suffix = 1;
        while (saveFile.exists) {
            saveFile = new File(outputFolder + "/" + baseName + "_" + suffix + "." + exportFormat);
            suffix++;
        }

        if (exportFormat === "jpg" || exportFormat === "jpeg") {
            var jpgOpts = new JPEGSaveOptions();
            jpgOpts.quality = 12;
            jpgOpts.embedColorProfile = true;
            jpgOpts.formatOptions = FormatOptions.STANDARDBASELINE;
            jpgOpts.scans = 3;
            doc.saveAs(saveFile, jpgOpts, true);

        } else if (exportFormat === "png") {
            var pngOpts = new PNGSaveOptions();
            doc.saveAs(saveFile, pngOpts, true);

        } else {
            alert("Unsupported export format: " + exportFormat);
            doc.close(SaveOptions.DONOTSAVECHANGES);
            return;
        }

        doc.close(SaveOptions.DONOTSAVECHANGES);
    }

    alert("Export complete: " + files.length + " files processed.");
}
