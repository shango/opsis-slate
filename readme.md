# After Effects Comp Duration Manager with Slate Generator

A professional tool for managing composition durations and automatically generating slate frames in templated After Effects projects.

## Quick Start

This script allows you to:
- Set durations for multiple compositions simultaneously
- Automatically generate/update slate frames with project information
- Maintain consistent frame numbering across your project
- Store project-specific settings for repeated use

---

## Installation

### Step 1: Download Files
Download the following files:
- `CompDurationManager.jsx` - Main script file
- `logo.jpg` - Your company logo (90x90 pixels) - *optional*

### Step 2: Install Script

#### Windows:
```
C:\Program Files\Adobe\Adobe After Effects [Version]\Support Files\Scripts\
```

#### macOS:
```
/Applications/Adobe After Effects [Version]/Scripts/
```

**For Dockable Panel:** Place in the `ScriptUI Panels` subfolder instead of `Scripts`

### Step 3: Launch in After Effects

**As Standard Script:**
- Go to `File > Scripts > CompDurationManager.jsx`

**As Dockable Panel:**
- Go to `Window > CompDurationManager.jsx`
- Dock the panel wherever you prefer in your workspace

---

## Initial Project Setup

### Required Compositions

Your After Effects project must contain these compositions before running the script:

| Comp Name | Purpose | Required |
|-----------|---------|----------|
| `Plate` | Source plate footage | Yes |
| `working` | Working composition | Yes |
| `Output` | Final output (can have multiple) | Yes |
| `SLATE_TEMPLATE` | Slate graphics template | Auto-created if missing |

**Note:** You can have multiple output comps (e.g., `Output`, `Output_masked`, `Output_v2`). The script will update all comps starting with "Output".

---

## Slate Template Setup

### Automatic Setup (Recommended for First Use)

1. Run the script once - it will create `SLATE_TEMPLATE` if it doesn't exist
2. The script creates text layers and placeholder areas automatically
3. Add your custom graphics afterwards

### Manual Setup (For Custom Templates)

Create a composition named `SLATE_TEMPLATE` with the following structure:

#### 1. Composition Settings
- **Name:** `SLATE_TEMPLATE`
- **Size:** Match your Output comp dimensions
- **Frame Rate:** Match your Output comp frame rate
- **Duration:** 1 frame
- **Background:** Black (or your preference)

#### 2. Layout Structure

```
┌─────────────────┬──────────────────┬─────────────────┐
│                 │                  │                 │
│  Frame 1        │  Project Name    │                 │
│  (Preview)      │                  │   Custom        │
│                 │  Date: ...       │   Graphics      │
├─────────────────┤  Duration: ...   │   Area          │
│                 │  Dimensions: ... │                 │
│  Frame N/2      │  Lens: ...       │                 │
│  (Preview)      │  Vendor: OPSIS   │                 │
│                 │  Comment: ...    │                 │
├─────────────────┤                  │                 │
│                 │                  │                 │
│  Frame N        │                  │                 │
│  (Preview)      │                  │                 │
│                 │                  │                 │
└─────────────────┴──────────────────┴─────────────────┘
    1/3 width         1/3 width          1/3 width
```

#### 3. Adding Frame Preview Placeholders

1. **Import Output comp** into SLATE_TEMPLATE (3 times)
2. **Position the three copies:**
   - Top third: First frame preview
   - Middle third: Middle frame preview  
   - Bottom third: Last frame preview
3. **Scale each** to 1/3 of comp width
4. **Align** flush to left edge
5. The script will handle time remapping automatically

#### 4. Custom Graphics Areas

Add your custom elements:
- **Top/Bottom margins:** Company branding, project identifiers
- **Right side:** Additional graphics, logos, or visual elements
- **Background:** Texture, gradients, or solid colors

**Important:** Leave the center area clear - text will be added programmatically.

---

## Using the Script

### Basic Workflow

1. **Open the Panel**
   - Window > CompDurationManager.jsx (if dockable)
   - File > Scripts > CompDurationManager.jsx (if standard)

2. **Enter Duration**
   - Input desired duration in **frames** (not seconds)
   - Valid range: 1-2000 frames

3. **Add Optional Information**
   - **Lens:** Enter lens info (e.g., "24" for 24mm)
   - **Comment:** Any notes (up to 175 characters)

4. **Click "Set Durations"**
   - Plate comp → Set to input duration
   - Working comp → Set to input duration
   - Output comps → Set to input duration + 1 frame
   - Slate is generated/updated automatically

5. **Review Results**
   - Check the confirmation dialog
   - Verify slate on frame 1000 of Output comps
   - Footage begins on frame 1001

### Understanding the Frame Structure

```
Output Comp Timeline:
Frame 1000: [SLATE FRAME]
Frame 1001: [First frame of footage]
Frame 1002: [Second frame of footage]
...
Frame 1000+N: [Last frame of footage]
```

