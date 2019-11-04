import svg2img from '../src';
import expect from 'expect.js';
import btoa from 'btoa';
import fs from 'fs';
import { Image } from 'canvas';
import Image64 from 'node-base64-image';
import util from 'util';

describe('Convert SVG', function () {
    it('convert a svg file to png',function(done) {
        svg2img(__dirname+'/ph.svg').then( (data) => {
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        }).catch( (error) => {
            expect(error).not.to.be.ok();
            done();
        });
    });

    it('convert tiger file to png',function(done) {
        svg2img(__dirname+'/tiger.svg').then((data) => {
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        }).catch((error) => {
            expect(error).not.to.be.ok();
            done();
        });
    });

    it('convert a svg file and scale it',function(done) {
        svg2img(__dirname+'/ph.svg', {'width':400, 'height':400}).then((data) => {
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        }).catch((error) => {
            expect(error).not.to.be.ok();
            done();
        });
    });

    it('convert a svg file and scale it, keep preserveAspectRatio',function(done) {
        svg2img(__dirname+'/ph.svg', {'width':400, 'height':400, preserveAspectRatio:true}).then((data) => {
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        }).catch((error) => {
            expect(error).not.to.be.ok();
            done();
        });
    });

    // it('convert a remote svg file to png',function(done) {
    //     this.timeout(5000);
    //     svg2img('https://upload.wikimedia.org/wikipedia/commons/a/a0/Svg_example1.svg').then((data) => {
    //         expect(Buffer.isBuffer(data)).to.be.ok();
    //         expect(data.length).to.be.above(0);
    //     }).catch((error) => {
    //         expect(error).not.to.be.ok();
    //     }).finally(done);
    // });

    it('convert a svg string to png',function(done) {
        const svg = fs.readFileSync(__dirname+'/ph.svg');
        svg2img(svg).then((data) => {
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        }).catch((error) => {
            expect(error).not.to.be.ok();
            done();
        });
    });

    it('convert a svg string to jpg',function(done) {
        const svg = fs.readFileSync(__dirname+'/ph.svg');
        svg2img(svg, {format:'jpeg'}).then((data) => {
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        }).catch((error) => {
            expect(error).not.to.be.ok();
            done();
        });
    });

    it('convert a svg base64 to png',function(done) {
        let svg = fs.readFileSync(__dirname+'/ph.svg').toString('utf-8');
        svg = 'data:image/svg+xml;base64,'+ btoa(svg);
        svg2img(svg).then((data) => {
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        }).catch((error) => {
            expect(error).not.to.be.ok();
            done();
        });
    });

    // it('convert a svg with an image', function (done) {
    //     this.timeout(5000);
    //     const imageUrl = 'https://zh.wikipedia.org/static/images/project-logos/zhwiki-hans.png';
    //     Image64.encode(imageUrl, {}, function (err, base64) {
    //         expect(err).not.to.be.ok();
    //         expect(base64).to.be.ok();
    //         const svgString = util.format('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="540" height="258" ' +
    //             'viewBox="0 0 540 258"><image width="540" height="258" x="0" y="0" href="%s"></image></svg>', 'data:image/png;base64,' + base64.toString('base64'));
    //         svg2img(svgString).then((data) => {
    //             expect(Buffer.isBuffer(data)).to.be.ok();
    //             expect(data.length).to.be.above(0);
    //         }).catch((error) => {
    //             expect(error).not.to.be.ok();
    //         }).finally(done);
    //     });
    // });

    it('scale a svg with width and height in style', function (done) {
        svg2img(__dirname+'/fy.svg', {width : 20, height: 30}).then((data) => {
            const img = new Image();
            img.onload = function () {
                expect(img.width).to.be.eql(20);
                expect(img.height).to.be.eql(30);
                done();
            };
            img.src = data;
        }).catch((error) => {
            expect(error).not.to.be.ok();
            done();
        });
    });

    it('#20',function(done) {
        svg2img(__dirname+'/20.svg', {}).then((data) => {
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        }).catch((error) => {
            expect(error).not.to.be.ok();
            done();
        });
    });
});
