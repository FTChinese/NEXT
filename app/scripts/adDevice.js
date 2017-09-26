var adDevices = {
  PC: {
    id:'1000',
    description: '在PC上看到的网页',
    pattern: adPatternPC,
    channels: adChannelsPC
  },
  iPhoneApp: {
    id:'2000',
    description: '在iPhone手机上看到的App',
    pattern: adPatternPhone,
    channels: adChannelsMobile//Quest:这个Mobie指的是Appd的意思吧？因为Mobile也可能用网页打开
  },
  iPhoneWeb: {
    id:'3000',
    description: '在iPhone手机上看到的网页',
    pattern: adPatternPhone,
    channels: adChannelsMobile//Quest:这个Mobie指的是Appd的意思吧？因为Mobile也可能用网页打开
  },
  AndroidApp: {
    id:'4000',
    description: '在android手机上看到的App',
    pattern: adPatternPhone,
    channels: adChannelsMobile
  },
  AndroidWeb: {
    id:'5000',
    description: '在android手机上看到的网页',
    pattern: adPatternPhone,
    channels: adChannelsMobile
  },
  PadApp: {
    id:'6000',
    description: '在pad上看到的App',
    pattern: adPatternPad,
    channels: adChannelsMobile
  },
  PadWeb: {
    id:'7000',
    description: '在pad上看到的网页',
    pattern: adPatternPad,
    channels: adChannelsMobile
  }
}