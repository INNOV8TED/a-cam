import re
import traceback

def safe_replace(filepath, mapping):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for search, replace in mapping:
            if search not in content:
                print(f"Warning: Chunk not found in {filepath}!")
                print("--- SEARCH ---")
                print(search)
                print("--------------")
            else:
                content = content.replace(search, replace)
                
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {filepath} successfully.")
    except Exception as e:
        print(f"Failed to patch {filepath}: {e}")
        traceback.print_exc()

ui_mapping = [
    (
        """    // 🔥 NEW: CALL THE GRADIENT DEPTH ENGINE
    const totalBlur = getBlurAmount(settings.dof || S.dof);
    // Get just the color filter without the blur (blur is handled by the DOF engine)
    const timeFilter = getEnvironmentFilter(settings.timeOfDay ?? S.timeOfDay, settings.isIndoor ?? S.isIndoor, 0);
    
    drawBackgroundWithSimpleDOF(ctx, S.backgroundPlate, bgX, bgY, finalBgW, finalBgH, focusPlaneY, totalBlur, timeFilter);
    
    ctx.restore();""",
        """    // 🔥 NEW: CALL THE GRADIENT DEPTH ENGINE
    let totalBlur = getBlurAmount(settings.dof || S.dof) * 1.5;
    let fgBlur = 0;
    
    // Dynamic Rack Focus Logic
    if (S.rackFocus !== 0 && settings.frameType === 'end') {
      const rackVal = S.rackFocus / 100.0;
      if (rackVal > 0) {
        totalBlur = Math.max(totalBlur, rackVal * 20); // Pull to FG
      } else {
        totalBlur = Math.max(0, totalBlur + (rackVal * totalBlur)); // Pull to BG
        fgBlur = Math.abs(rackVal) * 15;
      }
    }
    settings.calculatedFgBlur = fgBlur;

    // Get just the color filter without the blur (blur is handled by the DOF engine)
    const timeFilter = getEnvironmentFilter(settings.timeOfDay ?? S.timeOfDay, settings.isIndoor ?? S.isIndoor, 0);
    
    drawBackgroundWithSimpleDOF(ctx, S.backgroundPlate, bgX, bgY, finalBgW, finalBgH, focusPlaneY, totalBlur, timeFilter, settings.dutchAngle || 0);
    
    ctx.restore();"""
    ),
    (
        """    // 🔥 FIX: 1.4x Parallax on Horizontal, 1.0x (Welded) on Vertical to stop sliding
    const charX = feetX - (pCanvas.width / 2) + (moveX * 1.4); 
    const charY = adjustedFeetY - finalCharH + moveY; 

    drawCharacterWithShadow(ctx, pCanvas, charX, charY, pCanvas.width, finalCharH, settings.timeOfDay ?? S.timeOfDay, settings.lighting || S.lighting);

  } else {""",
        """    // 🔥 FIX: 1.4x Parallax on Horizontal, 1.0x (Welded) on Vertical to stop sliding
    const charX = feetX - (pCanvas.width / 2) + (moveX * 1.4); 
    const charY = adjustedFeetY - finalCharH + moveY; 

    // Apply FG Blur from Rack Focus
    if (settings.calculatedFgBlur && settings.calculatedFgBlur > 0) {
        const blurCanvas = document.createElement('canvas');
        blurCanvas.width = pCanvas.width;
        blurCanvas.height = pCanvas.height;
        const bctx = blurCanvas.getContext('2d');
        bctx.filter = `blur(${settings.calculatedFgBlur}px)`;
        bctx.drawImage(pCanvas, 0, 0);
        drawCharacterWithShadow(ctx, blurCanvas, charX, charY, pCanvas.width, finalCharH, settings.timeOfDay ?? S.timeOfDay, settings.lighting || S.lighting);
    } else {
        drawCharacterWithShadow(ctx, pCanvas, charX, charY, pCanvas.width, finalCharH, settings.timeOfDay ?? S.timeOfDay, settings.lighting || S.lighting);
    }

  } else {"""
    ),
    (
        """  // 7. ATMOSPHERIC HAZE
  if (S.hazeAmount > 0) {
    let distanceFactor = 1.0;
    if (settings.frameType === 'end' && S.movement === 'Dolly Pull Out') {
      distanceFactor = 1.0 + (S.movementIntensity / 100) * 0.5;
    }
    applyAtmosphericHaze(ctx, w, h, S.hazeAmount, S.hazeColor, distanceFactor);
  }

  // 8. FINAL LENS PASS""",
        """  // 7. ATMOSPHERIC HAZE
  if (S.hazeAmount > 0) {
    let distanceFactor = 1.0;
    if (settings.frameType === 'end' && S.movement === 'Dolly Pull Out') {
      distanceFactor = 1.0 + (S.movementIntensity / 100) * 0.5;
    }
    applyAtmosphericHaze(ctx, w, h, S.hazeAmount, S.hazeColor, distanceFactor);
  }

  // Anime Speed Lines
  if (settings.frameType === 'end' && 
      (S.movement === 'Dolly Push In' || S.movement === 'Dolly Zoom' || S.movement === 'Zoom In') && 
      S.movementIntensity >= 75) {
      
      const centerX = w / 2;
      const centerY = h / 2;
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = '#ffffff';
      
      for (let i = 0; i < 60; i++) {
        ctx.lineWidth = Math.random() * 3 + 1;
        const angle = Math.random() * Math.PI * 2;
        const innerRadius = (Math.random() * 0.4 + 0.3) * (h/2); 
        const outerRadius = Math.max(w, h); 
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * innerRadius, centerY + Math.sin(angle) * innerRadius);
        ctx.lineTo(centerX + Math.cos(angle) * outerRadius, centerY + Math.sin(angle) * outerRadius);
        ctx.stroke();
      }
      ctx.restore();
  }

  // 8. FINAL LENS PASS"""
    ),
    (
        """// === SEAMLESS OPTICAL DEPTH ENGINE ===
function drawBackgroundWithSimpleDOF(ctx, bgImage, x, y, w, h, groundY, maxBlur, timeFilter) {
  // If f/8.0 or f/11 (sharp) is selected, just draw the image normally""",
        """// === SEAMLESS OPTICAL DEPTH ENGINE ===
function drawBackgroundWithSimpleDOF(ctx, bgImage, x, y, w, h, groundY, maxBlur, timeFilter, dutchAngle = 0) {
  // If f/8.0 or f/11 (sharp) is selected, just draw the image normally"""
    ),
    (
        """  const gradient = bCtx.createLinearGradient(0, fadeStart, 0, fadeEnd);
  gradient.addColorStop(0, 'rgba(0,0,0,1)'); // Zone 1: Far (100% Blur)
  gradient.addColorStop(0.5, 'rgba(0,0,0,0.5)'); // Zone 2: Transition
  gradient.addColorStop(1, 'rgba(0,0,0,0)'); // Zone 3: Ground (0% Blur)
  
  bCtx.fillStyle = gradient;
  bCtx.fillRect(0, 0, canvasW, canvasH);
  
  // 4. COMPOSITE: Draw the masked blur layer over the sharp base""",
        """  const gradient = bCtx.createLinearGradient(0, fadeStart, 0, fadeEnd);
  gradient.addColorStop(0, 'rgba(0,0,0,1)'); // Zone 1: Far (100% Blur)
  gradient.addColorStop(0.5, 'rgba(0,0,0,0.5)'); // Zone 2: Transition
  gradient.addColorStop(1, 'rgba(0,0,0,0)'); // Zone 3: Ground (0% Blur)
  
  bCtx.save();
  if (dutchAngle !== 0) {
    bCtx.translate(canvasW/2, canvasH/2);
    bCtx.rotate(-dutchAngle * Math.PI / 180);
    bCtx.translate(-canvasW/2, -canvasH/2);
  }
  bCtx.fillStyle = gradient;
  bCtx.fillRect(-canvasW*2, -canvasH*2, canvasW * 5, canvasH * 5); // Huge padding to avoid clipping when rotated
  bCtx.restore();
  
  // 4. COMPOSITE: Draw the masked blur layer over the sharp base"""
    )
]

