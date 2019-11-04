# promise-svg2img

An in-memory convertor to convert svg to png/jpeg images that returns promises.
Based on [node-svg2img](https://github.com/fuzhenn/node-svg2img)

Please notice: this library is only for Node, can not run in browsers.

## Install

```bash
npm install svg2img
```

## Usage
### Conversion

To output JPEG image, you should install `node-canvas` with jpeg support.

```javascript
import fs from 'fs';
import svg2img from 'promise-svg2img';

const svgString = [
'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="236" height="120" ',
'viewBox="0 0 236 120">',
'<rect x="14" y="23" width="200" height="50" fill="#55FF55" stroke="black" stroke-width="1" />',
'</svg>'
].join('');

//1. convert from svg string
svg2img(svgString).then((buffer) => {
    //returns a Buffer
    fs.writeFileSync('foo1.png', buffer);
}).catch((error) => {
	
});

//2. convert from a local file
svg2img(__dirname+'/foo.svg').then((buffer) => {
    fs.writeFileSync('foo2.png', buffer);
}).catch((error) => {
    
});

//3. convert to jpeg file
svg2img(svgString, {format:'jpg','quality':75}).then((buffer) => {
    //default jpeg quality is 75
    fs.writeFileSync('foo5.jpg', buffer);
}).catch((error) => {
    
});
```

### Scale
You can scale the svg by giving width and height.
```javascript
svg2img(__dirname+'/foo.svg', {'width':800, 'height':600}).then((buffer) => {
    fs.writeFileSync('foo.png', buffer);
}).catch((error) => {
    
});
```

By default, the aspect ratio isn't preserved when scaling (same as `preserveAspectRatio="none"`). You can change it using `preserveAspectRatio` option. It can be `true` to keep original value or any other value to replace with.
```javascript
// use original preserveAspectRatio
svg2img(
    __dirname+'/foo.svg',
    {width:800, height:600, preserveAspectRatio:true})
    .then((buffer) => {
        fs.writeFileSync('foo.png', buffer);
    }).catch((error) => {
    	
});

// use custom preserveAspectRatio
svg2img(
    __dirname+'/foo.svg',
    {width:800, height:600, preserveAspectRatio:'xMinYMid meet'})
    .then((buffer) => {
        fs.writeFileSync('foo.png', buffer);
    }).catch((error) => {
    	
});
```

## Run the Test
```bash
    npm test
```
