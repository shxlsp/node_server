
var nodeJRTCElectronSDKDir;
if ((process.platform == "win32") || (process.platform == "linux")) {
    nodeJRTCElectronSDKDir = "../../../native/" + process.platform + "_" + process.arch;
}
else {
    nodeJRTCElectronSDKDir = "../../../native/" + process.platform;
}
var nodeJRTCElectronSDK;
nodeJRTCElectronSDK = require(nodeJRTCElectronSDKDir + "/JRTCElectronSDK");
var Renderer_1;

var globalStreams = new Map();
var g_JrtcEngine;
var g_LocalVideoMirrorState = true;
//var count = 0;
var g_showErrorLogMap = new Map();;
var g_screenSharedPreviewStreamIdToViewMap = new Map();

function printLogRepeat(type,key,log,repeat){
    var count = 0;
    if (g_showErrorLogMap.has(key)){
        count = g_showErrorLogMap.get(key);
    }
    if(count == 0){
        g_JrtcEngine.reportEventError(type,key,log);
        g_JrtcEngine.printLog(log);
    }
    count = count + 1;
    if(count > repeat){
        count = 0;
    }
    g_showErrorLogMap.set(key,count);
}


/**
 * JRTCEngine Module:Enable or disable the local, remote, and desktop video functions(用于提供开启/结束会议、打开关闭本地、远程、桌面视频等功能)
 * @module JRTCElectronSDK
 */
class JRTCEngine {

    /**
     * @constructor
     */
    constructor() {
        this.JRTCEngine = nodeJRTCElectronSDK;
        this.setJrtcEngine(this);
    }

    /**
     * @desc 【desc】Init the JRTCEngine(初始化JRTCEngine)
     * @example <caption>Usage of init.</caption>
     *   var engine = new JRTCEngine();
     *   engine.init();
     */
    initEngine() {
        Renderer_1 = require("../Renderer")
        if (process.platform == "win32") {
            this.renderMode = this._checkWebGL() && this._checkWebGL2() ? 1 : 2;
        }
        else{
            //this.renderMode = this._checkWebGL() ? 1 : 2;
            this.renderMode = 1;
        }
        
        this.renderForScreenSharedPreview = null;
        //this.screenSharedPreviewStreamIdToViewMap = new Map();
        this.JRTCEngine.JRTCEngineInit();
    }

    /**
     * @desc 【desc】update SDK log(更新SDK日志)
     */
    flushLog() {
        this.JRTCEngine.JRTCEngineFlushLog();
    }
    
    /**
    * @desc 【desc】Uninit the JRTCEngine(反初始化JRTCEngine)
    *   engine.JRTCEngineUninit();
    */
    uninitEngine() {
        this.JRTCEngine.JRTCEngineUninit();
    }

    /**
     * @desc 【desc】Setting up the server environment(设置当前使用的服务器环境)
     * @param {Number} envId 0 represents the development environment,1 represents the gray scale
     * environment of the cloud wing,2 represents the cloud wingline environment(0:开发环境;1:云翼灰度环境;2：云翼线上环境)
     * @example <caption>Usage of setEnv.</caption>
     *   var engine = new JRTCEngine();
     *   engine.init(133,username);
     *   engine.setEnv(2); //the cloud wingline environment
     */
    setEnv(envId) {
        this.JRTCEngine.JRTCEngineSetEnv(envId);
    }

    /**
     * @desc 【desc】Set the event listener object to receive notifications from the JRTCEngine(设置监听类,用于接收服务器的通知)
     * @param {Object} objListener Event listener object, containing the following properties(事件监听对象)
     * @param {Function} objListener.onFirstVideoFrame - This function is called when the first frame data is returned(当第一帧视频可获得时，调用此函数)
     * @param {Function} objListener.onError - This function is called when an error occurs(当出现错误时，调用此函数)
     * @param {Function} objListener.onEnterRoom - This function is called upon successful entry into the room(当进入房间成功时，调用此函数)
     * @param {Function} objListener.onRemoteUserEnterRoom - This function is called when the remote user enters the room(当远程用户进入房间时，调用此函数)
     * @param {Function} objListener.onConnectLost - This function is called when you lose the connection to the server(当网络连接断开时，调用此函数)
     * @param {Function} objListener.onConnectRecover - This function is called when you restore the connection to the server(当网络连接恢复时，调用此函数)
     * @param {Function} objListener.onUserDesktopAvailable - This function is called when there is a user sharing the desktop(当屏幕或应用共享视频可获得时，调用此函数)
     * @param {Function} objListener.onRemoteUserLeaveRoom - This function is called when the remote user leaves the room(当远程用户离开时，调用此函数)
     * @param {Function} objListener.onUserVideoAvailable - This function is called when a user video is available(当远程用户视频可获得/不可获得时，调用此函数)
     * @param {Function} objListener.onUserAudioAvailable - This function is called when a user audio is available(当远程用户音频可获得/不可获得时，调用此函数)
     * @param {Function} objListener.onRemoteAudioActived - This function is called when the remote user audio is activated(当远程用户音频激活时，调用此函数)
     * @param {Function} objListener.onUserUpdateNickName - This function is called whenever there is a user name update(当用户名称更新时，调用此函数)
     * @param {Function} objListener.onUserAudioVolumes - This function is called when the user volume changes(用户音量大小改变时调用此函数)
     * @param {Function} objListener.onUserMessageReceived - This function is called when a user message is received(当用户接收到消息时，调用此函数)
     * @param {Function} objListener.onUserRemoved - This function is called when the user is removed from the meeting(当移除用户时，调用此函数)
     * @param {Function} objListener.onAudioMuteToRoom - This function is called when everyone in a meeting is silent(当全体静音时，调用此函数)
     * @param {Function} objListener.onAudioMuteToPeer - This function is called when a user is silent(当某个成员时，调用此函数)
     * @param {Function} objListener.onVideoCloseToRoom - This function is called when the video is closed for all members(对全部成员关闭视频时调用此函数)
     * @param {Function} objListener.onVideoCloseToPeer - This function is called when a video is closed for a single member(对单个成员关闭视频时调用此函数)
     * @param {Function} objListener.onForbiddenChatToRoom - This function is called when the meeting is silent(当会议禁言时，调用此函数)
     * @param {Function} objListener.onUnForbiddenChatToRoom - This function is called when a meeting gag is lifted(当会议解除禁言时，调用此函数)
     * @param {Function} objListener.onCustomSignalToRoom - This function is called when a custom signal needs to be notified to every member of the entire meeting(当会议接收到针对全体成员的自定义消息时，调用此函数)
     * @param {Function} objListener.onCustomSignalToPeer - This function is called when a custom signal needs to be notified to a member of the meeting(当会议接收到针对单个成员的自定义消息时，调用此函数)
     */
    setApiListener(objListener) {
        this.JRTCEngine.JRTCEngineSetApiListener(objListener);
    }

    /**
     * @desc 【desc】Set the event listener object to receive notifications from the JRTCEngine(设置监听类,用于接收服务器的通知)
     * @param {Object} objListener Event listener object, containing the following properties(事件监听对象)
     * @param {Function} objListener.onFirstVideoFrame - This function is called when the first frame data is returned(当第一帧视频可获得时，调用此函数)
     * @param {Function} objListener.onError - This function is called when an error occurs(当出现错误时，调用此函数)
     * @param {Function} objListener.onEnterRoom - This function is called upon successful entry into the room(当进入房间成功时，调用此函数)
     * @param {Function} objListener.onRemoteUserEnterRoom - This function is called when the remote user enters the room(当远程用户进入房间时，调用此函数)
     * @param {Function} objListener.onConnectLost - This function is called when you lose the connection to the server(当网络连接断开时，调用此函数)
     * @param {Function} objListener.onConnectRecover - This function is called when you restore the connection to the server(当网络连接恢复时，调用此函数)
     * @param {Function} objListener.onUserDesktopAvailable - This function is called when there is a user sharing the desktop(当屏幕或应用共享视频可获得时，调用此函数)
     * @param {Function} objListener.onRemoteUserLeaveRoom - This function is called when the remote user leaves the room(当远程用户离开时，调用此函数)
     * @param {Function} objListener.onUserVideoAvailable - This function is called when a user video is available(当远程用户视频可获得/不可获得时，调用此函数)
     * @param {Function} objListener.onUserAudioAvailable - This function is called when a user audio is available(当远程用户音频可获得/不可获得时，调用此函数)
     * @param {Function} objListener.onRemoteAudioActived - This function is called when the remote user audio is activated(当远程用户音频激活时，调用此函数)
     * @param {Function} objListener.onUserUpdateNickName - This function is called whenever there is a user name update(当用户名称更新时，调用此函数)
     * @param {Function} objListener.onUserAudioVolumes - This function is called when the user volume changes(用户音量大小改变时调用此函数)
     * @param {Function} objListener.onUserMessageReceived - This function is called when a user message is received(当用户接收到消息时，调用此函数)
     * @param {Function} objListener.onUserRemoved - This function is called when the user is removed from the meeting(当移除用户时，调用此函数)
     * @param {Function} objListener.onAudioMuteToRoom - This function is called when everyone in a meeting is silent(当全体静音时，调用此函数)
     * @param {Function} objListener.onAudioMuteToPeer - This function is called when a user is silent(当某个成员时，调用此函数)
     * @param {Function} objListener.onVideoCloseToRoom - This function is called when the video is closed for all members(对全部成员关闭视频时调用此函数)
     * @param {Function} objListener.onVideoCloseToPeer - This function is called when a video is closed for a single member(对单个成员关闭视频时调用此函数)
     * @param {Function} objListener.onForbiddenChatToRoom - This function is called when the meeting is silent(当会议禁言时，调用此函数)
     * @param {Function} objListener.onUnForbiddenChatToRoom - This function is called when a meeting gag is lifted(当会议解除禁言时，调用此函数)
     * @param {Function} objListener.onCustomSignalToRoom - This function is called when a custom signal needs to be notified to every member of the entire meeting(当会议接收到针对全体成员的自定义消息时，调用此函数)
     * @param {Function} objListener.onCustomSignalToPeer - This function is called when a custom signal needs to be notified to a member of the meeting(当会议接收到针对单个成员的自定义消息时，调用此函数)
     */
    setApiListenerV2(objListener) {
        this.JRTCEngine.JRTCEngineSetApiListenerV2(objListener);
    }

    /**
     * @desc 【desc】Enter the meeting(进入会议)
     * @param {Object} enterParam The parameters required to enter the meeting, which is an object, have the following properties(进入会议参数对象)
     * @param {Number} enterParam.roomId The meeting number(会议号)
     * @param {Number} enterParam.roomType The types of meeting(会议类型：1:普通房间;2:大房间)
     * @param {string} enterParam.sdkVersion Version number of the SDK(SDK版本信息：如：v1.0.0，根据实际版本填写)
     * @param {string} enterParam.nickName The user nickname(参会者的用户昵称)
     * @param {string} enterParam.token Token obtained from the management according to the meeting number(token,根据会议号从会控服务获取的token)
     * @param {string} enterParam.appId AppId obtained from the management according to the meeting number(appId,根据会议号从会控服务获取token时返回的appId)
     * @param {string} enterParam.userId The user ID represents a unique representation of the user(userId,根据会议号从会控服务获取token时返回的userId)
     * @param {string} enterParam.nonce nonce(nonce,根据会议号从会控服务获取token时返回的nonce)
     * @param {Number} enterParam.timestamp Timestamp, indicating the time to enter the meeting(timestamp,根据会议号从会控服务获取token时返回的timestamp)
     * @param {string} enterParam.deviceId The device ID that runs the meeting terminal(当前终端的设备ID)
     * @param {string} enterParam.deviceName The name of the device that runs the conference terminal(当前终端的设备名称)
     * @param {string} enterParam.deviceType The type of device that runs the conference terminal(当前终端的设备类型，如：PC)
     * @param {string} enterParam.deviceMode Device mode for running a conference terminal(当前终端的设备模式，如：Dell Inc.)
     * @param {string} enterParam.deviceVersion The version of the device that runs the conference terminal(当前终端的系统版本，如：Windows 10 (10.0)")
     * @param {Number} enterParam.controlVersion The types of room control(万人房间控制字段,可选值:1(普通房间),2(万人房间))
     */
    enterRoom(enterParam) {
        this.JRTCEngine.JRTCEngineEnterRoom(enterParam);
    }

    /**
     * @desc 【desc】Enter the meeting(进入会议)
     * @param {Object} enterParam The parameters required to enter the meeting, which is an object, have the following properties(进入会议参数对象)
     * @param {Number} enterParam.roomId The meeting number(会议号)
     * @param {Number} enterParam.roomType The types of meeting(会议类型：1:普通房间;2:大房间)
     * @param {string} enterParam.sdkVersion Version number of the SDK(SDK版本信息：如：v1.0.0，根据实际版本填写)
     * @param {string} enterParam.nickName The user nickname(参会者的用户昵称)
     * @param {string} enterParam.token Token obtained from the management according to the meeting number(token,根据会议号从会控服务获取的token)
     * @param {string} enterParam.appId AppId obtained from the management according to the meeting number(appId,根据会议号从会控服务获取token时返回的appId)
     * @param {string} enterParam.userId The user ID represents a unique representation of the user(userId,根据会议号从会控服务获取token时返回的userId)
     * @param {string} enterParam.nonce nonce(nonce,根据会议号从会控服务获取token时返回的nonce)
     * @param {Number} enterParam.timestamp Timestamp, indicating the time to enter the meeting(timestamp,根据会议号从会控服务获取token时返回的timestamp)
     * @param {string} enterParam.deviceId The device ID that runs the meeting terminal(当前终端的设备ID)
     * @param {string} enterParam.deviceName The name of the device that runs the conference terminal(当前终端的设备名称)
     * @param {string} enterParam.deviceType The type of device that runs the conference terminal(当前终端的设备类型，如：PC)
     * @param {string} enterParam.deviceMode Device mode for running a conference terminal(当前终端的设备模式，如：Dell Inc.)
     * @param {string} enterParam.deviceVersion The version of the device that runs the conference terminal(当前终端的系统版本，如：Windows 10 (10.0)")
     * @param {Number} enterParam.controlVersion The types of room control(万人房间控制字段,可选值:1(普通房间),2(万人房间))
     * @returns {Object}  - Return a promise object,0 indicates success and -1 indicates failure.(返回一个Promise对象，0表示成功，-1表示失败)
     */
    enterRoomByAsync(enterParam){
        self = this;
        return new Promise((resolve, reject) => {
            enterParam.funcCallState = function(errorCode,data){
                if(errorCode == 0){
                    resolve(data);
                }
                else{
                    reject(data);
                }
            };
            self.JRTCEngine.JRTCEngineEnterRoom(enterParam);
        });
    }

    /**
     * @desc 【desc】Exit the meeting(退出房间)
     * @param {Function} cb The result of exiting room is returned through this function，0 indicates success and -1 indicates failure
     * (该回调函数返回退出房间的结果，0表示成功，-1表示失败).cb 格式： function (ret){}
     */
    exitRoom(cb) {
        this.JRTCEngine.JRTCEngineExitRoom(cb);
    }

