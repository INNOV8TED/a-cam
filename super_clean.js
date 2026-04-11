const fs = require('fs');

let html = fs.readFileSync('app.html', 'utf8');

// 1. EXTRACT CSS
const styleStart = html.indexOf('<style>');
const styleEnd = html.indexOf('</style>') + 8;
const cssStr = html.substring(styleStart + 7, styleEnd - 8).trim();
html = html.substring(0, styleStart) + '<link rel="stylesheet" href="css/styles.css">\n' + html.substring(styleEnd);

// 2. FIND JS BOUNDARIES
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
const scriptBody = html.substring(scriptStart + 8, scriptEnd);

const stateStartMarker = 'const S = {';
const stateEndMarker = '\n// Studio background removal';

const renderStartMarker = 'function removeStudioBackground(charCtx, charCanvas) {';
const renderEndMarker = '\n// === THE NATIVE PRODUCTION ENGINE';

const apiStartMarker = 'async function pushToProduction() {';
const apiEndMarker = '\n// ═══════════════════════════════════════════════════════════════════════════\n// EVENT LISTENERS';

const sStartIdx = scriptBody.indexOf(stateStartMarker);
const sEndIdx = scriptBody.indexOf(stateEndMarker);

const rStartIdx = scriptBody.indexOf(renderStartMarker);
const rEndIdx = scriptBody.indexOf(renderEndMarker);

const aStartIdx = scriptBody.indexOf(apiStartMarker);
const aEndIdx = scriptBody.indexOf(apiEndMarker);

// 3. EXTRACT STATE
const stateData = scriptBody.substring(sStartIdx, sEndIdx);
        let stateJsContent = stateData.replace('const S = {', 'const S_internal = {');
        stateJsContent += '\n\n// --- REACTIVE PROXY ---\n';
        stateJsContent += 'let renderTimeout = null;\n';
        stateJsContent += 'window.S = new Proxy(S_internal, {\n';
        stateJsContent += '  set: function(target, property, value, receiver) {\n';
        stateJsContent += '    target[property] = value;\n';
        stateJsContent += '    if (typeof window.renderFrames === "function") {\n';
        stateJsContent += '      if (renderTimeout) clearTimeout(renderTimeout);\n';
        stateJsContent += '      renderTimeout = setTimeout(() => {\n';
        stateJsContent += '        window.renderFrames();\n';
        stateJsContent += '        window.generatePrompt();\n';
        stateJsContent += '      }, 16);\n';
        stateJsContent += '    }\n';
        stateJsContent += '    return true;\n';
        stateJsContent += '  }\n';
        stateJsContent += '});\n';
fs.writeFileSync('js/state.js', stateJsContent.trim());

// 4. EXTRACT RENDERER
// We ALREADY modified renderer.js via modify_renderer.js cleanly to add Pooling & Raycast.
// So we just skip extracting it and USE the existing js/renderer.js!
// BUT we still need to delete it from app.html.

// 5. EXTRACT API
const apiData = scriptBody.substring(aStartIdx, aEndIdx);
let apiStr = apiData.trim();
// Apply the updatePerformance fix to apiStr
apiStr = apiStr.replace(
`function updatePerformance() {
  S.subjectPerformance = document.getElementById('performanceInput').value;
  generatePrompt();
}`,
`function updatePerformance() {
  S.subjectAction = document.getElementById('subjectAction').value;
  S.subjectOutfit = document.getElementById('subjectOutfit').value;
  S.actionTimeline = document.getElementById('actionTimeline').value;
  S.subjectPerformance = S.subjectAction || S.subjectOutfit;
  if (typeof generatePrompt === 'function') generatePrompt();
}`);

apiStr = apiStr.replace(
`accessories: data.accessories,
                colors: data.colors
            };
            showToast('✓ AI ANALYZED: Wardrobe locked');`,
`accessories: data.accessories,
                colors: data.colors
            };
            if (typeof updatePerformance === 'function') updatePerformance();
            showToast('✓ AI ANALYZED: Wardrobe locked');`);

