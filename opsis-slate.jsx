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
    var VENDOR_NAME = "OPSIS";
    var SLATE_TEMPLATE_NAME = "SLATE_TEMPLATE";
    var OUTPUT_START_FRAME = 1000; // Frame where output comp starts
    
    // Build UI
    function buildUI(thisObj) {
        var panel = (thisObj instanceof Panel) ? thisObj : new Window("dialog", SCRIPT_NAME, undefined, {resizeable: true});
        
        // Panel setup
        panel.orientation = "column";
        panel.alignChildren = "center";
        panel.spacing = 10;
        panel.margins = 15;
        
        // Logo placeholder group
        var logoGroup = panel.add("group");
        logoGroup.orientation = "column";
        logoGroup.alignChildren = "center";
        logoGroup.spacing = 5;
        
        // Try to load logo
        var logoPanel = logoGroup.add("panel");
        logoPanel.preferredSize.width = 90;
        logoPanel.preferredSize.height = 90;
        
        try {
            var scriptFile = new File($.fileName);
            var scriptFolder = scriptFile.parent;
            var logoFile = new File(scriptFolder.fsName + "/logo.jpg");
            
            if (logoFile.exists) {
                var logoImage = logoPanel.add("image", undefined, logoFile);
                logoImage.size = [90, 90];
            } else {
                var logoText = logoPanel.add("statictext", undefined, "Logo\n90x90");
                logoText.alignment = "center";
            }
        } catch (e) {
            var logoText = logoPanel.add("statictext", undefined, "Logo\n90x90");
            logoText.alignment = "center";
        }
        
        // Separator
        var separator1 = panel.add("panel");
        separator1.preferredSize.width = 210;
        separator1.preferredSize.height = 1;
        
        // Duration input group
        var durationGroup = panel.add("group");
        durationGroup.orientation = "row";
        durationGroup.alignChildren = "center";
        durationGroup.spacing = 8;
        
        var durationLabel = durationGroup.add("statictext", undefined, "Duration (frames):");
        durationLabel.preferredSize.width = 100;
        
        var durationInput = durationGroup.add("edittext", undefined, "");
        durationInput.preferredSize.width = 80;
        durationInput.preferredSize.height = 25;
        
        // Lens input group
        var lensGroup = panel.add("group");
        lensGroup.orientation = "row";
        lensGroup.alignChildren = "center";
        lensGroup.spacing = 8;
        
        var lensLabel = lensGroup.add("statictext", undefined, "Lens:");
        lensLabel.preferredSize.width = 100;
        
        var lensInput = lensGroup.add("edittext", undefined, "");
        lensInput.preferredSize.width = 80;
        lensInput.preferredSize.height = 25;
        
        // Comment input group
        var commentGroup = panel.add("group");
        commentGroup.orientation = "column";
        commentGroup.alignChildren = "left";
        commentGroup.spacing = 5;
        
        var commentLabel = commentGroup.add("statictext", undefined, "Comment:");
        
        var commentInput = commentGroup.add("edittext", undefined, "", {multiline: true});
        commentInput.preferredSize.width = 180;
        commentInput.preferredSize.height = 50;
        
        // Button group
        var buttonGroup = panel.add("group");
        buttonGroup.orientation = "row";
        buttonGroup.alignChildren = "center";
        buttonGroup.spacing = 10;
        
        var setButton = buttonGroup.add("button", undefined, "Set Durations");
        setButton.preferredSize.width = 90;
        setButton.preferredSize.height = 25;
        
        var undoButton = buttonGroup.add("button", undefined, "Undo");
        undoButton.preferredSize.width = 90;
        undoButton.preferredSize.height = 25;
        undoButton.enabled = false;
        
        // Status text
        var statusText = panel.add("statictext", undefined, "Status: Ready");
        statusText.preferredSize.width = 200;
        
        // Load saved preferences
        loadPreferences();
        
        // Button click handlers
        setButton.onClick = function() {
            var duration = parseInt(durationInput.text);
            
            // Validate duration
            if (isNaN(duration) || duration <= 0 || duration > MAX_DURATION) {
                alert("Please enter a valid duration between 1 and " + MAX_DURATION + " frames.", SCRIPT_NAME);
                return;
            }
            
            // Save preferences
            savePreferences();
            
            // Process comps
            app.beginUndoGroup(SCRIPT_NAME);
            
            try {
                var result = processComps(duration, lensInput.text, commentInput.text);
                
                if (result.success) {
                    statusText.text = "Status: Duration set to " + duration + " frames";
                    alert("Durations have been changed to " + duration + " frames.\n\n" + result.message, SCRIPT_NAME);
                    undoButton.enabled = true;
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
        
        undoButton.onClick = function() {
            app.executeCommand(16); // Undo command
            undoButton.enabled = false;
            statusText.text = "Status: Undone";
        };
        
        // Helper functions for preferences
        function savePreferences() {
            app.settings.saveSetting(SCRIPT_NAME, "duration", durationInput.text);
            app.settings.saveSetting(SCRIPT_NAME, "lens", lensInput.text);
            app.settings.saveSetting(SCRIPT_NAME, "comment", commentInput.text);
        }
        
        function loadPreferences() {
            if (app.settings.haveSetting(SCRIPT_NAME, "duration")) {
                durationInput.text = app.settings.getSetting(SCRIPT_NAME, "duration");
            }
            if (app.settings.haveSetting(SCRIPT_NAME, "lens")) {
                lensInput.text = app.settings.getSetting(SCRIPT_NAME, "lens");
            }
            if (app.settings.haveSetting(SCRIPT_NAME, "comment")) {
                commentInput.text = app.settings.getSetting(SCRIPT_NAME, "comment");
            }
        }
        
        // Layout and show
        panel.layout.layout(true);
        
        return panel;
    }
    
    // Main processing function
    function processComps(duration, lens, comment) {
        var project = app.project;
        var missingComps = [];
        var processedComps = [];
        
        // Find and process Plate comp
        var plateComp = findCompByName("Plate");
        if (plateComp) {
            plateComp.duration = duration / plateComp.frameRate;
            processedComps.push("Plate");
        } else {
            missingComps.push("Plate");
        }
        
        // Find and process working comp
        var workingComp = findCompByName("working");
        if (workingComp) {
            workingComp.duration = duration / workingComp.frameRate;
            processedComps.push("working");
        } else {
            missingComps.push("working");
        }
        
        // Find and process Output comps
        var outputComps = findCompsStartingWith("Output");
        if (outputComps.length > 0) {
            for (var i = 0; i < outputComps.length; i++) {
                var outputComp = outputComps[i];
                // Output comps get duration + 1 for slate frame
                outputComp.duration = (duration + 1) / outputComp.frameRate;
                processedComps.push(outputComp.name);
                
                // Update slate for this output comp
                updateSlate(outputComp, duration, lens, comment);
            }
        } else {
            missingComps.push("Output comps");
        }
        
        // Build result message
        var message = "";
        if (processedComps.length > 0) {
            message += "Updated comps: " + processedComps.join(", ") + "\n";
        }
        if (missingComps.length > 0) {
            message += "Missing comps (not updated): " + missingComps.join(", ");
        }
        
        return {
            success: processedComps.length > 0,
            message: message
        };
    }
    
    // Update slate composition
    function updateSlate(outputComp, duration, lens, comment) {
        // Find slate template comp
        var slateComp = findCompByName(SLATE_TEMPLATE_NAME);
        if (!slateComp) {
            // Create slate comp if it doesn't exist
            slateComp = app.project.items.addComp(
                SLATE_TEMPLATE_NAME,
                outputComp.width,
                outputComp.height,
                outputComp.pixelAspect,
                1 / outputComp.frameRate, // 1 frame duration
                outputComp.frameRate
            );
        }
        
        // Update frame holds for the three preview frames
        updateFrameHolds(slateComp, outputComp, duration);
        
        // Update text information
        updateSlateText(slateComp, outputComp, duration, lens, comment);
        
        // Ensure slate is on frame 1 of output comp
        ensureSlateInOutput(outputComp, slateComp);
    }
    
    // Update frame hold expressions
    function updateFrameHolds(slateComp, outputComp, duration) {
        // Look for layers that are copies of the output comp
        for (var i = 1; i <= slateComp.numLayers; i++) {
            var layer = slateComp.layer(i);
            
            if (layer.source && layer.source instanceof CompItem) {
                // Check if this is a reference to the output comp
                if (layer.source.name.indexOf("Output") === 0 || layer.name.indexOf("Frame") !== -1) {
                    // Determine which frame this should show based on position
                    var layerY = layer.position.value[1];
                    var compHeight = slateComp.height;
                    
                    // Assuming three frames stacked vertically
                    if (layerY < compHeight * 0.33) {
                        // Top frame - first frame
                        setTimeRemap(layer, OUTPUT_START_FRAME + 1, outputComp.frameRate);
                    } else if (layerY < compHeight * 0.66) {
                        // Middle frame
                        var middleFrame = OUTPUT_START_FRAME + 1 + Math.floor(duration / 2);
                        setTimeRemap(layer, middleFrame, outputComp.frameRate);
                    } else {
                        // Bottom frame - last frame
                        var lastFrame = OUTPUT_START_FRAME + duration;
                        setTimeRemap(layer, lastFrame, outputComp.frameRate);
                    }
                }
            }
        }
    }
    
    // Set time remapping for a layer
    function setTimeRemap(layer, frameNumber, frameRate) {
        if (!layer.timeRemapEnabled) {
            layer.timeRemapEnabled = true;
        }
        
        // Clear existing keyframes
        while (layer.property("Time Remap").numKeys > 0) {
            layer.property("Time Remap").removeKey(1);
        }
        
        // Set time remap to hold on specific frame
        var timeInSeconds = frameNumber / frameRate;
        layer.property("Time Remap").setValueAtTime(0, timeInSeconds);
    }
    
    // Update slate text layers
    function updateSlateText(slateComp, outputComp, duration, lens, comment) {
        // Get current date/time
        var now = new Date();
        var dateStr = now.getFullYear() + " / " + 
                     padZero(now.getMonth() + 1) + " / " + 
                     padZero(now.getDate());
        var timeStr = padZero(now.getHours()) + ":" + padZero(now.getMinutes());
        
        // Calculate duration in different formats
        var totalSeconds = duration / outputComp.frameRate;
        var hours = Math.floor(totalSeconds / 3600);
        var minutes = Math.floor((totalSeconds % 3600) / 60);
        var seconds = Math.floor(totalSeconds % 60);
        var frames = duration % Math.floor(outputComp.frameRate);
        
        var durationStr = padZero(hours) + ":" + padZero(minutes) + ":" + 
                         padZero(seconds) + ":" + padZero(frames);
        
        // Get project name (without extension)
        var projectName = app.project.file ? app.project.file.name.replace(/\.[^\.]+$/, '') : "Untitled Project";
        
        // Text content for slate
        var textContent = {
            "Project": projectName,
            "Date": dateStr + " " + timeStr + " PST",
            "Duration": duration + " F " + durationStr + " @" + Math.round(outputComp.frameRate) + "fps",
            "Dimensions": outputComp.width + " x " + outputComp.height,
            "Lens": lens ? lens + "mm" : "",
            "Vendor": VENDOR_NAME,
            "Comment": comment || ""
        };
        
        // Create or update text layers
        var yPosition = 150; // Starting Y position for text
        var lineHeight = 40;
        
        for (var key in textContent) {
            if (textContent[key] === "" && key !== "Comment") continue;
            
            var textLayer = findOrCreateTextLayer(slateComp, key);
            var sourceText = textLayer.property("Source Text");
            
            // Format the text
            var displayText = key + ":\t\t" + textContent[key];
            if (key === "Project") {
                displayText = textContent[key]; // Project name without label
            }
            
            sourceText.setValue(displayText);
            
            // Style the text
            var textDoc = sourceText.value;
            textDoc.fontSize = (key === "Project") ? 36 : 24;
            textDoc.fillColor = [1, 1, 1]; // White
            textDoc.font = getSystemFont();
            textDoc.justification = ParagraphJustification.LEFT_JUSTIFY;
            
            if (key === "Project") {
                textDoc.fontSize = 36;
                // Bold style would need to be set if available in the font
            }
            
            sourceText.setValue(textDoc);
            
            // Position the text
            textLayer.position.setValue([slateComp.width / 2, yPosition]);
            yPosition += (key === "Project") ? lineHeight * 1.5 : lineHeight;
        }
    }
    
    // Find or create text layer
    function findOrCreateTextLayer(comp, layerName) {
        // Look for existing layer
        for (var i = 1; i <= comp.numLayers; i++) {
            if (comp.layer(i).name === layerName + "_Text") {
                return comp.layer(i);
            }
        }
        
        // Create new text layer
        var textLayer = comp.layers.addText("");
        textLayer.name = layerName + "_Text";
        return textLayer;
    }
    
    // Ensure slate comp is in output comp
    function ensureSlateInOutput(outputComp, slateComp) {
        var slateLayer = null;
        
        // Look for existing slate layer
        for (var i = 1; i <= outputComp.numLayers; i++) {
            if (outputComp.layer(i).source === slateComp) {
                slateLayer = outputComp.layer(i);
                break;
            }
        }
        
        // Add slate if not found
        if (!slateLayer) {
            slateLayer = outputComp.layers.add(slateComp);
        }
        
        // Position slate at frame 1000 (OUTPUT_START_FRAME)
        slateLayer.startTime = OUTPUT_START_FRAME / outputComp.frameRate;
        
        // Ensure it's only 1 frame long
        slateLayer.outPoint = slateLayer.inPoint + (1 / outputComp.frameRate);
        
        // Move to bottom of layer stack
        slateLayer.moveToEnd();
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
    
    // Helper function to find comps starting with prefix
    function findCompsStartingWith(prefix) {
        var comps = [];
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof CompItem && item.name.indexOf(prefix) === 0) {
                comps.push(item);
            }
        }
        return comps;
    }
    
    // Helper function to pad numbers with zero
    function padZero(num) {
        return (num < 10 ? "0" : "") + num;
    }
    
    // Get appropriate system font
    function getSystemFont() {
        // Try common cross-platform fonts
        var fonts = ["Arial", "Helvetica", "Helvetica Neue", "Segoe UI", "San Francisco"];
        
        for (var i = 0; i < fonts.length; i++) {
            // Check if font exists (this is a simplified check)
            try {
                return fonts[i];
            } catch (e) {
                continue;
            }
        }
        
        return "Arial"; // Fallback
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