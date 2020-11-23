import {
  timLog,
  picSthFromObj
} from './util'

/**
 * 消息类型 buying-购买消息 guiding-讲解消息 coming-来了消息 like-点赞消息 eleVisible-元素显隐控制消息 text-文本消息
 */
type IMsgType = 'buying' | 'guiding' | 'coming' | 'like' | 'posterShowStatus' | 'eleVisible' | 'text'

class TIM {
  /**
   * tim实例
   */
  tim: any
  /**
   * TIM sdk
   */
  TIM: any
  /**
   * TIM是否初始化完成
   */
  TIM_READY: boolean
  /**
   * 用户userId
   */
  userId: string
  /**
   * 昵称
   */
  nickName: string
  /**
   * 群组id
   */
  groupId: string
  /**
   * 取消订阅
   */
  cancelMessageReceivedListener: Function
  /**
   * 销毁当前实例 取消所有订阅
   */
  destroyTimInstance: Function
  /**
   * toast类
   */
  toast: {
    /**
     * text 错误提示
     */
    show: (text: string) => void
    /**
     * text 加载提示文字
     */
    loading: (text: string) => void
  }
  /**
   * 初始化
   * @param config 配置对象
   */
  init(config: {
    /**
     * toast类
     */
    toast: {
      /**
       * text 错误提示
       */
      show: (text: string) => void
      /**
       * text 加载提示文字
       */
      loading: (text: string) => void
    }
    /**
     * 用户昵称
     */
    nickName: string
    /**
     * tim sdk appid
     */
    SDKAPPID: number
    /**
     * TIM Sdk
     */
    TIM_SDK: any
    /**
     * tim插件
     */
    TIM_PLUGINS: {
      [key: string]: any
    }
    /**
     * 直播聊天室群组id
     */
    groupId: string
    /**
     * 用户id
     */
    userId: string
    /**
     * 用户sig
     */
    userSig: string
    /**
     * 初始化成功回调
     */
    onReady: Function
    /**
     * 收到消息回调
     */
    onConversationListUpdated?: Function
    /**
     * 群组列表更新回调
     */
    onGroupListUpdated?: Function
    /**
     * 收到新消息回调
     */
    onMessageReceived?: Function
    /**
     * 被踢掉线时的处理
     */
    onKickedOut: Function
    /**
     * 登录失败回调
     */
    onLoginError?: Function
    /**
     * 收到SDK错误时的回调
     */
    onSDKError?: Function
  }) {
    const {
      SDKAPPID,
      TIM_SDK,
      TIM_PLUGINS,
      nickName,
      userId,
      userSig,
      onReady,
      onConversationListUpdated,
      onGroupListUpdated,
      onMessageReceived,
      groupId,
      onKickedOut,
      toast,
      onLoginError,
      onSDKError
    } = config

    this.TIM_READY = false
    this.nickName = nickName
    this.userId = userId
    this.toast = toast

    timLog('即将初始化')

    const options = {
      SDKAppID: SDKAPPID, // 接入时需要将0替换为您的即时通信 IM 应用的 SDKAppID
    }
    // 创建 SDK 实例，`TIM.create()`方法对于同一个 `SDKAppID` 只会返回同一份实例
    const tim = TIM_SDK.create(options) // SDK 实例通常用 tim 表示

    this.tim = tim
    this.TIM = TIM_SDK
    this.groupId = groupId

    // 设置 SDK 日志输出级别，详细分级请参见 setLogLevel 接口的说明
    tim.setLogLevel(1) // 普通级别，日志量较多，接入时建议使用
    // tim.setLogLevel(1); // release 级别，SDK 输出关键信息，生产环境时建议使用

    // 注册 COS SDK 插件
    tim.registerPlugin(TIM_PLUGINS)

    const onTimSDKReady = (event) => {
      // 收到离线消息和会话列表同步完毕通知，接入侧可以调用 sendMessage 等需要鉴权的接口
      // event.name - TIM.EVENT.SDK_READY
      timLog('SDK READY回调', event)

      this.TIM_READY = true

      onReady && onReady()
    }

    // 监听事件，例如：
    tim.off(this.TIM.EVENT.SDK_READY, onTimSDKReady)
    tim.on(this.TIM.EVENT.SDK_READY, onTimSDKReady)

    const onTimMessageReceived = (event) => {
      timLog('收到新消息', event)
      // 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
      // event.name - TIM.EVENT.MESSAGE_RECEIVED
      // event.data - 存储 Message 对象的数组 - [Message]

      /**
       * 过滤字段
       */
      const msgList: any = []
      event.data.forEach(element => {
        // 只有接收到的消息才抛出
        if (element.flow === 'in') {
          /**
           * 过滤消息类型 只抛出自定义消息和文本消息
           */
          if (['TIMCustomElem'].includes(element.type)) {
            const msgBody = {
              ...picSthFromObj(element, [
                'ID',
                'clientSequence',
                'nick',
                'type',
                'from',
                'to'
              ]),
              payload: {
                ...element.payload,
                extension: JSON.parse(element.payload.extension)
              }
            }
            msgList.push(msgBody)
          } else if (element.type === 'TIMTextElem') {
            const textSplitRes = element.payload.text.split('m&=&m')
            const msgBody = {
              ...picSthFromObj(element, [
                'ID',
                'clientSequence',
                'nick',
                'type',
                'from',
                'to'
              ]),
              payload: {
                ...element.payload,
                extension: {
                  text: textSplitRes[1],
                  nickName: textSplitRes[0]
                }
              }
            }
            msgList.push(msgBody)
          }
        }
      })

      if (this.TIM_READY) {
        onMessageReceived && onMessageReceived(msgList)
      }
    }

    tim.off(this.TIM.EVENT.MESSAGE_RECEIVED, onTimMessageReceived)
    if (onMessageReceived) {
      tim.on(this.TIM.EVENT.MESSAGE_RECEIVED, onTimMessageReceived)
    }

    /**
     * 会话列表更新监听
     * @param callback
     * @param event
     */
    const onTimConversationListUpdated = (event) => {
      // 收到会话列表更新通知，可通过遍历 event.data 获取会话列表数据并渲染到页面
      // event.name - TIM.EVENT.CONVERSATION_LIST_UPDATED
      // event.data - 存储 Conversation 对象的数组 - [Conversation]
      timLog('消息监听原始数据', event)

      const msgList: any = []
      // 过滤字段
      event.data.forEach(element => {
        /**
         * 只抛出自定义和文本消息
         */
        if (element.lastMessage.type === 'TIMCustomElem') {
          msgList.push({
            type: element.type,
            groupProfile: element.groupProfile || null,
            lastMessage: {
              ...element.lastMessage,
              payload: {
                ...element.lastMessage.payload,
                extension: JSON.parse(element.lastMessage.payload.extension),
              },
            },
          })
        } else if (element.lastMessage.type === 'TIMTextElem') {
          const textSplitRes = element.lastMessage.payload.text.split('m&=&m')
          timLog('分割结果', textSplitRes)
          msgList.push({
            type: element.type,
            groupProfile: element.groupProfile || null,
            lastMessage: {
              ...element.lastMessage,
              payload: {
                extension: {
                  text: textSplitRes[1],
                  nickName: textSplitRes[0],
                },
              },
            },
          })
        }
      })

      timLog('tim消息监听过滤完成数据', msgList)
      if (this.TIM_READY) {
        msgList &&
          msgList.length &&
          onConversationListUpdated &&
          onConversationListUpdated(msgList)
      } else {
        timLog('收到消息但TIM未初始化成功')
      }
    }

    tim.off(this.TIM.EVENT.CONVERSATION_LIST_UPDATED, onTimConversationListUpdated)
    if (onConversationListUpdated) {
      tim.on(this.TIM.EVENT.CONVERSATION_LIST_UPDATED, onTimConversationListUpdated)
    }

    const onTimError = (event) => {
      // 收到 SDK 发生错误通知，可以获取错误码和错误信息
      // event.name - TIM.EVENT.ERROR
      // event.data.code - 错误码
      // event.data.message - 错误信息
      timLog('TIM.EVENT.ERROR', event)

      onSDKError && onSDKError(event)
    }

    tim.off(this.TIM.EVENT.ERROR, onTimError)
    tim.on(this.TIM.EVENT.ERROR, onTimError)

    const onSdkNotReady = () => {
      // 收到 SDK 进入 not ready 状态通知，此时 SDK 无法正常工作
      // event.name - TIM.EVENT.SDK_NOT_READY
      timLog('SDK_NOT_READY', event)
      // toast.show(`聊天室初始化失败，请检查您的网络`)
    }

    tim.off(this.TIM.EVENT.SDK_NOT_READY, onSdkNotReady)
    tim.on(this.TIM.EVENT.SDK_NOT_READY, onSdkNotReady)

    const onTimKickedOut = (event) => {
      // 收到被踢下线通知
      // event.name - TIM.EVENT.KICKED_OUT
      // event.data.type - 被踢下线的原因，例如:
      //    - TIM.TYPES.KICKED_OUT_MULT_ACCOUNT 多实例登录被踢
      //    - TIM.TYPES.KICKED_OUT_MULT_DEVICE 多终端登录被踢
      //    - TIM.TYPES.KICKED_OUT_USERSIG_EXPIRED 签名过期被踢 （v2.4.0起支持）。
      timLog('KICKED_OUT', event)
      // toast.show(`您已被踢掉线，原因：${event.data.type}`)
      onKickedOut && onKickedOut()
    }

    tim.off(this.TIM.EVENT.KICKED_OUT, onTimKickedOut)
    tim.on(this.TIM.EVENT.KICKED_OUT, onTimKickedOut)

    const onTimNetStatusChange = (event) => {
      //  网络状态发生改变（v2.5.0 起支持）。
      // event.name - TIM.EVENT.NET_STATE_CHANGE
      // event.data.state 当前网络状态，枚举值及说明如下：
      //     \- TIM.TYPES.NET_STATE_CONNECTED - 已接入网络
      //     \- TIM.TYPES.NET_STATE_CONNECTING - 连接中。很可能遇到网络抖动，SDK 在重试。接入侧可根据此状态提示“当前网络不稳定”或“连接中”
      //    \- TIM.TYPES.NET_STATE_DISCONNECTED - 未接入网络。接入侧可根据此状态提示“当前网络不可用”。SDK 仍会继续重试，若用户网络恢复，SDK 会自动同步消息
      timLog('NET_STATE_CHANGE', event)
      if (event.data.state === this.TIM.TYPES.NET_STATE_CONNECTED) {
        toast.show('网络已连接')
      } else if (event.data.state === this.TIM.TYPES.NET_STATE_CONNECTING) {
        toast.loading('连接中...')
      } else if (event.data.state === this.TIM.TYPES.NET_STATE_DISCONNECTED) {
        toast.show('当前网络不可用，请检查您的网络')
      }
    }

    tim.off(this.TIM.EVENT.NET_STATE_CHANGE, onTimNetStatusChange)
    tim.on(this.TIM.EVENT.NET_STATE_CHANGE, onTimNetStatusChange)

    this.cancelMessageReceivedListener = () => {
      tim.off(this.TIM.EVENT.MESSAGE_RECEIVED, onTimMessageReceived)
      tim.off(this.TIM.EVENT.CONVERSATION_LIST_UPDATED, onTimConversationListUpdated)
    }

    this.destroyTimInstance = () => {
      tim.off(this.TIM.EVENT.SDK_READY, onTimSDKReady)
      tim.off(this.TIM.EVENT.MESSAGE_RECEIVED, onTimMessageReceived)
      tim.off(this.TIM.EVENT.ERROR, onTimError)
      tim.off(this.TIM.EVENT.CONVERSATION_LIST_UPDATED, onTimConversationListUpdated)
      tim.off(this.TIM.EVENT.KICKED_OUT, onTimKickedOut)
      tim.off(this.TIM.EVENT.SDK_NOT_READY, onSdkNotReady)
      tim.off(this.TIM.EVENT.NET_STATE_CHANGE, onTimNetStatusChange)
    }

    this.login({
      userId,
      userSig,
      onReady,
      onLoginError
    })
  }

