# MTGPhotoshopLayout
Regen Photoshop Print Layout

## How to install
1. Extract the directories into a folder on your computer.  Most of the directories will contain *.jsx* script files.  The RE_PhotoEngine folder contains the primary script file that is referenced by the configuration files along with .png files for overlays.  It is important that you export all of the folders.

## How to use Script
1. Run the .*jsx* scripts contained in the *DEFAULT*, *PrinterName* (ie, *EPSON_ET8500*), or *Silhouette* folder in Photoshop by either double-clicking the script or going to File > Scripts > Browse and selecting the script.  The script files in these locations are Configuration Files and contain the parameters of the script.  Each script will reference the RE_PhotoEngine.jsx code file.
2. In Photoshop, a file select window will appear.  In this window, select up to 9 cards and press OK.  It will layout the cards alphabetically and apply the Brightness, Contrast, Vibrance, Saturation, and other settings specified in the script file automatically as well as add cut marks to the output.  Individual Brightness/Contrast and Vibrance Layers will also be added to every card, allowing the user to tweak on a per card basis within Photoshop if they choose without manually adding layers.
3. The user can print directly from Photoshop, or they can export to any file format they choose such as PDF.

## How to Customize Script Defaults
Each of the Configuration script files can be edited.  At the top of the script file are variables that control the page layout, card size, dpi, and the brightness/contract, vibrance, saturation, gmm, whitepoint, blackpoint layers and other options.  You can copy and rename these files and tweak these settings, allowing you to save your favorite settings in scripts that you can run.


## Version History

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