    /**
     * @desc 【desc】Gets a list of camera devices(获取设备摄像头列表)
     * @param {Function} cb The list of camera device is returned through this function.This function takes array,which contain id {Number}, 
     * uniqueId {string}, and name{string}.If the camera list is empty, the array Object is null(设备的摄像头列表由此回调函数返回，该函数入参为
     * 一个数组，数组元素为对象，有三个属性：id、deviceid和name.如果摄像头列表为空，则array object 是null)
     */
    getCameraDevicesList(cb) {
        this.JRTCEngine.JRTCEngineGetCameraDevicesList(cb);
    }

    /**
     * @desc 【desc】Sets the current camera to use based on the camera ID passed in(指定摄像头为当前会议使用的设备)
     * @param {Number} index The index of cameras in the list of cameras returned by the {@link getCameraDevicesList}(getCameraDevicesList()函数返回的设备列表的索引)
     */
    setCurrentCameraDevice(index) {
        this.JRTCEngine.JRTCEngineSetCurrentCameraDevice(index);
    }

    /**
     * @desc 【desc】Sets the current camera to use based on the camera ID passed in(指定摄像头为当前会议使用的设备)
     * @param {Number} index The index of cameras in the list of cameras returned by the {@link getCameraDevicesList}(getCameraDevicesList()函数返回的设备列表的索引)
     */
     changeCameraByIndex(index) {
        this.JRTCEngine.JRTCEngineChangeCameraByIndex(index);
    }

    /**
     * @desc 【desc】Sets the current camera to use based on the camera uniqueId passed in(通过uniqueId指定摄像头为当前会议使用的设备)
     * @param {Number} uniqueId The uniqueId of cameras in the list of cameras returned by the {@link getCameraDevicesList}(getCameraDevicesList()函数返回的设备列表的中的摄像头uniqueId)
     */
     changeCameraByUID(uniqueId) {
        this.JRTCEngine.JRTCEngineChangeCameraByUID(uniqueId);
    }

    /**
     * @desc 【desc】Sets the current camera to use based on the camera uniqueId passed in(通过uniqueId指定当前会议使用的视频设备)
     * @param {Number} uniqueId The uniqueId of cameras in the list of cameras returned by the {@link getCameraDevicesList}(getCameraDevicesList()函数返回的设备列表的中的摄像头uniqueId)
     */
    setCameraDeviceByUID(uniqueId) {
        this.JRTCEngine.JRTCEngineSetCameraDeviceByUID(uniqueId);
    }

    /**
     * @desc 【desc】Turn on Local Audio(开启本地音频)
     * @param {Number} highPriority High flow mark,the range of 1 to 100,1 indicates the lowest priority, and 100 indicates the highest priority.
     * (高优流标识,取值范围是1到100，1为最低优先级，100为最高优先级)
     */
    startLocalAudio(highPriority) {
        var param;
        if (highPriority == undefined) {
            param = 0;
        }
        else {
            param = highPriority;
        }
        this.JRTCEngine.JRTCEngineStartLocalAudio(param);
    }

    /**
     * @desc 【desc】Turn on Local Audio(开启本地音频)
     * @param {Number} highPriority High flow mark,the range of 1 to 100,1 indicates the lowest priority, and 100 indicates the highest priority.
     * (高优流标识,取值范围是1到100，1为最低优先级，100为最高优先级)
     * @returns {Object}  - Return a promise object,0 indicates success and -1 indicates failure.(返回一个Promise对象，0表示成功，-1表示失败) 
     */
    startLocalAudioByAsync(highPriority) {
        var param;
        if (highPriority == undefined) {
            param = 0;
        }
        else {
            param = highPriority;
        }
        self = this;
        return new Promise((resolve, reject) => {
            var funcCallState = function(errorCode,data){
                if(errorCode == 0){
                    resolve(data);
                }
                else{
                    reject(data);
                }
            };
            self.JRTCEngine.JRTCEngineStartLocalAudio(param,funcCallState);
        });
    }

    /**
     * @desc 【desc】Turn off Local Audio(停止本地音频)
     */
    stopLocalAudio() {
        this.JRTCEngine.JRTCEngineStopLocalAudio();
    }

    /**
     * @desc 【desc】Turn on shared Audio(开启共享音频)
     * @param {Number} highPriority High flow mark,the range of 1 to 100,1 indicates the lowest priority, and 100 indicates the highest priority.
     * (高优流标识,取值范围是1到100，1为最低优先级，100为最高优先级)
     */
    startLocalScreenAudio(highPriority) {
        var param;
        if (highPriority == undefined) {
            param = 0;
        }
        else {
            param = highPriority;
        }
        this.JRTCEngine.JRTCEngineStartLocalScreenAudio(param);
    }

        /**
     * @desc 【desc】Turn on shared Audio(开启共享音频)
     * @param {Number} highPriority High flow mark,the range of 1 to 100,1 indicates the lowest priority, and 100 indicates the highest priority.
     * (高优流标识,取值范围是1到100，1为最低优先级，100为最高优先级)
     * @returns {Object}  - Return a promise object,0 indicates success and -1 indicates failure.(返回一个Promise对象，0表示成功，-1表示失败) 
     */
    startLocalScreenAudioByAsync(highPriority) {
        var param;
        if (highPriority == undefined) {
            param = 0;
        }
        else {
            param = highPriority;
        }
        self = this;
        return new Promise((resolve, reject) => {
            var funcCallState = function(errorCode,data){
                if(errorCode == 0){
                    resolve(data);
                }
                else{
                    reject(data);
                }
            };
            self.JRTCEngine.JRTCEngineStartLocalScreenAudio(param,funcCallState);
        });
    }

    /**
     * @desc 【desc】Turn off Local Audio(停止本地音频)
     */
    stopLocalScreenAudio() {
        this.JRTCEngine.JRTCEngineStopLocalScreenAudio();
    }

    /**
     * obsolete
     * @desc 【desc】Turn on Remote Audio(开启远程音频)
     * @param {Number} peerId The ID of the participant in the meeting(参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     * @private
     */
    startRemoteAudio(peerId, streamId) {
        this.JRTCEngine.JRTCEngineStartRemoteAudio(peerId, streamId);
    }

    /**
     * obsolete
     * @desc 【desc】Turn on Remote Audio(开启远程音频)
     * @param {string} userId The ID of the participant in the meeting(参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     * @private
     */
    startRemoteAudioV2(userId, streamId) {
        this.JRTCEngine.JRTCEngineStartRemoteAudioV2(userId, streamId);
    }

    /**
     * obsolete
     * @desc 【desc】Turn off Remote Audio(关闭远程音频)
     * @param {Number} peerId The ID of the participant in the meeting(参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     * @private
     */
    stopRemoteAudio(peerId, streamId) {
        this.JRTCEngine.JRTCEngineStopRemoteAudio(peerId, streamId);
    }

    /**
     * obsolete
     * @desc 【desc】Turn off Remote Audio(关闭远程音频)
     * @param {string} userId The ID of the participant in the meeting(参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     * @private
     */
    stopRemoteAudioV2(userId, streamId) {
        this.JRTCEngine.JRTCEngineStopRemoteAudioV2(userId, streamId);
    }

    /**
     * @desc 【desc】Stay connected to the server and pause or resume the push of local audio streams(暂停本地音频流)
     * @param {boolean} mute ture:pause;false:resume(true表示暂停,false表示恢复)
     */
    muteLocalAudio(mute) {
        this.JRTCEngine.JRTCEngineMuteLocalAudio(mute);
    }

    /**
     * @desc 【desc】 Enable audio AI noise setting.(启用音频AI噪声设置)
     * @param {boolean} enable true:enable;false:disable.(true：启用；false：停用)
     */
    setAudioAINoiseExEnable(enable){
        this.JRTCEngine.JRTCEngineSetAudioAINoiseExEnable(enable);
    }


    /**
     * obsolete
     * @desc 【desc】Stay connected to the server and pause or resume the push of remote audio streams(暂停远程音频流)
     * @param {Number} peerId The ID of the participant in the meeting(参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程音频流ID)
     * @param {boolean} mute ture:pause;false:resume(true表示暂停,false表示恢复)
     * @private
     */
    muteRemoteAudio(peerId, streamId, mute) {
        this.JRTCEngine.JRTCEngineMuteRemoteAudio(peerId, streamId, mute);
    }

    /**
     * obsolete
     * @desc 【desc】Stay connected to the server and pause or resume the push of remote audio streams(暂停远程音频流)
     * @param {string} userId The ID of the participant in the meeting(参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程音频流ID)
     * @param {boolean} mute ture:pause;false:resume(true表示暂停,false表示恢复)
     * @private
     */
    muteRemoteAudio(userId, streamId, mute) {
        this.JRTCEngine.JRTCEngineMuteRemoteAudioV2(userId, streamId, mute);
    }

    /**
     * obsolete
     * @desc 【desc】Pause or resume all audio streams while remaining connected to the server(暂停所有远程音频流)
     * @param {boolean} mute ture:pause;false:resume(true表示暂停,false表示恢复)
     * @private
     */
    muteAllRemoteAudio(mute) {
        this.JRTCEngine.JRTCEngineMuteRemoteAllAudio(mute);
    }

    /**
     * @desc 【desc】Open local video(打开本地视频)
     * @param {Object} previewParam (本地视频预览参数对象)
     * @param {Number} previewParam.width The width of the video frame(视频的宽)
     * @param {Number} previewParam.height The height of the video frame(视频的高)
     * @param {Boolean} previewParam.isMultiRate Whether it is multiple bit rate(true:多码率;false:反之)
     * @param {Number} previewParam.highPriority High flow mark,the range of 1 to 100,1 indicates the lowest priority, and 100 indicates the highest
     * priority.(高优流标识,取值范围是1到100，1为最低优先级，100为最高优先级)
     * @param {Number} previewParam.resolutionMode Improve the clarity of small streams,0-default,1-doubled(提升小流清晰度，0-默认，1-提升一倍)
     * @param {div} previewParam.view the view to render(渲染视频的窗口)
     * @param {Boolean} previewParam.isMirror Mirror or not(是否是镜像)
     * @param {Number} mode 0 - contain;1 - covert; 2 - fill;(0:保持视频比例;1:使视频适应窗口尺寸-裁剪;2:使视频适应窗口尺寸——拉伸)
     */
    startLocalPreview(previewParam, mode) {
        g_JrtcEngine.printLog("startLocalPreview enter mode:" + mode);
        previewParam.streamCB = this._streamCB;
        previewParam.jrtcEngine = this;
        if (mode == undefined) {
            mode = 0;
        }
        this._initRender("local", previewParam.view, mode, g_LocalVideoMirrorState);
        this.JRTCEngine.JRTCEngineStartLocalPreview(previewParam);
    }

    /**
     * @desc 【desc】Close local video(停止本地视频)
     * @param {div} view the view to render(渲染视频的窗口)
     */
    stopLocalPreview(view) {
        g_JrtcEngine.printLog("stopLocalPreview enter.");
        this.JRTCEngine.JRTCEngineStopLocalPreview();
        this._uninitRender("local", view);
    }

    /**
     * @desc 【desc】Start collecting and publishing local streams(开始本地流的采集和发布)
     * @param {Object} previewParam (本地视频预览参数对象)
     * @param {Number} previewParam.width The width of the video frame(视频的宽)
     * @param {Number} previewParam.height The height of the video frame(视频的高)
     * @param {Boolean} previewParam.isMultiRate Whether it is multiple bit rate(true:多码率;false:反之)
     * @param {Boolean} previewParam.isMirror Mirror or not(是否是镜像)
     */
    startLocalStream(previewParam) {
        g_JrtcEngine.printLog("startLocalStream enter." + JSON.stringify(previewParam));
        previewParam.streamCB = this._streamCB;
        previewParam.jrtcEngine = this;
        this.JRTCEngine.JRTCEngineStartLocalPreview(previewParam);
    }

    /**
     * @desc 【desc】Stop collecting and publishing local streams(停止本地流的采集和发布)
     */
    stopLocalStream() {
        g_JrtcEngine.printLog("stopLocalStream enter");
        this.JRTCEngine.JRTCEngineStopLocalPreview();
    }

    /**
     * @desc 【desc】Start collecting and publishing local streams(开始本地流的采集和发布)
     * @param {Object} previewParam (本地视频预览参数对象)
     * @param {Number} previewParam.width The width of the video frame(视频的宽)
     * @param {Number} previewParam.height The height of the video frame(视频的高)
     * @param {Boolean} previewParam.isMultiRate Whether it is multiple bit rate(true:多码率;false:反之)
     * @param {Boolean} previewParam.isMirror Mirror or not(是否是镜像)
     * @returns {Object}  - Return a promise object,0 indicates success and -1 indicates failure.(返回一个Promise对象，0表示成功，-1表示失败) 
     */
    startLocalStreamByAsync(previewParam){
        g_JrtcEngine.printLog("startLocalStreamByAsync enter." + JSON.stringify(previewParam));
        self = this;
        return new Promise((resolve, reject) => {
            previewParam.streamCB = self._streamCB;
            previewParam.jrtcEngine = self;
            previewParam.funcCallState = function(errorCode,data){
                if(errorCode == 0){
                    resolve(data);
                }
                else{
                    reject(data);
                }
            };
            self.JRTCEngine.JRTCEngineStartLocalPreview(previewParam);
        });
    }

    /**
     * @desc 【desc】Start local video rendering(开始本地视频渲染)
     * @param {div} view the view to render(渲染视频的窗口)
     * @param {Number} mode 0 - contain;1 - covert; 2 - fill;(0:保持视频比例;1:使视频适应窗口尺寸-裁剪;2:使视频适应窗口尺寸——拉伸)
     */
    startLocalVideoRender(view, mode) {
        g_JrtcEngine.printLog("startLocalVideoRender enter.mode:" + mode);
        if (mode == undefined) {
            mode = 0;
        }
        this._initRender("local", view, mode, g_LocalVideoMirrorState);
    }

    /**
    * @desc 【desc】Stop local video rendering(停止本地视频渲染)
    * @param {div} view the view to render(渲染视频的窗口)
    */
    stopLocalVideoRender(view) {
        g_JrtcEngine.printLog("stopLocalVideoRender enter");
        this._uninitRender("local", view);
    }

    /**
     * @desc  【desc】Set video encoding parameters(设置视频编码参数)
     * @param {Number} resolution Video resolution(分辨率)
     * @param {Number} fps Video frame rate(帧率)
     */
    setVideoEncodingParam(resolution, fps) {
        this.JRTCEngine.JRTCEngineSetVideoEncodingParam(resolution, fps);
    }

    /**
     * @desc 【desc】Maintains the connection to the server but suspends the push of local video(暂停本地视频流)
     * @param {boolean} mute ture:pause;false:resume(true表示暂停,false表示恢复)
     */
    muteLocalVideo(mute) {
        this.JRTCEngine.JRTCEngineMuteLocalVideo(mute);
    }

    /**
     * @desc 【desc】Maintains the connection to the server but suspends the push of local Desktop(暂停本地桌面流)
     * @param {boolean} mute ture:pause;false:resume(true表示暂停,false表示恢复)
     */
    muteLocalDesktop(mute) {
        this.JRTCEngine.JRTCEngineMuteLocalDesktop(mute);
    }