  login({
    userId,
    userSig,
    onReady,
    onLoginError
  }) {
    // 开始登录
    timLog('即将登录', 'userId:', userId, 'userSig', userSig)
    const promise = this.tim.login({userID: userId, userSig: userSig})
    promise
      .then(imResponse => {
        timLog('登录成功', imResponse.data) // 登录成功
        if (imResponse.data.repeatLogin === true) {
          // 标识账号已登录，本次登录操作为重复登录。v2.5.1 起支持
          timLog('重复登录', imResponse.data.errorInfo)

          this.TIM_READY = true

          onReady && onReady()
        }
      })
      .catch(imError => {
        onLoginError && onLoginError(imError)
        console.error('登录失败回调', imError) // 登录失败的相关信息
      })
  }

  /**
   * 加入群
   */
  joinGroup() {
    return new Promise((resolve, reject) => {
      // const { groupId } = params
      timLog('即将加群', this.groupId)
      const promise = this.tim.joinGroup({
        groupID: this.groupId,
        type: this.TIM.TYPES.GRP_AVCHATROOM,
      })
      promise
        .then(imResponse => {
          switch (imResponse.data.status) {
            case this.TIM.TYPES.JOIN_STATUS_WAIT_APPROVAL: // 等待管理员同意
              timLog('等待管理员同意')
              reject('加群失败')
              break
            case this.TIM.TYPES.JOIN_STATUS_SUCCESS: // 加群成功
              timLog('加群成功', imResponse.data.group) // 加入的群组资料
              resolve()
              break
            case this.TIM.TYPES.JOIN_STATUS_ALREADY_IN_GROUP: // 已经在群中
              timLog('已经在群中')
              resolve()
              break
            default:
              reject('加群失败')
              break
          }
        })
        .catch(imError => {
          reject('加群失败')
          timLog('joinGroup error:', imError) // 申请加群失败的相关信息
        })
    })
  }

