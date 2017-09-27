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
    channels: adChannelsMobile
  },
  iPhoneWeb: {
    id:'3000',
    description: '在iPhone手机上看到的网页',
    pattern: adPatternPhone,
    channels: adChannelsMobile
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
};
console.log(adDevices.PC.id);
