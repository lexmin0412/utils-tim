# Tim-Util

基于腾讯即时通信IM的工具类封装。

## API

### init

初始化 Tim SDK。

#### 参数：

##### Object object

| 属性                      | 类型          | 默认值   | 必填 | 说明                                |
|---------------------------|---------------|----------|------|-------------------------------------|
| SDKAPPID                  | string/number | 无       | 是   | tim sdk的 appid，在腾讯云控制台获取 |
| nickName                  | string        | 默认昵称 | 是   | 用于聊天列表展示的昵称              |
| TIM_SDK                   | object        | 无       | 是   | TIM SDK                             |
| COS                       | object        | 无       | 是   | 发送图片、文件等消息需要的 COS SDK  |
| groupId                   | string        | 无       | 是   | 发送消息时需要用到的目标群组id      |
| userId                    | string        | 无       | 是   | 用户id                              |
| userSig                   | string        | 无       | 是   | 用户签名                            |
| onReady                   | Function      | 无       | 是   | SDK 处于 READY 状态的回调，可在此回调中处理加群等操作          |
| onConversationListUpdated | Function      | 无       | 否   | 会话列表更新时的回调                |
| onKickedOut               | Function      | 无       | 否   | 被踢掉线回调                        |
| onLoginError              | Function      | 无       | 否   | 登录失败回调                        |

用法：

```js
import TimUtil from 'tim-util'  // 引入node_modules中的tim-util
import TIM_SDK from './../tencent-webim/tim-wx'  // 引入tim wx sdk
// 发送图片、文件等消息需要的 COS SDK
import COS from 'cos-wx-sdk-v5'

const onTimReady = () => {
	console.log('初始化成功')
	TimUtil.joinGroup()  // 加入群组
}

const onConversationListUpdated = (res) => {
	console.log('conversation list', res)  // 会话列表数组
}

const onKickedOut = (e) => {
	console.log('被踢掉线啦')  // 这里可以做一些处理，如重新连接
}

const onLoginError = () => {
	console.log('login error')  // 这里可以做一些处理，如重新登录
}

// 调用init方法
TimUtil.init({
	SDKAPPID: 'tim appid',
	nickName: 'im test nickname',
	TIM_SDK,
	COS,
	groupId: 'chatroom groupid',
	userId: 'user id',
	userSig: 'user sign',
	onReady: onTimReady,
	onConversationListUpdated: onConversationListUpdated,
	onKickedOut: onKickedOut,
	onLoginError: onLoginError,
}
```

### login

tim 登录。

#### 参数

##### Object Object

| 属性                      | 类型          | 默认值   | 必填 | 说明                                |
|---------------------------|---------------|----------|------|-------------------------------------|
| userId | string | 无 | 是 | 用户id |
| userSig | string | 无 | 是 | 用户签名 |
| onReady | Function | 无 | 否 | Tim SDK 处于 Ready 状态的回调 |
| onLoginError | Function | 无 | 否 | 登录错误回调 |

#### 用法

```ts
const onTimReady = () => {
	console.log('初始化成功')
	TimUtil.joinGroup()  // 加入群组
}

const onLoginError = () => {
	console.log('login error')  // 这里可以做一些处理，如重新登录
}

TimUtil.login({
	userId: 'user id',
	userSig: 'user sign',
	onReady: onTimReady,
	onLoginError: onLoginError,
}
```

### joinGroup

加入群组，只有在 sdk 处于 ready 状态时才能调用。

### createCustomMsg

创建自定义消息。

#### 参数

##### Object Object

| 属性                      | 类型          | 默认值   | 必填 | 说明                                |
|---------------------------|---------------|----------|------|-------------------------------------|
| payload | object | 无 | 是 | 消息内容 |
| payload.data | string | 无 | 是 | `buying`-购买, `guiding`-讲解, `coming`-进入直播间消息, `like`-点赞, `posterShowStatus`-海报展示状态(即将废弃，请使用`eleVisibleeleVisible`), `eleVisible`-元素显隐状态, `text`-文本消息
| payload.extension | object | 无 | 是 | 自定义扩展字段 |

#### 使用示例

```ts
const customMsg = TimUtil.createCustomMsg({
	payload: {
		data: 'buying',
	},
})
TimUtil.sendMsg(customMsg).then(() => {
	console.log('消息发送成功')
})
```

### createTextMsg

创建文本消息。

#### 参数

##### Object Object

| 属性    | 类型   | 默认值 | 必填 | 说明     |
|---------|--------|--------|------|----------|
| text | string | 无     | 是   | 文本内容 |

### like

发送点赞消息。

### sendMsg

发送消息，可发送通过 createTextMsg 和 createCustomMsg 方法创建的文本和自定义消息，返回一个封装了发送结果的 Promise。

#### 参数

##### msgBody

通过 createTextMsg 和 createCustomMsg 创建的消息。

##### 用法

```ts
TimUtil.sendMsg(msg)
.then(res => {
	console.log('消息发送成功')
	resolve(res)
})
.catch(err => {
	this.onSendMsgError(err)
})
```

### sendC2CCustomMsg

发送端对端自定义消息。

#### 参数

##### Object Object

| 属性 | 类型   | 默认值 | 必填 | 说明     |
|------|--------|--------|------|----------|
| toUserId | string | 无     | 是   | 目标用户IM userId |
| msg | object object | 无     | 是   | 消息体 |

```ts
TimUtil.sendC2CCustomMsg({
	toUserId: '',  // 目标userId
	msg: {
		data: 'linkmic',  // 消息类型
		extension: {      // 自定义扩展字段
			type: 'respond',
			action: 'reject',
			msgDirection: 'c2a', 
			userNickName: '',
			userId: '',
		},
	},
})
```

### sendGroupCustomMsg

发送群自定义消息。

#### 参数

##### Object Object

| 属性     | 类型          | 默认值 | 必填 | 说明              |
|----------|---------------|--------|------|-------------------|
| toGroupId | string        | 无     | 是   | IM groupId |
| msg      | object object | 无     | 是   | 消息体            |

```ts
TimUtil.sendC2CCustomMsg({
	toGroupId: '',    // 群id
	msg: {
		data: 'linkmic',  // 自定义消息类型
		extension: {      // 自定义扩展字段
			type: 'respond',
			action: 'reject',
			msgDirection: 'c2a',
			userNickName: '',
			userId: '',
		},
	},
})
```