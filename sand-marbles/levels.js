/* Fifteen individually composed maps. Solutions live only in test fixtures. */
(function(root,factory){const levels=factory();if(typeof module==='object')module.exports=levels;else root.SandLevels=levels;})(globalThis,()=>([
  {
    "id": 1,
    "title": "斜坡初体验",
    "note": "划开沙土，让同色珠子回家。",
    "chapter": "初识沙径",
    "difficulty": "入门",
    "jars": [
      {
        "x": 405,
        "color": "amber"
      }
    ],
    "groups": [
      {
        "x": 135,
        "y": 130,
        "color": "amber",
        "count": 6,
        "types": [
          "glass"
        ]
      }
    ],
    "rocks": [],
    "tunnels": [],
    "mechanics": {},
    "features": [],
    "budget": {
      "three": 268,
      "two": 388
    }
  },
  {
    "id": 2,
    "title": "高低两路",
    "note": "划开沙土，让同色珠子回家。",
    "chapter": "初识沙径",
    "difficulty": "入门",
    "jars": [
      {
        "x": 130,
        "color": "amber"
      },
      {
        "x": 425,
        "color": "blue"
      }
    ],
    "groups": [
      {
        "x": 235,
        "y": 330,
        "color": "amber",
        "count": 5,
        "types": [
          "glass"
        ]
      },
      {
        "x": 120,
        "y": 110,
        "color": "blue",
        "count": 6,
        "types": [
          "glass"
        ]
      }
    ],
    "rocks": [
      {
        "x": 260,
        "y": 450,
        "rx": 40,
        "ry": 35
      }
    ],
    "tunnels": [],
    "mechanics": {},
    "features": [],
    "budget": {
      "three": 438,
      "two": 634
    }
  },
  {
    "id": 3,
    "title": "双泉汇流",
    "note": "搬运工来帮倒忙了：罐子回来前，接珠盘会暂存珠子。",
    "chapter": "初识沙径",
    "difficulty": "进阶",
    "jars": [
      {
        "x": 280,
        "color": "jade"
      }
    ],
    "groups": [
      {
        "x": 85,
        "y": 300,
        "color": "jade",
        "count": 5,
        "types": [
          "glass"
        ]
      },
      {
        "x": 450,
        "y": 110,
        "color": "jade",
        "count": 6,
        "types": [
          "glass"
        ]
      }
    ],
    "rocks": [
      {
        "x": 240,
        "y": 250,
        "rx": 62,
        "ry": 48
      },
      {
        "x": 380,
        "y": 470,
        "rx": 48,
        "ry": 30
      }
    ],
    "tunnels": [],
    "mechanics": {
      "porter": true
    },
    "features": [
      "porter"
    ],
    "budget": {
      "three": 386,
      "two": 558
    }
  },
  {
    "id": 4,
    "title": "石岛回廊",
    "note": "搬运工来帮倒忙了：罐子回来前，接珠盘会暂存珠子。",
    "chapter": "初识沙径",
    "difficulty": "进阶",
    "jars": [
      {
        "x": 120,
        "color": "amber"
      },
      {
        "x": 450,
        "color": "blue"
      }
    ],
    "groups": [
      {
        "x": 250,
        "y": 125,
        "color": "amber",
        "count": 6,
        "types": [
          "glass",
          "heavy"
        ]
      },
      {
        "x": 360,
        "y": 445,
        "color": "blue",
        "count": 5,
        "types": [
          "glass",
          "heavy"
        ]
      }
    ],
    "rocks": [
      {
        "x": 245,
        "y": 330,
        "rx": 100,
        "ry": 76
      }
    ],
    "tunnels": [],
    "mechanics": {
      "porter": true
    },
    "features": [
      "porter"
    ],
    "budget": {
      "three": 337,
      "two": 487
    }
  },
  {
    "id": 5,
    "title": "两岸连桥",
    "note": "蚯蚓正在打洞，搬运工正在喘气。今天的地下可真热闹。",
    "chapter": "初识沙径",
    "difficulty": "进阶",
    "jars": [
      {
        "x": 165,
        "color": "amber"
      },
      {
        "x": 430,
        "color": "blue"
      }
    ],
    "groups": [
      {
        "x": 270,
        "y": 355,
        "color": "amber",
        "count": 6,
        "types": [
          "glass",
          "heavy"
        ]
      },
      {
        "x": 85,
        "y": 110,
        "color": "blue",
        "count": 6,
        "types": [
          "glass",
          "heavy"
        ]
      }
    ],
    "rocks": [
      {
        "x": 285,
        "y": 290,
        "rx": 70,
        "ry": 26
      }
    ],
    "tunnels": [],
    "mechanics": {
      "porter": true,
      "worms": [
        {
          "x": 220,
          "y": 395,
          "range": 30,
          "depth": 20,
          "speed": 0.62
        }
      ]
    },
    "features": [
      "porter",
      "worm"
    ],
    "budget": {
      "three": 459,
      "two": 664
    }
  },
  {
    "id": 6,
    "title": "三层峡谷",
    "note": "罐子太重啦！搬运工走走停停，接珠盘会等他回来。",
    "chapter": "地下奇遇",
    "difficulty": "挑战",
    "jars": [
      {
        "x": 95,
        "color": "amber"
      },
      {
        "x": 275,
        "color": "jade"
      },
      {
        "x": 465,
        "color": "blue"
      }
    ],
    "groups": [
      {
        "x": 185,
        "y": 465,
        "color": "amber",
        "count": 4,
        "types": [
          "glass",
          "heavy"
        ]
      },
      {
        "x": 150,
        "y": 295,
        "color": "jade",
        "count": 5,
        "types": [
          "glass",
          "heavy"
        ]
      },
      {
        "x": 100,
        "y": 110,
        "color": "blue",
        "count": 6,
        "types": [
          "glass",
          "heavy"
        ]
      }
    ],
    "rocks": [
      {
        "x": 350,
        "y": 310,
        "rx": 60,
        "ry": 47
      }
    ],
    "tunnels": [],
    "mechanics": {
      "porter": true
    },
    "features": [
      "porter"
    ],
    "budget": {
      "three": 560,
      "two": 811
    }
  },
  {
    "id": 7,
    "title": "回旋长廊",
    "note": "蚯蚓正在打洞，搬运工正在喘气。今天的地下可真热闹。",
    "chapter": "地下奇遇",
    "difficulty": "挑战",
    "jars": [
      {
        "x": 105,
        "color": "blue"
      }
    ],
    "groups": [
      {
        "x": 445,
        "y": 120,
        "color": "blue",
        "count": 6,
        "types": [
          "glass",
          "rubber"
        ]
      },
      {
        "x": 420,
        "y": 375,
        "color": "blue",
        "count": 3,
        "types": [
          "glass",
          "rubber"
        ]
      }
    ],
    "rocks": [
      {
        "x": 340,
        "y": 300,
        "rx": 80,
        "ry": 52
      },
      {
        "x": 335,
        "y": 525,
        "rx": 45,
        "ry": 25
      }
    ],
    "tunnels": [],
    "mechanics": {
      "porter": true,
      "worms": [
        {
          "x": 220,
          "y": 410,
          "range": 35,
          "depth": 20,
          "speed": 0.62
        }
      ]
    },
    "features": [
      "porter",
      "worm"
    ],
    "budget": {
      "three": 479,
      "two": 693
    }
  },
  {
    "id": 8,
    "title": "斜切双谷",
    "note": "罐子太重啦！搬运工走走停停，接珠盘会等他回来。",
    "chapter": "地下奇遇",
    "difficulty": "挑战",
    "jars": [
      {
        "x": 435,
        "color": "amber"
      },
      {
        "x": 120,
        "color": "blue"
      }
    ],
    "groups": [
      {
        "x": 90,
        "y": 120,
        "color": "amber",
        "count": 6,
        "types": [
          "glass",
          "rubber"
        ]
      },
      {
        "x": 260,
        "y": 380,
        "color": "blue",
        "count": 6,
        "types": [
          "glass",
          "rubber"
        ]
      }
    ],
    "rocks": [
      {
        "x": 280,
        "y": 295,
        "rx": 85,
        "ry": 36
      }
    ],
    "tunnels": [],
    "mechanics": {
      "porter": true
    },
    "features": [
      "porter"
    ],
    "budget": {
      "three": 466,
      "two": 674
    }
  },
  {
    "id": 9,
    "title": "四叶错层",
    "note": "罐子太重啦！搬运工走走停停，接珠盘会等他回来。",
    "chapter": "地下奇遇",
    "difficulty": "挑战",
    "jars": [
      {
        "x": 70,
        "color": "amber"
      },
      {
        "x": 210,
        "color": "jade"
      },
      {
        "x": 350,
        "color": "blue"
      },
      {
        "x": 490,
        "color": "rose"
      }
    ],
    "groups": [
      {
        "x": 80,
        "y": 515,
        "color": "amber",
        "count": 3,
        "types": [
          "glass",
          "rubber"
        ]
      },
      {
        "x": 70,
        "y": 390,
        "color": "jade",
        "count": 4,
        "types": [
          "glass",
          "rubber"
        ]
      },
      {
        "x": 140,
        "y": 260,
        "color": "blue",
        "count": 5,
        "types": [
          "glass",
          "rubber"
        ]
      },
      {
        "x": 100,
        "y": 110,
        "color": "rose",
        "count": 6,
        "types": [
          "glass",
          "rubber"
        ]
      }
    ],
    "rocks": [],
    "tunnels": [],
    "mechanics": {
      "porter": true
    },
    "features": [
      "porter"
    ],
    "budget": {
      "three": 715,
      "two": 1035
    }
  },
  {
    "id": 10,
    "title": "断崖双泉",
    "note": "罐子太重啦！搬运工走走停停，接珠盘会等他回来。",
    "chapter": "地下奇遇",
    "difficulty": "挑战",
    "jars": [
      {
        "x": 110,
        "color": "amber"
      },
      {
        "x": 450,
        "color": "blue"
      }
    ],
    "groups": [
      {
        "x": 385,
        "y": 110,
        "color": "amber",
        "count": 5,
        "types": [
          "glass",
          "light",
          "heavy"
        ]
      },
      {
        "x": 170,
        "y": 365,
        "color": "amber",
        "count": 3,
        "types": [
          "glass",
          "light",
          "heavy"
        ]
      },
      {
        "x": 380,
        "y": 230,
        "color": "blue",
        "count": 5,
        "types": [
          "glass",
          "light",
          "heavy"
        ]
      },
      {
        "x": 335,
        "y": 425,
        "color": "blue",
        "count": 3,
        "types": [
          "glass",
          "light",
          "heavy"
        ]
      }
    ],
    "rocks": [
      {
        "x": 260,
        "y": 320,
        "rx": 90,
        "ry": 60
      }
    ],
    "tunnels": [],
    "mechanics": {
      "porter": true
    },
    "features": [
      "porter"
    ],
    "budget": {
      "three": 545,
      "two": 789
    }
  },
  {
    "id": 11,
    "title": "窄门分家",
    "note": "蚯蚓正在打洞，搬运工正在喘气。今天的地下可真热闹。",
    "chapter": "沙径大师",
    "difficulty": "大师",
    "jars": [
      {
        "x": 100,
        "color": "amber"
      },
      {
        "x": 285,
        "color": "jade"
      },
      {
        "x": 470,
        "color": "blue"
      }
    ],
    "groups": [
      {
        "x": 220,
        "y": 115,
        "color": "amber",
        "count": 6,
        "types": [
          "glass",
          "light",
          "heavy"
        ]
      },
      {
        "x": 345,
        "y": 300,
        "color": "jade",
        "count": 6,
        "types": [
          "glass",
          "light",
          "heavy"
        ]
      },
      {
        "x": 430,
        "y": 155,
        "color": "blue",
        "count": 6,
        "types": [
          "glass",
          "light",
          "heavy"
        ]
      }
    ],
    "rocks": [
      {
        "x": 260,
        "y": 250,
        "rx": 65,
        "ry": 48
      },
      {
        "x": 375,
        "y": 440,
        "rx": 55,
        "ry": 65
      }
    ],
    "tunnels": [],
    "mechanics": {
      "porter": true,
      "worms": [
        {
          "x": 255,
          "y": 400,
          "range": 38,
          "depth": 20,
          "speed": 0.62
        }
      ]
    },
    "features": [
      "porter",
      "worm"
    ],
    "budget": {
      "three": 629,
      "two": 910
    }
  },
  {
    "id": 12,
    "title": "倒挂花园",
    "note": "罐子太重啦！搬运工走走停停，接珠盘会等他回来。",
    "chapter": "沙径大师",
    "difficulty": "大师",
    "jars": [
      {
        "x": 100,
        "color": "amber"
      },
      {
        "x": 280,
        "color": "jade"
      },
      {
        "x": 465,
        "color": "blue"
      }
    ],
    "groups": [
      {
        "x": 225,
        "y": 440,
        "color": "amber",
        "count": 5,
        "types": [
          "glass",
          "light",
          "heavy"
        ]
      },
      {
        "x": 165,
        "y": 275,
        "color": "jade",
        "count": 6,
        "types": [
          "glass",
          "light",
          "heavy"
        ]
      },
      {
        "x": 75,
        "y": 110,
        "color": "blue",
        "count": 6,
        "types": [
          "glass",
          "light",
          "heavy"
        ]
      },
      {
        "x": 420,
        "y": 440,
        "color": "blue",
        "count": 3,
        "types": [
          "glass",
          "light",
          "heavy"
        ]
      }
    ],
    "rocks": [
      {
        "x": 350,
        "y": 330,
        "rx": 57,
        "ry": 30
      }
    ],
    "tunnels": [],
    "mechanics": {
      "porter": true
    },
    "features": [
      "porter"
    ],
    "budget": {
      "three": 657,
      "two": 951
    }
  },
  {
    "id": 13,
    "title": "地下回字湾",
    "note": "蚯蚓正在打洞，搬运工正在喘气。今天的地下可真热闹。",
    "chapter": "沙径大师",
    "difficulty": "大师",
    "jars": [
      {
        "x": 430,
        "color": "amber"
      },
      {
        "x": 130,
        "color": "blue"
      }
    ],
    "groups": [
      {
        "x": 85,
        "y": 110,
        "color": "amber",
        "count": 9,
        "types": [
          "glass",
          "heavy",
          "rubber",
          "light"
        ]
      },
      {
        "x": 390,
        "y": 350,
        "color": "blue",
        "count": 9,
        "types": [
          "glass",
          "heavy",
          "rubber",
          "light"
        ]
      }
    ],
    "rocks": [
      {
        "x": 270,
        "y": 290,
        "rx": 90,
        "ry": 30
      }
    ],
    "tunnels": [],
    "mechanics": {
      "porter": true,
      "worms": [
        {
          "x": 235,
          "y": 405,
          "range": 22,
          "depth": 12,
          "speed": 0.62
        }
      ]
    },
    "features": [
      "porter",
      "worm"
    ],
    "budget": {
      "three": 552,
      "two": 799
    }
  },
  {
    "id": 14,
    "title": "彩珠织巢",
    "note": "罐子太重啦！搬运工走走停停，接珠盘会等他回来。",
    "chapter": "沙径大师",
    "difficulty": "大师",
    "jars": [
      {
        "x": 70,
        "color": "amber"
      },
      {
        "x": 210,
        "color": "jade"
      },
      {
        "x": 350,
        "color": "blue"
      },
      {
        "x": 490,
        "color": "rose"
      }
    ],
    "groups": [
      {
        "x": 150,
        "y": 105,
        "color": "amber",
        "count": 6,
        "types": [
          "glass",
          "heavy",
          "rubber",
          "light"
        ]
      },
      {
        "x": 325,
        "y": 100,
        "color": "rose",
        "count": 6,
        "types": [
          "glass",
          "heavy",
          "rubber",
          "light"
        ]
      },
      {
        "x": 200,
        "y": 330,
        "color": "jade",
        "count": 6,
        "types": [
          "glass",
          "heavy",
          "rubber",
          "light"
        ]
      },
      {
        "x": 380,
        "y": 335,
        "color": "blue",
        "count": 6,
        "types": [
          "glass",
          "heavy",
          "rubber",
          "light"
        ]
      },
      {
        "x": 255,
        "y": 440,
        "color": "jade",
        "count": 3,
        "types": [
          "glass",
          "heavy",
          "rubber",
          "light"
        ]
      }
    ],
    "rocks": [
      {
        "x": 275,
        "y": 250,
        "rx": 95,
        "ry": 50
      }
    ],
    "tunnels": [],
    "mechanics": {
      "porter": true
    },
    "features": [
      "porter"
    ],
    "budget": {
      "three": 805,
      "two": 1165
    }
  },
  {
    "id": 15,
    "title": "搬运大乱斗",
    "note": "蚯蚓正在打洞，搬运工正在喘气。今天的地下可真热闹。",
    "chapter": "沙径大师",
    "difficulty": "大师",
    "jars": [
      {
        "x": 75,
        "color": "amber"
      },
      {
        "x": 210,
        "color": "jade"
      },
      {
        "x": 350,
        "color": "blue"
      },
      {
        "x": 485,
        "color": "rose"
      }
    ],
    "groups": [
      {
        "x": 225,
        "y": 105,
        "color": "amber",
        "count": 6,
        "types": [
          "glass",
          "heavy",
          "rubber",
          "light"
        ]
      },
      {
        "x": 355,
        "y": 105,
        "color": "rose",
        "count": 6,
        "types": [
          "glass",
          "heavy",
          "rubber",
          "light"
        ]
      },
      {
        "x": 115,
        "y": 335,
        "color": "jade",
        "count": 6,
        "types": [
          "glass",
          "heavy",
          "rubber",
          "light"
        ]
      },
      {
        "x": 385,
        "y": 310,
        "color": "blue",
        "count": 6,
        "types": [
          "glass",
          "heavy",
          "rubber",
          "light"
        ]
      },
      {
        "x": 180,
        "y": 475,
        "color": "jade",
        "count": 3,
        "types": [
          "glass",
          "heavy",
          "rubber",
          "light"
        ]
      },
      {
        "x": 425,
        "y": 455,
        "color": "blue",
        "count": 3,
        "types": [
          "glass",
          "heavy",
          "rubber",
          "light"
        ]
      }
    ],
    "rocks": [
      {
        "x": 270,
        "y": 245,
        "rx": 85,
        "ry": 50
      },
      {
        "x": 275,
        "y": 465,
        "rx": 28,
        "ry": 63
      }
    ],
    "tunnels": [],
    "mechanics": {
      "porter": true,
      "worms": [
        {
          "x": 145,
          "y": 398,
          "range": 23,
          "depth": 25,
          "speed": 0.62
        },
        {
          "x": 405,
          "y": 420,
          "range": 18,
          "depth": 20,
          "speed": 0.62
        }
      ]
    },
    "features": [
      "porter",
      "worm"
    ],
    "budget": {
      "three": 797,
      "two": 1154
    }
  }
]));