    /**
     * @desc 【desc】Open remote user video(打开远程视频)
     * @param {Object} remoteParam Open remote user video(打开远程用户视频对象)
     * @param {Number} remoteParam.userId The ID of the participant in the meeting，Choose either userId or uId(参会者ID,userId和uId两者选其一)
     * @param {string} remoteParam.uId The ID of the participant in the meeting，Choose either userId or uId(参会者ID,userId和uId两者选其一)
     * @param {string} remoteParam.streamId The audio stream ID of the participant(远程流ID)
     * @param {Number} remoteParam.width The width of the video frame(视频的宽)
     * @param {Number} remoteParam.height The height of the video frame(视频的高)
     * @param {Number} remoteParam.streamSubscribeModelType Subscription flow pattern(1:自动;2:固定;)
     * @param {Number} remoteParam.streamBitrateType The size of the flow(0:小流;1:大流;)
     * @param {div}    remoteParam.view the view to render(渲染视频的窗口)
     * @param {Number} mode 0 - contain;1 - covert; 2 - fill;(0:保持视频比例;1:使视频适应窗口尺寸-裁剪;2:使视频适应窗口尺寸——拉伸) 
     */
    startRemoteView(remoteParam, mode) {
        g_JrtcEngine.printLog("startRemoteView enter." + " userId:" + remoteParam.userId + " uId:" + remoteParam.uId + " streamId:" + remoteParam.streamId + " mode:" + mode);
        remoteParam.streamCB = this._streamCB;
        remoteParam.jrtcEngine = this;
        if (mode == undefined) {
            mode = 0;
        }
        this._initRender(remoteParam.streamId, remoteParam.view, mode);
        this.JRTCEngine.JRTCEngineStartRemoteView(remoteParam);
    }

    /**
     * @desc 【desc】Enable the collection and publishing of remote video streams(开启远程视频流的采集和发布)
     * @param {Object} remoteParam Open remote user video(打开远程用户视频对象)
     * @param {Number} remoteParam.userId The ID of the participant in the meeting，Choose either userId or uId(参会者ID,userId和uId两者选其一)
     * @param {string} remoteParam.uId The ID of the participant in the meeting，Choose either userId or uId(参会者ID,userId和uId两者选其一)
     * @param {string} remoteParam.streamId The audio stream ID of the participant(远程流ID)
     * @param {Number} remoteParam.width The width of the video frame(视频的宽)
     * @param {Number} remoteParam.height The height of the video frame(视频的高)
     * @param {Number} remoteParam.streamSubscribeModelType Subscription flow pattern(1:自动;2:固定;)
     * @param {Number} remoteParam.streamBitrateType The size of the flow(0:小流;1:大流;)
     */
    startRemoteStream(remoteParam) {
        g_JrtcEngine.printLog("startRemoteStream enter." + JSON.stringify(remoteParam));
        remoteParam.streamCB = this._streamCB;
        remoteParam.jrtcEngine = this;
        this.JRTCEngine.JRTCEngineStartRemoteView(remoteParam);
    }

    /**
     * @desc 【desc】Enable the collection and publishing of remote video streams(开启远程视频流的采集和发布)
     * @param {Object} remoteParam Open remote user video(打开远程用户视频对象)
     * @param {Number} remoteParam.userId The ID of the participant in the meeting，Choose either userId or uId(参会者ID,userId和uId两者选其一)
     * @param {string} remoteParam.uId The ID of the participant in the meeting，Choose either userId or uId(参会者ID,userId和uId两者选其一)
     * @param {string} remoteParam.streamId The audio stream ID of the participant(远程流ID)
     * @param {Number} remoteParam.width The width of the video frame(视频的宽)
     * @param {Number} remoteParam.height The height of the video frame(视频的高)
     * @param {Number} remoteParam.streamSubscribeModelType Subscription flow pattern(1:自动;2:固定;)
     * @param {Number} remoteParam.streamBitrateType The size of the flow(0:小流;1:大流;)
     * @returns {Object}  - Return a promise object,0 indicates success and -1 indicates failure.(返回一个Promise对象，0表示成功，-1表示失败) 
     * @private
     */
    startRemoteStreamByAsync(remoteParam) {
        g_JrtcEngine.printLog("startRemoteStreamByAsync enter." + JSON.stringify(remoteParam));
        self = this;
        return new Promise((resolve, reject) => {
            remoteParam.streamCB = self._streamCB;
            remoteParam.jrtcEngine = self;
            remoteParam.funcCallState = function(errorCode,data){
                if(errorCode == 0){
                    resolve(data);
                }
                else{
                    reject(data);
                }
            };
            self.JRTCEngine.JRTCEngineStartRemoteView(remoteParam);
        });
    }

    /**
     * @desc 【desc】Enable rendering of remote video streams(开启远程视频流的渲染)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     * @param {div}    view the view to render(渲染视频的窗口)
     * @param {Number} mode 0 - contain;1 - covert; 2 - fill;(0:保持视频比例;1:使视频适应窗口尺寸-裁剪;2:使视频适应窗口尺寸——拉伸)
     */
    startRemoteVideoRender(streamId, view, mode) {
        g_JrtcEngine.printLog("startRemoteVideoRender enter.streamId:" + streamId + ",mode:" + mode);
        if (mode == undefined) {
            mode = 0;
        }
        this._initRender(streamId, view, mode);
    }

    /**
     * @desc 【desc】Turn off remote user video streaming(关闭远程视频)
     * @param {Number} peerId The ID of the participant in the meeting(参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     */
    stopRemoteView(peerId, streamId) {
        g_JrtcEngine.printLog("stopRemoteView enter.peerId:" + peerId + ",streamId:" + streamId);
        this.JRTCEngine.JRTCEngineStopRemoteView(peerId, streamId);
        this._uninitRender(streamId);
    }

    /**
     * @desc 【desc】Turn off remote user video streaming(关闭远程视频)
     * @param {string} userId The ID of the participant in the meeting(参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     */
    stopRemoteViewV2(userId, streamId) {
        g_JrtcEngine.printLog("stopRemoteViewV2 enter.userId:" + userId + ",streamId:" + streamId);
        this.JRTCEngine.JRTCEngineStopRemoteViewV2(userId, streamId);
        this._uninitRender(streamId);
    }

    /**
     * @desc 【desc】Video size stream hot swap(视频大小流热切换)
     * @param {Number} peerId  The ID of the participant in the meeting(参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     * @param {Number} streamSubscribeModelType Subscription flow pattern(1:自动;2:固定;)
     * @param {Number} streamBitrateType The size of the flow(0:小流;1:大流;)
     */
    changeVideoStream(peerId, streamId, streamSubscribeModelType, streamBitrateType) {
        this.JRTCEngine.JRTCEngineChangeVideoStream(peerId, streamId, streamSubscribeModelType, streamBitrateType);
    }

    /**
     * @desc 【desc】Video size stream hot swap(视频大小流热切换)
     * @param {string} userId The ID of the participant in the meeting(参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     * @param {Number} streamSubscribeModelType Subscription flow pattern(1:自动;2:固定;)
     * @param {Number} streamBitrateType The size of the flow(0:小流;1:大流;)
     */
    changeVideoStreamV2(userId, streamId, streamSubscribeModelType, streamBitrateType) {
        this.JRTCEngine.JRTCEngineChangeVideoStreamV2(userId, streamId, streamSubscribeModelType, streamBitrateType);
    }

    /**
     * @desc 【desc】Disable the collection and distribution of remote video streams(关闭远程视频流的采集和发布)
     * @param {Number} peerId The ID of the participant in the meeting(参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     */
    stopRemoteStream(peerId, streamId) {
        g_JrtcEngine.printLog("stopRemoteStream enter.peerId:" + peerId + ",streamId:" + streamId);
        this.JRTCEngine.JRTCEngineStopRemoteView(peerId, streamId);
    }

    /**
     * @desc 【desc】Disable the collection and distribution of remote video streams(关闭远程视频流的采集和发布)
     * @param {string} userId The ID of the participant in the meeting(参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     */
    stopRemoteStreamV2(userId, streamId) {
        g_JrtcEngine.printLog("stopRemoteStreamV2 enter.userId:" + userId + ",streamId:" + streamId);
        this.JRTCEngine.JRTCEngineStopRemoteViewV2(userId, streamId);
    }

    /**
     * @desc 【desc】Turn off rendering for remote video streams(关闭远程视频流的渲染)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     * @param {div}    view the view to render(渲染视频的窗口)
     */
    stopRemoteVideoRender(streamId, view) {
        g_JrtcEngine.printLog("stopRemoteVideoRender enter.streamId:" + streamId);
        this._uninitRender(streamId, view);
    }

    /**
     * @desc 【desc】Pause the remote user's video stream,remote desktop video is not included(暂停远程视频流,不包括远程桌面视频)
     * @param {Number} peerId The ID of the participant in the meeting(参会者ID)
     * @param {string} streamId The video stream ID of the participant(远程视频流ID)
     * @param {boolean} mute ture:pause;false:resume(true表示暂停,false表示恢复)
     */
    muteRemoteVideo(peerId, streamId, mute) {
        this.JRTCEngine.JRTCEngineMuteRemoteVideo(peerId, streamId, mute);
    }

    /**
     * @desc 【desc】Pause the remote user's video stream,remote desktop video is not included(暂停远程视频流,不包括远程桌面视频)
     * @param {string} userId The ID of the participant in the meeting(参会者ID)
     * @param {string} streamId The video stream ID of the participant(远程视频流ID)
     * @param {boolean} mute ture:pause;false:resume(true表示暂停,false表示恢复)
     */
    muteRemoteVideoV2(userId, streamId, mute) {
        this.JRTCEngine.JRTCEngineMuteRemoteVideoV2(userId, streamId, mute);
    }

    /**
     * obsolete
     * @desc 【desc】Pause all remote user video streams(暂停所有远程用户视频流)
     * @param {boolean} mute ture:pause;false:resume(true表示暂停,false表示恢复)
     * @private
     */
    muteAllRemoteVideo(mute) {
        this.JRTCEngine.JRTCEngineMuteAllRemoteVideo(mute);
    }

    /**
     * @desc 【desc】Gets a list of shared desktops(获取可共享的屏幕列表)
     * @param {function} cb Callback function that returns a list of available desktops,which contain three property:id {Number}, 
     * uniqueId {string}, and name{string}.If the shared screen list is empty, the Array Object is null.(屏幕列表由此回调函数返回,
     * 该回调函数的参数为数组,数组元素为对象，包含三个属性：id、deviceId和name.如果共享屏幕列表为空，则array object 是null.)
     */
    getScreenCaptureSources(cb) {
        this.JRTCEngine.JRTCEngineGetScreenCaptureSources(cb);
    }

    /**
     * @desc 【desc】Gets a list of shared application Windows(获取可共享的应用程序列表)
     * @param {function} cb Callback function that returns a list of available applications,which contain three property:id {Number}, 
     * uniqueId {string}, and name{string}.If the shared application list is empty, the array Object is null(应用程序列表由此回调函数返
     * 回,该回调函数的参数为数组,数组元素为对象，包含三个属性：id、deviceId和 name.如果共享应用列表为空，则array object 是null)
     */
    getWindowCaptureSources(cb) {
        this.JRTCEngine.JRTCEngineGetWindowCaptureSources(cb);
    }

    /**
     * @desc 【desc】Start remote desktop capture video(开始远程桌面视频捕获预览)
     * @param {Object} desktopCapturePreview (远程桌面视频参数对象)
     * @param {Object} desktopCapturePreview.captureInfo (捕获信息对象)
     * @param {Number} desktopCapturePreview.captureInfo.id (捕获的屏幕或应用的id,由getScreenCaptureSources()或getWindowCaptureSources()返回)
     * @param {string} desktopCapturePreview.captureInfo.uniqueId (捕获的屏幕或应用的deviceId,由getScreenCaptureSources()或getWindowCaptureSources()返回)
     * @param {string} desktopCapturePreview.captureInfo.name (捕获的屏幕或应用的名称,由getScreenCaptureSources()或getWindowCaptureSources()返回)
     * @param {Number} desktopCapturePreview.desktopType screen:0;app:1(共享的类型：0:屏幕共享;1:应用共享;)
     * @param {Number} desktopCapturePreview.width The width of the video frame(视频的宽)
     * @param {Number} desktopCapturePreview.height The height of the video frame(视频的高)
     * @param {Number} desktopCapturePreview.thumbnailType The type of the thumbnail,1:small picture;2:big picture(缩略图类型: 1:小图;2:大图)
     * @param {div} desktopCapturePreview.view the view to render(渲染视频的窗口)
     * @param {Function}  desktopCapturePreview.finishCallback - 0 indicates success and less 0 indicates failure.
     */
    startDesktopCapturePreview(desktopCapturePreview) {
        desktopCapturePreview.jrtcEngine = this;
        desktopCapturePreview.streamCB = this._streamCBForScreenShared;
        desktopCapturePreview.isMultiRate = false;
        desktopCapturePreview.base64Image = function (uniqueId,base64Image){
            if(base64Image.length > 0){
                //var childLen = desktopCapturePreview.view.children.length;
                var desktopCapturePreviewParam = g_screenSharedPreviewStreamIdToViewMap.get(uniqueId);
                if(desktopCapturePreviewParam != undefined){
                    var view = desktopCapturePreviewParam.view;
                    var childLen = view.children.length;
                    if (childLen > 0) {
                        //The view has only one child node
                        if (!g_JrtcEngine.getSystemSleepState()) {
                            //var image = g_JrtcEngine.renderForScreenSharedPreview.getOneFrame();
                            view.children[0].src = base64Image;
                        }
                    }
                    else {
                        var imgEle = document.createElement('img');
                        imgEle.style.width = '100%';
                        imgEle.style.height = '100%';
                        imgEle.style.display = 'flex';
                        imgEle.style.justifyContent = 'center';
                        imgEle.style.objectFit = 'contain';
                        if (!g_JrtcEngine.getSystemSleepState()) {
                            //var image = g_JrtcEngine.renderForScreenSharedPreview.getOneFrame();
                            imgEle.src = base64Image;
                            view.appendChild(imgEle);
                        }
                    }
                    desktopCapturePreviewParam.finishCallback(0);
                }
                else{
                    desktopCapturePreviewParam.finishCallback(-2);
                }
            }
            else{
                desktopCapturePreviewParam.finishCallback(-1);
            }
            g_screenSharedPreviewStreamIdToViewMap.delete(uniqueId);
        };
        this.JRTCEngine.JRTCEngineStartDesktopCapturePreview(desktopCapturePreview);
        //if (process.platform == "win32") {
            this._initRenderForScreenShared(desktopCapturePreview.view.clientWidth, desktopCapturePreview.view.clientHeight);
        //}
        g_screenSharedPreviewStreamIdToViewMap.set(desktopCapturePreview.captureInfo.uniqueId, desktopCapturePreview);
    }

