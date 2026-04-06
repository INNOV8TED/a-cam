// === THE NATIVE PRODUCTION ENGINE (NO SDK REQUIRED) ===

async function pushToProduction() {
    console.log("🚀 pushToProduction v8.7 - Enhanced camera + DOF blur");

    if (!S.heroImage || !S.backgroundPlate) {
        showToast("Error: Actor and Background are required.");
        return;
    }
    
    // Master Character Sheet is the PRIMARY identity reference
    if (!S.masterCharacterSheet) {
        showToast("⚠️ Upload a Master Identity Sheet for best likeness results");
    }

    const btn = document.querySelector('.production-btn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span>⏳</span> PREPARING SCENE...';
    btn.disabled = true;

    try {
        showToast("🎬 Preparing assets for Veo 3.1...");

        // 1. CREATE COMPOSITE FRAMES (for scene composition reference)
        // These show WHERE the character should be, NOT what they look like
        const exportStart = document.createElement('canvas');
        const exportEnd = document.createElement('canvas');
        exportStart.width = 1280; exportStart.height = 720;
        exportEnd.width = 1280; exportEnd.height = 720;

        // Render WITH character for composition (pose from Generate Action Pose)
        renderExportFrame(exportStart, S.heroImage, { ...S, frameType: 'start' });
        renderExportFrame(exportEnd, S.heroImage, { ...S, frameType: 'end' });

        // REDUCED QUALITY: 0.55 to stay under Vercel payload limit (~100KB per image)
        const startDataUrl = exportStart.toDataURL('image/jpeg', 0.55);
        const endDataUrl = exportEnd.toDataURL('image/jpeg', 0.55);
        
        // Note: Character sheet is not sent to Veo - character is already in start frame
        // Veo 3.1 doesn't allow both "image" AND "referenceImages" together

        // 2. BUILD COMPREHENSIVE PROMPT
        const basePrompt = document.getElementById('promptBox')?.textContent || "Cinematic video";
        
        // Get action/performance
        const actionField = document.getElementById('subjectAction');
        const characterAction = actionField?.value?.trim() || "standing naturally";
        
        // Get outfit description (plain text from the UI)
        const outfitField = document.getElementById('subjectOutfit');
        const outfitDesc = outfitField?.value?.trim() || "";
        
        // Get action timeline
        const timelineField = document.getElementById('actionTimeline');
        const actionTimeline = timelineField?.value?.trim() || "";
        
        // Get depth layer descriptions for environment context
        const foregroundDesc = document.getElementById('subjectInput')?.value?.trim() || "";
        const midgroundDesc = document.getElementById('midgroundInput')?.value?.trim() || "";
        const backgroundDesc = document.getElementById('backgroundInput')?.value?.trim() || "";
        
// Camera movement description - Optimized for Veo 3.1
        const currentAngle = S.angle || 'Eye Level';
        const currentMovement = S.movement || 'Static';
        
        const angleDesc = {
            'Eye Level': 'Eye-level angle',
            'Low Angle Hero': 'Extreme low angle pointing up',
            'High Angle': 'High angle pointing down',
            'Dutch Tilt': 'Dutch angle tilted frame',
            "Bird's Eye": "Overhead bird's eye view",
            "Worm's Eye": "Ground level worm's eye view"
        }[currentAngle] || 'Eye-level angle';
        
        const cameraDesc = {
            'Dolly Push In': 'Fast dolly in, camera moves rapidly forward toward the subject',
            'Dolly Pull Out': 'Slow dolly out, camera moves slowly backwards away from the subject',
            'Dolly Zoom': 'Vertigo effect, dolly zoom, camera moves backward while zooming in, background expands',
            'Pan Left': 'Camera pans horizontally to the left',
            'Pan Right': 'Camera pans horizontally to the right',
            'Tilt Up': 'Tilt up, camera pans vertically up from bottom to top',
            'Tilt Down': 'Tilt down, camera pans vertically down from top to bottom',
            'Crane Up': 'Crane up, camera lifts high into the air revealing the scene',
            'Crane Down': 'Crane down, camera descends slowly to the subject',
            'Dutch Roll': 'Barrel roll, camera spins 360 degrees clockwise while moving forward',
            'Orbital Arc': 'Orbit 180, camera moves in a half-circle tracking around the subject',
            'Fast Orbit': 'Fast 360 orbit, camera spins rapidly 360 degrees around the subject',
            'Tracking Shot': 'Side tracking parallel, camera trucks alongside the subject matching speed',
            'Leading Shot': 'Leading shot, camera moves backward matching the forward speed of the subject',
            'Zoom In': 'Smooth optical zoom in, lens magnifies subject, camera stays stationary',
            'Drone FPV': 'FPV drone dive, aggressive diving motion down towards the subject',
            'Handheld': 'Handheld camera, shaky motion, natural movement, documentary style',
            'Static': 'Locked-off static camera, no movement'
        }[currentMovement] || 'Cinematic camera movement';

        // Calculate character position
        const posX = S.charX || 0.5;
        const positionDesc = posX < 0.4 ? 'left of frame' : posX > 0.6 ? 'right of frame' : 'centered';

        // DOF description
        const dofSetting = S.dof || 'f/2.8 Cinematic';
        let dofDesc = (dofSetting.includes('f/1.4') || dofSetting.includes('f/2.0') || dofSetting.includes('Shallow')) ? 'shallow depth of field' 
                    : dofSetting.includes('f/2.8') ? 'cinematic depth of field' 
                    : 'deep focus';

        // 2. THE VEO GOLDEN FORMULA: [Camera] -> [Subject] -> [Action] -> [Environment]
        
        let rackDesc = "";
        if (S.rackFocus > 0) rackDesc = "Cinematic rack focus pulling from the background into crisp foreground subject focus. ";
        else if (S.rackFocus < 0) rackDesc = "Cinematic rack focus pulling from subject into perfectly sharp background focus. ";
        
        let shutterPrompt = S.shutterSpeed === 'Fast' ? "Fast shutter speed, crisp motion, high action clarity. " 
                         : S.shutterSpeed === 'Slow' ? "Slow shutter speed, cinematic motion blur, dreamlike trails. " 
                         : "Standard 180-degree shutter. ";
                         
        let stockPrompt = S.filmStock === '16mm Film' ? "Shot on 16mm textured film, vintage grain, warm color grade. " 
                        : S.filmStock === 'VHS' ? "VHS tape quality, analog glitches, tracking errors, low fidelity. " 
                        : S.filmStock === 'CCTV' ? "CCTV security camera footage, green night vision tint, low resolution scanlines. " 
                        : "Modern clean digital sensor. ";

        let finalPrompt = `CAMERA: ${cameraDesc}, ${angleDesc}, ${dofDesc}. ${shutterPrompt}${stockPrompt}${rackDesc}`;
        
        finalPrompt += `SUBJECT: A person ${positionDesc}, wearing ${outfitDesc || 'standard clothing'}. `;
        
        finalPrompt += `ACTION: The person ${characterAction}. `;
        if (typeof actionTimeline !== 'undefined' && actionTimeline) finalPrompt += `(${actionTimeline}). `;
        
        finalPrompt += `ENVIRONMENT: ${basePrompt}. `;
        if (typeof foregroundDesc !== 'undefined' || typeof midgroundDesc !== 'undefined' || typeof backgroundDesc !== 'undefined') {
            if (typeof foregroundDesc !== 'undefined' && foregroundDesc) finalPrompt += `Foreground: ${foregroundDesc}. `;
            if (typeof midgroundDesc !== 'undefined' && midgroundDesc) finalPrompt += `Midground: ${midgroundDesc}. `;
            if (typeof backgroundDesc !== 'undefined' && backgroundDesc) finalPrompt += `Background: ${backgroundDesc}. `;
        }
        
        finalPrompt += `STYLE: Photorealistic, cinematic lighting, 35mm film grain, Hollywood production value.`;

        console.log("📤 Sending to Veo 3.1 Standard:");
        console.log("  Prompt:", finalPrompt);

        btn.innerHTML = '<span>⏳</span> GENERATING VIDEO...';
        showToast("🚀 Sending to Veo 3.1 Standard...");
        
        // 3. DISPATCH TO VEO 3.1 VIA VERTEX AI
        const requestBody = {
            prompt: finalPrompt,
            startFrameBase64: startDataUrl,
            duration: 5,
            aspectRatio: '16:9'
        };
        
        // 4. THE SMART BYPASS: Prevent Interpolation on 3D Moves
        const spatialMoves = ['Orbital Arc', 'Tracking Shot', 'Crane Up', 'Crane Down', 'Pan Left', 'Pan Right', 'Tilt Up', 'Tilt Down', 'Dutch Roll'];
        
        if (S.faceLock && S.faceCloseup) {
            if (spatialMoves.includes(currentMovement)) {
                console.log(`⚠️ Face Lock bypassed: ${currentMovement} requires the 3D physics engine.`);
                showToast(`Camera Priority: Face Lock disabled to allow ${currentMovement}`, 4000);
            } else {
                requestBody.endFrameBase64 = S.faceCloseup;
                console.log("🎯 Face Lock: Sending face close-up as end frame");
            }
        }
        
        const response = await fetch('/api/generate-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();
        console.log("📥 Veo response:", result);
        
        if (!result.success) {
            throw new Error(result.error || result.details || 'Video generation failed');
        }

        // If we got an operation name, start polling
        if (result.operationName) {
            console.log("📊 Starting polling for operation:", result.operationName);
            
            // Create progress bar overlay
            const progressOverlay = document.createElement('div');
            progressOverlay.id = 'renderProgress';
            progressOverlay.innerHTML = `
                <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                    <div style="color:#fff;font-size:14px;margin-bottom:12px;text-transform:uppercase;letter-spacing:2px;">Generating Video (Veo 3.1)</div>
                    <div style="width:300px;height:8px;background:#333;border-radius:4px;overflow:hidden;">
                        <div id="progressBar" style="width:0%;height:100%;background:linear-gradient(90deg,#4285f4,#34a853);transition:width 0.3s;"></div>
                    </div>
                    <div id="progressText" style="color:#aaa;font-size:12px;margin-top:8px;">Initializing...</div>
                    <div id="progressTime" style="color:#666;font-size:11px;margin-top:4px;">0:00 elapsed</div>
                </div>
            `;
            document.body.appendChild(progressOverlay);
            
            const progressBar = document.getElementById('progressBar');
            const progressText = document.getElementById('progressText');
            const progressTime = document.getElementById('progressTime');
            const startTime = Date.now();
            
            btn.innerHTML = '<span>⏳</span> RENDERING...';
            showToast("⏳ Generating video... (2-5 min)");
            
            // Polling loop
            let attempts = 0;
            const maxAttempts = 120; // 10 minutes max
            
            while (attempts < maxAttempts) {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const mins = Math.floor(elapsed / 60);
                const secs = elapsed % 60;
                progressTime.textContent = `${mins}:${secs.toString().padStart(2, '0')} elapsed`;
                
                await new Promise(r => setTimeout(r, 5000)); // Poll every 5 seconds
                attempts++;
                
                try {
                    const pollResponse = await fetch('/api/poll-video', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ operationName: result.operationName })
                    });
                    
                    // Debug: check response before parsing
                    const pollText = await pollResponse.text();
                    console.log(`📥 Poll ${attempts} raw:`, pollText.substring(0, 200));
                    
                    let pollResult;
                    try {
                        pollResult = JSON.parse(pollText);
                    } catch (parseErr) {
                        console.error(`❌ Poll ${attempts} JSON parse failed:`, parseErr.message);
                        continue; // Skip to next iteration
                    }
                    
                    console.log(`⏱️ Poll ${attempts}:`, pollResult.status, pollResult.progress || '', pollResult.error || '');
                    
                    if (pollResult.status === 'COMPLETED') {
                        progressBar.style.width = '100%';
                        progressText.textContent = 'Complete!';
                        
                        if (pollResult.videoUrl) {
                            console.log("🎉 Video URL:", pollResult.videoUrl);
                            document.getElementById('renderProgress')?.remove();
                            window.open(pollResult.videoUrl, '_blank');
                            showToast("✓ VIDEO READY!");
                            return;
                        } else if (pollResult.videoBase64) {
                            console.log("🎉 Got base64 video, downloading...");
                            const dataUrl = `data:video/mp4;base64,${pollResult.videoBase64}`;
                            const blobResponse = await fetch(dataUrl);
                            const blob = await blobResponse.blob();
                            
                            // Auto-download the video
                            const downloadLink = document.createElement('a');
                            downloadLink.href = URL.createObjectURL(blob);
                            downloadLink.download = `a-cam-veo-${Date.now()}.mp4`;
                            document.body.appendChild(downloadLink);
                            downloadLink.click();
                            document.body.removeChild(downloadLink);
                            
                            // Also show in a modal for preview
                            const blobUrl = URL.createObjectURL(blob);
                            document.getElementById('renderProgress')?.remove();
                            
                            // Create video preview modal
                            const previewModal = document.createElement('div');
                            previewModal.id = 'videoPreviewModal';
                            previewModal.innerHTML = `
                                <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;">
                                    <div style="color:#4f4;font-size:16px;margin-bottom:15px;text-transform:uppercase;letter-spacing:2px;">✓ Video Downloaded!</div>
                                    <video src="${blobUrl}" controls autoplay loop style="max-width:90%;max-height:70vh;border-radius:8px;box-shadow:0 4px 30px rgba(0,0,0,0.5);"></video>
                                    <div style="margin-top:15px;display:flex;gap:10px;">
                                        <button onclick="
                                            const a = document.createElement('a');
                                            a.href = '${blobUrl}';
                                            a.download = 'a-cam-veo-${Date.now()}.mp4';
                                            a.click();
                                        " style="background:#4f4;color:#000;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-weight:bold;">⬇ Download Again</button>
                                        <button onclick="document.getElementById('videoPreviewModal')?.remove();" style="background:#333;color:#fff;border:1px solid #555;padding:10px 20px;border-radius:4px;cursor:pointer;">Close</button>
                                    </div>
                                </div>
                            `;
                            document.body.appendChild(previewModal);
                            
                            showToast("✓ VIDEO DOWNLOADED!");
                            return;
                        } else {
                            throw new Error("Video completed but no URL returned");
                        }
                    } else if (pollResult.status === 'FAILED') {
                        throw new Error(pollResult.error || 'Video generation failed');
                    } else {
                        // Still in progress
                        const progress = pollResult.progress || Math.min(5 + attempts * 2, 90);
                        progressBar.style.width = `${progress}%`;
                        progressText.textContent = `Rendering... ${Math.round(progress)}%`;
                        btn.innerHTML = `<span>⏳</span> ${Math.round(progress)}%`;
                    }
                } catch (pollErr) {
                    console.log("Poll error:", pollErr.message);
                    if (pollErr.message.includes('failed')) throw pollErr;
                }
            }
            
            throw new Error("Timeout - video generation took too long");
        }
        
        // If we got immediate results
        if (result.videoUrl) {
            window.open(result.videoUrl, '_blank');
            showToast("✓ VIDEO READY!");
            return;
        }
        
        throw new Error("Unexpected response from video API");

    } catch (err) {
        console.error("❌ ERROR:", err);
        showToast("Error: " + err.message);
    } finally {
        document.getElementById('renderProgress')?.remove();
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

// Helper to clear any stored keys
function clearApiKeys() {
    localStorage.removeItem('FAL_KEY');
    showToast("API keys cleared");
}


// ═══════════════════════════════════════════════════════════════════════════
// POSE SETUP
// ═══════════════════════════════════════════════════════════════════════════
window.generateActionStandIn = async function() {
    console.log("▶ A-CAM: Button Signal Received!");
    
    const action = document.getElementById('subjectAction').value;
    const outfit = document.getElementById('subjectOutfit').value;
    const baseImage = S.characterImage;

    if (!baseImage) {
        showToast("Please upload a character image first!");
        return;
    }

    // 🔥 START: Show the progress bar (estimating 16 seconds for the AI bake)
    startAIProgress(16);
    showToast("Generating Action Pose...");

    try {
        // Build request with optional high-res face reference
        // IMPORTANT: Emphasize outfit to prevent Flux from hallucinating different clothes
        const requestBody = {
            prompt: `Full body shot of character ${action}. MUST BE WEARING EXACT OUTFIT: ${outfit}. The clothing must match exactly - do not change or modify the outfit. Solid white background, high contrast, professional photography`,
            reference_image_url: baseImage
        };
        
        // If we have a high-res face close-up, send it for better face identity
        if (S.faceCloseup) {
            requestBody.face_reference_url = S.faceCloseup;
            console.log("🎯 Using high-res face close-up for identity lock");
        } else {
            console.log("ℹ️ No face close-up - using character sheet for identity");
        }
        
        const response = await fetch("/api/generate-pose", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        // 🔥 Check if response is actually JSON to avoid "Unexpected token A" errors
        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Server returned non-JSON:", text);
            throw new Error("Server Timeout or Configuration Error");
        }

        const data = await response.json();
        
        // 🔥 FINISH: Complete the progress
        completeAIProgress();

        if (data.images && data.images[0]) {
            updateCharacterWithNewPose(data.images[0].url);
        }

    } catch (error) {
        // 🔥 ERROR: Hide the bar so the UI doesn't stay stuck
        completeAIProgress();
        console.error("❌ A-CAM Error:", error);
        showToast("Bake failed: " + error.message);
    }
};

// Helper to handle the returned image
function updateCharacterWithNewPose(imageUrl) {
    console.log("🎨 A-CAM: Updating Viewfinder with new AI Pose...");

    // 1. Update the Main Image in the UI
    const heroImg = document.getElementById('heroImage');
    if (heroImg) {
        heroImg.src = imageUrl;
    }

    // 2. IMPORTANT: Update the State so the 2.5D Engine sees the new pose
    // We create a new image object so the canvas can draw it
    const newImg = new Image();
    newImg.crossOrigin = "anonymous"; // Prevents security errors with AI URLs
    newImg.onload = function() {
        S.heroImage = newImg;
        
        // 3. Trigger a redraw of the Viewfinder
        renderStoryboard();
        renderFrames();
        
        showToast("Action Pose Integrated!");
    };
    newImg.src = imageUrl;
}

