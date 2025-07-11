// === CONFIG ===
var pageWidthInches = 8.5;		// Page width in inches - Default 8.5
var pageHeightInches = 11;		// Page height in inches - Default 11
var layout = "horizontal"; 		// "vertical" (3x3) or "horizontal" (2x4)
var notesOn = true;			// true - Show setting notes; false - dont show
var noteFontSize = 10;			// font size to use for notes;  10 is the default;
var manualNote = "";			// Enter a Manual Note you want to display on the sheet - For example you could list the printer model, or other setting you want to display

var cardWidthMM = 69;
var cardHeightMM = 94;
var dpi = 800;

// BLEED SETTINGS
var cutMarkSize = 4.5; 			// in MM - Default 4.5 for MPC formatted images
var cutOffset = 3.04; 			// in MM - Default 3.04 for MPC formatted images
var showCropMarks = false;		// false to hide cut/crop marks - Cropmarks are one of the slowest things in the script, so if you don't need them turn them off.

// SILHOUETTE SETTINGS
// Silhouette is a cutting machine that can be used for cutting proxy cards. These settings are for using this machine.  The layout must be horizontal.
var useSilhouette = true; 		// Add Silhouette Cameo 5 registration marks if true

// BRIGHTNESS/CONTRAST/COLOR CORRECTION
var bright = 18;
var contr = 10;
var vib = 0;
var sat = 35;

var gmm = 1.05;
var whitepoint = 255;
var blackpoint = 0;

// === END CONFIG ===

// INCLUDE THE RE_PhotoEngine.jsx FILE - DO NOT REMOVE
#include "../RE_PhotoEngine/RE_PhotoEngine.jsx"