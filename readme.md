# Opsis Slate - After Effects Comp Duration Manager with Slate Generator

A tool for managing composition durations and automatically generating slate frames in templated After Effects projects.

## Installation

### Step 1: Download Files
- `opsis-slate.jsx` - Main script file
- `logo.jpg` - Your company logo (90x90 pixels) - *optional*

### Step 2: Install Script

#### Windows:
```
C:\Program Files\Adobe\Adobe After Effects [Version]\Support Files\Scripts\script ui panel
```

#### macOS:
```
/Applications/Adobe After Effects [Version]/Scripts/script ui panel
```

**For Dockable Panel:** Place in the `ScriptUI Panels` subfolder instead of `Scripts`

### Step 3: Launch in After Effects

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

Create a composition named `SLATE_TEMPLATE` containing:

1. **Three instances of Working comp** with comments in their comment fields:
   - One layer with comment: `FIRST`
   - One layer with comment: `MIDDLE`
   - One layer with comment: `LAST`

2. **Text layers** for slate information (see Expressions section below)

3. **Time Remap effects** should be enabled on the three Working comp layers

## Usage

1. **Set Duration:** Enter frame count, click "Set Duration"
2. **Update Slate:** Enter lens/artist/comment info, click "Update Slate"  
3. **Version Up:** Click "Version Up" to save incremented project version

The script will:
- Set Sequence and Working to your duration
- Set Output to duration + 1 (for slate frame)
- Update Time Remap on the three Working comp layers in SLATE_TEMPLATE

## Expressions for Text Layers no controlled by the Script

### Project Name expression

thisProject.fullPath.replace(/\\/g, "/").split("/").pop().replace(/\.[^\.]+$/, "")

### Date / Time expresssion

var d = new Date();
  d.getFullYear() + " / " + (d.getMonth()+1) + " / " + d.getDate() + " " + d.getHours() + ":" +
  d.getMinutes() + " PST"

### Dimension expression

comp("Output").width + " x " + comp("Output").height

### Duration expression

var c = comp("Output");
var d = c.duration;                  // seconds
var fps = Math.round(1 / c.frameDuration);
var totalFrames = Math.round(d * fps);

// subtract one frame
var adjFrames = totalFrames - 1;
var adjSeconds = (adjFrames / fps);

var totalSeconds = Math.floor(adjSeconds);
var h = Math.floor(totalSeconds / 3600);
var m = Math.floor((totalSeconds % 3600) / 60);
var s = Math.floor(totalSeconds % 60);
var fr = Math.floor((adjSeconds % 1) * fps);

// zero-padding to 2 digits
function pad(n) { return ("0" + n).slice(-2); }

adjFrames + " F " + pad(h) + ":" + pad(m) + ":" + pad(s) + ":" + pad(fr) + " @" + fps + "fps";


### Frame Range expression

var c = comp("Output"); 
Math.round(c.displayStartTime / c.frameDuration + c.displayStartTime) + " - " + Math.round((c.displayStartTime + c.duration) / c.frameDuration + c.displayStartTime - 1);
