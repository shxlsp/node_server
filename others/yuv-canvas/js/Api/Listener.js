//const { remote } = require("electron");

g_mapPeerIdToStream = new Map();

/**
 * Listener Module:Used to receive event callbacks(该类用于接收事件回调)
 * @module Listener
 */
class Listener{
    /**
     * @constructor
     */
    constructor(){
       this.remoteUserList = new Map();
    }
    
    /**
     * @desc 【desc】This function is called when the first frame of the video is obtained(当视频第一帧获得时调用此函数)
     * @param {Number} peerId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     */
    onFirstVideoFrame (peerId,streamId){
        console.log("onFirstVideoFrame,peerId:" + peerId + ",streamId:" + streamId);
    };

    /**
     * @desc 【desc】This function is called when an error message is generated(当产生错误消息时该函数被调用)
     * @param {Number} errorNo error code(错误码)
     * @param {string} errMsg error message(错误消息)
     */
    onError(errorNo,errMsg){
        console.log("onError,errorNo:" + errorNo + ",errMsg:" + errMsg);
    }

    /**
     * @desc 【desc】This function is called when an error message is generated(当产生错误消息时该函数被调用)
     * @param {Number} errorNo error code(错误码)
     * @param {string} errMsg error message(错误消息)
     * @param {string} info additional information(附加信息)
     */
    onErrorV2(errorNo,errMsg,info){
        console.log("onError,errorNo:" + errorNo + ",errMsg:" + errMsg + ",info:" + info);
    }

    /**
     * @desc 【desc】This function is called when the meeting is successfully entered(进入会议成功后调用此函数)
     * @param {Array} userList An array list of users in a meeting(会议内用户信息数组列表)
     */
    onEnterRoom(userList){
        console.log("enter onEnterRoom");
        var size = userList.length;
        console.log("userList size:" + size);
        for (var i=0;i<size;i++) {
            console.log("nickName:" + userList[i].nickName + ",userId:" + userList[i].userId);
        }
    }

    /**
     * @desc 【desc】This function is called when the meeting is successfully entered(进入会议成功后调用此函数)
     * @param {string} info The ID of the participant in the meeting(会议中的参会者ID)
     */
     onEnterRoomSuccess(info){
        console.log("enter onEnterRoomSuccess");
        console.log("info:" + info);
    }

    /**
     * @desc 【desc】This function is called when a remote user joins a meeting(远程用户加入会议时调用此函数)
     * @param {Number} peerId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {string} nickname The user nickname(参会者的用户昵称)
     */
    onRemoteUserEnterRoom(peerId,nickname){
        console.log("onRemoteUserEnterRoom，peerId:" + peerId + ",nickname:" + nickname);
    }

    /**
     * @desc 【desc】This function is called when the connection to the server succeeds(连接服务器成功时调用此函数)
     */
    onConnected(){
        console.log("onConnected");
    }

    /**
     * @desc 【desc】This function is called when disconnected from the server(与服务器断开连接时调用此函数)
     */
    onConnectLost(){
        console.log("onConnectLost");
    }

	/**
     * @desc 【desc】This function is called when the net recover with the server(与服务器恢复连接时调用此函数)
     */
    onConnectRecover(){
        console.log("onConnectRecover");
    }
	
