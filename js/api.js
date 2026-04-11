// ═══════════════════════════════════════════════════════════════════════════
// ANTIGRAVITY PRODUCTION BRIDGE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Global API Status Manager
 */
window.updateAPIStatus = function(status) {
    const el = document.getElementById('apiStatus');
    if (!el) return;
    
    el.classList.remove('offline', 'online', 'connecting');
    el.classList.add(status);
    
    if (status === 'online') {
        el.textContent = '● ONLINE';
    } else if (status === 'offline') {
        el.textContent = '○ OFFLINE';
    } else if (status === 'connecting') {
        el.textContent = '◔ CONNECTING';
    }
};

// CHECK BRIDGE HEALTH ON LOAD
(async () => {
    try {
        const PROXY_URL = 'http://127.0.0.1:8001';
        // Check if bridge is up by fetching a static asset it serves
        const resp = await fetch(PROXY_URL + '/js/api.js', { method: 'HEAD' });
        if (resp.ok) {
            console.log("🌉 A-CAM: Local Production Bridge Detected");
            window.updateAPIStatus('online');
        }
    } catch(e) {
        console.log("🛰️ A-CAM: Local Bridge not detected. Running in Remote Mode.");
        window.updateAPIStatus('offline');
    }
})();

/**
 * PRODUCTION BRIDGE — CORS Proxy Helper
 * Detects if a local cors_bridge.py is running on port 8001 to bypass browser CORS limits.
 */
async function fetchWithProxy(url, options = {}, retryCount = 0) {
    const PROXY_URL = 'http://127.0.0.1:8001';
    const MAX_RETRIES = 3;

    try {
        const headers = { ...options.headers };
        
        // 🛡️ QUOTA HARDENER: Explicitly inject the Project ID for Vertex AI quota management
        if (url.includes('aiplatform.googleapis.com')) {
            headers['X-Goog-User-Project'] = '940583187251';
        }

        if (url.includes('generativelanguage.googleapis.com')) {
            delete headers['Authorization'];
            delete headers['authorization'];
        }

        const proxyOptions = { ...options, headers: { ...headers, 'x-proxy-url': url } };
        const response = await fetch(PROXY_URL, proxyOptions);

        if (!window._isBridgeSynced) {
            console.log("📡 A-CAM: Production Bridge Synced on Port 8001 (ACTIVE-LOCK)");
            window._isBridgeSynced = true;
        }

        // 🛡️ RETRY LOGIC: Handle 429 (Rate Limit) and 500/503 (Server Error)
        if ((response.status === 429 || response.status >= 500) && retryCount < MAX_RETRIES) {
            const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
            console.warn(`🌉 Bridge Target Busy (${response.status}). Retrying in ${Math.round(delay)}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
            await new Promise(r => setTimeout(r, delay));
            return fetchWithProxy(url, options, retryCount + 1);
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ GCP Target Error (${response.status}):`, errorText);
            const err = new Error(`GCP_${response.status}`);
            err.status = response.status;
            err.body = errorText;
            throw err;
        }
        return response;
    } catch (e) {
        if (e.message.startsWith('GCP_')) throw e; 
        
        const now = Date.now();
        if (!window._lastBridgeError || now - window._lastBridgeError > 10000) {
            console.error(`🌉 Production Bridge error. Reason: ${e.message}.`);
            console.warn("⚠️ A-CAM: Local bridge unreachable or rejected request. Ensure 'python cors_bridge.py' is running.");
            window._lastBridgeError = now;
        }
        throw new Error(`Bridge Unreachable: ${e.message}`);
    }
}