    /**
     * @desc 【desc】Stop remote desktop capture video(停止远程桌面共享预览)
     * @param {Object} desktopCapturePreviews
     * @param {Number} desktopCapturePreviews.desktopPreviewSize - Desktop preview object array size(桌面预览对象数组大小)
     * @param {Object[]} desktopCapturePreviews.desktopPreviewArray - Desktop preview object array(桌面预览对象数组)
     * @param {Object} desktopCapturePreviews.desktopPreviewArray[].captureInfo - Capture information object(捕获信息对象)
     * @param {Number} desktopCapturePreviews.desktopPreviewArray[].captureInfo.id - (捕获的屏幕或应用的id,由getScreenCaptureSources()或getWindowCaptureSources()返回)
     * @param {string} desktopCapturePreviews.desktopPreviewArray[].captureInfo.uniqueId - (捕获的屏幕或应用的deviceId,由getScreenCaptureSources()或getWindowCaptureSources()返回)
     * @param {string} desktopCapturePreviews.desktopPreviewArray[].captureInfo.name - (捕获的屏幕或应用的名称,由getScreenCaptureSources()或getWindowCaptureSources()返回)
     * @param {Number} desktopCapturePreviews.desktopPreviewArray[].desktopType - Screen:0;App:1 (共享的类型：0:屏幕共享;1:应用共享;)
     * @param {Number} desktopCapturePreviews.desktopPreviewArray[].width - The width of the video frame(视频的宽)
     * @param {Number} desktopCapturePreviews.desktopPreviewArray[].height - The height of the video frame(视频的高)
     * @param {div} desktopCapturePreviews.desktopPreviewArray[].view - the view to render(渲染视频的窗口)
     * @param {Function}  desktopCapturePreviews.finishCallback - Stop screen sharing after local preview callback function,0 indicates success and -1 indicates failure.
     * (停止屏幕共享本地预览后回调函数，0表示成功，-1表示失败) 
     * callback 格式： function (ret){}
     */
    stopDesktopCapturePreview(desktopCapturePreviews) {
        // if (process.platform == "win32") {
        //     for (var i = 0; i < desktopCapturePreviews.desktopPreviewSize; i++) {
        //         desktopCapturePreviews.desktopPreviewArray[i].jrtcEngine = this;
        //         desktopCapturePreviews.desktopPreviewArray[i].streamCB = null;
        //         desktopCapturePreviews.desktopPreviewArray[i].isMultiRate = false;
        //         var view = g_screenSharedPreviewStreamIdToViewMap.get(desktopCapturePreviews.desktopPreviewArray[i].captureInfo.uniqueId);
        //         if (view != undefined) {
        //             var childLen = view.children.length;
        //             for (var j = 0; j < childLen; j++) {
        //                 view.removeChild(view.children[j]);
        //             }
        //             g_screenSharedPreviewStreamIdToViewMap.delete(desktopCapturePreviews.desktopPreviewArray[i].captureInfo.uniqueId);
        //         }
        //     }
        //     this.JRTCEngine.JRTCEngineStopDesktopCapturePreview(desktopCapturePreviews);
        //     this._uninitRenderForScreenShared();
        // }
        // else{
            if(desktopCapturePreviews.finishCallback != undefined){
                desktopCapturePreviews.finishCallback(0);
            }
        //}
    }

    /**
     * @desc 【desc】Stop remote desktop capture video(停止远程桌面共享预览)
     * @param {Object} desktopCapturePreviews
     * @param {Number} desktopCapturePreviews.desktopPreviewSize - Desktop preview object array size(桌面预览对象数组大小)
     * @param {Object[]} desktopCapturePreviews.desktopPreviewArray - Desktop preview object array(桌面预览对象数组)
     * @param {Object} desktopCapturePreviews.desktopPreviewArray[].captureInfo - Capture information object(捕获信息对象)
     * @param {Number} desktopCapturePreviews.desktopPreviewArray[].captureInfo.id - (捕获的屏幕或应用的id,由getScreenCaptureSources()或getWindowCaptureSources()返回)
     * @param {string} desktopCapturePreviews.desktopPreviewArray[].captureInfo.uniqueId - (捕获的屏幕或应用的deviceId,由getScreenCaptureSources()或getWindowCaptureSources()返回)
     * @param {string} desktopCapturePreviews.desktopPreviewArray[].captureInfo.name - (捕获的屏幕或应用的名称,由getScreenCaptureSources()或getWindowCaptureSources()返回)
     * @param {Number} desktopCapturePreviews.desktopPreviewArray[].desktopType - Screen:0;App:1 (共享的类型：0:屏幕共享;1:应用共享;)
     * @param {Number} desktopCapturePreviews.desktopPreviewArray[].width - The width of the video frame(视频的宽)
     * @param {Number} desktopCapturePreviews.desktopPreviewArray[].height - The height of the video frame(视频的高)
     * @param {div} desktopCapturePreviews.desktopPreviewArray[].view - the view to render(渲染视频的窗口)
     * @returns {Object}  - Return a promise object,0 indicates success and -1 indicates failure.(返回一个Promise对象，0表示成功，-1表示失败) 
     */
    stopDesktopCapturePreviewPromise(desktopCapturePreviews) {
        const desktopCapturePreviews0 = {
            desktopPreviewSize: desktopCapturePreviews.desktopPreviewSize,
            desktopPreviewArray: desktopCapturePreviews.desktopPreviewArray
        };
        self = this;
        return new Promise((resolve, reject) => {
            desktopCapturePreviews0.finishCallback = function (ret) {
                if (ret == 0) {
                    resolve(0);
                }
                else {
                    reject(ret);
                }
            };
            self.stopDesktopCapturePreview(desktopCapturePreviews0);
        });
    }
    
    /**
     * @desc 【desc】Start desktop sharing video(开始桌面共享)
     * @param {Object} desktopPreviewParam Parameters required when sharing a screen (桌面共享参数对象)
     * @param {Object} desktopPreviewParam.captureInfo (捕获信息对象)
     * @param {Number} desktopPreviewParam.captureInfo.id (捕获的屏幕或应用的id,由getScreenCaptureSources()或getWindowCaptureSources()返回)
     * @param {string} desktopPreviewParam.captureInfo.uniqueId (捕获的屏幕或应用的deviceId,由getScreenCaptureSources()或getWindowCaptureSources()返回)
     * @param {string} desktopPreviewParam.captureInfo.name (捕获的屏幕或应用的名称,由getScreenCaptureSources()或getWindowCaptureSources()返回)
     * @param {Number} desktopPreviewParam.desktopType Screen:0;App:1 (共享的类型：0:屏幕共享;1:应用共享;)
     * @param {Number} desktopPreviewParam.width The width of the video frame(视频的宽)
     * @param {Number} desktopPreviewParam.height The height of the video frame(视频的高)
     * @param {Bollean} desktopPreviewParam.isMultiRate Whether it is multiple bit rate(true:多码率;false:反之)
     * @param {Number} desktopPreviewParam.highPriority High flow mark,the range of 1 to 100,1 indicates the lowest priority, and 100 indicates the highest 
     * priority.(高优流标识,取值范围是1到100，1为最低优先级，100为最高优先级)
     * @param {Number[]} desktopCapturePreview.excludedWindowIds Exclude window id that can contain multiple window ids ,it is valid when the desktopPreviewParam.desktopType is 0.
     * (要排除窗口的ID,可以包含多个窗口id,当desktopPreviewParam.desktopType为0时，该值有效)
     * @param {Number} desktopCapturePreview.captureMode screen sharing mode(0:normal mode,1:smooth mode)屏幕共享模式(0:正常模式;1:流畅模式)
     */
    startDesktopCaptureShare(desktopPreviewParam) {
        desktopPreviewParam.jrtcEngine = this;
        desktopPreviewParam.streamCB = null;
        this.JRTCEngine.JRTCEngineStartDesktopCaptureShare(desktopPreviewParam);
    }

    /**
     * @desc 【desc】Start desktop sharing video(开始桌面共享)
     * @param {Object} desktopPreviewParam Parameters required when sharing a screen (桌面共享参数对象)
     * @param {Object} desktopPreviewParam.captureInfo (捕获信息对象)
     * @param {Number} desktopPreviewParam.captureInfo.id (捕获的屏幕或应用的id,由getScreenCaptureSources()或getWindowCaptureSources()返回)
     * @param {string} desktopPreviewParam.captureInfo.uniqueId (捕获的屏幕或应用的deviceId,由getScreenCaptureSources()或getWindowCaptureSources()返回)
     * @param {string} desktopPreviewParam.captureInfo.name (捕获的屏幕或应用的名称,由getScreenCaptureSources()或getWindowCaptureSources()返回)
     * @param {Number} desktopPreviewParam.desktopType Screen:0;App:1 (共享的类型：0:屏幕共享;1:应用共享;)
     * @param {Number} desktopPreviewParam.width The width of the video frame(视频的宽)
     * @param {Number} desktopPreviewParam.height The height of the video frame(视频的高)
     * @param {Bollean} desktopPreviewParam.isMultiRate Whether it is multiple bit rate(true:多码率;false:反之)
     * @param {Number} desktopPreviewParam.highPriority High flow mark,the range of 1 to 100,1 indicates the lowest priority, and 100 indicates the highest 
     * priority.(高优流标识,取值范围是1到100，1为最低优先级，100为最高优先级)
     * @param {Number[]} desktopCapturePreview.excludedWindowIds Exclude window id that can contain multiple window ids ,it is valid when the desktopPreviewParam.desktopType is 0.
     * (要排除窗口的ID,可以包含多个窗口id,当desktopPreviewParam.desktopType为0时，该值有效)
     * @param {Number} desktopCapturePreview.captureMode screen sharing mode(0:normal mode,1:smooth mode)屏幕共享模式(0:正常模式;1:流畅模式)
     * @returns {Object}  - Return a promise object,0 indicates success and -1 indicates failure.(返回一个Promise对象，0表示成功，-1表示失败) 
     */
    startDesktopCaptureShareByAsync(desktopPreviewParam) {
        g_JrtcEngine.printLog("startDesktopCaptureShareByAsync enter." + JSON.stringify(desktopPreviewParam));
        self = this;
        return new Promise((resolve, reject) => {
            desktopPreviewParam.jrtcEngine = self;
            desktopPreviewParam.streamCB = null;
            desktopPreviewParam.funcCallState = function(errorCode,data){
                if(errorCode == 0){
                    resolve(data);
                }
                else{
                    reject(data);
                }
            };
            self.JRTCEngine.JRTCEngineStartDesktopCaptureShare(desktopPreviewParam);
        });
    }

    /**
     * @desc 【desc】Stop desktop sharing video(停止远程桌面共享)
     * @param {Object} desktopPreviewParam Parameters required to turn off the shared screen (远程桌面预览参数对象)
     * @param {Object} desktopPreviewParam.captureInfo (捕获信息对象)
     * @param {Number} desktopPreviewParam.captureInfo.id (捕获的屏幕或应用的id,由getScreenCaptureSources()或getWindowCaptureSources()返回)
     * @param {string} desktopPreviewParam.captureInfo.uniqueId (捕获的屏幕或应用的deviceId,由getScreenCaptureSources()或getWindowCaptureSources()返回)
     * @param {string} desktopPreviewParam.captureInfo.name (捕获的屏幕或应用的名称,由getScreenCaptureSources()或getWindowCaptureSources()返回)
     * @param {Number} desktopPreviewParam.desktopType Screen:0;App:1 (共享的类型：0:屏幕共享;1:应用共享;)
     * @param {Number} desktopPreviewParam.width The width of the video frame(视频的宽)
     * @param {Number} desktopPreviewParam.height The height of the video frame(视频的高)
     * @param {Bollean} desktopPreviewParam.isMultiRate Whether it is multiple bit rate(true:多码率;false:反之)
     */
    stopDesktopCaptureShare(desktopPreviewParam) {
        desktopPreviewParam.jrtcEngine = this;
        desktopPreviewParam.streamCB = null;
        this.JRTCEngine.JRTCEngineStopDesktopCaptureShare(desktopPreviewParam);
    }

    /**
     * @desc 【desc】Open remote desktop to share video(开启远程桌面视频)
     * @param {Object} remoteDesktopPreviewParam Parameters required to start desktop sharing video(远程桌面视频参数对象)
     * @param {Number} remoteDesktopPreviewParam.userId The ID of the participant in the meeting，Choose either userId or uId(参会者ID,userId和uId两者选其一)
     * @param {string} remoteDesktopPreviewParam.uId The ID of the participant in the meeting，Choose either userId or uId(参会者ID,userId和uId两者选其一)
     * @param {string} remoteDesktopPreviewParam.streamId The audio stream ID of the participant(远程流ID)
     * @param {Number} remoteDesktopPreviewParam.width The width of the video frame(视频的宽)
     * @param {Number} remoteDesktopPreviewParam.height The height of the video frame(视频的高)
     * @param {Bollean} remoteDesktopPreviewParam.isMultiRate Whether it is multiple bit rate(true:多码率;false:反之)
     * @param {div} remoteDesktopPreviewParam.view the view to render(渲染视频的窗口)
     * @param {Number} remoteDesktopPreviewParam.streamSubscribeModelType Subscription flow pattern(1:自动;2:固定;)
     * @param {Number} remoteDesktopPreviewParam.streamBitrateType The size of the flow(0:小流;1:大流;)
     * @param {Number} mode 0 - contain;1 - covert; 2 - fill;(0:保持视频比例;1:使视频适应窗口尺寸-裁剪;2:使视频适应窗口尺寸——拉伸)
     */
    startRemoteDesktopView(remoteDesktopPreviewParam, mode) {
        g_JrtcEngine.printLog("startRemoteDesktopView enter." + " userId:" + remoteDesktopPreviewParam.userId + " uId:" + remoteDesktopPreviewParam.uId + " streamId:" + remoteDesktopPreviewParam.streamId + ",mode:" + mode);
        remoteDesktopPreviewParam.streamCB = this._streamCB;
        remoteDesktopPreviewParam.jrtcEngine = this;
        if (mode == undefined) {
            mode = 0;
        }
        this._initRender(remoteDesktopPreviewParam.streamId, remoteDesktopPreviewParam.view, mode);
        this.JRTCEngine.JRTCEngineStartRemoteDesktopView(remoteDesktopPreviewParam);
    }

    /**
     * @desc 【desc】Open remote desktop video steam(开启远程桌面视频流)
     * @param {Object} remoteDesktopPreviewParam Parameters required to start desktop sharing video(远程桌面视频参数对象)
     * @param {Number} remoteDesktopPreviewParam.userId The ID of the participant in the meeting，Choose either userId or uId(参会者ID,userId和uId两者选其一)
     * @param {string} remoteDesktopPreviewParam.uId The ID of the participant in the meeting，Choose either userId or uId(参会者ID,userId和uId两者选其一)
     * @param {string} remoteDesktopPreviewParam.streamId The audio stream ID of the participant(远程流ID)
     * @param {Number} remoteDesktopPreviewParam.width The width of the video frame(视频的宽)
     * @param {Number} remoteDesktopPreviewParam.height The height of the video frame(视频的高)
     * @param {Bollean} remoteDesktopPreviewParam.isMultiRate Whether it is multiple bit rate(true:多码率;false:反之)
     * @param {Number} remoteDesktopPreviewParam.streamSubscribeModelType Subscription flow pattern(1:自动;2:固定;)
     * @param {Number} remoteDesktopPreviewParam.streamBitrateType The size of the flow(0:小流;1:大流;)
     */
    startRemoteDesktopStream(remoteDesktopPreviewParam) {
        g_JrtcEngine.printLog("startRemoteDesktopStream enter." + JSON.stringify(remoteDesktopPreviewParam));
        remoteDesktopPreviewParam.streamCB = this._streamCB;
        remoteDesktopPreviewParam.jrtcEngine = this;
        this.JRTCEngine.JRTCEngineStartRemoteDesktopView(remoteDesktopPreviewParam);
    }

