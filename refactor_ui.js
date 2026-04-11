const fs = require('fs');

try {
    let content = fs.readFileSync('app.html', 'utf8');

    const scriptStart = content.indexOf('<script>');
    const scriptEnd = content.lastIndexOf('</script>');

    if (scriptStart !== -1 && scriptEnd !== -1) {
        // Extract everything inside
        const jsBody = content.substring(scriptStart + 8, scriptEnd);
        fs.writeFileSync('js/ui.js', jsBody.trim());
        
        // Piece the HTML back together
        const before = content.substring(0, scriptStart);
        const after = content.substring(scriptEnd + 9);
        
        const importTag = '<script src="js/ui.js"></script>';
        
        fs.writeFileSync('app.html', before + importTag + after);
        console.log('Successfully extracted ui.js!');
    } else {
        console.log('Error bounds');
    }
} catch (e) {
    console.error(e);
}
