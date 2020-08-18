/**
 * 消息类型 buying-购买消息 guiding-讲解消息 coming-来了消息 like-点赞消息 text-文本消息
 */
type IMsgType = 'buying' | 'guiding' | 'coming' | 'like' | 'text'

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
	 * 昵称
	 */
  nickName: string
	/**
	 * 群组id
	 */
  groupId: string
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
		 * cos sdk
		 */
    COS: any
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
  }) {
    const {
      SDKAPPID,
      TIM_SDK,
      COS,
      nickName,
      userId,
      userSig,
      onReady,
      onConversationListUpdated,
      onGroupListUpdated,
      onMessageReceived,
      groupId,
      onKickedOut,
      toast
    } = config

    this.TIM_READY = false
    this.nickName = nickName
    this.toast = toast

    console.log('进入 tim sdk初始化')

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
    tim.registerPlugin({'cos-wx-sdk': COS})

    // 监听事件，例如：
    tim.on(this.TIM.EVENT.SDK_READY, event => {
      // 收到离线消息和会话列表同步完毕通知，接入侧可以调用 sendMessage 等需要鉴权的接口
      // event.name - TIM.EVENT.SDK_READY
      console.log('SDK_READY', event)

      this.TIM_READY = true

      onReady && onReady()
    })

    tim.on(this.TIM.EVENT.MESSAGE_RECEIVED, event => {
      // 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
      // event.name - TIM.EVENT.MESSAGE_RECEIVED
      // event.data - 存储 Message 对象的数组 - [Message]
      console.log('TIM.EVENT.MESSAGE_RECEIVED', event)

			/**
			 * 过滤字段
			 */
      const msgList: any = []
      event.data.forEach(element => {
				/**
				 * 过滤消息类型 只抛出自定义消息和文本消息
				 */
        if (['TIMTextElem', 'TIMCustomElem'].includes(element.type)) {
          msgList.push({
            ID: element.ID,
            clientSequence: element.clientSequence,
            nick: element.nick,
            payload: element.payload,
            type: element.type,
          })
        }
      })
      if (this.TIM_READY) {
        onMessageReceived && onMessageReceived(msgList)
      }
    })

    tim.on(this.TIM.EVENT.MESSAGE_REVOKED, event => {
      // 收到消息被撤回的通知
      // event.name - TIM.EVENT.MESSAGE_REVOKED
      // event.data - 存储 Message 对象的数组 - [Message] - 每个 Message 对象的 isRevoked 属性值为 true
      console.log('MESSAGE_REVOKED', event)
    })

    tim.on(this.TIM.EVENT.MESSAGE_READ_BY_PEER, event => {
      // SDK 收到对端已读消息的通知，即已读回执。使用前需要将 SDK 版本升级至 v2.7.0 或以上。仅支持单聊会话。
      // event.name - TIM.EVENT.MESSAGE_READ_BY_PEER
      // event.data - event.data - 存储 Message 对象的数组 - [Message] - 每个 Message 对象的 isPeerRead 属性值为 true
      console.log('MESSAGE_READ_BY_PEER', event)
    })

    tim.on(this.TIM.EVENT.CONVERSATION_LIST_UPDATED, event => {
      // 收到会话列表更新通知，可通过遍历 event.data 获取会话列表数据并渲染到页面
      // event.name - TIM.EVENT.CONVERSATION_LIST_UPDATED
      // event.data - 存储 Conversation 对象的数组 - [Conversation]
      console.log('CONVERSATION_LIST_UPDATED', event)

      const msgList: any = []
      // event.data.forEach(element => {
      // 	/**
      // 	 * 过滤消息类型 只抛出自定义消息和文本消息
      // 	 */
      // 	if (['TIMTextElem', 'TIMCustomElem'].includes(element.type)) {
      // 		msgList.push({
      // 			ID: element.ID,
      // 			clientSequence: element.clientSequence,
      // 			nick: element.nick,
      // 			payload: element.payload,
      // 			type: element.type,
      // 		})
      // 	}
      // })

      // 过滤字段
      event.data.forEach(element => {
				/**
				 * 只抛出自定义和文本消息
				 */
        if (element.lastMessage.type === 'TIMCustomElem') {
          msgList.push({
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
          console.log('分割结果', textSplitRes)
          msgList.push({
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

      console.log('CONVERSATION_LIST_UPDATED监听过滤之后的数据', msgList)
      if (this.TIM_READY) {
        msgList &&
          msgList.length &&
          onConversationListUpdated &&
          onConversationListUpdated(msgList)
      } else {
        console.warn('收到消息但TIM未初始化成功')
      }
    })

    tim.on(this.TIM.EVENT.GROUP_LIST_UPDATED, event => {
      // 收到群组列表更新通知，可通过遍历 event.data 获取群组列表数据并渲染到页面
      // event.name - TIM.EVENT.GROUP_LIST_UPDATED
      // event.data - 存储 Group 对象的数组 - [Group]
      console.log('GROUP_LIST_UPDATED', event)
      onGroupListUpdated && onGroupListUpdated()
    })

    tim.on(this.TIM.EVENT.PROFILE_UPDATED, event => {
      // 收到自己或好友的资料变更通知
      // event.name - TIM.EVENT.PROFILE_UPDATED
      // event.data - 存储 Profile 对象的数组 - [Profile]
      console.log('PROFILE_UPDATED', event)
    })

    tim.on(this.TIM.EVENT.BLACKLIST_UPDATED, event => {
      // 收到黑名单列表更新通知
      // event.name - TIM.EVENT.BLACKLIST_UPDATED
      // event.data - 存储 userID 的数组 - [userID]
      console.log('BLACKLIST_UPDATED', event)
    })

    tim.on(this.TIM.EVENT.ERROR, event => {
      // 收到 SDK 发生错误通知，可以获取错误码和错误信息
      // event.name - TIM.EVENT.ERROR
      // event.data.code - 错误码
      // event.data.message - 错误信息
      console.log('ERROR', event)
      toast.show(`聊天室错误: ${event.data.code} - ${event.data.message}`)
    })

    tim.on(this.TIM.EVENT.SDK_NOT_READY, event => {
      // 收到 SDK 进入 not ready 状态通知，此时 SDK 无法正常工作
      // event.name - TIM.EVENT.SDK_NOT_READY
      console.log('SDK_NOT_READY', event)
      // toast.show(`聊天室初始化失败，请检查您的网络`)
    })

    tim.on(this.TIM.EVENT.KICKED_OUT, event => {
      // 收到被踢下线通知
      // event.name - TIM.EVENT.KICKED_OUT
      // event.data.type - 被踢下线的原因，例如:
      //    - TIM.TYPES.KICKED_OUT_MULT_ACCOUNT 多实例登录被踢
      //    - TIM.TYPES.KICKED_OUT_MULT_DEVICE 多终端登录被踢
      //    - TIM.TYPES.KICKED_OUT_USERSIG_EXPIRED 签名过期被踢 （v2.4.0起支持）。
      console.log('KICKED_OUT', event)
      // toast.show(`您已被踢掉线，原因：${event.data.type}`)
      onKickedOut && onKickedOut()
    })

    tim.on(this.TIM.EVENT.NET_STATE_CHANGE, event => {
      //  网络状态发生改变（v2.5.0 起支持）。
      // event.name - TIM.EVENT.NET_STATE_CHANGE
      // event.data.state 当前网络状态，枚举值及说明如下：
      //     \- TIM.TYPES.NET_STATE_CONNECTED - 已接入网络
      //     \- TIM.TYPES.NET_STATE_CONNECTING - 连接中。很可能遇到网络抖动，SDK 在重试。接入侧可根据此状态提示“当前网络不稳定”或“连接中”
      //    \- TIM.TYPES.NET_STATE_DISCONNECTED - 未接入网络。接入侧可根据此状态提示“当前网络不可用”。SDK 仍会继续重试，若用户网络恢复，SDK 会自动同步消息
      console.log('NET_STATE_CHANGE', event)
      if (event.data.state === TIM.TYPES.NET_STATE_CONNECTED) {
        toast.show('网络已连接')
      } else if (event.data.state === TIM.TYPES.NET_STATE_CONNECTING) {
        toast.loading('当前网络不稳定，连接中...')
      } else if (event.data.state === TIM.TYPES.NET_STATE_DISCONNECTED) {
        toast.show('当前网络不可用，请检查您的网络')
      }
    })

    // 开始登录
    const promise = tim.login({userID: userId, userSig: userSig})
    promise
      .then(imResponse => {
        console.log('tim登录成功', imResponse.data) // 登录成功
        if (imResponse.data.repeatLogin === true) {
          // 标识账号已登录，本次登录操作为重复登录。v2.5.1 起支持
          console.log('tim重复登录', imResponse.data.errorInfo)

          this.TIM_READY = true

          onReady && onReady()
        }
      })
      .catch(imError => {
        toast.show(`TIM登录失败: ${imError}`)
        console.warn('login error:', imError) // 登录失败的相关信息
      })
  }

	/**
	 * 加入群
	 */
  joinGroup() {
    return new Promise((resolve, reject) => {
      // const { groupId } = params
      console.log('即将加群', this.groupId)
      const promise = this.tim.joinGroup({
        groupID: this.groupId,
        type: this.TIM.TYPES.GRP_AVCHATROOM,
      })
      promise
        .then(imResponse => {
          switch (imResponse.data.status) {
            case this.TIM.TYPES.JOIN_STATUS_WAIT_APPROVAL: // 等待管理员同意
              console.log('等待管理员同意')
              reject('加群失败')
              break
            case this.TIM.TYPES.JOIN_STATUS_SUCCESS: // 加群成功
              console.log('加群成功', imResponse.data.group) // 加入的群组资料
              resolve()
              break
            case this.TIM.TYPES.JOIN_STATUS_ALREADY_IN_GROUP: // 已经在群中
              console.log('已经在群中')
              resolve()
              break
            default:
              reject('加群失败')
              break
          }
        })
        .catch(imError => {
          reject('加群失败')
          console.warn('joinGroup error:', imError) // 申请加群失败的相关信息
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
        groupID: this.groupId,
        groupCustomFieldFilter: ['key1', 'key2'],
      })
      promise
        .then(imResponse => {
          console.log('getGroupProfile success', imResponse.data.group)
          resolve(imResponse.data.group)
        })
        .catch(imError => {
          console.warn('getGroupProfile error:', imError) // 获取群详细资料失败的相关信息
          this.toast.show(`获取群资料失败: ${imError}`)
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
    console.log('options.payload.extension', options.payload.extension)
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
          ...options.payload.extension,
          nickName: this.nickName,
					/**
					 * 是否主播标识 true-是 false-否
					 */
          isAnchor: false,
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
			 * type 自定义消息类型 buying-购买 guiding-讲解 coming-来了 text-普通文本消息
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
        text: string
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
          console.log('发送成功', imResponse)
          resolve()
        })
        .catch(imError => {
          // 发送失败
          console.warn('sendMessage error:', imError)
          reject(JSON.stringify(imError))
        })
    })
  }

	/**
	 * 创建点赞消息并发送
	 */
  like() {
    return new Promise((resolve) => {
      const likeMsg = this.createCustomMsg({
        payload: {
          data: 'like'
        }
      })
      this.sendMsg(likeMsg).then(() => {
        resolve()
      })
    })
  }
}

export default new TIM()