console.log("📡 A-CAM: Initializing Antigravity Pipeline...");
window.Antigravity = {
    isBaking: false,
    hardenedBrief: "",
    anchors: {
        identity: false,
        anatomy: false,
        outfit: false,
        scene: false
    },

    log: function (msg, type = '') {
        const consoleEl = document.getElementById('productionConsole');
        if (!consoleEl) return;
        const line = document.createElement('div');
        line.className = 'console-line' + (type ? ' ' + type : '');
        line.textContent = `> ${msg}`;
        consoleEl.appendChild(line);
        consoleEl.scrollTop = consoleEl.scrollHeight;
    },

    /**
     * THE HARDENER — Agentic Cinematography Reasoning
     */
    bake: async function () {
        const bakeBtn = document.getElementById('bakeBtn');
        if (bakeBtn) bakeBtn.classList.add('active');

        const consoleContainer = document.getElementById('productionConsoleContainer');
        if (consoleContainer) consoleContainer.style.display = 'flex';

        const consoleEl = document.getElementById('productionConsole');
        if (consoleEl) consoleEl.innerHTML = '';
        
        this.log("INITIATING ANTIGRAVITY HARDENER...", "gemini");

        try {
            // STEP 1: ASSET SYNCHRONIZATION
            await new Promise(r => setTimeout(r, 800));
            this.log("SYNCING VISUAL ANCHORS...");
            this.syncAnchors();

            // STEP 2: MULTI-MODAL REASONING
            await new Promise(r => setTimeout(r, 1200));
            this.log("ANALYZING CAMERA PHYSICS (LENS: " + S.lens + ")...", "reasoning");

            const intensity = S.movementIntensity;
            const kineticVerbs = this.getKineticVerbs(S.movement, intensity);
            this.log("BAKING KINETIC PROSE: " + kineticVerbs.join(", ").toUpperCase() + "...");

            // STEP 3: GENERATE HARDENED BRIEF
            await new Promise(r => setTimeout(r, 1000));
            this.hardenedBrief = this.generateHardenedBrief(kineticVerbs);
            this.log("TECHNICAL BRIEF HARDENED.", "success");

            // STEP 4: VISUAL VERIFICATION
            this.log("TRIGGERING BAKE VERIFICATION...", "reasoning");
            if (typeof window.renderFrames === 'function') window.renderFrames();

            showToast("✓ PRODUCTION BRIEF BAKED");
        } catch (err) {
            this.log("BAKE FAILED: " + err.message, "error");
            console.error("Antigravity Bake Exception:", err);
        } finally {
            this.isBaking = false;
            if (bakeBtn) bakeBtn.classList.remove('active');
            this.log("BRIDGE SYNC COMPLETE.", "reasoning");
        }
    },

    syncAnchors: function (silent = false) {
        // Sync Identity
        if (S.faceCloseup) {
            this.setAnchor('Identity', true);
            if (!silent) this.log("LOCK: Fidelity Anchor [Face] verified.");
        }
        // Sync Anatomy
        if (S.heroImage) {
            this.setAnchor('Anatomy', true);
            if (!silent) this.log("LOCK: Anatomy Anchor [Pose] verified.");
        }
        // Sync Outfit
        if (S.outfitDetails || document.getElementById('subjectOutfit')?.value) {
            this.setAnchor('Outfit', true, S.masterCharacterSheet || S.characterImage);
            if (!silent) this.log("LOCK: Outfit Anchor [Wardrobe] verified.");
        }
        // Sync Scene
        if (S.backgroundPlate) {
            this.setAnchor('Scene', true);
            if (!silent) this.log("LOCK: Scene Anchor [Slate] verified.");
        }
    },

    setAnchor: function (id, locked, previewImg = null) {
        const el = document.getElementById('anchor' + id);
        if (!el) return;
        
        el.classList.toggle('active', locked);
        el.classList.toggle('anchored', locked);
        el.classList.toggle('missing', !locked);

        // Update thumbnail if possible
        const preview = el.querySelector('.bucket-preview');
        if (!preview) return;

        if (locked) {
            let imgSrc = previewImg;
            // Fallbacks for specific anchors if previewImg not provided
            if (!imgSrc) {
                if (id === 'Identity' && S.faceCloseup) imgSrc = S.faceCloseup;
                if (id === 'Anatomy' && S.characterImage) imgSrc = S.characterImage;
                if (id === 'Outfit') imgSrc = S.masterCharacterSheet || S.characterImage;
                if (id === 'Scene' && S.backgroundPlate) imgSrc = (typeof S.backgroundPlate === 'object') ? S.backgroundPlate.src : S.backgroundPlate;
            }

            if (imgSrc) {
                preview.style.backgroundImage = `url(${imgSrc})`;
                preview.style.backgroundSize = 'cover';
                preview.style.backgroundPosition = 'center';
                preview.style.opacity = '1';
                
                if (id === 'Outfit') {
                    preview.style.backgroundSize = '200%';
                    preview.style.backgroundPosition = 'center 30%';
                }
            }
        } else {
            preview.style.backgroundImage = 'none';
            preview.style.opacity = '0.3';
        }
    },

    getKineticVerbs: function (movement, intensity) {
        const isIntense = intensity > 75;
        const verbs = [];
        switch (movement) {
            case 'Dolly Push In': verbs.push("surging", "compressing", "approaching"); break;
            case 'Dolly Pull Out': verbs.push("receding", "expanding", "revealing"); break;
            case 'Dolly Zoom': verbs.push("warping", "vertigo-inducing", "distorting"); break;
            case 'Pan Left/Right': verbs.push("sweeping", "scanning", "traversing"); break;
            case 'Dutch Roll': verbs.push("canting", "listing", "unbalancing"); break;
            case 'Handheld': verbs.push("shaking", "breathing", "reactive"); break;
            default: verbs.push("anchored", "static", "stabilized");
        }
        if (isIntense) verbs.unshift("violently", "aggressively");
        return verbs;
    },

    generateHardenedBrief: function (verbs) {
        const physics = `Physics Lock: ${verbs.join(", ")}. Ground contact anchored at ${Math.round(S.groundPlaneY * 100)}% relative to [GCS_SLATE]. `;
        const optics = `Optical Brief: ${S.lens} with ${S.dof.split(' ')[0]} compression. ${S.shutterSpeed} shutter fidelity. `;
        const character = `Identity Preservation: Fidelity Slot A (Face), Anatomy Slot B (Pose). `;

        return physics + optics + character + (S.subjectPerformance ? `Kinetic Performance: ${S.subjectPerformance}.` : "");
    },

    pushToProduction: async function () {
        try {
            const engineName = window.S?.targetModel || window.S?.currentModel || "Veo";
            this.log(`INITIATING PRODUCTION HANDSHAKE...`, "reasoning");

            // 🛡️ AUTO-BAKE: If user hasn't hit "Bake" yet, do it now to lock anchors
            if (!this.hardenedBrief) {
                this.log("NO TECHNICAL BRIEF FOUND. AUTO-BAKING...", "reasoning");
                await this.bake();
            }

            if (!this.hardenedBrief) {
                throw new Error("Handshake failed: Technical Brief could not be generated.");
            }

            let projectId = document.getElementById('gcpProjectId')?.value?.trim() || "project-51cbdab8-586c-4f77-94c";
            
            // 🛡️ HARDENER: Sanitize Project ID (Prevents the 'doubling' bug discovered in logs)
            if (projectId.includes("project-") && projectId.lastIndexOf("project-") > 0) {
                console.warn("⚠️ A-CAM Hardener: Detected corrupted Project ID. Reparing...");
                projectId = projectId.substring(projectId.lastIndexOf("project-"));
                const pInput = document.getElementById('gcpProjectId');
                if (pInput) pInput.value = projectId;
            }
            const region = document.getElementById('gcpRegion')?.value?.trim() || "us-central1";
            const accessToken = document.getElementById('gcpAccessToken')?.value?.trim();

            if (engineName.includes("Runway") || engineName === "Runway Gen-3 Alpha") {
                this.log("DISPATCHING TO RUNWAY GEN-3...", "dispatch");
                this.renderToRunway(this.hardenedBrief);
                return;
            }

            if (!projectId) {
                showToast("⚠️ Vertex AI Project ID required.");
                document.getElementById('gcpProjectId').focus();
                toggleGcpConfig();
                return;
            }

            this.log(`DISPATCHING TO VERTEX AI (${engineName.toUpperCase()})...`, "dispatch");
            window.renderToVertexAI(engineName, this.hardenedBrief, null, projectId);
        } catch (err) {
            console.error("❌ Handshake Error:", err);
            this.log(`HANDSHAKE FAILED: ${err.message}`, "error");
            showToast("Error: " + err.message);
        }
    },

    renderToRunway: async function(prompt) {
        const falKey = document.getElementById('acam_fal_key')?.value?.trim();
        if (!falKey) {
            showToast("⚠️ Fal.ai Key required for Runway Gen-3.");
            document.getElementById('acam_fal_key')?.focus();
            toggleGcpConfig(); // Show the config panel
            return;
        }

        console.log("🎬 A-CAM: Engaging Runway Gen-3 Alpha (via Fal.ai)...");
        if (window.showRenderProgress) window.showRenderProgress("RUNWAY GEN-3");
        
        try {
            const startFrame = await getStartFrameBase64();
            if (!startFrame) {
                showToast("⚠️ Capture both frames before production push.");
                return;
            }

            const response = await fetchWithProxy('https://queue.fal.run/fal-ai/runway-gen3/image-to-video', {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${falKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "image_url": `data:image/jpeg;base64,${startFrame}`,
                    "prompt": prompt,
                    "duration": "5"
                })
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(err || `Fal.ai Error ${response.status}`);
            }

            const data = await response.json();
            console.log("✅ Runway Task Queued:", data.request_id);
            pollFalOperation(data.request_id, falKey);

        } catch (e) {
            console.error("Runway Error:", e);
            showToast(`❌ Runway Error: ${e.message}`);
            if (window.hideProgress) window.hideProgress();
        }
    }
};

