/**
 * ギターコード完全データベース & 自動ポジション生成エンジン
 * 全12ルート音 × 全コードタイプの複数押さえ方（ローコード、バレー、簡単フォーム）を完全網羅
 */

// 基本コード辞書（手作業でチューニングされた高精度な押さえ方とアドバイス）
const CHORD_DATABASE = {
  // ==========================================
  // === C (ド) ===
  // ==========================================
  "C": [
    {
      name: "ローコード（基本）",
      baseFret: 1,
      frets: [-1, 3, 2, 0, 1, 0],
      fingers: [0, 3, 2, 0, 1, 0],
      barre: null,
      tips: "6弦は親指で軽く触れてミュート。1弦の開放弦が人差し指の腹に触れないよう、第1関節をしっかり立てましょう。"
    },
    {
      name: "3フレット バレー（5弦ルート）",
      baseFret: 3,
      frets: [-1, 3, 5, 5, 5, 3],
      fingers: [0, 1, 3, 3, 3, 1],
      barre: { fromString: 1, toString: 5, fret: 3, finger: 1 },
      tips: "人差し指で3フレットをセーハし、薬指で4・3・2弦をまとめて押さえるか薬・小指を使います。"
    },
    {
      name: "8フレット バレー（6弦ルート）",
      baseFret: 8,
      frets: [8, 10, 10, 9, 8, 8],
      fingers: [1, 3, 4, 2, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 8, finger: 1 },
      tips: "Eコードの形を8フレットまで平行移動した形です。力強い高音寄りの響きになります。"
    }
  ],
  "Cm": [
    {
      name: "3フレット バレー（基本）",
      baseFret: 3,
      frets: [-1, 3, 5, 5, 4, 3],
      fingers: [0, 1, 3, 4, 2, 1],
      barre: { fromString: 1, toString: 5, fret: 3, finger: 1 },
      tips: "Amの形を3フレットに移動したバレーコード。人差し指の側面を使うと音が鳴りやすくなります。"
    },
    {
      name: "8フレット バレー（6弦ルート）",
      baseFret: 8,
      frets: [8, 10, 10, 8, 8, 8],
      fingers: [1, 3, 4, 1, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 8, finger: 1 },
      tips: "Emの形を8フレットに移動した形です。"
    }
  ],
  "C7": [
    {
      name: "ローコード（基本）",
      baseFret: 1,
      frets: [-1, 3, 2, 3, 1, 0],
      fingers: [0, 3, 2, 4, 1, 0],
      barre: null,
      tips: "Cコードの押さえ方に小指で3弦3フレットをプラスします。"
    },
    {
      name: "3フレット バレー",
      baseFret: 3,
      frets: [-1, 3, 5, 3, 5, 3],
      fingers: [0, 1, 3, 1, 4, 1],
      barre: { fromString: 1, toString: 5, fret: 3, finger: 1 },
      tips: "A7の形を3フレットにスライドさせたバレーコードです。"
    }
  ],
  "Cm7": [
    {
      name: "3フレット バレー（基本）",
      baseFret: 3,
      frets: [-1, 3, 5, 3, 4, 3],
      fingers: [0, 1, 3, 1, 2, 1],
      barre: { fromString: 1, toString: 5, fret: 3, finger: 1 },
      tips: "Am7の形を3フレットに移動。ジャズやネオソウルで重宝するメロウな響きです。"
    },
    {
      name: "8フレット バレー（6弦ルート）",
      baseFret: 8,
      frets: [8, 10, 8, 8, 8, 8],
      fingers: [1, 3, 1, 1, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 8, finger: 1 },
      tips: "Em7の形を8フレットにスライドさせた形です。"
    }
  ],
  "Cmaj7": [
    {
      name: "ローコード（簡単・透明感）",
      baseFret: 1,
      frets: [-1, 3, 2, 0, 0, 0],
      fingers: [0, 3, 2, 0, 0, 0],
      barre: null,
      tips: "Cコードから人差し指を離すだけ！指2本で簡単に押さえられ、洗練された響きです。"
    },
    {
      name: "3フレット バレー",
      baseFret: 3,
      frets: [-1, 3, 5, 4, 5, 3],
      fingers: [0, 1, 3, 2, 4, 1],
      barre: { fromString: 1, toString: 5, fret: 3, finger: 1 },
      tips: "Amaj7の形を3フレットに移動させた美しい響きのフォームです。"
    }
  ],
  "Csus4": [
    {
      name: "ローコード",
      baseFret: 1,
      frets: [-1, 3, 3, 0, 1, 1],
      fingers: [0, 3, 4, 0, 1, 1],
      barre: { fromString: 1, toString: 2, fret: 1, finger: 1 },
      tips: "人差し指を寝かせて1・2弦の1フレットを同時に押さえます。"
    },
    {
      name: "3フレット バレー",
      baseFret: 3,
      frets: [-1, 3, 5, 5, 6, 3],
      fingers: [0, 1, 3, 3, 4, 1],
      barre: { fromString: 1, toString: 5, fret: 3, finger: 1 },
      tips: "Asus4の形を3フレットで押さえます。"
    }
  ],
  "Cadd9": [
    {
      name: "ローコード（アコギ定番響き）",
      baseFret: 1,
      frets: [-1, 3, 2, 0, 3, 0],
      fingers: [0, 2, 1, 0, 3, 0],
      barre: null,
      tips: "J-POPや洋楽で大人気の爽やかなコード。薬指で2弦3フレットを押さえます。"
    }
  ],

  // ==========================================
  // === C# / Db ===
  // ==========================================
  "C#": [
    {
      name: "4フレット バレー（基本・5弦ルート）",
      baseFret: 4,
      frets: [-1, 4, 6, 6, 6, 4],
      fingers: [0, 1, 3, 3, 3, 1],
      barre: { fromString: 1, toString: 5, fret: 4, finger: 1 },
      tips: "Aコードの形を4フレットでセーハします。"
    },
    {
      name: "9フレット バレー（6弦ルート）",
      baseFret: 9,
      frets: [9, 11, 11, 10, 9, 9],
      fingers: [1, 3, 4, 2, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 9, finger: 1 },
      tips: "Eコードの形を9フレットでセーハします。"
    }
  ],
  "C#m": [
    {
      name: "4フレット バレー（基本）",
      baseFret: 4,
      frets: [-1, 4, 6, 6, 5, 4],
      fingers: [0, 1, 3, 4, 2, 1],
      barre: { fromString: 1, toString: 5, fret: 4, finger: 1 },
      tips: "Amの形を4フレットに移動したバレーコード。J-POPのKey=Eで頻出します。"
    },
    {
      name: "簡単フォーム（省略形）",
      baseFret: 4,
      frets: [-1, -1, 6, 6, 5, 4],
      fingers: [0, 0, 3, 4, 2, 1],
      barre: null,
      tips: "5弦・6弦を弾かない簡単フォームです。"
    }
  ],
  "C#7": [
    {
      name: "4フレット バレー",
      baseFret: 4,
      frets: [-1, 4, 6, 4, 6, 4],
      fingers: [0, 1, 3, 1, 4, 1],
      barre: { fromString: 1, toString: 5, fret: 4, finger: 1 },
      tips: "A7の形を4フレットで押さえます。"
    }
  ],
  "C#m7": [
    {
      name: "4フレット バレー（定番）",
      baseFret: 4,
      frets: [-1, 4, 6, 4, 5, 4],
      fingers: [0, 1, 3, 1, 2, 1],
      barre: { fromString: 1, toString: 5, fret: 4, finger: 1 },
      tips: "Am7の形を4フレットで押さえます。哀愁と都会的な響きが特徴です。"
    }
  ],
  "C#maj7": [
    {
      name: "4フレット バレー",
      baseFret: 4,
      frets: [-1, 4, 6, 5, 6, 4],
      fingers: [0, 1, 3, 2, 4, 1],
      barre: { fromString: 1, toString: 5, fret: 4, finger: 1 },
      tips: "Amaj7の形を4フレットで押さえます。"
    }
  ],
  "C#sus4": [
    {
      name: "4フレット バレー",
      baseFret: 4,
      frets: [-1, 4, 6, 6, 7, 4],
      fingers: [0, 1, 3, 3, 4, 1],
      barre: { fromString: 1, toString: 5, fret: 4, finger: 1 },
      tips: "Asus4の形を4フレットで押さえます。"
    }
  ],
  "C#add9": [
    {
      name: "4フレット バレー",
      baseFret: 4,
      frets: [-1, 4, 3, 6, 4, 4],
      fingers: [0, 2, 1, 4, 2, 2],
      barre: null,
      tips: "煌びやかな響きを持つモダンコードです。"
    }
  ],

  // ==========================================
  // === D (レ) ===
  // ==========================================
  "D": [
    {
      name: "ローコード（基本）",
      baseFret: 1,
      frets: [-1, -1, 0, 2, 3, 2],
      fingers: [0, 0, 0, 1, 3, 2],
      barre: null,
      tips: "6弦・5弦は親指で軽く触れるか弾かないようにミュート。三角形の形を意識して指を立てます。"
    },
    {
      name: "5フレット バレー（5弦ルート）",
      baseFret: 5,
      frets: [-1, 5, 7, 7, 7, 5],
      fingers: [0, 1, 3, 3, 3, 1],
      barre: { fromString: 1, toString: 5, fret: 5, finger: 1 },
      tips: "Aコードの形を5フレットで押さえます。"
    }
  ],
  "Dm": [
    {
      name: "ローコード（基本）",
      baseFret: 1,
      frets: [-1, -1, 0, 2, 3, 1],
      fingers: [0, 0, 0, 2, 3, 1],
      barre: null,
      tips: "人差し指1弦1フレット、中指3弦2フレット、薬指2弦3フレット。4弦開放をクリアに鳴らします。"
    },
    {
      name: "5フレット バレー",
      baseFret: 5,
      frets: [-1, 5, 7, 7, 6, 5],
      fingers: [0, 1, 3, 4, 2, 1],
      barre: { fromString: 1, toString: 5, fret: 5, finger: 1 },
      tips: "Amフォームを5フレットに移動した形です。"
    }
  ],
  "D7": [
    {
      name: "ローコード（基本）",
      baseFret: 1,
      frets: [-1, -1, 0, 2, 1, 2],
      fingers: [0, 0, 0, 2, 1, 3],
      barre: null,
      tips: "Dの形を逆三角形にした形です。"
    },
    {
      name: "5フレット バレー",
      baseFret: 5,
      frets: [-1, 5, 7, 5, 7, 5],
      fingers: [0, 1, 3, 1, 4, 1],
      barre: { fromString: 1, toString: 5, fret: 5, finger: 1 },
      tips: "A7の形を5フレットでセーハします。"
    }
  ],
  "Dm7": [
    {
      name: "ローコード（1・2弦セーハ）",
      baseFret: 1,
      frets: [-1, -1, 0, 2, 1, 1],
      fingers: [0, 0, 0, 2, 1, 1],
      barre: { fromString: 1, toString: 2, fret: 1, finger: 1 },
      tips: "人差し指を少し寝かせて1・2弦の1フレットを同時に押さえます。切なく優しい響きです。"
    },
    {
      name: "5フレット バレー",
      baseFret: 5,
      frets: [-1, 5, 7, 5, 6, 5],
      fingers: [0, 1, 3, 1, 2, 1],
      barre: { fromString: 1, toString: 5, fret: 5, finger: 1 },
      tips: "Am7の形を5フレットで押さえます。"
    }
  ],
  "Dmaj7": [
    {
      name: "ローコード（1本指セーハ）",
      baseFret: 1,
      frets: [-1, -1, 0, 2, 2, 2],
      fingers: [0, 0, 0, 1, 1, 1],
      barre: { fromString: 1, toString: 3, fret: 2, finger: 1 },
      tips: "人差し指1本で1〜3弦の2フレットをまとめて押さえると簡単です。"
    },
    {
      name: "5フレット バレー",
      baseFret: 5,
      frets: [-1, 5, 7, 6, 7, 5],
      fingers: [0, 1, 3, 2, 4, 1],
      barre: { fromString: 1, toString: 5, fret: 5, finger: 1 },
      tips: "Amaj7の形を5フレットで押さえます。"
    }
  ],
  "Dsus4": [
    {
      name: "ローコード（基本）",
      baseFret: 1,
      frets: [-1, -1, 0, 2, 3, 3],
      fingers: [0, 0, 0, 1, 2, 4],
      barre: null,
      tips: "Dコードから小指で1弦3フレットを押さえます。Dへの解決とセットで使われます。"
    }
  ],
  "Dadd9": [
    {
      name: "ローコード（透明感）",
      baseFret: 1,
      frets: [-1, -1, 0, 2, 3, 0],
      fingers: [0, 0, 0, 1, 2, 0],
      barre: null,
      tips: "Dから1弦を開放にするだけ！キラキラとした非常に綺麗なアコギサウンドです。"
    }
  ],

  // ==========================================
  // === D# / Eb ===
  // ==========================================
  "Eb": [
    {
      name: "6フレット バレー（基本・5弦ルート）",
      baseFret: 6,
      frets: [-1, 6, 8, 8, 8, 6],
      fingers: [0, 1, 3, 3, 3, 1],
      barre: { fromString: 1, toString: 5, fret: 6, finger: 1 },
      tips: "Aコードの形を6フレットでセーハします。"
    },
    {
      name: "簡単フォーム（3フレット）",
      baseFret: 3,
      frets: [-1, -1, 5, 3, 4, 3],
      fingers: [0, 0, 4, 1, 2, 1],
      barre: { fromString: 1, toString: 3, fret: 3, finger: 1 },
      tips: "低音弦を弾かない簡単フォームです。"
    }
  ],
  "Ebm": [
    {
      name: "6フレット バレー（基本）",
      baseFret: 6,
      frets: [-1, 6, 8, 8, 7, 6],
      fingers: [0, 1, 3, 4, 2, 1],
      barre: { fromString: 1, toString: 5, fret: 6, finger: 1 },
      tips: "Amの形を6フレットでセーハします。"
    }
  ],
  "Eb7": [
    {
      name: "6フレット バレー",
      baseFret: 6,
      frets: [-1, 6, 8, 6, 8, 6],
      fingers: [0, 1, 3, 1, 4, 1],
      barre: { fromString: 1, toString: 5, fret: 6, finger: 1 },
      tips: "A7の形を6フレットでセーハします。"
    }
  ],
  "Ebm7": [
    {
      name: "6フレット バレー",
      baseFret: 6,
      frets: [-1, 6, 8, 6, 7, 6],
      fingers: [0, 1, 3, 1, 2, 1],
      barre: { fromString: 1, toString: 5, fret: 6, finger: 1 },
      tips: "Am7の形を6フレットでセーハします。"
    }
  ],
  "Ebmaj7": [
    {
      name: "6フレット バレー",
      baseFret: 6,
      frets: [-1, 6, 8, 7, 8, 6],
      fingers: [0, 1, 3, 2, 4, 1],
      barre: { fromString: 1, toString: 5, fret: 6, finger: 1 },
      tips: "Amaj7の形を6フレットでセーハします。"
    }
  ],
  "Ebsus4": [
    {
      name: "6フレット バレー",
      baseFret: 6,
      frets: [-1, 6, 8, 8, 9, 6],
      fingers: [0, 1, 3, 3, 4, 1],
      barre: { fromString: 1, toString: 5, fret: 6, finger: 1 },
      tips: "Asus4の形を6フレットで押さえます。"
    }
  ],
  "Ebadd9": [
    {
      name: "6フレット バレー",
      baseFret: 6,
      frets: [-1, 6, 8, 10, 8, 6],
      fingers: [0, 1, 2, 4, 2, 1],
      barre: { fromString: 1, toString: 5, fret: 6, finger: 1 },
      tips: "浮遊感のあるおしゃれなアディショナルコードです。"
    }
  ],

  // ==========================================
  // === E (ミ) ===
  // ==========================================
  "E": [
    {
      name: "ローコード（基本）",
      baseFret: 1,
      frets: [0, 2, 2, 1, 0, 0],
      fingers: [0, 2, 3, 1, 0, 0],
      barre: null,
      tips: "6本の弦すべてを鳴らせる最も重厚なコード。指の腹が他の弦に触れないよう注意しましょう。"
    },
    {
      name: "7フレット バレー（5弦ルート）",
      baseFret: 7,
      frets: [-1, 7, 9, 9, 9, 7],
      fingers: [0, 1, 3, 3, 3, 1],
      barre: { fromString: 1, toString: 5, fret: 7, finger: 1 },
      tips: "Aの形を7フレットで押さえます。"
    }
  ],
  "Em": [
    {
      name: "ローコード（初心者基本）",
      baseFret: 1,
      frets: [0, 2, 2, 0, 0, 0],
      fingers: [0, 2, 3, 0, 0, 0],
      barre: null,
      tips: "中指と薬指の2本だけで押さえられます。哀愁のある綺麗な響きです。"
    },
    {
      name: "7フレット バレー",
      baseFret: 7,
      frets: [-1, 7, 9, 9, 8, 7],
      fingers: [0, 1, 3, 4, 2, 1],
      barre: { fromString: 1, toString: 5, fret: 7, finger: 1 },
      tips: "Amの形を7フレットで押さえます。"
    }
  ],
  "E7": [
    {
      name: "ローコード（基本）",
      baseFret: 1,
      frets: [0, 2, 0, 1, 0, 0],
      fingers: [0, 2, 0, 1, 0, 0],
      barre: null,
      tips: "Eコードから薬指を離すだけで完成します。"
    },
    {
      name: "7フレット バレー",
      baseFret: 7,
      frets: [-1, 7, 9, 7, 9, 7],
      fingers: [0, 1, 3, 1, 4, 1],
      barre: { fromString: 1, toString: 5, fret: 7, finger: 1 },
      tips: "A7の形を7フレットで押さえます。"
    }
  ],
  "Em7": [
    {
      name: "ローコード（簡単・指1本）",
      baseFret: 1,
      frets: [0, 2, 0, 0, 0, 0],
      fingers: [0, 2, 0, 0, 0, 0],
      barre: null,
      tips: "中指1本（または中・薬指）だけで押さえられます！開放弦の抜けが心地よいコードです。"
    },
    {
      name: "4本指アコギ定番響き",
      baseFret: 1,
      frets: [0, 2, 2, 0, 3, 3],
      fingers: [0, 1, 2, 0, 3, 4],
      barre: null,
      tips: "Gコードと指2本共通で移動できる、エド・シーランやJ-POPで多用される現代的な響きです。"
    }
  ],
  "Emaj7": [
    {
      name: "ローコード（基本）",
      baseFret: 1,
      frets: [0, 2, 1, 1, 0, 0],
      fingers: [0, 3, 1, 2, 0, 0],
      barre: null,
      tips: "キラキラとした幻想的な響きを持ちます。"
    }
  ],
  "Esus4": [
    {
      name: "ローコード",
      baseFret: 1,
      frets: [0, 2, 2, 2, 0, 0],
      fingers: [0, 2, 3, 4, 0, 0],
      barre: null,
      tips: "Eコードの人差し指を薬指・小指で半音上げます。"
    }
  ],
  "Eadd9": [
    {
      name: "ローコード（煌びやか）",
      baseFret: 1,
      frets: [0, 2, 2, 1, 0, 2],
      fingers: [0, 2, 3, 1, 0, 4],
      barre: null,
      tips: "小指で1弦2フレットを押さえます。アコギの鳴りが抜群です。"
    }
  ],

  // ==========================================
  // === F (ファ) ===
  // ==========================================
  "F": [
    {
      name: "1フレット バレー（王道セーハ）",
      baseFret: 1,
      frets: [1, 3, 3, 2, 1, 1],
      fingers: [1, 3, 4, 2, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 1, finger: 1 },
      tips: "人差し指は真っ直ぐではなく少し親指側に回転させて「側面」で押さえ、手首を少し前に出すと力が入ります。"
    },
    {
      name: "簡単・省略フォーム（初心者おすすめ）",
      baseFret: 1,
      frets: [-1, -1, 3, 2, 1, 1],
      fingers: [0, 0, 3, 2, 1, 1],
      barre: { fromString: 1, toString: 2, fret: 1, finger: 1 },
      tips: "6弦・5弦を弾かず、人差し指で1・2弦の1フレットだけをセーハします。Fが苦手なときはこれで代用OK！"
    },
    {
      name: "親指グリップ（プロ多用）",
      baseFret: 1,
      frets: [1, -1, 3, 2, 1, 1],
      fingers: ['T', 0, 3, 2, 1, 1],
      barre: { fromString: 1, toString: 2, fret: 1, finger: 1 },
      tips: "6弦1フレットを親指で上から握り込みます。ロックやポップスで素早いコードチェンジが可能です。"
    }
  ],
  "Fm": [
    {
      name: "1フレット バレー（基本）",
      baseFret: 1,
      frets: [1, 3, 3, 1, 1, 1],
      fingers: [1, 3, 4, 1, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 1, finger: 1 },
      tips: "Fコードから中指を離した形です。"
    },
    {
      name: "簡単フォーム",
      baseFret: 1,
      frets: [-1, -1, 3, 1, 1, 1],
      fingers: [0, 0, 3, 1, 1, 1],
      barre: { fromString: 1, toString: 3, fret: 1, finger: 1 },
      tips: "4弦〜1弦のみを押さえる簡単フォームです。"
    }
  ],
  "F7": [
    {
      name: "1フレット バレー",
      baseFret: 1,
      frets: [1, 3, 1, 2, 1, 1],
      fingers: [1, 3, 1, 2, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 1, finger: 1 },
      tips: "Fコードから小指を離した形です。"
    }
  ],
  "Fm7": [
    {
      name: "1フレット バレー",
      baseFret: 1,
      frets: [1, 3, 1, 1, 1, 1],
      fingers: [1, 3, 1, 1, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 1, finger: 1 },
      tips: "人差し指のセーハに薬指で5弦3フレットのみを押さえる形です。"
    }
  ],
  "Fmaj7": [
    {
      name: "ローコード（簡単＆おしゃれ）",
      baseFret: 1,
      frets: [-1, -1, 3, 2, 1, 0],
      fingers: [0, 0, 3, 2, 1, 0],
      barre: null,
      tips: "セーハなしで指3本で押さえられる爽やかなコード。Fの代わりに使うとおしゃれなアレンジになります。"
    },
    {
      name: "親指フォーム（豊かな低音）",
      baseFret: 1,
      frets: [1, -1, 3, 2, 1, 0],
      fingers: ['T', 0, 3, 2, 1, 0],
      barre: null,
      tips: "親指で6弦1フレットを押さえ、1弦は開放弦を鳴らします。"
    }
  ],
  "Fsus4": [
    {
      name: "1フレット バレー",
      baseFret: 1,
      frets: [1, 3, 3, 3, 1, 1],
      fingers: [1, 3, 4, 4, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 1, finger: 1 },
      tips: "Fコードの中指を小指で3弦3フレットに上げます。"
    }
  ],
  "Fadd9": [
    {
      name: "簡単ローコード",
      baseFret: 1,
      frets: [-1, -1, 3, 2, 1, 3],
      fingers: [0, 0, 3, 2, 1, 4],
      barre: null,
      tips: "小指で1弦3フレットを押さえます。スピッツ等で頻出するエモいコードです。"
    }
  ],

  // ==========================================
  // === F# / Gb ===
  // ==========================================
  "F#": [
    {
      name: "2フレット バレー（基本）",
      baseFret: 2,
      frets: [2, 4, 4, 3, 2, 2],
      fingers: [1, 3, 4, 2, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 2, finger: 1 },
      tips: "Fコードの形をそのまま2フレットに移動したバレーコードです。"
    }
  ],
  "F#m": [
    {
      name: "2フレット バレー（基本）",
      baseFret: 2,
      frets: [2, 4, 4, 2, 2, 2],
      fingers: [1, 3, 4, 1, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 2, finger: 1 },
      tips: "Fmの形を2フレットに移動。Key=DやKey=Aで主役級に登場します。"
    },
    {
      name: "簡単フォーム",
      baseFret: 2,
      frets: [-1, -1, 4, 2, 2, 2],
      fingers: [0, 0, 3, 1, 1, 1],
      barre: { fromString: 1, toString: 3, fret: 2, finger: 1 },
      tips: "人差し指で1〜3弦をセーハし薬指で4弦を押さえます。"
    }
  ],
  "F#7": [
    {
      name: "2フレット バレー",
      baseFret: 2,
      frets: [2, 4, 2, 3, 2, 2],
      fingers: [1, 3, 1, 2, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 2, finger: 1 },
      tips: "F7の形を2フレットに移動した形です。"
    }
  ],
  "F#m7": [
    {
      name: "2フレット バレー（定番）",
      baseFret: 2,
      frets: [2, 4, 2, 2, 2, 2],
      fingers: [1, 3, 1, 1, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 2, finger: 1 },
      tips: "人差し指の2フレットセーハと薬指5弦4フレットのみで押さえられます。"
    }
  ],
  "F#maj7": [
    {
      name: "2フレット バレー",
      baseFret: 2,
      frets: [2, -1, 3, 3, 2, -1],
      fingers: [1, 0, 3, 4, 2, 0],
      barre: null,
      tips: "ジャズやR&Bでよく使われるスマートなコードフォームです。"
    }
  ],
  "F#sus4": [
    {
      name: "2フレット バレー",
      baseFret: 2,
      frets: [2, 4, 4, 4, 2, 2],
      fingers: [1, 3, 4, 4, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 2, finger: 1 },
      tips: "Fsus4の形を2フレットに移動した形です。"
    }
  ],
  "F#add9": [
    {
      name: "2フレット バレー",
      baseFret: 2,
      frets: [2, 4, 4, 3, 2, 4],
      fingers: [1, 3, 4, 2, 1, 4],
      barre: { fromString: 1, toString: 6, fret: 2, finger: 1 },
      tips: "1弦4フレットを小指で押さえます。"
    }
  ],

  // ==========================================
  // === G (ソ) ===
  // ==========================================
  "G": [
    {
      name: "ローコード（基本）",
      baseFret: 1,
      frets: [3, 2, 0, 0, 0, 3],
      fingers: [2, 1, 0, 0, 0, 3],
      barre: null,
      tips: "中指で6弦3フレット、人差し指で5弦2フレット、薬指（または小指）で1弦3フレットを押さえます。"
    },
    {
      name: "4本指フォーム（ロック/アコギ定番）",
      baseFret: 1,
      frets: [3, 2, 0, 0, 3, 3],
      fingers: [2, 1, 0, 0, 3, 4],
      barre: null,
      tips: "2弦3フレットと1弦3フレットを両方押さえます。Cadd9やEm7とのコードチェンジが一瞬でできます！"
    },
    {
      name: "3フレット バレー（6弦ルート）",
      baseFret: 3,
      frets: [3, 5, 5, 4, 3, 3],
      fingers: [1, 3, 4, 2, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 3, finger: 1 },
      tips: "Fコードの形を3フレットに移動した形です。"
    }
  ],
  "Gm": [
    {
      name: "3フレット バレー（基本）",
      baseFret: 3,
      frets: [3, 5, 5, 3, 3, 3],
      fingers: [1, 3, 4, 1, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 3, finger: 1 },
      tips: "Fmの形を3フレットに移動したバレーコードです。"
    }
  ],
  "G7": [
    {
      name: "ローコード（基本）",
      baseFret: 1,
      frets: [3, 2, 0, 0, 0, 1],
      fingers: [3, 2, 0, 0, 0, 1],
      barre: null,
      tips: "人差し指で1弦1フレットを押さえます。Cコードに戻りたくなる強い推進力を生みます。"
    },
    {
      name: "3フレット バレー",
      baseFret: 3,
      frets: [3, 5, 3, 4, 3, 3],
      fingers: [1, 3, 1, 2, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 3, finger: 1 },
      tips: "F7の形を3フレットに移動した形です。"
    }
  ],
  "Gm7": [
    {
      name: "3フレット バレー（基本）",
      baseFret: 3,
      frets: [3, 5, 3, 3, 3, 3],
      fingers: [1, 3, 1, 1, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 3, finger: 1 },
      tips: "人差し指のセーハと薬指5弦5フレットのみで押さえられます。"
    }
  ],
  "Gmaj7": [
    {
      name: "ローコード（美しい響き）",
      baseFret: 1,
      frets: [3, 2, 0, 0, 0, 2],
      fingers: [2, 1, 0, 0, 0, 3],
      barre: null,
      tips: "Gコードから1弦を2フレットに変えるだけ。洗練された爽やかな響きです。"
    },
    {
      name: "3フレット バレー",
      baseFret: 3,
      frets: [3, -1, 4, 4, 3, -1],
      fingers: [1, 0, 3, 4, 2, 0],
      barre: null,
      tips: "シティポップやボサノヴァで頻出するおしゃれフォームです。"
    }
  ],
  "Gsus4": [
    {
      name: "ローコード（基本）",
      baseFret: 1,
      frets: [3, 2, 0, 0, 1, 3],
      fingers: [3, 2, 0, 0, 1, 4],
      barre: null,
      tips: "人差し指で2弦1フレットを押さえます。"
    }
  ],
  "Gadd9": [
    {
      name: "ローコード（煌びやか）",
      baseFret: 1,
      frets: [3, 0, 0, 2, 0, 3],
      fingers: [2, 0, 0, 1, 0, 3],
      barre: null,
      tips: "3弦2フレットを押さえます。アコギのストロークに最高の響きです。"
    }
  ],

  // ==========================================
  // === G# / Ab ===
  // ==========================================
  "Ab": [
    {
      name: "4フレット バレー（基本・6弦ルート）",
      baseFret: 4,
      frets: [4, 6, 6, 5, 4, 4],
      fingers: [1, 3, 4, 2, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 4, finger: 1 },
      tips: "Fコードの形を4フレットでセーハします。"
    }
  ],
  "Abm": [
    {
      name: "4フレット バレー（基本）",
      baseFret: 4,
      frets: [4, 6, 6, 4, 4, 4],
      fingers: [1, 3, 4, 1, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 4, finger: 1 },
      tips: "Fmの形を4フレットでセーハします。"
    }
  ],
  "Ab7": [
    {
      name: "4フレット バレー",
      baseFret: 4,
      frets: [4, 6, 4, 5, 4, 4],
      fingers: [1, 3, 1, 2, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 4, finger: 1 },
      tips: "F7の形を4フレットでセーハします。"
    }
  ],
  "Abm7": [
    {
      name: "4フレット バレー",
      baseFret: 4,
      frets: [4, 6, 4, 4, 4, 4],
      fingers: [1, 3, 1, 1, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 4, finger: 1 },
      tips: "人差し指のセーハに薬指5弦6フレットのみで押さえます。"
    }
  ],
  "Abmaj7": [
    {
      name: "4フレット バレー",
      baseFret: 4,
      frets: [4, -1, 5, 5, 4, -1],
      fingers: [1, 0, 3, 4, 2, 0],
      barre: null,
      tips: "ボサノヴァ・ジャズに最適のおしゃれフォームです。"
    }
  ],
  "Absus4": [
    {
      name: "4フレット バレー",
      baseFret: 4,
      frets: [4, 6, 6, 6, 4, 4],
      fingers: [1, 3, 4, 4, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 4, finger: 1 },
      tips: "Fsus4の形を4フレットで押さえます。"
    }
  ],
  "Abadd9": [
    {
      name: "4フレット バレー",
      baseFret: 4,
      frets: [4, 6, 6, 5, 4, 6],
      fingers: [1, 3, 4, 2, 1, 4],
      barre: { fromString: 1, toString: 6, fret: 4, finger: 1 },
      tips: "1弦6フレットを小指で押さえます。"
    }
  ],

  // ==========================================
  // === A (ラ) ===
  // ==========================================
  "A": [
    {
      name: "ローコード（基本）",
      baseFret: 1,
      frets: [-1, 0, 2, 2, 2, 0],
      fingers: [0, 0, 1, 2, 3, 0],
      barre: null,
      tips: "2フレットに指3本がぎゅっと詰まる形。人差し指を寝かせて3本まとめてセーハするプロも多いです。"
    },
    {
      name: "5フレット バレー（6弦ルート）",
      baseFret: 5,
      frets: [5, 7, 7, 6, 5, 5],
      fingers: [1, 3, 4, 2, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 5, finger: 1 },
      tips: "Fコードの形を5フレットで押さえます。"
    }
  ],
  "Am": [
    {
      name: "ローコード（基本）",
      baseFret: 1,
      frets: [-1, 0, 2, 2, 1, 0],
      fingers: [0, 0, 2, 3, 1, 0],
      barre: null,
      tips: "Eコードの形が1本ずつ下の弦にズレた形です。6弦は親指で軽く触れてミュートします。"
    },
    {
      name: "5フレット バレー",
      baseFret: 5,
      frets: [5, 7, 7, 5, 5, 5],
      fingers: [1, 3, 4, 1, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 5, finger: 1 },
      tips: "Fmの形を5フレットで押さえます。"
    }
  ],
  "A7": [
    {
      name: "ローコード（指2本・基本）",
      baseFret: 1,
      frets: [-1, 0, 2, 0, 2, 0],
      fingers: [0, 0, 1, 0, 2, 0],
      barre: null,
      tips: "真ん中の3弦を開放にするだけで抜けの良いブルージーな響きになります。"
    },
    {
      name: "5フレット バレー",
      baseFret: 5,
      frets: [5, 7, 5, 6, 5, 5],
      fingers: [1, 3, 1, 2, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 5, finger: 1 },
      tips: "F7の形を5フレットで押さえます。"
    }
  ],
  "Am7": [
    {
      name: "ローコード（指2本・超簡単）",
      baseFret: 1,
      frets: [-1, 0, 2, 0, 1, 0],
      fingers: [0, 0, 2, 0, 1, 0],
      barre: null,
      tips: "Amから薬指を離すだけ！非常に綺麗でメロウな響きです。"
    },
    {
      name: "5フレット バレー",
      baseFret: 5,
      frets: [5, 7, 5, 5, 5, 5],
      fingers: [1, 3, 1, 1, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 5, finger: 1 },
      tips: "Fm7の形を5フレットで押さえます。"
    }
  ],
  "Amaj7": [
    {
      name: "ローコード（指3本）",
      baseFret: 1,
      frets: [-1, 0, 2, 1, 2, 0],
      fingers: [0, 0, 2, 1, 3, 0],
      barre: null,
      tips: "アコギ特有の柔らかく甘い響きになります。"
    },
    {
      name: "5フレット バレー",
      baseFret: 5,
      frets: [5, -1, 6, 6, 5, -1],
      fingers: [1, 0, 3, 4, 2, 0],
      barre: null,
      tips: "ジャズ・ボサノヴァで重宝する定番フォームです。"
    }
  ],
  "Asus4": [
    {
      name: "ローコード（基本）",
      baseFret: 1,
      frets: [-1, 0, 2, 2, 3, 0],
      fingers: [0, 0, 1, 2, 4, 0],
      barre: null,
      tips: "2弦3フレットを小指で押さえます。Aコードへの解決で定番です。"
    }
  ],
  "Aadd9": [
    {
      name: "ローコード（煌びやか）",
      baseFret: 1,
      frets: [-1, 0, 2, 4, 2, 0],
      fingers: [0, 0, 1, 3, 2, 0],
      barre: null,
      tips: "スピッツや秦基博さんなどのアコースティック名曲で頻出する煌びやかなコードです。"
    }
  ],

  // ==========================================
  // === A# / Bb ===
  // ==========================================
  "Bb": [
    {
      name: "1フレット バレー（基本・5弦ルート）",
      baseFret: 1,
      frets: [-1, 1, 3, 3, 3, 1],
      fingers: [0, 1, 3, 3, 3, 1],
      barre: { fromString: 1, toString: 5, fret: 1, finger: 1 },
      tips: "Aコードの形を1フレットでセーハします。"
    },
    {
      name: "6フレット バレー（6弦ルート）",
      baseFret: 6,
      frets: [6, 8, 8, 7, 6, 6],
      fingers: [1, 3, 4, 2, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 6, finger: 1 },
      tips: "Fコードの形を6フレットでセーハします。"
    }
  ],
  "Bbm": [
    {
      name: "1フレット バレー（基本）",
      baseFret: 1,
      frets: [-1, 1, 3, 3, 2, 1],
      fingers: [0, 1, 3, 4, 2, 1],
      barre: { fromString: 1, toString: 5, fret: 1, finger: 1 },
      tips: "Amの形を1フレットでセーハします。"
    },
    {
      name: "6フレット バレー",
      baseFret: 6,
      frets: [6, 8, 8, 6, 6, 6],
      fingers: [1, 3, 4, 1, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 6, finger: 1 },
      tips: "Fmの形を6フレットでセーハします。"
    }
  ],
  "Bb7": [
    {
      name: "1フレット バレー",
      baseFret: 1,
      frets: [-1, 1, 3, 1, 3, 1],
      fingers: [0, 1, 3, 1, 4, 1],
      barre: { fromString: 1, toString: 5, fret: 1, finger: 1 },
      tips: "A7の形を1フレットで押さえます。"
    }
  ],
  "Bbm7": [
    {
      name: "1フレット バレー",
      baseFret: 1,
      frets: [-1, 1, 3, 1, 2, 1],
      fingers: [0, 1, 3, 1, 2, 1],
      barre: { fromString: 1, toString: 5, fret: 1, finger: 1 },
      tips: "Am7の形を1フレットで押さえます。"
    }
  ],
  "Bbmaj7": [
    {
      name: "1フレット バレー",
      baseFret: 1,
      frets: [-1, 1, 3, 2, 3, 1],
      fingers: [0, 1, 3, 2, 4, 1],
      barre: { fromString: 1, toString: 5, fret: 1, finger: 1 },
      tips: "Amaj7の形を1フレットで押さえます。"
    }
  ],
  "Bbsus4": [
    {
      name: "1フレット バレー",
      baseFret: 1,
      frets: [-1, 1, 3, 3, 4, 1],
      fingers: [0, 1, 3, 3, 4, 1],
      barre: { fromString: 1, toString: 5, fret: 1, finger: 1 },
      tips: "Asus4の形を1フレットで押さえます。"
    }
  ],
  "Bbadd9": [
    {
      name: "1フレット バレー",
      baseFret: 1,
      frets: [-1, 1, 3, 5, 3, 1],
      fingers: [0, 1, 2, 4, 2, 1],
      barre: { fromString: 1, toString: 5, fret: 1, finger: 1 },
      tips: "洗練されたモダンポップス定番コードです。"
    }
  ],

  // ==========================================
  // === B (シ) ===
  // ==========================================
  "B": [
    {
      name: "2フレット バレー（基本・5弦ルート）",
      baseFret: 2,
      frets: [-1, 2, 4, 4, 4, 2],
      fingers: [0, 1, 3, 3, 3, 1],
      barre: { fromString: 1, toString: 5, fret: 2, finger: 1 },
      tips: "Aコードの形を2フレットに移動したバレーコードです。"
    },
    {
      name: "7フレット バレー（6弦ルート）",
      baseFret: 7,
      frets: [7, 9, 9, 8, 7, 7],
      fingers: [1, 3, 4, 2, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 7, finger: 1 },
      tips: "Fコードの形を7フレットで押さえます。"
    }
  ],
  "Bm": [
    {
      name: "2フレット バレー（基本）",
      baseFret: 2,
      frets: [-1, 2, 4, 4, 3, 2],
      fingers: [0, 1, 3, 4, 2, 1],
      barre: { fromString: 1, toString: 5, fret: 2, finger: 1 },
      tips: "Amの形を2フレットに移動した形。人差し指の第2関節あたりを弦にフィットさせるのがコツです。"
    },
    {
      name: "簡単フォーム（セーハなし）",
      baseFret: 1,
      frets: [-1, -1, 4, 4, 3, 2],
      fingers: [0, 0, 3, 4, 2, 1],
      barre: null,
      tips: "6弦・5弦を弾かず、人差し指で1弦2フレットのみを押さえる初心者安心フォームです。"
    },
    {
      name: "7フレット バレー（6弦ルート）",
      baseFret: 7,
      frets: [7, 9, 9, 7, 7, 7],
      fingers: [1, 3, 4, 1, 1, 1],
      barre: { fromString: 1, toString: 6, fret: 7, finger: 1 },
      tips: "Fmの形を7フレットで押さえます。"
    }
  ],
  "B7": [
    {
      name: "ローコード（基本）",
      baseFret: 1,
      frets: [-1, 2, 1, 2, 0, 2],
      fingers: [0, 2, 1, 3, 0, 4],
      barre: null,
      tips: "指4本を使いますが、セーハがないので慣れると弾きやすいです。フォークソングやアコギ定番。"
    },
    {
      name: "2フレット バレー",
      baseFret: 2,
      frets: [-1, 2, 4, 2, 4, 2],
      fingers: [0, 1, 3, 1, 4, 1],
      barre: { fromString: 1, toString: 5, fret: 2, finger: 1 },
      tips: "A7の形を2フレットで押さえます。"
    }
  ],
  "Bm7": [
    {
      name: "2フレット バレー（基本）",
      baseFret: 2,
      frets: [-1, 2, 4, 2, 3, 2],
      fingers: [0, 1, 3, 1, 2, 1],
      barre: { fromString: 1, toString: 5, fret: 2, finger: 1 },
      tips: "Bmから小指を離した形です。人差し指のセーハをしっかり鳴らしましょう。"
    },
    {
      name: "簡単フォーム（セーハなし）",
      baseFret: 1,
      frets: [-1, 2, 0, 2, 0, 2],
      fingers: [0, 1, 0, 2, 0, 3],
      barre: null,
      tips: "セーハなしで指3本で押さえられる響きの良いオープンコードです。"
    }
  ],
  "Bmaj7": [
    {
      name: "2フレット バレー",
      baseFret: 2,
      frets: [-1, 2, 4, 3, 4, 2],
      fingers: [0, 1, 3, 2, 4, 1],
      barre: { fromString: 1, toString: 5, fret: 2, finger: 1 },
      tips: "Amaj7の形を2フレットで押さえます。"
    }
  ],
  "Bsus4": [
    {
      name: "2フレット バレー",
      baseFret: 2,
      frets: [-1, 2, 4, 4, 5, 2],
      fingers: [0, 1, 3, 3, 4, 1],
      barre: { fromString: 1, toString: 5, fret: 2, finger: 1 },
      tips: "Asus4の形を2フレットで押さえます。"
    }
  ],
  "Badd9": [
    {
      name: "2フレット バレー",
      baseFret: 2,
      frets: [-1, 2, 4, 6, 4, 2],
      fingers: [0, 1, 2, 4, 2, 1],
      barre: { fromString: 1, toString: 5, fret: 2, finger: 1 },
      tips: "広がりのある爽快な響きです。"
    }
  ],

  // ==========================================
  // === オンコード / 分数コード（定番） ===
  // ==========================================
  "D/F#": [
    {
      name: "親指グリップ（定番）",
      baseFret: 1,
      frets: [2, 0, 0, 2, 3, 2],
      fingers: ['T', 0, 0, 1, 3, 2],
      barre: null,
      tips: "6弦2フレットを親指で上から押さえます。G → D/F# → Em のベースライン下降で必須です。"
    },
    {
      name: "指立てフォーム",
      baseFret: 1,
      frets: [2, -1, 0, 2, 3, 2],
      fingers: [1, 0, 0, 2, 4, 3],
      barre: null,
      tips: "人差し指で6弦2フレットを押さえ、5弦は人差し指の腹で軽く触れてミュートします。"
    }
  ],
  "G/B": [
    {
      name: "ローコード（5弦ベース）",
      baseFret: 1,
      frets: [-1, 2, 0, 0, 3, 3],
      fingers: [0, 1, 0, 0, 3, 4],
      barre: null,
      tips: "6弦は鳴らさず、5弦2フレット（シの音）をベースとしてクリアに響かせます。"
    }
  ],
  "C/E": [
    {
      name: "ローコード（6弦開放ベース）",
      baseFret: 1,
      frets: [0, 3, 2, 0, 1, 0],
      fingers: [0, 3, 2, 0, 1, 0],
      barre: null,
      tips: "通常のCコードの形で6弦開放（ミの音）も一緒に鳴らします。重厚で温かい広がりが出ます。"
    }
  ],
  "F/A": [
    {
      name: "ローコード（5弦開放ベース）",
      baseFret: 1,
      frets: [-1, 0, 3, 2, 1, 1],
      fingers: [0, 0, 3, 2, 1, 1],
      barre: { fromString: 1, toString: 2, fret: 1, finger: 1 },
      tips: "5弦開放（ラ）をベースにしたFコードです。親しみやすい軽やかな響きになります。"
    }
  ],
  "A/C#": [
    {
      name: "4フレット バレー",
      baseFret: 2,
      frets: [-1, 4, 2, 2, 2, -1],
      fingers: [0, 4, 1, 1, 1, 0],
      barre: { fromString: 2, toString: 4, fret: 2, finger: 1 },
      tips: "5弦4フレット（C#）を小指で押さえ、2〜4弦2フレットを人差し指でセーハします。"
    }
  ]
};

