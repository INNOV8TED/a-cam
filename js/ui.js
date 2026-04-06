
// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS BAR HELPERS
// ═══════════════════════════════════════════════════════════════════════════
let aiProgressTimer;

function startAIProgress(duration) {
    const container = document.getElementById('aiProgressBar');
    const fill = document.getElementById('aiProgressFill');
    if (!container || !fill) return;
    
    container.style.display = 'block';
    fill.style.width = '0%';
    
    let progress = 0;
    const interval = 100; 
    const step = 100 / (duration * 10);

    clearInterval(aiProgressTimer);
    aiProgressTimer = setInterval(() => {
        progress += step;
        if (progress >= 98) {
            progress = 98;
            clearInterval(aiProgressTimer);
        }
        fill.style.width = progress + '%';
    }, interval);
}

function completeAIProgress() {
    const container = document.getElementById('aiProgressBar');
    const fill = document.getElementById('aiProgressFill');
    if (!fill || !container) return;
    
    fill.style.width = '100%';
    setTimeout(() => {
        container.style.display = 'none';
    }, 500);
}


// ═══════════════════════════════════════════════════════════════════════════
// CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════
// --- Updated handleUpload ---
function handleUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(evt) {
    const base64String = evt.target.result;
    const img = new Image();
    
    img.onload = async function() { 
      S.heroImage = img;
      S.characterImage = base64String;
      
      document.getElementById('heroImage').src = base64String;
      document.getElementById('uploadZone').classList.add('has-image');
      
      // 🔥 Trigger the Interrogation
      analyzeUploadedOutfit(base64String);
      
      renderStoryboard();
      renderFrames();
      generatePrompt();
    };
    img.src = base64String;
  };
  reader.readAsDataURL(file);
}

// --- The Helper Function ---
async function analyzeUploadedOutfit(base64) {
    const outfitBox = document.getElementById('subjectOutfit');
    if (!outfitBox) return;

    outfitBox.value = "";
    outfitBox.placeholder = "🔍 Scanning wardrobe...";

    try {
        const response = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                imageBase64: base64,
                analyzeType: 'character_outfit'
            })
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        
        if (data.outfit) {
            let outfitText = data.outfit;
            if (outfitText.startsWith('{') || outfitText.startsWith('```')) {
                try {
                    const cleanJson = outfitText.replace(/```json?|```/g, '').trim();
                    const parsed = JSON.parse(cleanJson);
                    outfitText = parsed.outfit || parsed.description || outfitText;
                } catch (e) {}
            }
            outfitBox.value = outfitText;
            S.outfitDetails = data;
            showToast('✓ Wardrobe analyzed');
        } else if (data.description) {
            outfitBox.value = data.description;
            showToast('✓ Wardrobe identified');
        }
    } catch (error) {
        console.warn("Analysis glitch (503): Falling back to defaults.");
        outfitBox.value = 'Casual everyday attire';
        outfitBox.placeholder = "Outfit lock (e.g. 'black leather jacket')";
    }
}

function clearImage() {
  S.heroImage = null;
  S.characterImage = null; // Also clear the API string we added earlier
  S.sceneAnalyzed = false;
  
  // 🔥 THE FIX: Reset the file input value so you can re-upload the same file
  const fileInput = document.getElementById('fileInput');
  if (fileInput) fileInput.value = '';

  document.getElementById('heroImage').src = '';
  document.getElementById('uploadZone').classList.remove('has-image', 'analyzed');
  document.getElementById('promptBox').textContent = 'Upload a hero image to generate your cinematography prompt...';
  document.getElementById('promptBox').classList.remove('has-analysis');
  
  clearCanvases();
  renderStoryboard();
  updateAPIStatus('offline');
}

