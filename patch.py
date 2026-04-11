import os

def patch_ui_js():
    try:
        content = open('js/ui.js', 'r', encoding='utf-8', errors='ignore').read()
    except: return
    
    # 1. Dutch angle fix in applyEffect (js/ui.js)
    if 'if (S.showVignette)' in content and 'applyTimeOfDayGrade(ctx' in content:
        # Reset transform before applyTimeOfDayGrade
        content = content.replace(
            "applyTimeOfDayGrade(ctx, w, h, settings.timeOfDay ?? S.timeOfDay, settings.isIndoor ?? S.isIndoor, settings.sunDirection ?? S.sunDirection);",
            "ctx.setTransform(1, 0, 0, 1, 0, 0);\n    applyTimeOfDayGrade(ctx, w, h, settings.timeOfDay ?? S.timeOfDay, settings.isIndoor ?? S.isIndoor, settings.sunDirection ?? S.sunDirection);"
        )

    # 2. Rack focus logic in applyEffect
    if 'const totalBlur = (getBlurAmount(settings.dof || S.dof) * 1.5) + opticalBlur;' in content:
        # replace blur formulation
        focus_logic = """
    let bgBlur = (getBlurAmount(settings.dof || S.dof) * 1.5) + opticalBlur;
    let fgBlur = 0;
    
    // Dynamic Rack Focus Logic
    if (S.rackFocus !== 0 && settings.frameType === 'end') {
      const rackVal = S.rackFocus / 100.0;
      if (rackVal > 0) {
        // Pull to FG: character sharp, bg gets completely blurred out
        bgBlur = Math.max(bgBlur, rackVal * 20);
      } else {
        // Pull to BG: background sharpens, character gets completely blurred
        bgBlur = Math.max(0, bgBlur + (rackVal * bgBlur)); // drops to 0
        fgBlur = Math.abs(rackVal) * 15;
      }
    }
    const totalBlur = bgBlur;
        """
        content = content.replace('const totalBlur = (getBlurAmount(settings.dof || S.dof) * 1.5) + opticalBlur;', focus_logic)

    # 3. FG blur application on character logic
    if 'drawCharacterWithShadow(ctx, charCanvas' in content:
        fg_blur_app = """
    if (typeof fgBlur !== 'undefined' && fgBlur > 0) {
        charCtx.filter = `blur(${fgBlur}px)`;
        charCtx.drawImage(charCanvas, 0, 0); // Self-blur
    }
    drawCharacterWithShadow(ctx, charCanvas"""
        content = content.replace("drawCharacterWithShadow(ctx, charCanvas", fg_blur_app)

    # 4. Anime Speed Lines
    speed_lines = """
function addAnimeSpeedLines(ctx, w, h, movement) {
  if (!movement.includes('Zoom') && !movement.includes('Push')) return;
  const centerX = w / 2;
  const centerY = h / 2;
  
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = '#ffffff';
  
  for (let i = 0; i < 60; i++) {
    ctx.lineWidth = Math.random() * 3 + 1;
    const angle = Math.random() * Math.PI * 2;
    // Don't draw in the exact center face region
    const innerRadius = (Math.random() * 0.4 + 0.3) * (h/2); 
    const outerRadius = Math.max(w, h); // go past edge
    
    ctx.beginPath();
    ctx.moveTo(centerX + Math.cos(angle) * innerRadius, centerY + Math.sin(angle) * innerRadius);
    ctx.lineTo(centerX + Math.cos(angle) * outerRadius, centerY + Math.sin(angle) * outerRadius);
    ctx.stroke();
  }
  ctx.restore();
}
"""
    if 'addAnimeSpeedLines' not in content:
        content += "\n" + speed_lines
    
    if 'if (S.showVignette)' in content:
        injector = """
    if (settings.frameType === 'end' && (S.movement === 'Dolly Push In' || S.movement === 'Dolly Zoom' || S.movement === 'Zoom In') && S.movementIntensity >= 75) {
      addAnimeSpeedLines(ctx, w, h, S.movement);
    }
    if (S.showVignette)"""
        content = content.replace("if (S.showVignette)", injector)

    open('js/ui.js', 'w', encoding='utf-8').write(content)


def patch_renderer_js():
    try:
        content = open('js/renderer.js', 'r', encoding='utf-8', errors='ignore').read()
    except: return
    
    # 1. Dutch angle fix in renderExportFrame (js/renderer.js)
    if 'applyTimeOfDayGrade(ctx' in content:
        # Note: renderer.js might use applyTimeOfDayGrade identically
        content = content.replace(
            "applyTimeOfDayGrade(ctx, w, h, settings.timeOfDay ?? S.timeOfDay, settings.isIndoor ?? S.isIndoor, settings.sunDirection ?? S.sunDirection);",
            "ctx.setTransform(1, 0, 0, 1, 0, 0);\n  applyTimeOfDayGrade(ctx, w, h, settings.timeOfDay ?? S.timeOfDay, settings.isIndoor ?? S.isIndoor, settings.sunDirection ?? S.sunDirection);"
        )
    open('js/renderer.js', 'w', encoding='utf-8').write(content)


def patch_api_js():
    try:
        content = open('js/api.js', 'r', encoding='utf-8', errors='ignore').read()
    except: return
    
    # Inject prompt logic
    if 'let finalPrompt =' in content:
        rack_str = """
        let rackDesc = "";
        if (S.rackFocus > 0) rackDesc = "Cinematic rack focus pulling from the background into crisp foreground subject focus. ";
        else if (S.rackFocus < 0) rackDesc = "Cinematic rack focus pulling from subject into perfectly sharp background focus. ";
        let finalPrompt ="""
        content = content.replace('let finalPrompt =', rack_str)
        content = content.replace('CAMERA: ${cameraDesc}, ${angleDesc}, ${dofDesc}. `;', 'CAMERA: ${cameraDesc}, ${angleDesc}, ${dofDesc}. ${rackDesc}`;')
        
    open('js/api.js', 'w', encoding='utf-8').write(content)

patch_ui_js()
patch_renderer_js()
patch_api_js()
print("Patching complete!")
