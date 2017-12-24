/* exported adChannelsPC, adChannelsMobile */
var adChannelsPC = {
  Home: {
    id:'10',
    title:'首页',
    sub:{
      Home: {
        id:'00',
        title:'首页'
      }
    }
  },
  China: {
    id:'11',
    title:'中国',
    sub: {
      Home: {
        id:'00',
        title:'首页'
      },
      PoliticalEconomy: {
        id:'01',
        title:'政经'
      },
      SocietyCuture: {
        id:'02',
        title:'社会与文化'
      },
      Commerce: {
        id:'03',
        title:'商业'
      },
      FinanceMkt: {
        id:'04',
        title:'金融市场'
      },
      StockMkt: {
        id:'05',
        title:'股市'
      },
      RealEstate:{
        id:'06',
        title:'房地产'
      }
    }
  },
  Global: {
    id:'12',
    title:'全球',
    sub:{
      Home: {
        id:'00',
        title:'首页'
      },
      US: {
        id:'01',
        title:'美国'
      },
      UK: {
        id:'02',
        title:'英国'
      },
      Asia: {
        id:'03',
        title:'亚太'
      },
      Europe: {
        id:'04',
        title:'欧洲'
      },
      America: {
        id:'05',
        title:'美洲'
      },
      Africa: {
        id:'06',
        title:'非洲'
      }
    }
  },
  Economy: {
    id:'13',
    title:'经济',
    sub:{
      Home: {
        id:'00',
        title:'首页'
      },
      GlobalEconomy: {
        id:'01',
        title:'全球经济'
      },
      ChinaEconomy: {
        id:'02',
        title:'中国经济'
      },
      Trade: {
        id:'03',
        title:'贸易'
      },
      Environment: {
        id:'04',
        title:'环境'
      },
      EconomyForecast: {
        id:'05',
        title:'经济展望'
      }
    }
  },
  FinanceMarket: {
    id:'14',
    title:'金融市场',
    sub:{
      Home: {
        id:'00',
        title:'首页'
      },
      Stock: {
        id:'01',
        title:'股市'
      },
      Forex: {
        id:'02',
        title:'外汇'
      },
      Bondmarket: {
        id:'03',
        title:'债市'
      },
      BulkCommodity: {
        id:'04',
        title:'大宗商品'
      }
    }
  },
  Business: {
    id:'15',
    title:'商业',
    sub:{
      Home: {
        id:'00',
        title:'首页'
      },
      Finance: {
        id:'01',
        title:'金融'
      },
      Technology: {
        id:'02',
        title:'科技'
      },
      Auto: {
        id:'03',
        title:'汽车'
      },
      RealEstate: {
        id:'04',
        title:'房地产'
      },
      Agriculture: {
        id:'05',
        title:'农林'
      },
      Energy: {
        id:'06',
        title:'能源'
      },
      IndustryAndMining: {
        id:'07',
        title:'工业和采矿'
      },
      AviationAndTransport: {
        id:'08',
        title:'航空和运输'
      },
      Medication: {
        id:'09',
        title:'医药'
      },
      Entertainment: {
        id:'10',
        title:'娱乐'
      },
      Consuming: {
        id:'11',
        title:'零售和消费品'
      },
      MediaAndCulture: {
        id:'12',
        title:'传媒与文化'
      }
    }
  },
  Opinion: {
    id:'16',
    title:'观点',
    sub:{
      Home: {
        id:'00',
        title:'首页'
      }
    }
  },
  Management: {
    id:'17',
    title:'管理',
    sub:{
      Home: {
        id:'00',
        title:'首页'
      },
      BizSchool: {
        id:'01',
        title:'FT商学院'
      },
      Career: {
        id:'02',
        title:'职场'
      },
      Leadership: {
        id:'03',
        title:'领导力'
      },
      WealthManagement: {
        id:'04',
        title:'财富管理'
      },
      CommerenceInter:{
        id:'05',
        title:'商务互联'
      }
    }
  },
  Lifestyle: {
    id:'18',
    title:'生活时尚',
    sub:{
      Home:{
        id:'00',
        title:'首页'
      },
      LeShang: {
        id:'01',
        title:'乐尚街'
      },
      Travel: {
        id:'02',
        title:'旅行'
      },
      FoodAndWine: {
        id:'03',
        title:'美酒与美食'
      }
    }
  },
  Video: {
    id:'19',
    title:'视频',
    sub:{
      Home:{
        id:'00',
        title:'首页'
      },
      ColorGlass:{
        id:'01',
        title:'有色眼镜'
      }
    }
  },
  Innovation: {
    id:'21',
    title:'创新经济',
    sub:{
      Home: {
        id:'00',
        title:'首页'
      }
    }
  },
  // MARK:以上10-20都为正规传统频道页；以下50开头的为其他频道及内容（包括特别报道专题等），对应之前大表的20开头频道；20-50为预留频道，预留给之后新增的正式频道
  OtherPage: {
    id:'50',
    title:'其他频道及内容页',
    sub:{
      Home:{
        id:'00',
        title:'首页'
      },
      NineToFive:{
        id:'01',
        title:'朝九晚五'
      },
      AnnualReport: {
        id:'02',
        title:'年度报告'
      },
      BOAO: {
        id:'03',
        title:'博鳌'
      },
      ArtInvestment: {
        id:'04',
        title:'艺术品投资'
      },
      G20_2: {
        id:'05',
        title:'G20_2'
      },
      PersonInthenews: {
        id:'06',
        title:'影响世界的人物'
      },
      Destinate: {
        id:'07',
        title:'商旅目的地'
      },
      Davos: {
        id:'08',
        title:'达沃斯'
      },
      PhotoNews: {
        id:'09',
        title:'图辑'
      },
      AutoShow: {
        id:'10',
        title:'车展'
      },
      WATT: {
        id:'11',
        title:'巅峰女性'
      },
      CityInFutrue: {
        id:'12',
        title:'城市未来'
      },
      LaunchWithFT: {
        id:'13',
        title:'与FT共进午餐'
      },
      FutureEnergy: {
        id:'14',
        title:'能源未来'
      },
      BusinessSport: {
        id:'15',
        title:'商务体育'
      },//17/18是首页测试_北京、内页测试——北京
      WomenintheNews: {
        id:'16',
        title:'焦点女性'
      },
      Market: {
        id:'19',
        title:'市场'
      },
      Conference: {
        id:'20',
        title:'会议'
      },//21(iPad),22(iPhone),23(Android),24(其他手机)
      TodayFocus: {
        id:'25',
        title:'今日焦点'
      },
      UpdateAfternoon: {
        id:'26',
        title:'午后更新'
      },
      WeeklySelection:{
        id:'27',
        title:'一周精选'
      },
      TwoSessions: {
        id:'28',
        title:'两会'
      },
      WatchAndJewellery: {
        id:'29',
        title:'腕表与珠宝'
      },
      G7: {
        id:'30',
        title:'G7峰会'
      },
      NewBackbone: {
        id:'31',
        title:'新中坚力量'
      },
      WorldIWalked: {
        id:'32',
        title:'我走过的世界'
      },
      ViewFromTheTop: {
        id:'33',
        title:'View From The Top'
      },
      LuxurySpending: {
        id:'34',
        title:'Luxury Spending'
      },//35(首页测试_上海)、36（内页测试_上海）、37（首页测试_海外）、38（内页测试_海外）
      JaneChateau: {
        id:'39',
        title:'简氏酒庄'
      },//40(View From The Top_iPad)/41(Android App)/(Android APP测试)
      
      Lifestyle_Art: {
        id:'43',
        title:'生活时尚_艺术与娱乐'
      },
      Lifestyle_Taste: {
        id:'44',
        title:'生活时尚_品味'
      },
      Lifestyle_Life: {
        id:'45',
        title:'生活时尚_生活话题'
      },
      Lifestyle_Spend: {
        id:'46',
        title:'生活时尚_消费经'
      },
      Lifestyle_Money: {
        id:'47',
        title:'生活时尚_理财'
      },
      LuxuryAquatics: {
        id:'48',
        title:'奢华水上'
      },
      Politeness:{
        id:'49',
        title:'礼待天下'
      },
      FTIntelligence:{
        id:'50',
        title:'FT 研究院'
      },
      TheFuture: {
        id:'51',
        title:'全球商业的未来'
      },
      PerfectLife: {
        id:'52',
        title:'极致人生'
      },//53:移动端测试
      MemberInfo: {
        id:'54',
        title:'会员信息中心'
      },
      InvestUA: {
        id:'55',
        title:'投资英国'
      },
      SmartCity: {
        id:'56',
        title:'智能城市'
      },
      StorageWorld: {
        id:'57',
        title:'存储世界'
      },
      Survey: {
        id:'58',
        title:'调研页频道'
      },//59(iPhone测试页)、60（Android测试页）
      TencentWe: {
        id:'61',
        title:'Tencent-we'
      },
      OutLook:{
        id:'62',
        title:'展望'
      },
      AfternoonTeaWithFT: {
        id:'63',
        title:'与FT共进下午茶'
      },//59(iPhone测试页)、60（Android测试页）
      Brics2017: {
        id:'64',
        title:'金砖五国峰会'
      },
      BadNews: {
        id:'65',
        title:'Bad News'
      }
    }
  },
};