function getAspectDimensions(containerW, containerH) {
  const ratioData = ASPECT_RATIOS[S.aspectRatio];
  const targetRatio = ratioData ? ratioData.ratio : 16/9;
  
  let w, h;
  if (containerW / containerH > targetRatio) {
    h = containerH;
    w = h * targetRatio;
  } else {
    w = containerW;
    h = w / targetRatio;
  }
  return { w: Math.floor(w), h: Math.floor(h) };
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDERING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

// Background removal logic moved to renderer.js for better consolidation and thresholding


// drawCharacterWithShadow moved to renderer.js for advanced visual fidelity

function applyEffect(canvas, img, variation = {}) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const settings = { ...S, ...variation };
  
  const parent = canvas.parentElement;
  const containerW = parent ? parent.clientWidth || 200 : 200;
  const containerH = parent ? parent.clientHeight || 150 : 150;
  
  const { w, h } = getAspectDimensions(containerW, containerH);
  canvas.width = w;
  canvas.height = h;
  
  ctx.fillStyle = '#0a0a0c';
  ctx.fillRect(0, 0, w, h);
  
  const imgRatio = img.width / img.height;
  const canvasRatio = w / h;
  
  // 1. BASE CHARACTER DIMENSIONS
  let charScale = canvasRatio >= 1.7 ? 0.72 : 0.82;
  let charH = h * charScale;
  let charW = charH * imgRatio;
  
  // 2. THE GROUND ANCHOR (Pinning the feet)
  const feetX = w / 2;
  const groundY = Math.min(settings.groundPlaneY || S.groundPlaneY || 0.88, 0.92);
  const feetY = h * groundY;
  
  const headY = feetY - charH;
  const minHeadroom = h * 0.08; 
  let adjustedFeetY = headY < minHeadroom ? charH + minHeadroom : feetY;

  // MOTION INPUTS
  const moveX = (settings.bgPanOffset || 0) * w;
  const moveY = (settings.bgTiltOffset || 0) * h;
  const charMoveX = (settings.charPanOffset || 0) * w;
  const charMoveY = (settings.charTiltOffset || 0) * h;
  const bgScale = settings.bgScale || 1.0;
  const charScaleMult = settings.charScale || 1.0;

  // 🔥 NEW: Head & Shoulders Focus for Dolly/Zoom
  // When scaling up, we shift the character down so we stay focused on the head/upper body
  if (charScaleMult > 1.0) {
    const shiftFactor = (charScaleMult - 1.0) * 0.5; // Shift down slightly as we zoom
    adjustedFeetY += (charH * shiftFactor);
  } else if (charScaleMult < 1.0) {
    // 🔥 NEW: Center compensation for Dolly Pull Out
    // When subject gets smaller, we pull them UP towards the center
    const liftFactor = (1.0 - charScaleMult) * 0.45;
    adjustedFeetY -= (charH * liftFactor);
  }

  // 🔥 NEW: ORGANIC HANDHELD DRIFT
  // Drift values are now managed by startMotionEngine loop in S
  const finalCharScale = charScaleMult;

  ctx.save();
  
  // GLOBAL DUTCH TILT & SKEW (Welds subject to world)
  if (settings.dutchAngle && settings.dutchAngle !== 0) {
    ctx.translate(w / 2, h / 2);
    ctx.rotate(settings.dutchAngle * Math.PI / 180);
    if (settings.skewX) ctx.transform(1, 0, settings.skewX, 1, 0, 0);
    ctx.translate(-w / 2, -h / 2);
  }

  // 4. BACKGROUND PLATE (The World)
  if (S.backgroundPlate) {
    const bgRatio = S.backgroundPlate.width / S.backgroundPlate.height;
    const baseOverscan = 1.6;
    const angleMagnitude = Math.abs(settings.dutchAngle || 0);
    const smoothTiltBuffer = 1.0 + (Math.min(45, angleMagnitude) / 45) * 0.4;
    const finalOverscan = baseOverscan * smoothTiltBuffer;

    let bgW, bgH;
    if (bgRatio > canvasRatio) {
      bgH = h * finalOverscan; bgW = bgH * bgRatio;
    } else {
      bgW = w * finalOverscan; bgH = bgW / bgRatio;
    }

    const lensName = settings.lens || S.lens || '50mm Normal';
    const currentLens = parseInt(lensName) || 50; 
    let opticalZoom = 1.0;
    if (currentLens <= 10) opticalZoom = 0.55;       // 8mm Fisheye
    else if (currentLens <= 15) opticalZoom = 0.70;  // 15mm Ultra
    else if (currentLens <= 24) opticalZoom = 0.82;  // 24mm Wide
    else if (currentLens <= 35) opticalZoom = 0.92;  // 35mm Standard
    else if (currentLens <= 50) opticalZoom = 1.05;  // 50mm Normal
    else if (currentLens <= 85) opticalZoom = 1.35;  // 85mm Portrait
    else if (currentLens >= 135) opticalZoom = 1.65; // 135mm Tele
    
    const scaledBgW = bgW * bgScale * opticalZoom;
    const scaledBgH = bgH * bgScale * opticalZoom;
    
    const bgGroundX = scaledBgW / 2;
    const focusPlaneY = settings.groundPlaneY || S.groundPlaneY || 0.85;
    const bgGroundY = scaledBgH * focusPlaneY;
    
    const curAngle = settings.angle || S.angle;
    let angleShiftY = 0;
    if (curAngle === "Worm's Eye") angleShiftY = scaledBgH * 0.25;
    else if (curAngle === "High Angle") angleShiftY = -scaledBgH * 0.12;

    const bgX = feetX - bgGroundX + moveX;
    const bgY = adjustedFeetY - bgGroundY + moveY + angleShiftY;
    
    // We already handled zoom/scale in scaledBgW calculation.
    // Distortion removed per user request.
    
    // 🔥 NEW: CALL THE GRADIENT DEPTH ENGINE
    let totalBlur = getBlurAmount(settings.dof || S.dof) * 1.5;
    let fgBlur = 0;
    
    // Dynamic Rack Focus Logic: Now affects both frames
    if (S.rackFocus !== 0) {
      // Proportional: if End is + (Pull to FG), then Start is - (Pull to BG)
      const rackVal = S.rackFocus / 100.0;
      const currentRack = (settings.frameType === 'end') ? rackVal : -rackVal;

      if (currentRack > 0) {
        totalBlur = Math.max(totalBlur, currentRack * 20); // Pull to FG
      } else {
        totalBlur = Math.max(0, totalBlur + (currentRack * totalBlur)); // Pull to BG
        fgBlur = Math.abs(currentRack) * 8.5; // Reduced from 15 to stay blurry/visible
      }
    }
    settings.calculatedFgBlur = fgBlur;

    // Get just the color filter without the blur (blur is handled by the DOF engine)
    const timeFilter = getEnvironmentFilter(settings.timeOfDay ?? S.timeOfDay, settings.isIndoor ?? S.isIndoor, 0);
    
    drawBackgroundWithSimpleDOF(ctx, S.backgroundPlate, bgX, bgY, scaledBgW, scaledBgH, focusPlaneY, totalBlur, timeFilter, settings.dutchAngle || 0);
  }

  // 5. CHARACTER LAYER (The Actor) - ALWAYS PROCESS
  const finalCharW = charW * finalCharScale;
  const finalCharH = charH * finalCharScale;
  
  const charCanvas = document.createElement('canvas');
  charCanvas.width = Math.ceil(finalCharW); charCanvas.height = Math.ceil(finalCharH);
  const charCtx = charCanvas.getContext('2d');
  charCtx.drawImage(img, 0, 0, finalCharW, finalCharH);
  removeStudioBackground(charCtx, charCanvas);
  
  const curAngle = settings.angle || S.angle;
  let topP = 1.0, botP = 1.0;
  if (curAngle === "Worm's Eye") { topP = 0.82; botP = 1.18; }
  else if (curAngle === "High Angle") { topP = 1.08; botP = 0.92; }

  const pCanvas = document.createElement('canvas');
  pCanvas.width = finalCharW * 1.5; pCanvas.height = finalCharH;
  drawPinchCharacter(pCanvas.getContext('2d'), charCanvas, (pCanvas.width - finalCharW)/2, 0, finalCharW, finalCharH, topP, botP);

  const charX = feetX - (pCanvas.width / 2) + (moveX * 1.4) + charMoveX; 
  const charY = adjustedFeetY - finalCharH + moveY + charMoveY; 

  // Calculate common rendering parameters
  const masterLighting = settings.lighting || S.lighting;
  const masterTimeOfDay = settings.timeOfDay ?? S.timeOfDay;
  const masterSunDirection = settings.sunDirection ?? S.sunDirection;

  // Apply Shutter Speed Effect (Slow Shutter = Motion Blur Trail)
  const shutter = settings.shutterSpeed || S.shutterSpeed;
  if (shutter === 'Slow' && settings.frameType === 'end') {
      const blurCount = 5;
      const blurStepX = moveX * 0.05;
      const blurStepY = moveY * 0.05;
      ctx.save();
      ctx.globalAlpha = 0.2;
      for (let i = 1; i <= blurCount; i++) {
          drawCharacterWithShadow(ctx, pCanvas, charX - (blurStepX * i), charY - (blurStepY * i), pCanvas.width, finalCharH, masterTimeOfDay, masterLighting, masterSunDirection);
      }
      ctx.restore();
  }

  // Draw Character with Shadow (using master renderer.js version)

  if (settings.calculatedFgBlur && settings.calculatedFgBlur > 0) {
      const blurCanvas = document.createElement('canvas');
      blurCanvas.width = pCanvas.width; blurCanvas.height = pCanvas.height;
      const bctx = blurCanvas.getContext('2d');
      bctx.filter = `blur(${settings.calculatedFgBlur}px)`;
      bctx.drawImage(pCanvas, 0, 0);
      drawCharacterWithShadow(ctx, blurCanvas, charX, charY, pCanvas.width, finalCharH, masterTimeOfDay, masterLighting, masterSunDirection);
  } else {
      drawCharacterWithShadow(ctx, pCanvas, charX, charY, pCanvas.width, finalCharH, masterTimeOfDay, masterLighting, masterSunDirection);
  }

  // 6. UN-TILT THE WORLD
  ctx.restore(); 

  // 7. ATMOSPHERIC HAZE
  if (S.hazeAmount > 0) {
    let distanceFactor = 1.0;
    if (settings.frameType === 'end' && S.movement === 'Dolly Pull Out') {
      distanceFactor = 1.0 + (S.movementIntensity / 100) * 0.5;
    }
    applyAtmosphericHaze(ctx, w, h, S.hazeAmount, S.hazeColor, distanceFactor);
  }

  // Anime Speed Lines (Restore aggressive look)
  if (settings.frameType === 'end' && 
      (S.movement === 'Dolly Push In' || S.movement === 'Dolly Zoom' || S.movement === 'Zoom In' || S.movement === 'Dolly Pull Out') && 
      S.movementIntensity >= 70) {
      
      const centerX = w / 2;
      const centerY = h / 2;
      ctx.save();
      ctx.globalAlpha = 0.25; // 🔥 NEW: Lowered to 0.25 (Subtle)
      ctx.strokeStyle = '#ffffff';
      
      const lineCount = S.movementIntensity > 90 ? 55 : 35; // 🔥 NEW: Lowered density
      for (let i = 0; i < lineCount; i++) {
        ctx.lineWidth = Math.random() * 2 + 0.5;
        const angle = Math.random() * Math.PI * 2;
        const innerRadius = (Math.random() * 0.3 + 0.5) * (h/2); // 🔥 NEW: Starting further out
        const outerRadius = Math.max(w, h); 
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * innerRadius, centerY + Math.sin(angle) * innerRadius);
        ctx.lineTo(centerX + Math.cos(angle) * outerRadius, centerY + Math.sin(angle) * outerRadius);
        ctx.stroke();
      }
      ctx.restore();
  }
  
  // 🔥 NEW: OPTICS ENGINE (Lens Flare)
  drawAnamorphicFlare(ctx, settings, w, h);

  // 8. FINAL LENS PASS
  if (S.heroImage) {
    if (typeof applyTimeOfDayGrade === 'function') {
        applyTimeOfDayGrade(ctx, w, h, settings.timeOfDay ?? S.timeOfDay, settings.isIndoor ?? S.isIndoor, settings.sunDirection ?? S.sunDirection);
    }
    if (typeof applyLightingOverlay === 'function') {
        applyLightingOverlay(ctx, w, h, settings.lighting || S.lighting, settings.lightingIntensity ?? S.lightingIntensity);
    }
    applyVignette(ctx, 0, 0, w, h, S.lightingIntensity);
  }
  
  applyLensOverlay(ctx, w, h, settings.lens || S.lens);
  drawOverlays(ctx, w, h);
  drawBadges(ctx, w, h, settings.frameType);

  // 10. APPLY FILM STOCK EFFECTS (Grain, Scanlines, Tints)
  if (typeof applyFilmEffects === 'function') {
      applyFilmEffects(ctx, w, h, settings.filmStock || S.filmStock);
  }
}


// === LIGHTING OVERLAY (with intensity control) ===
function applyLightingOverlay(ctx, w, h, lighting, intensity) {
  if (intensity === 0) return;
  
  const alpha = intensity / 100;
  ctx.save();
  
  switch(lighting) {
    case 'Natural Ambient':
      // Minimal effect - just slight warmth
      ctx.globalCompositeOperation = 'soft-light';
      ctx.globalAlpha = alpha * 0.1;
      ctx.fillStyle = '#fff5e6';
      ctx.fillRect(0, 0, w, h);
      break;
      
    case 'Soft Diffused':
      // Reduce contrast, soften
      ctx.globalCompositeOperation = 'soft-light';
      ctx.globalAlpha = alpha * 0.2;
      ctx.fillStyle = '#e8e8e8';
      ctx.fillRect(0, 0, w, h);
      // Add slight lift to shadows
      ctx.globalCompositeOperation = 'lighten';
      ctx.globalAlpha = alpha * 0.1;
      ctx.fillStyle = '#333';
      ctx.fillRect(0, 0, w, h);
      break;
      
    case 'Studio Key':
      // Strong directional light from top-left
      ctx.globalCompositeOperation = 'soft-light';
      ctx.globalAlpha = alpha * 0.25;
      const keyGrad = ctx.createLinearGradient(0, 0, w, h);
      keyGrad.addColorStop(0, '#ffffff');
      keyGrad.addColorStop(0.5, '#888888');
      keyGrad.addColorStop(1, '#333333');
      ctx.fillStyle = keyGrad;
      ctx.fillRect(0, 0, w, h);
      break;
      
    case 'Neon Rim Light':
      // Neon edge glow
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = alpha * 0.2;
      const neonGrad = ctx.createLinearGradient(0, 0, w, 0);
      neonGrad.addColorStop(0, '#ff00ff');
      neonGrad.addColorStop(0.3, 'transparent');
      neonGrad.addColorStop(0.7, 'transparent');
      neonGrad.addColorStop(1, '#00ffff');
      ctx.fillStyle = neonGrad;
      ctx.fillRect(0, 0, w, h);
      // Add overall blue tint for night feel
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = alpha * 0.15;
      ctx.fillStyle = '#1a1a3e';
      ctx.fillRect(0, 0, w, h);
      break;
      
    case 'Hard Shadow Noir':
      // High contrast with deep shadows
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = alpha * 0.4;
      const noirGrad = ctx.createLinearGradient(0, 0, w * 0.6, h);
      noirGrad.addColorStop(0, '#000');
      noirGrad.addColorStop(0.6, 'transparent');
      ctx.fillStyle = noirGrad;
      ctx.fillRect(0, 0, w, h);
      // Add contrast boost
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = alpha * 0.15;
      ctx.fillStyle = '#222';
      ctx.fillRect(0, 0, w, h);
      break;
      
    case 'Volumetric Fog':
      // God rays / atmospheric haze
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = alpha * 0.2;
      const fogGrad = ctx.createRadialGradient(w * 0.3, h * 0.2, 0, w * 0.5, h * 0.5, w);
      fogGrad.addColorStop(0, '#ffffff');
      fogGrad.addColorStop(0.3, '#aaaaaa');
      fogGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, 0, w, h);
      break;
      
    case 'Backlit Silhouette':
      // Strong backlight, dark foreground
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = alpha * 0.5;
      const backGrad = ctx.createRadialGradient(w/2, h * 0.3, w * 0.1, w/2, h/2, w);
      backGrad.addColorStop(0, 'transparent');
      backGrad.addColorStop(0.4, '#222');
      backGrad.addColorStop(1, '#000');
      ctx.fillStyle = backGrad;
      ctx.fillRect(0, 0, w, h);
      // Rim highlight
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = alpha * 0.3;
      const rimGrad = ctx.createRadialGradient(w/2, h * 0.2, 0, w/2, h * 0.3, w * 0.5);
      rimGrad.addColorStop(0, '#ffeecc');
      rimGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = rimGrad;
      ctx.fillRect(0, 0, w, h);
      break;
      
    case 'Practical Lights':
      // Warm interior lighting with pools of light
      ctx.globalCompositeOperation = 'soft-light';
      ctx.globalAlpha = alpha * 0.2;
      ctx.fillStyle = '#ffcc88';
      ctx.fillRect(0, 0, w, h);
      // Add warm spots
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = alpha * 0.1;
      const practGrad = ctx.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, w * 0.3);
      practGrad.addColorStop(0, '#ffdd99');
      practGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = practGrad;
      ctx.fillRect(0, 0, w, h);
      break;
  }
  ctx.restore();
}

