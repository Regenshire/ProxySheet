// Printer Profile
// Printer: EPSON ET-85XX
// Paper Used: Koala Double-Sided Matte Paper 48 lb
// Printer Settings: Premium Photo Paper Semi-Gloss, High Print Quality
// ICC Profile Used: Epson ET-8500 - Koala Double Side Photo Paper Matte or RR Polar Matte Epson ET-85xx v2

// === CONFIG - You can edit these values ===
var pageWidthInches = 8.5;		// Page width in inches - Default 8.5
var pageHeightInches = 11;		// Page height in inches - Default 11
var layout = "SevenCard"; 		// "vertical" (3x3), "horizontal" (2x4), or "SevenCard" (designed for improved Silhouette detection)

var notesOn = true;			// true - Show setting notes; false - dont show
var noteFontSize = 8;			// font size to use for notes;  10 is the default;
var manualNote = "EPSON ET-85XX | Koala Double-Sided Matte Paper | Premium Photo Paper Semi-Gloss - HIGH | ICC: ET-8500 - Koala Double Side Photo Paper Matte";			// Enter a Manual Note you want to display on the sheet - For example you could list the printer model, or other setting you want to display

var cardBack = true;			// true - card back; If true, it applies any cardBack adjustments specified in the config
var backOffsetXmm = -3.00;   		// horizontal shift in mm
var backOffsetYmm = -0.02;   		// vertical shift in mm
var selectEachCard = true;		// Set to true if you want to be prompted for each card selection individually.  This is useful for Card back selection where you need to match up per slot.

var cardWidthMM = 69;
var cardHeightMM = 94;
var dpi = 800;

// BLEED SETTINGS
var cutMarkSize = 4.5; 			// in MM - Default 4.5 for MPC formatted images
var cutOffset = 3.04; 			// in MM - Default 3.04 for MPC formatted images
var showCropMarks = false;		// false to hide cut/crop marks

// SILHOUETTE SETTINGS
// Silhouette is a cutting machine that can be used for cutting proxy cards. These settings are for using this machine.  The layout must be horizontal.
var useSilhouette = true; 		// Add Silhouette Cameo 5 registration marks if true

// BRIGHTNESS/CONTRAST/COLOR CORRECTION
var bright = 27;
var contr = -3;
var vib = 0;
var sat = 0;

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