/** Declaration file generated by dts-gen */

/**
 * 消息类型 buying-购买消息 guiding-讲解消息 coming-来了消息 like-点赞消息 eleVisible-元素显隐控制消息 text-文本消息 linkmic-连麦消息
 */
type IMsgType = 'buying' | 'guiding' | 'coming' | 'like' | 'posterShowStatus' | 'eleVisible' | 'text' | 'linkmic'

export = tim_util;

declare const tim_util: {

	/**
	 * 销毁tim实例 取消所有事件监听
	 */
	destroyTimInstance: Function

	/**
	 * 创建自定义消息
	 */
	createCustomMsg: (options: {
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
				/**
				 * 任意属性
				 */
				[key: string]: any
			}
		}
	}) => void;

	/**
	 * 创建消息体
	 */
	createMsg: (params: {
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
	}) => void;

	/**
	 * 创建文本消息
	 */
	createTextMsg: (options: {
		/**
		 * 消息文本内容
		 */
		text: string
	}) => void;

	/**
	 * 获取群资料
	 */
	getGroupFile: () => Promise<any>;

	/**
	 * tim初始化
	 */
	init: (config: {
		/**
		 * tim插件
		 */
		TIM_PLUGINS: {
			[key: string]: any
		}
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
		SDKAPPID: string
		/**
		 * TIM Sdk
		 */
		TIM_SDK: any
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
	}) => void;

	/**
	 * 加群
	 */
	joinGroup: () => Promise<any>;

	/**
	 * 发送点赞消息
	 */
	like: () => Promise<any>;

	/**
	 * tim登录
	 */
	login: ({
		userId,
		userSig,
		onReady,
		onLoginError
	}) => void;

	/**
	 * 发送消息
	 * @message 使用createMsg创建的消息体
	 */
	sendMsg: (message: any) => Promise<any>;

	/**
	 * 创建元素显隐变更消息并发送
	 */
	setEleVisible: (ele: {
		/**
		 * 元素类型
		 */
		eleType: 'activity' | 'poster'
		/**
		 * 元素是否展示
		 */
		eleShow: boolean
	}) => Promise<any>;

	/**
	 * 创建海报状态变更消息并发送
	 * @param status 0-关闭 1-开启
	 */
	setPosterShowStatus: (status: 0 | 1) => Promise<any>;

	/**
	 * 发送端对端自定义消息
	 */
	sendC2CCustomMsg: (params: {
		/**
		 * 目标id
		 */
		toUserId: string;
		/**
		 * 消息体
		 */
		msg: {
			/**
			 * 类型 
			 */
			data: IMsgType;
			/**
			 * 扩展字段
			 */
			extension?: any
		}
	}) => Promise<any>

	/**
	 * 发送群自定义消息
	 */
	sendGroupCustomMsg: (params: {
		/**
		 * 消息体
		 */
		msg: {
			/**
			 * 类型 
			 */
			data: IMsgType;
			/**
			 * 扩展字段
			 */
			extension?: any
		}
	}) => Promise<any>
};

