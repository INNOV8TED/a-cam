const fs = require('fs');

function extractState() {
    let content = fs.readFileSync('app.html', 'utf8');

    const sStart = content.indexOf('const S = {');
    const sEndMarker = '\n// Studio background removal';
    const sEnd = content.indexOf(sEndMarker);

    if (sStart !== -1 && sEnd !== -1) {
        const stateData = content.substring(sStart, sEnd);
        
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
        
        fs.writeFileSync('js/state.js', stateJsContent);
        
        const before = content.substring(0, sStart);
        const after = content.substring(sEnd);
        const htmlToInject = '<script src="js/state.js"></script>\n';
        
        fs.writeFileSync('app.html', before + htmlToInject + after);
        console.log('Successfully extracted state');
    } else {
        console.log('Error: bounds not found');
    }
}

extractState();