// === LENS DISTORTION OVERLAY ===
function applyLensOverlay(ctx, w, h, lens) {
  ctx.save();
  
  const lensData = LENS_DATA[lens] || {};
  
  // === FISHEYE / GOPRO BARREL DISTORTION ===
  if (lensData.type === 'fisheye') {
    // Visual barrel distortion guide lines
    ctx.strokeStyle = 'rgba(204, 51, 51, 0.3)';
    ctx.lineWidth = 1;
    
    const distortion = lensData.distortion || 0.3;
    const bulge = h * distortion * 0.15;
    
    // Top curve (bulging inward)
    ctx.beginPath();
    ctx.moveTo(0, h * 0.08);
    ctx.bezierCurveTo(w * 0.25, h * 0.08 + bulge, w * 0.75, h * 0.08 + bulge, w, h * 0.08);
    ctx.stroke();
    
    // Bottom curve
    ctx.beginPath();
    ctx.moveTo(0, h * 0.92);
    ctx.bezierCurveTo(w * 0.25, h * 0.92 - bulge, w * 0.75, h * 0.92 - bulge, w, h * 0.92);
    ctx.stroke();
    
    // Left curve
    ctx.beginPath();
    ctx.moveTo(w * 0.08, 0);
    ctx.bezierCurveTo(w * 0.08 + bulge, h * 0.25, w * 0.08 + bulge, h * 0.75, w * 0.08, h);
    ctx.stroke();
    
    // Right curve
    ctx.beginPath();
    ctx.moveTo(w * 0.92, 0);
    ctx.bezierCurveTo(w * 0.92 - bulge, h * 0.25, w * 0.92 - bulge, h * 0.75, w * 0.92, h);
    ctx.stroke();
    
    // Corner vignette for fisheye
    const cornerGrad = ctx.createRadialGradient(w/2, h/2, Math.min(w,h) * 0.3, w/2, h/2, Math.min(w,h) * 0.7);
    cornerGrad.addColorStop(0, 'transparent');
    cornerGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = cornerGrad;
    ctx.fillRect(0, 0, w, h);
  }
  
  // Anamorphic guides and flares now handled by master renderer optics engine
  
  // === STANDARD WIDE ANGLE ===
  else if (lens.includes('15mm') || lens.includes('24mm')) {
    ctx.strokeStyle = 'rgba(204, 51, 51, 0.25)';
    ctx.lineWidth = 1;
    // Wide angle barrel distortion hint
    ctx.beginPath();
    ctx.moveTo(0, h * 0.12);
    ctx.quadraticCurveTo(w * 0.5, h * 0.08, w, h * 0.12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, h * 0.88);
    ctx.quadraticCurveTo(w * 0.5, h * 0.92, w, h * 0.88);
    ctx.stroke();
  } 
  
  // === TELEPHOTO ===
  else if (lens.includes('85mm') || lens.includes('135mm')) {
    ctx.strokeStyle = 'rgba(204, 51, 51, 0.25)';
    ctx.lineWidth = 1;
    // Telephoto compression ring
    ctx.beginPath();
    ctx.arc(w/2, h/2, Math.min(w, h) * 0.4, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  ctx.restore();
}

// === ATMOSPHERIC HAZE LAYER ===
function applyAtmosphericHaze(ctx, w, h, hazeAmount, hazeColor, distanceFactor = 1.0) {
  if (!hazeAmount || hazeAmount <= 0) return;
  
  ctx.save();
  
  // Haze colors based on mood
  let hazeRGB;
  switch(hazeColor) {
    case 'warm': hazeRGB = '180, 160, 140'; break;  // Warm smoke/dust
    case 'cool': hazeRGB = '160, 180, 200'; break;  // Cool morning mist
    default: hazeRGB = '170, 170, 175'; break;      // Neutral fog
  }
  
  const alpha = (hazeAmount / 100) * 0.4 * distanceFactor;
  
  // Gradient from bottom (less haze near character) to top (more haze in distance)
  const hazeGrad = ctx.createLinearGradient(0, h, 0, 0);
  hazeGrad.addColorStop(0, `rgba(${hazeRGB}, ${alpha * 0.3})`);
  hazeGrad.addColorStop(0.5, `rgba(${hazeRGB}, ${alpha * 0.7})`);
  hazeGrad.addColorStop(1, `rgba(${hazeRGB}, ${alpha})`);
  
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, 0, w, h);
  
  ctx.restore();
}

// === SKETCH MODE RENDERER ===
function renderSketchMode(ctx, img, w, h, dx, dy, drawW, drawH) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
  
  tCtx.fillStyle = '#0a0a0c';
  tCtx.fillRect(0, 0, w, h);
  tCtx.drawImage(img, dx, dy, drawW, drawH);
  
  const imageData = tCtx.getImageData(0, 0, w, h);
  const pixels = imageData.data;
  const output = ctx.createImageData(w, h);
  const out = output.data;
  
  // Edge detection with background suppression
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
      
      // Check if this is gray background
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      const bright = (r + g + b) / 3;
      
      if (sat < 0.12 && bright > 80 && bright < 200) {
        // Gray background - make dark
        out[i] = out[i+1] = out[i+2] = 10;
        out[i+3] = 255;
        continue;
      }
      
      // Edge detection
      const getL = (ox, oy) => {
        const idx = ((y + oy) * w + (x + ox)) * 4;
        return (pixels[idx] * 0.299 + pixels[idx+1] * 0.587 + pixels[idx+2] * 0.114);
      };
      
      const val = Math.abs(getL(1, 0) - getL(-1, 0)) + Math.abs(getL(0, 1) - getL(0, -1));
      const edge = val > 30 ? 255 : 0;
      out[i] = out[i+1] = out[i+2] = edge;
      out[i+3] = 255;
    }
  }
  ctx.putImageData(output, 0, 0);
}

// === SEAMLESS OPTICAL DEPTH ENGINE ===
// drawBackgroundWithSimpleDOF moved to renderer.js (Master version with fixed tilt)

// === PERSPECTIVE CHARACTER RENDERING ===
function drawPinchCharacter(ctx, img, x, y, w, h, topP, botP) {
    const steps = 20; 
    const sourceW = img.width;
    const sourceH = img.height;
    const stepH = sourceH / steps;
    
    for (let i = 0; i < steps; i++) {
        const sy = i * stepH;
        const progress = i / steps;
        const currentP = topP + (botP - topP) * progress;
        
        const nextSy = (i + 1) * stepH;
        const nextProgress = (i + 1) / steps;
        const nextP = topP + (botP - topP) * nextProgress;
        
        const p0 = { x: (1 - currentP) * w / 2, y: progress * h };
        const p1 = { x: w - (1 - currentP) * w / 2, y: progress * h };
        const p2 = { x: w - (1 - nextP) * w / 2, y: (progress + 1/steps) * h };
        const p3 = { x: (1 - nextP) * w / 2, y: (progress + 1/steps) * h };
        
        const destW = p1.x - p0.x + 1; 
        const destH = p2.y - p0.y + 1;
        ctx.drawImage(img, 0, sy, sourceW, stepH, x + p0.x, y + p0.y, destW, destH);
    }
}

// === OPTICS & OVERLAYS ===
// drawAnamorphicFlare moved to renderer.js for advanced optics

