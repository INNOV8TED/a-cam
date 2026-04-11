const fs = require('fs');
let code = fs.readFileSync('js/renderer.js', 'utf8');

// 1. applyEffect - charCanvas optimization
code = code.replace(
    'const charCanvas = document.createElement(\'canvas\');\n    charCanvas.width = Math.ceil(finalCharW); charCanvas.height = Math.ceil(finalCharH);\n    const charCtx = charCanvas.getContext(\'2d\');',
    `const charCanvas = OFFSCREEN_POOL.charBuffer;
    charCanvas.width = Math.ceil(finalCharW); charCanvas.height = Math.ceil(finalCharH);
    const charCtx = charCanvas.getContext('2d');
    charCtx.clearRect(0, 0, finalCharW, finalCharH);`
);

// 2. applyEffect - pCanvas optimization
code = code.replace(
    'const pCanvas = document.createElement(\'canvas\');\n    pCanvas.width = finalCharW * 1.5; pCanvas.height = finalCharH;\n    const pCtx = pCanvas.getContext(\'2d\');',
    `const pCanvas = OFFSCREEN_POOL.pinchBuffer;
    pCanvas.width = finalCharW * 1.5; pCanvas.height = finalCharH;
    const pCtx = pCanvas.getContext('2d');
    pCtx.clearRect(0, 0, finalCharW * 1.5, finalCharH);`
);

// 3. applyEffect - blurCanvas optimization
code = code.replace(
    'const blurCanvas = document.createElement(\'canvas\');\n        blurCanvas.width = pCanvas.width;\n        blurCanvas.height = pCanvas.height;\n        const blurCtx = blurCanvas.getContext(\'2d\');',
    `const blurCanvas = OFFSCREEN_POOL.blurBuffer;
        blurCanvas.width = pCanvas.width;
        blurCanvas.height = pCanvas.height;
        const blurCtx = blurCanvas.getContext('2d');
        blurCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);`
);

// 4. drawBackgroundWithSimpleDOF - blurCanvas optimization
code = code.replace(
    'const blurCanvas = document.createElement(\'canvas\');\n  blurCanvas.width = canvasW;\n  blurCanvas.height = canvasH;\n  const bCtx = blurCanvas.getContext(\'2d\');',
    `const blurCanvas = OFFSCREEN_POOL.blurBuffer;
  blurCanvas.width = canvasW;
  blurCanvas.height = canvasH;
  const bCtx = blurCanvas.getContext('2d');
  bCtx.clearRect(0, 0, canvasW, canvasH);`
);

// 5. renderSketchMode - tempCanvas optimization
code = code.replace(
    'const tempCanvas = document.createElement(\'canvas\');\n  tempCanvas.width = w;\n  tempCanvas.height = h;\n  const tCtx = tempCanvas.getContext(\'2d\', { willReadFrequently: true });',
    `const tempCanvas = OFFSCREEN_POOL.charBuffer;
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
  tCtx.clearRect(0, 0, w, h);`
);

// 6. Raycast Shadows (update definition AND call to inject sunDirection)
code = code.replace(
    `function drawCharacterWithShadow(ctx, img, x, y, width, height, timeOfDay, lightingStyle = '') {`,
    `function drawCharacterWithShadow(ctx, img, x, y, width, height, timeOfDay, lightingStyle = '', sunDirection = 'east') {`
);

code = code.replace(
    `drawCharacterWithShadow(ctx, finalPCanvas, charX, charY, pCanvas.width, finalCharH, settings.timeOfDay ?? S.timeOfDay, settings.lighting || S.lighting);`,
    `drawCharacterWithShadow(ctx, finalPCanvas, charX, charY, pCanvas.width, finalCharH, settings.timeOfDay ?? S.timeOfDay, settings.lighting || S.lighting, settings.sunDirection || S.sunDirection);`
);

code = code.replace(
    `    const skewX = lightAngle * -1.2; \n    const scaleY = -0.15 - (shadowLength * 0.85); \n\n    // 2. THE DIRECTIONAL CAST SHADOW`,
    `    const dirMulti = sunDirection === 'west' ? -1 : 1;\n    const baseSkew = lightAngle * dirMulti;\n    const skewX = baseSkew * 1.5;\n    const scaleY = -0.15 - (shadowLength * 0.85); \n\n    // 2. THE DIRECTIONAL CAST SHADOW`
);

fs.writeFileSync('js/renderer.js', code);
console.log('Renderer optimization script completed.');
