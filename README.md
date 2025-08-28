# Opsis Slate - After Effects Comp Duration Manager with Slate Generator

A tool for managing composition durations and automatically generating a slate frame in templated After Effects projects.

version 0.1.2

The script will:
- Automatically detect the footage duration from the Sequence comp
- Set Sequence and Working comps to the detected duration
- Set Output comp to duration + 1 (for slate frame)
- Update Time Remap on the three Working comp layers in SLATE_TEMPLATE to display first, middle and last frame of Output comp.
- Verion up will increment the current version. If you are a version behind the most recent, it will skip over it and version up from there.

![alt text](https://github.com/shango/opsis-slate/main/logo/screen_ui_panle.png?raw=true)

## Installation

### Step 1: Download Files
- `opsis-slate.jsx` - Main script file
- `logo.png` - Opsis logo (recommended 100x33 pixels)
- `README.md` - Installation and setup instructions
- `slate_template.aet` - Starter template file

### Step 2: Install Script - Place all unzipped files and folder into the ScriptUI Panel folder

#### Windows:
```
C:\Program Files\Adobe\Adobe After Effects [Version]\Support Files\Scripts\scriptUI Panel
```

#### macOS:
```
/Applications/Adobe After Effects [Version]/Scripts/script ui panel
```

**For Dockable Panel:** Place in the `ScriptUI Panels` subfolder instead of `Scripts`


### Step 3: Launch in After Effects - Go to Window Menu > opsis-slate


**As Standard Script:**
- Go to `File > Scripts > opsis-slate.jsx`

**As Dockable Panel:**
- Go to `Window > opsis-slate.jsx`

## Project Setup

### Required Compositions

Your After Effects project must contain these compositions:

- `Sequence` - Source footage
- `Working` - Working composition (contains Sequence)  
- `Output` - Final output (Working starts at frame 2, slate on frame 1)
- `SLATE_TEMPLATE` - Slate graphics template

### SLATE_TEMPLATE Setup

Arrainge layers to suit the template design inside `SLATE_TEMPLATE` comp.

2. **Text layers** for slate information
   There are 2 types of text layers in here. They can moved around anywhere you need for layout.
   1. Layers with expressions directly in the "Source Text" property. (see Expressions section below)
   2. Layers controlled by the script with hooks placed in the comment field.
   3. Template includes an additional layer simply with info headings.

1. **Three instances of Working comp** with comments in their comment fields:
   **Time Remap effects** should be enabled on the three Working comp layers, done by default in the template file.
 
   - One layer with comment: `FIRST`
   - One layer with comment: `MIDDLE`
   - One layer with comment: `LAST`

## Usage
In the Opsis-Slate UI panel:

1. **Set Duration:** Click "Set Duration" to automatically set composition durations based on footage in the Sequence comp
2. **Update Slate:** Enter lens/artist/comment info, click "Update Slate"  
3. **Version Up:** Click "Version Up" to save incremented project version


## Expressions for Text Layers not controlled by the Script

These expressions are supplied here in case one gets removed from a layer and needs to be replaced.

### Project Name expression

```jsx
thisProject.fullPath.replace(/\\/g, "/").split("/").pop().replace(/\.[^\.]+$/, "")
```

### Date / Time expresssion

```jsx
var d = new Date();
  d.getFullYear() + " / " + (d.getMonth()+1) + " / " + d.getDate() + " " + d.getHours() + ":" +
  d.getMinutes() + " PST"
```
### Dimension expression

```jsx
comp("Output").width + " x " + comp("Output").height
```
### Duration expression

```jsx
var c = comp("Output");
var d = c.duration;                  // seconds
var fps = Math.round(1 / c.frameDuration);
var totalFrames = Math.round(d * fps);

// subtract one frame
var adjFrames = totalFrames;
var adjSeconds = (adjFrames / fps);

var totalSeconds = Math.floor(adjSeconds);
var h = Math.floor(totalSeconds / 3600);
var m = Math.floor((totalSeconds % 3600) / 60);
var s = Math.floor(totalSeconds % 60);
var fr = Math.floor((adjSeconds % 1) * fps);

// zero-padding to 2 digits
function pad(n) { return ("0" + n).slice(-2); }

adjFrames + " F " + pad(h) + ":" + pad(m) + ":" + pad(s) + ":" + pad(fr) + " @" + fps + "fps";

```

### Frame Range expression

```jsx
var c = comp("Output");

// Convert times to frames
var startFrame = Math.round(c.displayStartTime / c.frameDuration) + 1;
var endFrame = Math.round((c.displayStartTime + c.duration) / c.frameDuration);

startFrame + " - " + endFrame;

```

### Plate name expression

```jsx
// Get reference to the "Sequence" comp
var sequenceComp = comp("Sequence");

// Initialize variable to store footage layer name
var footageName = "No footage found";

// Loop through all layers in the Sequence comp
for (var i = 1; i <= sequenceComp.numLayers; i++) {
    var layer = sequenceComp.layer(i);
    
    // Check if it's not a solid, adjustment layer, or text layer
    if (layer.source && 
        !layer.adjustmentLayer && 
        layer.source.typeName !== "Solid") {
        
        // Get the layer name and remove file extension
        var layerName = layer.name;
        var lastDotIndex = layerName.lastIndexOf(".");
        
        if (lastDotIndex > 0) {
            footageName = layerName.substring(0, lastDotIndex);
        } else {
            footageName = layerName; // No extension found, use full name
        }
        
        break; // Stop at first footage layer found
    }
}

// Return the footage layer name without extension
footageName;
```