  /**
   * 获取群组详细资料
   */
  getGroupFile() {
    // const { groupId } = params
    return new Promise((resolve, reject) => {
      const promise = this.tim.getGroupProfile({
        groupID: this.groupId
      })
      promise
        .then(imResponse => {
          timLog('getGroupProfile success', imResponse.data.group)
          resolve(imResponse.data.group)
        })
        .catch(imError => {
          timLog('getGroupProfile error:', imError) // 获取群详细资料失败的相关信息
          reject(imError)
        })
    })
  }

  /**
   * 创建消息
   */
  createMsg(params: {
    /**
     * 类型 text-文本消息
     */
    type: 'text' | 'custom'
    /**
     * 消息配置
     */
    options: {
      /**
       * 消息优先级 可选
       *  // 消息优先级，用于群聊（v2.4.2起支持）。如果某个群的消息超过了频率限制，后台会优先下发高优先级的消息，详细请参考：https://cloud.tencent.com/document/product/269/3663#.E6.B6.88.E6.81.AF.E4.BC.98.E5.85.88.E7.BA.A7.E4.B8.8E.E9.A2.91.E7.8E.87.E6.8E.A7.E5.88.B6)
       *	// 支持的枚举值：TIM.TYPES.MSG_PRIORITY_HIGH, TIM.TYPES.MSG_PRIORITY_NORMAL（默认）, TIM.TYPES.MSG_PRIORITY_LOW, TIM.TYPES.MSG_PRIORITY_LOWEST
       *	// priority: TIM.TYPES.MSG_PRIORITY_NORMAL
       */
      priority?: string
      /**
       * 消息内容的容器
       */
      payload: {
        /**
         * 消息文本内容 可选 type为text时必传
         */
        text?: string
        /**
         * 自定义消息类型 可选 type为custom时必传
         */
        data?: IMsgType
        /**
         * 自定义消息详细数据 可选 type为custom时必传
         */
        extension?: any
      }
    }
  }) {
    const {options, type} = params
    timLog('options.payload.extension', options.payload.extension)
    if (type === 'text') {
      return this.tim.createTextMessage({
        to: this.groupId,
        payload: {
          text: options.payload.text,
        },
        conversationType: this.TIM.TYPES.CONV_GROUP,
      })
    }
    return this.tim.createCustomMessage({
      ...options,
      to: this.groupId,
      payload: {
        data: options.payload.data,
        description: `${options.payload.data} message`,
        extension: JSON.stringify({
          nickName: this.nickName,
          /**
           * 是否主播标识 true-是 false-否
           */
          isAnchor: false,
          ...options.payload.extension,
        }),
      },
      conversationType: this.TIM.TYPES.CONV_GROUP,
    })
  }

