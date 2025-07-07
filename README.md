# MTGPhotoshopLayout
Regen Photoshop Print Layout

## How to install
1. Extract the *.jsx* script file and the *01-CutMarkOverlay.png* file to the same directory.  If the Cut Line overlay is missing, the script will display an error and not show the cut guides.  This file can be edited if you want custom cut lines.

## How to use Script
1. Run the .*jsx* script in Photoshop by either double-clicking the script or going to File > Scripts > Browse and selecting the script
2. A file select window will appear.  In this window, select up to 9 cards and press OK.  It will layout the cards alphabetically and apply the Brightness, Contrast, Vibrance, Saturation, and other settings specified in the script file automatically as well as add cut marks to the output.  Individual Brightness/Contrast and Vibrance Layers will also be added to every card, allowing the user to tweak on a per card basis within Photoshop if they choose without manually adding layers.
3. The user can print directly from Photoshop, or they can export to any file format they choose such as PDF.

## How to Customize Script Defaults
The script can be edited.  At the top of the script file are variables that control the page layout, card size, dpi, and the brightness/contract, vibrance, saturation, gmm, whitepoint, and blackpoint layers the script uses.

> // === CONFIG ===  
> var pageWidthInches = 8.5;		// Page width in inches - Default 8.5  
> var pageHeightInches = 11;		// Page height in inches - Default 11  
> var layout = "horizontal"; 		// "vertical" (3x3) or "horizontal" (2x4)  
> 
> var cardWidthMM = 69;  
> var cardHeightMM = 94;  
> var dpi = 800;  
> 
> // BLEED SETTINGS  
> var cutMarkSize = 4.5; // in MM - Default 4.5  
> var cutOffset = 3.04; // in MM - Default 3.04  
>
> // SILHOUETTE SETTINGS  
> var useSilhouette = false; 		// Add Silhouette Cameo 5 registration marks if true  
> var silhouetteBleedAdjust = 1.8; 	// in MM – trim the outer edges of each card when using Silhouette by this much on each side.  
> 
> // BRIGHTNESS/CONTRAST/COLOR CORRECTION  
> var bright = 13;  
> var contr = 20;  
> var vib = 15;  
> var sat = 38;  
> 
> var gmm = 1.05;  
> var whitepoint = 255;  
> var blackpoint = 0;
>
> // === END CONFIG ===  


## Version History

### 2025-07-07 - Version 2.5
Added (theoretical) support for Silhoutte Cameo Cutting Machine
Added Page sizing controls and automatic centering
Added additional templates with Silhoutte option selected and for no-brightness adjustment

### 2025-07-06 - Version 2.0
Added ability to change between vertical and horizontal layout
Changed from a single overlay template for the entire page to Cut Marks being placed at each corner of each card by the script to allow for multiple formats