    /**
     * @desc 【desc】This function is called when the desktop shared stream state (available/unavailable) changes(桌面共享流状态(可获得/不可获得)变化时调用此函数)
     * @param {Number} peerId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     * @param {string} streamName the remote stream name(远程流名称)
     * @param {boolean} bAvailable Whether the remote stream can obtain an identity(远程流是否可获得标识,ture:可获得;false:不可获得)
     * @param {string} userId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {string} nickname the nickname of user(用户昵称)
     */
    onUserDesktopAvailable(peerId,streamId,streamName,bAvailable,userId,nickname){
        console.log("onUserDesktopAvailable,peerId:" + peerId + ",streamId:" + streamId + ",streamName:" + streamName + ",bAvailable:" + bAvailable + ",userId:" + userId + ",nickname:" + nickname);
        var parentNode = document.getElementById('remote');
        if(bAvailable){
            var remoteView = document.createElement('div');
            remoteView.setAttribute('id',streamId);
            remoteView.setAttribute('extraDataPeerId',peerId);
            remoteView.style = "margin-right:4px;width:320px;height:180px;background:rgb(48, 39, 33);float:left;"
            parentNode.appendChild(remoteView);
            //16.拉取屏幕共享流
            var remotePreviewParam = {
                userId:peerId,
                streamId:streamId,
                width:320,
                height:180,
                streamSubscribeModelType:1,
                streamBitrateType:0
            };
            //listener.jrtcengine.startRemoteDesktopView(remotePreviewParam);
			listener.jrtcengine.startRemoteDesktopStream(remotePreviewParam);
			listener.jrtcengine.startRemoteDesktopRender(streamId,remoteView);
        }else{
            //17.关闭屏幕共享流
            var remoteView = document.getElementById(streamId);
            console.log("before stopRemoteDesktopView:",listener);
            //listener.jrtcengine.stopRemoteDesktopView(peerId,streamId,remoteView);
			listener.jrtcengine.stopRemoteDesktopStream(peerId,streamId);
			listener.jrtcengine.stopRemoteDesktopRender(streamId,remoteView);
            console.log("after stopRemoteDesktopView:",listener);
            parentNode.removeChild(remoteView);
        }
    }

    /**
     * @desc 【desc】This function is called when a remote user leaves a meeting(远程用户离开会议时调用此函数)
     * @param {Number} peerId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {Number} reason the reasons of user departure(用户离开原因)
     */
    onRemoteUserLeaveRoom(peerId,reason){
        console.log("onRemoteUserLeaveRoom,peerId:" + peerId + ",reason:" + reason);
    }

    /**
     * @desc 【desc】This function is called when the remote stream state (available/unavailable) changes(远程流状态(可获得/不可获得)变化时调用此函数)
     * @param {Number} peerId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     * @param {string} streamName the remote stream name(远程流名称)
     * @param {boolean} bAvailable Whether the remote stream can obtain an identity(远程流是否可获得标识,ture:可获得;false:不可获得)
     * @param {string} userId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {string} nickname the nickname of user(用户昵称)
     */
    onUserVideoAvailable(peerId,streamId,streamName,bAvailable,userId,nickname){
        console.log("onUserVideoAvailable,peerId:" + peerId + ",streamId:" + streamId + ",streamName:" + streamName + ",bAvailable:" + bAvailable + ",userId:" + userId + ",nickname:" + nickname);
        //6.start remote video
        var parentNode = document.getElementById('remote');
        if(bAvailable){
            //设置peerId 和 streamId
            if(streamName != "false"){
                g_mapPeerIdToStream.set(peerId,streamId);
            }
			for(var i=0;i<1;i++){
				var remoteView = document.createElement('div');
				var streamIdTmp = streamId + i;
				remoteView.setAttribute('id',streamIdTmp);
				remoteView.setAttribute('extraDataPeerId',peerId);
				remoteView.style = "margin-right:4px;width:320px;height:180px;background:rgb(48, 39, 33);float:left;"
				remoteView.onclick = onRemoteClickedEvent;
				parentNode.appendChild(remoteView);
				var remotePreviewParam = {
					userId:peerId,
					streamId:streamId,
					width:320,
					height:180,
					streamSubscribeModelType:1,
					streamBitrateType:0,
					view:remoteView
				};
				console.log("startRemoteView:",listener);
				//listener.jrtcengine.startRemoteView(remotePreviewParam);
				if(i == 0){
				  listener.jrtcengine.startRemoteStream(remotePreviewParam);
				}
				if(i > 15){
					for(var j = 0; j<6;j++){
					    //var first = document.getElementById(streamId + j)
					    //listener.jrtcengine.stopRemoteVideoRender(streamId,first);
					}
				}
				listener.jrtcengine.startRemoteVideoRender(streamId,remoteView);
			}
        }
        else{
            console.log("stopRemoteView:",listener);
            //删除peerId 和 streamId
            if(streamName != "false"){
                g_mapPeerIdToStream.delete(peerId);
            }

            var remoteView = document.getElementById(streamId);
            //listener.jrtcengine.stopRemoteView(peerId,streamId);
            listener.jrtcengine.stopRemoteVideoRender(streamId,remoteView);
            listener.jrtcengine.stopRemoteStream(peerId,streamId);
            parentNode.removeChild(remoteView);
        }
    }

