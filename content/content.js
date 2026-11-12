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
    "skipTitle": {
      "en": "You haven't finished this page yet",
      "zh": "這一頁還沒完成"
    },
    "voiceOn": {
      "en": "Turn on voice guide",
      "zh": "開啟語音導覽"
    },
    "voiceOff": {
      "en": "Turn off voice guide",
      "zh": "關閉語音導覽"
    },
    "guideReplay": {
      "en": "Listen again",
      "zh": "再聽一次"
    },
    "guideHide": {
      "en": "Hide",
      "zh": "隱藏"
    },
    "skipLeft": {
      "en": "Still to do:",
      "zh": "還沒完成："
    },
    "skipEyebrow": {
      "en": "Wait a moment!",
      "zh": "等一下！"
    },
    "skipProgress": {
      "en": "Your progress on this page",
      "zh": "這一頁的進度"
    },
    "skipDone": {
      "en": "done",
      "zh": "已完成"
    },
    "skipLater": {
      "en": "You can come back anytime.",
      "zh": "隨時都可以回來。"
    },
    "skipBody": {
      "en": "You can keep exploring, or go on to the next page and come back later.",
      "zh": "你可以繼續探索，或先前往下一頁，之後再回來。"
    },
    "skipStay": {
      "en": "Keep Exploring",
      "zh": "繼續探索"
    },
    "skipGo": {
      "en": "Go to Next Page",
      "zh": "前往下一頁"
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
    "guide": {
      "en": "Welcome to Tudigong's Neighborhood. Take a breath, and when you're ready, tap Start Experience to begin our journey together.",
      "zh": "歡迎來到土地公的街坊。深呼吸一下，準備好了，就點「開始體驗」，我們一起出發吧。"
    },
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
    "guide": {
      "en": "First, let's set up the camera. Read the four tips, tap Start Camera, and choose Allow. Then hold the culture card inside the frame, about thirty to fifty centimeters away.",
      "zh": "我們先來設定相機。看看四個小提示，點「開啟相機」，再按「允許」。接著把文化卡放進框框裡，距離大約三十到五十公分。"
    },
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
    "skipTitle": {
      "en": "You haven't scanned the card yet",
      "zh": "你還沒有掃描文化卡"
    },
    "skipBody": {
      "en": "Scan the culture card to see the neighborhood rise in AR, or go on to the next page and come back later.",
      "zh": "掃描文化卡，就能看到街坊在 AR 中出現；也可以先前往下一頁，之後再回來。"
    },
    "skipStay": {
      "en": "Continue Scanning",
      "zh": "繼續掃描"
    },
    "setup": {
      "title": {
        "en": "Camera Setup",
        "zh": "相機設定"
      },
      "intro": {
        "en": "Before scanning the culture card, let's get the camera ready.",
        "zh": "掃描文化卡之前，我們先把相機準備好。"
      },
      "steps": [
        {
          "icon": "camera",
          "title": {
            "en": "Allow Camera",
            "zh": "允許相機"
          },
          "text": {
            "en": "When the browser asks, tap Allow. The camera is only used to find the culture card. Nothing is recorded or uploaded.",
            "zh": "瀏覽器詢問時請點「允許」。相機只用來尋找文化卡，不會錄影，也不會上傳。"
          }
        },
        {
          "icon": "scan",
          "title": {
            "en": "Fit the Card",
            "zh": "對準卡片"
          },
          "text": {
            "en": "Keep the whole card inside the frame, about 30–50 cm away.",
            "zh": "讓整張文化卡留在框線內，距離大約 30 到 50 公分。"
          }
        },
        {
          "icon": "bulb",
          "title": {
            "en": "Good Light",
            "zh": "光線充足"
          },
          "text": {
            "en": "Find good light and hold the device steady.",
            "zh": "找一個光線充足的地方，拿穩裝置。"
          }
        },
        {
          "icon": "hand",
          "title": {
            "en": "Stay Safe",
            "zh": "注意安全"
          },
          "text": {
            "en": "Stay where you are and keep an eye on the people and things around you.",
            "zh": "請待在原地，留意身邊的人和物品。"
          }
        }
      ],
      "start": {
        "en": "Start Camera",
        "zh": "開啟相機"
      },
      "eyebrow": {
        "en": "4 quick steps",
        "zh": "4 個小步驟"
      },
      "allow": {
        "en": "Allow",
        "zh": "允許"
      },
      "ready": {
        "en": "Ready? Let's find the card!",
        "zh": "準備好了嗎？一起找文化卡吧！"
      }
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
    "guide": {
      "en": "Here is how this journey works. Read the tips, and tap Got It whenever you're ready.",
      "zh": "這裡說明這趟旅程怎麼進行。看完小提示，準備好了就點「我知道了」。"
    },
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
    "guide": {
      "en": "Let's explore the map. Turn it with one finger, pinch to zoom, and tap at least three places to learn about them.",
      "zh": "我們來探索地圖吧。用一根手指轉動，用兩根手指縮放，再點選至少三個地點，認識它們。"
    },
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
          "en": "Many Tudigong temples are small and tucked inside neighborhoods. Even a small temple can be an important local landmark.",
          "zh": "許多土地公廟規模不大，就藏身在社區之中；即使是小廟，也可能是重要的地方地標。"
        }
      },
      "fields": {
        "label": {
          "en": "Look at the Fields",
          "zh": "看看田野"
        },
        "note": {
          "en": "Tudigong culture has long been tied to the land and to farming life, and some small temples stand right beside the fields.",
          "zh": "土地公文化長期與土地和農業生活息息相關，有些小廟就坐落在田邊。"
        }
      },
      "market": {
        "label": {
          "en": "Visit the Market",
          "zh": "逛逛市場"
        },
        "note": {
          "en": "Markets are the busy heart of community life, and local business culture is part of Tudigong traditions too.",
          "zh": "市場是社區生活熱鬧的中心，而在地商業文化也是土地公傳統的一部分。"
        }
      },
      "corner": {
        "label": {
          "en": "Explore the Street Corner",
          "zh": "探索街角"
        },
        "note": {
          "en": "A street corner is where roads and people meet. A small temple here can become both a landmark and a meeting point.",
          "zh": "街角是道路交會、人們相遇的地方；位在這裡的小廟可能成為地標與集合點。"
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
      "en": "As we explore Kaohsiung’s neighborhoods, fields, markets, and settlements, we find many cultural traces of Tudigong. Also known as Fude Zhengshen, Tudigong is a common local guardian in Taiwanese folk belief. His small temples and the cultural landscapes around them also record how people use the land, build communities, and create local memory.",
      "zh": "走訪高雄的街坊、田野、市場與聚落，我們可以發現許多土地公的文化痕跡。土地公又稱福德正神，是臺灣民間信仰中常見的地方守護神。土地公廟與周圍的文化地景，也記錄了人們如何利用土地、建立社區，並創造地方記憶。"
    }
  },
  "p05": {
    "guide": {
      "en": "Read each riddle, then drag the card to the right place on the map. When all four are placed, find the spot where everyone meets.",
      "zh": "讀一讀謎題，再把卡片拖到地圖上正確的地方。四張都放好之後，找出大家交會的地方。"
    },
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
      "en": "Read the riddle, then drag the card to the right place on the map, or tap the card and then a circle.",
      "zh": "讀一讀謎題，再把卡片拖到地圖上正確的位置，或先點卡片再點圓圈。"
    },
    "riddle": {
      "en": "Riddle",
      "zh": "謎題"
    },
    "riddles": {
      "residential": {
        "en": "Rows of windows and laundry on the balconies. Families live here. What am I?",
        "zh": "一排排窗戶，陽台上曬著衣服，許多家庭住在這裡。我是什麼？"
      },
      "road": {
        "en": "Scooters and cars travel along me every day and link every place. What am I?",
        "zh": "機車和汽車每天在我身上來來往往，把各個地方連在一起。我是什麼？"
      },
      "market": {
        "en": "Striped awnings, baskets of fruit and busy voices in the morning. What am I?",
        "zh": "條紋遮陽棚、一籃籃水果，早上人聲熱鬧。我是什麼？"
      },
      "temple": {
        "en": "I am small, with a curved red-tile roof, right by the street corner. What am I?",
        "zh": "我小小的，有彎彎的紅瓦屋頂，就在街角旁。我是什麼？"
      }
    },
    "passport": {
      "en": "Neighborhood Passport",
      "zh": "街坊護照"
    },
    "goldSeal": {
      "en": "No mistakes: a gold seal!",
      "zh": "零失誤：金色印章！"
    },
    "meetQ": {
      "en": "Where do the homes, the street and the market all meet? Tap that place on the map.",
      "zh": "住家、街道和市場在哪裡交會？在地圖上點點看。"
    },
    "meetWrong": {
      "en": "Not quite. Look at the small place right on the street corner.",
      "zh": "還差一點，看看街角上那個小小的地方。"
    },
    "placed": {
      "en": "Placed",
      "zh": "已放好"
    },
    "park": {
      "en": "Park",
      "zh": "公園"
    },
    "street": {
      "en": "Whole Street Corner",
      "zh": "整個街角"
    },
    "arTry": {
      "en": "Now tap any place on the map to learn about it and view it in AR!",
      "zh": "現在點地圖上的任何地點，認識它，再用 AR 看看！"
    },
    "arOpen": {
      "en": "View in AR",
      "zh": "用 AR 看看"
    },
    "arHint": {
      "en": "Drag to turn · pinch to zoom",
      "zh": "拖曳旋轉・雙指縮放"
    },
    "arPlace": {
      "en": "Place it in the room",
      "zh": "放進真實空間"
    },
    "arNoCam": {
      "en": "The camera isn't available, so here is the 3D model.",
      "zh": "無法開啟相機，先看看 3D 模型。"
    },
    "arLoading": {
      "en": "Loading the 3D model…",
      "zh": "3D 模型載入中…"
    },
    "arFacts": {
      "temple": {
        "en": "This small Tudigong temple stands where the homes, the street and the market meet. Neighbors stop here to pray, chat and meet friends, so it is a landmark and a meeting point.",
        "zh": "這座土地公小廟就在住家、街道和市場交會的地方。鄰居們會在這裡拜拜、聊天、和朋友碰面，所以它是地標，也是聚集點。"
      },
      "residential": {
        "en": "Rows of houses where families live. Every day, many neighbors walk past the small temple on their way to school, work or the market.",
        "zh": "一排排房子，許多家庭住在這裡。每天，很多鄰居上學、上班或去市場時，都會經過小廟。"
      },
      "road": {
        "en": "The road links the homes, the market and the temple. Scooters, cars and people move along it all day long.",
        "zh": "道路把住家、市場和小廟連在一起。機車、汽車和行人整天都在這裡來來往往。"
      },
      "market": {
        "en": "Stalls sell food and everyday things, and neighbors stop to eat and chat. After shopping, many of them walk past the temple.",
        "zh": "攤位賣吃的和日常用品，鄰居們在這裡吃東西、聊天。逛完市場，很多人會順路經過小廟。"
      },
      "park": {
        "en": "A big banyan tree gives cool shade. Neighbors rest, play and meet here, close to the small temple.",
        "zh": "大榕樹帶來涼爽的樹蔭。鄰居們在這裡休息、玩耍、聚會，離小廟很近。"
      },
      "street": {
        "en": "The whole street corner in 3D. Find the small temple where the homes, the street and the market all meet.",
        "zh": "立體的整個街角。找一找住家、街道和市場交會處的小廟。"
      }
    },
    "nodeNote": {
      "en": "The small temple sits where homes, the street, and the market come together, so it becomes a landmark and a meeting place for the neighborhood.",
      "zh": "小廟正好位在住家、街道與市場交會的地方，因此成為街坊的地標與聚集點。"
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
      "en": "In Kaohsiung and many other parts of Taiwan, a Tudigong temple does not have to be large. Some stand on street corners or beside roads, and others sit inside neighborhoods. These small temples are places of belief, but they can also become local landmarks that keep community memory.",
      "zh": "在高雄以及臺灣許多地方，土地公廟不一定很大。有些位在街角或路旁，有些就藏身在社區之中。這些小廟是信仰的場所，也可能成為保存社區記憶的地方地標。"
    }
  },
  "p06": {
    "guide": {
      "en": "Slide the timeline slowly from Past to Present, and watch how the land changes. Then look for the cultural clues that stayed the same.",
      "zh": "把時間軸慢慢從過去滑到現在，看看土地怎麼改變。然後找一找，哪些文化線索一直沒有改變。"
    },
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
      "en": "The land around it has changed, but the small temple has stayed in or near the same spot. Places like this hold on to cultural memory.",
      "zh": "周圍的土地改變了，小廟卻仍留在原處或附近。這樣的地方保存了文化記憶。"
    },
    "clueNotes": {
      "temple": {
        "en": "The land around it has changed, but the small temple has stayed in or near the same spot. Places like this hold on to cultural memory.",
        "zh": "周圍的土地改變了，小廟卻仍留在原處或附近。這樣的地方保存了文化記憶。"
      },
      "tree": {
        "en": "Fields became streets, but the old banyan tree still stands beside the small temple. In many Kaohsiung neighborhoods, people gather and rest under trees like this one. Over time, the tree becomes part of cultural memory.",
        "zh": "田地變成了街道，老榕樹依然立在小廟旁。在高雄許多街坊，人們常在這樣的老樹下相聚、休息。久而久之，老樹也成了文化記憶的一部分。"
      }
    },
    "task1": {
      "en": "Slide from Past to Present",
      "zh": "從過去滑到現在"
    },
    "task2": {
      "en": "Select a Cultural Clue",
      "zh": "選出一個文化線索"
    },
    "pins": {
      "temple": {
        "en": "Small Temple",
        "zh": "小廟"
      },
      "tree": {
        "en": "Old Tree",
        "zh": "老樹"
      }
    },
    "timeline": {
      "en": "Timeline",
      "zh": "時間軸"
    },
    "slideHint": {
      "en": "Drag the timeline from Past to Present and watch the land change.",
      "zh": "把時間軸從過去拖到現在，看看土地怎麼改變。"
    },
    "reached": {
      "en": "This is the neighborhood today. What stayed the same?",
      "zh": "這是今天的街坊。哪些東西沒有改變？"
    },
    "clueHint": {
      "en": "Tap the small temple or the old tree.",
      "zh": "點選小廟或老樹。"
    },
    "notYet": {
      "en": "First slide all the way from Past to Present.",
      "zh": "先把時間軸從過去一路滑到現在。"
    },
    "complete": {
      "en": "Land-Use Task Complete",
      "zh": "土地利用任務完成"
    },
    "chips": [
      {
        "en": "Farming Life",
        "zh": "農業生活"
      },
      {
        "en": "Cultural Memory",
        "zh": "文化記憶"
      }
    ],
    "narration": {
      "en": "Tudigong culture has long been tied to fields, settlements, and life on the land. As parts of Kaohsiung changed, some fields became roads, homes, or business districts, yet some small temples stayed in or near their original locations. Comparing maps of the past and present helps us read how a place has changed and what cultural memory it keeps.",
      "zh": "土地公文化長久以來與田野、聚落和土地上的生活緊密相連。隨著高雄部分地區的變遷，有些田地變成了道路、住家或商業區，但也有些小廟仍留在原本的位置或附近。比較過去與現在的地圖，能幫助我們解讀地方的變化，以及其中保留的文化記憶。"
    }
  },
  "p07": {
    "guide": {
      "en": "Take a close look at the small temple and the things around it: the building, the offering table, and the stone lions.",
      "zh": "仔細看看小廟和它周圍的東西：建築、供桌，還有石獅。"
    },
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
      "en": "When observing a Tudigong temple, we can look beyond the deity image and notice the building and the area around it. The small temple, the offering table, and the stone lions can all be part of a cultural landscape. In some places, an old tree nearby is part of it too.",
      "zh": "觀察土地公廟時，我們可以把目光放到神像以外，留意建築本身和周圍的環境。小廟、供桌和石獅，都可以是文化地景的一部分。在有些地方，附近的老樹也是其中之一。"
    }
  },
  "p08": {
    "guide": {
      "en": "Look at the community culture map, and find the places where everyday life and local culture meet.",
      "zh": "看看社區文化地圖，找出日常生活和在地文化相遇的地方。"
    },
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
      "en": "Local culture lives in more than one building. This simple community culture map of Kaohsiung shows how schools, homes, markets, parks, old trees, and local temples come together in everyday life. Now think about your own neighborhood: which places belong on a community culture map?",
      "zh": "地方文化不只存在於一棟建築裡。這張簡化的高雄社區文化地圖，呈現了學校、住家、市場、公園、老樹與地方廟宇如何在日常生活中連結在一起。現在想一想你自己的街坊：哪些地方應該出現在社區文化地圖上？"
    }
  },
  "p09": {
    "guide": {
      "en": "Let's learn about Touya and Weiya, and how they follow the gentle rhythm of everyday life.",
      "zh": "我們來認識頭牙和尾牙，看看它們怎麼跟著日常生活的節奏。"
    },
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
      "en": "In traditional Taiwanese folk culture, zuoya is observed on the second and sixteenth days of each lunar month. The second day of the second lunar month is called Touya, and the sixteenth day of the twelfth lunar month is called Weiya. Over time, Weiya has also become the everyday word for a company’s year-end dinner.",
      "zh": "在臺灣傳統民間文化中，每個農曆月的初二與十六都有「做牙」的習俗。農曆二月初二稱為「頭牙」，十二月十六則稱為「尾牙」。隨著時間演變，「尾牙」也成為公司年終聚餐的常見說法。"
    }
  },
  "p10": {
    "guide": {
      "en": "Let's visit Bogong in Meinong, and see how one belief can be shared in different local ways.",
      "zh": "我們一起去認識美濃的伯公，看看同一個信仰，如何有不同的在地表現。"
    },
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
      "en": "In Hakka communities such as Meinong in Kaohsiung, Tudigong is often called Bogong. Local language, history, and community life have given Bogong traditions their own local style. In the Yong’an area of Meinong, a fuchang is a special space or structure for a local festival. It is not just another name for a Tudigong temple.",
      "zh": "在高雄美濃等客家社區，土地公常被稱為「伯公」。在地的語言、歷史與社區生活，讓伯公傳統有了自己的在地特色。在美濃永安地區，「福廠」是當地節慶使用的特別空間或結構，並不是土地公廟的另一個名稱。"
    }
  },
  "p11": {
    "guide": {
      "en": "Now it's your turn. Put the words in order to introduce Tudigong and community culture in English. Take your time.",
      "zh": "現在輪到你了。把字詞組合起來，用英文介紹土地公與社區文化。慢慢來，不用急。"
    },
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
      "en": "On this journey, we started from everyday places in Kaohsiung and learned how Tudigong culture connects land, fields, street corners, markets, communities, and cultural memory. We also learned that in Meinong, Tudigong is called Bogong and has its own local traditions. Now, answer the core question in one English sentence.",
      "zh": "在這段旅程中，我們從高雄的日常場所出發，認識了土地公文化如何連結土地、田野、街角、市場、社區與文化記憶。我們也認識到，在美濃，土地公被稱為「伯公」，並有自己的在地傳統。現在，請用一句英文回答核心提問。"
    }
  },
  "p12": {
    "guide": {
      "en": "Well done! You've completed the journey. Look back at what you learned, and come back anytime.",
      "zh": "做得很好！你完成了這趟旅程。回顧一下學到的東西，歡迎隨時再回來。"
    },
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
      "en": "You have completed a bilingual AR journey through Tudigong belief, life on the land, local communities, cultural landscapes, zuoya culture, and Bogong culture in Meinong. Now let’s return to the first question: why is Tudigong so often found close to everyday life? One answer is that the belief has become connected with land use, community relationships, and local memory.",
      "zh": "你已完成一段雙語 AR 旅程，認識了土地公信仰、土地上的生活、地方社區、文化地景、做牙文化，以及美濃的伯公文化。現在回到最初的問題：為什麼土地公常出現在日常生活附近？其中一個答案是：這份信仰逐漸與土地利用、社區關係和地方記憶連結在一起。"
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