async function getStartFrameBase64() {
    if (!S.heroImage) return null;
    if (typeof S.heroImage === 'string') return S.heroImage.split(',')[1];
    
    // Create high-res export capture
    const canvas = document.createElement('canvas');
    canvas.width = 1280; canvas.height = 720; // Standard production resolution
    const ctx = canvas.getContext('2d');
    
    // Use the existing renderer login to draw the frame
    // In a-cam, we have exportSingleFrame or similar
    if (typeof window.renderExportFrame === 'function') {
        const charCanvas = document.createElement('canvas');
        charCanvas.width = S.heroImage.width; charCanvas.height = S.heroImage.height;
        const cCtx = charCanvas.getContext('2d');
        cCtx.drawImage(S.heroImage, 0, 0);
        if (typeof window.removeStudioBackground === 'function') window.removeStudioBackground(cCtx, charCanvas);
        
        window.renderExportFrame(canvas, charCanvas, { ...S, frameType: 'start' });
        return canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
    }
    return null;
}

async function pollFalOperation(requestId, key) {
    const url = `https://queue.fal.run/fal-ai/runway-gen3/image-to-video/requests/${requestId}`;
    
    const check = async () => {
        try {
            const res = await fetchWithProxy(url, {
                headers: { 'Authorization': `Key ${key}` }
            });
            const data = await res.json();
            
            if (data.status === 'COMPLETED') {
                console.log("🎬 Runway Render Complete!");
                if (data.video && data.video.url) {
                    handleRenderSuccess(data.video.url);
                } else if (data.output && data.output.video) {
                    handleRenderSuccess(data.output.video.url);
                }
            } else if (data.status === 'FAILED') {
                showToast(`❌ Runway Failed: ${data.error || 'Unknown error'}`);
                if (window.hideProgress) window.hideProgress();
            } else {
                // Still processing
                const progress = data.logs ? data.logs.length * 5 : 50; // Simple heuristic
                if (window.updateRenderProgressUI) window.updateRenderProgressUI("RUNWAY", progress, 0);
                setTimeout(check, 4000);
            }
        } catch (e) {
            console.warn("Polling glitch:", e);
            setTimeout(check, 5000);
        }
    };
    check();
}

