# Product Requirements Document
## After Effects Comp Duration Manager with Slate Generator

**Version:** 1.0  
**Date:** Current  
**Status:** Complete Specification

---

## 1. Executive Summary

### 1.1 Purpose
Create a dockable After Effects ScriptUI panel that allows users to set durations for specific compositions and automatically generate/update slate frames with project information.

### 1.2 Scope
This tool will be used on templated After Effects projects with pre-existing composition structures. It will not create new projects but will modify existing compositions and manage slate frame generation.

### 1.3 Target Users
- Motion graphics artists
- Video compositors
- Post-production professionals working with standardized project templates

---

## 2. Technical Requirements

### 2.1 Platform Requirements
- **Application:** Adobe After Effects (CS6 or later)
- **Script Type:** JSX (ExtendScript)
- **UI Type:** Dockable ScriptUI Panel
- **Operating Systems:** macOS and Windows compatible

### 2.2 File Structure
```
/Scripts/
├── CompDurationManager.jsx
└── logo.jpg (90x90px, optional)
```

---

## 3. User Interface Specifications

### 3.1 Panel Layout
- **Panel Title:** "Set Comp Durations"
- **Minimum Width:** 210px
- **Resizable:** Yes
- **Dockable:** Yes

### 3.2 UI Elements (Top to Bottom)

#### 3.2.1 Company Logo
- **Size:** 90x90 pixels
- **Position:** Centered at top of panel
- **File:** Auto-loaded from `logo.jpg` in script directory
- **Fallback:** Display "Logo 90x90" placeholder if file not found
- **Padding:** 15px margins around panel edges

#### 3.2.2 Separator Line
- **Width:** 210px
- **Height:** 1px
- **Style:** Panel divider

#### 3.2.3 Duration Input Field
- **Label:** "Duration (frames):"
- **Input Field Size:** 80x25 pixels
- **Label Width:** 100px
- **Type:** Numeric input only
- **Validation:** 1-2000 frames
- **Layout:** Horizontal (label | input)

#### 3.2.4 Lens Input Field
- **Label:** "Lens:"
- **Input Field Size:** 80x25 pixels
- **Label Width:** 100px
- **Type:** Free text input
- **Layout:** Horizontal (label | input)

#### 3.2.5 Comment Input Field
- **Label:** "Comment:"
- **Input Field Size:** 180x50 pixels (multi-line)
- **Character Limit:** 175 characters
- **Type:** Multi-line text
- **Layout:** Vertical (label above input)

#### 3.2.6 Button Group
- **Layout:** Horizontal, centered
- **Spacing:** 10px between buttons

##### Set Button
- **Label:** "Set Durations"
- **Size:** 90x25 pixels
- **Action:** Execute duration change and slate generation

##### Undo Button
- **Label:** "Undo"
- **Size:** 90x25 pixels
- **State:** Disabled by default, enabled after successful operation
- **Action:** Revert last operation

#### 3.2.7 Status Display
- **Type:** Static text
- **Width:** 200px
- **Default Text:** "Status: Ready"
- **Updates:** Display operation results and errors

### 3.3 Spacing and Padding
- **Panel Margins:** 15px all sides
- **Element Spacing:** 10px vertical between groups
- **Group Internal Spacing:** 8px horizontal, 5px vertical

---

## 4. Functional Requirements

### 4.1 Composition Duration Management

#### 4.1.1 Target Compositions
The script must identify and modify the following compositions:

| Comp Name Pattern | Duration Setting | Notes |
|------------------|------------------|-------|
| "Plate" | User input duration | Exact name match |
| "working" | User input duration | Exact name match |
| "Output*" | User input + 1 frame | Any comp starting with "Output" |

#### 4.1.2 Duration Specifications
- **Input Unit:** Frames (not seconds or timecode)
- **Valid Range:** 1 to 2000 frames
- **Frame Rate:** Preserve existing comp frame rate
- **Start Frame:** Maintain existing comp start frame
- **Output Comp Special Handling:** 
  - Start at frame 1000
  - Slate on frame 1000
  - Footage begins frame 1001
  - Total duration = user input + 1 frame

### 4.2 Slate Frame Generation

