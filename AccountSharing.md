# FT中文网新的登录与设备管理规则

## 大的原则
- 所有设备分为三种：手机、平板和电脑，未来可能会增加新的种类。
- 每种类型的设备，同一个时间只允许一台设备登录使用。
- 每次登录新的设备，就会把其他同类设备登出。

## 例子：可用于最后的测试
- 一位用户有一台电脑，一台iPhone手机，一台iPad，他在三台设备上分别登入使用订阅服务。
- 他新购一台华为手机，在新的手机上登入FT中文网应用，登入成功后，我们的App会提醒他原来的这台iPhone手机已经登出。
- 他在iPhone手机上启动FT中文网应用，应用提醒他因为他已经在一台新的设备上登入，所以他已经登出。
- 他的一位同事在办公室用他的账号登入网站，网站提醒这位同事，在另一台电脑上已经登出。
- 他刷新自己电脑上的网站页面，发现自己已经登出，并且看到一个弹窗，显示自己的账号已经在另一台设备登入。

## 用户体验上的要点
### 从一台设备登入，另一台设备马上登出
- 增加这个功能之后，用户每次和服务器进行交互，都需要查验身份和设备，和目前的登录成功之后，身份就保留的情况大不一样，对服务器的潜在压力大了很多。
- 对于网页来说，就是每次用户获取新内容的时候，都需要进行一次查验，看这个账户是不是依然应该处于登入状态，同时更新账户下最新登录的设备信息。
- 对于原生应用来说，仍然需要在用户获取和服务器交互的时候，进行查验，同时被登出的设备应该收到一条通知推送，这就意味着我们除了收集设备ID，还需要收集通知推送的Token。
- 这个查验是非常频繁的，因此必须非常高效和安全，否则会拖垮服务器，也可能成为黑客攻击的弱点。
- 这个查验的请求在原声应用中很可能会被抓包，因此接口要么使用国内的服务器，要么和内容域名一致。

### 设备如何计数
- 对于原生应用，可以直接取Device Id，这样只要用户不删除App，Device Id始终是一致的。
- 在网页版上，只能利用Cookie生成一个guid，同一设备上的不同浏览器，会被记录为不同的guid，因此，如果你在Chrome上登入，同一台电脑上的FireFox上就会登出。
- 在手机和平板上，用户有可能使用App或者网站登录。因此，如果你在iPhone的App登入，你在Safari上就会被登出。

### API使用的域名
在我们会被抓包的情况下，尽可能使用用户访问内容的同一个域名。这样，只要用户能访问内容，就可以上传设备数据。如果他不能访问内容，上传设备数据也没有意义。

## 灰度推出
由于这个改变太大，在开发中遇到的挑战比较多，我建议分阶段推出。

### 设备信息收集和验证
在服务器端，收集并验证订户的设备信息，非订户没有必要做这个，以免被人抓包。收集的数据至少有两个用途，一个是实时地验证订户是否在同时使用多个同类型设备，另一个是供定期分析订户跨设备使用的情况。这个阶段的开发是不影响用户体验的，一旦发现出任何问题，比如服务器承载过大，可以随时停止收集。开发周期：两周。网页端和原生端可以使用同一个API，但在传输的数据和认证方面应有区别。收集的数据包括（有些设备可能无法收集某些数据，这种情况下，可以不提交，或者提交空字符）：
- device_id
- user_id
- device_type（phone, tablet, other)
- user_agent
- device_brand
- device_model
- ip
- longitude 
- latitude
- device_token
- unix_timestamp
- footprints_url(footprints_uri)

### 对超过设备限额的用户显示提示
在我们确认数据收集阶段开发的功能是安全、高效的之后。有以下的功能需要开发，开发周期两周，运行两周：
- API需要返回同一个用户当前登录的所有设备的信息。
- 客户端和前端依据这些信息显示友好的提示，比如：您的账号已经在多台设备上登入，您的密码可能已经泄露。
- 对于我们确定的共享设备的人，可以给他们一个享受较大折扣的机会（在iPhone的应用上很容易实现，我可以快速开发出来进行测试，如果效果好，这可能成为一个新订户数量的途径，但是由于这部分订户支付意愿很低，所以收入上不一定好）。
- 观察设备共享的情况是否发生了变化。

### 在确认我们前期开发的功能完善之后，可以将超过限额的用户登出
当我们确认前面的功能都确认无误后，我们可以开启将超过限额的设备登出的功能，开发周期一周：
- 原生应用直接从客户端进行登出操作，因为所需的信息已经体现在API的返回了。
- 网页端建议在API返回的时候直接触发登出操作，这样不容易被第三方截获。
- 客户端和前端会记录下API返回的信息，并相应进行解释，如：您的账号已经于2022年3月3日 09:32分在一台华为手机登入，如果这不是您的设备，您的账号和密码可能已经泄露，如您重新登录，请尽快修改密码；我们现在有一个活动，您在30分钟内完成购买，可以享受一个较大的折扣。
- 如果客户重新登录，可以提醒他修改密码。

### 更多更细致的工作
- 如果发生某台设备被登出的情况，相关的订户应该立刻收到一条通知，可以是邮件、短信和通知推送。

## 分工

### 服务端
主要是设计数据的收集、存储、提取、验证以及和前端以及原生端的接口交互。
- 数据收集和存储
- 数据验证
- 网页端接口
- 原生端接口

### iPhone端
依据接口的规范，将访问数据提交，并处理接口的返回

### Android端
依据接口的规范，将访问数据提交，并处理接口的返回

### 前端
依据接口的规范，将访问数据提交，并处理接口的返回