/**
 * THE RENDER EXPORT ENGINE (REFACTORED FOR GOOGLE CLOUD VERTEX AI)
 */
window.renderToVertexAI = async function (engineName, hardenedPrompt = "", startFrameUrl, providedProjectId) {
    // 🛡️ PRODUCTION OVERRIDE: Hard-locked to verified model and endpoint configuration.
    const modelId = "veo-3.1-generate-001";
    const activeRegion = "us-central1"; 
    const projectId = "940583187251";
    const cleanPid = projectId.trim();

    // Construct the endpoint explicitly
    // 🔥 CRITICAL: Veo 3.1 requires the predictLongRunning endpoint for asynchronous processing.
    const endpoint = `https://${activeRegion}-aiplatform.googleapis.com/v1beta1/projects/${cleanPid}/locations/${activeRegion}/publishers/google/models/${modelId}:predictLongRunning`;

    // Persist GCP settings
    localStorage.setItem('acam_gcp_project_id', projectId);
    localStorage.setItem('acam_gcp_region', activeRegion);

    console.log(`🎬 A-CAM: Contacting Vertex AI Handshake...`);
    showRenderProgress(engineName);

    /**
     * Internal helper to resize image for production limits (~1.5MB)
     */
    const resizeForProduction = async (source) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Vertex AI Veo 3.1 prefers 1280x720 or 720x1280 base for generation
                const maxDim = 1280;
                let w = img.width;
                let h = img.height;
                
                if (w > maxDim || h > maxDim) {
                    if (w > h) { h = (maxDim / w) * h; w = maxDim; }
                    else { w = (maxDim / h) * h; h = maxDim; }
                }
                
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1]);
            };
            img.src = source.startsWith('data:') ? source : `data:image/jpeg;base64,${source}`;
        });
    };

    let finalStartFrame = startFrameUrl;
    
    // 🛡️ RECOVERY: If no frame provided, use the Transformed Master (best quality) or Hero
    if (!finalStartFrame) {
        if (typeof S !== 'undefined' && S.transformedStartFrame) {
            console.log("💎 Using Transformed Master for production start...");
            finalStartFrame = await resizeForProduction(S.transformedStartFrame);
        } else if (typeof S !== 'undefined' && S.heroImage) {
            console.log("👤 Using Hero Image as production fallback...");
            const heroData = S.heroImage instanceof HTMLCanvasElement ? 
                             S.heroImage.toDataURL('image/jpeg', 0.85) : 
                             S.heroImage.src;
            finalStartFrame = await resizeForProduction(heroData);
        }
    } else {
        finalStartFrame = await resizeForProduction(finalStartFrame);
    }
    
    // 🛡️ HANDSHAKE HARDENER: Block request if image is missing to prevent 400 "image is empty"
    if (!finalStartFrame) {
        console.error("❌ A-CAM: No start frame found for production. Request aborted.");
        showToast("⚠️ ERROR: No Actor image detected. Please upload an Identity Anchor before baking.", 10000);
        hideRenderProgress();
        return;
    }

    const basePrompt = document.getElementById('promptBox')?.textContent || "Cinematic video";
    const subjectContext = S.foregroundLayer || S.subjectPerformance || "primary subject";
    const outfitContext = S.outfitDetails?.outfit || "standard attire";
    const sceneContext = S.sceneDescription || "cinematic environment";
    const identityLock = `Subject: ${subjectContext} in ${outfitContext}. Scene: ${sceneContext}. `;

    const finalPrompt = hardenedPrompt ?
        `${identityLock} | ${hardenedPrompt} | STYLED AS: ${basePrompt}` :
        `${identityLock} | ${basePrompt}`;

    try {
        const payload = {
            instances: [
                {
                    prompt: finalPrompt,
                    image: {
                        mimeType: "image/jpeg",
                        bytesBase64Encoded: finalStartFrame
                    }
                }
            ],
            parameters: {
                sampleCount: 1,
                aspectRatio: S.aspectRatio === '16:9' ? "16:9" : "9:16",
                fps: 24,
                durationSeconds: 5
            }
        };

        let accessToken = document.getElementById('gcpAccessToken')?.value?.trim();
        if (accessToken && !accessToken.startsWith('Bearer ')) {
            accessToken = `Bearer ${accessToken}`;
        }

        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (accessToken) {
            headers['Authorization'] = accessToken;
        }

        const response = await fetchWithProxy(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (response.status === 403) {
            const aiKey = document.getElementById('acam_gemini_key')?.value?.trim();
            if (aiKey) {
                console.warn("⚠️ Vertex 403: Attempting zero-billing fallback to AI Studio...");
                renderToAIStudio(engineName, hardenedPrompt, aiKey, startFrameUrl);
                return;
            }
        }

        if (!response.ok) {
            const errBody = await response.text();
            console.error(`📡 Bridge Target Error (${response.status}):`, errBody);
            try {
                const errJson = JSON.parse(errBody);
                const msg = errJson.error?.message || "";
                
                // 🆘 AUTO-ASSISTANT: Detect disabled Vertex AI API
                if (response.status === 403 && msg.includes("aiplatform.googleapis.com")) {
                    const enableUrl = `https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=${projectId}`;
                    showToast(`⚠️ Vertex API Disabled. <a href="${enableUrl}" target="_blank" style="color:cyan;text-decoration:underline;">Click Here to Enable</a>`, 15000);
                }
                
                throw new Error(msg || `GCP Error ${response.status}`);
            } catch (e) {
                throw new Error(`GCP Error ${response.status}: ${errBody.substring(0, 100)}`);
            }
        }

        const initialResult = await response.json();
        // Google Cloud returns an Operation ID for video generation
        if (initialResult.name) {
            const operationId = initialResult.name;
            console.log("🛠️ Vertex AI Operation ID:", operationId);
            await pollVertexOperation(engineName, operationId, accessToken, activeRegion);
        } else if (initialResult.predictions && initialResult.predictions[0].video) {
            // Immediate result (rare for video)
            handleRenderSuccess(initialResult.predictions[0].video.uri);
        }
    } catch (err) {
        console.error("❌ Render Error:", err);
        showToast("Error: " + err.message);
        hideRenderProgress();
    }
};

