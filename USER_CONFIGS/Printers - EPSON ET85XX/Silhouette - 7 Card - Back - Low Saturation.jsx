// Printers - EPSON ET85XX > Silhouette - 7 Card - Back - Low Saturation

// === CONFIG - You can edit these values ===

// --- Layout ---
var layout = "SevenCard";
var pageWidthInches = 8.5;
var pageHeightInches = 11;
var dpi = 800;
var paperType = "Letter";

// --- Card Format ---
var cardFormat = "MPC";
var cardWidthMM = 69;
var cardHeightMM = 94;

// --- Cut & Bleed ---
var cutMarkSize = 4.5;
var cutOffset = 3.04;
var showCropMarks = false;

// --- Color Adjustments ---
var bright = 27;
var contr = -3;
var vib = 0;
var sat = 0;
var gmm = 1.05;
var whitepoint = 255;
var blackpoint = 0;

// --- Back Alignment ---
var cardBack = true;
var backOffsetXmm = -3;
var backOffsetYmm = -0.02;
var selectEachCard = true;

// --- Silhouette ---
var useSilhouette = true;
// --- Batch PDF Settings ---
var batchMultiPage = false;
var noBackImage = false;
var separateBackPDF = false;

// --- Notes ---
var notesOn = true;
var noteFontSize = 10;
var manualNote = "EPSON ET-85XX | BACK | Match MTG Card Back Colors";

// --- Meta Info ---
var configCreateDate = "2025-07-19T02:57:48.232Z";

// === END CONFIG ===

// INCLUDE THE RE_PhotoEngine.jsx FILE - DO NOT REMOVE
#include "../../RE_PhotoEngine/RE_PhotoEngine.jsx"