// === STATUS BADGES ===
function drawBadges(ctx, w, h, frameType) {
  let badgeY = 4;
  
  if (S.sceneAnalyzed) {
    ctx.fillStyle = 'rgba(42, 157, 74, 0.9)';
    ctx.fillRect(4, badgeY, 45, 13);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 7px JetBrains Mono';
    ctx.fillText('✓ AI', 8, badgeY + 10);
    badgeY += 16;
  }
  
  if (S.backgroundPlate) {
    ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
    ctx.fillRect(4, badgeY, 55, 13);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 7px JetBrains Mono';
    ctx.fillText('🎬 SCENE', 8, badgeY + 10);
  }
  
  // Frame type indicator
  if (frameType) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(w - 50, h - 16, 46, 13);
    ctx.fillStyle = frameType === 'start' ? '#2a9d4a' : '#c33';
    ctx.font = 'bold 7px JetBrains Mono';
    ctx.fillText(frameType === 'start' ? 'START' : 'END', w - 46, h - 6);
  }
}


// Helper: Get blur amount based on aperture
function getBlurAmount(dof) {
  if (dof.includes('f/1.4')) return 14;
  if (dof.includes('f/2.0')) return 10;
  if (dof.includes('f/2.8')) return 6;
  if (dof.includes('f/4.0')) return 4;
  if (dof.includes('f/5.6')) return 2;
  return 0;
}

