/* exported adPatternsPad */
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
                description:'列表页右侧从上至下第1个MPU位。'
            },
            Right2: {
                id:'12',
                description:'列表页右侧从上至下第2个MPU位。'
            },
            StoryRight1: {
                id:'61',
                description:'文章页右侧从上至下第1个MPU位。'
            },
            StoryRight2: {
                id:'62',
                description:'文章页右侧从上至下第2个MPU位。'
            }
        }
    }
};