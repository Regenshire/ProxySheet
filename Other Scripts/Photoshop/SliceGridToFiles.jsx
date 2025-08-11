/*  Slice a grid of cards into individual files
    Usage: Open your compiled card sheet, then run this script.
    Tested in Photoshop CC with ExtendScript.
*/

#target photoshop
app.bringToFront();

(function () {
    // ================== CONFIG (EDIT THESE) ==================
    // All size values are in PIXELS.
    var CARD_WIDTH   = 500;   // card width in px
    var CARD_HEIGHT  = 700;  // card height in px

    var START_X      = 100;    // left margin (px) from the sheet’s left edge to the first card
    var START_Y      = 50;    // top margin (px) from the sheet’s top edge to the first card

    var GAP_X        = 1;    // horizontal gap between cards (px). 0 if touching
    var GAP_Y        = 1;    // vertical gap between cards (px). 0 if touching

    var COLS         = 3;     // number of columns in the grid
    var ROWS         = 3;     // number of rows in the grid

    var FILE_PREFIX  = "Card_";     // output filename prefix
    var START_INDEX  = 1;           // first number to use in filenames
    var SAVE_AS_PNG  = false;       // false = JPEG, true = PNG
    var JPEG_QUALITY = 11;          // 0–12 (Photoshop JPEG quality)
    // ========================================================

 // Pick source file and open
    var srcFile = File.openDialog("Select the sheet image", "*.jpg;*.jpeg;*.png");
    if (!srcFile) { alert("No file selected."); return; }
    var doc = app.open(srcFile);

    // Force pixels for safety
    var prevUnits = app.preferences.rulerUnits;
    var prevDialogs = app.displayDialogs;
    app.preferences.rulerUnits = Units.PIXELS;
    app.displayDialogs = DialogModes.NO;

    // Output folder
    var outFolder = Folder.selectDialog("Choose output folder");
    if (!outFolder) { cleanup(); return; }

    // Cache doc size as numbers in px (UnitValue -> number)
    var DOC_W = doc.width.as("px");
    var DOC_H = doc.height.as("px");

    var index = START_INDEX;

    for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
            var x = Math.round(START_X + c * (CARD_WIDTH + GAP_X));
            var y = Math.round(START_Y + r * (CARD_HEIGHT + GAP_Y));

            // Skip if outside the canvas
            if (x + CARD_WIDTH > DOC_W || y + CARD_HEIGHT > DOC_H) {
                // $.writeln("Skipping tile at r=" + r + " c=" + c + " (outside canvas)");
                continue;
            }

            // Duplicate original, crop to the tile, save, close
            var dup = doc.duplicate(FILE_PREFIX + index, false); // keep layers
            app.activeDocument = dup;

            var bounds = [
                UnitValue(x, "px"),
                UnitValue(y, "px"),
                UnitValue(x + CARD_WIDTH, "px"),
                UnitValue(y + CARD_HEIGHT, "px")
            ];
            dup.crop(bounds);
            dup.flatten();

            var outPath = outFolder.fsName + "/" + FILE_PREFIX + pad(index, 2) + (SAVE_AS_PNG ? ".png" : ".jpg");
            var outFile = File(outPath);

            if (SAVE_AS_PNG) {
                var pngOpts = new PNGSaveOptions(); pngOpts.interlaced = false;
                dup.saveAs(outFile, pngOpts, true, Extension.LOWERCASE);
            } else {
                var jpgOpts = new JPEGSaveOptions(); jpgOpts.quality = JPEG_QUALITY;
                dup.saveAs(outFile, jpgOpts, true, Extension.LOWERCASE);
            }

            dup.close(SaveOptions.DONOTSAVECHANGES);
            app.activeDocument = doc;
            index++;
        }
    }

    cleanup();
    alert("Done. Saved " + (index - START_INDEX) + " file(s) to:\n" + outFolder.fsName);

    // ---- helpers ----
    function pad(n, size) { var s = n.toString(); while (s.length < size) s = "0" + s; return s; }
    function cleanup() { app.preferences.rulerUnits = prevUnits; app.displayDialogs = prevDialogs; }
})();
