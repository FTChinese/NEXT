/* exported adPatternsPhone */
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
            description:'列表页顶部的带状广告。'
        },
        Num2: {
            id:'02',
            description:'列表页底部的带状广告。'
        },
        StoryNum1:{
            id:'51',
            description:'文章页顶部的带状广告。'
        },
        StoryNum2: {
            id:'52',
            description:'文章页底部的带状广告。'
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
            description:'列表页从上至下第1个MPU位。'
        },
        Middle2:{
            id:'02',
            description:'列表页从上至下第2个MPU位。'
        },
        StoryMiddle1:{
            id:'51',
            description:'文章页从上至下第1个MPU位。'
        },
        StoryMiddle2:{
            id:'52',
            description:'文章页从上至下第2个MPU位。'
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