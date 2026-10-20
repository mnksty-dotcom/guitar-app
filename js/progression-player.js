/**
 * Chord Progression Player & Builder
 * コード進行の作成・編集およびテンポ（BPM）同期の自動再生エンジン
 */

class ProgressionPlayer {
  constructor(options = {}) {
    this.bpm = options.bpm || 85;
    this.beatsPerBar = 4;
    this.soundEnabled = true;
    this.metronomeEnabled = true;
    this.countInEnabled = true;
    this.loopEnabled = true;

    // 現在のコード進行リスト [{ chord: "C", beats: 4 }, { chord: "G", beats: 4 }, ...]
    this.progression = [
      { chord: "C", beats: 4 },
      { chord: "G", beats: 4 },
      { chord: "Am", beats: 4 },
      { chord: "F", beats: 4 }
    ];

    // 再生状態
    this.isPlaying = false;
    this.isCountingIn = false;
    this.currentStepIndex = 0;
    this.currentBeat = 0;
    this.timerId = null;
    this.nextBeatTime = 0;
    this.lookahead = 25.0; // ms
    this.scheduleAheadTime = 0.1; // sec

    // コールバック
    this.onBeatChange = options.onBeatChange || (() => {});
    this.onChordChange = options.onChordChange || (() => {});
    this.onStateChange = options.onStateChange || (() => {});

    // プリセット進行集
    this.presets = {
      "pop": {
        name: "J-POP王道進行",
        desc: "エモくドラマチックな響き（米津玄師、あいみょん等多数）",
        chords: [{ chord: "F", beats: 4 }, { chord: "G", beats: 4 }, { chord: "Em", beats: 4 }, { chord: "Am", beats: 4 }]
      },
      "canon": {
        name: "カノン進行",
        desc: "世界で最も愛される心地よい名曲コード",
        chords: [
          { chord: "C", beats: 4 }, { chord: "G", beats: 4 },
          { chord: "Am", beats: 4 }, { chord: "Em", beats: 4 },
          { chord: "F", beats: 4 }, { chord: "C", beats: 4 },
          { chord: "F", beats: 4 }, { chord: "G", beats: 4 }
        ]
      },
      "komuro": {
        name: "小室進行（切ない哀愁）",
        desc: "疾走感と切なさを両立した大ヒット進行",
        chords: [{ chord: "Am", beats: 4 }, { chord: "F", beats: 4 }, { chord: "G", beats: 4 }, { chord: "C", beats: 4 }]
      },
      "marusa": {
        name: "丸サ進行（おしゃれネオソウル）",
        desc: "椎名林檎、YOASOBI、藤井風などで有名なおしゃれ進行",
        chords: [{ chord: "Fmaj7", beats: 4 }, { chord: "E7", beats: 4 }, { chord: "Am7", beats: 4 }, { chord: "C7", beats: 4 }]
      },
      "standby": {
        name: "スタンド・バイ・ミー進行",
        desc: "フォーク・ロックの原点となる黄金進行",
        chords: [{ chord: "G", beats: 4 }, { chord: "Em", beats: 4 }, { chord: "C", beats: 4 }, { chord: "D", beats: 4 }]
      }
    };
  }

  setBpm(newBpm) {
    this.bpm = Math.max(40, Math.min(240, newBpm));
  }

  loadPreset(presetKey) {
    if (this.presets[presetKey]) {
      this.progression = JSON.parse(JSON.stringify(this.presets[presetKey].chords));
      this.reset();
      return true;
    }
    return false;
  }

  addChord(chordName, beats = 4) {
    this.progression.push({ chord: chordName, beats: beats });
    this.onStateChange();
  }

  removeChord(index) {
    if (this.progression.length > 1) {
      this.progression.splice(index, 1);
      if (this.currentStepIndex >= this.progression.length) {
        this.currentStepIndex = 0;
      }
      this.onStateChange();
    }
  }

  moveChord(fromIndex, toIndex) {
    if (fromIndex >= 0 && fromIndex < this.progression.length && toIndex >= 0 && toIndex < this.progression.length) {
      const item = this.progression.splice(fromIndex, 1)[0];
      this.progression.splice(toIndex, 0, item);
      this.onStateChange();
    }
  }

