// === THE NATIVE PRODUCTION ENGINE (NO SDK REQUIRED) ===

/**
 * THE RENDER EXPORT ENGINE
 * Packages prompt, camera math, and optics into the Fal.ai JSON payload
 */
async function renderToFal(engineName) {
    const model = MODELS[engineName];
    if (!model || !model.endpoint) {
        showToast("Error: Unknown Engine");
        return;
    }
    const modelEndpoint = model.endpoint;

    // 1. AUTHENTICATION
    let falKey = localStorage.getItem('FAL_KEY');
    if (!falKey) {
        falKey = prompt("Please enter your fal.ai API key:");
        if (!falKey) return;
        localStorage.setItem('FAL_KEY', falKey);
    }

    // 2. DATA GATHERING & ENCODING
    showToast(`🎬 Preparing Scene for ${engineName}...`);
    
    let startFrameUrl = null;
    if (S.heroImage) {
        // If it's a canvas, use toDataURL. If Image, create a temporary canvas
        if (S.heroImage instanceof HTMLCanvasElement) {
            startFrameUrl = S.heroImage.toDataURL('image/jpeg', 0.8);
        } else {
            const tmpC = document.createElement('canvas');
            tmpC.width = S.heroImage.width; tmpC.height = S.heroImage.height;
            tmpC.getContext('2d').drawImage(S.heroImage, 0, 0);
            startFrameUrl = tmpC.toDataURL('image/jpeg', 0.8);
        }
    }

    const basePrompt = document.getElementById('promptBox')?.textContent || "Cinematic video";
    const shutter = S.shutterSpeed || 'Standard';
    const stock = S.filmStock || 'Clean Digital';
    const finalPrompt = `${basePrompt}. Shot with ${shutter} shutter, textured with ${stock}. Photorealistic, high fidelity.`;
    const cameraMath = getCameraMath(S.movement, S.movementIntensity);

    // 3. UI LOADING OVERLAY
    showRenderProgress(engineName);

    try {
        // 4. PACKAGE JSON PAYLOAD
        const payload = {
            prompt: finalPrompt,
            camera_math: cameraMath,
            image_url: startFrameUrl,
            aspect_ratio: S.aspectRatio || '16:9',
            motion_bucket: 127
        };

        if (engineName === 'Veo') payload.duration = "5s";

        console.log(`📤 [${engineName}] Sending Payload...`);

        // 5. EXECUTE INITIAL REQUEST
        const response = await fetch(`https://fal.run/${modelEndpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${falKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "API Request Failed");
        }

        const initialResult = await response.json();
        console.log("📥 Initial Response:", initialResult);

        // 6. POLLING FOR COMPLETION
        if (initialResult.request_id) {
            await pollFalStatus(engineName, initialResult.request_id, falKey);
        } else if (initialResult.video && initialResult.video.url) {
            handleRenderSuccess(initialResult.video.url);
        }

    } catch (err) {
        console.error("❌ Render Error:", err);
        showToast("Error: " + err.message);
        hideRenderProgress();
        if (err.message.includes("Unauthorized")) localStorage.removeItem('FAL_KEY');
    }
}

/**
 * High-fidelity Polling & Progress Updates
 */
async function pollFalStatus(engineName, requestId, falKey) {
    const startTime = Date.now();
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes

    while (attempts < maxAttempts) {
        attempts++;
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        updateRenderProgressUI(engineName, elapsed, attempts);

        try {
            const pollResponse = await fetch(`https://fal.run/requests/${requestId}/status`, {
                headers: { 'Authorization': `Key ${falKey}` }
            });
            const statusData = await pollResponse.json();
            
            console.log(`⏱️ Poll ${attempts}:`, statusData.status);

            if (statusData.status === 'COMPLETED') {
                const resultResponse = await fetch(`https://fal.run/requests/${requestId}`, {
                    headers: { 'Authorization': `Key ${falKey}` }
                });
                const finalData = await resultResponse.json();
                if (finalData.video && finalData.video.url) {
                    handleRenderSuccess(finalData.video.url);
                    return;
                }
            } else if (statusData.status === 'FAILED') {
                throw new Error("Generation failed on Fal server");
            }
        } catch (e) {
            console.warn("Polling glitch:", e);
        }

        await new Promise(r => setTimeout(r, 4000)); // Poll every 4 seconds
    }
    throw new Error("Render timed out (10 min)");
}