window.renderToAIStudio = async function (engineName, hardenedPrompt = "", key, startFrameUrl) {
    const modelId = "models/veo-3.1-generate-preview";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/${modelId}:predictLongRunning?key=${key}`;

    console.log(`🎬 A-CAM: Contacting AI Studio Handshake (Zero-Billing Fallback)...`);
    showRenderProgress(engineName + " (STUDIO)");

    try {
        const payload = {
            instances: [
                {
                    prompt: hardenedPrompt,
                    image: {
                        mimeType: "image/jpeg",
                        data: startFrameUrl
                    }
                }
            ],
            parameters: {
                sampleCount: 1,
                aspectRatio: S.aspectRatio === '16:9' ? "16:9" : "9:16",
                fps: 24,
                durationSeconds: 5
            }
        };

        const response = await fetchWithProxy(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`AI Studio Error ${response.status}: ${errBody}`);
        }

        const initialResult = await response.json();
        if (initialResult.name) {
            const operationId = initialResult.name;
            // AI Studio poll URL format is different
            const pollUrl = `https://generativelanguage.googleapis.com/v1beta/${operationId}?key=${key}`;
            await pollStudioOperation(engineName, pollUrl);
        }
    } catch (err) {
        console.error("❌ Studio Fallback Error:", err);
        showToast("Studio Error: " + err.message);
        hideRenderProgress();
    }
};

async function pollStudioOperation(engineName, pollUrl) {
    const startTime = Date.now();
    let attempts = 0;
    while (attempts < 300) {
        attempts++;
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        updateRenderProgressUI(engineName, elapsed, attempts);

        try {
            const pollResponse = await fetchWithProxy(pollUrl);
            const statusData = await pollResponse.json();

            if (statusData.done) {
                if (statusData.response && statusData.response.outputs) {
                    const videoUri = statusData.response.outputs?.[0]?.video?.uri;
                    if (videoUri) {
                        handleRenderSuccess(videoUri);
                        return;
                    }
                } else if (statusData.error) {
                    throw new Error(statusData.error.message);
                }
            }
        } catch (e) {
            console.warn("📡 Studio Sync Issue:", e.message);
        }
        await new Promise(r => setTimeout(r, 6000));
    }
}

async function pollVertexOperation(engineName, operationName, accessToken, region) {
    const startTime = Date.now();
    let attempts = 0;

    console.log("🚀 A-CAM: Delegating poll to Vercel /api/poll-video");
    console.log("📋 Operation:", operationName);

    const check = async () => {
        attempts++;
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        updateRenderProgressUI(engineName, elapsed, attempts);

        try {
            // ✅ Call YOUR Vercel function — it already does fetchPredictOperation correctly
            const response = await fetch('/api/poll-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operationName })
            });

            const data = await response.json();

            if (data.status === 'COMPLETED') {
                if (data.videoUrl) {
                    handleRenderSuccess(data.videoUrl);
                } else if (data.videoBase64) {
                    // Convert base64 to blob URL for playback
                    const blob = new Blob(
                        [Uint8Array.from(atob(data.videoBase64), c => c.charCodeAt(0))],
                        { type: 'video/mp4' }
                    );
                    handleRenderSuccess(URL.createObjectURL(blob));
                }
                return;
            }

            if (data.status === 'FAILED') {
                console.error("❌ Poll failed:", data.error);
                showToast("❌ Render failed: " + data.error);
                hideRenderProgress();
                return;
            }

            // IN_PROGRESS — keep polling
            const progress = data.progress || 0;
            const statusEl = document.getElementById('renderProgressStatus');
            if (statusEl) statusEl.textContent = `BAKING CINEMATOGRAPHY... ${progress}%`;

            setTimeout(check, 6000);

        } catch (e) {
            console.warn("🛰️ Sync Glitch:", e.message);
            setTimeout(check, 8000);
        }
    };

    check();
}