    /**
     * @desc 【desc】This function is called when the remote user's audio state(available/unavailable) changes(远程用户音频状态(可获得/不可获得)改变时调用此函数)
     * @param {Number} peerId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     * @param {boolean} bAvailable Whether the remote stream can obtain an identity(远程流是否可获得标识,ture:可获得;false:不可获得)
     * @param {string} customStreamType the type of custome stream(自定义流类型)
     * @param {string} userId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {string} nickname the nickname of user(用户昵称)
     */
    onUserAudioAvailable(peerId,streamId,bAvailable,customStreamType,userId,nickname){
        console.log("onUserAudioAvailable,peerId:" + peerId + ",streamId:" + streamId + ",bAvailable:" + bAvailable + ",customStreamType:" + customStreamType + ",userId:" + userId + ",nickname:" + nickname);       
    }

    /**
     * @desc 【desc】This function is called when remote user audio is activated(远程用户音频激活时时调用此函数)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     */
    onRemoteAudioActived(streamId){
        console.log("onRemoteAudioActived,steramId:" + streamId);
    }

    /**
     * @desc 【desc】This function is called when a user's nickname changes during a meeting(会议中用户昵称改变时调用此函数)
     * @param {Number} roomId The meeting number(会议号)
     * @param {Number} peerId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {string} nickName The user nickname(参会者的用户昵称)
     */
    onUserUpdateNickName(roomId,peerId,nickName){
        console.log("onUserUpdateNickName,roomId:" + roomId + ",peerId:" + peerId + ",nickname:" + nickName);
    }

    /**
     * @desc 【desc】This function is called when the user volume changes.(用户音量大小改变时调用此函数)
     * @param {string} volume 音量信息，格式为：
     * {
     *   "roomId":"173",
     *   "volumeInfos":[
     *      {
     *        "peerId":"230845",
     *        "volume":-78
     *      }
     *    ]
     * }
     */
     onUserAudioVolumes(volume){
        console.log("onUserAudioVolumes,volume:" + volume);
     }

    /**
     * @desc 【desc】This function is called when a user receives a chat message(用户接收到聊天消息时调用此函数)
     * @param {Number} peerId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {string} nickName The user nickname(参会者的用户昵称)
     * @param {string} msg chat message(聊天消息内容)
     */
    onUserMessageReceived(peerId,nickName,msg){
        console.log("onUserMessageReceived,peerId:" + peerId + ",nickname:" + nickName + ",msg:" + msg);
    }

    /***
     * @desc 【desc】This function is called when the user is removed(用户被移除时调用此函数)
     * @param {Number} peerId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {string} nickName The user nickname(参会者的用户昵称)
     * @param {string} appData additional data(附加数据)
     */
    onUserRemoved(peerId,nickName,appData){
        console.log("onUserRemoved,peerId:" + peerId + ",nickname:" + nickName + ",appData:" + appData);
    }

    /**
     * @desc 【desc】This function is called when all are muted(全体静音时调用此函数)
     * @param {Number} peerId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {string} nickName The user nickname(参会者的用户昵称)
     * @param {string} appData additional data(附加数据)
     */
    onAudioMuteToRoom(peerId,nickName,appData){
        console.log("onAudioMuteToRoom,peerId:" + peerId + ",nickname:" + nickName + ",appData:" + appData);
    }

