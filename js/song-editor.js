/**
 * Song & Lyrics Player / Editor
 * 歌詞＋コード記法（[Chord]歌詞）の解析、自動スクロール、コードタップ再生、LocalStorage保存
 */

class SongManager {
  constructor() {
    this.storageKey = "guitar_app_saved_songs";
    this.currentSong = null;
    this.scrollInterval = null;
    this.isScrolling = false;
    this.scrollSpeed = 2; // 1〜5

    // サンプル曲プリセット
    this.defaultSongs = [
      {
        id: "sample_marigold",
        title: "マリーゴールド",
        artist: "あいみょん",
        capo: 2,
        bpm: 106,
        content: `[Intro]
[C] [G] [Am] [Em] [F] [C] [F] [G]

[Verse]
[C]風の強さが[G]ちょっと
[Am]心を揺さぶり[Em]すぎて
[F]真面目に見つ[C]めた
[F]君が恋[G]しい

[C]でんぐり返し[G]の日々
[Am]可哀想な[Em]僕らは
[F]どこへ向かう[C]のだろう
[F]明日は[G]きっと

[Chorus]
[C]麦わらの[G]帽子の君が
[Am]揺れたマリー[Em]ゴールドに似てる
[F]あれは空が[C]まだ青い
[Dm7]夏のこと[G]だった
[C]懐かしいと[G]笑えたあの日の
[Am]恋「もう離れ[Em]ないよ」と
[F]小さく呟[G]いた [C]あぁ`
      },
      {
        id: "sample_cherry",
        title: "チェリー",
        artist: "スピッツ",
        capo: 0,
        bpm: 98,
        content: `[Intro]
[C] [G] [Am] [Em] [F] [C] [Dm7] [G7]

[Verse]
[C]君と出逢[G]った奇跡[Am]が
この胸[Em]にあふれてる
[F]きっと今は[C]自由に空も[Dm7]飛べるは[G7]ず

[C]夢を濡[G]らした涙[Am]が
乾くま[Em]でのぬくもり
[F]奪った手の[C]ひらの中に
[Dm7]残る [G7]宝物

[Chorus]
[C]愛してるの[G]響きだけで
[Am]強くなれる[Em]気がしたよ
[F]ささやかな[C]喜びを
[Dm7]つぶれるほど[G7]抱きしめて`
      },
      {
        id: "sample_dryflower",
        title: "ドライフラワー",
        artist: "優里",
        capo: 0,
        bpm: 74,
        content: `[Verse]
[C]多分、私[G]じゃなくていいね
[Am]余裕のない[Em]二人だったし
[F]気付けば暗い[C]部屋も
[Dm7]平気になっ[G]てた

[C]「ずっと一緒[G]にいようね」って
[Am]言ってたの[Em]は誰だっけ
[F]思い出す[C]ほどに
[Dm7]胸が痛[G]いよ

[Chorus]
[F]声も顔も[G]不器用なとこも
[Em]全部全部[Am]嫌いじゃないの
[Dm7]ドライフラワーみたい[G]
君との日々[C]も色褪せ[C7]てく`
      },
      {
        id: "sample_stand_by_me",
        title: "Stand By Me（スタンド・バイ・ミー）",
        artist: "Ben E. King",
        capo: 0,
        bpm: 110,
        content: `[G]When the night has come
[Em]And the land is dark
And the [C]moon is the [D]only light we'll [G]see

[G]No I won't be afraid
Oh I [Em]won't be afraid
Just as [C]long as you [D]stand, stand by [G]me

So darling, darling, [G]stand by me, oh [Em]stand by me
Oh [C]stand, [D]stand by me, [G]stand by me`
      },
      {
        id: "sample_twinkle",
        title: "きらきら星（弾き語り入門）",
        artist: "童謡",
        capo: 0,
        bpm: 90,
        content: `[C]きらきら [F]ひかる [C]おそらの [G]ほしよ
[C]まばたき [F]しては [C]みんなを [G]みてる
[C]きらきら [F]ひかる [C]おそらの [G]ほし[C]よ`
      }
    ];

    this.songs = this.loadSongs();
  }

