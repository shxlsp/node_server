"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createProgramFromSources = require('./webgl-utils').createProgramFromSources;
const EventEmitter = require('events').EventEmitter;
const { config } = require('../../Utils/index');
var g_webglLostCount = 0;
var g_maxWebGlContext = function (){
    //arg => arg.startsWith('--max-active-webgl-contexts=')作为搜索函数传入findIndex,对于数组中的每个元素，findIndex 方法都会将其作为参数传递给搜索函数,
    //并检查它是否满足搜索条件。如果找到满足条件的元素，findIndex 方法将返回该元素的索引，否则返回 -1。
    const index = process.argv.findIndex(arg => arg.startsWith('--max-active-webgl-contexts='));
    let maxContexts = index !== -1 ? parseInt(process.argv[index].split('=')[1]) : 16;
    console.log('Browser supports max WebGL contexts:', maxContexts);
    return maxContexts;
}();

const JRender = function () {
    let gl;
    let program;
    let positionLocation;
    let texCoordLocation;
    let yTexture;
    let uTexture;
    let vTexture;
    let texCoordBuffer;
    let surfaceBuffer;
    let texCoordFloatArray = new Float32Array(12);
    const that = {
        view: undefined,
        mirrorView: false,
        container: undefined,
        canvas: undefined,
        renderImageCount: 0,
        dropImageCount: 0,
        callbackLogFunc:undefined,
        callbackReportFunc: undefined,
        streamId:"",
        renderFps:20.0,
        renderLogTime:0,
        oldRenderTime:0,
        yuvtimeDifArray:[],
        yuvDelayArray:[],
        tongjiTime:0,
        initWidth: 0,
        initHeight: 0,
        initRotation: 0,
        // canvasUpdated: false,
        clientWidth: 0,
        clientHeight: 0,
        // 0 - contain, 1 - cover, 2 - fill, other - contain
        contentMode: 0,
        event: new EventEmitter(),
        firstFrameRender: false,
        lastImageWidth: 0,
        lastImageHeight: 0,
        lastImageRotation: 0,
        lastRestoreCanvasTime:0,
        fnWebglContextLostCB: undefined,
        videoBuffer: {}
    };
    that.enableLoseContext = function () {
        gl.getExtension('WEBGL_lose_context').loseContext();
    };
    that.setContentMode = function (mode) {
        that.contentMode = mode;
    };
    that.getContentMode = function () {
        return that.contentMode;
    };
    that.bind = function (view) {
        initCanvas(view, that.mirrorView, view.clientWidth, view.clientHeight, that.initRotation, console.warn);
    };
    that.setLogCallback = function (streamId,funcLog,funcReport) {
        that.callbackLogFunc = funcLog;
        that.callbackReportFunc = funcReport;
        that.streamId = streamId;
    };
    that.bindForScreenShared = function (clientWidth,clientHeight) {
        initCanvasForScreenShared(that.mirrorView, clientWidth, clientHeight, that.initRotation, console.warn);
    };
    that.unbind = function () {
        // that.canvas.removeEventListener('webglcontextlost', handleWebglContextLost);
        // that.canvas.removeEventListener('webglcontextrestored', handleWebglContextRestored);
        // if(gl.isContextLost() && g_webglLostCount > 0){
        //     g_webglLostCount--;
        // }
        // try {
        //     gl && gl.getExtension('WEBGL_lose_context') && gl.getExtension('WEBGL_lose_context').loseContext();
        // }
        // catch (err) {
        //     console.warn(err);
        // }
        
        // program = undefined;
        // positionLocation = undefined;
        // texCoordLocation = undefined;
        // deleteTexture(yTexture);
        // deleteTexture(uTexture);
        // deleteTexture(vTexture);
        // yTexture = undefined;
        // uTexture = undefined;
        // vTexture = undefined;
        // deleteBuffer(texCoordBuffer);
        // deleteBuffer(surfaceBuffer);
        // texCoordBuffer = undefined;
        // surfaceBuffer = undefined;
        //gl = undefined;
        releaseWebglResource();
        destroyCanvas();

        try {
            //that.container && that.container.removeChild(that.canvas);
            that.view && that.view.removeChild(that.container);
        }
        catch (e) {
            console.warn(e);
        }
        //that.canvas = undefined;
        that.container = undefined;
        that.view = undefined;
        //that.mirrorView = false;
    };
    that.unbindForScreenShared = function () {
        that.canvas.removeEventListener('webglcontextlost', handleWebglContextLost);
        that.canvas.removeEventListener('webglcontextrestored', handleWebglContextRestored);
        try {
            gl && gl.getExtension('WEBGL_lose_context') && gl.getExtension('WEBGL_lose_context').loseContext();
        }
        catch (err) {
            console.warn(err);
        }
        program = undefined;
        positionLocation = undefined;
        texCoordLocation = undefined;
        deleteTexture(yTexture);
        deleteTexture(uTexture);
        deleteTexture(vTexture);
        yTexture = undefined;
        uTexture = undefined;
        vTexture = undefined;
        deleteBuffer(texCoordBuffer);
        deleteBuffer(surfaceBuffer);
        texCoordBuffer = undefined;
        surfaceBuffer = undefined;
        gl = undefined;
        that.canvas = undefined;
        that.view = undefined;
        that.mirrorView = false;
    };
    that.refreshCanvas = function () {
        if (that.lastImageWidth) {
            updateViewZoomLevel(that.lastImageRotation, that.lastImageWidth, that.lastImageHeight);
        }
    };
    that.renderImage = function (image) {
        // Rotation, width, height, left, top, right, bottom, yplane, uplane, vplane
        if (!gl) {
            console.log('!gl');
            return;
        }
        if (gl.isContextLost()) {
            var curWebglContextCounts = getCurWebglContextCount();
            if(curWebglContextCounts - g_webglLostCount < g_maxWebGlContext && curWebglContextCounts - g_webglLostCount >= 0){
                var cur_timestamp = new Date().getTime();
                var dif_time= cur_timestamp - that.lastRestoreCanvasTime;
                if(dif_time > 3000){
                    if(that.callbackLogFunc){
                        that.callbackLogFunc('[recreate canvas]'+' streamId:'+ that.streamId + '. curWebglContextCounts:' + curWebglContextCounts + '. g_webglLostCount:' + g_webglLostCount + '. g_maxWebGlContext:' + g_maxWebGlContext);
                    }
                    destroyCanvas();
                    createAndInitCanvas(that.initRotation,that.initWidth,that.initHeight);
                    setupGL();
                    that.lastRestoreCanvasTime = cur_timestamp;
                }
            }
            return;
        }

        if (image.width != that.initWidth ||
            image.height != that.initHeight ||
            image.rotation != that.initRotation) {
            const view = that.view;
            that.unbind();
            // Console.log('init canvas ' + image.width + "*" + image.height + " rotation " + image.rotation);
            initCanvas(view, that.mirrorView, image.width, image.height, image.rotation, e => {
                console.error(`init canvas ${image.width}*${image.height} rotation ${image.rotation} failed. ${e}`);
            });
        }
        // Console.log(image.width, "*", image.height, "planes "
        //    , " y ", image.yplane[0], image.yplane[image.yplane.length - 1]
        //    , " u ", image.uplane[0], image.uplane[image.uplane.length - 1]
        //    , " v ", image.vplane[0], image.vplane[image.vplane.length - 1]
        // );
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        const xWidth = image.width + image.left + image.right;
        const xHeight = image.height + image.top + image.bottom;
        texCoordFloatArray[0] = image.left / xWidth;
        texCoordFloatArray[1] = image.bottom / xHeight;
        texCoordFloatArray[2] = 1 - image.right / xWidth;
        texCoordFloatArray[3] = image.bottom / xHeight;
        texCoordFloatArray[4] = image.left / xWidth;
        texCoordFloatArray[5] = 1 - image.top / xHeight;
        texCoordFloatArray[6] = image.left / xWidth;
        texCoordFloatArray[7] = 1 - image.top / xHeight;
        texCoordFloatArray[8] = 1 - image.right / xWidth;
        texCoordFloatArray[9] = image.bottom / xHeight;
        texCoordFloatArray[10] = 1 - image.right / xWidth;
        texCoordFloatArray[11] = 1 - image.top / xHeight;
        gl.bufferData(gl.ARRAY_BUFFER, texCoordFloatArray, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        uploadYuv(xWidth, xHeight, image.yplane, image.uplane, image.vplane);
        updateCanvas(image.rotation, image.width, image.height);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        that.renderImageCount += 1;
        if (!that.firstFrameRender) {
            that.firstFrameRender = true;
            that.event.emit('ready');
        }
    };
    that.renderImageForScreenShared = function (image) {
        // Rotation, width, height, left, top, right, bottom, yplane, uplane, vplane
        if (!gl) {
            console.log('!gl');
            return;
        }
        if (gl.isContextLost()) {
            return;
        }

        if (image.width != that.initWidth ||
            image.height != that.initHeight ||
            image.rotation != that.initRotation ||
            image.mirror != that.mirrorView) {
            const view = that.view;
            that.unbindForScreenShared();
            // Console.log('init canvas ' + image.width + "*" + image.height + " rotation " + image.rotation);
            initCanvasForScreenShared(image.mirror, image.width, image.height, image.rotation, e => {
                console.error(`init canvas ${image.width}*${image.height} rotation ${image.rotation} failed. ${e}`);
            });
        }
        // Console.log(image.width, "*", image.height, "planes "
        //    , " y ", image.yplane[0], image.yplane[image.yplane.length - 1]
        //    , " u ", image.uplane[0], image.uplane[image.uplane.length - 1]
        //    , " v ", image.vplane[0], image.vplane[image.vplane.length - 1]
        // );
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        const xWidth = image.width + image.left + image.right;
        const xHeight = image.height + image.top + image.bottom;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            image.left / xWidth,
            image.bottom / xHeight,
            1 - image.right / xWidth,
            image.bottom / xHeight,
            image.left / xWidth,
            1 - image.top / xHeight,
            image.left / xWidth,
            1 - image.top / xHeight,
            1 - image.right / xWidth,
            image.bottom / xHeight,
            1 - image.right / xWidth,
            1 - image.top / xHeight
        ]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        uploadYuv(xWidth, xHeight, image.yplane, image.uplane, image.vplane);
        updateCanvas(image.rotation, image.width, image.height);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        that.renderImageCount += 1;
        if (!that.firstFrameRender) {
            that.firstFrameRender = true;
            that.event.emit('ready');
        }
    };
    that.getOneFrame = function(){
        var image = new Image();
        if (!gl.isContextLost()) {
            image.src = that.canvas.toDataURL("image/png");
        }
        return image;
    };
    that.getCurView = function(){
        return that.view;
    };
    /**
     * draw image with params
     * @private
     * @param {*} render
     * @param {*} header
     * @param {*} yplanedata
     * @param {*} uplanedata
     * @param {*} vplanedata
     */
    that.drawFrame = function ({ header, yUint8Array, uUint8Array, vUint8Array ,timestamp}) {

        // if(that.prevTimestamp > 0){
        //     var cur_time = new Date().getTime();
        //     var dif_yuv_ts = timestamp - that.prevTimestamp;
        //     var delay_yuv_ts = cur_time - timestamp;
        //     that.yuvtimeDifArray.push(dif_yuv_ts);
        //     that.yuvDelayArray.push(delay_yuv_ts);

        //     if(that.tongjiTime == 0){
        //         that.tongjiTime = cur_time;
        //     }
        //     if((cur_time - that.tongjiTime) > 4000){
        //         var sum_t = 0;
        //         for(var i = 0;i < that.yuvtimeDifArray.length;i++){
        //             sum_t = sum_t + that.yuvtimeDifArray[i];
        //         }
        //         if(sum_t > 0){
        //             var fps_act = 1000.0/(sum_t / that.yuvtimeDifArray.length);
        //             console.log(`glrender drawFrame fps_act = `,fps_act);
        //         }
        //         var sum_delay = 0;
        //         for(var i = 0;i < that.yuvDelayArray.length;i++){
        //             sum_delay = sum_delay + that.yuvDelayArray[i];
        //         }
        //         var delay = sum_delay / that.yuvDelayArray.length;
        //         console.log(`glrender drawFrame delay = `,delay);
                
        //         that.yuvtimeDifArray = [];
        //         that.yuvDelayArray = [];
        //         that.tongjiTime = cur_time;
        //     }
        // }
        // that.prevTimestamp = timestamp;
        
        var cur_timestamp = new Date().getTime();
        var dif_time= cur_timestamp - that.oldRenderTime;
        
        if((cur_timestamp - that.renderLogTime) > 15000){
            if(that.callbackLogFunc){
                that.callbackLogFunc('[glrender]'+' streamId:'+that.streamId 
                + ' canvasW:'+that.canvas.width 
                + ' canvasH:'+that.canvas.height
                + ' renderCount:'+that.renderImageCount 
                + ' dropCount:' + that.dropImageCount 
                + ' dif_time:' + dif_time 
                + ' renderFps:'+that.renderFps);
            }
            that.renderLogTime = cur_timestamp;
            that.renderImageCount = 0;
            that.dropImageCount = 0;
        }
        
        if(dif_time < (1000.0/that.renderFps)){
            that.dropImageCount += 1;
            return;
        }
        that.oldRenderTime = cur_timestamp;

        var headerLength = 20;
        var dv = new DataView(header);
        var format = dv.getUint8(0);
        var mirror = dv.getUint8(1);
        var width = dv.getUint16(2);
        var height = dv.getUint16(4);
        var left = dv.getUint16(6);
        var top = dv.getUint16(8);
        var right = dv.getUint16(10);
        var bottom = dv.getUint16(12);
        var rotation = dv.getUint16(14);
        var ts = dv.getUint32(16);
        var xWidth = width + left + right;
        var xHeight = height + top + bottom;
        var yLength = xWidth * xHeight;
        var yBegin = headerLength;
        var yEnd = yBegin + yLength;
        var uLength = yLength / 4;
        var uBegin = yEnd;
        var uEnd = uBegin + uLength;
        var vLength = yLength / 4;
        var vBegin = uEnd;
        var vEnd = vBegin + vLength;
        if (!this.videoBuffer.hasOwnProperty('width')) {
            this.videoBuffer.width = xWidth;
            this.videoBuffer.height = xHeight;
            this.videoBuffer.yplane = new Uint8Array(yLength);
            this.videoBuffer.uplane = new Uint8Array(uLength);
            this.videoBuffer.vplane = new Uint8Array(vLength);
        }
        else if (this.videoBuffer.width != xWidth || this.videoBuffer.height != xHeight) {
            this.videoBuffer.width = xWidth;
            this.videoBuffer.height = xHeight;
            this.videoBuffer.yplane = new Uint8Array(yLength);
            this.videoBuffer.uplane = new Uint8Array(uLength);
            this.videoBuffer.vplane = new Uint8Array(vLength);
        }
        this.videoBuffer.yplane.set(yUint8Array);
        this.videoBuffer.uplane.set(uUint8Array);
        this.videoBuffer.vplane.set(vUint8Array);
        that.renderImage({
            mirror: mirror,
            width,
            height,
            left,
            top,
            right,
            bottom,
            rotation: rotation,
            yplane: this.videoBuffer.yplane,
            uplane: this.videoBuffer.uplane,
            vplane: this.videoBuffer.vplane
        });
        var now32 = (Date.now() & 0xffffffff) >>> 0;
        var latency = now32 - ts;
    };
    /**
     * draw image with params
     * @private
     * @param {*} render
     * @param {*} header
     * @param {*} yplanedata
     * @param {*} uplanedata
     * @param {*} vplanedata
     */
     that.drawFrameForScreenShared = function ({ header, yUint8Array, uUint8Array, vUint8Array }) {
        var headerLength = 20;
        var dv = new DataView(header);
        var format = dv.getUint8(0);
        var mirror = dv.getUint8(1);
        var width = dv.getUint16(2);
        var height = dv.getUint16(4);
        var left = dv.getUint16(6);
        var top = dv.getUint16(8);
        var right = dv.getUint16(10);
        var bottom = dv.getUint16(12);
        var rotation = dv.getUint16(14);
        var ts = dv.getUint32(16);
        var xWidth = width + left + right;
        var xHeight = height + top + bottom;
        var yLength = xWidth * xHeight;
        var yBegin = headerLength;
        var yEnd = yBegin + yLength;
        var uLength = yLength / 4;
        var uBegin = yEnd;
        var uEnd = uBegin + uLength;
        var vLength = yLength / 4;
        var vBegin = uEnd;
        var vEnd = vBegin + vLength;
        if (!this.videoBuffer.hasOwnProperty('width')) {
            this.videoBuffer.width = xWidth;
            this.videoBuffer.height = xHeight;
            this.videoBuffer.yplane = new Uint8Array(yLength);
            this.videoBuffer.uplane = new Uint8Array(uLength);
            this.videoBuffer.vplane = new Uint8Array(vLength);
        }
        else if (this.videoBuffer.width != xWidth || this.videoBuffer.height != xHeight) {
            this.videoBuffer.width = xWidth;
            this.videoBuffer.height = xHeight;
            this.videoBuffer.yplane = new Uint8Array(yLength);
            this.videoBuffer.uplane = new Uint8Array(uLength);
            this.videoBuffer.vplane = new Uint8Array(vLength);
        }
        this.videoBuffer.yplane.set(yUint8Array);
        this.videoBuffer.uplane.set(uUint8Array);
        this.videoBuffer.vplane.set(vUint8Array);
        that.renderImageForScreenShared({
            mirror: mirror,
            width,
            height,
            left,
            top,
            right,
            bottom,
            rotation: rotation,
            yplane: this.videoBuffer.yplane,
            uplane: this.videoBuffer.uplane,
            vplane: this.videoBuffer.vplane
        });
        var now32 = (Date.now() & 0xffffffff) >>> 0;
        var latency = now32 - ts;
    };
    that.setCanvasMirror = function(mirror){
        that.mirrorView = mirror;
        if(that.canvas){
            if (that.mirrorView) {
                that.canvas.style.transform = 'rotateY(180deg)';
            }
            else{
                that.canvas.style.transform = '';
            }
        }
    };

    that.setWebGLContextLostCallback = function(webglContextLostCB){
        that.fnWebglContextLostCB = webglContextLostCB;
    };

    function uploadYuv(width, height, yplane, uplane, vplane) {
        var e;
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, yTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width, height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, yplane);
        if (config.getGlDebug()) {
            e = gl.getError();
            if (e != gl.NO_ERROR) {
                console.log('upload y plane ', width, height, yplane.byteLength, ' error', e);
            }
        }
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, uTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width / 2, height / 2, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, uplane);
        if (config.getGlDebug()) {
            e = gl.getError();
            if (e != gl.NO_ERROR) {
                console.log('upload u plane ', width, height, yplane.byteLength, ' error', e);
            }
        }
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, vTexture);
        ('');
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width / 2, height / 2, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, vplane);
        if (config.getGlDebug()) {
            e = gl.getError();
            if (e != gl.NO_ERROR) {
                console.log('upload v plane ', width, height, yplane.byteLength, ' error', e);
            }
        }
    }
    function deleteBuffer(buffer) {
        if (buffer && gl) {
            gl.deleteBuffer(buffer);
        }
    }
    function deleteTexture(texture) {
        if (texture && gl) {
            gl.deleteTexture(texture);
        }
    }
    const vertexShaderSource = 'attribute vec2 a_position;' +
        'attribute vec2 a_texCoord;' +
        'uniform vec2 u_resolution;' +
        'varying vec2 v_texCoord;' +
        'void main() {' +
        'vec2 zeroToOne = a_position / u_resolution;' +
        '   vec2 zeroToTwo = zeroToOne * 2.0;' +
        '   vec2 clipSpace = zeroToTwo - 1.0;' +
        '   gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);' +
        'v_texCoord = a_texCoord;' +
        '}';
    const yuvShaderSource = 'precision mediump float;' +
        'uniform sampler2D Ytex;' +
        'uniform sampler2D Utex,Vtex;' +
        'varying vec2 v_texCoord;' +
        'void main(void) {' +
        '  float nx,ny,r,g,b,y,u,v;' +
        '  mediump vec4 txl,ux,vx;' +
        '  nx=v_texCoord[0];' +
        '  ny=v_texCoord[1];' +
        '  y=texture2D(Ytex,vec2(nx,ny)).r;' +
        '  u=texture2D(Utex,vec2(nx,ny)).r;' +
        '  v=texture2D(Vtex,vec2(nx,ny)).r;' +
        '  y=1.1643*(y-0.0625);' +
        '  u=u-0.5;' +
        '  v=v-0.5;' +
        '  r=y+1.5958*v;' +
        '  g=y-0.39173*u-0.81290*v;' +
        '  b=y+2.017*u;' +
        '  gl_FragColor=vec4(r,g,b,1.0);' +
        '}';
    
    function releaseWebglResource(){
        program = undefined;
        positionLocation = undefined;
        texCoordLocation = undefined;
        deleteTexture(yTexture);
        deleteTexture(uTexture);
        deleteTexture(vTexture);
        yTexture = undefined;
        uTexture = undefined;
        vTexture = undefined;
        deleteBuffer(texCoordBuffer);
        deleteBuffer(surfaceBuffer);
        texCoordBuffer = undefined;
        surfaceBuffer = undefined;
    }

    function handleWebglContextLost(event) {
        g_webglLostCount++;
        console.log("handleWebglContextLost" + g_webglLostCount);
        if(that.callbackLogFunc){
            that.callbackLogFunc('[glrender]'+' streamId:'+that.streamId + ' handleWebglContextLost.' + ' g_webglLostCount:' + g_webglLostCount);
        }
        if(that.callbackReportFunc){
            that.callbackReportFunc(25000004,'[glrender]'+' streamId:'+that.streamId + ' handleWebglContextLost.' + ' g_webglLostCount:' + g_webglLostCount,1);
        }
        event.preventDefault();
        releaseWebglResource();
    }

    function handleWebglContextRestored(event) {
        if(g_webglLostCount > 0){
            g_webglLostCount--;
        }
        console.log("handleWebglContextRestored" + g_webglLostCount);
        if(that.callbackLogFunc){
            that.callbackLogFunc('[glrender]'+' streamId:'+that.streamId + ' handleWebglContextRestored.' + ' g_webglLostCount:' + g_webglLostCount);
        }
        setupGL();
    }

    function getCurWebglContextCount(){
        var canvasList = document.querySelectorAll('canvas');
        var webglContexts = 0;
        for (var i = 0; i < canvasList.length; i++) {
            var canvas = canvasList[i];
            //var gl = canvas.getContext('webgl');
            var gl = canvas.getContext('webgl', { preserveDrawingBuffer: false }) || that.canvas.getContext('experimental-webgl');
            if (gl) webglContexts++;
        }
        //console.log('WebGL contexts available: ' + webglContexts);
        return webglContexts;
    }

    function createAndInitCanvas(rotation,width,height){
        that.canvas = document.createElement('canvas');
        that.canvas.style.width = '100%';
        that.canvas.style.height = '100%';

        if(that.contentMode == 0){
            //keep the raw scale of the video
            that.canvas.style.objectFit = 'contain';
        }
        else if(that.contentMode == 1){
            //tailor it to the size of the window
            that.canvas.style.objectFit = 'cover';
        }
        else if(that.contentMode == 2){
            //stretch the video according to the window size
            that.canvas.style.objectFit = 'fill';
        }
        else {
            //keep the size of the original video
            that.canvas.style.objectFit = 'contain';
        }

        if (rotation == 0 || rotation == 180) {
            that.canvas.width = width;
            that.canvas.height = height;
        }
        else {
            that.canvas.width = height;
            that.canvas.height = width;
        }

        if (that.mirrorView) {
            that.canvas.style.transform = 'rotateY(180deg)';
        }
        that.container.appendChild(that.canvas);
        that.canvas.addEventListener('webglcontextlost', handleWebglContextLost);
        that.canvas.addEventListener('webglcontextrestored', handleWebglContextRestored);
    }

    function destroyCanvas(){
        that.canvas.removeEventListener('webglcontextlost', handleWebglContextLost);
        that.canvas.removeEventListener('webglcontextrestored', handleWebglContextRestored);
        if(gl && gl.isContextLost() && g_webglLostCount > 0){
            g_webglLostCount--;
        }
        try {
            gl && gl.getExtension('WEBGL_lose_context') && gl.getExtension('WEBGL_lose_context').loseContext();
        }
        catch (err) {
            console.warn(err);
        }

        gl = undefined;
        try {
            that.container && that.container.removeChild(that.canvas);
        }
        catch (e) {
            console.warn(e);
        }
        that.canvas = undefined;
    }

    function initCanvas(view, mirror, width, height, rotation, onFailure) {
        that.clientWidth = view.clientWidth;
        that.clientHeight = view.clientHeight;
        that.view = view;
        that.mirrorView = mirror;
        // that.canvasUpdated = false;
        that.container = document.createElement('div');
        that.container.style.width = '100%';
        that.container.style.height = '100%';
        that.container.style.display = 'flex';
        that.container.style.justifyContent = 'center';
        //that.container.style.alignItems = 'center';
        that.view.appendChild(that.container);
        
        that.initWidth = width;
        that.initHeight = height;
        that.initRotation = rotation;
        
        createAndInitCanvas(rotation,width,height);

        setupGL();
    }

    function setupGL() {
        if(!gl){
            try {            
                // Try to grab the standard context. If it fails, fallback to experimental.
                gl = that.canvas.getContext('webgl', { preserveDrawingBuffer: false }) || that.canvas.getContext('experimental-webgl');
            }
            catch (e) {
                console.log(e);
            }
            if (!gl) {
                if(that.callbackLogFunc){
                    that.callbackLogFunc('Browser not support! No WebGL detected.'+' streamId:'+that.streamId);
                }
                if(that.callbackReportFunc){
                    that.callbackReportFunc(25000005,'Browser not support! No WebGL detected.',1);
                }
                //gl = undefined;
                //onFailure({ error: 'Browser not support! No WebGL detected.' });
                if(that.fnWebglContextLostCB){
                    that.fnWebglContextLostCB(that.streamId,that.view,that.contentMode,that.mirrorView);
                }
                return;
            }
        }
        
        // Set clear color to black, fully opaque
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Enable depth testing
        gl.enable(gl.DEPTH_TEST);
        // Near things obscure far things
        gl.depthFunc(gl.LEQUAL);
        // Clear the color as well as the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Setup GLSL program
        try {
            //if webgl context is over,createProgramFromSources will execute failed.
            program = createProgramFromSources(gl, [vertexShaderSource, yuvShaderSource]);
        }
        catch (e) {
            console.log(e);
        }
        if(!program){
            //onFailure({ error: 'createProgramFromSources failed.' });
            if(that.callbackLogFunc){
                that.callbackLogFunc('createProgramFromSources failed.[glrender]'+' streamId:'+that.streamId);
            }
            return;
        }
        gl.useProgram(program);
        initTextures();
    }

    function initCanvasForScreenShared(mirror, width, height, rotation, onFailure) {
        //that.clientWidth = view.clientWidth;
        //that.clientHeight = view.clientHeight;
        //that.view = view;
        that.mirrorView = mirror;
        that.canvas = document.createElement('canvas');
        that.canvas.style.width = '100%';
        that.canvas.style.height = '100%';
        if (rotation == 0 || rotation == 180) {
            that.canvas.width = width;
            that.canvas.height = height;
        }
        else {
            that.canvas.width = height;
            that.canvas.height = width;
        }
        that.initWidth = width;
        that.initHeight = height;
        that.initRotation = rotation;
        if (that.mirrorView) {
            that.canvas.style.transform = 'rotateY(180deg)';
        }

        that.canvas.addEventListener('webglcontextlost', handleWebglContextLost);
        that.canvas.addEventListener('webglcontextrestored', handleWebglContextRestored);

        setupGL();
    }
    
    function initTextures() {
        positionLocation = gl.getAttribLocation(program, 'a_position');
        texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
        surfaceBuffer = gl.createBuffer();
        texCoordBuffer = gl.createBuffer();
        // Create a texture.
        gl.activeTexture(gl.TEXTURE0);
        yTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, yTexture);
        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.activeTexture(gl.TEXTURE1);
        uTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, uTexture);
        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.activeTexture(gl.TEXTURE2);
        vTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, vTexture);
        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        const y = gl.getUniformLocation(program, 'Ytex');
        gl.uniform1i(y, 0); /* Bind Ytex to texture unit 0 */
        const u = gl.getUniformLocation(program, 'Utex');
        gl.uniform1i(u, 1); /* Bind Utex to texture unit 1 */
        const v = gl.getUniformLocation(program, 'Vtex');
        gl.uniform1i(v, 2); /* Bind Vtex to texture unit 2 */
    }
    function updateViewZoomLevel(rotation, width, height) {
        if(that.view != undefined){
            that.clientWidth = that.view.clientWidth;
            that.clientHeight = that.view.clientHeight;
        }
        try {
            if (that.contentMode === 0) {
                // Cover
                if (rotation === 0 || rotation === 180) {
                    if (that.clientWidth / that.clientHeight > width / height) {
                        that.canvas.style.zoom = that.clientWidth / width;
                    }
                    else{
                        that.canvas.style.zoom = that.clientHeight / height;
                    }
                }
                else {
                    // 90, 270
                    if (that.clientHeight / that.clientWidth > width / height) {
                        that.canvas.style.zoom = that.clientHeight / width;
                    }
                    else {
                        that.canvas.style.zoom = that.clientWidth / height;
                    }
                }
                // Contain
            }
            else if (rotation === 0 || rotation === 180) {
                if (that.clientWidth / that.clientHeight > width / height) {
                    that.canvas.style.zoom = that.clientHeight / height;
                }
                else {
                    that.canvas.style.zoom = that.clientWidth / width;
                }
            }
            else {
                // 90, 270
                if (that.clientHeight / that.clientWidth > width / height) {
                    that.canvas.style.zoom = that.clientWidth / height;
                }
                else {
                    that.canvas.style.zoom = that.clientHeight / width;
                }
            }
        }
        catch (e) {
            console.log(`updateCanvas 00001 gone ${that.canvas}`);
            console.log(that);
            console.error(e);
            return false;
        }
        return true;
    }
    function updateCanvas(rotation, width, height) {
        // if (that.canvasUpdated) {
        //   return;
        // }
        if (width || height) {
            that.lastImageWidth = width;
            that.lastImageHeight = height;
            that.lastImageRotation = rotation;
        }
        else {
            width = that.lastImageWidth;
            height = that.lastImageHeight;
            rotation = that.lastImageRotation;
        }
        //not zoom to clip and self-adaption
        //if (!updateViewZoomLevel(rotation, width, height)) {
        //   return;
        //}

        gl.bindBuffer(gl.ARRAY_BUFFER, surfaceBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        // Console.log('image rotation from ', that.imageRotation, ' to ', rotation);
        // 4 vertex, 1(x1,y1), 2(x2,y1), 3(x2,y2), 4(x1,y2)
        //  0: 1,2,4/4,2,3
        // 90: 2,3,1/1,3,4
        // 180: 3,4,2/2,4,1
        // 270: 4,1,3/3,1,2
        const p1 = { x: 0, y: 0 };
        const p2 = { x: width, y: 0 };
        const p3 = { x: width, y: height };
        const p4 = { x: 0, y: height };
        let pp1 = p1, pp2 = p2, pp3 = p3, pp4 = p4;
        switch (rotation) {
            case 0:
                break;
            case 90:
                pp1 = p2;
                pp2 = p3;
                pp3 = p4;
                pp4 = p1;
                break;
            case 180:
                pp1 = p3;
                pp2 = p4;
                pp3 = p1;
                pp4 = p2;
                break;
            case 270:
                pp1 = p4;
                pp2 = p1;
                pp3 = p2;
                pp4 = p3;
                break;
            default:
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            pp1.x,
            pp1.y,
            pp2.x,
            pp2.y,
            pp4.x,
            pp4.y,
            pp4.x,
            pp4.y,
            pp2.x,
            pp2.y,
            pp3.x,
            pp3.y
        ]), gl.STATIC_DRAW);
        const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
        gl.uniform2f(resolutionLocation, width, height);
        // that.canvasUpdated = true;
    }
    return that;
};
exports.default = JRender;