    /**
     * @desc 【desc】Open remote desktop video steam(开启远程桌面视频流)
     * @param {Object} remoteDesktopPreviewParam Parameters required to start desktop sharing video(远程桌面视频参数对象)
     * @param {Number} remoteDesktopPreviewParam.userId The ID of the participant in the meeting，Choose either userId or uId(参会者ID,userId和uId两者选其一)
     * @param {string} remoteDesktopPreviewParam.uId The ID of the participant in the meeting，Choose either userId or uId(参会者ID,userId和uId两者选其一)
     * @param {string} remoteDesktopPreviewParam.streamId The audio stream ID of the participant(远程流ID)
     * @param {Number} remoteDesktopPreviewParam.width The width of the video frame(视频的宽)
     * @param {Number} remoteDesktopPreviewParam.height The height of the video frame(视频的高)
     * @param {Bollean} remoteDesktopPreviewParam.isMultiRate Whether it is multiple bit rate(true:多码率;false:反之)
     * @param {Number} remoteDesktopPreviewParam.streamSubscribeModelType Subscription flow pattern(1:自动;2:固定;)
     * @param {Number} remoteDesktopPreviewParam.streamBitrateType The size of the flow(0:小流;1:大流;)
     * @returns {Object}  - Return a promise object,0 indicates success and -1 indicates failure.(返回一个Promise对象，0表示成功，-1表示失败) 
     * @private
     */
    startRemoteDesktopStreamByAsync(remoteDesktopPreviewParam) {
        g_JrtcEngine.printLog("startRemoteDesktopStreamByAsync enter." + JSON.stringify(remoteDesktopPreviewParam));
        self = this;
        return new Promise((resolve, reject) => {
            remoteDesktopPreviewParam.streamCB = self._streamCB;
            remoteDesktopPreviewParam.jrtcEngine = self;
            remoteDesktopPreviewParam.funcCallState = function(errorCode,data){
                if(errorCode == 0){
                    resolve(data);
                }
                else{
                    reject(data);
                }
            };
            self.JRTCEngine.JRTCEngineStartRemoteDesktopView(remoteDesktopPreviewParam);
        });
    }

    /**
     * @desc 【desc】Start to render remote desktop video(开启远程桌面视频渲染)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     * @param {div} view the view to render(渲染视频的窗口)
     * @param {Number} mode 0 - contain;1 - covert; 2 - fill;(0:保持视频比例;1:使视频适应窗口尺寸-裁剪;2:使视频适应窗口尺寸——拉伸)
     */
    startRemoteDesktopRender(streamId, view, mode) {
        g_JrtcEngine.printLog("startRemoteDesktopRender enter.streamId:" + streamId + ",mode:" + mode);
        if (mode == undefined) {
            mode = 0;
        }
        this._initRender(streamId, view, mode);
    }

    /**
     * @desc 【desc】Stop remote desktop video(停止远程桌面视频)
     * @param {Number} peerId The ID of the participant in the meeting(参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     * @param {div} view the view to render(渲染视频的窗口)
     */
    stopRemoteDesktopView(peerId, streamId, view) {
        g_JrtcEngine.printLog("stopRemoteDesktopView enter.peerId:" + peerId + ",streamId:" + streamId);
        this.JRTCEngine.JRTCEngineStopRemoteDesktopView(peerId, streamId);
        this._uninitRender(streamId, view);
        console.log("leave stopRemoteDesktopView");
    }

    /**
     * @desc 【desc】Stop remote desktop video stream(停止远程桌面视频流)
     * @param {Number} peerId The ID of the participant in the meeting(参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     */
    stopRemoteDesktopStream(peerId, streamId) {
        g_JrtcEngine.printLog("stopRemoteDesktopStream enter.peerId:" + peerId + ",streamId:" + streamId);
        this.JRTCEngine.JRTCEngineStopRemoteDesktopView(peerId, streamId);
        console.log("leave stopRemoteDesktopStream");
    }

    /**
     * @desc 【desc】Stop remote desktop video stream(停止远程桌面视频流)
     * @param {string} userId The ID of the participant in the meeting(参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     */
    stopRemoteDesktopStreamV2(userId, streamId) {
        g_JrtcEngine.printLog("stopRemoteDesktopStreamV2 enter.userId:" + userId + ",streamId:" + streamId);
        this.JRTCEngine.JRTCEngineStopRemoteDesktopViewV2(userId, streamId);
        console.log("leave stopRemoteDesktopStreamV2");
    }

    /**
     * @desc 【desc】Stop remote desktop render(停止远程桌面视频渲染)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     * @param {div} view the view to render(渲染视频的窗口)
     */
    stopRemoteDesktopRender(streamId, view) {
        g_JrtcEngine.printLog("stopRemoteDesktopRender enter.streamId:" + streamId);
        this._uninitRender(streamId, view);
        console.log("leave stopRemoteDesktopRender");
    }

    /**
     * @desc 【desc】Stop remote desktop video(停止远程桌面视频)
     * @param {string} userId The ID of the participant in the meeting(参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     * @param {div} view the view to render(渲染视频的窗口)
     */
    stopRemoteDesktopViewV2(userId, streamId, view) {
        g_JrtcEngine.printLog("stopRemoteDesktopViewV2 enter.userId:" + userId + ",streamId:" + streamId);
        this.JRTCEngine.JRTCEngineStopRemoteDesktopViewV2(userId, streamId);
        this._uninitRender(streamId, view);
        console.log("leave stopRemoteDesktopViewV2");
    }

    /**
     * @desc 【desc】Set playout device(设置会议使用的扬声器设备)
     * @param {Number} index The index of loudspeak in the list returned by the getPlayoutSources(getPlayoutSources()函数返回的设备列表的索引)
     */
    setPlayoutDevice(index) {
        this.JRTCEngine.JRTCEngineSetPlayoutDevice(index);
    }

    /**
     * @desc 【desc】Set playout device by the uniqueId(通过设备的uniqueId设置会议使用的扬声器设备)
     * @param {Number} uniqueId The uniqueId of loudspeak in the list returned by the getPlayoutSources(getPlayoutSources()函数返回的设备列表中的uniqueId)
     */
    setPlayoutDeviceByUID(uniqueId) {
        this.JRTCEngine.JRTCEngineSetPlayoutDeviceByUID(uniqueId);
    }

    /**
     * @desc 【desc】Set recording device(设置会议使用的麦克风设备)
     * @param {Number} index The index of mic in the list returned by the getRecordingSources(getRecordingSources()函数返回的设备列表的索引)
     */
    setRecordingDevice(index) {
        this.JRTCEngine.JRTCEngineSetRecordingDevice(index);
    }

    /**
     * @desc 【desc】Set recording device by uniqueId(通过设备的uniqueId设置会议使用的麦克风设备)
     * @param {Number} uniqueId The uniqueId of mic in the list returned by the getRecordingSources(getRecordingSources()函数返回的设备列表中的uniqueId)
     */
    setRecordingDeviceByUID(uniqueId) {
        this.JRTCEngine.JRTCEngineSetRecordingDeviceByUID(uniqueId);
    }
    
    /**
     * @desc 【desc】Set a callback to require the external mic state.(设置回调函数来获取外部麦克风设备的状态)
     * @param cb The external mic state is returned through this function,true indicates mute and false indicates unmute.
     * You set null to cancel requiring mic state.(外部麦克风的状态通过此函数获取，true表示外部设备麦克风静音，false表示解除静音
     * 你能设置null来取消麦克风状态获取).
     * cb 格式： function (state){}
     */
    setExternalRecordingStateCallback(cb){
        this.JRTCEngine.JRTCEngineSetExternalDeviceStateCallback(cb);
    }

    /**
     * obsolete
     * @desc  【desc】Set speaker volume(设置扬声器的音量)
     * @param {Number} volume The volume value of loudspeak (扬声器音量，范围是0~255)
     * @private
     */
    setSpeakerVolume(volume) {
        this.JRTCEngine.JRTCEngineSetSpeakerVolume(volume);
    }

    /**
     * Set the microphone volume
     * @param {Number} index volume size,0~100(音量大小,范围0~100)
     */
    setMicrophoneVolume(index) {
        this.JRTCEngine.JRTCEngineSetMicrophoneVolume(index);
    }

    /**
     * @desc 【desc】Get playout sources(获取设备的扬声器列表)
     * @param {Function} cb The list of loudspeak is returned through this function.This function takes array object, 
     * which contain three property:id {Number}, name {string}, and uniqueId{string}.If the speaker list is empty, 
     * array Object is null(设备的扬声器列表由此回调函数返回,该函数入参为一个数组,数组元素为对象,有三个属性：id、name和uniqueId.
     * 如果扬声器列表为空，则array object 是null)
     */
    getPlayoutSources(cb) {
        this.JRTCEngine.JRTCEngineGetPlayoutSources(cb);
    }

    /**
     * @desc 【desc】Get recording sources(获取设备的麦克风列表)
     * @param {Function} cb The list of mic is returned through this function.This function takes array object, 
     * which contain three property:id {Number}, name {string}, and uniqueId{string}.If the microphone list is 
     * empty, array Object is null(设备的麦克风列表由此回调函数返回,该函数入参为一个数组,数组元素为对象,有三个属性：
     * id、name和uniqueId.如果麦克风列表为空，则array object 是null)
     */
    getRecordingSources(cb) {
        this.JRTCEngine.JRTCEngineGetRecordingSources(cb);
    }

    /**
     * @desc 【desc】Send chat message (发送聊天信息)
     * @param {Object} msg Message sending object(聊天信息对象)
     * @param {Number} msg.i_userId Meeting participant ID,Choose either userId or uId(参会者ID,userId和uId两者选其一)
     * @param {string} msg.userId Meeting participant ID,Choose either userId or uId(参会者ID,userId和uId两者选其一)
     * @param {string} msg.message Messages to be sent by attendees(要发送的信息)
     * @param {Function} msg.onErrorCallBack This function is called when the message was sent fails(消息错误发送失败回调函数)
     * @param {Function} msg.OnSuccessCallBack This function is called when the message was sent successfully(消息发送成功回调函数)
     */
    sendChatMessage(msg) {
        this.JRTCEngine.JRTCEngineSendChatMessage(msg);
    }

    /**
     * Init broad cast(暂不开放)
     * @param {Object} authInfo userinfo (用户信息对象)
     * @param {Number} authInfo.peerId The ID of the participant in the meeting(参会者ID)
     * @param {string} authInfo.sdkVersion Version number of the SDK(SDK版本信息：如：v1.0.0，根据实际版本填写)
     * @param {string} authInfo.nickName The user nickname(参会者的用户昵称)
     * @param {string} authInfo.token Token obtained from the management according to the meeting number(token,根据会议号从会控服务获取的token)
     * @param {string} authInfo.appId AppId obtained from the management according to the meeting number(appId,根据会议号从会控服务获取token时返回的appId)
     * @param {string} authInfo.userId The user ID represents a unique representation of the user(userId,根据会议号从会控服务获取token时返回的userId)
     * @param {string} authInfo.nonce nonce(nonce,根据会议号从会控服务获取token时返回的nonce)
     * @param {Number} authInfo.timestamp Timestamp, indicating the time to enter the meeting(timestamp,根据会议号从会控服务获取token时返回的timestamp)
     * @private
     */
    initBroadCast(authInfo) {
        this.JRTCEngine.JRTCEngineInitBroadCast(authInfo);
    }

    /**
     * @desc 【desc】Modify the attendee user nickname(修改与会者用户的昵称,仅在本次会议有效)
     * @param {Number} roomId The meeting number(会议号)
     * @param {Number} peerId The ID of the participant in the meeting(参会者ID)
     * @param {string} nickName The user nickname(参会者用户昵称)
     */
    changeNickName(roomId, peerId, nickname) {
        this.JRTCEngine.JRTCEngineChangeNickName(roomId, peerId, nickname);
    }

    /**
     * @desc 【desc】Modify the attendee user nickname(修改与会者用户的昵称,仅在本次会议有效)
     * @param {string} userId The ID of the participant in the meeting(参会者ID)
     * @param {string} nickName The user nickname(参会者用户昵称)
     */
    changeNickNameV2(userId, nickname) {
        this.JRTCEngine.JRTCEngineChangeNickNameV2(userId, nickname);
    }

    /**
     * @desc 【desc】subscribe data streams(订阅文字数据流)
     * @param {string} literalStreamId The literal stream ID (文字流ID)
     */
    subscribeDataStream(literalStreamId) {
        this.JRTCEngine.JRTCEngineSubscribeDataStream(literalStreamId);
    }

    /**
    * @desc 【desc】unsubscribe data streams(取消订阅文字数据流)
    * @param {string} literalStreamId The literal stream ID (文字流ID)
    */
    unsubscribeDataStream(literalStreamId) {
        this.JRTCEngine.JRTCEngineUnsubscribeDataStream(literalStreamId);
    }