var adChannelsMobile = {
  Home: {
    id:'10',
    title:'首页',
    sub:{
      Home: {
        id:'00',
        title:'首页'
      }
    }
  },
  China: {
    id:'11',
    title:'中国',
    sub: {
      Home: {
        id:'00',
        title:'首页'
      },
    }
  },
  Global: {
    id:'12',
    title:'全球',
    sub:{
      Home: {
        id:'00',
        title:'首页'
      }
    }
  },
  Economy: {
    id:'13',
    title:'经济',
    sub:{
      Home: {
        id:'00',
        title:'首页'
      }
    }
  },
  FinanceMarket: {
    id:'14',
    title:'金融市场',
    sub:{
      Home: {
        id:'00',
        title:'首页'
      }
    }
  },
  Business: {
    id:'15',
    title:'商业',
    sub:{
      Home: {
        id:'00',
        title:'首页'
      }
    }
  },
  Opinion: {
    id:'16',
    title:'观点',
    sub:{
      Home: {
        id:'00',
        title:'首页'
      }
    }
  },
  Management: {
    id:'17',
    title:'管理',
    sub:{
      Home: {
        id:'00',
        title:'首页'
      }
    }
  },
  Lifestyle: {
    id:'18',
    title:'生活时尚',
    sub:{
      Home:{
        id:'00',
        title:'首页'
      }
    }
  },
  Video: {
    id:'19',
    title:'视频',
    sub:{
      Home:{
        id:'00',
        title:'首页'
      }
    }
  },
  Innovation: {
    id:'20',
    title:'创新经济',
    sub:{
      Home: {
        id:'00',
        title:'首页'
      }
    }
  },
  // MARK:以上10-20都为正规传统频道页；以下50开头的为其他频道及内容（包括特别报道专题等），对应之前大表的20开头频道；20-50为预留频道，预留给之后新增的正式频道
  OtherPage: {
    id:'50',
    title:'其他频道及内容页',
    sub:{
      Home:{
        id:'00',
        title:'首页'
      },
      AnnualReport: {
        id:'02',
        title:'年度报告'
      },
      BOAO: {
        id:'03',
        title:'博鳌'
      },
      G20_2: {
        id:'05',
        title:'G20_2'
      },
      Davos: {
        id:'08',
        title:'达沃斯'
      },
      PhotoNews: {
        id:'09',
        title:'图辑'
      },
      LaunchWithFT: {
        id:'13',
        title:'与FT共进午餐'
      },
      TwoSessions: {
        id:'28',
        title:'两会'
      },
      WatchAndJewellery: {
        id:'29',
        title:'腕表与珠宝'
      },
      NewBackbone: {
        id:'31',
        title:'新中坚力量'
      },
      LuxuryAquatics: {
        id:'48',
        title:'奢华水上'
      },
      Politeness:{
        id:'49',
        title:'礼待天下'
      },
      FTIntelligence:{
        id:'50',
        title:'FT 研究院'
      },
      TheFuture: {
        id:'51',
        title:'全球商业的未来'
      },
      PerfectLife: {
        id:'52',
        title:'极致人生'
      },
      InvestUA: {
        id:'55',
        title:'投资英国'
      },
      SmartCity: {
        id:'56',
        title:'智能城市'
      },
      StorageWorld: {
        id:'57',
        title:'存储世界'
      },
      TencentWe: {
        id:'61',
        title:'Tencent-we'
      },
      AfternoonTeaWithFT: {
        id:'63',
        title:'与FT共进下午茶'
      },
      Brics2017: {
        id:'64',
        title:'金砖五国峰会'
      }
    }
  }
};