#### 4.2.1 Slate Composition Structure
- **Name:** "SLATE_TEMPLATE"
- **Dimensions:** Match Output comp dimensions
- **Duration:** 1 frame
- **Background:** Black (prepared in template)

#### 4.2.2 Slate Layout (Left to Right)

##### Left Section (1/3 width) - Frame Previews
Three vertically stacked frame captures from Output comp:
1. **Top:** First frame (frame 1001)
2. **Middle:** Mid-point frame (frame 1001 + duration/2)
3. **Bottom:** Last frame (frame 1001 + duration - 1)

**Implementation:**
- Use three copies of Output comp in template
- Apply time remapping programmatically
- Update frame holds when duration changes
- Each preview flush against left edge
- Equal spacing with gaps for template graphics

##### Center Section - Text Information
**Display Format:**
```
[PROJECT NAME - BOLD, LARGER]

Date        [YYYY] / [MM] / [DD] [HH:MM] PST
Duration    [N] F [HH:MM:SS:FF] @24fps
Dimensions  [WIDTH] x [HEIGHT]
Lens        [USER_INPUT]mm
Vendor      OPSIS
Comment     [USER_INPUT]
```

**Text Specifications:**
- **Font:** System sans-serif (Arial/Helvetica)
- **Color:** White (#FFFFFF)
- **Project Name:** 36pt, bold
- **Other Text:** 24pt, regular
- **Alignment:** Left-aligned
- **Line Height:** 40px (60px after project name)

##### Right Section - Graphics
- Reserved for template graphics
- Not modified by script

#### 4.2.3 Data Sources

| Field | Source | Format | Update Frequency |
|-------|--------|--------|------------------|
| Project Name | `app.project.file.name` | Remove extension | On script run |
| Date | System date | YYYY / MM / DD | On script run |
| Time | System time | HH:MM PST | On script run |
| Duration | User input | Frames & timecode | On script run |
| Dimensions | Output comp | WIDTH x HEIGHT | On script run |
| Frame Rate | Output comp | Rounded integer | On script run |
| Lens | User input | With "mm" suffix | Persistent |
| Vendor | Hardcoded | "OPSIS" | Never changes |
| Comment | User input | Up to 175 chars | Persistent |

### 4.3 Data Persistence

#### 4.3.1 Stored Values
- Last entered duration
- Lens information
- Comment text

#### 4.3.2 Storage Method
- **Type:** Project-specific settings
- **Method:** `app.settings.saveSetting()`
- **Scope:** Current project only
- **Persistence:** Values remain in UI after script run
- **Update:** Re-running script updates slate with new values

### 4.4 Validation and Error Handling

#### 4.4.1 Input Validation
- **Duration Field:**
  - Numeric characters only
  - Range: 1-2000 frames
  - Error Message: "Please enter a valid duration between 1 and 2000 frames."

#### 4.4.2 Missing Composition Handling
- **Detection:** Check for required comps before processing
- **Response:** Display popup listing missing comps
- **Behavior:** Process available comps, skip missing ones
- **Message Format:** 
  ```
  "Updated comps: [list]
   Missing comps (not updated): [list]"
  ```

#### 4.4.3 Confirmation Dialog
- **Trigger:** After successful duration change
- **Message:** "Durations have been changed to [XXX] frames."
- **Additional Info:** List of updated and missing comps

### 4.5 Undo Functionality
- **Implementation:** Native After Effects undo group
- **Group Name:** "Set Comp Durations"
- **Undo Button State:** 
  - Disabled initially
  - Enabled after successful operation
  - Disabled after undo executed

---

## 5. Workflow

### 5.1 Initial Setup (One-time)
1. Install script in After Effects Scripts folder
2. Add company logo.jpg (optional)
3. Prepare template project with required comps
4. Set up SLATE_TEMPLATE with graphics and Output comp references

### 5.2 Standard Operation Flow
1. User opens dockable panel
2. Previous values auto-populate (if any)
3. User enters/modifies duration
4. User enters/modifies lens and comment (optional)
5. User clicks "Set Durations"
6. Script validates input
7. Script updates comp durations
8. Script generates/updates slate information
9. Script positions slate on frame 1000 of Output comps
10. Confirmation dialog appears
11. Status updates to show completion

### 5.3 Re-run Behavior
- All slate information updates with new values
- Frame holds update to new duration
- Previous input values persist in UI
- User can modify and re-run as needed

---

## 6. Technical Implementation Details

### 6.1 Core Functions

| Function | Purpose | Parameters | Returns |
|----------|---------|------------|---------|
| `buildUI()` | Construct ScriptUI panel | thisObj | Panel object |
| `processComps()` | Update comp durations | duration, lens, comment | Success status |
| `updateSlate()` | Generate/update slate | outputComp, duration, lens, comment | void |
| `updateFrameHolds()` | Set time remapping | slateComp, outputComp, duration | void |
| `updateSlateText()` | Create/update text layers | slateComp, outputComp, duration, lens, comment | void |
| `ensureSlateInOutput()` | Position slate in Output | outputComp, slateComp | void |
| `validateDuration()` | Check input validity | duration | boolean |
| `savePreferences()` | Store user inputs | duration, lens, comment | void |
| `loadPreferences()` | Retrieve saved values | none | object |

### 6.2 Time Calculation Formulas
```javascript
// Frame to time conversion
timeInSeconds = frameNumber / frameRate

// Duration display format
hours = Math.floor(totalSeconds / 3600)
minutes = Math.floor((totalSeconds % 3600) / 60)
seconds = Math.floor(totalSeconds % 60)
frames = duration % Math.floor(frameRate)

// Middle frame calculation
middleFrame = OUTPUT_START_FRAME + 1 + Math.floor(duration / 2)

// Last frame calculation
lastFrame = OUTPUT_START_FRAME + duration
```

### 6.3 Layer Management
- **Text Layer Naming:** `[FieldName]_Text`
- **Layer Order:** Slate at bottom of stack
- **Time Remapping:** Enable and clear existing keyframes before setting

---

## 7. Testing Requirements

### 7.1 Functional Tests
- [ ] Logo loads from script directory
- [ ] Duration validation (negative, zero, >2000, non-numeric)
- [ ] All three comp types update correctly
- [ ] Missing comp handling and reporting
- [ ] Slate text displays all fields correctly
- [ ] Frame previews show correct frames
- [ ] Persistence across sessions
- [ ] Undo functionality

### 7.2 Edge Cases
- [ ] Project with no Output comps
- [ ] Project missing all required comps
- [ ] Duration of 1 frame
- [ ] Duration of 2000 frames
- [ ] Empty lens and comment fields
- [ ] 175-character comment
- [ ] Re-running with different duration

### 7.3 Cross-Platform Testing
- [ ] Windows 10/11 compatibility
- [ ] macOS compatibility
- [ ] Font fallback behavior
- [ ] File path handling

---

## 8. Future Enhancements (Out of Scope)

- Multiple project template support
- Batch processing multiple projects
- Custom slate templates per project type
- Export slate as separate image
- Integration with render queue
- Customizable frame preview positions
- Additional metadata fields

---

## 9. Deliverables

1. **CompDurationManager.jsx** - Complete script file
2. **Installation guide** - Setup instructions
3. **Template preparation guide** - How to set up SLATE_TEMPLATE
4. **Sample logo.jpg** - 90x90 placeholder image

---

## 10. Success Criteria

- Script successfully updates all existing specified comps
- Slate generates with all required information
- Frame previews display correct frames
- Data persists between sessions
- Clear error messages for invalid input
- Undo functionality works reliably
- Cross-platform compatibility confirmed

---

## Appendix A: Constants

```javascript
SCRIPT_NAME = "Set Comp Durations"
MAX_DURATION = 2000
VENDOR_NAME = "OPSIS"
SLATE_TEMPLATE_NAME = "SLATE_TEMPLATE"
OUTPUT_START_FRAME = 1000
```

## Appendix B: Error Messages

| Condition | Message |
|-----------|---------|
| Invalid duration | "Please enter a valid duration between 1 and 2000 frames." |
| Success | "Durations have been changed to [X] frames." |
| Missing comps | "Missing comps (not updated): [list]" |
| General error | "Error: [error description]" |

---

**Document History:**
- v1.0 - Initial complete specification based on requirements discussion