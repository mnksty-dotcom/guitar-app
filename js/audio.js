/**
 * Guitar & Metronome Web Audio Engine
 * リアルなアコースティックギターの和音・単音再生およびメトロノーム機能
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    // ギターの開放弦基本周波数 (6弦〜1弦: E2, A2, D3, G3, B3, E4)
    this.openStringFreqs = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isInitialized = true;
  }

  // フレットと弦から周波数を計算 (stringIndex: 0=6弦, 5=1弦)
  getFrequency(stringIndex, fret) {
    if (fret < 0) return null; // ミュート
    const baseFreq = this.openStringFreqs[stringIndex];
    return baseFreq * Math.pow(2, fret / 12);
  }

  /**
   * 単音のピッキング音（アコースティックギター模倣合成）
   */
  playPluck(freq, time = null, duration = 1.8, velocity = 0.8) {
    this.init();
    if (!freq) return;

    const ctx = this.ctx;
    const startTime = time !== null ? time : ctx.currentTime;

    // 基本波形（三角波とノコギリ波のブレンドで暖かみと弦の倍音を表現）
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(freq * 1.002, startTime); // 微小なコーラス感

    // ピックのアタック音（超短時間のノイズバースト）
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.005));
    }
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25 * velocity, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.025);

    // アコースティックギター特有のボディ響き・弦のダンピング（ローパスフィルターの減衰）
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const initialCutoff = Math.min(6000, Math.max(1200, freq * 8));
    filter.frequency.setValueAtTime(initialCutoff, startTime);
    filter.frequency.exponentialRampToValueAtTime(Math.max(250, freq * 1.5), startTime + duration);

    // アンプエンベロープ（音量減衰）
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.001, startTime);
    mainGain.gain.linearRampToValueAtTime(0.45 * velocity, startTime + 0.006); // 素早い立ち上がり
    mainGain.gain.exponentialRampToValueAtTime(0.18 * velocity, startTime + 0.15); // 初期ディケイ
    mainGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); // 長いサステイン

    // 接続
    const oscBlend = ctx.createGain();
    oscBlend.gain.value = 0.35;
    osc2.connect(oscBlend);

    osc1.connect(filter);
    oscBlend.connect(filter);
    noiseNode.connect(noiseGain);
    noiseGain.connect(filter);

    filter.connect(mainGain);
    mainGain.connect(ctx.destination);

    // 再生開始と停止
    osc1.start(startTime);
    osc2.start(startTime);
    noiseNode.start(startTime);

    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
    noiseNode.stop(startTime + 0.04);
  }

  /**
   * コード全体のストローク（ダウンストローク/アップストローク）
   * @param {Array<number>} frets 6弦〜1弦のフレット配置 (例: [-1, 3, 2, 0, 1, 0] for C)
   * @param {string} direction 'down' or 'up'
   * @param {number} speed ストロークの速さ（秒）
   */
  playChord(frets, direction = 'down', speed = 0.15) {
    this.init();
    if (!frets || frets.length !== 6) return;

    const playableStrings = [];
    frets.forEach((fret, stringIdx) => {
      if (fret >= 0) {
        playableStrings.push({
          stringIdx,
          freq: this.getFrequency(stringIdx, fret)
        });
      }
    });

    if (direction === 'up') {
      playableStrings.reverse();
    }

    const interval = speed / Math.max(1, playableStrings.length);
    const now = this.ctx.currentTime;

    playableStrings.forEach((item, index) => {
      const stringDelay = index * interval;
      // 高域と低域で少しベロシティを変化させて自然に
      const vel = 0.75 + Math.random() * 0.15;
      this.playPluck(item.freq, now + stringDelay, 2.2, vel);
    });
  }

  /**
   * メトロノームのクリック音
   * @param {boolean} isAccent 1拍目（アクセント）かどうか
   * @param {number} time 再生予定時刻
   */
  playMetronomeClick(isAccent = false, time = null) {
    this.init();
    const ctx = this.ctx;
    const startTime = time !== null ? time : ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // アクセントは高めのウッドブロック風、通常拍は低め
    const pitch = isAccent ? 1400 : 850;
    osc.frequency.setValueAtTime(pitch, startTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, startTime + 0.03);

    const volume = isAccent ? 0.6 : 0.35;
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.05);
  }
}

// シングルトンとしてインスタンス化
window.audioEngine = new AudioEngine();
