const fs = require('fs');
let content = fs.readFileSync('app_new.html', 'utf8');

const injection = '<script src="js/state.js"></script>\n<script src="js/renderer.js"></script>\n';
content = content.replace('</body>', injection + '</body>');

fs.writeFileSync('app.html', content);
console.log('Done mapping app.html!');
