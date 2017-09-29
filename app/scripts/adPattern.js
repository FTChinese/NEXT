/* exported adPatternsPC, adPatternsPhone, adPatternsPad */
var adPatternsPC = {
  FullScreen: {
    id:'01',
    description:'进入网站后时首先看到的大块全屏广告。',
    position:{
      Num1:{
        id:'01',
        description:'进入网站后时的FullScreen位。'
      }
    }
  },
  Leaderboard: {
    id:'02',
    description:'页面上部导航栏下方的长带状广告。此处的页面包括首页、频道页、文章页。',
    container: 'banner',
    width: '969',
    height: '90',
    position:{
      Num1: {
        id:'01',
        description:'页面上部导航栏下方的Leaderboard位。'
      }
    }
  },
  Banner: {
    id:'03',
    description:'页面中部穿插的长带状广告（页面导航栏下方的长带状广告除外，其叫做LeaderBoard，见上）。此处的页面包括首页、频道页、文章页。从上到下顺序出现。',
    container: 'banner',
    width: '969',
    height: '90',
    position:{
      Num1:{
        id:'01',
        description:'页面从上至下第1个Banner位。'
      },
      Num2:{
        id:'02',
        description:'页面从上至下第2个Banner位。'
      },
      Num3:{
        id:'03',
        description:'页面从上至下第3个Banner位。'
      }
    } 
  },
  MPU: {
    id:'04',
    description:'页面中的块状广告。此处的页面包含首页、频道页、文章页。可能出现的位置包括两种：右侧侧边栏从上至下排列；页面正文由上至下穿插',
    width: '300',
    height: '250',
    container: 'mpu',
    position:{
      Right1: {
        id:'11',
        description:'页面右侧从上至下第1个MPU位。'
      },
      Right2: {
        id:'12',
        description:'页面右侧从上至下第2个MPU位。'
      },
      Middle1: {
        id:'21',
        description:'页面正文中间穿插的第1个MPU位。'
      },
      Middle2: {
        id:'22',
        description:'页面正文中间穿插的第2个MPU位。'
      }
    }  
  },
  Ribbon: {
    id:'05',
    description:'首页右侧栏顶部的端带状广告。',
    width: '100%',
    height: '90',
    position:{
      Num1: {
        id:'01',
        description:'首页右侧栏顶部Ribbon位.'
      }
    }
  },
  TextLink: {
    id:'06',
    description:'首页右侧栏的文字链广告。',
    position:{
      Num1: {
        id:'01',
        description:'页面右侧栏从上至下第1个TextLink位。'
      },
      Num2: {
        id:'02',
        description:'页面右侧栏从上至下第2个TextLink位。'
      },
      Num3: {
        id:'03',
        description:'页面右侧栏从上至下第3个TextLink位。'
      }
    }
  },
  Event: {
    id:'07',
    description:'首页“会员活动”部分的会员活动广告。出现顺序为：根据网页大小响应式从左至右、从上至下排列。',
    position:{
      Num1:{
        id:'01',
        description:'首页“会员活动”部分第1个Event位'
      },
      Num2:{
        id:'02',
        description:'首页“会员活动”部分第2个Event位'
      },
      Num3:{
        id:'03',
        description:'首页“会员活动”部分第3个Event位'
      },
      Num4:{
        id:'04',
        description:'首页“会员活动”部分第4个Event位'
      }
    }
  },
  Inread: {
    id:'09',
    description:'文章页中嵌入的、随着阅读位置的改变而出现的广告',
    position:{
      Num1: {
        id:'01',
        description:'文章页中的第1个Inread位。'
      },
      Num2: {
        id:'02',
        description:'文章页中的第2个Inread位。'
      }
    }
  }
};

var adPatternsPhone = {
  FullScreen: {
    id:'01',
    description:'进入手机App时看到的全屏广告。',
    position:{
      Web: {
        id:'01',
        description:'以网页形式投放的全屏广告。'
      },
      Native: {
        id:'02',
        description:'以原生形式投放的全屏广告。'
      }
    }
  },
  Banner: {
    id:'03',
    description:'手机端页面顶部、底部的带状广告。',
    container: 'banner',
    position:{
      Num1:{
        id:'01',
        description:'手机端页面顶部的带状广告。'
      },
      Num2: {
        id:'02',
        description:'手机端页面底部的带状广告。'
      }
    } 
  },
  MPU: {
    id:'04',
    description:'页面中的块状广告。由上至下穿插。',
    width: '300',
    height: '250',
    container: 'mpu',
    position:{
      Middle1:{
        id:'01',
        description:'页面从上至下第1个MPU位。'
      },
      Middle2:{
        id:'02',
        description:'页面从上至下第2个MPU位。'
      }
    } 
  },
  Information: {
    id:'08',
    description:'首页文章列表中嵌入的信息流广告。',
    position: {
      Num1: {
        id:'01',
        description:'从上至下第1个Information位'
      },
      Num2: {
        id:'02',
        description:'从上至下第2个Information位'
      }
    }
  }
};

var adPatternsPad = {
  FullScreen: {
    id:'01',
    description:'进入pad端App时看到的大块全屏广告。',
    position:{
      Web:  {
        id:'01',
        description:'pad端网页形式的FullScreen位。'
      },
      Native: {
        id:'02',
        description:'pad端原生形式的FullScreen位。'
      }
    }
  },
  MPU: {
    id:'04',
    description:'页面右上角的块状广告。此处的页面包含首页、频道页、文章页。',
    width: '300',
    height: '250',
    container: 'mpu',
    position:{
      Right1: {
        id:'11',
        description:'页面右侧从上至下第1个MPU位。'
      },
      Right2: {
        id:'12',
        description:'页面右侧从上至下第2个MPU位。'
      }
    }
  }
};

// console.log(adPatternsPC.FullScreen.id);
// console.log(adPatternsPhone.FullScreen.id);
// console.log(adPatternsPad.FullScreen.id);