function drawOverlays(ctx, w, h) {
  ctx.save();
  
  if (S.showRuleOfThirds) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(w * i / 3, 0);
      ctx.lineTo(w * i / 3, h);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, h * i / 3);
      ctx.lineTo(w, h * i / 3);
      ctx.stroke();
    }
    
    ctx.fillStyle = 'rgba(204, 51, 51, 0.6)';
    for (let i = 1; i <= 2; i++) {
      for (let j = 1; j <= 2; j++) {
        ctx.beginPath();
        ctx.arc(w * i / 3, h * j / 3, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  if (S.showSafeAreas) {
    ctx.setLineDash([2, 2]);
    ctx.strokeStyle = 'rgba(255, 200, 0, 0.5)';
    const titleInset = 0.1;
    ctx.strokeRect(w * titleInset, h * titleInset, w * (1 - 2*titleInset), h * (1 - 2*titleInset));
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.5)';
    const actionInset = 0.035;
    ctx.strokeRect(w * actionInset, h * actionInset, w * (1 - 2*actionInset), h * (1 - 2*actionInset));
  }
  
  if (S.showCenterCrosshair) {
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    const cx = w / 2, cy = h / 2;
    const size = Math.min(w, h) * 0.05;
    ctx.beginPath();
    ctx.moveTo(cx - size, cy);
    ctx.lineTo(cx + size, cy);
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx, cy + size);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.6, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // GROUND PLANE & VANISHING POINT VISUALIZATION
  if (S.showGroundPlane) {
    const horizonY = h * S.horizonY;
    const groundY = h * S.groundPlaneY;
    const vanishX = w / 2;
    
    // Horizon line (cyan, solid)
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(w, horizonY);
    ctx.stroke();
    
    // Horizon label
    ctx.fillStyle = 'rgba(0, 200, 255, 0.9)';
    ctx.font = '9px JetBrains Mono';
    ctx.fillText('HORIZON', 8, horizonY - 5);
    
    // Vanishing point marker
    ctx.beginPath();
    ctx.arc(vanishX, horizonY, 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 100, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(vanishX, horizonY, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 100, 0, 0.8)';
    ctx.fill();
    
    // Ground plane line (green, dashed)
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgba(50, 205, 50, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.stroke();
    
    // Ground label
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(50, 205, 50, 0.9)';
    ctx.fillText('GROUND PLANE', 8, groundY - 5);
    
    // Perspective grid lines from vanishing point to ground corners
    ctx.setLineDash([3, 6]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    
    // Lines radiating from vanishing point
    const gridLines = 7;
    for (let i = 0; i <= gridLines; i++) {
      const t = i / gridLines;
      const groundX = w * t;
      ctx.beginPath();
      ctx.moveTo(vanishX, horizonY);
      ctx.lineTo(groundX, h);
      ctx.stroke();
    }
    
    // Horizontal depth lines (receding into distance)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    const depthLines = 5;
    for (let i = 1; i <= depthLines; i++) {
      const t = i / (depthLines + 1);
      const lineY = horizonY + (groundY - horizonY) * t;
      // Calculate perspective narrowing
      const perspectiveScale = 1 - (t * 0.3);
      const leftX = vanishX - (w * 0.5 * perspectiveScale);
      const rightX = vanishX + (w * 0.5 * perspectiveScale);
      ctx.beginPath();
      ctx.moveTo(leftX, lineY);
      ctx.lineTo(rightX, lineY);
      ctx.stroke();
    }
    
    // Character anchor point indicator
    const charAnchorY = groundY;
    const charAnchorX = vanishX;
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(204, 51, 51, 0.8)';
    ctx.beginPath();
    ctx.moveTo(charAnchorX, charAnchorY);
    ctx.lineTo(charAnchorX - 8, charAnchorY + 12);
    ctx.lineTo(charAnchorX + 8, charAnchorY + 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(204, 51, 51, 0.9)';
    ctx.font = '8px JetBrains Mono';
    ctx.fillText('▲ FEET ANCHOR', charAnchorX + 12, charAnchorY + 5);
  }
  
  // === CAMERA ANGLE INDICATOR ===
  // Shows camera height/angle with visual cues
  const curAngle = S.angle;
  if (curAngle && curAngle !== 'Eye Level') {
    ctx.setLineDash([]);
    ctx.font = 'bold 10px JetBrains Mono';
    
    // Camera position indicator (bottom right)
    const indicatorX = w - 80;
    const indicatorY = h - 40;
    const indicatorH = 30;
    
    // Draw camera angle indicator box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(indicatorX - 5, indicatorY - indicatorH - 5, 85, indicatorH + 30);
    
    // Draw camera icon at appropriate height
    let cameraY, subjectY, arrowDir;
    if (curAngle === "Worm's Eye") {
      cameraY = indicatorY;
      subjectY = indicatorY - indicatorH;
      arrowDir = '↗';
      ctx.fillStyle = 'rgba(255, 150, 50, 0.9)';
    } else if (curAngle === "Low Angle Hero") {
      cameraY = indicatorY - indicatorH * 0.3;
      subjectY = indicatorY - indicatorH * 0.7;
      arrowDir = '↗';
      ctx.fillStyle = 'rgba(255, 200, 50, 0.9)';
    } else if (curAngle === "High Angle") {
      cameraY = indicatorY - indicatorH * 0.7;
      subjectY = indicatorY - indicatorH * 0.3;
      arrowDir = '↘';
      ctx.fillStyle = 'rgba(100, 200, 255, 0.9)';
    } else if (curAngle === "Bird's Eye") {
      cameraY = indicatorY - indicatorH;
      subjectY = indicatorY;
      arrowDir = '↓';
      ctx.fillStyle = 'rgba(50, 150, 255, 0.9)';
    } else if (curAngle === "Dutch Tilt") {
      cameraY = indicatorY - indicatorH * 0.5;
      subjectY = indicatorY - indicatorH * 0.5;
      arrowDir = '↺';
      ctx.fillStyle = 'rgba(200, 100, 255, 0.9)';
    }
    
    // Draw subject (person icon)
    ctx.fillText('🧍', indicatorX + 30, subjectY + 5);
    
    // Draw camera icon
    ctx.fillText('📷', indicatorX, cameraY + 5);
    
    // Draw arrow showing camera direction
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(arrowDir, indicatorX + 15, (cameraY + subjectY) / 2 + 5);
    
    // Label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '7px JetBrains Mono';
    ctx.fillText(curAngle.toUpperCase(), indicatorX, indicatorY + 15);
    
    // === PERSPECTIVE CONVERGENCE LINES ===
    // Show where verticals converge based on camera angle
    ctx.setLineDash([4, 8]);
    ctx.lineWidth = 1;
    
    if (curAngle === "Worm's Eye") {
      // Verticals converge UPWARD (vanishing point above frame)
      ctx.strokeStyle = 'rgba(255, 150, 50, 0.3)';
      const vanishY = -h * 0.5; // Above frame
      const vanishX = w / 2;
      // Left edge converging up
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h);
      ctx.lineTo(vanishX, vanishY);
      ctx.stroke();
      // Right edge converging up
      ctx.beginPath();
      ctx.moveTo(w * 0.85, h);
      ctx.lineTo(vanishX, vanishY);
      ctx.stroke();
    } else if (curAngle === "Bird's Eye") {
      // Verticals converge DOWNWARD (vanishing point below frame)
      ctx.strokeStyle = 'rgba(50, 150, 255, 0.3)';
      const vanishY = h * 1.5; // Below frame
      const vanishX = w / 2;
      // Left edge converging down
      ctx.beginPath();
      ctx.moveTo(w * 0.15, 0);
      ctx.lineTo(vanishX, vanishY);
      ctx.stroke();
      // Right edge converging down
      ctx.beginPath();
      ctx.moveTo(w * 0.85, 0);
      ctx.lineTo(vanishX, vanishY);
      ctx.stroke();
    } else if (curAngle === "Low Angle Hero") {
      // Subtle upward convergence
      ctx.strokeStyle = 'rgba(255, 200, 50, 0.2)';
      const vanishY = -h * 0.3;
      const vanishX = w / 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h);
      ctx.lineTo(vanishX, vanishY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.8, h);
      ctx.lineTo(vanishX, vanishY);
      ctx.stroke();
    } else if (curAngle === "High Angle") {
      // Subtle downward convergence
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.2)';
      const vanishY = h * 1.3;
      const vanishX = w / 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.2, 0);
      ctx.lineTo(vanishX, vanishY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.8, 0);
      ctx.lineTo(vanishX, vanishY);
      ctx.stroke();
    }
  }
  
  ctx.restore();
}
  

function renderFrames() {
  if (!S.heroImage) return;
  
  S.transformedStartFrame = null;
  S.transformedEndFrame = null;
  
  requestAnimationFrame(() => {
    const startCanvas = document.getElementById('startCanvas');
    const endCanvas = document.getElementById('endCanvas');
    
    const startSettings = { ...S, frameType: 'start' };
    applyEffect(startCanvas, S.heroImage, startSettings);
    
    const endSettings = { ...S, frameType: 'end' };
    const movementConfig = MOVEMENT_CONFIG[S.movement] || { type: 'linear' };
    const sliderValue = S.movementIntensity;
    
    let intensity;
    if (movementConfig.type === 'bidirectional') {
      intensity = (sliderValue - 50) / 50; 
    } else {
      intensity = sliderValue / 100; 
    }
    
    endSettings.bgScale = 1.0;
    endSettings.charScale = 1.0;
    // We start with the drift offsets already in S
    endSettings.bgPanOffset = S.bgPanOffset || 0;
    endSettings.charPanOffset = S.charPanOffset || 0;
    endSettings.bgTiltOffset = S.bgTiltOffset || 0;
    endSettings.charTiltOffset = S.charTiltOffset || 0;

    switch(S.movement) {
      case 'Dolly Push In':
        endSettings.bgScale = 1.0 + (0.15 * intensity); 
        endSettings.charScale = 1.0 + (0.40 * intensity);
        break;
      case 'Dolly Pull Out':
        endSettings.bgScale = 1.0 - (0.25 * intensity);
        endSettings.charScale = 1.0 - (0.45 * intensity); 
        break;
      case 'Pan Left/Right':
        endSettings.bgPanOffset += 0.15 * intensity;
        break;
      case 'Tilt Up/Down':
        endSettings.bgTiltOffset += 0.15 * intensity;
        break;
      case 'Crane Up':
        endSettings.bgTiltOffset = 0.25 * intensity;
        endSettings.charScale = 1.0; 
        break;
      case 'Zoom In':
        endSettings.bgScale = 1.0 + (0.50 * intensity);
        endSettings.charScale = 1.0 + (0.50 * intensity);
        break;
      case 'Dolly Zoom':
        endSettings.bgScale = 1.0 + (0.60 * intensity);
        endSettings.charScale = 1.0; 
        break;
      case 'Handheld':
        endSettings.handheldIntensity = intensity;
        break;
      case 'Snorricam':
        endSettings.snorricam = true;
        endSettings.snorricamIntensity = intensity;
        // 🔥 TUNED: Reduced from 0.08/0.05 to 0.025/0.018 for subtler body-cam feel
        const shakeX = (Math.random() - 0.5) * 0.025 * intensity;
        const shakeY = (Math.random() - 0.5) * 0.018 * intensity;
        endSettings.bgPanOffset = shakeX;
        endSettings.bgTiltOffset = shakeY;
        endSettings.bgScale = 1.0 + (Math.random() * 0.015 * intensity);
        break;
      case 'Dutch Roll':
        const rollAngle = 25 * intensity; // Increased for better visual feedback
        endSettings.dutchAngle = rollAngle;
        endSettings.skewX = 0.1 * intensity;
        break;
    }
    
    if (S.angle === 'Dutch Tilt') {
      const dutchIntensity = sliderValue / 100;
      endSettings.dutchAngle = 22 * dutchIntensity;
    }

    applyEffect(endCanvas, S.heroImage, endSettings);
  });
}

// 🔥 NEW: LIVE MOTION ENGINE
// Continuously updates the preview at 30fps to show breathing/flares
let isAnimating = false;
function startMotionEngine() {
    if (isAnimating) return;
    isAnimating = true;
    
    function loop() {
        if (!isAnimating) return;
        
        if (document.visibilityState === 'visible') {
            // 🔥 NEW: HANDHELD & MICRO-DRIFT ENGINE
            // If Handheld or Snorricam is active, we add organic low-frequency drift
            if (S.movement === 'Handheld' || S.movement === 'Snorricam') {
                const t = Date.now() / 1000;
                const intensity = (S.movementIntensity / 100);
                
                // Low-frequency organic drift (Perlin-style approximation)
                const driftX = (Math.sin(t * 0.8) * 0.15 + Math.sin(t * 0.3) * 0.1) * intensity * 0.05;
                const driftY = (Math.cos(t * 0.7) * 0.12 + Math.sin(t * 0.4) * 0.08) * intensity * 0.05;
                
                // Background drifts slightly
                S.bgPanOffset = driftX;
                S.bgTiltOffset = driftY;
                
                // Subject drifts 50% more than background to create parallax separation
                S.charPanOffset = driftX * 1.5;
                S.charTiltOffset = driftY * 1.5;
            } else {
                // Clear drift if not in handheld/snorricam
                S.bgPanOffset = 0;
                S.bgTiltOffset = 0;
                S.charPanOffset = 0;
                S.charTiltOffset = 0;
            }

            renderFrames();
        }
        
        requestAnimationFrame(loop);
    }
    
    requestAnimationFrame(loop);
}

// Initialize the motion engine
setTimeout(startMotionEngine, 1000);

function clearCanvases() {
  ['startCanvas', 'endCanvas'].forEach(id => {
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 150;
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });
}


// ═══════════════════════════════════════════════════════════════════════════
// RESIZABLE PANELS
// ═══════════════════════════════════════════════════════════════════════════
let resizing = null;

function startResize(e, panelId, dimension, edge = 'right') {
  e.preventDefault();
  resizing = { panelId, dimension, edge, startX: e.clientX, startY: e.clientY };
  const panel = document.getElementById(panelId);
  resizing.startWidth = panel.offsetWidth;
  resizing.startHeight = panel.offsetHeight;
  document.addEventListener('mousemove', doResize);
  document.addEventListener('mouseup', stopResize);
  document.body.style.cursor = dimension === 'width' ? 'ew-resize' : 'ns-resize';
  document.body.style.userSelect = 'none';
}

function doResize(e) {
  if (!resizing) return;
  const panel = document.getElementById(resizing.panelId);
  if (resizing.dimension === 'width') {
    let diff = e.clientX - resizing.startX;
    // Invert for left-edge resize (dragging left = wider)
    if (resizing.edge === 'left') diff = -diff;
    const newWidth = Math.max(150, Math.min(500, resizing.startWidth + diff));
    panel.style.width = newWidth + 'px';
  } else {
    const diff = e.clientY - resizing.startY;
    const newHeight = Math.max(120, Math.min(500, resizing.startHeight + diff));
    panel.style.height = newHeight + 'px';
  }
  // Trigger canvas resize
  renderFrames();
}

function stopResize() {
  if (resizing) {
    saveLayout();
    resizing = null;
  }
  document.removeEventListener('mousemove', doResize);
  document.removeEventListener('mouseup', stopResize);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
}

function toggleSection(header) {
  header.classList.toggle('collapsed');
  saveLayout();
}

function saveLayout() {
  const layout = {
    inputWidth: document.getElementById('inputPanel')?.offsetWidth,
    topSectionHeight: document.getElementById('topSection')?.offsetHeight,
    controlsWidth: document.getElementById('controlsPanel')?.offsetWidth,
    collapsedSections: []
  };
  document.querySelectorAll('.section-header.collapsed').forEach(h => {
    layout.collapsedSections.push(h.parentElement.id);
  });
  localStorage.setItem('acam-layout', JSON.stringify(layout));
}

function loadLayout() {
  try {
    const saved = localStorage.getItem('acam-layout');
    if (!saved) return;
    const layout = JSON.parse(saved);
    if (layout.inputWidth) {
      document.getElementById('inputPanel').style.width = layout.inputWidth + 'px';
    }
    if (layout.topSectionHeight) {
      document.getElementById('topSection').style.height = layout.topSectionHeight + 'px';
    }
    if (layout.controlsWidth) {
      document.getElementById('controlsPanel').style.width = layout.controlsWidth + 'px';
    }
    if (layout.collapsedSections) {
      layout.collapsedSections.forEach(id => {
        const panel = document.getElementById(id);
        if (panel) {
          const header = panel.querySelector('.section-header');
          if (header) header.classList.add('collapsed');
        }
      });
    }
  } catch (e) {
    console.log('Layout load error:', e);
  }
}

function resetLayout() {
  localStorage.removeItem('acam-layout');
  document.getElementById('inputPanel').style.width = '220px';
  document.getElementById('topSection').style.height = '240px';
  document.getElementById('controlsPanel').style.width = '280px';
  document.querySelectorAll('.section-header.collapsed').forEach(h => {
    h.classList.remove('collapsed');
  });
  showToast('Layout reset');
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 1: CUSTOM PRESET ENGINE (MEMORY LOGIC)
// ═══════════════════════════════════════════════════════════════════════════
// 1. Declare the memory array FIRST
let customPresets = [];

function loadCustomPresets() {
  const saved = localStorage.getItem('acam_custom_presets');
  if (saved) {
    try {
      customPresets = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load custom presets:", e);
      customPresets = [];
    }
  }
}

function saveCurrentPreset() {
  const name = prompt("Name your custom Director Move:", "My Epic Shot");
  if (!name) return;
  
  const emoji = prompt("Assign an emoji icon:", "🎬");
  
  const newPreset = {
    name: name,
    icon: emoji || "🎬",
    params: {
      lens: S.lens,
      angle: S.angle,
      movement: S.movement,
      movementIntensity: S.movementIntensity,
      dof: S.dof,
      lighting: S.lighting,
      isIndoor: S.isIndoor,
      timeOfDay: S.timeOfDay,
      desc: `User Preset: ${name}`
    }
  };
  
  customPresets.push(newPreset);
  localStorage.setItem('acam_custom_presets', JSON.stringify(customPresets));
  showToast(`"${name}" saved to Director's Moves!`);
  renderStoryboard(); 
}

function deleteCustomPreset(index, event) {
  event.stopPropagation();
  if (confirm("Delete this custom preset?")) {
    customPresets.splice(index, 1);
    localStorage.setItem('acam_custom_presets', JSON.stringify(customPresets));
    renderStoryboard();
  }
}

// === PWA INSTALLATION & FILE HANDLING ===

// 1. Register the Service Worker (Allows the "Install App" button to appear)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(err => console.log('SW registration failed:', err));
}

// 2. Catch double-clicked .acam files from the Windows/Mac Operating System
if ('launchQueue' in window) {
  window.launchQueue.setConsumer(async (launchParams) => {
    if (!launchParams.files.length) return;
    
    for (const fileHandle of launchParams.files) {
      const file = await fileHandle.getFile();
      const text = await file.text();
      
      try {
        const packData = JSON.parse(text);
        
        // Grab the existing packs using your specific key
        let customPresets = JSON.parse(localStorage.getItem('acam_custom_presets') || '[]');
        
        // Prevent importing the exact same pack twice
        if (!customPresets.some(p => p.packName === packData.packName)) {
            customPresets.push(packData);
            
            // Save it back using your specific key
            localStorage.setItem('acam_custom_presets', JSON.stringify(customPresets));
        }
        
        showToast(`Loaded ${packData.packName} Pack!`);
        
        // Refresh the UI so the new moves show up instantly
        loadCustomPresets(); 
        
      } catch (e) {
        console.error("Error parsing .acam file:", e);
        showToast("Invalid Director Pack file.");
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 2: PACK INSTALLER (DROPZONE LOGIC)
// ═══════════════════════════════════════════════════════════════════════════
function initDropzone() {
  const panel = document.getElementById('storyboardPanel');
  if (!panel) return;

  panel.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    panel.classList.add('drag-over');
  });

  panel.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    panel.classList.remove('drag-over');
  });

  panel.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    panel.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (!file) return;

    // Check if it's our custom file type (or json for testing)
    if (!file.name.endsWith('.acam') && !file.name.endsWith('.json')) {
      showToast("❌ Invalid file. Please drop an .acam pack.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const packData = JSON.parse(event.target.result);
        installPack(packData);
      } catch (error) {
        console.warn("Analysis glitch (503): Falling back to defaults.");
        // Non-blocking fallback
        return { analyzed: false, outfit: 'Casual everyday attire' };
    }
    };
    reader.readAsText(file);
  });
}