apiStr = apiStr.replace(
`            }
            outfitBox.value = desc;
            showToast('✓ Wardrobe identified');`,
`            }
            outfitBox.value = desc;
            if (typeof updatePerformance === 'function') updatePerformance();
            showToast('✓ Wardrobe identified');`);

apiStr = apiStr.replace(
`        document.getElementById('bgPlateImage').src = result.outpaintedImage.startsWith('data:') 
          ? result.outpaintedImage 
          : \`data:image/png;base64,\${result.outpaintedImage}\`;
        
        // NOW analyze the outpainted image to get depth layers`,
`        document.getElementById('bgPlateImage').src = result.outpaintedImage.startsWith('data:') 
          ? result.outpaintedImage 
          : \`data:image/png;base64,\${result.outpaintedImage}\`;
        
        if (typeof renderFrames === 'function') renderFrames();
        if (typeof generatePrompt === 'function') generatePrompt();
        
        // NOW analyze the outpainted image to get depth layers`);


fs.writeFileSync('js/api.js', apiStr);

// 6. EXTRACT UI
// Only keep what is AFTER the API marker
const uiData = scriptBody.substring(aEndIdx);
fs.writeFileSync('js/ui.js', uiData.trim());

// 7. BUILD FINAL APP.HTML
const beforeScript = html.substring(0, scriptStart);
const afterScript = html.substring(scriptEnd + 9);

let newHtml = beforeScript 
    + '<script src="js/state.js"></script>\n'
    + '<script src="js/renderer.js"></script>\n'
    + '<script src="js/api.js"></script>\n'
    + '<script src="js/ui.js"></script>\n'
    + afterScript;

// Fix the HTML text area issue via string replace
newHtml = newHtml.replace(
`          <div class="performance-label">Subject Performance & Consistency</div>
          
          <textarea class="performance-input" id="subjectAction" 
            placeholder="Action (e.g., 'Sprinting in terror')"
            style="min-height: 40px; margin-bottom: 8px;"></textarea>

          <textarea class="performance-input" id="subjectOutfit" 
            placeholder="Outfit lock (e.g., 'brown leather jacket, blue jeans')"
            style="min-height: 40px; margin-bottom: 8px;"></textarea>
          
          <textarea class="performance-input" id="actionTimeline" 
            placeholder="Action timeline (e.g., 'starts running, then stops and looks around, finally screams in fear')"
            style="min-height: 50px; margin-bottom: 15px;"></textarea>`,
`          <div class="performance-label">Subject Performance & Consistency</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr min-content; gap: 8px; margin-bottom: 10px; align-items: start;">
            <textarea class="performance-input" id="subjectAction" 
              placeholder="Action (e.g., 'Sprinting in terror')"
              style="height: 60px; min-height: 60px; margin: 0; resize: none;" oninput="updatePerformance()"></textarea>

            <textarea class="performance-input" id="subjectOutfit" 
              placeholder="Outfit lock (e.g., 'brown leather jacket')"
              style="height: 60px; min-height: 60px; margin: 0; resize: none;" oninput="updatePerformance()"></textarea>
            
            <textarea class="performance-input" id="actionTimeline" 
              placeholder="Timeline (e.g., 'runs, stops, screams')"
              style="height: 60px; min-height: 60px; margin: 0; resize: none;" oninput="updatePerformance()"></textarea>
            
            <button onclick="generateActionStandIn()" 
              style="width: 60px; height: 60px; padding: 5px; background-color: #cc3333; color: white; border: none; border-radius: 4px; cursor: pointer; font-family: inherit; font-weight: bold; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.2;">
              ACTION<br>POSE
            </button>
          </div>`);

// To avoid the Action Pose button duplicating since it was originally below it
newHtml = newHtml.replace(`			<button class="btn btn-secondary" onclick="generateActionStandIn()" style="width: 100%; margin-bottom: 10px; background-color: #272727; font-size: 10px;">✦ AI Compose Action Stand-In</button>`, '');

fs.writeFileSync('app.html', newHtml);
console.log('FLAWLESS VICTORY');
