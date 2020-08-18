'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

// import TIM from 'tim-wx-sdk';
// import toast from './toast'
// import Taro from '@tarojs/taro'
var TIM = /** @class */ (function () {
    function TIM() {
    }
    TIM.prototype.init = function (config) {
        var _this = this;
        var TIM_SDK = config.TIM_SDK, COS = config.COS, userId = config.userId, userSig = config.userSig, onReady = config.onReady, onConversationListUpdated = config.onConversationListUpdated, onGroupListUpdated = config.onGroupListUpdated, onMessageReceived = config.onMessageReceived, groupId = config.groupId, onKickedOut = config.onKickedOut;
        this.TIM_READY = false;
        console.log('进入 tim sdk初始化');
        var options = {
            SDKAppID: APP_CONF.TIM_APPID,
        };
        // 创建 SDK 实例，`TIM.create()`方法对于同一个 `SDKAppID` 只会返回同一份实例
        var tim = TIM_SDK.create(options); // SDK 实例通常用 tim 表示
        this.tim = tim;
        this.TIM = TIM_SDK;
        this.groupId = groupId;
        // 设置 SDK 日志输出级别，详细分级请参见 setLogLevel 接口的说明
        tim.setLogLevel(0); // 普通级别，日志量较多，接入时建议使用
        // tim.setLogLevel(1); // release 级别，SDK 输出关键信息，生产环境时建议使用
        // 注册 COS SDK 插件
        tim.registerPlugin({ 'cos-wx-sdk': COS });
        // 监听事件，例如：
        tim.on(this.TIM.EVENT.SDK_READY, function (event) {
            // 收到离线消息和会话列表同步完毕通知，接入侧可以调用 sendMessage 等需要鉴权的接口
            // event.name - TIM.EVENT.SDK_READY
            console.log('SDK_READY', event);
            _this.TIM_READY = true;
            onReady && onReady();
        });
        tim.on(this.TIM.EVENT.MESSAGE_RECEIVED, function (event) {
            // 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
            // event.name - TIM.EVENT.MESSAGE_RECEIVED
            // event.data - 存储 Message 对象的数组 - [Message]
            console.log('TIM.EVENT.MESSAGE_RECEIVED', event);
            /**
             * 过滤字段
             */
            var msgList = [];
            event.data.forEach(function (element) {
                /**
                 * 过滤消息类型 只抛出自定义消息和文本消息
                 */
                if (['TIMCustomElem'].includes(element.type)) {
                    msgList.push({
                        ID: element.ID,
                        clientSequence: element.clientSequence,
                        nick: element.nick,
                        payload: __assign(__assign({}, element.payload), { extension: JSON.parse(element.payload.extension) }),
                        type: element.type,
                    });
                }
                else if (element.type === 'TIMTextElem') {
                    var textSplitRes = element.payload.text.split('m&=&m');
                    msgList.push({
                        ID: element.ID,
                        clientSequence: element.clientSequence,
                        nick: element.nick,
                        payload: __assign(__assign({}, element.payload), { extension: {
                                text: textSplitRes[1],
                                nickName: textSplitRes[0],
                            } }),
                        type: element.type,
                    });
                }
            });
            if (_this.TIM_READY) {
                onMessageReceived && onMessageReceived(msgList);
            }
        });
        tim.on(this.TIM.EVENT.MESSAGE_REVOKED, function (event) {
            // 收到消息被撤回的通知
            // event.name - TIM.EVENT.MESSAGE_REVOKED
            // event.data - 存储 Message 对象的数组 - [Message] - 每个 Message 对象的 isRevoked 属性值为 true
            console.log('MESSAGE_REVOKED', event);
        });
        tim.on(this.TIM.EVENT.MESSAGE_READ_BY_PEER, function (event) {
            // SDK 收到对端已读消息的通知，即已读回执。使用前需要将 SDK 版本升级至 v2.7.0 或以上。仅支持单聊会话。
            // event.name - TIM.EVENT.MESSAGE_READ_BY_PEER
            // event.data - event.data - 存储 Message 对象的数组 - [Message] - 每个 Message 对象的 isPeerRead 属性值为 true
            console.log('MESSAGE_READ_BY_PEER', event);
        });
        tim.on(this.TIM.EVENT.CONVERSATION_LIST_UPDATED, function (event) {
            // 收到会话列表更新通知，可通过遍历 event.data 获取会话列表数据并渲染到页面
            // event.name - TIM.EVENT.CONVERSATION_LIST_UPDATED
            // event.data - 存储 Conversation 对象的数组 - [Conversation]
            console.log('CONVERSATION_LIST_UPDATED', event);
            var msgList = [];
            // 过滤字段
            event.data.forEach(function (element) {
                /**
                 * 只抛出自定义消息
                 */
                if (element.lastMessage.type === 'TIMCustomElem') {
                    msgList.push({
                        lastMessage: __assign(__assign({}, element.lastMessage), { payload: __assign(__assign({}, element.lastMessage.payload), { extension: JSON.parse(element.lastMessage.payload.extension) }) }),
                    });
                }
            });
            onConversationListUpdated && onConversationListUpdated(msgList);
        });
        tim.on(this.TIM.EVENT.GROUP_LIST_UPDATED, function (event) {
            // 收到群组列表更新通知，可通过遍历 event.data 获取群组列表数据并渲染到页面
            // event.name - TIM.EVENT.GROUP_LIST_UPDATED
            // event.data - 存储 Group 对象的数组 - [Group]
            console.log('GROUP_LIST_UPDATED', event);
            onGroupListUpdated && onGroupListUpdated();
        });
        tim.on(this.TIM.EVENT.PROFILE_UPDATED, function (event) {
            // 收到自己或好友的资料变更通知
            // event.name - TIM.EVENT.PROFILE_UPDATED
            // event.data - 存储 Profile 对象的数组 - [Profile]
            console.log('PROFILE_UPDATED', event);
        });
        tim.on(this.TIM.EVENT.BLACKLIST_UPDATED, function (event) {
            // 收到黑名单列表更新通知
            // event.name - TIM.EVENT.BLACKLIST_UPDATED
            // event.data - 存储 userID 的数组 - [userID]
            console.log('BLACKLIST_UPDATED', event);
        });
        tim.on(this.TIM.EVENT.ERROR, function (event) {
            // 收到 SDK 发生错误通知，可以获取错误码和错误信息
            // event.name - TIM.EVENT.ERROR
            // event.data.code - 错误码
            // event.data.message - 错误信息
            console.log('ERROR', event);
            // toast.show(`聊天室错误: ${event.data.code} - ${event.data.message}`)
        });
        tim.on(this.TIM.EVENT.SDK_NOT_READY, function (event) {
            // 收到 SDK 进入 not ready 状态通知，此时 SDK 无法正常工作
            // event.name - TIM.EVENT.SDK_NOT_READY
            console.log('SDK_NOT_READY', event);
            // toast.show(`聊天室初始化失败，请检查您的网络`)
        });
        tim.on(this.TIM.EVENT.KICKED_OUT, function (event) {
            // 收到被踢下线通知
            // event.name - TIM.EVENT.KICKED_OUT
            // event.data.type - 被踢下线的原因，例如:
            //    - TIM.TYPES.KICKED_OUT_MULT_ACCOUNT 多实例登录被踢
            //    - TIM.TYPES.KICKED_OUT_MULT_DEVICE 多终端登录被踢
            //    - TIM.TYPES.KICKED_OUT_USERSIG_EXPIRED 签名过期被踢 （v2.4.0起支持）。
            console.log('被踢掉线，即将主动调用登录', event);
            // toast.show(`您已被踢掉线，原因：${event.data.type}`)
            onKickedOut && onKickedOut();
            // this.login({
            // 	userId,
            // 	userSig,
            // })
        });
        tim.on(this.TIM.EVENT.NET_STATE_CHANGE, function (event) {
            //  网络状态发生改变（v2.5.0 起支持）。
            // event.name - TIM.EVENT.NET_STATE_CHANGE
            // event.data.state 当前网络状态，枚举值及说明如下：
            //     \- TIM.TYPES.NET_STATE_CONNECTED - 已接入网络
            //     \- TIM.TYPES.NET_STATE_CONNECTING - 连接中。很可能遇到网络抖动，SDK 在重试。接入侧可根据此状态提示“当前网络不稳定”或“连接中”
            //    \- TIM.TYPES.NET_STATE_DISCONNECTED - 未接入网络。接入侧可根据此状态提示“当前网络不可用”。SDK 仍会继续重试，若用户网络恢复，SDK 会自动同步消息
            console.log('NET_STATE_CHANGE', event);
            if (event.data.state === TIM.TYPES.NET_STATE_CONNECTED) ;
            else if (event.data.state === TIM.TYPES.NET_STATE_CONNECTING) ;
            else if (event.data.state === TIM.TYPES.NET_STATE_DISCONNECTED) ;
        });
        this.login({
            userId: userId,
            userSig: userSig,
        });
    };
    TIM.prototype.login = function (_a) {
        var _this = this;
        var userId = _a.userId, userSig = _a.userSig;
        // 开始登录
        var promise = this.tim.login({ userID: userId, userSig: userSig });
        promise
            .then(function (imResponse) {
            console.log('tim登录成功', imResponse.data); // 登录成功
            if (imResponse.data.repeatLogin === true) {
                // 标识账号已登录，本次登录操作为重复登录。v2.5.1 起支持
                console.log('tim重复登录, 即将主动调用登出后登录', imResponse.data.errorInfo);
                _this.logOut().then(function () {
                    _this.login({
                        userId: userId,
                        userSig: userSig,
                    });
                });
            }
        })
            .catch(function (imError) {
            // toast.show(`TIM登录失败: ${imError}`)
            console.warn('login error:', imError); // 登录失败的相关信息
        });
    };
    TIM.prototype.logOut = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var promise = _this.tim.logout();
            promise
                .then(function (imResponse) {
                console.log(imResponse.data); // 登出成功
                resolve();
            })
                .catch(function (imError) {
                console.warn('logout error:', imError);
            });
        });
    };
    /**
     * 加入群
     */
    TIM.prototype.joinGroup = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // const { groupId } = params
            var promise = _this.tim.joinGroup({
                groupID: _this.groupId,
                type: _this.TIM.TYPES.GRP_AVCHATROOM,
            });
            promise
                .then(function (imResponse) {
                switch (imResponse.data.status) {
                    case _this.TIM.TYPES.JOIN_STATUS_WAIT_APPROVAL: // 等待管理员同意
                        console.log('等待管理员同意');
                        reject('加群失败');
                        break;
                    case _this.TIM.TYPES.JOIN_STATUS_SUCCESS: // 加群成功
                        console.log('加群成功', imResponse.data.group); // 加入的群组资料
                        resolve();
                        break;
                    case _this.TIM.TYPES.JOIN_STATUS_ALREADY_IN_GROUP: // 已经在群中
                        console.log('已经在群中');
                        resolve();
                        break;
                    default:
                        reject('加群失败');
                        break;
                }
            })
                .catch(function (imError) {
                reject('加群失败');
                console.warn('joinGroup error:', imError); // 申请加群失败的相关信息
            });
        });
    };
    /**
     * 获取群组详细资料
     */
    TIM.prototype.getGroupFile = function () {
        var _this = this;
        // const { groupId } = params
        return new Promise(function (resolve, reject) {
            var promise = _this.tim.getGroupProfile({
                groupID: _this.groupId,
                groupCustomFieldFilter: ['key1', 'key2'],
            });
            promise
                .then(function (imResponse) {
                console.log('getGroupProfile success', imResponse.data.group);
                resolve(imResponse.data.group);
            })
                .catch(function (imError) {
                console.warn('getGroupProfile error:', imError); // 获取群详细资料失败的相关信息
                reject(imError);
            });
        });
    };
    /**
     * 创建消息
     */
    TIM.prototype.createMsg = function (params) {
        var options = params.options;
        console.log('options.payload.extension', options.payload.extension);
        return this.tim.createCustomMessage(__assign(__assign({}, options), { to: this.groupId, payload: {
                data: options.payload.data,
                description: options.payload.data + " message",
                extension: JSON.stringify(__assign(__assign({}, options.payload.extension), { nickName: wx.getStorageSync('liveStaffMpUserNickName'), 
                    /**
                     * 是否主播标识 true-是 false-否
                     */
                    isAnchor: true })),
            }, conversationType: this.TIM.TYPES.CONV_GROUP }));
    };
    /**
     * 创建文本消息
     */
    TIM.prototype.createTextMsg = function (options) {
        var text = options.text;
        return this.createMsg({
            type: 'custom',
            options: {
                payload: {
                    data: 'text',
                    extension: {
                        text: text,
                    },
                },
            },
        });
    };
    /**
     * 创建自定义消息
     */
    TIM.prototype.createCustomMsg = function (options) {
        var payload = options.payload;
        return this.createMsg({
            type: 'custom',
            options: {
                payload: payload,
            },
        });
    };
    /**
     * 发送消息
     */
    TIM.prototype.sendMsg = function (message) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var promise = _this.tim.sendMessage(message);
            promise
                .then(function (imResponse) {
                // 发送成功
                console.log('发送成功', imResponse);
                resolve();
            })
                .catch(function (imError) {
                // 发送失败
                console.warn('sendMessage error:', imError);
                console.error('into send msg error', imError);
                _this.joinGroup().then(function () {
                    _this.sendMsg(message);
                });
                reject(imError);
            });
        });
    };
    return TIM;
}());
var index = new TIM();

exports.default = index;
