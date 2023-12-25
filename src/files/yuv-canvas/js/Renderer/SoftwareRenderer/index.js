"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require('events').EventEmitter;
const isEqual = require('lodash.isequal');
const YUVBuffer = require('yuv-buffer');
const YUVCanvas = require('yuv-canvas');
class Renderer {
    constructor() {
        this.cacheCanvasOpts = {};
        this.yuv = {};
        this.event = new EventEmitter();
        this.ready = false;
        this.contentMode = 0;
        this.container = {};
        this.canvas = {};
        this.element = {};
        this.mirrorView = false; // Will be cased mirror for remote video and desktop shared [gjb]
    }
    _calcZoom(vertical = false, contentMode = 0, width, height, clientWidth, clientHeight) {
        let localRatio = clientWidth / clientHeight;
        let tempRatio = width / height;
        if (isNaN(localRatio) || isNaN(tempRatio)) {
            return 1;
        }
        if (!contentMode) {
            // Mode 0
            if (vertical) {
                return clientHeight / clientWidth < width / height
                    ? clientWidth / height
                    : clientHeight / width;
            }
            else {
                return clientWidth / clientHeight > width / height
                    ? clientWidth / width
                    : clientHeight / height;
            }
        }
        else {
            // Mode 1
            if (vertical) {
                return clientHeight / clientWidth < width / height
                    ? clientHeight / width
                    : clientWidth / height;
            }
            else {
                return clientWidth / clientHeight > width / height
                    ? clientHeight / height
                    : clientWidth / width;
            }
        }
    }
    bind(element, isWebGL) {
        console.log(`YuvCanvas render webGL ${isWebGL}`);
        // record element
        this.element = element;
        // create container
        let container = document.createElement('div');
        Object.assign(container.style, {
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            //alignItems: 'center',
            //overflow: 'hidden',
        });
        this.container = container;
        element.appendChild(this.container);

        // create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        if(this.contentMode == 0){
            //keep the raw scale of the video
            this.canvas.style.objectFit = 'contain';
        }
        else if(this.contentMode == 1){
            //tailor it to the size of the window
            this.canvas.style.objectFit = 'cover';
        }
        else if(this.contentMode == 2){
            //stretch the video according to the window size
            this.canvas.style.objectFit = 'fill';
        }
        else {
            //keep the size of the original video
            this.canvas.style.objectFit = 'contain';
        }

