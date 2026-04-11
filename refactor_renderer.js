const fs = require('fs');
const lines = fs.readFileSync('app.html', 'utf8').split('\n');

function findFunc(name) {
    const start = lines.findIndex(l => l.includes('function ' + name));
    if (start === -1) return {start: -1, end: -1};
    let braces = 0;
    let end = -1;
    for(let i = start; i < lines.length; i++) {
        if(lines[i].includes('{')) braces += (lines[i].match(/{/g) || []).length;
        if(lines[i].includes('}')) braces -= (lines[i].match(/}/g) || []).length;
        if(braces === 0 && lines[i].includes('}')) { end = i; break; }
    }
    return {start, end};
}

const fns = [
    'removeStudioBackground',
    'getTimeData',
    'getEnvironmentFilter',
    'getBlurAmount',
    'drawBackgroundWithSimpleDOF',
    'calculateEndFrameSettings',
    'applyLocalTilt',
    'drawCameraMovementLines',
    'renderSketchMode',
    'drawPinchCharacter',
    'drawCharacterWithShadow',
    'applyEffect',
    'renderStoryboard',
    'renderFrames'
];

let rendererJsContent = '// --- RENDERER CACHE POOL ---\n';
rendererJsContent += 'const OFFSCREEN_POOL = {\n';
rendererJsContent += '  blurBuffer: document.createElement("canvas"),\n';
rendererJsContent += '  charBuffer: document.createElement("canvas"),\n';
rendererJsContent += '  pinchBuffer: document.createElement("canvas")\n';
rendererJsContent += '};\n\n';

let removedRanges = [];

for(let fn of fns) {
    const {start, end} = findFunc(fn);
    if (start !== -1) {
        console.log(`Extracting ${fn}: ${start} to ${end}`);
        rendererJsContent += lines.slice(start, end + 1).join('\n') + '\n\n';
        removedRanges.push({start, end});
    } else {
        console.log(`Missing ${fn}`);
    }
}

fs.writeFileSync('js/renderer.js', rendererJsContent);

// Remove extracted blocks from highest index to lowest so lines don't shift
removedRanges.sort((a,b) => b.start - a.start);
for(let range of removedRanges) {
    lines.splice(range.start, range.end - range.start + 1);
}

// Inject <script src="js/renderer.js"></script> somewhere near the logic
// For now, write temp file to review
fs.writeFileSync('app_new.html', lines.join('\n'));
console.log('Done!');
