import re

with open('js/renderer.js', 'r', encoding='utf-8') as f:
    text = f.read()

search = "ctx.setTransform(1, 0, 0, 1, 0, 0);\n  applyTimeOfDayGrade("
replace = """  // Anime Speed Lines
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
  
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  applyTimeOfDayGrade("""

if search in text:
    text = text.replace(search, replace)
    with open('js/renderer.js', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Patched renderer speed lines!")
else:
    print("Could not find insertion point!")