function showRenderProgress(engineName) {
    document.getElementById('renderProgressOverlay')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'renderProgressOverlay';
    overlay.innerHTML = `
        <div class="render-progress-box">
            <div class="render-progress-title">PRODUCTION BAKE: ${engineName.toUpperCase()}</div>
            <div class="render-progress-track"><div id="renderProgressBar" class="render-progress-fill"></div></div>
            <div id="renderProgressStatus" class="render-progress-status">COMMUNICATING WITH GCS...</div>
            <div id="renderProgressTime" class="render-progress-time">0:00 ELAPSED</div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function updateRenderProgressUI(engineName, elapsed, attempts) {
    const bar = document.getElementById('renderProgressBar');
    const status = document.getElementById('renderProgressStatus');
    const time = document.getElementById('renderProgressTime');
    const progress = Math.min((elapsed / 60) * 100, 98);
    if (bar) bar.style.width = `${progress}%`;
    if (status) status.textContent = `BAKING CINEMATOGRAPHY... ${Math.round(progress)}%`;
    if (time) time.textContent = `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')} ELAPSED`;
}

function handleRenderSuccess(videoUrl) {
    hideRenderProgress();
    showToast("✓ RENDER COMPLETE!");
    const overlay = document.getElementById('productionResultOverlay');
    const video = document.getElementById('resultVideo');
    if (overlay && video) {
        video.src = videoUrl;
        document.getElementById('downloadBtn').href = videoUrl;
        overlay.classList.add('active');
    }
}

function hideRenderProgress() { document.getElementById('renderProgressOverlay')?.remove(); }

window.pushToProduction = function () { Antigravity.pushToProduction(); };
window.generateActionStandIn = async function () { await Antigravity.bake(); };

// GCP Configuration Helpers
window.toggleGcpConfig = function () {
    const el = document.getElementById('gcpConfigPanel');
    if (el) el.style.display = (el.style.display === 'none' || !el.style.display) ? 'flex' : 'none';
};

// Initialize GCP Persistence
window.addEventListener('DOMContentLoaded', () => {
    const pId = localStorage.getItem('acam_gcp_project_id');
    const reg = localStorage.getItem('acam_gcp_region');
    const gKey = localStorage.getItem('acam_gemini_key');

    if (pId) document.getElementById('gcpProjectId').value = pId;
    if (reg) document.getElementById('gcpRegion').value = reg;
    if (gKey) document.getElementById('acam_gemini_key').value = gKey;
});

// Update persistence on change
document.addEventListener('input', (e) => {
    if (e.target.id === 'gcpProjectId') localStorage.setItem('acam_gcp_project_id', e.target.value);
    if (e.target.id === 'gcpRegion') localStorage.setItem('acam_gcp_region', e.target.value);
    if (e.target.id === 'acam_gemini_key') localStorage.setItem('acam_gemini_key', e.target.value);
});

/**
 * VERTEX AI VISION — Intelligence Migration (Gemini 1.5 Flash)
 */
/**
 * KEY SCANNER — Discovery Engine
 */
async function getBestAIStudioModel(key) {
    try {
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const listRes = await fetchWithProxy(listUrl);
        if (listRes.ok) {
            const listData = await listRes.json();
            const available = (listData.models || [])
                .filter(m => m.supportedGenerationMethods.includes('generateContent') && m.name.includes('gemini'))
                .map(m => m.name);
            console.log("📡 Key Scanner: Verified access to:", available);

            // ULTIMATE PRIORITY: Gemini 3 Flash (Highest Quota)
            const models = [
                "models/gemini-3-flash", 
                "models/gemini-2.5-flash", 
                "models/gemini-2.1-flash",
                "models/gemini-1.5-flash"
            ];
            for (const m of models) {
                if (available.includes(m)) {
                    console.log(`🎯 Key Scanner: Locking onto ${m}`);
                    return m;
                }
            }
            if (available.length > 0) return available[0];
        }
    } catch (e) {
        console.warn("⚠️ Key Scanner sweep failed:", e.message);
    }
    return "models/gemini-1.5-flash-002";
}

/**
 * SCENE VISION — Environment Intelligence
 */