  start() {
    if (this.isPlaying) return;
    if (window.audioEngine) window.audioEngine.init();

    this.isPlaying = true;
    this.currentStepIndex = 0;
    this.currentBeat = 0;

    if (this.countInEnabled) {
      this.isCountingIn = true;
      this.countInBeat = 0;
    } else {
      this.isCountingIn = false;
    }

    const secondsPerBeat = 60.0 / this.bpm;
    this.nextBeatTime = window.audioEngine ? window.audioEngine.ctx.currentTime + 0.05 : 0;

    this.timerId = setInterval(() => this.scheduler(), this.lookahead);
    this.onStateChange();
  }

  pause() {
    this.isPlaying = false;
    this.isCountingIn = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.onStateChange();
  }

  reset() {
    this.pause();
    this.currentStepIndex = 0;
    this.currentBeat = 0;
    this.onStateChange();
    this.onChordChange(this.getCurrentChord(), 0);
  }

  getCurrentChord() {
    if (this.progression.length === 0) return null;
    return this.progression[this.currentStepIndex] || this.progression[0];
  }

  getNextChord() {
    if (this.progression.length === 0) return null;
    const nextIdx = (this.currentStepIndex + 1) % this.progression.length;
    return this.progression[nextIdx];
  }

  scheduler() {
    if (!this.isPlaying) return;
    const currentTime = window.audioEngine ? window.audioEngine.ctx.currentTime : Date.now() / 1000;

    while (this.nextBeatTime < currentTime + this.scheduleAheadTime) {
      this.scheduleBeat(this.nextBeatTime);
      this.advanceBeat();
    }
  }

  scheduleBeat(time) {
    const secondsPerBeat = 60.0 / this.bpm;

    if (this.isCountingIn) {
      // カウントイン中 (4拍)
      const countNum = this.countInBeat + 1;
      if (this.metronomeEnabled && window.audioEngine) {
        window.audioEngine.playMetronomeClick(countNum === 1, time);
      }
      setTimeout(() => {
        this.onBeatChange({
          isCountIn: true,
          count: countNum,
          currentStepIndex: 0
        });
      }, Math.max(0, (time - (window.audioEngine ? window.audioEngine.ctx.currentTime : 0)) * 1000));
      return;
    }

    // 通常演奏時
    const currentStep = this.progression[this.currentStepIndex];
    if (!currentStep) return;

    const isFirstBeatOfStep = this.currentBeat === 0;

    // メトロノーム音
    if (this.metronomeEnabled && window.audioEngine) {
      window.audioEngine.playMetronomeClick(isFirstBeatOfStep, time);
    }

    // ギター音（コードの1拍目にストローク）
    if (this.soundEnabled && isFirstBeatOfStep && window.audioEngine) {
      const positions = getChordPositions(currentStep.chord);
      if (positions && positions.length > 0) {
        // 少しだけメトロノームより後（人間らしいグルーヴ）で鳴らす
        setTimeout(() => {
          window.audioEngine.playChord(positions[0].frets, 'down', 0.16);
        }, 15);
      }
    }

    // UI更新イベント発行
    const stepIdx = this.currentStepIndex;
    const beatIdx = this.currentBeat;
    setTimeout(() => {
      this.onBeatChange({
        isCountIn: false,
        count: beatIdx + 1,
        totalBeats: currentStep.beats,
        currentStepIndex: stepIdx,
        chord: currentStep.chord
      });
      if (isFirstBeatOfStep) {
        this.onChordChange(currentStep, stepIdx);
      }
    }, Math.max(0, (time - (window.audioEngine ? window.audioEngine.ctx.currentTime : 0)) * 1000));
  }

  advanceBeat() {
    const secondsPerBeat = 60.0 / this.bpm;
    this.nextBeatTime += secondsPerBeat;

    if (this.isCountingIn) {
      this.countInBeat++;
      if (this.countInBeat >= this.beatsPerBar) {
        this.isCountingIn = false;
        this.currentStepIndex = 0;
        this.currentBeat = 0;
      }
      return;
    }

    const currentStep = this.progression[this.currentStepIndex];
    this.currentBeat++;

    if (this.currentBeat >= currentStep.beats) {
      this.currentBeat = 0;
      this.currentStepIndex++;

      if (this.currentStepIndex >= this.progression.length) {
        if (this.loopEnabled) {
          this.currentStepIndex = 0;
        } else {
          this.pause();
        }
      }
    }
  }
}