renderer_mapping = [
    (
        """    const totalBlur = (getBlurAmount(settings.dof || S.dof) * 1.5) + opticalBlur;
    
    ctx.save();
    ctx.filter = getEnvironmentFilter(settings.timeOfDay ?? S.timeOfDay, settings.isIndoor ?? S.isIndoor, totalBlur);""",
        """    let totalBlur = (getBlurAmount(settings.dof || S.dof) * 1.5) + opticalBlur;
    let fgBlur = 0;
    
    // Dynamic Rack Focus Logic
    if (S.rackFocus !== 0 && settings.frameType === 'end') {
      const rackVal = S.rackFocus / 100.0;
      if (rackVal > 0) {
        totalBlur = Math.max(totalBlur, rackVal * 20); // Pull to FG
      } else {
        totalBlur = Math.max(0, totalBlur + (rackVal * totalBlur)); // Pull to BG
        fgBlur = Math.abs(rackVal) * 15;
      }
    }
    settings.calculatedFgBlur = fgBlur;
    
    ctx.save();
    ctx.filter = getEnvironmentFilter(settings.timeOfDay ?? S.timeOfDay, settings.isIndoor ?? S.isIndoor, totalBlur);"""
    ),
    (
        """    // Parallax logic synced with Preview (1.4x X, 1.0x Y)
    const finalCharX = feetX - (finalCharW / 2) + (moveX * 1.4);
    const finalCharY = feetY - finalCharH + moveY;
    
    drawCharacterWithShadow(ctx, charCanvas, finalCharX, finalCharY, finalCharW, finalCharH, settings.timeOfDay ?? S.timeOfDay, settings.lighting || S.lighting);""",
        """    // Parallax logic synced with Preview (1.4x X, 1.0x Y)
    const finalCharX = feetX - (finalCharW / 2) + (moveX * 1.4);
    const finalCharY = feetY - finalCharH + moveY;
    
    // Apply FG Blur from Rack Focus
    if (settings.calculatedFgBlur && settings.calculatedFgBlur > 0) {
        const blurCanvas = document.createElement('canvas');
        blurCanvas.width = finalCharW;
        blurCanvas.height = finalCharH;
        const bctx = blurCanvas.getContext('2d');
        bctx.filter = `blur(${settings.calculatedFgBlur}px)`;
        bctx.drawImage(charCanvas, 0, 0);
        drawCharacterWithShadow(ctx, blurCanvas, finalCharX, finalCharY, finalCharW, finalCharH, settings.timeOfDay ?? S.timeOfDay, settings.lighting || S.lighting);
    } else {
        drawCharacterWithShadow(ctx, charCanvas, finalCharX, finalCharY, finalCharW, finalCharH, settings.timeOfDay ?? S.timeOfDay, settings.lighting || S.lighting);
    }"""
    ),
    (
        """  if (S.hazeAmount > 0) {
    let distanceFactor = 1.0;
    if (settings.frameType === 'end' && S.movement === 'Dolly Pull Out') {
      distanceFactor = 1.0 + (S.movementIntensity / 100) * 0.5;
    }
    applyAtmosphericHaze(ctx, w, h, S.hazeAmount, S.hazeColor, distanceFactor);
  }
  
  applyTimeOfDayGrade(ctx, w, h, settings.timeOfDay ?? S.timeOfDay, settings.isIndoor ?? S.isIndoor, settings.sunDirection ?? S.sunDirection);""",
        """  if (S.hazeAmount > 0) {
    let distanceFactor = 1.0;
    if (settings.frameType === 'end' && S.movement === 'Dolly Pull Out') {
      distanceFactor = 1.0 + (S.movementIntensity / 100) * 0.5;
    }
    applyAtmosphericHaze(ctx, w, h, S.hazeAmount, S.hazeColor, distanceFactor);
  }
  
  // Anime Speed Lines
  if (settings.frameType === 'end' && 
      (S.movement === 'Dolly Push In' || S.movement === 'Dolly Zoom' || S.movement === 'Zoom In') && 
      S.movementIntensity >= 75) {
      
      const centerX = w / 2;
      const centerY = h / 2;
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = '#ffffff';
      
      for (let i = 0; i < 60; i++) {
        ctx.lineWidth = Math.random() * 3 + 1;
        const angle = Math.random() * Math.PI * 2;
        const innerRadius = (Math.random() * 0.4 + 0.3) * (h/2); 
        const outerRadius = Math.max(w, h); 
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * innerRadius, centerY + Math.sin(angle) * innerRadius);
        ctx.lineTo(centerX + Math.cos(angle) * outerRadius, centerY + Math.sin(angle) * outerRadius);
        ctx.stroke();
      }
      ctx.restore();
  }
  
  applyTimeOfDayGrade(ctx, w, h, settings.timeOfDay ?? S.timeOfDay, settings.isIndoor ?? S.isIndoor, settings.sunDirection ?? S.sunDirection);"""
    )
]

safe_replace('js/ui.js', ui_mapping)
safe_replace('js/renderer.js', renderer_mapping)
