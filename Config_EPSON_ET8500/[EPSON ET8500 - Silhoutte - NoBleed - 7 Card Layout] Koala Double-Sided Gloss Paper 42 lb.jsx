// Printer Profile
// Printer: EPSON ET-85XX
// Paper Used: Koala Double-Sided Gloss Paper 42 lb
// Printer Settings: Premium Photo Paper Gloss, High Print Quality
// ICC Profile Used: Epson ET-8500 - RR UltraPro Gloss Epson ET-85xx v2 or HTVRONT Vinyl Sticker Gloss

// === CONFIG - You can edit these values ===
var layout = "SevenCard"; 		// "vertical" (3x3), "horizontal" (2x4), or "SevenCard" (designed for improved Silhouette detection)
var cardFormat = "NoBleed"; 		// "MPC" for MPC formatted cards with 6 mm bleed or "NoBleed" for scryfall images with no bleed.  Do not mix the two card types.
var notesOn = true;			// true - Show setting notes; false - dont show
var noteFontSize = 8;			// font size to use for notes;  10 is the default;
var manualNote = "EPSON ET-85XX | Koala Double-Sided Gloss Paper | Premium Photo Paper Gloss - HIGH | ICC: ET-8500 - RR UltraPro Gloss Epson ET-85xx v2";			// Enter a Manual Note you want to display on the sheet - For example you could list the printer model, or other setting you want to display

var dpi = 800;

// BLEED SETTINGS
var showCropMarks = false;		// false to hide cut/crop marks

// SILHOUETTE SETTINGS
// Silhouette is a cutting machine that can be used for cutting proxy cards. These settings are for using this machine.  The layout must be horizontal.
var useSilhouette = true; 		// Add Silhouette Cameo 5 registration marks if true

// BRIGHTNESS/CONTRAST/COLOR CORRECTION
var bright = 15;
var contr = 18;
var vib = 0;
var sat = 50;

var gmm = 1.05;
var whitepoint = 255;
var blackpoint = 0;

// Batch History
var batchHistory = true;		// Saves to the Batch History Folder
var batchHistoryMin = 1;			// Starting Batch #
var displayBatchNumber = false;		// If this is set to true it will add the batch number to each card in very small font to the lower right footer of the card

// === END CONFIG ===

// INCLUDE THE RE_PhotoEngine.jsx FILE - DO NOT REMOVE
#include "../RE_PhotoEngine/RE_PhotoEngine.jsx"