    /**
     * @desc 【desc】This function is called when a single member is muted(对单个成员静音时调用此函数)
     * @param {Number} peerId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {string} nickName The user nickname(参会者的用户昵称)
     * @param {string} appData additional data(附加数据)
     */
    onAudioMuteToPeer(peerId,nickName,appData){
        console.log("onAudioMuteToPeer,peerId:" + peerId + ",nickname:" + nickName + ",appData:" + appData);
    }

    /**
     * @desc 【desc】This function is called when the video is closed for all members(对全部成员关闭视频时调用此函数)
     * @param {Number} peerId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {string} nickName The user nickname(参会者的用户昵称)
     * @param {string} appData additional data(附加数据)
     */
     onVideoCloseToRoom(peerId,nickName,appData){
        console.log("onVideoCloseToRoom,peerId:" + peerId + ",nickname:" + nickName + ",appData:" + appData);
     }

     /**
     * @desc 【desc】This function is called when a video is closed for a single member(对单个成员关闭视频时调用此函数)
     * @param {Number} peerId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {string} nickName The user nickname(参会者的用户昵称)
     * @param {string} appData additional data(附加数据)
     */
     onVideoCloseToPeer(peerId,nickName,appData){
        console.log("onVideoCloseToPeer,peerId:" + peerId + ",nickname:" + nickName + ",appData:" + appData);
     }

    /**
     * @desc 【desc】This function is called when all members are forbidden to speak(全员禁言时调用此函数)
     * @param {Number} peerId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {string} nickName The user nickname(参会者的用户昵称)
     * @param {string} appData additional data(附加数据)
     */
    onForbiddenChatToRoom(peerId,nickName,appData){
        console.log("onForbiddenChatToRoom,peerId:" + peerId + ",nickname:" + nickName + ",appData:" + appData);
    }

    /**
     * @desc 【desc】This function is called when the full gag is lifted(解除全员禁言时调用此函数)
     * @param {Number} peerId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {string} nickName The user nickname(参会者的用户昵称)
     * @param {string} appData additional data(附加数据)
     */
    onUnForbiddenChatToRoom(peerId,nickName,appData){
        console.log("onUnForbiddenChatToRoom,peerId:" + peerId + ",nickname:" + nickName + ",appData:" + appData);
    }

    /**
     * @desc 【desc】This function is invoked when all members of a meeting need to be unmuted or notified(对会议全体成员操作(如，解除全员静音)或需要通知全体成员时此函数被调用)
     * @param {Number} peerId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {string} nickName The user nickname(参会者的用户昵称)
     * @param {string} appData additional data(附加数据)
     * @param {string} eventName user-defined message event name, corresponding to the event type when the sendControlMessage function parameter is a user-defined message(自定义消息事件名称，与sendControlMessage函数参数为自定义消息时的事件类型对应)
     */
    onCustomSignalToRoom(peerId,nickName,appData,eventName){
        console.log("onCustomSignalToRoom,peerId:" + peerId + ",nickname:" + nickName + ",appData:" + appData + ",eventName:" + eventName);
    }

    /**
     * @desc 【desc】This function is called when an operation (for example, unmute) is performed on a member of a meeting or a member needs to be notified(对会议单个成员操作(如，解除静音)或需要通知单个成员时此函数被调用)
     * @param {Number} peerId The ID of the participant in the meeting(会议中的参会者ID)
     * @param {string} nickName The user nickname(参会者的用户昵称)
     * @param {string} appData additional data(附加数据)
     * @param {string} eventName user-defined message event name, corresponding to the event type when the sendControlMessage function parameter is a user-defined message(自定义消息事件名称，与sendControlMessage函数参数为自定义消息时的事件类型对应)
     */
    onCustomSignalToPeer(peerId,nickName,appData,eventName){
        console.log("onCustomSignalToPeer,peerId:" + peerId + ",nickname:" + nickName + ",appData:" + appData + ",eventName:" + eventName);
    }