// 異名同音（エイリアス）マップ
const ROOT_ALIASES = {
  "Db": "C#",
  "Eb": "D#",
  "Gb": "F#",
  "Ab": "G#",
  "Bb": "A#"
};

const ROOT_REVERSE_ALIASES = {
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab",
  "A#": "Bb"
};

/**
 * 6弦・5弦ルートのCAGEDバレーコード自動生成（いかなるコードも絶対に抜け落ちないフォールバック）
 */
function generateFallbackPositions(root, type) {
  // 半音インデックス
  const chromatic = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const flatChrom = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

  let normRoot = ROOT_ALIASES[root] || root;
  let rootIndex = chromatic.indexOf(normRoot);
  if (rootIndex === -1) {
    normRoot = ROOT_REVERSE_ALIASES[root] || root;
    rootIndex = flatChrom.indexOf(normRoot);
  }
  if (rootIndex === -1) return null;

  // 6弦ルート（Eフォーム）のフレット番号 = (rootIndex - 4 + 12) % 12
  const fret6 = (rootIndex - 4 + 12) % 12 || 12;
  // 5弦ルート（Aフォーム）のフレット番号 = (rootIndex - 9 + 12) % 12
  const fret5 = (rootIndex - 9 + 12) % 12 || 12;

  const positions = [];

  // 1. 5弦ルートバレー
  if (fret5 <= 11) {
    if (type === "" || type === "M") {
      positions.push({
        name: `${fret5}フレット バレー（5弦ルート）`,
        baseFret: fret5,
        frets: [-1, fret5, fret5 + 2, fret5 + 2, fret5 + 2, fret5],
        fingers: [0, 1, 3, 3, 3, 1],
        barre: { fromString: 1, toString: 5, fret: fret5, finger: 1 },
        tips: `5弦${fret5}フレットをルートとするAフォームのバレーコードです。`
      });
    } else if (type === "m") {
      positions.push({
        name: `${fret5}フレット バレー（5弦ルート）`,
        baseFret: fret5,
        frets: [-1, fret5, fret5 + 2, fret5 + 2, fret5 + 1, fret5],
        fingers: [0, 1, 3, 4, 2, 1],
        barre: { fromString: 1, toString: 5, fret: fret5, finger: 1 },
        tips: `5弦${fret5}フレットをルートとするAmフォームのバレーコードです。`
      });
    } else if (type === "7") {
      positions.push({
        name: `${fret5}フレット バレー（5弦ルート）`,
        baseFret: fret5,
        frets: [-1, fret5, fret5 + 2, fret5, fret5 + 2, fret5],
        fingers: [0, 1, 3, 1, 4, 1],
        barre: { fromString: 1, toString: 5, fret: fret5, finger: 1 },
        tips: `5弦${fret5}フレットをルートとするA7フォームです。`
      });
    } else if (type === "m7") {
      positions.push({
        name: `${fret5}フレット バレー（5弦ルート）`,
        baseFret: fret5,
        frets: [-1, fret5, fret5 + 2, fret5, fret5 + 1, fret5],
        fingers: [0, 1, 3, 1, 2, 1],
        barre: { fromString: 1, toString: 5, fret: fret5, finger: 1 },
        tips: `5弦${fret5}フレットをルートとするAm7フォームです。`
      });
    } else if (type === "maj7") {
      positions.push({
        name: `${fret5}フレット バレー（5弦ルート）`,
        baseFret: fret5,
        frets: [-1, fret5, fret5 + 2, fret5 + 1, fret5 + 2, fret5],
        fingers: [0, 1, 3, 2, 4, 1],
        barre: { fromString: 1, toString: 5, fret: fret5, finger: 1 },
        tips: `5弦${fret5}フレットをルートとするAmaj7フォームです。`
      });
    } else if (type === "sus4") {
      positions.push({
        name: `${fret5}フレット バレー（5弦ルート）`,
        baseFret: fret5,
        frets: [-1, fret5, fret5 + 2, fret5 + 2, fret5 + 3, fret5],
        fingers: [0, 1, 3, 3, 4, 1],
        barre: { fromString: 1, toString: 5, fret: fret5, finger: 1 },
        tips: `5弦${fret5}フレットをルートとするAsus4フォームです。`
      });
    } else if (type === "dim" || type === "dim7") {
      positions.push({
        name: `${fret5}フレット（5弦ルート）`,
        baseFret: Math.max(1, fret5 - 1),
        frets: [-1, fret5, fret5 + 1, fret5 - 1, fret5 + 1, -1],
        fingers: [0, 2, 3, 1, 4, 0],
        barre: null,
        tips: "緊張感と解決感を生み出すディミニッシュコード。経過音として重宝します。"
      });
    } else if (type === "m7b5") {
      positions.push({
        name: `${fret5}フレット（5弦ルート定番）`,
        baseFret: fret5,
        frets: [-1, fret5, fret5 + 1, fret5, fret5 + 1, -1],
        fingers: [0, 1, 3, 2, 4, 0],
        barre: null,
        tips: "J-POPやジャズの切ないマイナーツーファイブ進行で主役となる重要コードです。"
      });
    }
  }

  // 2. 6弦ルートバレー
  if (fret6 <= 11) {
    if (type === "" || type === "M") {
      positions.push({
        name: `${fret6}フレット バレー（6弦ルート）`,
        baseFret: fret6,
        frets: [fret6, fret6 + 2, fret6 + 2, fret6 + 1, fret6, fret6],
        fingers: [1, 3, 4, 2, 1, 1],
        barre: { fromString: 1, toString: 6, fret: fret6, finger: 1 },
        tips: `6弦${fret6}フレットをルートとするEフォームのバレーコードです。`
      });
    } else if (type === "m") {
      positions.push({
        name: `${fret6}フレット バレー（6弦ルート）`,
        baseFret: fret6,
        frets: [fret6, fret6 + 2, fret6 + 2, fret6, fret6, fret6],
        fingers: [1, 3, 4, 1, 1, 1],
        barre: { fromString: 1, toString: 6, fret: fret6, finger: 1 },
        tips: `6弦${fret6}フレットをルートとするEmフォームのバレーコードです。`
      });
    } else if (type === "7") {
      positions.push({
        name: `${fret6}フレット バレー（6弦ルート）`,
        baseFret: fret6,
        frets: [fret6, fret6 + 2, fret6, fret6 + 1, fret6, fret6],
        fingers: [1, 3, 1, 2, 1, 1],
        barre: { fromString: 1, toString: 6, fret: fret6, finger: 1 },
        tips: `6弦${fret6}フレットをルートとするE7フォームです。`
      });
    } else if (type === "m7") {
      positions.push({
        name: `${fret6}フレット バレー（6弦ルート）`,
        baseFret: fret6,
        frets: [fret6, fret6 + 2, fret6, fret6, fret6, fret6],
        fingers: [1, 3, 1, 1, 1, 1],
        barre: { fromString: 1, toString: 6, fret: fret6, finger: 1 },
        tips: `6弦${fret6}フレットをルートとするEm7フォームです。`
      });
    } else if (type === "maj7") {
      positions.push({
        name: `${fret6}フレット バレー（6弦ルート）`,
        baseFret: fret6,
        frets: [fret6, -1, fret6 + 1, fret6 + 1, fret6, -1],
        fingers: [1, 0, 3, 4, 2, 0],
        barre: null,
        tips: `6弦${fret6}フレットをルートとするEmaj7フォームです。`
      });
    } else if (type === "sus4") {
      positions.push({
        name: `${fret6}フレット バレー（6弦ルート）`,
        baseFret: fret6,
        frets: [fret6, fret6 + 2, fret6 + 2, fret6 + 2, fret6, fret6],
        fingers: [1, 3, 4, 4, 1, 1],
        barre: { fromString: 1, toString: 6, fret: fret6, finger: 1 },
        tips: `6弦${fret6}フレットをルートとするEsus4フォームです。`
      });
    } else if (type === "m7b5") {
      positions.push({
        name: `${fret6}フレット（6弦ルート）`,
        baseFret: fret6,
        frets: [fret6, -1, fret6, fret6, fret6 - 1, -1],
        fingers: [2, 0, 3, 4, 1, 0],
        barre: null,
        tips: "親指や中指で6弦を押さえ、5弦と1弦をミュートするジャズスタイルです。"
      });
    }
  }

  return positions.length > 0 ? positions : null;
}