    /**
     * @desc 【desc】Send control message(发送控制消息)
     * @param {Number} peerId The ID of the participant in the meeting(参会者ID,如指定某个成员的id,则该消息只针对该成员，若要对所有成员发送消息，该参数设置为-1)
     * @param {Number} messageType message type(要发送的消息类型：0:none;1:使单个成员静音;2:全体静音;5:关闭单个成员视频;6:关闭
     *     所有所有成员视频;9.自定义消息(如：jrtc_unMuteAllAudio、jrtc_unMutePeerAudio、jrtc_creatNewHoster
     *     jrtc_closeMeeting、jrtc_allowUnmuteSelf、jrtc_putDownHands、jrtc_raiseHands、jrtc_refuseRaiseHands、jrtc_modifyNickName),用法
     *     见下面示例)
     * @param {Object} content         message content(消息所携带的信息)
     * @param {string} content.event       event(事件)
     * @param {string} content.extraData   additional data(附加数据,为JSON格式,其中JSON键值为固定为下面例子中的键值，注意：类型为jrtc_creatNewHoster时，格式为字符串)
     *  @example <caption>使单个成员静音</caption>  
     *     var content = {
     *        fromPeerId:421282,
     *        toPeerId:421278
     *     };
     *    sendControlMessage(421278,1,content);
     *  @example <caption>全体静音</caption>  
     *    sendControlMessage(-1,2);
     *  @example <caption>关闭单个成员视频</caption>  
     *     var content = {
     *        fromPeerId:421282,
     *        toPeerId:421278
     *     };
     *    sendControlMessage(421278,5);
     *  @example <caption>关闭所有所有成员视频</caption>  
     *    sendControlMessage(-1,6);
     *  @example <caption>自定义消息</caption>
     *   1.jrtc_unMuteAllAudio
     *    var content = {
     *      event:"jrtc_unMuteAllAudio",
     *      extraData:"{\"formPeerId\":133}"
     *    };
     *    sendControlMessage(-1,9,content);
     *   2.jrtc_unMutePeerAudio
     *    var peerId = 133;
     *    var content = {
     *      event:"jrtc_unMutePeerAudio",
     *      extraData:"{\"formPeerId\":133,\"toPeerId\":134}"
     *    };
     *    sendControlMessage(peerId,9,content);
     *   3.jrtc_creatNewHoster
     *    var content = {
     *      event:"jrtc_creatNewHoster",
     *      extraData:""
     *    };
     *    sendControlMessage(-1,9,content);
     *   4.jrtc_closeMeeting
     *    var content = {
     *      event:"jrtc_closeMeeting",
     *      extraData:"133"
     *    };
     *    sendControlMessage(-1,9,content);
     *   5.jrtc_allowUnmuteSelf
     *    var peerId = 133;
     *    var content = {
     *      event:"jrtc_allowUnmuteSelf",
     *      extraData:"{\"allowUnmuteSelf\":true}"
     *    };
     *    sendControlMessage(peerId,9,content);
     *   6.jrtc_putDownHands
     *    var content = {
     *      event:"jrtc_putDownHands",
     *      extraData:"{\"peerId\":133}"
     *    };
     *    sendControlMessage(-1,9,content);
     *   7.jrtc_raiseHands
     *    var content = {
     *      event:"jrtc_raiseHands",
     *      extraData:"{\"peerId\":133}"
     *    };
     *    sendControlMessage(-1,9,content);
     *   8.jrtc_refuseRaiseHands
     *     var content = {
     *      event:"jrtc_refuseRaiseHands",
     *      extraData:"{\"peerId\":133}"
     *    };
     *    sendControlMessage(-1,9,content);
     *   9.jrtc_modifyNickName
     *    var content = {
     *      event:"jrtc_modifyNickName",
     *      extraData:"{\"peerId\":133,\"nickName\":\"xxx\",\"meetingCode\":\"173\"}"
     *    };
     *    sendControlMessage(-1,9,content);
     */
    sendControlMessage(peerId, messageType, content) {
        this.JRTCEngine.JRTCEngineSendControlMessage(peerId, messageType, content);
    }

    /**
    * @desc 【desc】Send control message(发送控制消息)
    * @param {string} userId The ID of the participant in the meeting(参会者ID,如指定某个成员的id,则该消息只针对该成员，若要对所有成员发送消息，该参数设置为-1)
    * @param {Number} messageType message type(要发送的消息类型：0:none;1:使单个成员静音;2:全体静音;5:关闭单个成员视频;6:关闭
    *     所有所有成员视频;9.自定义消息(如：jrtc_unMuteAllAudio、jrtc_unMutePeerAudio、jrtc_creatNewHoster
    *     jrtc_closeMeeting、jrtc_allowUnmuteSelf、jrtc_putDownHands、jrtc_raiseHands、jrtc_refuseRaiseHands、jrtc_modifyNickName),用法
    *     见下面示例)
    * @param {Object} content         message content(消息所携带的信息)
    * @param {string} content.event       event(事件)
    * @param {string} content.extraData   additional data(附加数据,为JSON格式,其中JSON键值为固定为下面例子中的键值，注意：类型为jrtc_creatNewHoster时，格式为字符串)
    *  @example <caption>使单个成员静音</caption>  
    *     var content = {
    *        fromUserId:"xxxxxx",
    *        toUserId:"xxxxxx-ssss"
    *     };
    *    sendControlMessageV2("xxxxxx-ssss",1,content);
    *  @example <caption>全体静音</caption>  
    *    sendControlMessageV2(-1,2);
    *  @example <caption>关闭单个成员视频</caption>  
    *     var content = {
    *        fromUserId:"xxxxxx",
    *        toUserId:"xxxxxx-ssss"
    *     };
    *    sendControlMessageV2("xxxxxx-ssss",5);
    *  @example <caption>关闭所有所有成员视频</caption>  
    *    sendControlMessageV2(-1,6);
    *  @example <caption>自定义消息</caption>
    *   1.jrtc_unMuteAllAudio
    *    var content = {
    *      event:"jrtc_unMuteAllAudio",
    *      extraData:"{\"formUserId\":"xxxxxx"}"
    *    };
    *    sendControlMessageV2(-1,9,content);
    *   2.jrtc_unMutePeerAudio
    *    var content = {
    *      event:"jrtc_unMutePeerAudio",
    *      extraData:"{\"frimUserId\":"xxxxxx",\"toUserId\":"xxxxxx-ssss"}"
    *    };
    *    sendControlMessageV2("xxxxxx-ssss",9,content);
    *   3.jrtc_creatNewHoster
    *    var content = {
    *      event:"jrtc_creatNewHoster",
    *      extraData:""
    *    };
    *    sendControlMessageV2(-1,9,content);
    *   4.jrtc_closeMeeting
    *    var content = {
    *      event:"jrtc_closeMeeting",
    *      extraData:"133"
    *    };
    *    sendControlMessageV2(-1,9,content);
    *   5.jrtc_allowUnmuteSelf
    *    var content = {
    *      event:"jrtc_allowUnmuteSelf",
    *      extraData:"{\"allowUnmuteSelf\":true}"
    *    };
    *    sendControlMessageV2("xxxxxx-ssss",9,content);
    *   6.jrtc_putDownHands
    *    var content = {
    *      event:"jrtc_putDownHands",
    *      extraData:"{\"userId\":"xxxxxx"}"
    *    };
    *    sendControlMessageV2(-1,9,content);
    *   7.jrtc_raiseHands
    *    var content = {
    *      event:"jrtc_raiseHands",
    *      extraData:"{\"userId\":"xxxxxx"}"
    *    };
    *    sendControlMessageV2(-1,9,content);
    *   8.jrtc_refuseRaiseHands
    *     var content = {
    *      event:"jrtc_refuseRaiseHands",
    *      extraData:"{\"userId\":"xxxxxx"}"
    *    };
    *    sendControlMessageV2(-1,9,content);
    *   9.jrtc_modifyNickName
    *    var content = {
    *      event:"jrtc_modifyNickName",
    *      extraData:"{\"userId\":"xxxxxx",\"nickName\":\"xxx\",\"meetingCode\":\"173\"}"
    *    };
    *    sendControlMessageV2(-1,9,content);
    */
    sendControlMessageV2(userId, messageType, content) {
        this.JRTCEngine.JRTCEngineSendControlMessageV2(userId, messageType, content);
    }

    /**
    * Generate token.
    * @param param 
    */
    generateToken(param) {
        this.JRTCEngine.JRTCEngineGeneralToken(param);
    }

    /**
    * installAudioDrive
    */
    installAudioDrive(prompt) {
        return this.JRTCEngine.JRTCEngineInstallAudioDrive(prompt);
    }
    
    /**
    * HasMacAudioDeviceByDevUid
     * @return {Number} 1:has 0:not has.
    */
    hasMacVirtualDevice(deviceUid) {
        return this.JRTCEngine.JRTCEngineHasMacVirtualDevice(deviceUid);
    }

    /**
     * Set debug log enable
     * @param {*} enabled 
     */
    setDebugLogEnable(enabled) {
        this.JRTCEngine.JRTCEngineSetDebugLogEnable(enabled);
    }

    /**
     * @desc 【desc】set log callback.(设置日志回调函数) 
     * @param {function} cb log callback(日志回调函数)
     *     cb format:string cb(type,log);
     *     type:Number;
     *     log:string;
     */
    setDebugLogCallback(cb) {
        this.JRTCEngine.JRTCEngineSetDebugLogCallback(cb);
    }

    /**
     * @desc 【desc】 set api url.(设置API URL)
     * @param {string} apiURL To set API URL.(要设置的API URL)
     */
    setApiUrl(apiURL) {
        this.JRTCEngine.JRTCEngineSetApiUrl(apiURL);
    }

    /**
     * @desc 【desc】 Start uploading RTC logs.(启动RTC日志上传)
     * @param {string} deviceId Device Id.(设备ID)
     * @param {Number} recentDaysCount Number of days since the current time for uploading logs.(从当前时间起要上传的日志的天数)
     */
    startUploadRtcLogs(deviceId, recentDaysCount) {
        this.JRTCEngine.JRTCEngineStartUploadRtcLogs(deviceId, recentDaysCount);
    }

    /**
     * @desc 【desc】 Set application name,the name must be in English.(设置应用程序名称,名称需为英文)
     * @param {string} appName application name.(应用程序名称)
     */
    setAppName(appName) {
        this.JRTCEngine.JRTCEngineSetAppName(appName);
    }

    /**
     * @desc 【desc】 Get system sleep state.(获取系统睡眠状态)
     * @return {Number} state:1:sleep;0:resume.(状态)
     */
    getSystemSleepState() {
        return this.JRTCEngine.JRTCEngineGetSystemSleepState();
    }

    /**
     * 
     * @desc 【desc】 Set SDK configuration parameters.(设置SDK配置参数)
     * @param {Object} config
     * @param {Number} config.cameraCaptureFrameRate - Camera capture frame rate(摄像头采集帧率)
     * @param {Number} config.screenSharedCaptureFrameRate -Screen share capture frame rate(屏幕共享采集帧率)
     * @param {Number} config.cameraBigStreamEncodeFrameRate - Camera video stream encodes frame rate(摄像头视频大流编码帧率)
     * @param {Number} config.cameraSmallStreamEncodeFrameRate - Camera video small stream coding frame rate(摄像头视频小流编码帧率)
     * @param {Number} config.screenSharedEncodeFrameRate - Screen sharing video encoding frame rate(屏幕共享视频编码帧率)
     * @param {Number} config.cameraRenderFrameRate - Camera video render frame rate(摄像视频渲染帧率)
     * @param {Number} config.screenSharedRenderFrameRate - Screen sharing video rendering frame rate(屏幕共享视频渲染帧率)
     */
    setSDKConfigParam(config) {
        var jsonConfig = JSON.stringify(config);
        this.JRTCEngine.JRTCEngineSetSDKConfigParam(jsonConfig);
    }

    /**
     * @desc 【desc】 Get SDK Status.(获取SDK状态)
     * @returns {Object}  - Return a promise object,the parameter is of type string.(返回一个Promise对象，参数的类型是string) 
     */
     getSDKStatsByAsync(){
        self = this;
        return new Promise((resolve, reject) => {
            var cb = function (status) {
                resolve(status);
            };
            self.JRTCEngine.JRTCEngineGetSDKStats(cb);
        });
    }

    /**
     * @desc 【desc】 Get SDK Status.(获取SDK状态)
     * @param {function} cb - This function is called when the SDK status is retrieved.(当获取到SDK状态时调用此函数)
     * The format of the cb is
     *     function (String stats){
     *     }
     */
    getSDKStats(cb){
        this.JRTCEngine.JRTCEngineGetSDKStats(cb);
    }

    /**
     * @desc 【desc】Start debugging the Camera(开始调试摄像头)
     * @param {Object} previewParam (本地视频预览参数对象)
     * @param {Number} previewParam.width The width of the video frame(视频的宽)
     * @param {Number} previewParam.height The height of the video frame(视频的高)
     * @param {div} previewParam.view the view to render(渲染视频的窗口)
     * @param {Boolean} previewParam.isMultiRate Whether it is multiple bit rate(true:多码率;false:反之)
     */
    startLocalPreviewTest(previewParam){
        g_JrtcEngine.printLog("startLocalPreviewTest enter.");
        previewParam.streamCB = this._streamCB;
        previewParam.jrtcEngine = this;
        this._initRender("local", previewParam.view, 0,g_LocalVideoMirrorState);
        this.JRTCEngine.JRTCEngineStartLocalPreviewTest(previewParam);
    }

    /**
     * @desc 【desc】Start debugging the Camera(开始调试摄像头)
     * @param {Object} previewParam (本地视频预览参数对象)
     * @param {Number} previewParam.width The width of the video frame(视频的宽)
     * @param {Number} previewParam.height The height of the video frame(视频的高)
     * @param {div} previewParam.view the view to render(渲染视频的窗口)
     * @param {Boolean} previewParam.isMultiRate Whether it is multiple bit rate(true:多码率;false:反之)
     * @returns {Object}  - Return a promise object,0 indicates success and -1 indicates failure.(返回一个Promise对象，0表示成功，-1表示失败) 
     */
     startLocalPreviewTestByAsync(previewParam){
        g_JrtcEngine.printLog("startLocalPreviewTestByAsync enter.");
        self = this;
        return new Promise((resolve, reject) => {
            previewParam.streamCB = self._streamCB;
            previewParam.jrtcEngine = self;
            previewParam.funcCallState = function(errorCode,data){
                if(errorCode == 0){
                    resolve(data);
                }
                else{
                    reject(data);
                }
            };
            self._initRender("local", previewParam.view, 0,g_LocalVideoMirrorState);
            self.JRTCEngine.JRTCEngineStartLocalPreviewTest(previewParam);
        });
    }

    /**
     *  @desc 【desc】Stop debugging the Camera(停止调试摄像头)
     * @param {div} view the view to render(渲染视频的窗口)
     */
    stopLocalPreviewTest(view){
        g_JrtcEngine.printLog("stopLocalPreviewTest enter");
        this.JRTCEngine.JRTCEngineStopLocalPreviewTest();
        this._uninitRender("local", view);
    }

    /**
     * @desc 【desc】Start debugging the microphone(开始调试麦克风)
     * @param {function} cb Rewind the volume of the microphone(回调麦克风的音量)
     * The format of the cb is
     *   function (volume){ //volume is number
     *   }
     */
    startRecordingTest(cb,wavFilePath){
        this.JRTCEngine.JRTCEngineStartRecordingTest(cb,wavFilePath);
    }

    /**
     * @desc 【desc】Stop debugging the microphone(停止调试麦克风)
     */
    stopRecordingTest(){
        this.JRTCEngine.JRTCEngineStopRecordingTest();
    }

    /**
     * @desc 【desc】Start debugging the speaker(开始调试扬声器)
     * @param {string} path wave file path(音频文件路径) 
     * @param {function} cb
     * The format of the cb is
     *   function (volume, code){ //volume and code is number
     *   } 
     */
    startPlayoutTest(path,cb){
        this.JRTCEngine.JRTCEngineStartPlayoutTest(path,cb);
    }

    /**
     * @desc 【desc】Stop debugging the speaker(停止调试扬声器)
     */
    stopPlayoutTest(){
        this.JRTCEngine.JRTCEngineStopPlayoutTest();
    }

    /**
     * @desc 【desc】Retrive the hwnd of the window by the window title.(通过窗口的标题获取窗口句柄)
     * @param {String} title window title.(窗口标题)
     * @return Returns a window handle of type Number if found, otherwise,return null.(如果找到则返回Number类型的窗口句柄，否则返回null)
     */
    findWindowIdByTitle(title) {
        return this.JRTCEngine.JRTCEngineFindWindowIdByTitle(title);
    }

    /**
     * @desc 【desc】Subscribe to audio.(订阅音频)
     */
    subscribeMillionAudio(){
        this.JRTCEngine.JRTCEngineSubscribeMillionAudio();
    }

    /**
     * @desc 【desc】Unsubscribe audio.(取消订阅音频)
     */
    unSubscribeMillionAudio(){
        this.JRTCEngine.JRTCEngineUnSubscribeMillionAudio();
    }

