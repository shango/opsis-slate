# Opsis Slate - After Effects Duration Manager & Slate Generator

A professional tool for managing composition durations and automatically generating slate frames with project information in After Effects.

## Installation

### Download Files
- `opsis-slate.jsx` - Main script file
- `logo.jpg` - Your company logo (90x90 pixels) - *optional*

### Install Script

**Windows:**
```
C:\Program Files\Adobe\Adobe After Effects [Version]\Support Files\Scripts\ScriptUI Panels\
```

**macOS:**
```
/Applications/Adobe After Effects [Version]/Scripts/ScriptUI Panels/
```

### Launch Panel
Go to `Window > opsis-slate.jsx` to open the dockable panel.

## Quick Start

### Required Project Setup
Your After Effects project must contain these compositions:

| Comp Name | Purpose |
|-----------|---------|
| `Plate` | Source plate footage |
| `working` | Working composition |
| `Output*` | Final output compositions (can have multiple) |
| `SLATE_TEMPLATE` | Slate graphics template |

### Slate Template Setup

1. **Create SLATE_TEMPLATE composition** matching your Output comp dimensions
2. **Add 3 copies of Output comp** as layers (for frame previews)
3. **Enable Time Remapping** on these 3 layers manually
4. **Position them vertically** (top, middle, bottom) as frame previews

### Text Information Setup

The slate uses two types of information:

#### Automatic Information (Use AE Expressions)
Create text layers with expressions for automatically updating information:

- **Date:** `var d = new Date(); d.getFullYear() + " / " + (d.getMonth()+1) + " / " + d.getDate()`
- **Project Name:** `thisProject.displayName` 
- **Dimensions:** `thisComp.width + " x " + thisComp.height`
- **Frame Rate:** `Math.round(thisComp.frameRate) + "fps"`

#### User Input Information (Use Template Variables)
Create text layers with template variables for user-controlled information:

- **Artist:** `Artist: {{artist}}`
- **Lens:** `Lens: {{lens}}mm`
- **Comment:** `{{comment}}`

**Important:** The original template text (with `{{variables}}`) is automatically stored in each layer's comment field, not visible in the viewport or expression editor.

### Add Slate to Output Compositions
Manually add the SLATE_TEMPLATE as a layer to each Output composition at frame 1000.

## Usage

1. **Open the Opsis Slate panel** (Window > opsis-slate.jsx)
2. **Enter information:**
   - Duration (in frames)
   - Lens information
   - Artist name
   - Comment/notes
3. **Click "Create or Update Slate"**

### What the Script Does
- Sets durations for Plate, working, and Output compositions
- Updates frame preview timing (first, middle, last frames)
- Replaces template variables with current information
- Preserves original templates in layer comment fields
- Updates date/time information (via expressions)

### Re-running the Script
You can run the script multiple times to update information:
- Change comments before final render
- Update artist or lens information
- Refresh date/time stamps

The original template variables are safely stored in layer comment fields and will be used for fresh replacements each time.

## Template Variables

Only these user input variables are handled by the script:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{artist}}` | Artist name from UI | `"JD"` |
| `{{lens}}` | Lens info from UI | `"35"` |
| `{{comment}}` | Comment from UI | `"Final render v3"` |

All other information (date, project name, dimensions, etc.) should use After Effects expressions for automatic updating.

## Frame Structure

- **Output compositions start at frame 1000**
- **Frame 1000:** Slate frame (1 frame duration)
- **Frame 1001+:** Actual footage begins
- **Slate shows:** Three frame previews (first, middle, last)

## Troubleshooting

**Missing compositions warning:**
- Ensure your project contains: `Plate`, `working`, and `Output` compositions

**Slate not updating:**
- Check that SLATE_TEMPLATE exists and is added to Output compositions
- Verify Time Remapping is enabled on the 3 Output comp layers in SLATE_TEMPLATE

**Template variables not working:**
- Original template text is stored in layer comment fields, not visible text
- Use exactly: `{{artist}}`, `{{lens}}`, `{{comment}}` (case-sensitive)

---

## Requirements
- Adobe After Effects CS6 or later
- Windows or macOS
- ExtendScript enabled

## Support
For issues or questions, refer to the complete documentation in the project repository.