  loadSongs() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // デフォルト曲（マリーゴールド、チェリー等）が未登録なら追加
        const merged = [...parsed];
        this.defaultSongs.forEach(defSong => {
          if (!merged.some(s => s.id === defSong.id || s.title === defSong.title)) {
            merged.push(defSong);
          }
        });
        return merged;
      }
    } catch (e) {
      console.warn("LocalStorage load error:", e);
    }
    return [...this.defaultSongs];
  }

  saveSongs() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.songs));
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }
  }

  getSong(id) {
    return this.songs.find(s => s.id === id) || this.songs[0];
  }

  saveCurrentSong(songData) {
    const existingIdx = this.songs.findIndex(s => s.id === songData.id);
    if (existingIdx >= 0) {
      this.songs[existingIdx] = songData;
    } else {
      this.songs.push(songData);
    }
    this.saveSongs();
  }

  deleteSong(id) {
    this.songs = this.songs.filter(s => s.id !== id);
    this.saveSongs();
  }

  /**
   * 現在の曲をJSON文字列としてエクスポート
   */
  exportSong(id) {
    const s = this.getSong(id);
    return JSON.stringify(s, null, 2);
  }

  /**
   * JSON文字列から曲をインポート
   */
  importSong(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.title || !data.content) {
        throw new Error("無効な曲データ形式です");
      }
      data.id = "song_" + Date.now();
      this.saveCurrentSong(data);
      return data;
    } catch (e) {
      alert("インポートに失敗しました。正しい曲形式のテキストを入力してください。");
      return null;
    }
  }

  /**
   * テキスト中の「[Chord]歌詞」を解析してHTMLに変換
   */
  parseChordText(text, transposeSemitones = 0) {
    if (!text) return "";
    const lines = text.split('\n');

    return lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) {
        return `<div class="song-line-empty"></div>`;
      }

      // [Chord] でトークン分割
      const regex = /\[([A-Za-z0-9#b\+\-\/]+)\]/g;
      let lastIdx = 0;
      let match;
      let parts = [];

      while ((match = regex.exec(line)) !== null) {
        const lyricBefore = line.substring(lastIdx, match.index);
        if (lyricBefore || parts.length > 0) {
          parts.push({ type: "lyric", text: lyricBefore });
        }
        let chordName = match[1];
        if (transposeSemitones !== 0) {
          chordName = this.transposeChord(chordName, transposeSemitones);
        }
        parts.push({ type: "chord", text: chordName });
        lastIdx = regex.lastIndex;
      }

      const remaining = line.substring(lastIdx);
      if (remaining) {
        parts.push({ type: "lyric", text: remaining });
      }

      // コード記法のない普通の行
      if (parts.length === 0) {
        return `<div class="song-line"><span class="song-plain-text">${this.escapeHtml(line)}</span></div>`;
      }

      // コードと歌詞をペアリングしてレイアウト
      let html = `<div class="song-line">`;
      let currentChord = "";
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (p.type === "chord") {
          currentChord = p.text;
          const next = parts[i + 1];
          let lyricText = "&nbsp;";
          if (next && next.type === "lyric") {
            lyricText = this.escapeHtml(next.text);
            i++; // 歌詞も消費
          }
          html += `<span class="chord-syllable">
            <ruby class="chord-ruby">
              <span class="lyric-word">${lyricText}</span>
              <rt class="chord-rt" data-chord="${currentChord}">${currentChord}</rt>
            </ruby>
          </span>`;
        } else {
          html += `<span class="chord-syllable">
            <span class="lyric-word lyric-only">${this.escapeHtml(p.text)}</span>
          </span>`;
        }
      }
      html += `</div>`;
      return html;
    }).join("");
  }

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /**
   * コードの移調（半音上げ下げ）
   */
  transposeChord(chordName, semitones) {
    const scaleSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const scaleFlat  = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

    const rootMatch = chordName.match(/^([A-G][#b]?)(.*)$/);
    if (!rootMatch) return chordName;

    const root = rootMatch[1];
    const rest = rootMatch[2];

    let idx = scaleSharp.indexOf(root);
    if (idx === -1) idx = scaleFlat.indexOf(root);
    if (idx === -1) return chordName;

    let newIdx = (idx + semitones) % 12;
    if (newIdx < 0) newIdx += 12;

    const targetScale = chordName.includes('b') ? scaleFlat : scaleSharp;
    return targetScale[newIdx] + rest;
  }

  /**
   * 自動スクロール制御
   */
  startAutoScroll(containerElement) {
    if (this.isScrolling || !containerElement) return;
    this.isScrolling = true;

    const step = () => {
      if (!this.isScrolling) return;
      containerElement.scrollTop += this.scrollSpeed * 0.7;

      // 終端チェック
      if (containerElement.scrollTop + containerElement.clientHeight >= containerElement.scrollHeight - 5) {
        this.stopAutoScroll();
        return;
      }
      this.scrollInterval = requestAnimationFrame(step);
    };

    this.scrollInterval = requestAnimationFrame(step);
  }

  stopAutoScroll() {
    this.isScrolling = false;
    if (this.scrollInterval) {
      cancelAnimationFrame(this.scrollInterval);
      this.scrollInterval = null;
    }
  }

  toggleAutoScroll(containerElement) {
    if (this.isScrolling) {
      this.stopAutoScroll();
      return false;
    } else {
      this.startAutoScroll(containerElement);
      return true;
    }
  }

  /**
   * 曲のテキストから横流れ用フレーズリストを抽出
   */
  extractTimelinePhrases(text, transposeSemitones = 0) {
    if (!text) return [];
    const lines = text.split('\n');
    const phrases = [];
    let phraseIndex = 0;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const regex = /\[([A-Za-z0-9#b\+\-\/]+)\]/g;
      let lastIdx = 0;
      let match;
      let lineChords = [];

      while ((match = regex.exec(line)) !== null) {
        let chordName = match[1];
        if (transposeSemitones !== 0) {
          chordName = this.transposeChord(chordName, transposeSemitones);
        }
        lineChords.push({
          chord: chordName,
          indexInLine: match.index,
          lastIndex: regex.lastIndex
        });
      }

      if (lineChords.length === 0) return;

      for (let i = 0; i < lineChords.length; i++) {
        const cur = lineChords[i];
        const next = lineChords[i + 1];
        let lyricPart = "";
        if (next) {
          lyricPart = line.substring(cur.lastIndex, next.indexInLine).trim();
        } else {
          lyricPart = line.substring(cur.lastIndex).trim();
        }

        // イントロや間奏など歌詞がない場合
        if (!lyricPart) {
          if (line.includes("Intro")) lyricPart = "（イントロ）";
          else if (line.includes("Outro")) lyricPart = "（アウトロ）";
          else lyricPart = "♪ (間奏・和音)";
        }

        phrases.push({
          id: `phrase_${phraseIndex}`,
          index: phraseIndex,
          chord: cur.chord,
          lyric: lyricPart
        });
        phraseIndex++;
      }
    });

    return phrases;
  }

  /**
   * 曲に含まれるユニークなコード一覧を取得
   */
  getUniqueChordsInSong(text, transposeSemitones = 0) {
    if (!text) return [];
    const phrases = this.extractTimelinePhrases(text, transposeSemitones);
    const set = new Set();
    phrases.forEach(p => set.add(p.chord));
    return Array.from(set);
  }

  /**
   * 曲ごとの指定コードの押さえ方パターン設定
   */
  setPreferredChordPattern(songId, chordName, patternIndex) {
    const song = this.getSong(songId);
    if (!song) return;
    if (!song.preferredPatterns) {
      song.preferredPatterns = {};
    }
    song.preferredPatterns[chordName] = patternIndex;
    this.saveCurrentSong(song);
  }

  getPreferredChordPattern(songId, chordName) {
    const song = this.getSong(songId);
    if (!song || !song.preferredPatterns || song.preferredPatterns[chordName] === undefined) {
      return 0; // デフォルトはパターン1
    }
    return song.preferredPatterns[chordName];
  }
}