/**
 * コード名からポジションデータを取得
 * 1. 直接登録データを検索
 * 2. 異名同音（Db ⇔ C# 等）を検索
 * 3. CAGED自動生成エンジンによる導出
 */
function getChordPositions(chordName) {
  if (!chordName) return null;

  // 1. 直接一致
  if (CHORD_DATABASE[chordName] && CHORD_DATABASE[chordName].length > 0) {
    return CHORD_DATABASE[chordName];
  }

  // 2. ルート音の正規化（Db -> C#, Eb -> D# など）
  const match = chordName.match(/^([A-G][#b]?)(.*)$/);
  if (match) {
    const root = match[1];
    const type = match[2];

    const altRoot1 = ROOT_ALIASES[root];
    if (altRoot1 && CHORD_DATABASE[altRoot1 + type]) {
      return CHORD_DATABASE[altRoot1 + type];
    }

    const altRoot2 = ROOT_REVERSE_ALIASES[root];
    if (altRoot2 && CHORD_DATABASE[altRoot2 + type]) {
      return CHORD_DATABASE[altRoot2 + type];
    }

    // 3. 自動生成エンジンによる高精度フォールバック
    const generated = generateFallbackPositions(root, type);
    if (generated && generated.length > 0) {
      return generated;
    }
  }

  return null;
}

// 利用可能なルート音とタイプの一覧
const AVAILABLE_ROOTS = [
  "C", "C# / Db", "D", "D# / Eb", "E", "F",
  "F# / Gb", "G", "G# / Ab", "A", "A# / Bb", "B"
];

const AVAILABLE_TYPES = [
  { label: "Major (基本)", suffix: "" },
  { label: "Minor (m)", suffix: "m" },
  { label: "7th (7)", suffix: "7" },
  { label: "Minor 7th (m7)", suffix: "m7" },
  { label: "Major 7th (maj7)", suffix: "maj7" },
  { label: "sus4", suffix: "sus4" },
  { label: "add9", suffix: "add9" },
  { label: "dim", suffix: "dim" },
  { label: "m7b5 (半減音)", suffix: "m7b5" }
];