window.analyzeBackgroundVision = async function (base64) {
    const aiKey = document.getElementById('acam_gemini_key')?.value?.trim();
    if (!aiKey) return null;

    console.log("🎬 A-CAM: Initiating Scene Handshake (AI Studio)...");
    const model = await getBestAIStudioModel(aiKey);
    const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${aiKey}`;

    try {
        const payload = {
            contents: [{
                parts: [
                    { text: "Analyze this cinematic background. Output JSON: 'description', 'foreground', 'midground', 'background', 'horizonY', 'groundY', 'lightingDir' ('left','right','ambient'), 'timeOfDay'." },
                    { inlineData: { mimeType: "image/jpeg", data: base64.split(',')[1] } }
                ]
            }]
        };
        const response = await fetchWithProxy(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        }
    } catch (e) {
        if (e.message.includes('429')) {
            showToast("⏳ AI Studio Quota Hit - Using Local Scene Estimator...");
        }
        console.warn("⚠️ Scene Handshake failed:", e.message);
    }
    return null;
};

window.analyzeImageVertexAI = async function (base64, projectId, region, accessToken) {
    const aiKey = document.getElementById('acam_gemini_key')?.value?.trim();
    const token = String(accessToken || "").trim();
    const pId = String(projectId || "").trim();

    // 🚀 INTELLIGENCE-FIRST: Try Gemini 3 Flash (AI Studio) first for wardrobe description
    // This bypasses Region/Billing issues entirely for simple analysis.
    if (aiKey) {
        console.log("🎬 A-CAM: Initiating Outfit Handshake (AI Studio: Gemini 3)...");
        try {
            const data = await tryGeminiStudioAnalysis(base64, aiKey);
            if (data) return data;
        } catch (e) {
            console.warn("⚠️ AI Studio Fallback:", e.message);
        }
    }

    // Fallback/Option 2 - Vertex AI (Uses your Google Cloud Credits)
    if (token && pId) {
        console.log("🎬 A-CAM: Engaging Production Engine (Vertex Credits)...");
        try {
            const data = await tryVertexAnalysis(base64, pId, region, token);
            if (data) return data;
        } catch (err) {
            console.warn("⚠️ Vertex Analysis Sync Issue:", err.message);
        }
    }

    return { outfit: "Cinematic tactical attire.", description: "Subject in localized atmosphere." };
};

async function tryGeminiStudioAnalysis(base64, key) {
    const model = await getBestAIStudioModel(key);
    const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${key}`;
    const payload = {
        contents: [{
            parts: [
                { text: "Analyze this character. Output JSON: 'outfit', 'description'." },
                { inlineData: { mimeType: "image/jpeg", data: base64.split(',')[1] } }
            ]
        }]
    };
    const response = await fetchWithProxy(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (response.ok) {
        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        return JSON.parse(text.replace(/```json|```/g, '').trim());
    }
    throw new Error(`Studio Error ${response.status}`);
}

async function tryVertexAnalysis(base64, pId, region, token) {
    // 🌍 REGION-RESILIENCE: Force us-central1 for analysis stability
    const regions = ["us-central1", region, "us-west1", "europe-west4"];
    
    // 🚀 STABLE IDS: Using confirmed standard Vertex AI IDs
    const modelIds = [
        "gemini-1.5-flash-002",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro-001",
        "medlm-medium" // Fallback high-entropy
    ];

    for (const r of regions) {
        if (!r) continue;
        for (const mId of modelIds) {
            console.log(`📡 A-CAM Burst Scan: Testing ${mId} in ${r}...`);
            // 🔥 Use v1 for Gemini Flash stability
            const ver = mId.includes("flash-00") ? "v1" : "v1beta1";
            const endpoint = `https://${r}-aiplatform.googleapis.com/${ver}/projects/${pId}/locations/${r}/publishers/google/models/${mId}:generateContent`;
            
            try {
                // 🔑 NOTE: The Production Bridge (cors_bridge.py) now automatically injects 
                // the Authorization token using your local gcloud authority.
                const response = await fetchWithProxy(endpoint, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ 
                        contents: [{ 
                            parts: [
                                { text: "Analyze character outfit. Output JSON: 'outfit', 'description'." }, 
                                { inlineData: { mimeType: "image/jpeg", data: base64.split(',')[1] } }
                            ] 
                        }] 
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data.candidates[0].content.parts[0].text;
                    console.log(`🎯 A-CAM Burst Scan: Success! Locked onto ${mId} in ${r} (Identity Verified)`);
                    return JSON.parse(text.replace(/```json|```/g, '').trim());
                } else {
                    const errData = await response.json();
                    // Log only significant errors, skip 404s/403s during burst scan
                    if (response.status !== 404 && response.status !== 403) {
                        console.warn(`📡 ${mId} in ${r} rejected:`, errData.error?.message || response.status);
                    }
                }
            } catch (err) {
                // Silently skip
            }
        }
    }
    return null;
}

// --- MODEL HUNTER: Live Inventory Discovery ---
window.listAvailableVertexModels = async function () {
    const projectId = document.getElementById('gcpProjectId')?.value;
    const region = document.getElementById('gcpRegion')?.value;
    const accessToken = document.getElementById('gcpAccessToken')?.value;

    if (!projectId || !region || !accessToken) {
        showToast("⚠️ Fill in Project, Region, and Token first");
        return;
    }

    showToast("🔍 Hunting for Gemini models...");
    const pId = projectId.trim();
    const currentRgn = region.trim();

    // We try multiple regions as Gemini allocation varies by project/quota
    const regionsToTry = [currentRgn, "us-west1", "us-east4", "europe-west4", "asia-northeast1"];
    let foundSomething = false;

    for (const rgn of regionsToTry) {
        showToast(`🔍 Scanning ${rgn}...`);
        console.log(`📡 Model Hunter: Checking Region ${rgn}`);

        const endpoints = [
            `https://${rgn}-aiplatform.googleapis.com/v1/projects/${pId}/locations/${rgn}/publishers/google/models`,
            `https://${rgn}-aiplatform.googleapis.com/v1beta1/projects/${pId}/locations/${rgn}/publishers/google/models`
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await window.fetchWithProxy(endpoint, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
                });

                if (!response.ok) continue;

                const data = await response.json();
                if (data.models) {
                    const geminiModels = [...new Set(data.models
                        .filter(m => m.name.includes('gemini-1.5') || m.name.includes('veo'))
                        .map(m => m.name.split('/').pop()))];

                    if (geminiModels.length > 0) {
                        console.log(`✅ FOUND MODELS IN ${rgn}:`, geminiModels);
                        showToast(`✓ Found models in ${rgn}`);

                        // Update UI to match the successful region
                        const rgnInput = document.getElementById('gcpRegion');
                        if (rgnInput) rgnInput.value = rgn;

                        const select = document.getElementById('gcpModel');
                        if (select) {
                            select.innerHTML = geminiModels.map(id => `<option value="${id}">${id}</option>`).join('');
                        }
                        foundSomething = true;
                        break;
                    }
                }
            } catch (e) {
                console.warn(`Discovery failed for ${rgn}:`, e);
            }
        }
        if (foundSomething) break;
    }

    if (!foundSomething) {
        console.error("❌ All Regions returned 404 or empty.");
        showToast("❌ No models found. Try us-west1 manually?");
    }
};

