// === CONFIG - You can edit these values ===
var pageWidthInches = 8.5;		// Page width in inches - Default 8.5
var pageHeightInches = 11;		// Page height in inches - Default 11
var layout = "horizontal"; 		// "vertical" (3x3) or "horizontal" (2x4)
var notesOn = true;			// true - Show setting notes; false - dont show
var noteFontSize = 10;			// font size to use for notes;  10 is the default;
var manualNote = "";			// Enter a Manual Note you want to display on the sheet - For example you could list the printer model, or other setting you want to display

var cardWidthMM = 69;
var cardHeightMM = 94;
var dpi = 800;

// CARDBACK - User if this script is for Card Backs and you want to adjust the offset for alignment purposes
var cardBack = false;			// true - card back; If true, it applies any cardBack adjustments specified in the config
var backOffsetXmm = -0.00;   		// horizontal shift in mm
var backOffsetYmm = -0.00;   		// vertical shift in mm
var selectEachCard = false;		// Set to true if you want to be prompted for each card selection individually.  This is useful for Card back selection where you need to match up per slot.

// BATCH HISTORY - This function allows the script to automatically save each use of the script into the BatchHistory folder so that the task can be repeated by double-clicking on the batch file
var batchHistory = true;
var displayBatchNumber = false;		// If this is set to true it will add the batch number to each card in very small font to the lower right footer of the card

// EXCLUDE CARD SLOTS
var excludeCardSlots = "";  		// Comma-separated list starting at 1 of card slots to not fill with cards. E.g., "4,5,8" would skill card slot 4, 5, & 8 from upper left to lower right.

// BLEED SETTINGS
var cutMarkSize = 4.5; 			// in MM - Default 4.5 for MPC formatted images
var cutOffset = 3.04; 			// in MM - Default 3.04 for MPC formatted images
var showCropMarks = true;		// false to hide cut/crop marks

// SILHOUETTE SETTINGS
// Silhouette is a cutting machine that can be used for cutting proxy cards. These settings are for using this machine.  The layout must be horizontal.
var useSilhouette = false; 		// Add Silhouette Cameo 5 registration marks if true

// BRIGHTNESS/CONTRAST/COLOR CORRECTION
var bright = 13;
var contr = 20;
var vib = 15;
var sat = 38;

var gmm = 1.05;
var whitepoint = 255;
var blackpoint = 0;
var addPerCardAdjustLayer = true;	// false = disables per-card adjustment layer

// PDF EXPORT OPTIONS
var outputPDF = false;			// Set to True if you want to output a PDF file into the PDFOutput directory
var pdfExportPreset = "Press Quality"	// Options include "High Quality Print", "Press Quality", "Smallest File Size"

// EXPORT FUNCTIONS - This section is used if you want to setup a Card conversion export script to do things like convert DPS, Image Type (PNG or JPEG), or to remove or add bleed and export to individual card files
var exportSingles = false;		// Set to true if you want to convert and export singles in a directory
var exportFormat = "jpg";		// Select the export Format, current options are PNG and JPEG
var exportAddBleed = "";		//Black if you want to add a Black Bleed to NoBleed Cards

// === END CONFIG ===

// INCLUDE THE RE_PhotoEngine.jsx FILE - DO NOT REMOVE
#include "../RE_PhotoEngine/RE_PhotoEngine.jsx"