### Data Persistence

The script remembers your last entries (per project):
- Duration value
- Lens information  
- Comment text

These values persist between After Effects sessions for the current project.

---

## Slate Information

### Automatically Generated Fields

| Field | Source | Example |
|-------|--------|---------|
| **Project Name** | AE project filename | MY_PROJECT_v02 |
| **Date** | Current system date/time | 2025 / 08 / 22 14:30 PST |
| **Duration** | User input + timecode | 240 F 00:00:10:00 @24fps |
| **Dimensions** | Output comp size | 1920 x 1080 |
| **Vendor** | Hardcoded | OPSIS |

### User Input Fields

| Field | Description | Format |
|-------|-------------|---------|
| **Duration** | Frame count | 1-2000 frames |
| **Lens** | Camera lens used | Displays with "mm" suffix |
| **Comment** | Production notes | Up to 175 characters |

---

## Troubleshooting

### Common Issues

**"Missing comps" warning**
- Ensure your project contains: `Plate`, `working`, and at least one `Output` comp
- Check exact naming (case-sensitive)

**Logo not appearing**
- Place `logo.jpg` in the same folder as the script
- Ensure file is exactly 90x90 pixels
- File must be named `logo.jpg` (lowercase)

**Slate not updating**
- Check that SLATE_TEMPLATE exists
- Verify Output comp references in template
- Try clicking "Undo" and re-running

**Frame previews showing wrong frames**
- Ensure Output comp copies are in SLATE_TEMPLATE
- Check that Output comp starts at frame 1000
- Verify time remapping is enabled on preview layers

### Frame Hold Setup Tips

If frame previews aren't updating:
1. Select each Output comp layer in SLATE_TEMPLATE
2. Enable Time Remapping (Layer > Time > Enable Time Remapping)
3. Clear any existing keyframes
4. Re-run the script

---

## Best Practices

### Template Project Setup

1. **Create a master template project** with all required comps
2. **Pre-configure SLATE_TEMPLATE** with your branded graphics
3. **Set Output comp to start at frame 1000** before running script
4. **Save as template** (.aet) for reuse

### Workflow Tips

- Run the script early in your project to establish durations
- Update slate whenever client feedback changes duration
- Use comments field for version notes or client instructions
- Keep lens information consistent across similar shots

### Organization

```
Project/
├── Comps/
│   ├── Plate
│   ├── working
│   ├── Output
│   ├── Output_masked (optional)
│   └── SLATE_TEMPLATE
├── Footage/
│   └── [Your footage]
└── Scripts/
    ├── CompDurationManager.jsx
    └── logo.jpg
```

---

## Advanced Features

### Multiple Output Compositions

The script automatically handles multiple output compositions:
- `Output` - Primary output
- `Output_masked` - Masked version
- `Output_v2` - Alternate version
- Any comp starting with "Output" gets processed

### Undo Support

- Click "Undo" button after any operation
- Or use Edit > Undo (Ctrl/Cmd + Z)
- Entire operation is grouped as single undo

### Project-Specific Settings

Settings are stored per project:
- Different projects maintain different settings
- Settings saved in After Effects preferences
- Cleared when creating new project

---

## Technical Specifications

- **Frame Start:** Output comps start at frame 1000
- **Slate Position:** Frame 1000 (first frame of Output)
- **Footage Start:** Frame 1001
- **Maximum Duration:** 2000 frames
- **Font:** System sans-serif (Arial/Helvetica)
- **Text Color:** White on black background

---

## Support

### Requirements
- Adobe After Effects CS6 or later
- Windows or macOS
- ExtendScript enabled

### Files Included
- `CompDurationManager.jsx` - Main script
- `logo.jpg` - Company logo placeholder (optional)
- `README.md` - This documentation

### Known Limitations
- Maximum 2000 frame duration
- Requires specific comp naming
- Slate template must be configured before first use
- Font selection limited to system fonts

---

## Version History

**v1.0** - Initial Release
- Core duration management
- Slate generation
- Frame preview system
- Project persistence

---

## Quick Reference Card

### Keyboard Shortcuts
- **Run Script:** (Assign custom shortcut in AE)
- **Undo:** Ctrl/Cmd + Z

### Frame Calculations
```
Output Comp Duration = User Input + 1
Slate Frame = 1000
First Content Frame = 1001
Middle Preview = 1001 + (duration ÷ 2)
Last Preview = 1001 + duration - 1
```

### Naming Conventions
- Plate comp: `Plate` (exact)
- Working comp: `working` (exact)
- Output comps: `Output*` (prefix)
- Slate template: `SLATE_TEMPLATE` (exact)

---

*For additional support or feature requests, please refer to the internal documentation or contact your pipeline supervisor.*