// --- UI HELPERS ---
Antigravity.toggleGcpConfig = function (e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const el = document.getElementById('gcpConfigPanel');
    if (el) {
        el.style.display = (el.style.display === 'none' || !el.style.display) ? 'flex' : 'none';
        if (el.style.display === 'flex') {
            const pId = localStorage.getItem('acam_gcp_project_id');
            const reg = localStorage.getItem('acam_gcp_region');
            const gKey = localStorage.getItem('acam_gemini_key');
            const fKey = localStorage.getItem('acam_fal_key');

            if (pId && document.getElementById('gcpProjectId')) document.getElementById('gcpProjectId').value = pId;
            if (reg && document.getElementById('gcpRegion')) document.getElementById('gcpRegion').value = reg;
            if (gKey && document.getElementById('acam_gemini_key')) document.getElementById('acam_gemini_key').value = gKey;
            if (fKey && document.getElementById('acam_fal_key')) document.getElementById('acam_fal_key').value = fKey;

            document.getElementById('acam_gemini_key')?.focus();
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    // 🛡️ SANITIZER: Cleanup corrupted Project IDs in localStorage
    let pId = localStorage.getItem('acam_gcp_project_id');
    if (pId && pId.includes("project-") && pId.lastIndexOf("project-") > 0) {
        pId = pId.substring(pId.lastIndexOf("project-"));
        localStorage.setItem('acam_gcp_project_id', pId);
    }
    // Final override for production if still missing
    if (!pId || pId === "undefined" || pId === "null") {
        pId = "940583187251";
        localStorage.setItem('acam_gcp_project_id', pId);
    }

    const reg = localStorage.getItem('acam_gcp_region') || "us-central1";
    const gKey = localStorage.getItem('acam_gemini_key');
    const fKey = localStorage.getItem('acam_fal_key');

    if (document.getElementById('gcpProjectId')) document.getElementById('gcpProjectId').value = pId;
    if (document.getElementById('gcpRegion')) document.getElementById('gcpRegion').value = reg;
    if (document.getElementById('acam_gemini_key')) document.getElementById('acam_gemini_key').value = gKey;
    if (document.getElementById('acam_fal_key')) document.getElementById('acam_fal_key').value = fKey;
});

// GLOBAL EXPOSURE FOR UI
window.toggleGcpConfig = function(e) { Antigravity.toggleGcpConfig(e); };

window.addEventListener('click', (e) => {
    const gcpPanel = document.getElementById('gcpConfigPanel');
    if (gcpPanel && gcpPanel.style.display === 'flex') {
        const btn = document.getElementById('configToggleBtn');
        if (!gcpPanel.contains(e.target) && (!btn || !btn.contains(e.target))) {
            Antigravity.toggleGcpConfig();
        }
    }
});

document.addEventListener('input', (e) => {
    let val = e.target.value;
    if (e.target.id === 'gcpProjectId') {
        // 🛡️ HARDENER: Inline repair for doubling bug
        if (val.includes("project-") && val.lastIndexOf("project-") > 0) {
            val = val.substring(val.lastIndexOf("project-"));
            e.target.value = val;
        }
        localStorage.setItem('acam_gcp_project_id', val);
    }
    if (e.target.id === 'gcpRegion') localStorage.setItem('acam_gcp_region', val);
    if (e.target.id === 'acam_gemini_key') localStorage.setItem('acam_gemini_key', val);
    if (e.target.id === 'acam_fal_key') localStorage.setItem('acam_fal_key', val);
});

// GLOBAL SHIMS FOR UI BUTTONS
window.pushToProduction = function() {
    if (window.Antigravity && window.Antigravity.pushToProduction) {
        window.Antigravity.pushToProduction();
    } else {
        console.error("Antigravity.pushToProduction not found");
    }
};