// Add a listener or a specific function to handle the High-Res Character Sheet
function handleMasterSheetUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        S.masterCharacterSheet = e.target.result; // Store the high-res "Bible"
        showToast("Master Identity Locked: High-Fidelity Active");
    };
    reader.readAsDataURL(file);
}

function handlePackUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Basic validation
  if (!file.name.endsWith('.acam') && !file.name.endsWith('.json')) {
    showToast("❌ Invalid file. Please select an .acam or .json pack.");
    e.target.value = ''; // Reset input
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const packData = JSON.parse(event.target.result);
      installPack(packData); // Uses the exact same engine as the dropzone!
    } catch (err) {
      console.error("Pack parsing error:", err);
      showToast("❌ Corrupted pack file.");
    }
    e.target.value = ''; // Reset input so you can load the same file again if needed
  };
  reader.readAsText(file);
}

function installPack(packData) {
  if (!packData.presets) {
    showToast("❌ Invalid pack structure.");
    return;
  }

  let installedCount = 0;
  
  // Handle both array format (new) and object format (legacy)
  const presetList = Array.isArray(packData.presets) 
    ? packData.presets 
    : Object.entries(packData.presets).map(([name, data]) => ({ name, ...data }));

  presetList.forEach((preset) => {
    const name = preset.name;
    if (!name) return;
    
    // Check if we already have a preset with this name to avoid duplicates
    const exists = customPresets.some(p => p.name === name);
    if (!exists) {
      customPresets.push({
        name: name,
        icon: preset.icon || "🎬",
        params: {
          lens: preset.lens,
          angle: preset.angle,
          movement: preset.movement,
          movementIntensity: preset.movementIntensity || 50,
          dof: preset.dof,
          lighting: preset.lighting,
          lightingIntensity: preset.lightingIntensity || 70,
          isIndoor: preset.isIndoor !== undefined ? preset.isIndoor : true,
          timeOfDay: preset.timeOfDay !== undefined ? preset.timeOfDay : 12,
          shutterSpeed: preset.shutterSpeed || 'Standard',
          filmStock: preset.filmStock || 'Clean Digital',
          desc: preset.description || preset.desc || "Imported Move"
        }
      });
      installedCount++;
    }
  });

  if (installedCount > 0) {
    localStorage.setItem('acam_custom_presets', JSON.stringify(customPresets));
    renderStoryboard();
    const packInfo = packData.packAuthor ? ` by ${packData.packAuthor}` : '';
    showToast(`📦 Installed ${installedCount} moves from "${packData.packName}"${packInfo}`);
  } else {
    showToast("ℹ️ All moves in this pack are already installed.");
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 3: THE PACKAGER (EXPORT LOGIC WITH "SAVE AS" DIALOG)
// ═══════════════════════════════════════════════════════════════════════════
async function exportCustomPack() {
  if (customPresets.length === 0) {
    showToast("⚠️ You don't have any custom moves to export yet!");
    return;
  }

  // Gather metadata for the product
  const packName = prompt("Name your Director Pack (e.g., The Sci-Fi Masterclass):", "My Custom Pack");
  if (!packName) return; // User cancelled

  const authorName = prompt("Enter the Author/Creator name:", "IN-NO-V8");
  if (!authorName) return;

  const packDesc = prompt("Brief description of this pack:", "Custom cinematography moves for A-CAM");
  
  // Reformat presets into array format
  const formattedPresets = customPresets.map(preset => ({
    name: preset.name,
    icon: preset.icon || "🎬",
    description: preset.params.desc || `Custom move: ${preset.name}`,
    lens: preset.params.lens || "50mm Normal",
    angle: preset.params.angle || "Eye Level",
    movement: preset.params.movement || "Static Lock",
    movementIntensity: preset.params.movementIntensity || 50,
    dof: preset.params.dof || "f/4.0 Balanced",
    lighting: preset.params.lighting || "Natural Ambient",
    lightingIntensity: preset.params.lightingIntensity || 70,
    shutterSpeed: preset.params.shutterSpeed || "Standard",
    filmStock: preset.params.filmStock || "Clean Digital"
  }));

  // Construct the final .acam cartridge in new format
  const acamCartridge = {
    packName: packName,
    packVersion: "1.0",
    packAuthor: authorName,
    packDescription: packDesc || "",
    presets: formattedPresets
  };

  const dataStr = JSON.stringify(acamCartridge, null, 2);
  const safeFileName = packName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.acam';

  // MODERN METHOD: Try the File System Access API (Forces "Save As" Dialog)
  try {
    if ('showSaveFilePicker' in window) {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: safeFileName,
        types: [{
          description: 'A-CAM Director Pack',
          accept: { 'application/json': ['.acam', '.json'] },
        }],
      });
      // Create a writable stream to the file and write the JSON
      const writable = await fileHandle.createWritable();
      await writable.write(dataStr);
      await writable.close();
      showToast(`📦 Pack "${packName}" saved successfully!`);
      return; // Exit early since it worked
    }
  } catch (err) {
    // If the user simply clicked "Cancel" on the Save dialog, silently abort.
    if (err.name === 'AbortError') return;
    console.warn("File System API failed, falling back to standard download.", err);
  }

  // FALLBACK METHOD: Standard ghost link download for older browsers
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFileName;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`📦 Pack "${packName}" exported successfully!`);
}

// ═══════════════════════════════════════════════════════════════════════════
// UI RENDERERS (Clean Unified Version)
// ═══════════════════════════════════════════════════════════════════════════
// 2. Define the renderers SECOND
function renderStoryboard() {
  const grid = document.getElementById('storyboardGrid');
  if (!grid) return;
  let html = '';
  
  // Render Factory Presets
  Object.entries(DIRECTOR_PRESETS).forEach(([name, preset]) => {
    const isActive = S.activePreset === name;
    html += `
      <div class="director-preset ${isActive ? 'active' : ''}" onclick="applyDirectorPreset('${name}')">
        <div class="preset-icon">${preset.icon}</div>
        <div class="preset-name">${name}</div>
        <div class="preset-desc">${preset.desc}</div>
      </div>
    `;
  });

  // Render Custom Saved Presets
  customPresets.forEach((preset, index) => {
    const isActive = S.activePreset === preset.name;
    html += `
      <div class="director-preset ${isActive ? 'active' : ''}" style="border-style: dashed;" onclick="applyDirectorPreset('${preset.name}', true)">
        <div class="preset-icon">${preset.icon}</div>
        <div class="preset-name">${preset.name}</div>
        <div class="preset-desc">CUSTOM</div>
        <div onclick="deleteCustomPreset(${index}, event)" style="position:absolute;top:2px;right:5px;color:#444;font-size:10px;">×</div>
      </div>
    `;
  });
  
  grid.innerHTML = html;
}

