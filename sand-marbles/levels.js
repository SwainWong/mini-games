/* Fifteen composed maps. Solutions live only in test fixtures. */
(function(root,factory){const levels=factory();if(typeof module==='object')module.exports=levels;else root.SandLevels=levels;})(globalThis,()=>{const levels=[
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
    "note": "盗宝人已经开挖！留意矿车位置，赶快疏通沙路。",
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
    "mechanics": {
      "rival": {
        "speed": 22
      }
    },
    "features": [
      "rival"
    ],
    "budget": {
      "three": 438,
      "two": 634
    }
  },
  {
    "id": 3,
    "title": "双泉汇流",
    "note": "盗宝人已经开挖！留意矿车位置，赶快疏通沙路。",
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
      "porter": true,
      "rival": {
        "speed": 22
      }
    },
    "features": [
      "porter",
      "rival"
    ],
    "budget": {
      "three": 386,
      "two": 558
    }
  },
  {
    "id": 4,
    "title": "石岛回廊",
    "note": "盗宝人已经开挖！留意矿车位置，赶快疏通沙路。",
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
      "porter": true,
      "rival": {
        "speed": 22
      }
    },
    "features": [
      "porter",
      "rival"
    ],
    "budget": {
      "three": 337,
      "two": 487
    }
  },
  {
    "id": 5,
    "title": "两岸连桥",
    "note": "盗宝人已经开挖！留意矿车位置，赶快疏通沙路。",
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
          "x": 300,
          "y": 465,
          "range": 48,
          "depth": 25,
          "speed": 41,
          "angle": 0.45
        },
        {
          "x": 355,
          "y": 490,
          "range": 48,
          "depth": 33,
          "speed": 47,
          "angle": 2.7
        }
      ],
      "rival": {
        "speed": 22
      }
    },
    "features": [
      "porter",
      "worm",
      "rival"
    ],
    "budget": {
      "three": 459,
      "two": 664
    }
  },
  {
    "id": 6,
    "title": "三层峡谷",
    "note": "盗宝人已经开挖！留意矿车位置，赶快疏通沙路。",
    "chapter": "地下奇遇",
    "difficulty": "挑战",
    "jars": [
      {
        "x": 104,
        "color": "amber"
      },
      {
        "x": 275,
        "color": "jade"
      },
      {
        "x": 456,
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
      "porter": true,
      "rival": {
        "speed": 25
      },
      "worms": [
        {
          "x": 225,
          "y": 400,
          "range": 48,
          "depth": 25,
          "speed": 42,
          "angle": 0.45
        },
        {
          "x": 450,
          "y": 390,
          "range": 48,
          "depth": 33,
          "speed": 48,
          "angle": 2.7
        }
      ]
    },
    "features": [
      "porter",
      "rival",
      "worm"
    ],
    "budget": {
      "three": 560,
      "two": 811
    }
  },
  {
    "id": 7,
    "title": "回旋长廊",
    "note": "盗宝人已经开挖！留意矿车位置，赶快疏通沙路。",
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
          "x": 205,
          "y": 350,
          "range": 48,
          "depth": 25,
          "speed": 43,
          "angle": 0.45
        },
        {
          "x": 280,
          "y": 440,
          "range": 48,
          "depth": 33,
          "speed": 49,
          "angle": 2.7
        }
      ],
      "rival": {
        "speed": 25
      }
    },
    "features": [
      "porter",
      "worm",
      "rival"
    ],
    "budget": {
      "three": 479,
      "two": 693
    }
  },
  {
    "id": 8,
    "title": "斜切双谷",
    "note": "盗宝人已经开挖！留意矿车位置，赶快疏通沙路。",
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
      "porter": true,
      "rival": {
        "speed": 25
      },
      "worms": [
        {
          "x": 250,
          "y": 350,
          "range": 48,
          "depth": 25,
          "speed": 44,
          "angle": 0.45
        },
        {
          "x": 440,
          "y": 345,
          "range": 48,
          "depth": 33,
          "speed": 50,
          "angle": 2.7
        }
      ]
    },
    "features": [
      "porter",
      "rival",
      "worm"
    ],
    "budget": {
      "three": 466,
      "two": 674
    }
  },
  {
    "id": 9,
    "title": "四叶错层",
    "note": "盗宝人已经开挖！留意矿车位置，赶快疏通沙路。",
    "chapter": "地下奇遇",
    "difficulty": "挑战",
    "jars": [
      {
        "x": 104,
        "color": "amber"
      },
      {
        "x": 221,
        "color": "jade"
      },
      {
        "x": 338,
        "color": "blue"
      },
      {
        "x": 456,
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
      "porter": true,
      "rival": {
        "speed": 25
      },
      "worms": [
        {
          "x": 220,
          "y": 250,
          "range": 48,
          "depth": 25,
          "speed": 45,
          "angle": 0.45
        },
        {
          "x": 460,
          "y": 305,
          "range": 48,
          "depth": 33,
          "speed": 51,
          "angle": 2.7
        }
      ]
    },
    "features": [
      "porter",
      "rival",
      "worm"
    ],
    "budget": {
      "three": 715,
      "two": 1035
    }
  },
  {
    "id": 10,
    "title": "断崖双泉",
    "note": "盗宝人已经开挖！留意矿车位置，赶快疏通沙路。",
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
      "porter": true,
      "rival": {
        "speed": 25
      },
      "worms": [
        {
          "x": 210,
          "y": 430,
          "range": 60,
          "depth": 25,
          "speed": 46,
          "angle": 0.45
        },
        {
          "x": 255,
          "y": 515,
          "range": 60,
          "depth": 18,
          "speed": 52,
          "angle": 2.7
        },
        {
          "x": 260,
          "y": 110,
          "range": 60,
          "depth": 25,
          "speed": 46,
          "angle": 0.45
        }
      ],
      "porterRange": 65
    },
    "features": [
      "porter",
      "rival",
      "worm"
    ],
    "budget": {
      "three": 545,
      "two": 789
    }
  },
  {
    "id": 11,
    "title": "窄门分家",
    "note": "盗宝人已经开挖！留意矿车位置，赶快疏通沙路。",
    "chapter": "沙径大师",
    "difficulty": "大师",
    "jars": [
      {
        "x": 104,
        "color": "amber"
      },
      {
        "x": 285,
        "color": "jade"
      },
      {
        "x": 456,
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
          "x": 130,
          "y": 385,
          "range": 60,
          "depth": 25,
          "speed": 47,
          "angle": 0.45
        },
        {
          "x": 250,
          "y": 430,
          "range": 60,
          "depth": 33,
          "speed": 53,
          "angle": 2.7
        },
        {
          "x": 470,
          "y": 300,
          "range": 60,
          "depth": 25,
          "speed": 47,
          "angle": 0.45
        }
      ],
      "rival": {
        "speed": 28
      }
    },
    "features": [
      "porter",
      "worm",
      "rival"
    ],
    "budget": {
      "three": 629,
      "two": 910
    }
  },
  {
    "id": 12,
    "title": "倒挂花园",
    "note": "盗宝人已经开挖！留意矿车位置，赶快疏通沙路。",
    "chapter": "沙径大师",
    "difficulty": "大师",
    "jars": [
      {
        "x": 104,
        "color": "amber"
      },
      {
        "x": 280,
        "color": "jade"
      },
      {
        "x": 456,
        "color": "blue"
      }
    ],
    "groups": [
      {
        "x": 210,
        "y": 455,
        "color": "amber",
        "count": 5,
        "types": [
          "glass",
          "light",
          "heavy"
        ]
      },
      {
        "x": 205,
        "y": 265,
        "color": "jade",
        "count": 6,
        "types": [
          "glass",
          "light",
          "heavy"
        ]
      },
      {
        "x": 345,
        "y": 105,
        "color": "blue",
        "count": 6,
        "types": [
          "glass",
          "light",
          "heavy"
        ]
      },
      {
        "x": 475,
        "y": 455,
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
        "x": 170,
        "y": 350,
        "rx": 35,
        "ry": 32
      }
    ],
    "tunnels": [],
    "mechanics": {
      "porter": true,
      "rival": {
        "speed": 28
      },
      "worms": [
        {
          "x": 155,
          "y": 410,
          "range": 25,
          "depth": 22,
          "speed": 48,
          "angle": 0.45
        },
        {
          "x": 470,
          "y": 390,
          "range": 30,
          "depth": 25,
          "speed": 54,
          "angle": 2.7
        },
        {
          "x": 345,
          "y": 210,
          "range": 40,
          "depth": 22,
          "speed": 48,
          "angle": 0.45
        }
      ]
    },
    "features": [
      "porter",
      "rival",
      "worm"
    ],
    "budget": {
      "three": 657,
      "two": 951
    }
  },
  {
    "id": 13,
    "title": "地下回字湾",
    "note": "盗宝人已经开挖！留意矿车位置，赶快疏通沙路。",
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
          "x": 210,
          "y": 360,
          "range": 60,
          "depth": 25,
          "speed": 49,
          "angle": 0.45
        },
        {
          "x": 315,
          "y": 490,
          "range": 60,
          "depth": 33,
          "speed": 55,
          "angle": 2.7
        },
        {
          "x": 120,
          "y": 330,
          "range": 60,
          "depth": 25,
          "speed": 49,
          "angle": 0.45
        },
        {
          "x": 410,
          "y": 475,
          "range": 60,
          "depth": 33,
          "speed": 55,
          "angle": 2.7
        }
      ],
      "rival": {
        "speed": 28
      }
    },
    "features": [
      "porter",
      "worm",
      "rival"
    ],
    "budget": {
      "three": 552,
      "two": 799
    }
  },
  {
    "id": 14,
    "title": "彩珠织巢",
    "note": "盗宝人已经开挖！留意矿车位置，赶快疏通沙路。",
    "chapter": "沙径大师",
    "difficulty": "大师",
    "jars": [
      {
        "x": 104,
        "color": "amber"
      },
      {
        "x": 221,
        "color": "jade"
      },
      {
        "x": 338,
        "color": "blue"
      },
      {
        "x": 456,
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
      "porter": true,
      "rival": {
        "speed": 28
      },
      "worms": [
        {
          "x": 145,
          "y": 420,
          "range": 60,
          "depth": 25,
          "speed": 50,
          "angle": 0.45
        },
        {
          "x": 425,
          "y": 420,
          "range": 60,
          "depth": 33,
          "speed": 56,
          "angle": 2.7
        },
        {
          "x": 80,
          "y": 275,
          "range": 60,
          "depth": 25,
          "speed": 50,
          "angle": 0.45
        },
        {
          "x": 440,
          "y": 220,
          "range": 60,
          "depth": 33,
          "speed": 56,
          "angle": 2.7
        }
      ]
    },
    "features": [
      "porter",
      "rival",
      "worm"
    ],
    "budget": {
      "three": 805,
      "two": 1165
    }
  },
  {
    "id": 15,
    "title": "搬运大乱斗",
    "note": "盗宝人已经开挖！留意矿车位置，赶快疏通沙路。",
    "chapter": "沙径大师",
    "difficulty": "大师",
    "jars": [
      {
        "x": 104,
        "color": "amber"
      },
      {
        "x": 221,
        "color": "jade"
      },
      {
        "x": 338,
        "color": "blue"
      },
      {
        "x": 456,
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
          "x": 130,
          "y": 435,
          "range": 60,
          "depth": 25,
          "speed": 51,
          "angle": 0.45
        },
        {
          "x": 405,
          "y": 415,
          "range": 60,
          "depth": 33,
          "speed": 57,
          "angle": 2.7
        },
        {
          "x": 85,
          "y": 255,
          "range": 60,
          "depth": 25,
          "speed": 51,
          "angle": 0.45
        },
        {
          "x": 460,
          "y": 255,
          "range": 60,
          "depth": 33,
          "speed": 57,
          "angle": 2.7
        }
      ],
      "rival": {
        "speed": 28
      }
    },
    "features": [
      "porter",
      "worm",
      "rival"
    ],
    "budget": {
      "three": 797,
      "two": 1154
    }
  }
];
  const targets=[40,80,80,80,90,120,70,100,150,130,150,170,160,230,260];
  const durations=[45,45,50,50,50,55,55,60,60,60,65,65,70,70,75];
  const crew=[0,0,0,0,0,0,0,0,0,1,1,3,2,4,4];
  const loot={6:[[225,365,20]],7:[[205,250,20]],8:[[185,460,20],[450,410,20]],9:[[155,475,20],[365,420,20]],10:[[420,295,20]],11:[[275,385,20],[495,415,20]],12:[[260,380,20],[445,300,20]],13:[[270,420,20],[420,255,30]],14:[[210,510,20],[420,420,20]],15:[[220,360,20],[440,350,20],[120,190,30]]};
  const bombs={11:[[415,340,1]],14:[[245,155,0]],15:[[300,165,0],[310,360,1]]};
  for(const [i,level]of levels.entries()){
    if(level.id===8){Object.assign(level.rocks[0],{x:380,y:320,rx:58,ry:42});Object.assign(level.mechanics.worms[1],{x:455,y:420});}
    level.targetScore=targets[i];level.timeLimit=durations[i];level.mechanics.crewCount=crew[i];
    if(level.mechanics.rival)level.mechanics.rival.speed=i<5?30:i<10?34:38;
    level.treasures=(loot[level.id]||[]).map(([x,y,points])=>({x,y,points,r:16,kind:points===30?'chest':'bag'}));
    level.bombs=(bombs[level.id]||[]).map(([x,y,rock])=>({pad:{x,y},rock,fuseSeconds:1.8}));
    // One new concept per stage. Major actors get two practice stages between debuts.
    if(level.id<4)delete level.mechanics.rival;
    if(level.id<7)delete level.mechanics.worms;
    if(!crew[i])delete level.mechanics.porter;
    for(const group of level.groups)group.types=(group.types||['glass']).map(type=>
      type==='heavy'&&level.id<5||type==='rubber'&&level.id<8||type==='light'&&level.id<14?'glass':type);
    level.features=level.features.filter(id=>id==='rival'?!!level.mechanics.rival:id==='worm'?!!level.mechanics.worms?.length:id==='porter'?crew[i]>0:true);
    level.note=`同色入车 +10，接错不扣分。${durations[i]} 秒内争取高分，${targets[i]} 分为过关门槛。`;
  }
  return levels;
});
