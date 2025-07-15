# MTGPhotoshopLayout

Regen Photoshop Print Layout

## How to install

1. Extract the directories into a folder on your computer.  Most of the directories will contain \*.jsx\* script files.  The RE\_PhotoEngine folder contains the primary script file that is referenced by the configuration files.  It is important that you export all of the folders.

## How to use Script

1. Run the .\*jsx\* scripts contained in the \*DEFAULT\*, \*PrinterName\* (ie, \*EPSON\_ET8500\*), or \*Silhouette\* folder in Photoshop by either double-clicking the script or going to File > Scripts > Browse and selecting the script.  The script files in these locations are Configuration Files and contain the parameters of the script.  Each script will reference the RE\_PhotoEngine.jsx code file.
2. In Photoshop, a file select window will appear.  In this window, select up to 9 cards and press OK.  It will layout the cards alphabetically and apply the Brightness, Contrast, Vibrance, Saturation, and other settings specified in the script file automatically as well as add cut marks to the output.  Individual Brightness/Contrast and Vibrance Layers will also be added to every card, allowing the user to tweak on a per card basis within Photoshop if they choose without manually adding layers.
3. The user can print directly from Photoshop, or they can export to any file format they choose such as PDF.

## How to Customize Script Defaults

Each of the Configuration script files can be edited.  At the top of the script file are variables that control the page layout, card size, dpi, and the brightness/contract, vibrance, saturation, gmm, whitepoint, blackpoint layers and other options.  You can copy and rename these files and tweak these settings, allowing you to save your favorite settings in scripts that you can run.



## Version History

### 2025-07-15 - Version 5.00

\* New Silhouette Layout - SevenCard Layout Added - A new layout mode called "SevenCard" has been implemented. It is designed to improve cutting accuracy with Silhouette devices by centering one card vertically and aligning six additional cards in a mirrored 3x2 grid beside it.  This creates space around the registration marks, greatly increasing the registration detection and allowing users to use the Silhouette device with more precision and without using the "Post-it Note" trick.  For the Sevencard layout, secial support for duplex printing has been added. The back layout is fully mirrored, ensuring perfect front-to-back alignment when using cardBack = true for the SevenCard layout.

\* Silhouette Support updated - The Silhouette markings and template have been redesigned to improve location and registration to increase the accuracy and consistency cuts on the Silhouette cutting machine.

\* New Silhouette Studio Template: SevenCard - A new Studio file is included to support the SevenCard layout: Regen Silhouette Studio Cutting Template v5 - Seven Card.studio3

\* Batch History System (New Feature) - A fully integrated batch tracking system has been added to allow re-printing of specific card sheets without needing to manually reconfigure or reselect images.

* Set batchHistory = true in any config script to enable.
* On each run, a new batch file is created inside the /batchHistory/ folder (e.g., Batch\_001.jsx).
* These batch scripts store:

&nbsp;	- All config variables used at time of execution

&nbsp;	- The exact file paths of all selected images

* When a batch file is re-run, the user is prompted to automatically reload those images — allowing exact reprints without file selection.
* Saved batch scripts are self-contained and executable in Photoshop (they include a reference to the RE\_PhotoEngine.jsx engine).
* Batch numbers are auto-incremented and formatted with padded numbering (# 001, # 002, etc.)
* The displayed batch number can optionally be printed onto each card using displayBatchNumber = true.  This places the batch number in the lower right of the card. Do not use if you normally have text in that location.


2025-07-14 - Version 4.20
---

\* Added Card Export functionality that allows for a user to export individual Card files in a different format (JPG or PNG) and with or without Bleed (MPC, NoBleed).  This functionality allows a user to convert MPC cards into NoBleed cards and to convert NoBleed cards into MPC compatible cards.  It also allows a user to convert the DPI on cards.  For example, a user could convert a directory full of PNG 800 dpi MPC cards into JPG 300 DPI NoBleed cards.  Please see the new Config\_Exports directory for a list of example scripts.

\* Silhouette Support updated - The Silhouette markings and template have been redesigned to improve location and registration to increase the accuracy and consistency cuts on the Silhouette cutting machine.



### 2025-07-12 - Version 4.10

\* Added support for Back printing Offsets. This is controlled by cardBack, backOffsetXmm, and backOffsetYmm in the config files.  This allows you to place an offset to adjust for printer alignment variance.

\* A "\[EPSON ET8500 - CARD BACKS - Silhoutte] \[-2.0 +0.1 mm Offset] Koala Double-Sided Matte Paper 48 lb.jsx" config file has been added to the Config\_EPSON\_ET8500 with an example adjustment for back printing.



### 2025-07-11 - Version 4.00

\* Added RE\_HelperFunctions.jsx to break out functions into a separate file to improve code management.

\* Added Variable Safety with default values to allow for Config files that only have some variables.  This will better support future versions with less risk of breaking pre-existing config files.

\* Added support for "NoBleed" files.  These are files that are fully cut sized magic cards such as are found on scryfall and other sources.  This functionality allows a user to setup a config that prints these types of files vs printing MPC formatted files.  This is controlled via the \*cardFormat\* variable. If this is set to "MPC" it will support cards with the full 6mm MPC bleed. If the value is set to "NoBleed" it will support cards with no bleed found on sites such as scryfall.

\* Added excludeCardSlots as a variable.  A user can use this to exclude any cards being in specific slots.  For example, if a user want to leave the rightmost two slots free on a horizontal layout, the could enter "4,8" into this field to exclude card slot 4 and 8.  The user enters the numbers (Upper left to lower right) in a comma separated list for slots they want to exclude.

\* Removed the overlay PNG file from the project for marks and replaced it with a function that constructs them in Photoshop natively from shapes.

\* Added support for "NoBleed" files in Silhoette mode

\* Added the ability to turn off the per Card Adjustment Layers by setting the variable \*addPerCardAdjustLayer\* to false.



### 2025-07-10 - Version 3.30

\* Divided the scripting into multiple files, separating the jsx code from the configuration files
\* Further developed support for Silhoutte Cameo Cutting Machines and tested on a Silhoutte Cameo 5
\* Added Note functionality to allow for tracking settings of specific print jobs to help with dialing in print configurations
\* Added a *Regen Silhouette Studio Cutting Template v3.3.studio3* file as a Silhoutte Cameo studio file for cutting.



### 2025-07-07 - Version 2.50

\* Added (theoretical) support for Silhoutte Cameo Cutting Machine
\* Added Page sizing controls and automatic centering
\* Added additional templates with Silhoutte option selected and for no-brightness adjustment

### 2025-07-06 - Version 2.00

\* Added ability to change between vertical and horizontal layout
\* Changed from a single overlay template for the entire page to Cut Marks being placed at each corner of each card by the script to allow for multiple formats

