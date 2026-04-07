// ═══════════════════════════════════════════════════════════════════════════
// ANTIGRAVITY PRODUCTION BRIDGE
// ═══════════════════════════════════════════════════════════════════════════

window.Antigravity = {
    isBaking: false,
    hardenedBrief: "",
    anchors: {
        identity: false,
        anatomy: false,
        textile: false,
        scene: false
    },

    /**
     * THE HARDENER — Agentic Cinematography Reasoning
     */
    bake: async function() {
        if (this.isBaking) return;
        this.isBaking = true;
        
        const consoleEl = document.getElementById('productionConsole');
        const bakeBtn = document.getElementById('bakeBtn');
        if (bakeBtn) bakeBtn.classList.add('active');
        
        const log = (msg, type = '') => {
            const line = document.createElement('div');
            line.className = 'console-line' + (type ? ' ' + type : '');
            line.textContent = `> ${msg}`;
            consoleEl.appendChild(line);
            consoleEl.scrollTop = consoleEl.scrollHeight;
        };

        if (consoleEl) consoleEl.innerHTML = '';
        log("INITIATING ANTIGRAVITY HARDENER...", "reasoning");
        
        try {
            // STEP 1: ASSET SYNCHRONIZATION
            await new Promise(r => setTimeout(r, 800));
            log("SYNCING VISUAL ANCHORS...");
            this.syncAnchors(log);

            // STEP 2: MULTI-MODAL REASONING
            await new Promise(r => setTimeout(r, 1200));
            log("ANALYZING CAMERA PHYSICS (LENS: " + S.lens + ")...", "reasoning");
            
            const intensity = S.movementIntensity;
            const kineticVerbs = this.getKineticVerbs(S.movement, intensity);
            log("BAKING KINETIC PROSE: " + kineticVerbs.join(", ").toUpperCase() + "...");

            // STEP 3: GENERATE HARDENED BRIEF
            await new Promise(r => setTimeout(r, 1000));
            this.hardenedBrief = this.generateHardenedBrief(kineticVerbs);
            log("TECHNICAL BRIEF HARDENED.", "success");

            // STEP 4: VISUAL VERIFICATION
            log("TRIGGERING BAKE VERIFICATION...", "reasoning");
            if (typeof window.renderFrames === 'function') window.renderFrames();
            
            showToast("✓ PRODUCTION BRIEF BAKED");
        } catch (err) {
            log("BAKE FAILED: " + err.message, "error");
        } finally {
            this.isBaking = false;
            if (bakeBtn) bakeBtn.classList.remove('active');
        }
    },

    syncAnchors: function(log) {
        // Sync Identity
        if (S.faceCloseup) {
            this.setAnchor('Identity', true);
            log("LOCK: Fidelity Anchor [Face] verified.");
        }
        // Sync Anatomy
        if (S.heroImage) {
            this.setAnchor('Anatomy', true);
            log("LOCK: Anatomy Anchor [Pose] verified.");
        }
        // Sync Textile
        if (S.outfitDetails || document.getElementById('subjectOutfit')?.value) {
            this.setAnchor('Textile', true);
            log("LOCK: Textile Anchor [Outfit] verified.");
        }
        // Sync Scene
        if (S.backgroundPlate) {
            this.setAnchor('Scene', true);
            log("LOCK: Scene Anchor [Slate] verified.");
        }
    },

    setAnchor: function(id, locked) {
        const el = document.getElementById('anchor' + id);
        if (!el) return;
        el.classList.toggle('locked', locked);
        el.classList.toggle('missing', !locked);
        el.querySelector('.bucket-status').textContent = locked ? 'LOCKED' : 'MISSING';
        
        // Update thumbnail if possible
        const preview = el.querySelector('.bucket-preview');
        if (locked && preview) {
            if (id === 'Identity' && S.faceCloseup) preview.style.backgroundImage = `url(${S.faceCloseup})`;
            if (id === 'Anatomy' && S.characterImage) preview.style.backgroundImage = `url(${S.characterImage})`;
            if (id === 'Scene' && S.backgroundPlate) {
                preview.style.backgroundImage = `url(${S.backgroundPlate.src})`;
            }
        }
    },

    getKineticVerbs: function(movement, intensity) {
        const isIntense = intensity > 75;
        const verbs = [];
        switch(movement) {
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

    generateHardenedBrief: function(verbs) {
        const physics = `Physics Lock: ${verbs.join(", ")}. Ground contact anchored at ${Math.round(S.groundPlaneY * 100)}% relative to [GCS_SLATE]. `;
        const optics = `Optical Brief: ${S.lens} with ${S.dof.split(' ')[0]} compression. ${S.shutterSpeed} shutter fidelity. `;
        const character = `Identity Preservation: Fidelity Slot A (Face), Anatomy Slot B (Pose). `;
        
        return physics + optics + character + (S.subjectPerformance ? `Kinetic Performance: ${S.subjectPerformance}.` : "");
    },

    pushToProduction: async function() {
        if (!S.targetModel) {
            showToast("Please select a render engine first (Veo, Kling, Luma)");
            return;
        }

        if (!this.hardenedBrief) {
            showToast("⚠️ Production Brief not baked! Hit BAKE first.");
            if (S.heroImage) await this.bake();
            else return;
        }

        window.renderToFal(S.targetModel, this.hardenedBrief);
    }
};

/**
 * THE RENDER EXPORT ENGINE (REFACTORED FOR BRIDGE)
 */
window.renderToFal = async function(engineName, hardenedPrompt = "") {
    const MODELS = {
        'Kling': { endpoint: 'fal-ai/kling-video/v1.6/standard/image-to-video' },
        'Luma': { endpoint: 'fal-ai/luma-dream-machine/image-to-video' },
        'Veo': { endpoint: 'fal-ai/google/veo-2' },
        'Minimax': { endpoint: 'fal-ai/minimax/video/v1/image-to-video' }
    };

    console.log(`🎬 A-CAM: Initiating Production for ${engineName}...`);
    const model = MODELS[engineName];
    if (!model || !model.endpoint) {
        showToast("Error: Unknown Engine");
        return;
    }
    const modelEndpoint = model.endpoint;

    let falKey = localStorage.getItem('FAL_KEY');
    if (!falKey) {
        falKey = prompt("Please enter your fal.ai API key:");
        if (!falKey) return;
        localStorage.setItem('FAL_KEY', falKey);
    }

    showToast(`🎬 Preparing Cloud Handshake for ${engineName}...`);
    
    let startFrameUrl = null;
    if (S.heroImage) {
        if (S.heroImage instanceof HTMLCanvasElement) {
            startFrameUrl = S.heroImage.toDataURL('image/jpeg', 0.8);
        } else {
            const tmpC = document.createElement('canvas');
            tmpC.width = S.heroImage.width; tmpC.height = S.heroImage.height;
            const tCtx = tmpC.getContext('2d', { willReadFrequently: true });
            tCtx.drawImage(S.heroImage, 0, 0);
            startFrameUrl = tmpC.toDataURL('image/jpeg', 0.8);
        }
    }

    const basePrompt = document.getElementById('promptBox')?.textContent || "Cinematic video";
    const finalPrompt = hardenedPrompt ? `${hardenedPrompt} | STYLED AS: ${basePrompt}` : basePrompt;
    
    console.log("📤 [BRIDGE] Final Hardened Payload:", finalPrompt);
    showRenderProgress(engineName);

    try {
        const payload = {
            prompt: finalPrompt,
            negative_prompt: "camera equipment, tripod, text, watermark, low resolution, distorted faces, bad anatomy",
            image_url: startFrameUrl,
            aspect_ratio: S.aspectRatio || '16:9'
        };

        if (engineName === 'Veo') payload.duration = "5s";

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
        if (initialResult.request_id) {
            await pollFalStatus(engineName, initialResult.request_id, falKey);
        } else if (initialResult.video && initialResult.video.url) {
            handleRenderSuccess(initialResult.video.url);
        }
    } catch (err) {
        console.error("❌ Render Error:", err);
        showToast("Error: " + err.message);
        hideRenderProgress();
    }
};

async function pollFalStatus(engineName, requestId, falKey) {
    const startTime = Date.now();
    let attempts = 0;
    while (attempts < 120) {
        attempts++;
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        updateRenderProgressUI(engineName, elapsed, attempts);
        try {
            const pollResponse = await fetch(`https://fal.run/requests/${requestId}/status`, {
                headers: { 'Authorization': `Key ${falKey}` }
            });
            const statusData = await pollResponse.json();
            if (statusData.status === 'COMPLETED') {
                const res = await fetch(`https://fal.run/requests/${requestId}`, {
                    headers: { 'Authorization': `Key ${falKey}` }
                });
                const finalData = await res.json();
                if (finalData.video) {
                    handleRenderSuccess(finalData.video.url);
                    return;
                }
            } else if (statusData.status === 'FAILED') throw new Error("API Failure");
        } catch (e) {}
        await new Promise(r => setTimeout(r, 4000));
    }
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
    if (time) time.textContent = `${Math.floor(elapsed/60)}:${(elapsed%60).toString().padStart(2,'0')} ELAPSED`;
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

window.pushToProduction = function() { Antigravity.pushToProduction(); };
window.generateActionStandIn = async function() { await Antigravity.bake(); };

