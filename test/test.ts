const svg2img = require('../src');
const fs = require('fs');

svg2img(__dirname+'/tiger.svg', {'width':1400, 'height':100}).then((data: Buffer) => {
            fs.writeFileSync(__dirname+'/test.png', data);
        });