    /**
     * @desc 【desc】This function is called when the stream is successfully published.(当流发布成功的时候调用这个函数)
     * @param {int} type  The type of stream(1：local stream;2:screen or app stream;3:audio stream)(流的类型:1：本地流;2:屏幕或应用共享流;3:音频流)
     * @param {string} streamId The audio stream ID of the participant(远程流ID)
     * @param {string} streamName the remote stream name(远程流名称)
     */
    onPublishStream(type,streamId,streamName){
        console.log("onPublishStream,type:" + type + ",streamId:" + streamId + ",streamName:" + streamName);
    }

    /**
     * @desc 【desc】Text data streams are available.(文字数据流是可获得的)
     * @param {string} streamId The literal stream ID (文字流ID)
     * @param {string} streamInfo The information of the stream.(文字流信息)
     * @param {boolean} available Literal data flow messages get identifiers,true:available;false:unavailable.(文字数据流消息可获得标识,true:可获得;false:不可获得)
     */
    onDataStreamAvailable(streamId,streamInfo,available){
        console.log("onDataStreamAvailable,streamId:" + streamId + ",streamInfo:" + streamInfo + ",available:" + available);
    }

    /**
     * @desc 【desc】Subscribing to the text stream is successful.(订阅文字数据流成功)
     * @param {string} streamId The literal stream ID (文字流ID)
     */
    onSubscribeDataStreamSuccess(streamId){
        console.log("onSubscribeDataStreamSuccess,streamId:" + streamId );
    }

    /**
     * @desc 【desc】Text data flow message callback function.(文字数据流消息回调函数)
     * @param {string} streamId The literal stream ID (文字流ID)
     * @param {boolean} binary Whether the literal data stream is a binary identifier,true:binary;false:not binary(文字数据流是否是二进制标识,true:二进制;false:不是二进制)
     * @param {string} data The data of the literal stream.(文字流数据)
     */
    onDataStreamMessage(streamId, binary, data){
        //let bytesView = new Uint8Array(data,0,data.byteLength);
        //let str = new TextDecoder().decode(bytesView);
        console.log("onDataStreamMessage,streamId:" + streamId + ",binary:" + binary + ",strData:" + data);
    }

    /**
     * @desc 【desc】Upload RTC log progress callback function.(上传RTC日志进度回调函数)
     * @param {Number} process Upload progress (上传进度)
     */
    onUploadRtcLogsProgress(process){
        console.log("onUploadRtcLogsProgress,process:" + process);
    }

    /**
     * @desc 【desc】Upload RTC logs to complete the callback function.(上传RTC日志完成回调函数)
     * @param {Number} error error code (错误码)
     */
    onUploadRtcLogsFinish(error){
        console.log("onUploadRtcLogsFinish,error:" + error);
    }

    /**
     * @desc 【desc】Upload custom stream type the callback function.
     * @param {Number} peerId
     * @param {string} kind 
     * @param {string} streamId The stream ID (流ID)
     * @param {string} customStreamType 
     */
    onUpdateCustomStreamType(peerId,kind,streamId,customStreamType){
        console.log("onUpdateCustomStreamType,peerId:" + peerId + ",kind:" + kind + ",streamId:" + streamId + ",customStreamType:" + customStreamType);
    }

    /**
     * @desc 【desc】get g_mapPeerIdToStream 
     */
    getMapPeerIdToStream () {
        return g_mapPeerIdToStream;
    }
}

function onRemoteClickedEvent () {
    console.log(this);
    var streamID = this.getAttribute('id');
    var peerId = this.getAttribute('extraDataPeerId');
    var divPeerid = document.getElementById('peerId');
    divPeerid.value = peerId;
    var divStreamId = document.getElementById('streamId');
    divStreamId.value = streamID;
};

module.exports = Listener;