  /**
   * 创建文本消息
   */
  createTextMsg(options: {
    /**
     * 消息文本内容
     */
    text: string
  }) {
    const {text} = options
    const nickName = this.nickName
    return this.createMsg({
      type: 'text',
      options: {
        payload: {
          text: `${nickName}m&=&m${text}`,
        },
      },
    })
  }

  /**
   * 创建自定义消息
   */
  createCustomMsg(options: {
    /**
     * 消息内容的容器
     */
    payload: {
      /**
       * 自定义消息类型
       */
      data: IMsgType
      /**
       * 自定义扩展字段
       */
      extension?: {
        /**
         * 商品信息对象 type为guiding时必传
         */
        goodsInfo?: any
        /**
         * 文本内容 type为text时必传
         */
        text?: string
        /**
         * 海报状态变更目标状态 type为posterShowStatus时必传
         */
        posterShowStatus?: 0 | 1
        /**
         * 元素类型 activity-活动 poster-海报
         */
        eleType?: 'activity' | 'poster'
        /**
         * 元素是否展示
         */
        eleShow?: boolean
        /**
         * 是否主播标识
         */
        isAnchor?: boolean
      }
    }
  }) {
    const {payload} = options
    return this.createMsg({
      type: 'custom',
      options: {
        payload,
      },
    })
  }

