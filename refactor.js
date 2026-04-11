const fs = require('fs');

function extractCSS() {
    let lines = fs.readFileSync('app.html', 'utf8').split('\n');
    let startMatch = lines.findIndex(l => l.includes('<style>'));
    let endMatch = lines.findIndex(l => l.includes('</style>'));

    if (startMatch !== -1 && endMatch !== -1) {
        let cssLines = lines.slice(startMatch + 1, endMatch);
        fs.writeFileSync('css/styles.css', cssLines.join('\n'));
        lines.splice(startMatch, endMatch - startMatch + 1, '<link rel="stylesheet" href="css/styles.css">');
        fs.writeFileSync('app.html', lines.join('\n'));
        console.log('Successfully extracted CSS');
    }
}

extractCSS();