    /**
     * @desc 【desc】Set up local video mirroring.(设置本地视频镜像)
     * @param {boolean} isMirror mirror:true,no mirror:false.(true代表镜像,false代表非镜像)
     */
    setLocalVideoMirror(isMirror){
        //this.JRTCEngine.JRTCEngineSetLocalVideoMirror(isMirror);
        this._setRenderCanvasMirror("local",isMirror);
        g_LocalVideoMirrorState = isMirror;
    }

    /**
     * @desc 【desc】Print log to sdk log file.(打印日志到sdk日志文件)
     * @param {string} logInfo log information to print.(要打印的日志信息)
     */
    printLog(logInfo){
        this.JRTCEngine.JRTCEnginePrintLog(logInfo);
    }

     reportEventError(type,errorCode,errorMsg){
        this.JRTCEngine.JRTCEngineReportEventError(type,errorCode,errorMsg);
    }

    /**
     * @desc 【desc】Get speak volume.(获取扬声器音量)
     * @return {Number} volume value,range:0~255.(音量范围0~255)
     */
    getSpeakerVolume(){
        return this.JRTCEngine.JRTCEngineGetSpeakerVolume();
     }

    /**
     * @desc 【desc】Get microphone volume.(获取麦克风音量)
     * @return {Number} volume value,range:0~255.(音量范围0~255)
     */
    getMicrophoneVolume(){
        return this.JRTCEngine.JRTCEngineGetMicrophoneVolume();
    }

    /**
     * @desc 【desc】Set the config file path of the SDK.(设置SDK配置文件路径)
     * @param {String} path the config file path of the SDK.(SDK配置文件路径)
     */
    setSDKConfigPath(path){
        this.JRTCEngine.JRTCEngineSetSDKConfigPath(path);
    }

    /**
     * @desc 【desc】Set the config string of the SDK.(设置SDK配置字符串)
     * @param {String} path the config string of the SDK.(SDK配置文件字符串)
     */
    setSDKConfigString(str){
        this.JRTCEngine.JRTCEngineSetSDKConfigString(str);
    }

    /**
     * @desc 【desc】 get device ID.(获取设备ID)
     * @return {String} device ID.(设备ID)
     */
    getDeviceId(){
        return this.JRTCEngine.JRTCEngineGetDeviceID();
    }

    /** 
     * @desc check opengl.(检查OpenGL环境)
     * @param {Number} venderType - vender type, only support st_mobile.(厂商类型，目前仅支持商汤，传0)
     * @param {String} authInfo - The authentication information.(鉴权信息)
     * @param {String} outputPath - Output directory for storing generated local certificates.(输出目录，用于存储生成的本地证书等)
     * @param {function} cb - Call this function after execution with the following error code.(执行完成后调用此函数，错误码如下)
     * The format of the cb is
     *     function (Number errorCode){
     *     }
     * The errorCode description:
     * 0:succeed.(成功)
     * -1:load JAIManager fail.(加载JAIManager失败)
     * -2:There are currently incomplete calls.(当前存在未完成的调用)
     * -3:Vendor not supported.(厂商不支持)
     * -4:Authentication failed.(鉴权失败)
     * -5:init OpenGL fail.(OpenGL初始化失败)
     * -6:init vender library fail.(美颜库初始化失败)
     * -7:load vender resource fail.(美颜库资源加载失败)
     * -8:decode image file fail.(图片文件解码失败)
     * -9:Illegal operation.(操作不合法)
     * -10:internal error.(内部错误)
     */
    checkOpenGLJAIManager(venderType, appId, cb) {
        return this.JRTCEngine.JAIManagerCheckOpenGL(venderType, appId, cb);
    }

    /** 
     * @desc init JAIManager.(初始化JAIManager)
     * @param {Number} venderType - vender type, only support st_mobile.(厂商类型，目前仅支持商汤，传0)
     * @param {String} authInfo - The authentication information.(鉴权信息)
     * @param {String} outputPath - Output directory for storing generated local certificates.(输出目录，用于存储生成的本地证书等)
     * @param {function} cb - Call this function after execution with the following error code.(执行完成后调用此函数，错误码如下)
     * The format of the cb is
     *     function (Number errorCode){
     *     }
     * The errorCode description:
     * 0:succeed.(成功)
     * -1:load JAIManager fail.(加载JAIManager失败)
     * -2:There are currently incomplete calls.(当前存在未完成的调用)
     * -3:Vendor not supported.(厂商不支持)
     * -4:Authentication failed.(鉴权失败)
     * -5:init OpenGL fail.(OpenGL初始化失败)
     * -6:init vender library fail.(美颜库初始化失败)
     * -7:load vender resource fail.(美颜库资源加载失败)
     * -8:decode image file fail.(图片文件解码失败)
     * -9:Illegal operation.(操作不合法)
     * -10:internal error.(内部错误)
     */
    initJAIManager(venderType, authInfo, outputPath, cb) {
        return this.JRTCEngine.JAIManagerInit(venderType, authInfo, outputPath, cb);
    }
    
    /** 
     * @desc init JAIManager.(初始化JAIManager)
     * @param {Number} venderType - vender type, only support st_mobile.(厂商类型，目前仅支持商汤，传0)
     * @param {string} appId AppId obtained from the management according to the meeting number(appId,根据会议号从会控服务获取token时返回的appId)
     * @param {function} cb - Call this function after execution with the following error code.(执行完成后调用此函数，错误码如下)
     * The format of the cb is
     *     function (Number errorCode){
     *     }
     * The errorCode description:
     * 0:succeed.(成功)
     * -1:load JAIManager fail.(加载JAIManager失败)
     * -2:There are currently incomplete calls.(当前存在未完成的调用)
     * -3:Vendor not supported.(厂商不支持)
     * -4:Authentication failed.(鉴权失败)
     * -5:init OpenGL fail.(OpenGL初始化失败)
     * -6:init vender library fail.(美颜库初始化失败)
     * -7:load vender resource fail.(美颜库资源加载失败)
     * -8:decode image file fail.(图片文件解码失败)
     * -9:Illegal operation.(操作不合法)
     * -10:internal error.(内部错误)
     * -11:Authentication file download failed.(鉴权文件下载失败)
     */
    initJAIManagerByAppId(venderType, appId, cb) {
        return this.JRTCEngine.JAIManagerInitByAppId(venderType, appId, cb);
    }
    /**
     * @desc Enable the video processing feature.(启用视频处理特性)
     * @param {Number} featureType - Processing type: 0: virtual background 1: background blur. There can only be one at a time.(处理类型，0:虚拟背景 1：背景模糊，只能同时存在一个)
     * @param {String} imagePath - featureType==0时，imagePath表示图片文件路径；featureType==1时，imagePath用字符串表示模糊的模式和强度，字符串形如“a:b”，其中a表示模式，取值0或1，b表示强度，取值0-100
     * @param {function} cb - same as initJAIManager.(同上)
     */
    enabelJAIManagerFeature(featureType, imagePath, cb) {
        return this.JRTCEngine.JAIManagerEnableFeature(featureType, imagePath, cb);
    }

    /**
     * @desc Disable the video processing feature.(禁用视频处理特性)
     */
    disableJAIManagerFeature() {
        return this.JRTCEngine.JAIManagerDisableFeature();
    }

    /**
     * @desc unInit JAIManager.(反初始化JAIManager)
     */
    unInitJAIManager() {
        return this.JRTCEngine.JAIManagerUnInit();
    }

    /**
     * @desc 【desc】Obtain the range value of the specified property of the camera(获取摄像头指定属性的范围值)
     * @param {Number} propertyType - property type,Pan:0;Tilt:1;Zoom:3(属性类型:水平:0;垂直:1;缩放:3)
     * @returns {Object}  - Return a promise object.(返回一个Promise对象)
     * If successful, the format of the returned information is(如果成功返回信息的格式为):
     * {
     *     "capsFlags":2,       //当前属性的能力值,手动还是自动
     *     "def":0,             //当前属性的默认值
     *     "max":170,           //当前属性的最大值
     *     "min":-170,          //当前属性的最小值
     *     "property":0,        //当前属性
     *     "steppingDelta":0    //当前属性的设置的步长
     * }
     * If it fails, the format of the returned information is(如果失败返回信息的格式为):
     * {
     *     "property",property,      //当前属性
     *     "errorCode",errorCode,    //错误码[21016001:不支持水平方向设置;21016002:不支持垂直方向设置;21016003:不支持缩放设置;21016008:参数无效;21016009:摄像头未开启;其他值：未知错误;]
     * }
     * @note The camera needs to be turned on when calling this method.(调用此方法时需要打开摄像头)
     */
    getRangePromise(propertyType) {
        // self = this;
        // return new Promise((resolve, reject) => {
        //     self.JRTCEngine.JRTCEngineGetRange(propertyType,resolve, reject,function (ret,info,resolve, reject) {
        //         if (ret == 0) {
        //             resolve(info);
        //         }
        //         else {
        //             reject(info);
        //         }
        //     });
        // });
        return this.JRTCEngine.JRTCEngineGetRange(propertyType);
    }

    /**
     * @desc 【desc】Get the current camera property setting(获取当前摄像头属性设置)
     * @param {Number} propertyType - property type,Pan:0;Tilt:1;Zoom:3(属性类型:水平:0;垂直:1;缩放:3)
     * @returns {Object}  - Return a promise object.(返回一个Promise对象) 
     * If successful, the format of the returned information is(如果成功返回信息的格式为):
     * {
     *     "property",property，    //当前属性
     *     "value",value，          //当前属性值
     *     "flags",flags            //当前属性的能力值,手动还是自动
     * }
     * If it fails, the format of the returned information is(如果失败返回信息的格式为):
     * {
     *     "property",property,      //当前属性
     *     "errorCode",errorCode,    //错误码[21016008:参数无效;21016009:摄像头未开启;其他值：未知错误;]
     * }
     * @note The camera needs to be turned on when calling this method.(调用此方法时需要打开摄像头)
     */
    getCurCameraPropertySettingPromise(propertyType) {
        // self = this;
        // return new Promise((resolve, reject) => {
        //     self.JRTCEngine.JRTCEngineGetCurCameraPropertySetting(propertyType,function (ret,info) {
        //         if (ret == 0) {
        //             resolve(info);
        //         }
        //         else {
        //             reject(info);
        //         }
        //     });
        // });
        return this.JRTCEngine.JRTCEngineGetCurCameraPropertySetting(propertyType);
    }

    /**
     * @desc 【desc】Set the current camera property setting(设置当前摄像头属性设置)
     * @param {Number} propertyType - property type,Pan:0;Tilt:1;Zoom:3(属性类型:水平:0;垂直:1;缩放:3)
     * @param {Number} propertyValue - property value(属性值的范围通过getRangePromise方法获取)
     * @param {Number} ctrlFlags - ctrlFlags,auto:1;manual:2;(标志类型:自动:1;手动:2;)
     * @param {Number} posFlags - posFlags,absolute:0;relative:1(标志类型:绝对位置:0;相对位置:1)
     * @returns {Object}  - Return a promise object.(返回一个Promise对象)
     * If successful, the format of the returned information is(如果成功返回信息的格式为):
     * "set camera property success."
     * If it fails, the format of the returned information is(如果失败返回信息的格式为):
     * {
     *     "property",property,    //当前属性
     *     "errorCode",errorCode,    //错误码[21016008:参数无效;21016009:摄像头未开启;其他值：未知错误;]
     * }
     * @note The camera needs to be turned on when calling this method.(调用此方法时需要打开摄像头)
     */
    setCurCameraPropertySettingPromise(propertyType,propertyValue,ctrlFlags,posFlags) {
        // self = this;
        // return new Promise((resolve, reject) => {
        //     self.JRTCEngine.JRTCEngineSetCurCameraPropertySetting(propertyType, propertyValue, ctrlFlags, posFlags, function (ret,info) {
        //         if (ret == 0) {
        //             resolve(info);
        //         }
        //         else {
        //             reject(info);
        //         }
        //     });
        // });
        return this.JRTCEngine.JRTCEngineSetCurCameraPropertySetting(propertyType, propertyValue, ctrlFlags, posFlags);
    }
    
    //--------------------------------------------------------------
    /* 设置回调函数
    *  如果不设置回调函数，将无法收到server返回数据，与client端的连接状态

    cbmsg 消息回调是function (data){} 
    data是服务返回的字符串

    cbstatus 连接状态回调 function (status){}
    status == 100  CONTROLER_ERROR_CONNECT_SUCCEED
    status == 101  CONTROLER_ERROR_CONNECT_FAILED
    status == 102  CONTROLER_ERROR_CONNECT_DOING
    status == 103  CONTROLER_ERROR_NUMBER_OVER
    status == 104  CONTROLER_ERROR_INVALID_SOURCEID
    */
    CTR_SetClientCallBack(cbmsg,cbstatus){
        return this.JRTCEngine.CTR_SetClientCallBack(cbmsg,cbstatus);
    }

    /* 创建客户端
    *  ip:server端的ip地址
    *  port:server端的端口号
    *  CTR_CreateClient调用一次即可，不要重复调用，内部创建TCP长连接，断开重连等
    *  返回值小于0失败，等于0表示函数调用成功，Client是否连接成功从cbstatus回调函数中返回
    */
    CTR_CreateClient(ip,port){
        return this.JRTCEngine.CTR_CreateClient(ip,port);
    }

    /* 发送数据到server端
    * data:发送的字符串
    * 返回值小于0失败
    */
    CTR_SendDataToServer(data){
        return this.JRTCEngine.CTR_SendDataToServer(data);
    }

    /* 停止客户端，退出时调用  
    *  返回值小于0失败
    */
    CTR_StopClient(){
        return this.JRTCEngine.CTR_StopClient();
    }

    /**
    * Initializes the renderer.
    * @param {string} key Key for the map that store the unique ID(it is streamId for remote stream, 'local' for locak stream and application name or screen name for desktop preview).
    * e.g, uid or `videosource` or `local`.
    * @param {div} view The Dom elements to render the video. 
    * @param {Number} mode 0 - contain;1 - covert; 2 - fill;(0:保持视频比例;1:使视频适应窗口尺寸-裁剪;2:使视频适应窗口尺寸——拉伸)
    * @private
    */
    _initRender(key, view, mode,mirror) {
        g_JrtcEngine.printLog("_initRender enter");
        var createRender = function (thisObj, view, mode) {
            g_JrtcEngine.printLog("createRender renderMode:"+thisObj.renderMode);
            let renderer;
            if (thisObj.renderMode === 1) {
                renderer = new Renderer_1.GlRenderer();
                renderer.setWebGLContextLostCallback(function(streamId,view,contentMode,mirrorView){
                    thisObj._uninitRender(streamId, view);
                    thisObj.renderMode = 2;
                    thisObj._initRender(streamId, view, contentMode,mirrorView);
                });
                renderer.bind(view);
                renderer.setLogCallback(key,function(log){
                    g_JrtcEngine.printLog(log);
                },function(errorCode,info,repeat){
                    printLogRepeat(1,errorCode,info,repeat);
                });
            }
            else if (thisObj.renderMode === 2) {
                renderer = new Renderer_1.SoftwareRenderer();
                renderer.bind(view,false);
            }
            else if (thisObj.renderMode === 3) {
                renderer = new thisObj.customRenderer();
                renderer.bind(view);
            }
            else {
                console.warn('Unknown render mode, fallback to 1');
                renderer = new Renderer_1.GlRenderer();
                enderer.bind(view);
            }
            renderer.setContentMode(mode);
            if(mirror != undefined){
                renderer.setCanvasMirror(mirror);
            }
            console.log("leave createRender()");
            return renderer;
        }
        var renderer;
        if (globalStreams.has(key)) {
            var renderMap = globalStreams.get(key);
            if (!renderMap.has(view)) {
                renderer = createRender(this, view, mode);
                renderMap.set(view, renderer);
                g_JrtcEngine.printLog("1 createRender streamId:" + key + ",render view:" + view + ",render:" + renderer);
            }
            else {
                g_JrtcEngine.printLog("renderer has existed.streamId:" + key);
            }
        }
        else {
            var renderMap = new Map();
            globalStreams.set(key, renderMap);
            renderer = createRender(this, view, mode);
            renderMap.set(view, renderer);
            g_JrtcEngine.printLog("2 createRender streamId:" + key + ",render view:" + view + ",render:" + renderer);
        }
        console.log("leave _initRender()");
    }