  /**
   * 发送消息
   */
  sendMsg(message) {
    return new Promise((resolve, reject) => {
      const promise = this.tim.sendMessage(message)
      promise
        .then(imResponse => {
          // 发送成功
          timLog('发送成功', imResponse)
          resolve()
        })
        .catch(imError => {
          // 发送失败
          timLog('sendMessage error:', imError)
          reject(JSON.stringify(imError))
        })
    })
  }

  /**
   * 创建点赞消息并发送
   */
  like() {
    return new Promise((resolve, reject) => {
      const likeMsg = this.createCustomMsg({
        payload: {
          data: 'like'
        }
      })
      this.sendMsg(likeMsg).then(() => {
        resolve()
      }).catch((err) => {
        reject(err)
      })
    })
  }

  /**
   * 创建海报状态变更消息并发送
   * @param status 0-关闭 1-开启
   */
  setPosterShowStatus(status: 0 | 1) {
    return new Promise((resolve) => {
      const likeMsg = this.createCustomMsg({
        payload: {
          data: 'posterShowStatus',
          extension: {
            posterShowStatus: status
          }
        }
      })
      this.sendMsg(likeMsg).then(() => {
        resolve()
      })
    })
  }

  /**
   * 创建元素显隐变更消息并发送
   */
  setEleVisible(ele: {
    /**
     * 元素类型
     */
    eleType: 'activity' | 'poster'
    /**
     * 元素是否展示
     */
    eleShow: boolean
  }) {
    const {eleType, eleShow} = ele
    return new Promise((resolve) => {
      const likeMsg = this.createCustomMsg({
        payload: {
          data: 'eleVisible',
          extension: {
            eleType,
            eleShow
          }
        }
      })
      this.sendMsg(likeMsg).then(() => {
        resolve()
      })
    })
  }

  /**
   * 发送端对端自定义消息
   */
  sendC2CCustomMsg(params: {
    toUserId: string;
    msg: {
      data: IMsgType;
      extension?: any
    }
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      const {toUserId, msg} = params
      const message = this.tim.createCustomMessage({
        to: toUserId,
        conversationType: this.TIM.TYPES.CONV_C2C,
        payload: {
          data: msg.data,
          extension: JSON.stringify(msg.extension)
        }
      })
      this.sendMsg(message).then(() => {
        timLog('连麦消息发送成功')
        resolve()
      }).catch(err => {
        timLog('连麦消息发送失败', err)
        reject(err)
      })
    })
  }
}

export default new TIM()
