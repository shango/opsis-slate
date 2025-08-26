/*
 * Comp Duration Manager with Slate Generator for After Effects
 * Version: 1.0
 * 
 * This script creates a dockable UI panel for setting comp durations
 * and generating/updating slate frames with project information.
 */

(function(thisObj) {
    // Script configuration
    var SCRIPT_NAME = "Set Comp Durations";
    var MAX_DURATION = 2000;
    var SLATE_TEMPLATE_NAME = "SLATE_TEMPLATE";
    
    // Build UI
    function buildUI(thisObj) {
        var panel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Opsis - Slate", undefined, {resizeable:true});
        panel.orientation = "column";
        panel.alignChildren = ["fill","top"];
        panel.spacing = 10;
        panel.margins = 16;

        // MAINGROUP
        var mainGroup = panel.add("group", undefined, {name: "mainGroup"});
        mainGroup.orientation = "column";
        mainGroup.alignChildren = ["fill","top"];
        mainGroup.spacing = 10;
        mainGroup.margins = 0;

        // Logo group
        var logoGroup = mainGroup.add("group");
        logoGroup.orientation = "column";
        logoGroup.alignChildren = "center";
        
        var scriptPath = File($.fileName).parent;
        var logoFile = new File(scriptPath.fsName + "/logo/logo.png");
        
        if (logoFile.exists) {
            try {
                var logoImg = ScriptUI.newImage(logoFile);
                logoGroup.add("image", undefined, logoImg);
            } catch(e) {
                // Silent fail if logo can't load
            }
        }

        // DURATIONPANEL
        var durationPanel = mainGroup.add("panel", undefined, undefined, {name: "durationPanel"});
        durationPanel.text = "Duration";
        durationPanel.orientation = "row";
        durationPanel.alignChildren = ["left","top"];
        durationPanel.spacing = 10;
        durationPanel.margins = 10;

        // DURATIONGROUP
        var durationGroup = durationPanel.add("group", undefined, {name: "durationGroup"});
        durationGroup.orientation = "row";
        durationGroup.alignChildren = ["left","center"];
        durationGroup.spacing = 10;
        durationGroup.margins = 0;

        var durationButton = durationGroup.add("button", undefined, undefined, {name: "durationButton"});
        durationButton.text = "Set Duration";

        // CUSTOMDURATIONGROUP - second row for custom duration option
        var customDurationGroup = durationPanel.add("group", undefined, {name: "customDurationGroup"});
        customDurationGroup.orientation = "row";
        customDurationGroup.alignChildren = ["left","center"];
        customDurationGroup.spacing = 10;
        customDurationGroup.margins = 0;

        var customDurationCheckbox = customDurationGroup.add("checkbox", undefined, undefined, {name: "customDurationCheckbox"});
        customDurationCheckbox.text = "Custom Duration";

        var durationInput = customDurationGroup.add('edittext {properties: {name: "durationInput"}}');
        durationInput.preferredSize.width = 60;
        durationInput.enabled = false; // disabled by default

        // Checkbox behavior to enable/disable duration input
        customDurationCheckbox.onClick = function() {
            durationInput.enabled = customDurationCheckbox.value;
            if (customDurationCheckbox.value) {
                durationInput.active = true; // focus the input when enabled
            }
        };

        // SLATEPANEL
        var slatePanel = mainGroup.add("panel", undefined, undefined, {name: "slatePanel"});
        slatePanel.text = "Slate Info";
        slatePanel.preferredSize.height = 160;
        slatePanel.orientation = "column";
        slatePanel.alignChildren = ["left","top"];
        slatePanel.spacing = 10;
        slatePanel.margins = 10;

        // SLATEGROUP
        var slateGroup = slatePanel.add("group", undefined, {name: "slateGroup"});
        slateGroup.orientation = "row";
        slateGroup.alignChildren = ["left","center"];
        slateGroup.spacing = 10;
        slateGroup.margins = 0;

        var artistText = slateGroup.add("statictext", undefined, undefined, {name: "artistText"});
        artistText.text = "Artist ";

        var artistInput = slateGroup.add('edittext {properties: {name: "artistInput"}}');
        artistInput.preferredSize.width = 60;

        var lensText = slateGroup.add("statictext", undefined, undefined, {name: "lensText"});
        lensText.text = "Lens";

        var lensInput = slateGroup.add('edittext {properties: {name: "lensInput"}}');
        lensInput.preferredSize.width = 60;

        // NOTEGROUP
        var noteGroup = slatePanel.add("group", undefined, {name: "noteGroup"});
        noteGroup.orientation = "column";
        noteGroup.alignChildren = ["left","center"];
        noteGroup.spacing = 10;
        noteGroup.margins = 0;

        var noteInput = noteGroup.add('edittext {properties: {name: "noteInput", multiline: true, scrolling: false}}');
        noteInput.preferredSize.width = 220;
        noteInput.preferredSize.height = 60;

        var slateButton = noteGroup.add("button", undefined, undefined, {name: "slateButton"});
        slateButton.text = "Update Slate";
        slateButton.justify = "left";
        slateButton.alignment = ["left","center"];

        // VERSIONPANEL
        var versionPanel = mainGroup.add("panel", undefined, undefined, {name: "versionPanel"});
        versionPanel.text = "Version";
        versionPanel.orientation = "column";
        versionPanel.alignChildren = ["left","top"];
        versionPanel.spacing = 10;
        versionPanel.margins = 10;

        // VERSIONGROUP
        var versionGroup = versionPanel.add("group", undefined, {name: "versionGroup"});
        versionGroup.orientation = "column";
        versionGroup.alignChildren = ["left","center"];
        versionGroup.spacing = 10;
        versionGroup.margins = 0;
        versionGroup.alignment = ["fill","top"];

        var versionButton = versionGroup.add("button", undefined, undefined, {name: "versionButton"});
        versionButton.text = "Version Up";

        // Status text
        var statusText = panel.add("statictext", undefined, "Status: Ready");
        
        // Helper functions for preferences
        function savePreferences() {
            var projectId = getProjectId();
            app.settings.saveSetting(SCRIPT_NAME, "projectId", projectId);
            app.settings.saveSetting(SCRIPT_NAME, "customDuration", customDurationCheckbox.value.toString());
            app.settings.saveSetting(SCRIPT_NAME, "duration", durationInput.text);
            app.settings.saveSetting(SCRIPT_NAME, "lens", lensInput.text);
            app.settings.saveSetting(SCRIPT_NAME, "artist", artistInput.text);
            app.settings.saveSetting(SCRIPT_NAME, "comment", noteInput.text);
        }
        
        function loadPreferences() {
            try {
                var currentProjectId = getProjectId();
                var savedProjectId = app.settings.haveSetting(SCRIPT_NAME, "projectId") ? 
                                    app.settings.getSetting(SCRIPT_NAME, "projectId") : "";
                
                // Only load preferences if they're for the current project
                if (savedProjectId === currentProjectId && currentProjectId !== "") {
                    if (app.settings.haveSetting(SCRIPT_NAME, "customDuration")) {
                        customDurationCheckbox.value = app.settings.getSetting(SCRIPT_NAME, "customDuration") === "true";
                        durationInput.enabled = customDurationCheckbox.value;
                    }
                    if (app.settings.haveSetting(SCRIPT_NAME, "duration")) {
                        durationInput.text = app.settings.getSetting(SCRIPT_NAME, "duration");
                    }
                    if (app.settings.haveSetting(SCRIPT_NAME, "lens")) {
                        lensInput.text = app.settings.getSetting(SCRIPT_NAME, "lens");
                    }
                    if (app.settings.haveSetting(SCRIPT_NAME, "artist")) {
                        artistInput.text = app.settings.getSetting(SCRIPT_NAME, "artist");
                    }
                    if (app.settings.haveSetting(SCRIPT_NAME, "comment")) {
                        noteInput.text = app.settings.getSetting(SCRIPT_NAME, "comment");
                    }
                }
            } catch (e) {
                // Silently fail if there's an issue with preferences
            }
        }
        
        // Button functionality with real processing
        durationButton.onClick = function() {
            var duration;
            
            if (customDurationCheckbox.value) {
                // Use custom duration from input field
                duration = parseInt(durationInput.text);
                
                // Validate custom duration
                if (isNaN(duration) || duration <= 0 || duration > MAX_DURATION) {
                    alert("Please enter a valid duration between 1 and " + MAX_DURATION + " frames.", SCRIPT_NAME);
                    return;
                }
            } else {
                // Use footage duration (original behavior)
                var sequenceComp = findCompByName("Sequence");
                if (!sequenceComp) {
                    alert("Sequence comp not found.", SCRIPT_NAME);
                    return;
                }
                
                // Find the footage layer in the Sequence comp
                var footageLayer = findFootageLayer(sequenceComp);
                if (!footageLayer) {
                    alert("No footage layer found in Sequence comp.", SCRIPT_NAME);
                    return;
                }
                
                // Get duration from footage layer (convert from seconds to frames)
                duration = Math.round(footageLayer.source.duration * sequenceComp.frameRate);
                
                // Validate footage duration
                if (duration <= 0 || duration > MAX_DURATION) {
                    alert("Footage duration (" + duration + " frames) is outside valid range (1-" + MAX_DURATION + " frames).", SCRIPT_NAME);
                    return;
                }
            }
            
            // Save preferences 
            savePreferences();
            
            // Process comp durations
            app.beginUndoGroup("Set Comp Durations");
            
            try {
                var result = processCompDurations(duration);
                
                if (result.success) {
                    var source = customDurationCheckbox.value ? "(custom)" : "(from footage)";
                    statusText.text = "Status: Duration set to " + duration + " frames " + source;
                } else {
                    statusText.text = "Status: Error occurred";
                    alert(result.message, SCRIPT_NAME);
                }
            } catch (e) {
                alert("Error: " + e.toString(), SCRIPT_NAME);
                statusText.text = "Status: Error occurred";
            }
            
            app.endUndoGroup();
        };
        
        slateButton.onClick = function() {
            // Get duration from Output comp - 1 frame
            var outputComp = findCompByName("Output");
            if (!outputComp) {
                alert("Output comp not found.", SCRIPT_NAME);
                return;
            }
            
            // Calculate duration from Output comp (convert from seconds to frames, minus 1 for slate frame)
            var duration = Math.round(outputComp.duration * outputComp.frameRate) - 1;
            
            // Validate duration
            if (duration <= 0 || duration > MAX_DURATION) {
                alert("Output comp duration (" + duration + " frames) is outside valid range (1-" + MAX_DURATION + " frames).", SCRIPT_NAME);
                return;
            }
            
            // Save preferences
            savePreferences();
            
            // Update slate
            app.beginUndoGroup("Update Slate");
            
            try {
                var result = processSlateUpdate(duration, lensInput.text, artistInput.text, noteInput.text);
                
                if (result.success) {
                    statusText.text = "Status: Slate updated";
                } else {
                    statusText.text = "Status: Error occurred";
                    alert(result.message, SCRIPT_NAME);
                }
            } catch (e) {
                alert("Error: " + e.toString(), SCRIPT_NAME);
                statusText.text = "Status: Error occurred";
            }
            
            app.endUndoGroup();
        };
        
        versionButton.onClick = function() {
            try {
                var result = versionUpProject();
                if (result.success) {
                    statusText.text = "Status: Saved as " + result.newFileName;
                    // Load preferences after project changes
                    loadPreferences();
                } else {
                    statusText.text = "Status: Version up failed";
                    alert(result.message, SCRIPT_NAME);
                }
            } catch (e) {
                alert("Error versioning up: " + e.toString(), SCRIPT_NAME);
                statusText.text = "Status: Version up error";
            }
        };
        
        // Load preferences immediately when UI is built, not on first button click
        loadPreferences();
        
        // Layout and show
        panel.layout.layout(true);
        
        return panel;
    }
    
    // Main processing function (kept for backward compatibility)
    function processComps(duration, lens, artist, comment) {
        var compResult = processCompDurations(duration);
        var slateResult = processSlateUpdate(duration, lens, artist, comment);
        
        return {
            success: compResult.success || slateResult.success,
            message: compResult.message + (slateResult.message ? "\n" + slateResult.message : "")
        };
    }
    
    // Process comp durations only
    function processCompDurations(duration) {
        var project = app.project;
        var missingComps = [];
        var processedComps = [];
        
        // Find and process Sequence comp (holds footage file)
        var sequenceComp = findCompByName("Sequence");
        if (sequenceComp) {
            sequenceComp.duration = duration / sequenceComp.frameRate;
            processedComps.push("Sequence");
        } else {
            missingComps.push("Sequence");
        }
        
        // Find and process Working comp (holds instance of Sequence)
        var workingComp = findCompByName("Working");
        if (workingComp) {
            workingComp.duration = duration / workingComp.frameRate;
            processedComps.push("Working");
        } else {
            missingComps.push("Working");
        }
        
        // Find and process Output comp (has Working starting at frame 2, slate on frame 1)
        var outputComp = findCompByName("Output");
        if (outputComp) {
            // Output comp gets duration + 1 for slate frame
            outputComp.duration = (duration + 1) / outputComp.frameRate;
            processedComps.push("Output");
        } else {
            missingComps.push("Output");
        }
        
        // Build result message
        var message = "";
        if (processedComps.length > 0) {
            message += "Updated comp durations: " + processedComps.join(", ");
        }
        if (missingComps.length > 0) {
            if (message) message += "\n";
            message += "Missing comps (not updated): " + missingComps.join(", ");
        }
        
        return {
            success: processedComps.length > 0,
            message: message
        };
    }
    
    // Process slate update only
    function processSlateUpdate(duration, lens, artist, comment) {
        var outputComp = findCompByName("Output");
        
        if (outputComp) {
            // Update slate for the output comp
            updateSlate(outputComp, duration, lens, artist, comment);
            
            return {
                success: true,
                message: "Updated slate for: " + outputComp.name
            };
        } else {
            return {
                success: false,
                message: "Output comp not found for slate update"
            };
        }
    }
    
    // Update slate composition
    function updateSlate(outputComp, duration, lens, artist, comment) {
        // Find slate template comp
        var slateComp = findCompByName(SLATE_TEMPLATE_NAME);
        if (!slateComp) {
            alert("SLATE_TEMPLATE composition not found. Please use the correct template file that includes a SLATE_TEMPLATE composition.");
            return;
        }
        
        // Update frame holds for the three preview frames
        updateFrameHolds(slateComp, outputComp, duration);
        
        // Update text information
        updateSlateText(slateComp, outputComp, duration, lens, artist, comment);
        
        // Don't update slate timing - leave it positioned where it was in template
    }
    
    // Update frame holds using Time Remap expressions on layers identified by comment
    function updateFrameHolds(slateComp, outputComp, duration) {
        // Get the Working comp to determine frame rate
        var workingComp = findCompByName("Working");
        if (!workingComp) {
            return; // Can't proceed without working comp
        }
        
        // Calculate frame indices (0-based for AE)
        var firstFrameIndex = 0; // First frame = frame 0
        var middleFrameIndex = Math.floor((duration - 1) / 2); // Middle frame
        var lastFrameIndex = duration - 1; // Last frame
        
        // Convert to seconds for Time Remap expressions
        var frameRate = workingComp.frameRate;
        var firstFrameTime = firstFrameIndex / frameRate;
        var middleFrameTime = middleFrameIndex / frameRate;
        var lastFrameTime = lastFrameIndex / frameRate;
        
        // Update each layer identified by comment field
        setTimeRemapExpression(slateComp, "FIRST", firstFrameTime);
        setTimeRemapExpression(slateComp, "MIDDLE", middleFrameTime);
        setTimeRemapExpression(slateComp, "LAST", lastFrameTime);
    }
    
    // Set time remap expression on a layer identified by comment field
    function setTimeRemapExpression(comp, commentText, timeInSeconds) {
        var layer = findLayerByComment(comp, commentText);
        if (!layer) {
            return; // Layer not found, skip silently
        }
        
        try {
            // Get the Time Remap property if it exists
            var timeRemapProp = layer.property("ADBE Time Remapping");
            
            if (timeRemapProp) {
                // Set the expression to the calculated time in seconds
                timeRemapProp.expression = timeInSeconds.toString();
            }
            
        } catch (e) {
            // Silent fail if there's any issue
        }
    }
    
    // Update slate text layers using template layer duplication approach
    function updateSlateText(slateComp, outputComp, duration, lens, artist, comment) {
        // Get current date/time
        var now = new Date();
        
        // Calculate duration in different formats
        var totalSeconds = duration / outputComp.frameRate;
        var hours = Math.floor(totalSeconds / 3600);
        var minutes = Math.floor((totalSeconds % 3600) / 60);
        var seconds = Math.floor(totalSeconds % 60);
        var frames = duration % Math.floor(outputComp.frameRate);
        
        // Get project name (without extension)
        var projectName = app.project.file ? app.project.file.name.replace(/\.[^\.]+$/, '') : "Untitled Project";
        
        // Define template variables and their values (only user inputs)
        var templateVars = {
            "{{artist}}": artist || "",
            "{{lens}}": lens || "",
            "{{comment}}": comment || ""
        };
        
        // Process all text layers in the slate comp
        for (var i = 1; i <= slateComp.numLayers; i++) {
            var layer = slateComp.layer(i);
            
            if (layer instanceof TextLayer) {
                var sourceText = layer.property("Source Text");
                var templateText = layer.comment;
                
                // If comment is empty, this is the first run - store current text as template ONLY if it contains template variables
                if (!templateText || templateText === "") {
                    var currentText = sourceText.value.text;
                    var hasTemplateVars = false;
                    
                    // Check if current text contains any template variables
                    for (var variable in templateVars) {
                        if (currentText.indexOf(variable) !== -1) {
                            hasTemplateVars = true;
                            break;
                        }
                    }
                    
                    // Only store as template and process if it contains template variables
                    if (hasTemplateVars) {
                        layer.comment = currentText;
                        templateText = currentText;
                    } else {
                        // Skip this layer - it doesn't have template variables
                        continue;
                    }
                } else {
                    // Check if stored template contains any template variables
                    var hasTemplateVars = false;
                    for (var variable in templateVars) {
                        if (templateText.indexOf(variable) !== -1) {
                            hasTemplateVars = true;
                            break;
                        }
                    }
                    
                    // Skip if no template variables found
                    if (!hasTemplateVars) {
                        continue;
                    }
                }
                
                var updatedText = templateText;
                
                // Replace all template variables (including blank ones)
                for (var variable in templateVars) {
                    updatedText = updatedText.replace(new RegExp(escapeRegExp(variable), 'g'), templateVars[variable]);
                }
                
                // Update the text content only if it changed
                if (updatedText !== sourceText.value.text) {
                    var textDoc = sourceText.value;
                    textDoc.text = updatedText;
                    sourceText.setValue(textDoc);
                }
            }
        }
    }
    
    // Helper function to escape special regex characters
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // Helper function to find comp by exact name
    function findCompByName(name) {
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof CompItem && item.name === name) {
                return item;
            }
        }
        return null;
    }
    
    // Helper function to find layer by comment text in a comp
    function findLayerByComment(comp, commentText) {
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            if (layer.comment === commentText) {
                return layer;
            }
        }
        return null;
    }
    
    // Helper function to find footage layer in a comp (excludes solids, adjustment layers, etc.)
    function findFootageLayer(comp) {
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            
            // Check if it's a footage layer (has source, not adjustment layer, not solid)
            if (layer.source && 
                !layer.adjustmentLayer && 
                layer.source.typeName !== "Solid" &&
                layer.source.mainSource) {
                return layer;
            }
        }
        return null;
    }
    
    // Get unique project identifier for preferences
    function getProjectId() {
        if (app.project.file) {
            // Use full file path as unique identifier
            return app.project.file.fsName;
        } else {
            // For unsaved projects, return empty string (no preferences saved/loaded)
            return "";
        }
    }
    
    // Version up project file
    function versionUpProject() {
        if (!app.project.file) {
            return {
                success: false,
                message: "Project must be saved before versioning up."
            };
        }
        
        var currentFile = app.project.file;
        var currentPath = currentFile.fsName;
        var currentName = currentFile.name;
        
        // Parse version number from filename
        var versionMatch = currentName.match(/_v(\d+)\.aep$/i);
        var newFileName, newVersion;
        
        var folder = currentFile.parent;
        var baseNameWithoutVersion, versionLength;
        
        if (versionMatch) {
            // Found version number
            var currentVersion = parseInt(versionMatch[1], 10);
            versionLength = versionMatch[1].length;
            baseNameWithoutVersion = currentName.replace(/_v\d+\.aep$/i, '');
            newVersion = currentVersion + 1;
        } else {
            // No version found, start with v0001
            baseNameWithoutVersion = currentName.replace(/\.aep$/i, '');
            versionLength = 3;
            newVersion = 1;
        }
        
        // Find next available version number
        var newFile;
        do {
            // Pad with zeros to match original length (or 4 digits for new versions)
            var paddedVersion = newVersion.toString();
            while (paddedVersion.length < versionLength) {
                paddedVersion = "0" + paddedVersion;
            }
            
            newFileName = baseNameWithoutVersion + "_v" + paddedVersion + ".aep";
            newFile = new File(folder.fsName + "/" + newFileName);
            
            if (newFile.exists) {
                newVersion++;
            }
        } while (newFile.exists);
        
        // Save as new version
        try {
            app.project.save(newFile);
            return {
                success: true,
                newFileName: newFileName.replace(/\.aep$/i, '')
            };
        } catch (e) {
            return {
                success: false,
                message: "Failed to save new version: " + e.toString()
            };
        }
    }
    
    
    // Build and show UI
    var ui = buildUI(thisObj);
    
    if (ui instanceof Window) {
        ui.center();
        ui.show();
    } else {
        ui.layout.layout(true);
    }
    
})(this);