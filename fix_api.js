const fs = require('fs');

let html = fs.readFileSync('app_new.html', 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
const scriptBody = html.substring(scriptStart + 8, scriptEnd);

const apiStartMarker = 'async function pushToProduction() {';
const apiEndMarker = '// EVENT LISTENERS';

const aStartIdx = scriptBody.indexOf(apiStartMarker);
const aEndIdx = scriptBody.indexOf(apiEndMarker);

console.log('API Start:', aStartIdx, 'API End:', aEndIdx);

if (aStartIdx !== -1 && aEndIdx !== -1) {
    const apiData = scriptBody.substring(aStartIdx, aEndIdx);
    fs.writeFileSync('js/api.js', apiData.trim());
    
    // UI gets the rest from aEndIdx down
    const uiData = scriptBody.substring(aEndIdx);
    fs.writeFileSync('js/ui.js', uiData.trim());
    console.log('Fixed API & UI separation!');
} else {
    console.log('Still failed to find bounds');
}
