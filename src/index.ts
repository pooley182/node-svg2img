import '@babel/polyfill';
import canvg from 'canvg';
import atob from 'atob';
import * as fs from 'fs';
import http, {ClientRequest} from 'http';
import https from 'https';
import { Canvas, createCanvas } from 'canvas';

interface Options {
    width?: number;
    height?: number;
    preserveAspectRatio?: boolean;
    format?: string;
    quality?: number
}
/**
 * Main method
 * @param  {String}   svg      - a svg string, or a base64 string starts with "data:image/svg+xml;base64", or a file url (http or local)
 * @param  {Object} [options=null]          - options
 * @param  {Object} [options.format=png]    - format of the image: png or jpeg, default is png
 */
async function svg2img(svg: Buffer | string, options?: Options): Promise<Buffer> {
    return new Promise( async (resolve, reject) => {
        if (!options) {
            options = {};
        }
        let content = await loadSVGContent(svg);

        if (!content) {
            return Promise.reject();
        }
        if (options.width || options.height) {
            content = scale(content, options.width, options.height, options.preserveAspectRatio);
        }
        let format = options.format;
        if (!format) {
            format = 'png';
        }
        const canvas = convert(content, options);
        let stream;
        if (format === 'jpg' || format === 'jpeg') {
            stream = canvas.createJPEGStream({
                quality: options.quality // JPEG quality (0-100) default: 75
            });
        } else {
            stream = canvas.createPNGStream();
        }
        let data: Uint8Array[] = [];
        // const pos = 0;
        stream.on('data', (chunk) => {
            data.push(chunk);
        });
        stream.on('error', (error) => {
            reject(error);
        });
        stream.on('end', () => {
            resolve(Buffer.concat(data));
        });
    });
}

function convert(svgContent: string, options: Options): Canvas {
    const canvas = createCanvas(options.width||100, options.height||100);
    // @ts-ignore canvg will happily take our typeof Canvas
    canvg(canvas, svgContent, { ignoreMouse: true, ignoreAnimation: true,});
    return canvas;
}

function scale(svgContent: string , w: number | undefined, h: number | undefined, preserveAspectRatio: boolean | string | undefined) {
    const index = svgContent.indexOf('<svg');
    let svgTagArr = [];
    let svgTag: string;
    let endIndex = index;
    for (let i = index; i < svgContent.length; i++) {
        let char = svgContent.charAt(i);
        svgTagArr.push(char);
        if (char === '>') {
          endIndex = i;
          break;
        }
    }
    svgTag = svgTagArr.join('').replace(/\n/g, ' ').replace(/\r/g, '');
    let finalAspectRatio;
    if (preserveAspectRatio) {
        if (typeof preserveAspectRatio === 'string') {
            finalAspectRatio = '"' + preserveAspectRatio + '"';
        } else {
            if (/ preserveAspectRatio\W/.test(svgContent)) {
                const quoCharArr: RegExpMatchArray | null = svgTag.match(/ preserveAspectRatio\s*=\s*(['"])/);
                let quoChar;
                if (quoCharArr) {
                    quoChar = quoCharArr[1];
                    const aspectRatio = svgTag.match(new RegExp(' preserveAspectRatio\\s*=\\s*' + quoChar + '([^' + quoChar + ']*)'));
                    if (aspectRatio && aspectRatio[1]) {
                        finalAspectRatio = aspectRatio[1].replace(/^\s*(\S.*\S)\s*$/, '"$1"');
                    }
                }
            }
        }
    }
    let props: any = {};
    const splits = svgTag.substring(4, svgTag.length-1).split(' ');
    let lastKey: string | undefined = undefined;
    for (let i = 0; i < splits.length; i++) {
        if (splits[i] === '') {
            // continue;
        } else {
            if (splits[i].indexOf('=') < 0 && lastKey) {
                props[lastKey] = props[lastKey]+' '+splits[i];
            } else {
                let keyvalue = splits[i].split('=');
                lastKey = keyvalue[0];
                props[lastKey] = keyvalue[1];
            }
        }
    }
    const ow = props['width'] ? parseInt(props['width'].replace('"',''), 10) : null;
    const oh = props['height'] ? parseInt(props['height'].replace('"',''), 10) : null;
    if (w) {
        props['width'] = '"'+w+'"';
    }
    if (h) {
        props['height'] = '"'+h+'"';
    }
    if (!props['viewBox']) {
        props['viewBox'] = '"'+[0,0,ow?ow:w,oh?oh:h].join(' ')+'"';
    }
    props['preserveAspectRatio'] = finalAspectRatio || '"none"';

    // update width and height in style attribute
    if (props['style'] && props['style'].length > 2) {
        let styleUpdated = false;
        const styleStr = props['style'].substring(1, props['style'].length - 1);
        const styles = styleStr.split(';');
        for (let i = 0; i < styles.length; i++) {
            const styleKV = styles[i].split(':');
            if (styleKV.length === 2) {
                const key = styleKV[0].trim();
                if (key === 'width') {
                    styles[i] = 'width : ' + w +'px';
                    styleUpdated = true;
                } else if (key === 'height') {
                    styles[i] = 'height : ' + h +'px';
                    styleUpdated = true;
                }
            }
        }
        if (styleUpdated) {
            props['style'] = '"' + styles.join(';') + '"';
        }
    }

    const newSvgTag = ['<svg'];
    for (const p in props) {
        newSvgTag.push(p+'='+props[p]);
    }
    newSvgTag.push('>');
    return svgContent.substring(0, index)+newSvgTag.join(' ')+svgContent.substring(endIndex+1);
}

function loadSVGContent(svg: Buffer | string): Promise<string | undefined> {
    if (Buffer.isBuffer(svg)) {
        svg = svg.toString();
    }
    if (svg.indexOf('data:image/svg+xml;base64,') >= 0) {
        return Promise.resolve(atob(svg.substring('data:image/svg+xml;base64,'.length)));
    } else if (svg.indexOf('<svg') >= 0) {
        return Promise.resolve(svg);
    } else {
        if (svg.indexOf('http://')>=0 || svg.indexOf('https://')>=0) {
            return loadRemoteImage(svg);
        } else {
            return new Promise( (resolve, reject) => {
                fs.readFile(svg, function (error, data) {
                    if (error) {
                        reject(undefined);
                    }
                    resolve(data.toString('utf-8'));
                });
            });
        }
    }
}

function loadRemoteImage(url: string): Promise<string | undefined> {

    return new Promise( (resolve, reject) =>{
        //http
        let loader;
        if (url.indexOf('https://') >= 0) {
            loader = https;
        } else {
            loader = http;
        }
        const res: ClientRequest = loader.get(url);

        let data: Uint8Array[] = [];
        let body: string = "";
        res.on('data', (chunk) => {
            data.push(chunk)
        });
        res.on('finish', () => {
            try {
                body = Buffer.concat(data).toString('utf-8').toString();
            } catch (e) {
                reject(e);
            }
            if ( body !== "") {
                resolve(body);
            } else {
                reject();
            }
        });
    });
}

export default svg2img;

