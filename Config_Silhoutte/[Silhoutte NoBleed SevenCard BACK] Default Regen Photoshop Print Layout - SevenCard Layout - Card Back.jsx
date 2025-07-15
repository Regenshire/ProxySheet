// === CONFIG ===
var layout = "SevenCard"; 		// "vertical" (3x3), "horizontal" (2x4), or "SevenCard" (designed for improved Silhouette detection)
var cardFormat = "NoBleed"; 		// "MPC" for MPC formatted cards with 6 mm bleed or "NoBleed" for scryfall images with no bleed.  Do not mix the two card types.
var dpi = 300;
var useSilhouette = true; 		// Add Silhouette Cameo 5 registration marks if true
var showCropMarks = false;		// false to hide cut/crop marks - Cropmarks are one of the slowest things in the script, so if you don't need them turn them off.

var cardBack = true;			// true - card back; If true, it applies any cardBack adjustments specified in the config. For seven card layout it ensures backs match fronts.
var backOffsetXmm = 0.00;   		// horizontal shift in mm
var backOffsetYmm = 0.00;   		// vertical shift in mm
var selectEachCard = true;		// Set to true if you want to be prompted for each card selection individually.  This is useful for Card back selection where you need to match up per slot.

// BRIGHTNESS/CONTRAST/COLOR CORRECTION
var bright = 18;
var contr = 10;
var vib = 0;
var sat = 35;

var gmm = 1.05;
var whitepoint = 255;
var blackpoint = 0;

// Batch History
var batchHistory = true;		// Saves to the Batch History Folder
var batchHistoryMin = 1;		// Starting Batch #
var displayBatchNumber = false;		// If this is set to true it will add the batch number to each card in very small font to the lower right footer of the card

// === END CONFIG ===

// INCLUDE THE RE_PhotoEngine.jsx FILE - DO NOT REMOVE
#include "../RE_PhotoEngine/RE_PhotoEngine.jsx"