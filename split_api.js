const fs = require('fs');

try {
    let uiJs = fs.readFileSync('js/ui.js', 'utf8');

    // The API functions end right before EVENT LISTENERS & INITIALIZATION
    const splitMarker = '// ═══════════════════════════════════════════════════════════════════════════\n// EVENT LISTENERS & INITIALIZATION';
    
    const splitIdx = uiJs.indexOf(splitMarker);
    if (splitIdx !== -1) {
        const apiCode = uiJs.substring(0, splitIdx);
        const newUiCode = uiJs.substring(splitIdx);
        
        fs.writeFileSync('js/api.js', apiCode.trim());
        fs.writeFileSync('js/ui.js', newUiCode.trim());
        
        // Inject js/api.js script tag into app.html right before js/ui.js
        let html = fs.readFileSync('app.html', 'utf8');
        html = html.replace('<script src="js/ui.js"></script>', '<script src="js/api.js"></script>\n<script src="js/ui.js"></script>');
        fs.writeFileSync('app.html', html);
        
        console.log('Successfully split ui.js and api.js!');
    } else {
        console.log('Could not find split marker.');
    }
} catch (e) {
    console.error(e);
}