        if (this.mirrorView) {
            this.canvas.style.transform = 'rotateY(180deg)';
        }
        this.container.appendChild(this.canvas);
        this.yuv = YUVCanvas.attach(this.canvas, { webGL: isWebGL });
        YUVCanvas.WebGLFrameSink.stripe = false;
        // Dragging the window will cause the screen to blink
        // const ResizeObserver = window.ResizeObserver ||
        //     window.WebKitMutationObserver ||
        //     window.MozMutationObserver;
        // if (ResizeObserver) {
        //     this.observer = new ResizeObserver(() => {
        //         this.refreshCanvas && this.refreshCanvas();
        //     });
        //     this.observer.observe(container);
        // }
    }
    bindForScreenShared(clientWidth,clientHeight,isWebGL){
        console.log(`YuvCanvas render webGL ${isWebGL}`);
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        if(this.contentMode == 0){
            //keep the raw scale of the video
            this.canvas.style.objectFit = 'contain';
        }
        else if(this.contentMode == 1){
            //tailor it to the size of the window
            this.canvas.style.objectFit = 'cover';
        }
        else if(this.contentMode == 2){
            //stretch the video according to the window size
            this.canvas.style.objectFit = 'fill';
        }
        else {
            //keep the size of the original video
            this.canvas.style.objectFit = 'contain';
        }

        this.yuv = YUVCanvas.attach(this.canvas, { webGL: isWebGL });
        YUVCanvas.WebGLFrameSink.stripe = false;
        //Dragging the window will cause the screen to blink
        // const ResizeObserver = window.ResizeObserver ||
        //     window.WebKitMutationObserver ||
        //     window.MozMutationObserver;
        // if (ResizeObserver) {
        //     this.observer = new ResizeObserver(() => {
        //         this.refreshCanvas && this.refreshCanvas();
        //     });
        //     this.observer.observe(container);
        // }
    }
    unbind() {
        this.observer && this.observer.unobserve && this.observer.disconnect();
        try {
            if (this.container &&
                this.canvas &&
                this.canvas.parentNode === this.container) {
                this.container.removeChild(this.canvas);
            }
            if (this.element &&
                this.container &&
                this.container.parentNode === this.element) {
                this.element && this.element.removeChild(this.container);
            }
        }
        catch (error) {
            console.warn(e);
        }
        this.yuv = null;
        this.element = null;
        this.canvas = null;
        this.view = null;
    }
    unbindForScreenShared(){
        this.observer && this.observer.unobserve && this.observer.disconnect();
        this.yuv = null;
        this.canvas = null;
    }
    equalsElement(element) {
        return this.element === element;
    }
    refreshCanvas() {
        if (this.cacheCanvasOpts) {
            try {
                this.updateCanvas(this.cacheCanvasOpts, false);
            }
            catch (error) { }
        }
    }
    updateCanvas(options = {
        width: 0,
        height: 0,
        rotation: 0,
        mirrorView: false,
        contentMode: 0,
        clientWidth: 0,
        clientHeight: 0,
        contentWidth,
        contentHeight,
    }, isOpenCache = true) {
        // check if display options changed
        if (isOpenCache && isEqual(this.cacheCanvasOpts, options)) {
            return;
        }
        this.cacheCanvasOpts = options;
        // check for rotation
        if (options.rotation === 0 || options.rotation === 180) {
            this.canvas.width = options.width;
            this.canvas.height = options.height;
            /*Object.assign(this.canvas.style, {
                'width': options.width + 'px',
                'height': options.height + 'px',
                'object-fit': 'cover',
            });*/
        }
        else if (options.rotation === 90 || options.rotation === 270) {
            this.canvas.height = options.width;
            this.canvas.width = options.height;
            /*Object.assign(this.canvas.style, {
                'width': options.width + 'px',
                'height': options.height + 'px',
                'object-fit': 'cover',
            });*/
        }
        else {
            throw new Error('Invalid value for rotation. Only support 0, 90, 180, 270');
        }

        //  Don't need to setting mirror when updateCanvas [gjb]
        //let transformItems = [];
        //transformItems.push(`rotateZ(${options.rotation}deg)`);

        // Don't need to scale [gjb]
        //let scale = this._calcZoom(options.rotation === 90 || options.rotation === 270, options.contentMode, options.contentWidth, options.contentHeight, options.clientWidth, options.clientHeight);
        // transformItems.push(`scale(${scale})`)
        //this.canvas.style.zoom = scale;
        
        //  Don't need to setting mirror when updateCanvas  [gjb]
        // check for mirror
        //if (options.mirrorView) {
            // this.canvas.style.transform = 'rotateY(180deg)';
            //transformItems.push('rotateY(180deg)');
        //}
        //if (transformItems.length > 0) {
            //let transform = `${transformItems.join(' ')}`;
            //this.canvas.style.transform = transform;
        //}
    }
    drawFrame(imageData = { header, yUint8Array, uUint8Array, vUint8Array }) {
        if (!this.ready) {
            this.ready = true;
            this.event.emit('ready');
        }
        let dv = new DataView(imageData.header);
        // let format = dv.getUint8(0);
        let mirror = dv.getUint8(1);
        let contentWidth = dv.getUint16(2);
        let contentHeight = dv.getUint16(4);
        let left = dv.getUint16(6);
        let top = dv.getUint16(8);
        let right = dv.getUint16(10);
        let bottom = dv.getUint16(12);
        let rotation = dv.getUint16(14);
        // let ts = dv.getUint32(16);
        let strideY = dv.getUint16(20);
        let strideU = dv.getUint16(22);
        let strideV = dv.getUint16(24);

        let width = contentWidth + left + right;
        let height = contentHeight + top + bottom;
        this.updateCanvas({
            width,
            height,
            rotation,
            mirrorView: mirror,
            contentMode: this.contentMode,
            clientWidth: this.container.clientWidth != undefined ? this.container.clientWidth : this.canvas.width,
            clientHeight: this.container.clientHeight != undefined ? this.container.clientHeight : this.canvas.height,
            contentWidth,
            contentHeight,
        });
        let format = YUVBuffer.format({
            width,
            height,
            chromaWidth: width / 2,
            chromaHeight: height / 2,
        });
        //Specify a stride to solve the black screen problem caused by the change of application window size when sharing applications
        let y = YUVBuffer.lumaPlane(format, imageData.yUint8Array,strideY);
        let u = YUVBuffer.chromaPlane(format, imageData.uUint8Array,strideU);
        let v = YUVBuffer.chromaPlane(format, imageData.vUint8Array,strideV);
        let frame = YUVBuffer.frame(format, y, u, v);
        this.yuv.drawFrame(frame);
    }
    drawFrameForScreenShared(imageData = { header, yUint8Array, uUint8Array, vUint8Array }){
        this.drawFrame(imageData);
    }
    getOneFrame(){
        var image = new Image();
        image.src = this.canvas.toDataURL("image/png");
        return image;
    }
    setContentMode(mode = 0) {
        this.contentMode = mode;
    }
    getContentMode() {
        return this.contentMode;
    }
    setCanvasMirror(mirror){
        this.mirrorView = mirror;
        if(this.canvas){
            if (this.mirrorView) {
                this.canvas.style.transform = 'rotateY(180deg)';
            }
            else{
                this.canvas.style.transform = '';
            }
        }
    }
}
exports.default = Renderer;