function applyDirectorPreset(name, isCustom = false) {
  S.activePreset = name;
  
  let data;
  if (isCustom) {
      const presetData = customPresets.find(p => p.name === name);
      data = presetData ? presetData.params : null;
  } else {
      data = DIRECTOR_PRESETS[name];
  }
  
  if (!data) return;
  
  if (data.lens) {
    S.lens = data.lens;
    document.getElementById('lensSelect').value = data.lens;
    document.getElementById('lensValue').textContent = data.lens.split(' ')[0];
  }
  if (data.angle) {
    S.angle = data.angle;
    document.getElementById('angleSelect').value = data.angle;
    document.getElementById('angleValue').textContent = data.angle.split(' ')[0];
  }
  if (data.movement) {
    S.movement = data.movement;
    document.getElementById('movementSelect').value = data.movement;
    document.getElementById('movementValue').textContent = data.movement.split(' ')[0];
  }
  if (data.movementIntensity !== undefined) {
    S.movementIntensity = data.movementIntensity;
    document.getElementById('movementIntensity').value = data.movementIntensity;
  }
  if (data.dof) {
    S.dof = data.dof;
    document.getElementById('dofSelect').value = data.dof;
    document.getElementById('dofValue').textContent = data.dof.split(' ')[0];
  }
  if (data.lighting) {
    S.lighting = data.lighting;
    document.getElementById('lightingSelect').value = data.lighting;
    document.getElementById('lightingValue').textContent = data.lighting.split(' ')[0];
  }
  if (data.shutterSpeed) {
    S.shutterSpeed = data.shutterSpeed;
    document.getElementById('shutterValue').textContent = data.shutterSpeed;
    document.querySelectorAll('.shutter-chip').forEach(btn => {
      btn.classList.toggle('active', btn.id === 'shutter' + data.shutterSpeed);
    });
  }
  if (data.filmStock) {
    S.filmStock = data.filmStock;
    document.getElementById('filmSelect')?.setAttribute('value', data.filmStock); // Fallback if select exists
    if (document.getElementById('filmStockSelect')) {
        document.getElementById('filmStockSelect').value = data.filmStock;
    }
    document.getElementById('filmStockValue').textContent = data.filmStock;
  }
  
  renderStoryboard();
  renderFrames();
  generatePrompt();
  showToast(isCustom ? `Applied Custom: ${name}` : `${data.icon} ${name}: ${data.desc}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// UI INTERACTIONS: HELP MODAL
// ═══════════════════════════════════════════════════════════════════════════
const charHelpBtn = document.getElementById('charHelpBtn');
const charHelpModal = document.getElementById('charHelpModal');
const closeCharHelp = document.getElementById('closeCharHelp');

if (charHelpBtn && charHelpModal && closeCharHelp) {
    // Open modal
    charHelpBtn.addEventListener('click', () => {
        charHelpModal.classList.add('active');
    });

    // Close on X click
    closeCharHelp.addEventListener('click', () => {
        charHelpModal.classList.remove('active');
    });

    // Close on background click
    charHelpModal.addEventListener('click', (e) => {
        if (e.target === charHelpModal) {
            charHelpModal.classList.remove('active');
        }
    });
}

/**
 * Perspective Engine: Slices the character to create 2.5D depth
 */
function drawPinchCharacter(ctx, img, x, y, w, h, topFactor, bottomFactor) {
    const numSlices = Math.ceil(h);
    for (let i = 0; i < numSlices; i++) {
        const percent = i / numSlices;
        const currentScale = topFactor + (bottomFactor - topFactor) * percent;
        const sliceW = w * currentScale;
        const sliceX = x + (w - sliceW) / 2;
        const sy = (i / numSlices) * img.height;
        const sh = (1 / numSlices) * img.height;
        ctx.drawImage(img, 0, sy, img.width, sh, sliceX, y + i, sliceW, 1);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// INIT (APP START)
// ═══════════════════════════════════════════════════════════════════════════
loadCustomPresets(); 
initDropzone(); 
loadLayout();
renderModelBadges();
renderRatioChips();
renderEnvPresets();
renderStoryboard();
clearCanvases();

// 🔥 NEW: Force UI to sync with State defaults on load
if (document.getElementById('lensSelect')) {
    document.getElementById('lensSelect').value = S.lens;
    document.getElementById('lensValue').textContent = S.lens.split(' ')[0];
}
if (document.getElementById('dofSelect')) {
    document.getElementById('dofSelect').value = S.dof;
    document.getElementById('dofValue').textContent = S.dof.split(' ')[0];
}

// Initialize lighting/time controls
document.getElementById('lightingIntensityValue').textContent = S.lightingIntensity + '%';
document.getElementById('timeSlider').value = S.timeOfDay;
setEnvironmentMode(S.isIndoor ? 'indoor' : 'outdoor');
updateTimeOfDay();

console.log('A-CAM initialized with 50mm / f8.0 defaults');

function applyVignette(ctx, x, y, w, h, intensity) {
    const strength = intensity / 100;
    // Creates a radial gradient centered in the frame
    const grad = ctx.createRadialGradient(w/2, h/2, h/4, w/2, h/2, w/1.1);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${0.85 * strength})`);
    
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h); // Always fills the square frame
    ctx.restore();
}

async function extendBackgroundWithMirror(image, expandRatio = 0.4) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const w = image.width;
    const h = image.height;

    // Asymmetric: more vertical, less horizontal
    const horizExpand = 0.15;
    const vertExpand = expandRatio;
    
    const newW = Math.floor(w * (1 + horizExpand * 2));
    const newH = Math.floor(h * (1 + vertExpand * 2));

    canvas.width = newW;
    canvas.height = newH;

    const offsetX = Math.floor((newW - w) / 2);
    const offsetY = Math.floor((newH - h) / 2);

    // Fill with dark color first
    ctx.fillStyle = '#1a1a1c';
    ctx.fillRect(0, 0, newW, newH);

    // Draw original centered
    ctx.drawImage(image, offsetX, offsetY);

    // Create temp canvas for flipped edges
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // === TOP: Flip vertically ===
    const topH = offsetY + 10;
    tempCanvas.width = w;
    tempCanvas.height = topH;
    tempCtx.save();
    tempCtx.translate(0, topH);
    tempCtx.scale(1, -1);
    tempCtx.drawImage(image, 0, 0, w, topH, 0, 0, w, topH);
    tempCtx.restore();
    ctx.drawImage(tempCanvas, offsetX, 0);

    // === BOTTOM: Flip vertically ===
    const botH = offsetY + 10;
    tempCanvas.width = w;
    tempCanvas.height = botH;
    tempCtx.clearRect(0, 0, w, botH);
    tempCtx.save();
    tempCtx.translate(0, botH);
    tempCtx.scale(1, -1);
    tempCtx.drawImage(image, 0, h - botH, w, botH, 0, 0, w, botH);
    tempCtx.restore();
    ctx.drawImage(tempCanvas, offsetX, offsetY + h);

    // === LEFT: Flip horizontally (smaller) ===
    const leftW = offsetX + 5;
    tempCanvas.width = leftW;
    tempCanvas.height = h;
    tempCtx.clearRect(0, 0, leftW, h);
    tempCtx.save();
    tempCtx.translate(leftW, 0);
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(image, 0, 0, leftW, h, 0, 0, leftW, h);
    tempCtx.restore();
    ctx.drawImage(tempCanvas, 0, offsetY);

    // === RIGHT: Flip horizontally (smaller) ===
    const rightW = offsetX + 5;
    tempCanvas.width = rightW;
    tempCanvas.height = h;
    tempCtx.clearRect(0, 0, rightW, h);
    tempCtx.save();
    tempCtx.translate(rightW, 0);
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(image, w - rightW, 0, rightW, h, 0, 0, rightW, h);
    tempCtx.restore();
    ctx.drawImage(tempCanvas, offsetX + w, offsetY);

    // === CORNERS: Sample edge colors ===
    ctx.fillStyle = getEdgeColor(image, 0, 0);
    ctx.fillRect(0, 0, offsetX, offsetY);
    ctx.fillStyle = getEdgeColor(image, w - 1, 0);
    ctx.fillRect(offsetX + w, 0, offsetX, offsetY);
    ctx.fillStyle = getEdgeColor(image, 0, h - 1);
    ctx.fillRect(0, offsetY + h, offsetX, offsetY);
    ctx.fillStyle = getEdgeColor(image, w - 1, h - 1);
    ctx.fillRect(offsetX + w, offsetY + h, offsetX, offsetY);

    const output = new Image();
    output.onload = () => resolve(output);
    output.src = canvas.toDataURL('image/png');
  });
}

