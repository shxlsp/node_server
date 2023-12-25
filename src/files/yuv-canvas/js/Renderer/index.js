"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SoftwareRenderer_1 = __importDefault(require("./SoftwareRenderer"));
exports.SoftwareRenderer = SoftwareRenderer_1.default;
const GlRenderer_1 = __importDefault(require("./GlRenderer"));
class GlRenderer {
    constructor() {
        this.self = GlRenderer_1.default.apply(this);
        this.event = this.self.event;
    }
    bind(element) {
        return this.self.bind(element);
    }
    setLogCallback(streamId,funcLog,funcReprot) {
        return this.self.setLogCallback(streamId,funcLog,funcReprot);
    }
    bindForScreenShared(clientWidth,clientHeight) {
        return this.self.bindForScreenShared(clientWidth,clientHeight);
    }
    unbind() {
        return this.self.unbind();
    }
    unbindForScreenShared() {
        return this.self.unbindForScreenShared();
    }
    equalsElement(element) {
        return this.self.view === element;
    }
    drawFrame(imageData) {
        return this.self.drawFrame(imageData);
    }
    drawFrameForScreenShared(imageData) {
        return this.self.drawFrameForScreenShared(imageData);
    }
    setContentMode(mode) {
        return this.self.setContentMode(mode);
    }
    getContentMode() {
        return this.self.getContentMode();
    }
    enableLoseContext(){
        return this.self.enableLoseContext();
    }
    refreshCanvas() {
        return this.self.refreshCanvas();
    }
    getOneFrame(){
        return this.self.getOneFrame();
    }
    getCurView(){
        return this.self.getCurView();
    }
    setCanvasMirror(mirror){
        return this.self.setCanvasMirror(mirror);
    }
    setWebGLContextLostCallback(webglContextLostCB){
        return this.self.setWebGLContextLostCallback(webglContextLostCB);
    }
}
exports.GlRenderer = GlRenderer;
class CustomRenderer {
    constructor() {
        throw new Error('You have to declare your own custom render');
    }
    bind(element) {
        throw new Error('You have to declare your own custom render');
    }
    unbind() {
        throw new Error('You have to declare your own custom render');
    }
    equalsElement(element) {
        throw new Error('You have to declare your own custom render');
        return false;
    }
    drawFrame(imageData) {
        throw new Error('You have to declare your own custom render');
    }
    setContentMode(mode) {
        throw new Error('You have to declare your own custom render');
    }
    refreshCanvas() {
        throw new Error('You have to declare your own custom render');
    }
}
exports.CustomRenderer = CustomRenderer;
