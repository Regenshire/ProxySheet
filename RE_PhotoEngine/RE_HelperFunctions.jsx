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


