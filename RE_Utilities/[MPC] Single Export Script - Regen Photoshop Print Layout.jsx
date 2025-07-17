// === CONFIG - You can edit these values ===
var pageWidthInches = 8.5;		// Page width in inches - Default 8.5
var pageHeightInches = 11;		// Page height in inches - Default 11
var layout = "horizontal"; 		// "vertical" (3x3) or "horizontal" (2x4)
var cardFormat = "MPC";			// "MPC" for MPC formatted files with 6mm bleed, "NoBleed" for files available on Scryfall that have no bleed.
var exportSingles = true;

var cardWidthMM = 69;
var cardHeightMM = 94;
var dpi = 300;

// EXCLUDE CARD SLOTS
var excludeCardSlots = "";  // Comma-separated list starting at 1 of card slots to not fill with cards. E.g., "4,5,8" would skill card slot 4, 5, & 8 from upper left to lower right.

// BLEED SETTINGS
var cutMarkSize = 4.5; 			// in MM - Default 4.5 for MPC formatted images
var cutOffset = 3.04; 			// in MM - Default 3.04 for MPC formatted images
var showCropMarks = true;		// false to hide cut/crop marks

// SILHOUETTE SETTINGS
// Silhouette is a cutting machine that can be used for cutting proxy cards. These settings are for using this machine.  The layout must be horizontal.
var useSilhouette = false; 		// Add Silhouette Cameo 5 registration marks if true

// BRIGHTNESS/CONTRAST/COLOR CORRECTION
var bright = 0;
var contr = 0;
var vib = 0;
var sat = 0;

var gmm = 1.05;
var whitepoint = 255;
var blackpoint = 0;
var addPerCardAdjustLayer = true;	// false = disables per-card adjustment layer

// === END CONFIG ===

// INCLUDE THE RE_PhotoEngine.jsx FILE - DO NOT REMOVE
#include "../RE_PhotoEngine/RE_PhotoEngine.jsx"