    enableLoseContext(streamlId, view) {
        globalStreams.get(streamlId).get(view).enableLoseContext();
    }

    getNativeModuleRelativePath(){
        return nodeJRTCElectronSDKDir;
    }

    getJsApiPath() {
        return __dirname;
    }

    /**
     * Initializes the renderer for screen shared.
     * @private
     */
    _initRenderForScreenShared(clientWidth, clientHeight) {
        console.log("enter _initRenderForScreenShared()");
        if (this.renderForScreenSharedPreview == null) {
            g_JrtcEngine.printLog("ForScreenShared renderMode:"+this.renderMode);
            if (this.renderMode === 1) {
                this.renderForScreenSharedPreview = new Renderer_1.GlRenderer();
                this.renderForScreenSharedPreview.setWebGLContextLostCallback(function(streamId,view,contentMode,mirrorView){
                    this.renderMode = 2;
                });
                this.renderForScreenSharedPreview.bindForScreenShared(clientWidth, clientHeight);
            }
            else if (this.renderMode === 2) {
                this.renderForScreenSharedPreview = new Renderer_1.SoftwareRenderer();
                this.renderForScreenSharedPreview.bindForScreenShared(clientWidth, clientHeight,false);
            }
            else if (this.renderMode === 3) {
                this.renderForScreenSharedPreview = new thisObj.customRenderer();
                this.renderForScreenSharedPreview.bindForScreenShared(clientWidth, clientHeight);
            }
            else {
                console.warn('Unknown render mode, fallback to 1');
                this.renderForScreenSharedPreview = new Renderer_1.GlRenderer();
                this.renderForScreenSharedPreview.bindForScreenShared(clientWidth, clientHeight);
            }
        }
        console.log("leave _initRenderForScreenShared()");
    }

    _setRenderCanvasMirror(key, mirror){
        if (globalStreams.has(key)) {
            var renderMap = globalStreams.get(key);
            for (let [view,renderer] of renderMap){
                if (renderer) {
                    renderer.setCanvasMirror(mirror);
                }
                else {
                    console.log("renderer is null.");
                }
            }
        }
        else {
            console.log("globalStreams.has(key) return false.");
        }
    }

    /**
    * UnInitializes the renderer.
    * @param key Key for the map that store the unique ID(it is streamId for remote stream, 'local' for locak stream and application name or screen name for desktop preview).
    * e.g, uid or `videosource` or `local`.
    * @param view The Dom elements to render the video.
    * @private
    */
    _uninitRender(key, view) {
        g_JrtcEngine.printLog("_uninitRender enter");
        if (globalStreams.has(key)) {
            var renderMap = globalStreams.get(key);
            if (renderMap.has(view)) {
                let renderer = renderMap.get(view);
                if (renderer) {
                    renderMap.delete(view);
                    g_JrtcEngine.printLog("globalStreams delete render:" + renderer + ",in render view:" + view + ",streamId:" + key);
                    if (renderMap.size <= 0) {
                        globalStreams.delete(key);
                        g_JrtcEngine.printLog("globalStreams delete map streamId:" + key);
                    }
                    else {
                        console.log("renderMap.size > 0");
                    }
                    renderer.refreshCanvas();
                    renderer.unbind();
                    renderer = undefined;
                }
                else {
                    console.log("renderer is null.");
                }
            }
            else {
                console.log("renderMap.has(view) return false.");
            }
        }
        else {
            console.log("globalStreams.has(key) return false.");
        }
        console.log("leave _uninitRender");
    }

    /**
     * UnInitializes the renderer  for screen shared.
     * @private
     */
    _uninitRenderForScreenShared() {
        console.log("enter _uninitRender");
        if (this.renderForScreenSharedPreview != undefined) {
            console.log("this.renderForScreenSharedPreview:" + this.renderForScreenSharedPreview);
            this.renderForScreenSharedPreview.refreshCanvas();
            this.renderForScreenSharedPreview.unbindForScreenShared();
            this.renderForScreenSharedPreview = undefined;
        }
        console.log("leave _uninitRender");
    }

    /**
     * check if WebGL will be available with appropriate features
     * @return {boolean}
     * @private
     */
    _checkWebGL() {
        const canvas = document.createElement('canvas');
        let gl;
        canvas.width = 1;
        canvas.height = 1;
        const options = {
            // Turn off things we don't need
            alpha: false,
            depth: false,
            stencil: false,
            antialias: false,
            preferLowPowerToHighPerformance: true
            // Still dithering on whether to use this.
            // Recommend avoiding it, as it's overly conservative
            // failIfMajorPerformanceCaveat: true
        };
        try {
            gl =
                canvas.getContext('webgl', options) ||
                canvas.getContext('experimental-webgl', options);
        }
        catch (e) {
            return false;
        }
        if (gl) {
            return true;
        }
        else {
            return false;
        }
    }

    _checkWebGL2() {
        var canvas = document.createElement('canvas'), gl;
        canvas.width = 1;
        canvas.height = 1;
        var options = {
            // Don't trigger discrete GPU in multi-GPU systems
            preferLowPowerToHighPerformance: true,
            powerPreference: 'low-power',
            // Don't try to use software GL rendering!
            failIfMajorPerformanceCaveat: true,
            // In case we need to capture the resulting output.
            preserveDrawingBuffer: true,
        };
        try {
            gl =
                canvas.getContext('webgl', options) ||
                    canvas.getContext('experimental-webgl', options);
        }
        catch (e) {
            return false;
        }
        if (gl) {
            return true;
        }
        else {
            return false;
        }
    }
    
    /**
     * check if data is valid
     * @param {*} header
     * @param {*} ydata
     * @param {*} udata
     * @param {*} vdata
     * @private
     */ //TODO(input)
    _checkData(header, ydata, udata, vdata) {
        if (header.byteLength != 20) {
            console.error('invalid image header ' + header.byteLength);
            return false;
        }
        if (ydata.byteLength === 20) {
            console.error('invalid image yplane ' + ydata.byteLength);
            return false;
        }
        if (udata.byteLength === 20) {
            console.error('invalid image uplanedata ' + udata.byteLength);
            return false;
        }
        if (ydata.byteLength != udata.byteLength * 4 ||
            udata.byteLength != vdata.byteLength) {
            console.error('invalid image header ' +
                ydata.byteLength +
                ' ' +
                udata.byteLength +
                ' ' +
                vdata.byteLength);
            return false;
        }
        return true;
    }

    /**
     * stream callback 
     * @param {Array} frameInfos
     * @private
     */
    _streamCB(frameInfo) {
        //when frameInfo.streamY is arrayBuffer
        //  if(count < 1 && frameInfo.streamId != 'screen0' && frameInfo.streamId != 'screen1' && frameInfo.streamId != 'Hello World!'){
        //      var fileName = 'D://' + frameInfo.streamId + frameInfo.width + 'x' + frameInfo.height + ".yuv";
        //      var fd = fs.openSync(fileName,'w+');
        //      const bufY =  Buffer.from(frameInfo.streamY);
        //      fs.writeSync(fd,bufY, 0, frameInfo.strideY*frameInfo.height);
        //      const bufU =  Buffer.from(frameInfo.streamU);
        //      var uSize = Math.floor(frameInfo.strideU*(frameInfo.height)/2);
        //      fs.writeSync(fd,bufU, 0, uSize);
        //      const bufV =  Buffer.from(frameInfo.streamV);
        //      fs.writeSync(fd,bufV, 0, uSize);
        //      fs.closeSync(fd);
        //      count = 1;
        // }

        //when frameInfo.streamY is buffer
        // if(count < 1){
        //      var fd = fs.openSync('D://stream.yuv','w+');
        //      fs.writeSync(fd,frameInfo.streamY, 0, frameInfo.width*frameInfo.height);
        //      fs.writeSync(fd,frameInfo.streamU, 0, frameInfo.width*frameInfo.height/4/*, frameInfo.width*frameInfo.height*/);
        //      fs.writeSync(fd,frameInfo.streamV, 0, frameInfo.width*frameInfo.height/4/*, frameInfo.width*frameInfo.height*1.25*/);
        //      count = 1;
        // }

        if (g_JrtcEngine.dvFrameHeader == undefined) {
            g_JrtcEngine.dvFrameHeader = new DataView(new ArrayBuffer(26));
        }


        g_JrtcEngine.dvFrameHeader.setUint8(0, 1); //format
        g_JrtcEngine.dvFrameHeader.setUint8(1, 0);   //mirror
        g_JrtcEngine.dvFrameHeader.setUint16(2, frameInfo.width);  //width
        g_JrtcEngine.dvFrameHeader.setUint16(4, frameInfo.height);  //height
        g_JrtcEngine.dvFrameHeader.setUint16(6, 0);  //left
        g_JrtcEngine.dvFrameHeader.setUint16(8, 0);  //up
        g_JrtcEngine.dvFrameHeader.setUint16(10, 0);  //right
        g_JrtcEngine.dvFrameHeader.setUint16(12, 0);  //down
        g_JrtcEngine.dvFrameHeader.setUint16(14, frameInfo.rotate);  //rotation
        g_JrtcEngine.dvFrameHeader.setUint32(16, Date.parse(new Date()));  //ts
        g_JrtcEngine.dvFrameHeader.setUint16(20, frameInfo.strideY);  //strideY
        g_JrtcEngine.dvFrameHeader.setUint16(22, frameInfo.strideU);  //strideU
        g_JrtcEngine.dvFrameHeader.setUint16(24, frameInfo.strideV);  //strideV

        let streamId = frameInfo.streamId;
        let header = g_JrtcEngine.dvFrameHeader.buffer;
        let ydata = frameInfo.streamY;
        let udata = frameInfo.streamU;
        let vdata = frameInfo.streamV;
        if (!header || !ydata || !udata || !vdata) {
            return;
        }

        let rendererMap = globalStreams.get(streamId);
        if (!rendererMap && (streamId != 'local')) {
            printLogRepeat(1,25000001,'rendererMap == NULL streamId:'+streamId,300);
            return;
        }
        if (rendererMap && (rendererMap.size == 0)) {
            printLogRepeat(1,25000002,'rendererMap.size == 0 streamId:'+streamId,300);
            return;
        }
        for (var key of rendererMap.keys()) {
            const renderer = rendererMap.get(key);
            if (!renderer || renderer.length === 0) {
                printLogRepeat(1,25000003,'Cannot find renderer streamId:'+streamId,300);
                continue;
            }
            renderer.drawFrame({
                header,
                yUint8Array: ydata,
                uUint8Array: udata,
                vUint8Array: vdata,
                timestamp: frameInfo.timestamp
            });
        }
    }

    /**
     * stream callback for screen shared
     * @param {Array} frameInfos
     * @private
     */
    _streamCBForScreenShared(frameInfo) {
        var header = new ArrayBuffer(26);
        var dv = new DataView(header);
        dv.setUint8(0, 1); //format
        dv.setUint8(1, 0);   //mirror
        dv.setUint16(2, frameInfo.width);  //width
        dv.setUint16(4, frameInfo.height);  //height
        dv.setUint16(6, 0);  //left
        dv.setUint16(8, 0);  //up
        dv.setUint16(10, 0);  //right
        dv.setUint16(12, 0);  //down
        dv.setUint16(14, frameInfo.rotate);  //rotation
        dv.setUint32(16, Date.parse(new Date()));  //ts
        dv.setUint16(20, frameInfo.strideY);  //strideY
        dv.setUint16(22, frameInfo.strideU);  //strideU
        dv.setUint16(24, frameInfo.strideV);  //strideV

        var infos = new Array();
        var ySize = frameInfo.strideY * frameInfo.height;
        var yView = new Uint8Array(frameInfo.streamY, 0, ySize);
        var uSize = Math.floor(frameInfo.strideU * frameInfo.height / 2);
        var uView = new Uint8Array(frameInfo.streamU, 0, uSize);
        var vSize = Math.floor(frameInfo.strideV * frameInfo.height / 2);
        var vView = new Uint8Array(frameInfo.streamV, 0, vSize);

        infos[0] = {
            streamId: frameInfo.streamId,
            header: header,
            ydata: yView,
            udata: uView,
            vdata: vView
        };

        for (let i = 0; i < infos.length; i++) {
            const info = infos[i];
            const { streamId, header, ydata, udata, vdata } = info;
            if (!header || !ydata || !udata || !vdata) {
                console.log('Invalid data param ： ' +
                    header +
                    ' ' +
                    ydata +
                    ' ' +
                    udata +
                    ' ' +
                    vdata);
                continue;
            }

            if (g_screenSharedPreviewStreamIdToViewMap.has(streamId)) {
                var view = g_screenSharedPreviewStreamIdToViewMap.get(streamId).view;
                g_JrtcEngine.renderForScreenSharedPreview.drawFrameForScreenShared({ header, yUint8Array: ydata, uUint8Array: udata, vUint8Array: vdata });

                var childLen = view.children.length;
                console.log("system state:" + g_JrtcEngine.getSystemSleepState());
                if (childLen > 0) {
                    //The view has only one child node
                    if (!g_JrtcEngine.getSystemSleepState()) {
                        var image = g_JrtcEngine.renderForScreenSharedPreview.getOneFrame();
                        view.children[0].src = image.src;
                    }
                }
                else {
                    var imgEle = document.createElement('img');
                    imgEle.style.width = '100%';
                    imgEle.style.height = '100%';
                    imgEle.style.display = 'flex';
                    imgEle.style.justifyContent = 'center';
                    imgEle.style.objectFit = 'contain';
                    if (!g_JrtcEngine.getSystemSleepState()) {
                        var image = g_JrtcEngine.renderForScreenSharedPreview.getOneFrame();
                        imgEle.src = image.src;
                        view.appendChild(imgEle);
                    }
                }
            }
            break;
        }
    }

    /**
     * 
     * @private
     */
    setJrtcEngine(jrtcEngine) {
        g_JrtcEngine = jrtcEngine;
    }
}

module.exports = JRTCEngine;