// Helper to sample edge color
function getEdgeColor(image, x, y) {
  const c = document.createElement('canvas');
  c.width = 1; c.height = 1;
  const ctx = c.getContext('2d');
  ctx.drawImage(image, x, y, 1, 1, 0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return `rgb(${d[0]},${d[1]},${d[2]})`;
}

function isValidOutpaint(base64Image) {
  if (!base64Image) return false;
  if (typeof base64Image !== 'string') return false;
  if (base64Image.length < 50000) return false;
  return true;
}

// === THE MISSING COLOR GRADING ENGINE ===

function applyTimeOfDayGrade(ctx, w, h, timeOfDay, isIndoor, sunDirection) {
  if (isIndoor) return; // Indoor shots use manual lighting controls instead
  
  const timeData = getTimeData(timeOfDay);
  if (!timeData.overlayColor || timeData.overlayAlpha === 0) return;
  
  ctx.save();
  // We use 'overlay' or 'soft-light' to blend the time-of-day tint naturally
  ctx.globalCompositeOperation = timeData.blendMode || 'overlay';
  ctx.globalAlpha = timeData.overlayAlpha;
  
  let gradient;
  const sunX = sunDirection === 'east' ? 0 : w;
  const sunAngle = timeData.sunAngle;
  
  // Create a directional light gradient based on time of day
  if (sunAngle > 30) {
    gradient = ctx.createLinearGradient(0, 0, 0, h);
  } else if (sunAngle > 0) {
    gradient = ctx.createLinearGradient(sunX, 0, w - sunX, h);
  } else {
    gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
  }
  
  gradient.addColorStop(0, timeData.overlayColor);
  gradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  
  // Add a "Sun Glow" during Golden Hour or Sunset
  if (timeData.name === 'Golden Hour' || timeData.name === 'Sunset') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.15;
    const glowX = sunDirection === 'east' ? w * 0.15 : w * 0.85;
    const glowY = h * (0.3 + (90 - Math.abs(sunAngle)) / 180);
    const sunGlow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, w * 0.4);
    sunGlow.addColorStop(0, '#ffdd99');
    sunGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

function applyLightingOverlay(ctx, w, h, lightingType, intensity = 50) {
  if (!lightingType || lightingType === 'Natural' || intensity === 0) return;
  
  const alpha = (intensity / 100) * 0.3;
  ctx.save();
  ctx.globalAlpha = alpha;
  
  // Simulates professional film lighting setups
  if (lightingType === 'Cinematic High Key') {
    ctx.globalCompositeOperation = 'screen';
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#fff5e6');
    ctx.fillStyle = g;
  } else if (lightingType === 'Moody Low Key') {
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#0a0a15';
  } else if (lightingType === 'Cyberpunk Neon') {
    ctx.globalCompositeOperation = 'screen';
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, '#ff00ff'); g.addColorStop(1, '#00ffff');
    ctx.fillStyle = g;
  }
  
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function handleMasterUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
        // Save to global state S
        S.masterCharacterSheet = evt.target.result;
        
        // Update UI elements
        const preview = document.getElementById('masterPreview');
        const status = document.getElementById('masterStatus');
        
        preview.src = evt.target.result;
        preview.style.display = 'block';
        
        status.textContent = "LOCKED";
        status.style.color = "#44ff44"; // Success green
        
        showToast("✓ Master Identity Sheet Locked");
    };
    reader.readAsDataURL(file);
}

function handleFaceUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
        // Load image to compress it
        const img = new Image();
        img.onload = () => {
            // Resize to max 512px (face doesn't need to be huge for embedding)
            const maxSize = 512;
            let w = img.width, h = img.height;
            if (w > maxSize || h > maxSize) {
                if (w > h) {
                    h = Math.round(h * maxSize / w);
                    w = maxSize;
                } else {
                    w = Math.round(w * maxSize / h);
                    h = maxSize;
                }
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            
            // Compress to JPEG
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            S.faceCloseup = compressed;
            
            // Update UI elements
            const preview = document.getElementById('facePreview');
            const status = document.getElementById('faceStatus');
            
            preview.src = compressed;
            preview.style.display = 'block';
            
            status.textContent = "LOCKED";
            status.style.color = "#44ff44";
            
            // Enable Face Lock toggle now that we have a face
            const faceLockToggle = document.querySelector('.face-lock-toggle');
            if (faceLockToggle) {
                faceLockToggle.classList.remove('disabled');
                faceLockToggle.title = 'Use high-res face as end frame for identity preservation';
            }
            
            console.log(`Face compressed: ${img.width}x${img.height} → ${w}x${h}, ${Math.round(compressed.length/1024)}KB`);
            showToast("✓ High-Res Face Locked - Face Lock now available");
        };
        img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
}

// === SEAMLESS OPTICAL DEPTH ENGINE ===
// === SEAMLESS OPTICAL DEPTH ENGINE (REDUNDANT COPIES REMOVED) ===
// Logic successfully migrated to master renderer.js to ensure frame-level stability.

// ═══════════════════════════════════════════════════════════════════════════
// UI UTILITIES & STORYBOARD EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

function resetAll() {
  if (confirm('Reset all settings?')) location.reload();
}

function showInfo() {
  alert('A-CAM by IN-NO-V8\n\nVisual Director for AI Video\nVersion 3.1\n\n• Gemini-powered scene analysis\n• Real-time background removal\n• Scene compositing with DOF\n• Time/lighting visualization');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function showProgress(title, status = 'Initializing...', percent = 0) {
  const overlay = document.getElementById('progressOverlay');
  if (!overlay) return;
  document.getElementById('progressTitle').textContent = title;
  document.getElementById('progressStatus').textContent = status;
  document.getElementById('progressFill').style.width = percent + '%';
  overlay.classList.add('active');
}

function updateProgress(status, percent) {
  const statusEl = document.getElementById('progressStatus');
  const fillEl = document.getElementById('progressFill');
  if (statusEl) statusEl.textContent = status;
  if (fillEl) fillEl.style.width = percent + '%';
}

function hideProgress() {
  const overlay = document.getElementById('progressOverlay');
  if (overlay) overlay.classList.remove('active');
}

// ═══════════════════════════════════════════════════════════════════════════
// COLOR GRADING & LIGHTING OVERLAYS
// ═══════════════════════════════════════════════════════════════════════════
function applyTimeOfDayGrade(ctx, w, h, timeOfDay, isIndoor, sunDirection) {
  if (isIndoor) return;
  const timeData = getTimeData(timeOfDay);
  if (!timeData || !timeData.overlayColor || timeData.overlayAlpha === 0) return;
  
  ctx.save();
  ctx.globalCompositeOperation = timeData.blendMode || 'overlay';
  ctx.globalAlpha = timeData.overlayAlpha;
  
  let gradient;
  const sunX = sunDirection === 'east' ? 0 : w;
  const sunAngle = timeData.sunAngle;
  
  if (sunAngle > 30) {
    gradient = ctx.createLinearGradient(0, 0, 0, h);
  } else if (sunAngle > 0) {
    gradient = ctx.createLinearGradient(sunX, 0, w - sunX, h);
  } else {
    gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
  }
  
  gradient.addColorStop(0, timeData.overlayColor);
  gradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  
  if (timeData.name === 'Golden Hour' || timeData.name === 'Sunset') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.15;
    const glowX = sunDirection === 'east' ? w * 0.15 : w * 0.85;
    const glowY = h * (0.3 + (90 - Math.abs(sunAngle)) / 180);
    const sunGlow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, w * 0.4);
    sunGlow.addColorStop(0, '#ffdd99');
    sunGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

function applyLightingOverlay(ctx, w, h, lightingType, intensity = 50) {
  if (!lightingType || lightingType === 'Natural Ambient' || intensity === 0) return;
  const alpha = (intensity / 100) * 0.3;
  ctx.save();
  ctx.globalAlpha = alpha;
  
  if (lightingType === 'Cinematic High Key') {
    ctx.globalCompositeOperation = 'screen';
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#fff5e6');
    gradient = ctx.createLinearGradient(sunX, 0, w - sunX, h);
  } else {
    gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
  }
  
  gradient.addColorStop(0, timeData.overlayColor);
  gradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  
  if (timeData.name === 'Golden Hour' || timeData.name === 'Sunset') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.15;
    const glowX = sunDirection === 'east' ? w * 0.15 : w * 0.85;
    const glowY = h * (0.3 + (90 - Math.abs(sunAngle)) / 180);
    const sunGlow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, w * 0.4);
    sunGlow.addColorStop(0, '#ffdd99');
    sunGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

// Redundant applyLightingOverlay removed

function handleMasterUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        S.masterCharacterSheet = evt.target.result;
        const preview = document.getElementById('masterPreview');
        const status = document.getElementById('masterStatus');
        if (preview) { preview.src = evt.target.result; preview.style.display = 'block'; }
        if (status) { status.textContent = "LOCKED"; status.style.color = "#44ff44"; }
        showToast("✓ Master Identity Sheet Locked");
    };
    reader.readAsDataURL(file);
}

function handleFaceUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
            const maxSize = 512;
            let w = img.width, h = img.height;
            if (w > maxSize || h > maxSize) {
                if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
                else { w = Math.round(w * maxSize / h); h = maxSize; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            S.faceCloseup = compressed;
            const preview = document.getElementById('facePreview');
            const status = document.getElementById('faceStatus');
            if (preview) { preview.src = compressed; preview.style.display = 'block'; }
            if (status) { status.textContent = "LOCKED"; status.style.color = "#44ff44"; }
            showToast("✓ High-Res Face Locked");
        };
        img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
}

// ═══════════════════════════════════════════════════════════════════════════
// INIT (APP START)
// ═══════════════════════════════════════════════════════════════════════════
function init() {
  // console.log('🎬 A-CAM Initializing...');
  loadCustomPresets(); 
  initDropzone(); 
  loadLayout();
  
  if (typeof renderRatioChips === 'function') renderRatioChips();
  if (typeof renderEnvPresets === 'function') renderEnvPresets();
  if (typeof renderStoryboard === 'function') renderStoryboard();
  
  // Sync UI with State
  const lensSel = document.getElementById('lensSelect');
  if (lensSel) {
    lensSel.value = S.lens;
    const lensVal = document.getElementById('lensValue');
    if (lensVal) lensVal.textContent = S.lens.split(' ')[0];
  }
  
  const intensityVal = document.getElementById('lightingIntensityValue');
  if (intensityVal) intensityVal.textContent = S.lightingIntensity + '%';
  
  const timeSlider = document.getElementById('timeSlider');
  if (timeSlider) timeSlider.value = S.timeOfDay;
  
  if (typeof updateTimeOfDay === 'function') updateTimeOfDay();
  if (typeof updateAPIStatus === 'function') updateAPIStatus('ready');
  
  // console.log('✅ A-CAM Ready');
}

// Start the engine
window.addEventListener('DOMContentLoaded', init);
