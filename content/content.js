// content/content.js — single source of all visible text (EN + Traditional Chinese)
// Owner: Person A. Chinese narration = draft translation, please proofread.
const CONTENT = {
  "meta": {
    "title": {
      "en": "Tudigong's Neighborhood: Local Guardian and Community Life",
      "zh": "土地公的街坊：地方守護與社區生活"
    },
    "shortTitle": {
      "en": "Tudigong's Neighborhood",
      "zh": "土地公的街坊"
    },
    "subtitle": {
      "en": "Local Guardian and Community Life",
      "zh": "地方守護與社區生活"
    },
    "coreQuestion": {
      "en": "Why do we often find Tudigong near street corners, fields, markets, and settlements in Taiwan?",
      "zh": "為什麼在臺灣，我們常在街角、田邊、市場與聚落附近看到土地公？"
    },
    "statement": {
      "en": "This experience uses Tudigong belief in Taiwan as cultural learning material. It focuses on local culture, community life, AR interaction, bilingual expression, and digital humanities learning. It does not simulate worship, divination, or blessing rituals.",
      "zh": "本體驗以臺灣土地公信仰作為文化學習素材，聚焦在地文化、社區生活、AR 互動、雙語表達與數位人文學習，不模擬祭拜、擲筊或祈福儀式。"
    }
  },
  "common": {
    "next": {
      "en": "Next",
      "zh": "下一步"
    },
    "back": {
      "en": "Back",
      "zh": "返回"
    },
    "close": {
      "en": "Close",
      "zh": "關閉"
    },
    "language": {
      "en": "Language",
      "zh": "語言"
    },
    "langModes": {
      "bi": {
        "en": "Bilingual",
        "zh": "雙語"
      },
      "en": {
        "en": "English",
        "zh": "英文"
      },
      "zh": {
        "en": "中文",
        "zh": "中文"
      }
    },
    "rotate": {
      "en": "Please rotate your device",
      "zh": "請將裝置橫放"
    },
    "coreInquiry": {
      "en": "Core Inquiry",
      "zh": "核心提問"
    },
    "tryAgainHint": {
      "en": "Not yet. Look at the hint and try again.",
      "zh": "還差一點，看看提示再試一次。"
    },
    "conceptualMap": {
      "en": "Conceptual map, not a historical record",
      "zh": "示意地圖，非歷史實測"
    },
    "continueNoAR": {
      "en": "Continue without AR",
      "zh": "不使用 AR 繼續"
    },
    "pointBack": {
      "en": "Point the camera back at the card",
      "zh": "將鏡頭對準文化卡"
    },
    "undo": {
      "en": "Undo",
      "zh": "復原"
    },
    "comingSoon": {
      "en": "This page is planned for a later milestone. Tap Next to continue.",
      "zh": "此頁將於後續階段完成，請點選「下一步」繼續。"
    },
    "observed": {
      "en": "Observed",
      "zh": "已觀察"
    },
    "readMore": {
      "en": "Tap to read",
      "zh": "點一下閱讀"
    },
    "listen": {
      "en": "Listen to narration",
      "zh": "聆聽旁白"
    },
    "pause": {
      "en": "Pause narration",
      "zh": "暫停旁白"
    },
    "audioSoon": {
      "en": "Narration coming soon",
      "zh": "旁白即將上線"
    },
    "fullScreen": {
      "en": "Full screen",
      "zh": "全螢幕"
    },
    "showPanel": {
      "en": "Show panel",
      "zh": "顯示面板"
    },
    "skip": {
      "en": "Skip",
      "zh": "略過"
    },
    "zoomIn": {
      "en": "Zoom in",
      "zh": "放大"
    },
    "zoomOut": {
      "en": "Zoom out",
      "zh": "縮小"
    },
    "resetView": {
      "en": "Reset view",
      "zh": "重設視角"
    },
    "musicOn": {
      "en": "Music on",
      "zh": "音樂開啟"
    },
    "musicOff": {
      "en": "Music off",
      "zh": "音樂關閉"
    },
    "touchEarth": {
      "en": "Touch the earth",
      "zh": "輕觸大地"
    }
  },
  "p01": {
    "eyebrow": {
      "en": "P01 · Home",
      "zh": "P01 · 首頁"
    },
    "heading": {
      "en": "Entry Page",
      "zh": "入口頁"
    },
    "tags": [
      {
        "en": "AR",
        "zh": "AR"
      },
      {
        "en": "Bilingual",
        "zh": "雙語"
      },
      {
        "en": "Digital Humanities",
        "zh": "數位人文"
      },
      {
        "en": "Place-based",
        "zh": "在地學習"
      }
    ],
    "start": {
      "en": "Start Experience",
      "zh": "開始體驗"
    },
    "menu": {
      "about": {
        "en": "About Tudigong Culture",
        "zh": "認識土地公文化"
      },
      "map": {
        "en": "Community Culture Map",
        "zh": "社區文化地圖"
      },
      "objects": {
        "en": "Local Cultural Objects",
        "zh": "在地文化物件"
      },
      "howTo": {
        "en": "How to Use",
        "zh": "使用說明"
      }
    },
    "menuShort": {
      "about": {
        "en": "About",
        "zh": "認識"
      },
      "map": {
        "en": "Map",
        "zh": "地圖"
      },
      "objects": {
        "en": "Objects",
        "zh": "物件"
      },
      "howTo": {
        "en": "How to",
        "zh": "說明"
      }
    },
    "info": {
      "about": {
        "en": "Tudigong, also called Fude Zhengshen, is a common local guardian in Taiwanese folk belief. In this experience we study Tudigong as part of local culture: land, farming, neighborhoods, markets, and community memory.",
        "zh": "土地公又稱福德正神，是臺灣民間信仰中常見的地方守護神。在這個體驗中，我們把土地公當作地方文化的一部分來認識：土地、農業、街坊、市場與社區記憶。"
      },
      "map": {
        "en": "A community culture map shows everyday places and how they are connected. You will build your own map later in the journey.",
        "zh": "社區文化地圖呈現日常場所以及它們之間的連結。旅程後段你會建立自己的地圖。"
      },
      "objects": {
        "en": "You will observe a small temple, an offering table, stone lions, and an old tree as parts of a cultural landscape.",
        "zh": "你將觀察小廟、供桌、石獅與老樹，認識它們如何成為文化地景的一部分。"
      }
    },
    "narration": {
      "en": "Welcome to Tudigong's Neighborhood: Local Guardian and Community Life. This AR bilingual experience begins with one question: Why do we often find Tudigong near street corners, fields, markets, and settlements in Taiwan? Starting from Kaohsiung's local living spaces, we will explore the connections among land, community, and local memory.",
      "zh": "歡迎來到「土地公的街坊：地方守護與社區生活」。這個雙語 AR 體驗從一個問題開始：為什麼在臺灣，我們常在街角、田邊、市場與聚落附近看到土地公？我們將從高雄在地的生活空間出發，探索土地、社區與地方記憶之間的連結。"
    }
  },
  "p02": {
    "eyebrow": {
      "en": "P02 · Enter AR",
      "zh": "P02 · 進入 AR"
    },
    "heading": {
      "en": "Scan Activation",
      "zh": "掃描啟動"
    },
    "states": {
      "idle": {
        "en": "Scan the Tudigong Culture Card",
        "zh": "掃描土地公文化卡"
      },
      "scanning": {
        "en": "Scanning, please wait",
        "zh": "掃描中，請稍候"
      },
      "found": {
        "en": "Scan Complete",
        "zh": "掃描完成"
      },
      "loading": {
        "en": "Starting the camera…",
        "zh": "正在啟動相機…"
      },
      "lost": {
        "en": "Point the camera back at the card",
        "zh": "將鏡頭對準文化卡"
      }
    },
    "foundToast": {
      "en": "Card found! A 3D neighborhood rises from the card. Move your device around it.",
      "zh": "找到文化卡了！立體街坊從卡片上升起，移動裝置從不同角度看看。"
    },
    "noCamera": {
      "en": "This device or browser cannot use the camera here. Open the HTTPS link on a phone or tablet, or continue without AR.",
      "zh": "此裝置或瀏覽器無法在這裡使用相機。請用手機或平板開啟 HTTPS 連結，或不使用 AR 繼續。"
    },
    "targetMissing": {
      "en": "The AR card file is missing (assets/targets/tudigong-card.mind). Ask Person B to add it, or continue without AR.",
      "zh": "缺少 AR 卡片檔案（assets/targets/tudigong-card.mind）。請負責 AR 的組員加入，或不使用 AR 繼續。"
    },
    "noARdone": {
      "en": "You can continue without AR. Later pages work as normal screens.",
      "zh": "你可以不使用 AR 繼續，後面的頁面會以一般畫面呈現。"
    },
    "scanAgain": {
      "en": "Scan Again",
      "zh": "重新掃描"
    },
    "task": {
      "en": "Scan the culture card",
      "zh": "掃描文化卡"
    },
    "hintSlow": {
      "en": "Hold the card flat, in good light, 20–30 cm from the camera.",
      "zh": "將卡片平放、光線充足，距離鏡頭 20–30 公分。"
    },
    "cameraError": {
      "en": "Camera is not available. Allow camera access in your browser settings, then tap Scan Again.",
      "zh": "無法使用相機。請在瀏覽器設定中允許相機權限，再點選「重新掃描」。"
    },
    "narration": {
      "en": "Please scan the Tudigong culture card. After a successful scan, stories of Kaohsiung neighborhoods, farming life, markets, local cultural objects, and community life will appear in AR.",
      "zh": "請掃描土地公文化卡。掃描成功後，高雄街坊、農業生活、市場、在地文化物件與社區生活的故事，將以 AR 的方式出現在你眼前。"
    }
  },
  "p03": {
    "eyebrow": {
      "en": "P03 · How to Use",
      "zh": "P03 · 使用說明"
    },
    "heading": {
      "en": "How to Use",
      "zh": "使用說明"
    },
    "tiles": [
      {
        "icon": "hand-tap",
        "label": {
          "en": "Tap Objects",
          "zh": "點選物件"
        },
        "desc": {
          "en": "Tap places and objects to read culture notes.",
          "zh": "點選地點與物件，閱讀文化小知識。"
        }
      },
      {
        "icon": "map-trifold",
        "label": {
          "en": "Explore the Neighborhood",
          "zh": "探索街坊"
        },
        "desc": {
          "en": "Move around the community map.",
          "zh": "瀏覽社區地圖。"
        }
      },
      {
        "icon": "hand-grabbing",
        "label": {
          "en": "Drag Cards",
          "zh": "拖曳卡片"
        },
        "desc": {
          "en": "Drag a card onto the right place.",
          "zh": "把卡片拖到正確的位置。"
        }
      },
      {
        "icon": "sliders-horizontal",
        "label": {
          "en": "Compare Past and Present",
          "zh": "比較過去與現在"
        },
        "desc": {
          "en": "Slide the timeline to see change.",
          "zh": "滑動時間軸，看見改變。"
        }
      },
      {
        "icon": "puzzle-piece",
        "label": {
          "en": "Match Cultural Meanings",
          "zh": "配對文化意義"
        },
        "desc": {
          "en": "Connect objects with their meanings.",
          "zh": "把物件與文化意義配對。"
        }
      },
      {
        "icon": "cards",
        "label": {
          "en": "Match Words",
          "zh": "配對詞彙"
        },
        "desc": {
          "en": "Match English and Chinese terms.",
          "zh": "配對中英文詞彙。"
        }
      }
    ],
    "gotIt": {
      "en": "Got It",
      "zh": "我知道了"
    },
    "task": {
      "en": "Read the instructions",
      "zh": "閱讀說明"
    },
    "tapHint": {
      "en": "Tap a card to see the gesture.",
      "zh": "點一下卡片，看看手勢示範。"
    },
    "narration": {
      "en": "You can tap cultural objects, explore a community map, drag daily-life cards, compare past and present land use, and complete cultural matching and bilingual vocabulary tasks. Each task will help you answer the core inquiry question.",
      "zh": "你可以點選文化物件、探索社區地圖、拖曳日常生活卡片、比較過去與現在的土地利用，並完成文化配對與雙語詞彙任務。每一項任務都能幫助你回答核心提問。"
    }
  },
  "p04": {
    "eyebrow": {
      "en": "P04 · Introduction",
      "zh": "P04 · 導論"
    },
    "heading": {
      "en": "Why Is Tudigong Often Close to Everyday Life?",
      "zh": "為什麼土地公常在日常生活附近？"
    },
    "nodes": {
      "temple": {
        "label": {
          "en": "Find the Small Temple",
          "zh": "找找小廟"
        },
        "note": {
          "en": "Many Tudigong temples are small and sit inside neighborhoods. Even a small temple can be an important local landmark.",
          "zh": "許多土地公廟規模不大，就位在社區之中；即使是小廟，也可能是重要的地方地標。"
        }
      },
      "fields": {
        "label": {
          "en": "Look at the Fields",
          "zh": "看看田野"
        },
        "note": {
          "en": "Tudigong culture has long been connected with land and farming life. Some small temples stand near fields.",
          "zh": "土地公文化長期與土地和農業生活相關，有些小廟就位在田邊。"
        }
      },
      "market": {
        "label": {
          "en": "Visit the Market",
          "zh": "逛逛市場"
        },
        "note": {
          "en": "Markets are busy centers of community life, and local business culture is also part of Tudigong traditions.",
          "zh": "市場是社區生活熱鬧的中心，在地商業文化也是土地公傳統的一部分。"
        }
      },
      "corner": {
        "label": {
          "en": "Explore the Street Corner",
          "zh": "探索街角"
        },
        "note": {
          "en": "Roads and people meet at a street corner. A small temple here can become a meeting point and a landmark.",
          "zh": "街角是道路與人們交會之處；這裡的小廟可能成為集合點與地標。"
        }
      }
    },
    "task": {
      "en": "Observe at least 3 places",
      "zh": "觀察至少 3 個地點"
    },
    "tapPins": {
      "en": "Tap the glowing pins on the map.",
      "zh": "點選地圖上閃動的圖釘。"
    },
    "spinHint": {
      "en": "Drag to turn the neighborhood. Pinch or scroll to zoom. Tap the glowing pins.",
      "zh": "拖曳可旋轉街坊，雙指或滾輪可縮放，點選閃動的圖釘。"
    },
    "complete": {
      "en": "Great observing! You can go on.",
      "zh": "觀察得很好！可以繼續了。"
    },
    "chips": [
      {
        "en": "Local Guardian",
        "zh": "地方守護"
      },
      {
        "en": "Cultural Landscape",
        "zh": "文化地景"
      }
    ],
    "narration": {
      "en": "Starting from Kaohsiung's neighborhoods, fields, markets, and settlements, we can find many cultural traces of Tudigong. Tudigong, also known as Fude Zhengshen, is a common local guardian in Taiwanese folk belief. Small temples and cultural landscapes also record how people use land, build communities, and create local memory.",
      "zh": "從高雄的街坊、田野、市場與聚落出發，我們可以找到許多土地公的文化痕跡。土地公又稱福德正神，是臺灣民間信仰中常見的地方守護神。小廟與文化地景，也記錄了人們如何利用土地、建立社區，並創造地方記憶。"
    }
  },
  "p05": {
    "eyebrow": {
      "en": "P05 · Scene 1",
      "zh": "P05 · 場景一"
    },
    "heading": {
      "en": "Street-Corner Temple: A Cultural Node in Community Life",
      "zh": "街角小廟：社區生活的文化節點"
    },
    "cards": {
      "residential": {
        "en": "Residential Area",
        "zh": "住宅區"
      },
      "road": {
        "en": "Road",
        "zh": "道路"
      },
      "market": {
        "en": "Market",
        "zh": "市場"
      },
      "temple": {
        "en": "Small Temple",
        "zh": "小廟"
      }
    },
    "explore": {
      "en": "Explore the Street Corner",
      "zh": "探索街角"
    },
    "tapTemple": {
      "en": "Tap the small temple to mark it as a Community Node",
      "zh": "點選小廟，將它標記為社區節點"
    },
    "node": {
      "en": "Community Node",
      "zh": "社區節點"
    },
    "hints": {
      "residential": {
        "en": "Look for the zone with rows of houses.",
        "zh": "找找有一排排房子的區域。"
      },
      "road": {
        "en": "Look for the street that runs between the buildings.",
        "zh": "找找建築物之間的那條街道。"
      },
      "market": {
        "en": "Look for the striped awnings.",
        "zh": "找找有條紋遮陽棚的地方。"
      },
      "temple": {
        "en": "Look for the small red-tile roof.",
        "zh": "找找紅瓦小屋頂。"
      }
    },
    "task1": {
      "en": "Place all 4 cards",
      "zh": "放好 4 張卡片"
    },
    "task2": {
      "en": "Mark the Community Node",
      "zh": "標記社區節點"
    },
    "complete": {
      "en": "Community Task Complete",
      "zh": "社區任務完成"
    },
    "dragHint": {
      "en": "Drag each card to its place on the map, or tap a card and then a circle.",
      "zh": "把每張卡片拖到地圖上的位置，或先點卡片再點圓圈。"
    },
    "placed": {
      "en": "Placed",
      "zh": "已放好"
    },
    "nodeNote": {
      "en": "Homes, the street and the market all meet near the small temple. That makes it a landmark and a meeting point for the neighborhood.",
      "zh": "住家、街道與市場都在小廟附近交會，讓它成為街坊的地標與聚集點。"
    },
    "chips": [
      {
        "en": "Local Temple",
        "zh": "地方廟宇／小廟"
      },
      {
        "en": "Neighborhood",
        "zh": "街坊／社區"
      }
    ],
    "narration": {
      "en": "In Kaohsiung and many places in Taiwan, a Tudigong temple does not have to be large. Some are found at street corners, beside roads, or inside neighborhoods. Besides being places of belief, these small temples can also become local landmarks and cultural points connected with community memory.",
      "zh": "在高雄與臺灣許多地方，土地公廟不一定很大。有些位在街角、路旁，或就在社區之中。這些小廟除了是信仰的場所，也可能成為地方地標，以及與社區記憶相連的文化據點。"
    }
  },
  "p06": {
    "eyebrow": {
      "en": "P06 · Scene 2",
      "zh": "P06 · 場景二"
    },
    "heading": {
      "en": "From Fields to Neighborhoods: How Does Land Use Change?",
      "zh": "從田野到街坊：土地利用如何改變？"
    },
    "past": {
      "en": "Past",
      "zh": "過去"
    },
    "present": {
      "en": "Present",
      "zh": "現在"
    },
    "pastAndPresent": {
      "en": "Past and Present",
      "zh": "過去與現在"
    },
    "layers": {
      "fields": {
        "en": "Fields",
        "zh": "田地"
      },
      "settlement": {
        "en": "Settlement",
        "zh": "聚落"
      },
      "homes": {
        "en": "Homes",
        "zh": "住家"
      },
      "business": {
        "en": "Local Businesses",
        "zh": "在地商家"
      }
    },
    "compare": {
      "en": "Compare Land Use",
      "zh": "比較土地利用"
    },
    "findClues": {
      "en": "Find Cultural Clues",
      "zh": "尋找文化線索"
    },
    "clueNote": {
      "en": "The land around it changed, but the small temple stayed in or near its earlier place. Places like this keep cultural memory.",
      "zh": "周圍的土地改變了，小廟仍留在原處或附近。這樣的地方保存了文化記憶。"
    },
    "task1": {
      "en": "Slide from Past to Present",
      "zh": "從過去滑到現在"
    },
    "task2": {
      "en": "Select a Cultural Clue",
      "zh": "選出一個文化線索"
    },
    "narration": {
      "en": "Tudigong culture has long been connected with fields, settlements, and life on the land. As parts of Kaohsiung have changed, some fields have become roads, homes, or business areas, while some small temples have remained in or near their earlier locations. Comparing past and present maps can help us read local change and cultural memory.",
      "zh": "土地公文化長久以來與田野、聚落以及土地上的生活緊密相連。隨著高雄部分地區的變遷，有些田地變成了道路、住家或商業區，而有些小廟仍留在原本的位置或附近。比較過去與現在的地圖，可以幫助我們解讀地方的變化與文化記憶。"
    }
  },
  "p07": {
    "eyebrow": {
      "en": "P07 · Scene 3",
      "zh": "P07 · 場景三"
    },
    "heading": {
      "en": "Cultural Objects and Landscape",
      "zh": "文化物件與地景"
    },
    "objects": {
      "temple": {
        "label": {
          "en": "Small Temple",
          "zh": "小廟"
        },
        "tap": {
          "en": "Tap the Small Temple",
          "zh": "點選小廟"
        },
        "meaning": {
          "en": "A local landmark and community node",
          "zh": "地方地標與社區節點"
        }
      },
      "table": {
        "label": {
          "en": "Offering Table",
          "zh": "供桌"
        },
        "tap": {
          "en": "Tap the Offering Table",
          "zh": "點選供桌"
        },
        "meaning": {
          "en": "Shows local life and festival preparation",
          "zh": "呈現地方生活與節慶準備"
        }
      },
      "lions": {
        "label": {
          "en": "Stone Lions",
          "zh": "石獅"
        },
        "tap": {
          "en": "Tap the Stone Lions",
          "zh": "點選石獅"
        },
        "meaning": {
          "en": "A symbol connected with temple architecture",
          "zh": "與廟宇建築相關的象徵"
        }
      },
      "tree": {
        "label": {
          "en": "Old Tree",
          "zh": "老樹"
        },
        "tap": {
          "en": "Observe the Old Tree",
          "zh": "觀察老樹"
        },
        "meaning": {
          "en": "Part of the cultural landscape and local memory",
          "zh": "文化地景與地方記憶的一部分"
        }
      }
    },
    "match": {
      "en": "Match Cultural Meanings",
      "zh": "配對文化意義"
    },
    "task1": {
      "en": "Observe at least 3 objects",
      "zh": "觀察至少 3 個物件"
    },
    "task2": {
      "en": "Match the meanings",
      "zh": "完成意義配對"
    },
    "complete": {
      "en": "Object Task Complete",
      "zh": "物件任務完成"
    },
    "narration": {
      "en": "When we observe a Tudigong temple, we can look beyond the deity image and study the building and its surroundings. The small temple, offering table, stone lions, and—where the local context supports it—old trees may all become part of a cultural landscape.",
      "zh": "觀察土地公廟時，我們可以把目光放到神像以外，看看建築本身與周圍的環境。小廟、供桌、石獅，以及在地方脈絡相符時的老樹，都可能成為文化地景的一部分。"
    }
  },
  "p08": {
    "eyebrow": {
      "en": "P08 · Scene 4",
      "zh": "P08 · 場景四"
    },
    "heading": {
      "en": "From Kaohsiung to My Neighborhood",
      "zh": "從高雄到我的街坊"
    },
    "open": {
      "en": "Open Kaohsiung Community Map",
      "zh": "打開高雄社區地圖"
    },
    "nodes": {
      "school": {
        "en": "School",
        "zh": "學校"
      },
      "homes": {
        "en": "Homes",
        "zh": "住家"
      },
      "market": {
        "en": "Market",
        "zh": "市場"
      },
      "park": {
        "en": "Park and Old Tree",
        "zh": "公園與老樹"
      },
      "temple": {
        "en": "Local Temple",
        "zh": "地方廟宇"
      },
      "oldStreet": {
        "en": "Old Street",
        "zh": "老街"
      }
    },
    "buildRoute": {
      "en": "Build a Cultural Route",
      "zh": "建立文化路線"
    },
    "finishRoute": {
      "en": "Finish Route",
      "zh": "完成路線"
    },
    "task1": {
      "en": "Place at least 4 places",
      "zh": "放上至少 4 個地點"
    },
    "task2": {
      "en": "Connect a route",
      "zh": "連成一條路線"
    },
    "reflect": {
      "en": "Which places in your neighborhood belong on a community culture map?",
      "zh": "你的街坊中，哪些地方應該出現在社區文化地圖上？"
    },
    "narration": {
      "en": "Local culture does not exist in only one building. Starting with a simplified community culture map of Kaohsiung, we can see how schools, homes, markets, parks, old trees, and local temples form everyday living spaces. Then think about your own neighborhood: which places belong on a community culture map?",
      "zh": "地方文化並不只存在於一棟建築之中。從一張簡化的高雄社區文化地圖開始，我們可以看到學校、住家、市場、公園、老樹與地方廟宇如何構成日常生活的空間。接著想一想你自己的社區：哪些地方應該出現在社區文化地圖上？"
    }
  },
  "p09": {
    "eyebrow": {
      "en": "P09 · Scene 5",
      "zh": "P09 · 場景五"
    },
    "heading": {
      "en": "Touya and Weiya: Tudigong Culture and the Rhythm of Everyday Life",
      "zh": "頭牙與尾牙：土地公文化與日常生活的節奏"
    },
    "terms": {
      "zuoya": {
        "label": {
          "en": "Zuoya",
          "zh": "做牙"
        },
        "learn": {
          "en": "Learn Zuoya",
          "zh": "認識做牙"
        },
        "answer": {
          "en": "The 2nd and 16th days of each lunar month",
          "zh": "每月農曆初二、十六"
        }
      },
      "touya": {
        "label": {
          "en": "Touya",
          "zh": "頭牙"
        },
        "learn": {
          "en": "Learn Touya",
          "zh": "認識頭牙"
        },
        "answer": {
          "en": "The 2nd day of the 2nd lunar month",
          "zh": "農曆二月初二"
        }
      },
      "weiya": {
        "label": {
          "en": "Weiya",
          "zh": "尾牙"
        },
        "learn": {
          "en": "Learn Weiya",
          "zh": "認識尾牙"
        },
        "answer": {
          "en": "The 16th day of the 12th lunar month, now also a year-end company meal",
          "zh": "農曆十二月十六，現在也指公司年終聚餐"
        }
      }
    },
    "matchCalendar": {
      "en": "Match the Calendar",
      "zh": "配對日期"
    },
    "chips": [
      {
        "en": "Local Business Culture",
        "zh": "在地商業文化"
      },
      {
        "en": "Everyday Language",
        "zh": "日常用語"
      }
    ],
    "complete": {
      "en": "Culture Match Complete",
      "zh": "文化配對完成"
    },
    "task": {
      "en": "Match all 3 terms",
      "zh": "完成 3 個詞彙配對"
    },
    "narration": {
      "en": "Traditionally, Taiwanese folk culture includes zuoya observances on the second and sixteenth days of each lunar month. The second day of the second lunar month is called Touya, while the sixteenth day of the twelfth lunar month is called Weiya. Over time, Weiya also became a common term for year-end company meals.",
      "zh": "傳統上，臺灣民間文化有在每個農曆月初二與十六「做牙」的習俗。農曆二月初二稱為「頭牙」，農曆十二月十六日則稱為「尾牙」。隨著時間演變，「尾牙」也成為公司年終聚餐的常見說法。"
    }
  },
  "p10": {
    "eyebrow": {
      "en": "P10 · Scene 6",
      "zh": "P10 · 場景六"
    },
    "heading": {
      "en": "Bogong in Meinong: One Belief, Different Local Expressions",
      "zh": "美濃的伯公：同一信仰，不同的在地表現"
    },
    "place": {
      "en": "Meinong, Kaohsiung",
      "zh": "高雄美濃"
    },
    "concepts": {
      "tudigong": {
        "label": {
          "en": "Tudigong",
          "zh": "土地公"
        },
        "meaning": {
          "en": "A common name in many places in Taiwan (Fude Zhengshen)",
          "zh": "臺灣許多地方常見的稱呼（福德正神）"
        }
      },
      "bogong": {
        "label": {
          "en": "Bogong",
          "zh": "伯公"
        },
        "meaning": {
          "en": "A Hakka name often used in Meinong",
          "zh": "美濃等客家社區常用的稱呼"
        }
      },
      "fuchang": {
        "label": {
          "en": "Fuchang Case",
          "zh": "福廠案例"
        },
        "meaning": {
          "en": "A culture-specific festival space or structure in Yong'an, Meinong. It is not another name for every Tudigong temple.",
          "zh": "美濃永安特定的節慶空間或結構，並非所有土地公廟的別稱。"
        }
      }
    },
    "localCulture": {
      "en": "Local Culture",
      "zh": "在地文化"
    },
    "compare": {
      "en": "Compare Cultural Expressions",
      "zh": "比較文化表現"
    },
    "complete": {
      "en": "Local Culture Task Complete",
      "zh": "在地文化任務完成"
    },
    "task": {
      "en": "Match all 3 concepts",
      "zh": "完成 3 個概念配對"
    },
    "credit": {
      "en": "Source: Kaohsiung Museum of History",
      "zh": "資料來源：高雄市立歷史博物館"
    },
    "narration": {
      "en": "In Hakka communities such as Meinong in Kaohsiung, Tudigong is often called Bogong. Local language, history, and community life have shaped distinctive Bogong traditions. In Meinong's Yong'an area, a fuchang is a culture-specific festival space or structure; it is not simply another name for every Tudigong temple.",
      "zh": "在高雄美濃等客家社區，土地公常被稱為「伯公」。在地的語言、歷史與社區生活，形塑出獨特的伯公傳統。在美濃永安地區，「福廠」是具有特定文化意義的節慶空間或結構，並不是所有土地公廟的另一個名稱。"
    }
  },
  "p11": {
    "eyebrow": {
      "en": "P11 · Ending",
      "zh": "P11 · 結尾"
    },
    "heading": {
      "en": "Introduce Tudigong and Community Culture in English",
      "zh": "用英文介紹土地公與社區文化"
    },
    "starters": [
      {
        "en": "I learned that…",
        "zh": "我學到…"
      },
      {
        "en": "Tudigong culture connects…",
        "zh": "土地公文化連結了…"
      },
      {
        "en": "Community culture includes…",
        "zh": "社區文化包含…"
      },
      {
        "en": "In Meinong, Bogong…",
        "zh": "在美濃，伯公…"
      }
    ],
    "frames": [
      {
        "en": "Tudigong culture connects ___ and ___.",
        "zh": "土地公文化連結了＿＿與＿＿。",
        "options": [
          {
            "en": "land",
            "zh": "土地",
            "ok": true
          },
          {
            "en": "farming life",
            "zh": "農業生活",
            "ok": true
          },
          {
            "en": "neighborhoods",
            "zh": "街坊",
            "ok": true
          },
          {
            "en": "communities",
            "zh": "社區",
            "ok": true
          },
          {
            "en": "cultural memory",
            "zh": "文化記憶",
            "ok": true
          }
        ]
      },
      {
        "en": "A neighborhood temple can be part of ___.",
        "zh": "街坊的小廟可以是＿＿的一部分。",
        "options": [
          {
            "en": "a cultural landscape",
            "zh": "文化地景",
            "ok": true
          },
          {
            "en": "a community map",
            "zh": "社區地圖",
            "ok": true
          },
          {
            "en": "Weiya",
            "zh": "尾牙",
            "ok": false,
            "hint": {
              "en": "Weiya is a date and a year-end meal.",
              "zh": "尾牙是日期，也指年終聚餐。"
            }
          }
        ]
      },
      {
        "en": "In Meinong, Tudigong is often called ___.",
        "zh": "在美濃，土地公常被稱為＿＿。",
        "options": [
          {
            "en": "Bogong",
            "zh": "伯公",
            "ok": true
          },
          {
            "en": "Fuchang",
            "zh": "福廠",
            "ok": false,
            "hint": {
              "en": "A fuchang is a festival space in Yong'an.",
              "zh": "福廠是永安的節慶空間。"
            }
          },
          {
            "en": "Touya",
            "zh": "頭牙",
            "ok": false,
            "hint": {
              "en": "Touya is a date in the lunar calendar.",
              "zh": "頭牙是農曆中的日子。"
            }
          }
        ]
      }
    ],
    "complete": {
      "en": "Complete the English Sentence",
      "zh": "完成英文句子"
    },
    "again": {
      "en": "Experience Again",
      "zh": "再體驗一次"
    },
    "feedback": {
      "en": "Give Feedback",
      "zh": "給予回饋"
    },
    "listen": {
      "en": "Listen",
      "zh": "聆聽"
    },
    "narration": {
      "en": "In this journey, we started from local living spaces in Kaohsiung and learned how Tudigong culture connects land, fields, street corners, markets, communities, and cultural memory. We also explored the local expression of Bogong culture in Meinong. Now, answer the core question in one English sentence.",
      "zh": "在這段旅程中，我們從高雄在地的生活空間出發，認識土地公文化如何連結土地、田野、街角、市場、社區與文化記憶，也探索了美濃伯公文化的在地表現。現在，請用一句英文回答核心提問。"
    }
  },
  "p12": {
    "eyebrow": {
      "en": "P12 · Project Information",
      "zh": "P12 · 專案資訊"
    },
    "heading": {
      "en": "You Completed the Journey",
      "zh": "你完成了這趟旅程"
    },
    "sections": {
      "story": {
        "en": "Story Introduction",
        "zh": "故事簡介"
      },
      "reading": {
        "en": "Further Reading",
        "zh": "延伸閱讀"
      },
      "words": {
        "en": "Words You Learned Today",
        "zh": "今日學到的詞彙"
      },
      "myMap": {
        "en": "My Community Culture Map",
        "zh": "我的社區文化地圖"
      },
      "canIntroduce": {
        "en": "I Can Introduce Local Culture",
        "zh": "我能介紹在地文化"
      },
      "teacher": {
        "en": "Teacher Questions",
        "zh": "教師提問"
      },
      "feedback": {
        "en": "User Feedback",
        "zh": "使用者回饋"
      }
    },
    "again": {
      "en": "Experience Again",
      "zh": "再體驗一次"
    },
    "home": {
      "en": "Back to Home",
      "zh": "回到首頁"
    },
    "submit": {
      "en": "Submit",
      "zh": "送出"
    },
    "thanks": {
      "en": "Thank you for your feedback!",
      "zh": "謝謝你的回饋！"
    },
    "studentPrompt": {
      "en": "What places in your neighborhood can tell a local story?",
      "zh": "你的街坊中，有哪些地方能說出在地故事？"
    },
    "teacherPrompt": {
      "en": "How can AR help students connect everyday places with local cultural memory?",
      "zh": "AR 如何幫助學生把日常場所與在地文化記憶連結起來？"
    },
    "badges": {
      "node": {
        "en": "Community Node",
        "zh": "社區節點"
      },
      "clue": {
        "en": "Clue Finder",
        "zh": "線索發現者"
      },
      "landscape": {
        "en": "Landscape Observer",
        "zh": "地景觀察員"
      },
      "route": {
        "en": "Route Builder",
        "zh": "路線設計師"
      },
      "calendar": {
        "en": "Calendar Matcher",
        "zh": "日期配對員"
      },
      "local": {
        "en": "Local Variation",
        "zh": "在地差異"
      },
      "speaker": {
        "en": "Culture Introducer",
        "zh": "文化介紹員"
      }
    },
    "narration": {
      "en": "You have completed a bilingual AR journey about Tudigong belief, life on the land, local communities, cultural landscapes, zuoya culture, and Bogong culture in Meinong. Return to the first question: why is Tudigong often found close to everyday life? One answer is that belief becomes connected with land use, community relationships, and local memory.",
      "zh": "你已完成一段雙語 AR 旅程，認識了土地公信仰、土地上的生活、地方社區、文化地景、做牙文化，以及美濃的伯公文化。回到最初的問題：為什麼土地公常出現在日常生活附近？其中一個答案是：信仰逐漸與土地利用、社區關係以及地方記憶連結在一起。"
    }
  },
  "vocab": [
    {
      "en": "Tudigong (Fude Zhengshen)",
      "zh": "土地公／福德正神",
      "level": "Culture-specific",
      "def": "A local land deity closely connected with land and community life.",
      "ex": "Tudigong culture is connected with land and local communities."
    },
    {
      "en": "local guardian",
      "zh": "地方守護",
      "level": "B1",
      "def": "A guardian connected with a local area.",
      "ex": "Tudigong is often understood as a local guardian."
    },
    {
      "en": "neighborhood",
      "zh": "街坊／社區",
      "level": "B1",
      "def": "The area where people live near one another.",
      "ex": "A neighborhood can have its own cultural landmarks."
    },
    {
      "en": "daily life",
      "zh": "日常生活",
      "level": "B1",
      "def": "Everyday activities and experiences.",
      "ex": "Tudigong culture is part of everyday life in many communities."
    },
    {
      "en": "local temple",
      "zh": "地方廟宇／小廟",
      "level": "B1",
      "def": "A temple connected with a local community.",
      "ex": "A local temple can become a cultural landmark."
    },
    {
      "en": "community map",
      "zh": "社區地圖",
      "level": "B1",
      "def": "A map showing places and relationships in a community.",
      "ex": "We can use a community map to explore local culture."
    },
    {
      "en": "cultural landscape",
      "zh": "文化地景",
      "level": "B2",
      "def": "A place shaped by people, land use, and culture over time.",
      "ex": "Small temples and old trees can be part of a cultural landscape."
    },
    {
      "en": "farming life",
      "zh": "農業生活",
      "level": "B1",
      "def": "Daily life connected with farming and fields.",
      "ex": "Tudigong culture has long been connected with farming life."
    },
    {
      "en": "marketplace",
      "zh": "市場",
      "level": "B1",
      "def": "A place where people buy and sell goods.",
      "ex": "Markets are important parts of community life."
    },
    {
      "en": "zuoya",
      "zh": "做牙",
      "level": "Culture-specific",
      "def": "A traditional practice connected with the second and sixteenth days of the lunar month.",
      "ex": "Zuoya is part of Taiwan's traditional calendar and community culture."
    },
    {
      "en": "Touya",
      "zh": "頭牙",
      "level": "Culture-specific",
      "def": "The first important ya observance of the year, on the second day of the second lunar month.",
      "ex": "Touya is a culture-specific term in Taiwan."
    },
    {
      "en": "Weiya",
      "zh": "尾牙",
      "level": "Culture-specific",
      "def": "The final ya observance of the year, on the sixteenth day of the twelfth lunar month; also used for year-end company meals.",
      "ex": "Weiya is now also part of everyday language in Taiwan."
    },
    {
      "en": "Bogong",
      "zh": "伯公",
      "level": "Culture-specific",
      "def": "A Hakka term commonly used for Tudigong in local cultural contexts.",
      "ex": "In Meinong, Tudigong is often called Bogong."
    },
    {
      "en": "Fuchang",
      "zh": "福廠",
      "level": "Culture-specific",
      "def": "A culture-specific festival space or structure in particular local ritual contexts, such as the Yong'an case in Meinong.",
      "ex": "A fuchang is not simply another name for every Tudigong temple."
    },
    {
      "en": "cultural memory",
      "zh": "文化記憶",
      "level": "B2",
      "def": "Memory preserved through places, objects, land use, and everyday life.",
      "ex": "Cultural memory can remain even when a neighborhood changes."
    },
    {
      "en": "digital humanities",
      "zh": "數位人文",
      "level": "C1 / academic",
      "def": "Using digital tools to study culture, place, and society.",
      "ex": "AR, timelines, and community maps can support digital humanities learning."
    }
  ],
  "references": [
    {
      "title": "Taiwan Cultural Memory Bank: Fude Zhengshen / Tudigong",
      "url": "https://tcmb.culture.tw/zh-tw/detail?id=247133&indexCode=Culture_Place"
    },
    {
      "title": "Taiwan Religious Culture Map: Beitou Huangtian Fuyou Temple",
      "url": "https://taiwangods.moi.gov.tw/html/cultural/3_0011.aspx?i=209"
    },
    {
      "title": "Kaohsiung Museum of History: Meinong Yong'an Settlement Bogong Fuchang New-Year Ritual",
      "url": "https://www.khm.org.tw/tw/event/past/detail/338"
    },
    {
      "title": "Taiwan Folk Culture Dictionary: Zuoya / Weiya",
      "url": "https://dict.th.gov.tw/detailPage.aspx?Ca=183&ID=2419"
    },
    {
      "title": "Kaohsiung Gushou Temple: Fude Zhengshen",
      "url": "https://cushow.org.tw/?act=menuinfo&cmd=detail&mi_id=20240202008&ml_id=20240202004"
    }
  ]
};
export default CONTENT;
