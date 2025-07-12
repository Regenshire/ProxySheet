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

<<<<<<< HEAD
### 2025-07-10 - Version 4.10

\* Added support for Back printing Offsets. This is controlled by cardBack, backOffsetXmm, and backOffsetYmm in the config files.  This allows you to place an offset to adjust for printer alignment variance.

\* A "\[EPSON ET8500 - CARD BACKS - Silhoutte] \[-2.0 +0.1 mm Offset] Koala Double-Sided Matte Paper 48 lb.jsx" config file has been added to the Config\_EPSON\_ET8500 with an example adjustment for back printing.



### 2025-07-10 - Version 4.00

\* Added RE\_HelperFunctions.jsx to break out functions into a separate file to improve code management.

\* Added Variable Safety with default values to allow for Config files that only have some variables.  This will better support future versions with less risk of breaking pre-existing config files.

\* Added support for "NoBleed" files.  These are files that are fully cut sized magic cards such as are found on scryfall and other sources.  This functionality allows a user to setup a config that prints these types of files vs printing MPC formatted files.  This is controlled via the \*cardFormat\* variable. If this is set to "MPC" it will support cards with the full 6mm MPC bleed. If the value is set to "NoBleed" it will support cards with no bleed found on sites such as scryfall.

\* Added excludeCardSlots as a variable.  A user can use this to exclude any cards being in specific slots.  For example, if a user want to leave the rightmost two slots free on a horizontal layout, the could enter "4,8" into this field to exclude card slot 4 and 8.  The user enters the numbers (Upper left to lower right) in a comma separated list for slots they want to exclude.

\* Removed the overlay PNG file from the project for marks and replaced it with a function that constructs them in Photoshop natively from shapes.

\* Added support for "NoBleed" files in Silhoette mode

\* Added the ability to turn off the per Card Adjustment Layers by setting the variable \*addPerCardAdjustLayer\* to false.

### 2025-07-10 - Version 3.30

Divided the scripting into multiple files, separating the jsx code from the configuration files
Further developed support for Silhoutte Cameo Cutting Machines and tested on a Silhoutte Cameo 5
Added Note functionality to allow for tracking settings of specific print jobs to help with dialing in print configurations
Added a *Regen Silhouette Studio Cutting Template v3.3.studio3* file as a Silhoutte Cameo studio file for cutting.

### 2025-07-07 - Version 2.50

Added (theoretical) support for Silhoutte Cameo Cutting Machine
Added Page sizing controls and automatic centering
Added additional templates with Silhoutte option selected and for no-brightness adjustment

### 2025-07-06 - Version 2.00

Added ability to change between vertical and horizontal layout
Changed from a single overlay template for the entire page to Cut Marks being placed at each corner of each card by the script to allow for multiple formats

=======
### 2025-07-11 - Version 4.00
* Added RE_HelperFunctions.jsx to break out functions into a separate file to improve code management.
* Added Variable Safety with default values to allow for Config files that only have some variables.  This will better support future versions with less risk of breaking pre-existing config files.
* Added support for "NoBleed" files.  These are files that are fully cut sized magic cards such as are found on scryfall and other sources.  This functionality allows a user to setup a config that prints these types of files vs printing MPC formatted files.  This is controlled via the *cardFormat* variable. If this is set to "MPC" it will support cards with the full 6mm MPC bleed. If the value is set to "NoBleed" it will support cards with no bleed found on sites such as scryfall.
* Added excludeCardSlots as a variable.  A user can use this to exclude any cards being in specific slots.  For example, if a user want to leave the rightmost two slots free on a horizontal layout, the could enter "4,8" into this field to exclude card slot 4 and 8.  The user enters the numbers (Upper left to lower right) in a comma separated list for slots they want to exclude.
* Removed the overlay PNG file from the project for marks and replaced it with a function that constructs them in Photoshop natively from shapes.
* Added support for "NoBleed" files in Silhoette mode
* Added the ability to turn off the per Card Adjustment Layers by setting the variable *addPerCardAdjustLayer* to false.

### 2025-07-10 - Version 3.30
* Divided the scripting into multiple files, separating the jsx code from the configuration files
* Further developed support for Silhoutte Cameo Cutting Machines and tested on a Silhoutte Cameo 5
* Added Note functionality to allow for tracking settings of specific print jobs to help with dialing in print configurations
* Added a *Regen Silhouette Studio Cutting Template v3.3.studio3* file as a Silhoutte Cameo studio file for cutting.

### 2025-07-07 - Version 2.50
* Added (theoretical) support for Silhoutte Cameo Cutting Machine
* Added Page sizing controls and automatic centering
* Added additional templates with Silhoutte option selected and for no-brightness adjustment

### 2025-07-06 - Version 2.00
* Added ability to change between vertical and horizontal layout
* Changed from a single overlay template for the entire page to Cut Marks being placed at each corner of each card by the script to allow for multiple formats
>>>>>>> 4f219009a971688b878c587ca172b634ba48e53e
