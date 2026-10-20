/**
 * Real-time Guitar Tuner Module
 * Web Audio API & マイク入力による自己相関（Autocorrelation）ピッチ検出チューナー
 */

class GuitarTuner {
  constructor(options = {}) {
    this.audioCtx = null;
    this.analyser = null;
    this.micStream = null;
    this.isListening = false;
    this.rafId = null;

    // コールバック
    this.onPitchDetected = options.onPitchDetected || (() => {});
    this.onError = options.onError || (() => {});

    // レギュラーチューニング基準弦 (6弦〜1弦)
    this.tuningNotes = [
      { stringNum: 6, note: "E2", freq: 82.41, name: "6弦 (E)" },
      { stringNum: 5, note: "A2", freq: 110.00, name: "5弦 (A)" },
      { stringNum: 4, note: "D3", freq: 146.83, name: "4弦 (D)" },
      { stringNum: 3, note: "G3", freq: 196.00, name: "3弦 (G)" },
      { stringNum: 2, note: "B3", freq: 246.94, name: "2弦 (B)" },
      { stringNum: 1, note: "E4", freq: 329.63, name: "1弦 (E)" }
    ];
  }

  async start() {
    if (this.isListening) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
          latency: 0
        }
      });

      const source = this.audioCtx.createMediaStreamSource(this.micStream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;

      source.connect(this.analyser);
      this.isListening = true;
      this.detectPitchLoop();
    } catch (err) {
      console.error("Tuner mic access error:", err);
      this.onError(err);
      this.stop();
    }
  }

  stop() {
    this.isListening = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }

  detectPitchLoop() {
    if (!this.isListening || !this.analyser) return;

    const buffer = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(buffer);

    const pitch = this.autoCorrelate(buffer, this.audioCtx.sampleRate);

    if (pitch !== -1) {
      const analysis = this.analyzePitch(pitch);
      this.onPitchDetected(analysis);
    } else {
      this.onPitchDetected({
        freq: null,
        closestNote: null,
        cents: 0,
        isInTune: false
      });
    }

    this.rafId = requestAnimationFrame(() => this.detectPitchLoop());
  }

  /**
   * 自己相関アルゴリズムで基本周波数を算出
   */
  autoCorrelate(buffer, sampleRate) {
    const SIZE = buffer.length;
    let sumOfSquares = 0;
    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i];
      sumOfSquares += val * val;
    }
    const rms = Math.sqrt(sumOfSquares / SIZE);

    // 音量が小さすぎる場合は無音と判定 (ノイズカット)
    if (rms < 0.015) return -1;

    // クリッピングのトリミング
    let r1 = 0, r2 = SIZE - 1;
    const threshold = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < threshold) { r1 = i; break; }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < threshold) { r2 = SIZE - i; break; }
    }

    const trimmedBuffer = buffer.slice(r1, r2);
    const trimmedSize = trimmedBuffer.length;

    const c = new Array(trimmedSize).fill(0);
    for (let i = 0; i < trimmedSize; i++) {
      for (let j = 0; j < trimmedSize - i; j++) {
        c[i] = c[i] + trimmedBuffer[j] * trimmedBuffer[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < trimmedSize; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;

    // パラボラ補間でピークを高精度推定
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    const freq = sampleRate / T0;

    // ギターの音域外 (60Hz〜600Hz) は除外
    if (freq < 60 || freq > 650) return -1;

    return freq;
  }

  /**
   * 検出された周波数をギターの各弦の目標周波数と比較
   */
  analyzePitch(freq) {
    let closestNote = this.tuningNotes[0];
    let minDiff = Infinity;

    for (const tn of this.tuningNotes) {
      const diff = Math.abs(freq - tn.freq);
      if (diff < minDiff) {
        minDiff = diff;
        closestNote = tn;
      }
    }

    // セント誤差計算 (1半音 = 100 cents)
    const cents = 1200 * Math.log2(freq / closestNote.freq);
    const isInTune = Math.abs(cents) <= 4; // ±4セント以内なら合格

    return {
      freq: Math.round(freq * 10) / 10,
      closestNote: closestNote,
      cents: Math.max(-50, Math.min(50, cents)),
      isInTune: isInTune
    };
  }

  /**
   * 各弦の基準音（音叉）をスピーカーから鳴らす
   */
  playReferenceTone(stringNum) {
    const target = this.tuningNotes.find(t => t.stringNum === stringNum);
    if (!target || !window.audioEngine) return;

    window.audioEngine.init();
    const ctx = window.audioEngine.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(target.freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 3.0);
  }
}

window.guitarTuner = new GuitarTuner();