function showRenderProgress(engineName) {
    const overlay = document.createElement('div');
    overlay.id = 'renderProgressOverlay';
    overlay.innerHTML = `
        <div class="render-progress-box">
            <div class="render-progress-title">CINEMATIC BAKE: ${engineName.toUpperCase()}</div>
            <div class="render-progress-track">
                <div id="renderProgressBar" class="render-progress-fill"></div>
            </div>
            <div id="renderProgressStatus" class="render-progress-status">INITIALIZING...</div>
            <div id="renderProgressTime" class="render-progress-time">0:00 ELAPSED</div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function updateRenderProgressUI(engineName, elapsed, attempts) {
    const bar = document.getElementById('renderProgressBar');
    const status = document.getElementById('renderProgressStatus');
    const time = document.getElementById('renderProgressTime');
    
    // Average render times (Kling: 60s, Runway: 50s, Veo: 40s)
    const expectedTimes = { 'Kling': 66, 'Runway': 54, 'Veo': 42 };
    const maxTime = expectedTimes[engineName] || 60;
    
    const progress = Math.min((elapsed / maxTime) * 100, 98);
    const eta = Math.max(maxTime - elapsed, 1);
    
    if (bar) bar.style.width = `${progress}%`;
    if (status) status.textContent = `BAKING CINEMATOGRAPHY... ${Math.round(progress)}%`;
    
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const etaMins = Math.floor(eta / 60);
    const etaSecs = eta % 60;

    if (time) {
        time.innerHTML = `
            <div style="color: #666; margin-bottom: 2px;">${mins}:${secs.toString().padStart(2, '0')} ELAPSED</div>
            <div style="color: var(--accent); font-weight: 900; letter-spacing: 1px;">ETA: ~${etaSecs}s REMAINING</div>
        `;
    }
}

function handleRenderSuccess(videoUrl) {
    hideRenderProgress();
    showToast("✓ RENDER COMPLETE!");
    
    const overlay = document.getElementById('productionResultOverlay');
    const video = document.getElementById('resultVideo');
    const download = document.getElementById('downloadBtn');
    
    if (overlay && video && download) {
        video.src = videoUrl;
        download.href = videoUrl;
        download.setAttribute('target', '_blank');
        download.setAttribute('rel', 'noopener noreferrer');
        overlay.classList.add('active');
    } else {
        // Fallback
        const win = window.open(videoUrl, '_blank');
        if (win) win.focus();
    }
}

window.closeResultOverlay = function() {
    const overlay = document.getElementById('productionResultOverlay');
    const video = document.getElementById('resultVideo');
    if (overlay) overlay.classList.remove('active');
    if (video) {
        video.pause();
        video.src = "";
    }
};

function hideRenderProgress() {
    document.getElementById('renderProgressOverlay')?.remove();
}

/**
 * Maps Director's Moves to numeric camera math
 */
function getCameraMath(movement, intensity) {
    const val = (intensity - 50) / 50; // Map 0-100 to -1.0 to 1.0
    const math = { pan: 0, tilt: 0, zoom: 0, roll: 0 };

    switch(movement) {
        case 'Pan Left/Right': math.pan = val; break;
        case 'Tilt Up/Down': math.tilt = val; break;
        case 'Zoom In': math.zoom = Math.abs(val); break;
        case 'Dolly Push In': math.zoom = Math.abs(val); break;
        case 'Dolly Pull Out': math.zoom = -Math.abs(val); break;
        case 'Dutch Roll': math.roll = val; break;
    }
    return math;
}

async function pushToProduction() {
    // Delegate to the currently selected model
    if (S.targetModel) {
        renderToFal(S.targetModel);
    } else {
        showToast("Please select a render engine first (Kling, Runway, or Veo)");
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

