/**
 * Main Application Controller
 * UI連携、タブ切り替え、各モジュールの統合
 */

document.addEventListener("DOMContentLoaded", () => {
  // モジュール初期化
  const fretboard = new FretboardRenderer("chord-diagram-container");
  const miniFretboard = new FretboardRenderer("mini-chord-diagram");
  const modalFretboard = new FretboardRenderer("modal-chord-diagram");

  const player = new ProgressionPlayer({
    onBeatChange: (state) => updateProgressionBeatUI(state),
    onChordChange: (step, index) => updateProgressionChordUI(step, index),
    onStateChange: () => updateProgressionStateUI()
  });

  const songManager = new SongManager();

  // 現在の状態管理
  let currentRoot = "C";
  let currentType = "";
  let currentPosIndex = 0;
  let songTranspose = 0;

  /* ==========================================================================
     1. タブナビゲーション
     ========================================================================== */
  const navButtons = document.querySelectorAll(".nav-tab-btn");
  const tabContents = document.querySelectorAll(".tab-view-content");

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");
      navButtons.forEach(b => b.classList.remove("active"));
      tabContents.forEach(tc => tc.classList.remove("active"));

      btn.classList.add("active");
      const activeContent = document.getElementById(targetId);
      if (activeContent) activeContent.classList.add("active");

      // オーディオ初期化のトリガー
      if (window.audioEngine) window.audioEngine.init();

      // 各タブ表示時のリフレッシュ
      if (targetId === "tab-progression") {
        renderProgressionList();
        updateCurrentProgressionChordDisplay();
      } else if (targetId === "tab-songs") {
        renderCurrentSong();
      }

      // 弾き語りタブ以外に移動した時は再生・スクロールを停止
      if (targetId !== "tab-songs") {
        songManager.stopAutoScroll();
        if (typeof stopTimelineAutoPlay === "function") stopTimelineAutoPlay();
      }

      // チューナータブ以外に移動した時はマイクを停止してバッテリー節約
      if (targetId !== "tab-tuner" && window.guitarTuner && window.guitarTuner.isListening) {
        window.guitarTuner.stop();
        updateTunerMicBtnUI(false);
      }
    });
  });

  /* ==========================================================================
     2. コード辞典機能
     ========================================================================== */
  const rootButtonsContainer = document.getElementById("root-buttons-list");
  const typeButtonsContainer = document.getElementById("type-buttons-list");
  const positionsContainer = document.getElementById("chord-positions-list");
  const chordTitleEl = document.getElementById("selected-chord-title");
  const chordTipsEl = document.getElementById("chord-tips-text");
  const playChordBtn = document.getElementById("btn-play-current-chord");
  const strumUpBtn = document.getElementById("btn-strum-up");

  // ルート音ボタン生成
  AVAILABLE_ROOTS.forEach(rootText => {
    const rootVal = rootText.split(" ")[0]; // "C# / Db" -> "C#"
    const btn = document.createElement("button");
    btn.className = `btn-chip root-chip ${rootVal === currentRoot ? "active" : ""}`;
    btn.textContent = rootText;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".root-chip").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      currentRoot = rootVal;
      currentPosIndex = 0;
      updateChordView();
    });
    rootButtonsContainer.appendChild(btn);
  });

  // タイプボタン生成
  AVAILABLE_TYPES.forEach(typeObj => {
    const btn = document.createElement("button");
    btn.className = `btn-chip type-chip ${typeObj.suffix === currentType ? "active" : ""}`;
    btn.textContent = typeObj.label;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".type-chip").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      currentType = typeObj.suffix;
      currentPosIndex = 0;
      updateChordView();
    });
    typeButtonsContainer.appendChild(btn);
  });

  function updateChordView() {
    const chordName = currentRoot + currentType;
    chordTitleEl.textContent = chordName;

    const positions = getChordPositions(chordName);
    positionsContainer.innerHTML = "";

    if (!positions || positions.length === 0) {
      chordTipsEl.textContent = "このコードのポジション情報は準備中です。";
      document.getElementById("chord-diagram-container").innerHTML = `
        <div class="empty-state-notice">
          <p>「${chordName}」のポジション図は準備中です。<br>他のコードを選択してください。</p>
        </div>`;
      return;
    }

    // 複数ポジション切り替えボタン
    positions.forEach((pos, idx) => {
      const btn = document.createElement("button");
      btn.className = `btn-position-pill ${idx === currentPosIndex ? "active" : ""}`;
      btn.innerHTML = `<span class="pos-num">パターン${idx + 1}</span> <span class="pos-name">${pos.name}</span>`;
      btn.addEventListener("click", () => {
        document.querySelectorAll(".btn-position-pill").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        currentPosIndex = idx;
        renderPosition(positions[currentPosIndex], chordName);
      });
      positionsContainer.appendChild(btn);
    });

    renderPosition(positions[currentPosIndex], chordName);
  }

  function renderPosition(pos, chordName) {
    fretboard.render(pos, chordName);
    chordTipsEl.innerHTML = `<strong>💡 押さえ方のコツ:</strong> ${pos.tips || "指を立てて隣の弦に触れないように押さえましょう。"}`;
  }

  if (playChordBtn) {
    playChordBtn.addEventListener("click", () => {
      const chordName = currentRoot + currentType;
      const positions = getChordPositions(chordName);
      if (positions && positions[currentPosIndex]) {
        window.audioEngine.playChord(positions[currentPosIndex].frets, 'down', 0.16);
      }
    });
  }

  if (strumUpBtn) {
    strumUpBtn.addEventListener("click", () => {
      const chordName = currentRoot + currentType;
      const positions = getChordPositions(chordName);
      if (positions && positions[currentPosIndex]) {
        window.audioEngine.playChord(positions[currentPosIndex].frets, 'up', 0.14);
      }
    });
  }

  // 初回表示
  updateChordView();

  /* ==========================================================================
     3. コード進行 ＆ 自動再生機能
     ========================================================================== */
  const btnProgPlay = document.getElementById("btn-prog-play");
  const btnProgReset = document.getElementById("btn-prog-reset");
  const bpmSlider = document.getElementById("bpm-slider");
  const bpmDisplay = document.getElementById("bpm-display-val");
  const btnBpmMinus = document.getElementById("btn-bpm-minus");
  const btnBpmPlus = document.getElementById("btn-bpm-plus");
  const presetSelector = document.getElementById("preset-progression-select");
  const progressionListEl = document.getElementById("progression-cards-list");
  const activeChordNameEl = document.getElementById("active-prog-chord-name");
  const activeBeatIndicators = document.querySelectorAll(".beat-indicator-dot");
  const nextChordPreviewEl = document.getElementById("next-chord-preview-name");
  const countInBadge = document.getElementById("count-in-badge");
  const toggleMetronome = document.getElementById("toggle-metronome-sound");
  const toggleGuitar = document.getElementById("toggle-guitar-sound");
  const btnAddChordModal = document.getElementById("btn-add-chord-modal");

  // BPMスライダー操作
  bpmSlider.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    bpmDisplay.textContent = val;
    player.setBpm(val);
  });

  btnBpmMinus.addEventListener("click", () => {
    let val = parseInt(bpmSlider.value, 10) - 5;
    val = Math.max(40, val);
    bpmSlider.value = val;
    bpmDisplay.textContent = val;
    player.setBpm(val);
  });

  btnBpmPlus.addEventListener("click", () => {
    let val = parseInt(bpmSlider.value, 10) + 5;
    val = Math.min(220, val);
    bpmSlider.value = val;
    bpmDisplay.textContent = val;
    player.setBpm(val);
  });

  // プリセット選択
  presetSelector.addEventListener("change", (e) => {
    if (e.target.value) {
      player.loadPreset(e.target.value);
      renderProgressionList();
      updateCurrentProgressionChordDisplay();
    }
  });

  // 再生/停止
  btnProgPlay.addEventListener("click", () => {
    if (player.isPlaying) {
      player.pause();
    } else {
      player.start();
    }
  });

  btnProgReset.addEventListener("click", () => {
    player.reset();
  });

  // サウンドトグル
  toggleMetronome.addEventListener("change", (e) => {
    player.metronomeEnabled = e.target.checked;
  });
  toggleGuitar.addEventListener("change", (e) => {
    player.soundEnabled = e.target.checked;
  });

  function renderProgressionList() {
    progressionListEl.innerHTML = "";
    player.progression.forEach((step, idx) => {
      const card = document.createElement("div");
      card.className = `prog-chord-card ${idx === player.currentStepIndex ? "active" : ""}`;
      card.setAttribute("data-step-index", idx);

      card.innerHTML = `
        <div class="card-header-bar">
          <span class="bar-num">#${idx + 1}</span>
          <button class="btn-card-del" title="削除">✕</button>
        </div>
        <div class="card-chord-name">${step.chord}</div>
        <div class="card-beats-badge">${step.beats}拍</div>
      `;

      // クリックでその小節へジャンプ
      card.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-card-del")) return;
        player.currentStepIndex = idx;
        player.currentBeat = 0;
        updateCurrentProgressionChordDisplay();
        highlightActiveCard(idx);
      });

      // 削除ボタン
      const delBtn = card.querySelector(".btn-card-del");
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        player.removeChord(idx);
        renderProgressionList();
        updateCurrentProgressionChordDisplay();
      });

      progressionListEl.appendChild(card);
    });
  }

  function highlightActiveCard(index) {
    const cards = progressionListEl.querySelectorAll(".prog-chord-card");
    cards.forEach((c, idx) => {
      if (idx === index) {
        c.classList.add("active");
        c.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      } else {
        c.classList.remove("active");
      }
    });
  }

  function updateCurrentProgressionChordDisplay() {
    const cur = player.getCurrentChord();
    const next = player.getNextChord();

    if (cur) {
      activeChordNameEl.textContent = cur.chord;
      const positions = getChordPositions(cur.chord);
      if (positions && positions.length > 0) {
        miniFretboard.render(positions[0], cur.chord);
      }
    }
    if (next) {
      nextChordPreviewEl.textContent = next.chord;
    }
  }

  function updateProgressionBeatUI(state) {
    if (state.isCountIn) {
      countInBadge.classList.add("active");
      countInBadge.textContent = `カウントイン: ${state.count}`;
      activeBeatIndicators.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === state.count - 1);
      });
      return;
    }

    countInBadge.classList.remove("active");
    activeBeatIndicators.forEach((dot, idx) => {
      dot.classList.toggle("active", idx === state.count - 1);
    });
  }

  function updateProgressionChordUI(step, index) {
    highlightActiveCard(index);
    updateCurrentProgressionChordDisplay();
  }

  function updateProgressionStateUI() {
    if (player.isPlaying) {
      btnProgPlay.innerHTML = `<span class="icon">⏸</span> 一時停止`;
      btnProgPlay.classList.add("playing");
    } else {
      btnProgPlay.innerHTML = `<span class="icon">▶</span> 再生開始`;
      btnProgPlay.classList.remove("playing");
      countInBadge.classList.remove("active");
      activeBeatIndicators.forEach(d => d.classList.remove("active"));
    }
  }

  // コード追加パレット
  const quickChords = ["C", "G", "Am", "F", "Dm", "Em", "A", "D", "E", "Cadd9", "Fmaj7", "E7"];
  const quickPaletteContainer = document.getElementById("quick-chords-palette");
  quickChords.forEach(ch => {
    const chip = document.createElement("button");
    chip.className = "btn-chip quick-chip";
    chip.textContent = ch;
    chip.addEventListener("click", () => {
      player.addChord(ch, 4);
      renderProgressionList();
      updateCurrentProgressionChordDisplay();
    });
    quickPaletteContainer.appendChild(chip);
  });

  /* ==========================================================================
     4. 歌詞 ＆ 弾き語り機能
     ========================================================================== */
  const songSelectEl = document.getElementById("song-select-dropdown");
  const songTitleEl = document.getElementById("current-song-title");
  const songArtistEl = document.getElementById("current-song-artist");
  const songCapoEl = document.getElementById("current-song-capo");
  const songSheetEl = document.getElementById("song-lyrics-sheet-container");
  const btnSongAutoScroll = document.getElementById("btn-song-autoscroll");
  const btnScrollSpeed = document.getElementById("btn-scroll-speed");
  const btnSongKeyMinus = document.getElementById("btn-song-key-minus");
  const btnSongKeyPlus = document.getElementById("btn-song-key-plus");
  const songKeyDisplay = document.getElementById("song-key-display");
  const btnOpenSongEditor = document.getElementById("btn-open-song-editor");

  function populateSongSelect(selectedId = null) {
    const currentVal = selectedId || songSelectEl.value || (songManager.songs[0] ? songManager.songs[0].id : "");
    songSelectEl.innerHTML = "";
    songManager.songs.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = `${s.title} (${s.artist || "未設定"})`;
      if (s.id === currentVal) {
        opt.selected = true;
      }
      songSelectEl.appendChild(opt);
    });
    if (currentVal) {
      songSelectEl.value = currentVal;
    }
  }

  function renderCurrentSong(targetSongId = null) {
    if (songSelectEl.options.length === 0) {
      populateSongSelect(targetSongId);
    }
    const songId = targetSongId || songSelectEl.value || (songManager.songs[0] ? songManager.songs[0].id : null);
    if (!songId) return;

    songSelectEl.value = songId;

    const song = songManager.getSong(songId);
    if (!song) return;

    songTitleEl.textContent = song.title;
    songArtistEl.textContent = song.artist ? `アーティスト: ${song.artist}` : "";
    songCapoEl.textContent = song.capo > 0 ? `Capo: ${song.capo}` : "Capo: なし (開放)";

    // 歌詞＋コードのパース
    const html = songManager.parseChordText(song.content, songTranspose);
    songSheetEl.innerHTML = html;

    // シート内のコードをクリックした時の音＆ダイアグラム表示
    attachSongChordListeners();

    // 横ナビモード中なら横ナビ画面も連動更新
    if (activeSongMode === "timeline") {
      renderTimelineView();
    }
  }

  function attachSongChordListeners() {
    const chordTokens = songSheetEl.querySelectorAll(".chord-rt");
    chordTokens.forEach(token => {
      token.addEventListener("click", (e) => {
        e.stopPropagation();
        const chordName = token.getAttribute("data-chord");
        if (chordName) {
          // 音を再生
          const positions = getChordPositions(chordName);
          if (positions && positions.length > 0) {
            window.audioEngine.playChord(positions[0].frets, 'down', 0.16);
            showModalChordPreview(chordName, positions[0]);
          }
        }
      });
    });
  }

  songSelectEl.addEventListener("change", (e) => {
    songTranspose = 0;
    songKeyDisplay.textContent = "±0";
    songManager.stopAutoScroll();
    btnSongAutoScroll.innerHTML = `<span class="icon">▶</span> 自動スクロール`;
    btnSongAutoScroll.classList.remove("scrolling");
    renderCurrentSong(e.target.value);
  });

  // 自動スクロール
  btnSongAutoScroll.addEventListener("click", () => {
    const isNowScrolling = songManager.toggleAutoScroll(songSheetEl);
    if (isNowScrolling) {
      btnSongAutoScroll.innerHTML = `<span class="icon">⏸</span> スクロール停止`;
      btnSongAutoScroll.classList.add("scrolling");
    } else {
      btnSongAutoScroll.innerHTML = `<span class="icon">▶</span> 自動スクロール`;
      btnSongAutoScroll.classList.remove("scrolling");
    }
  });

  // スクロール速度切り替え (1x, 2x, 3x)
  btnScrollSpeed.addEventListener("click", () => {
    let nextSpeed = songManager.scrollSpeed + 1;
    if (nextSpeed > 3) nextSpeed = 1;
    songManager.scrollSpeed = nextSpeed;
    btnScrollSpeed.textContent = `速度: ${nextSpeed}x`;
  });

  // 移調ボタン
  btnSongKeyMinus.addEventListener("click", () => {
    songTranspose -= 1;
    songKeyDisplay.textContent = (songTranspose > 0 ? `+${songTranspose}` : `${songTranspose}`);
    renderCurrentSong();
  });

  btnSongKeyPlus.addEventListener("click", () => {
    songTranspose += 1;
    songKeyDisplay.textContent = (songTranspose > 0 ? `+${songTranspose}` : `${songTranspose}`);
    renderCurrentSong();
  });

  // コードプレビューモーダル
  const chordModal = document.getElementById("chord-preview-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalChordTitle = document.getElementById("modal-chord-name");
  const modalChordTips = document.getElementById("modal-chord-tips");

  function showModalChordPreview(chordName, pos) {
    modalChordTitle.textContent = chordName;
    modalFretboard.render(pos, chordName);
    modalChordTips.textContent = pos.tips || "";
    chordModal.classList.add("open");
  }

  modalCloseBtn.addEventListener("click", () => {
    chordModal.classList.remove("open");
  });

  chordModal.addEventListener("click", (e) => {
    if (e.target === chordModal) chordModal.classList.remove("open");
  });

  /* ==========================================================================
     4-B. 弾き語りモード切替（縦譜面 vs 横ナビ＆ダイアグラム同期）
     ========================================================================== */
  const btnModeSheet = document.getElementById("btn-mode-sheet");
  const btnModeTimeline = document.getElementById("btn-mode-timeline");
  const panelSheet = document.getElementById("song-panel-sheet");
  const panelTimeline = document.getElementById("song-panel-timeline");

  let activeSongMode = "sheet";
  let timelinePhrases = [];
  let timelineIndex = 0;
  let timelineTimerId = null;
  let timelineIsPlaying = false;
  let timelineBpm = 85;
  let timelineSound = true;

  if (btnModeSheet && btnModeTimeline) {
    btnModeSheet.addEventListener("click", () => {
      activeSongMode = "sheet";
      btnModeSheet.classList.add("active");
      btnModeTimeline.classList.remove("active");
      panelSheet.classList.add("active");
      panelTimeline.classList.remove("active");
      stopTimelineAutoPlay();
    });

    btnModeTimeline.addEventListener("click", () => {
      activeSongMode = "timeline";
      btnModeTimeline.classList.add("active");
      btnModeSheet.classList.remove("active");
      panelTimeline.classList.add("active");
      panelSheet.classList.remove("active");
      songManager.stopAutoScroll();
      renderTimelineView();
    });
  }

  // タイムライン描画関数（歌詞＋コード＋押さえ方の一体型カード）
  function renderTimelineView() {
    const songId = songSelectEl.value || (songManager.songs[0] ? songManager.songs[0].id : null);
    if (!songId) return;
    const song = songManager.getSong(songId);
    if (!song) return;

    // フレーズリスト抽出
    timelinePhrases = songManager.extractTimelinePhrases(song.content, songTranspose);
    const trackEl = document.getElementById("timeline-stream-track");
    if (!trackEl) return;

    if (timelinePhrases.length === 0) {
      trackEl.innerHTML = `<div style="color: var(--text-sub); padding: 40px 20px; text-align: center;">この曲には [C] のようなコードが登録されていません。「編集」からコードを入力してください。</div>`;
      return;
    }

    if (timelineIndex >= timelinePhrases.length) {
      timelineIndex = 0;
    }

    // トラック内の一体型カードを一括生成
    trackEl.innerHTML = "";
    timelinePhrases.forEach((phrase, idx) => {
      // 事前に設定された押さえ方パターン番号
      const preferredPat = songManager.getPreferredChordPattern(song.id, phrase.chord);
      const positions = getChordPositions(phrase.chord) || [];
      const targetPos = positions[preferredPat] || positions[0];
      const patternName = targetPos ? targetPos.name : `P${preferredPat + 1}`;

      // SVG指板ダイアグラム（インライン埋め込み）
      const svgMarkup = targetPos
        ? FretboardRenderer.getSVGString(targetPos, { width: 140, height: 155 })
        : `<div style="color:var(--text-sub);font-size:0.75rem;padding:30px 10px;text-align:center;">押さえ方データなし</div>`;

      const card = document.createElement("div");
      card.className = `timeline-unit-card ${idx === timelineIndex ? "active" : ""}`;
      card.setAttribute("data-phrase-idx", idx);

      // 「コード名」「押さえ方図」「歌詞」の3要素をひとまとまりにしたHTML
      card.innerHTML = `
        <div class="unit-card-header">
          <div class="unit-card-chord">${phrase.chord}</div>
          <div class="unit-card-pattern-tag">${patternName}</div>
        </div>
        <div class="unit-card-diagram-box">
          ${svgMarkup}
        </div>
        <div class="unit-card-lyric-box">
          <div class="unit-card-lyric">${phrase.lyric || "♪"}</div>
        </div>
      `;

      // タップでそのカードにフォーカス＆ギター音再生
      card.addEventListener("click", () => {
        timelineIndex = idx;
        updateTimelineSelection();
        if (timelineSound) {
          playCurrentTimelineChordSound();
        }
      });

      trackEl.appendChild(card);
    });

    updateTimelineSelection();
  }

  // 選択中カードのアクティブ化＆画面中央スムーズスクロール
  function updateTimelineSelection() {
    const cards = document.querySelectorAll(".timeline-unit-card");
    cards.forEach((card, idx) => {
      if (idx === timelineIndex) {
        card.classList.add("active");
        card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      } else {
        card.classList.remove("active");
      }
    });
  }

  // 現在選択中のコードを鳴らす
  function playCurrentTimelineChordSound() {
    if (!window.audioEngine) return;
    const songId = songSelectEl.value;
    const song = songManager.getSong(songId);
    if (!song || timelinePhrases.length === 0) return;

    const curPhrase = timelinePhrases[timelineIndex];
    if (!curPhrase) return;

    const curPat = songManager.getPreferredChordPattern(song.id, curPhrase.chord);
    const positions = getChordPositions(curPhrase.chord) || [];
    const targetPos = positions[curPat] || positions[0];
    if (targetPos) {
      window.audioEngine.playChord(targetPos.frets, 'down', 0.16);
    }
  }

  // タイムライン自動進行制御
  const btnTimelinePlay = document.getElementById("btn-timeline-play");
  const btnTimelinePrev = document.getElementById("btn-timeline-prev");
  const btnTimelineNext = document.getElementById("btn-timeline-next");
  const timelineBpmSlider = document.getElementById("timeline-bpm-slider");
  const timelineBpmVal = document.getElementById("timeline-bpm-val");
  const toggleTimelineSound = document.getElementById("toggle-timeline-sound");

  if (timelineBpmSlider) {
    timelineBpmSlider.addEventListener("input", (e) => {
      timelineBpm = parseInt(e.target.value, 10);
      timelineBpmVal.textContent = `${timelineBpm} BPM`;
      if (timelineIsPlaying) {
        stopTimelineAutoPlay();
        startTimelineAutoPlay();
      }
    });
  }

  if (toggleTimelineSound) {
    toggleTimelineSound.addEventListener("change", (e) => {
      timelineSound = e.target.checked;
    });
  }

  function startTimelineAutoPlay() {
    timelineIsPlaying = true;
    if (btnTimelinePlay) {
      btnTimelinePlay.innerHTML = `<span class="icon">⏸</span> 進行停止`;
      btnTimelinePlay.classList.add("playing");
    }

    if (timelineSound) {
      playCurrentTimelineChordSound();
    }

    // 1フレーズあたり4拍の時間 (ms)
    const stepDuration = Math.max(1200, (60.0 / timelineBpm) * 4 * 1000);

    timelineTimerId = setInterval(() => {
      timelineIndex = (timelineIndex + 1) % timelinePhrases.length;
      updateTimelineSelection();
      if (timelineSound) {
        playCurrentTimelineChordSound();
      }
    }, stepDuration);
  }

  function stopTimelineAutoPlay() {
    timelineIsPlaying = false;
    if (btnTimelinePlay) {
      btnTimelinePlay.innerHTML = `<span class="icon">▶</span> 自動進行`;
      btnTimelinePlay.classList.remove("playing");
    }
    if (timelineTimerId) {
      clearInterval(timelineTimerId);
      timelineTimerId = null;
    }
  }

  if (btnTimelinePlay) {
    btnTimelinePlay.addEventListener("click", () => {
      if (timelineIsPlaying) {
        stopTimelineAutoPlay();
      } else {
        startTimelineAutoPlay();
      }
    });
  }

  if (btnTimelinePrev) {
    btnTimelinePrev.addEventListener("click", () => {
      if (timelinePhrases.length === 0) return;
      timelineIndex = (timelineIndex - 1 + timelinePhrases.length) % timelinePhrases.length;
      updateTimelineSelection();
      if (timelineSound) playCurrentTimelineChordSound();
    });
  }

  if (btnTimelineNext) {
    btnTimelineNext.addEventListener("click", () => {
      if (timelinePhrases.length === 0) return;
      timelineIndex = (timelineIndex + 1) % timelinePhrases.length;
      updateTimelineSelection();
      if (timelineSound) playCurrentTimelineChordSound();
    });
  }

  // ==========================================================================
  // 🎵 この曲のコード押さえ方事前設定モーダルの制御
  // ==========================================================================
  const btnOpenSongPatternsModal = document.getElementById("btn-open-song-patterns-modal");
  const songPatternsModal = document.getElementById("song-patterns-modal");
  const btnClosePatternsModal = document.getElementById("btn-close-patterns-modal");
  const btnSavePatternsModalDone = document.getElementById("btn-save-patterns-modal-done");
  const songPatternsModalList = document.getElementById("song-patterns-modal-list");

  if (btnOpenSongPatternsModal && songPatternsModal) {
    btnOpenSongPatternsModal.addEventListener("click", () => {
      const songId = songSelectEl.value;
      const song = songManager.getSong(songId);
      if (!song) return;
      renderSongPatternsModal(song);
      songPatternsModal.classList.add("open");
    });
  }

  function closePatternsModal() {
    if (songPatternsModal) {
      songPatternsModal.classList.remove("open");
      // 設定内容を反映してタイムラインカードを再描画
      renderTimelineView();
    }
  }

  if (btnClosePatternsModal) {
    btnClosePatternsModal.addEventListener("click", closePatternsModal);
  }
  if (btnSavePatternsModalDone) {
    btnSavePatternsModalDone.addEventListener("click", closePatternsModal);
  }

  // モーダル内のコード一覧とパターンドロップダウン＆ミニプレビュー描画
  function renderSongPatternsModal(song) {
    if (!songPatternsModalList) return;
    const uniqueChords = songManager.getUniqueChordsInSong(song.content, songTranspose);
    songPatternsModalList.innerHTML = "";

    if (uniqueChords.length === 0) {
      songPatternsModalList.innerHTML = `<div style="color: var(--text-sub); padding: 20px; text-align: center;">曲にコードがありません</div>`;
      return;
    }

    uniqueChords.forEach(chord => {
      const positions = getChordPositions(chord) || [];
      const curPat = songManager.getPreferredChordPattern(song.id, chord);

      const row = document.createElement("div");
      row.className = "modal-chord-pattern-row";

      let optionsHtml = "";
      positions.forEach((p, idx) => {
        optionsHtml += `<option value="${idx}" ${idx === curPat ? "selected" : ""}>パターン${idx + 1}: ${p.name}</option>`;
      });

      const currentPos = positions[curPat] || positions[0];
      const previewSvg = currentPos ? FretboardRenderer.getSVGString(currentPos, { width: 60, height: 68 }) : "";

      row.innerHTML = `
        <div class="modal-chord-name">${chord}</div>
        <div class="modal-pattern-select-col">
          <label style="font-size: 0.72rem; color: var(--text-sub);">押さえ方を選択:</label>
          <select class="custom-select-input modal-chord-select" data-chord="${chord}" style="font-size: 0.78rem; padding: 6px 8px;">
            ${optionsHtml}
          </select>
        </div>
        <div class="modal-pattern-diagram-preview" id="preview-diag-${chord.replace('/', '_')}">
          ${previewSvg}
        </div>
      `;

      const selectEl = row.querySelector(".modal-chord-select");
      selectEl.addEventListener("change", (e) => {
        const newPat = parseInt(e.target.value, 10);
        songManager.setPreferredChordPattern(song.id, chord, newPat);

        // プレビューSVGをリアルタイム更新
        const newPos = positions[newPat] || positions[0];
        const previewContainer = row.querySelector(".modal-pattern-diagram-preview");
        if (newPos && previewContainer) {
          previewContainer.innerHTML = FretboardRenderer.getSVGString(newPos, { width: 60, height: 68 });
        }
      });

      songPatternsModalList.appendChild(row);
    });
  }

  // 楽曲編集モーダル
  const songEditorModal = document.getElementById("song-editor-modal");
  const btnCloseSongEditor = document.getElementById("btn-close-song-editor");
  const btnCreateSong = document.getElementById("btn-create-song");
  const modalSongEditorTitle = document.getElementById("modal-song-editor-title");
  const editSongId = document.getElementById("edit-song-id");
  const btnDeleteSong = document.getElementById("btn-delete-song");
  const btnSaveSong = document.getElementById("btn-save-song");
  const inputSongTitle = document.getElementById("edit-song-title");
  const inputSongArtist = document.getElementById("edit-song-artist");
  const inputSongCapo = document.getElementById("edit-song-capo");
  const textareaSongContent = document.getElementById("edit-song-content");
  const btnInsertChordHelper = document.querySelectorAll(".btn-insert-chord");

  // 【新規作成】ボタン
  if (btnCreateSong) {
    btnCreateSong.addEventListener("click", () => {
      modalSongEditorTitle.textContent = "➕ 新しい曲を登録";
      editSongId.value = "";
      inputSongTitle.value = "";
      inputSongArtist.value = "";
      inputSongCapo.value = 0;
      textareaSongContent.value = "";
      if (btnDeleteSong) btnDeleteSong.style.display = "none";
      songEditorModal.classList.add("open");
    });
  }

  // 【編集】ボタン
  btnOpenSongEditor.addEventListener("click", () => {
    const curSong = songManager.getSong(songSelectEl.value);
    if (curSong) {
      modalSongEditorTitle.textContent = `✏️ 「${curSong.title}」を編集`;
      editSongId.value = curSong.id;
      inputSongTitle.value = curSong.title;
      inputSongArtist.value = curSong.artist || "";
      inputSongCapo.value = curSong.capo || 0;
      textareaSongContent.value = curSong.content;
      if (btnDeleteSong) btnDeleteSong.style.display = "block";
    }
    songEditorModal.classList.add("open");
  });

  btnCloseSongEditor.addEventListener("click", () => {
    songEditorModal.classList.remove("open");
  });

  // 【保存】ボタン
  btnSaveSong.addEventListener("click", () => {
    const titleVal = inputSongTitle.value.trim();
    if (!titleVal) {
      alert("曲名を入力してください。");
      inputSongTitle.focus();
      return;
    }

    const songId = editSongId.value || ("song_" + Date.now());
    const songData = {
      id: songId,
      title: titleVal,
      artist: inputSongArtist.value.trim(),
      capo: parseInt(inputSongCapo.value, 10) || 0,
      content: textareaSongContent.value
    };

    songManager.saveCurrentSong(songData);
    songEditorModal.classList.remove("open");
    populateSongSelect(songId);
    renderCurrentSong(songId);
  });

  // 【削除】ボタン
  if (btnDeleteSong) {
    btnDeleteSong.addEventListener("click", () => {
      const songId = editSongId.value;
      if (!songId) return;

      const curSong = songManager.getSong(songId);
      const title = curSong ? curSong.title : "この曲";

      if (confirm(`本当に「${title}」をライブラリから削除しますか？`)) {
        songManager.deleteSong(songId);
        songEditorModal.classList.remove("open");
        populateSongSelect();
        renderCurrentSong();
      }
    });
  }

  // コード挿入ショートカットボタン
  btnInsertChordHelper.forEach(btn => {
    btn.addEventListener("click", () => {
      const chord = btn.getAttribute("data-chord");
      const start = textareaSongContent.selectionStart;
      const end = textareaSongContent.selectionEnd;
      const text = textareaSongContent.value;
      textareaSongContent.value = text.substring(0, start) + `[${chord}]` + text.substring(end);
      textareaSongContent.focus();
      textareaSongContent.selectionStart = textareaSongContent.selectionEnd = start + chord.length + 2;
    });
  });

  // 楽曲のエクスポート＆インポート
  const btnExportSong = document.getElementById("btn-export-song");
  const btnImportSong = document.getElementById("btn-import-song");

  if (btnExportSong) {
    btnExportSong.addEventListener("click", () => {
      const songId = songSelectEl.value;
      const json = songManager.exportSong(songId);
      navigator.clipboard.writeText(json).then(() => {
        alert("📋 曲データをクリップボードにコピーしました！\nメモ帳などに貼り付けてバックアップしたり、友達に共有できます。");
      }).catch(() => {
        prompt("以下の曲テキストをコピーしてください:", json);
      });
    });
  }

  if (btnImportSong) {
    btnImportSong.addEventListener("click", () => {
      const input = prompt("取り込みたい曲データ（JSONテキスト）を貼り付けてください:");
      if (input) {
        const imported = songManager.importSong(input);
        if (imported) {
          populateSongSelect(imported.id);
          renderCurrentSong(imported.id);
          alert(`「${imported.title}」をライブラリに追加しました！`);
        }
      }
    });
  }

  /* ==========================================================================
     5. ギターチューナー制御
     ========================================================================== */
  const btnToggleTunerMic = document.getElementById("btn-toggle-tuner-mic");
  const tunerNoteBadge = document.getElementById("tuner-note-badge");
  const tunerStringInfo = document.getElementById("tuner-string-info");
  const tunerFreqVal = document.getElementById("tuner-freq-val");
  const tunerNeedle = document.getElementById("tuner-needle");
  const tunerStatusPill = document.getElementById("tuner-status-pill");
  const refToneButtons = document.querySelectorAll(".btn-ref-tone");

  function updateTunerMicBtnUI(isListening) {
    if (!btnToggleTunerMic) return;
    if (isListening) {
      btnToggleTunerMic.innerHTML = `<span class="icon">⏹️</span> <span>チューナーを停止</span>`;
      btnToggleTunerMic.classList.add("listening");
      tunerStatusPill.textContent = "音を聴き取っています...";
    } else {
      btnToggleTunerMic.innerHTML = `<span class="icon">🎙️</span> <span>チューナーを開始 (マイク許可)</span>`;
      btnToggleTunerMic.classList.remove("listening");
      tunerStatusPill.className = "tuner-status-pill";
      tunerStatusPill.textContent = "マイク停止中";
      tunerNeedle.style.left = "50%";
      tunerNoteBadge.classList.remove("in-tune");
      tunerNeedle.classList.remove("in-tune");
    }
  }

  if (btnToggleTunerMic) {
    btnToggleTunerMic.addEventListener("click", async () => {
      if (window.guitarTuner.isListening) {
        window.guitarTuner.stop();
        updateTunerMicBtnUI(false);
      } else {
        await window.guitarTuner.start();
        updateTunerMicBtnUI(window.guitarTuner.isListening);
      }
    });
  }

  // チューナーのピッチ検知コールバック
  window.guitarTuner.onPitchDetected = (res) => {
    if (!res.closestNote || res.freq === null) {
      return;
    }

    tunerNoteBadge.textContent = res.closestNote.note;
    tunerStringInfo.textContent = res.closestNote.name;
    tunerFreqVal.textContent = `${res.freq} Hz (目標: ${res.closestNote.freq} Hz)`;

    // 針のメーター位置 (-50〜+50 cents を 0%〜100% に変換)
    const needlePct = Math.max(0, Math.min(100, res.cents + 50));
    tunerNeedle.style.left = `${needlePct}%`;

    if (res.isInTune) {
      tunerNoteBadge.classList.add("in-tune");
      tunerNeedle.classList.add("in-tune");
      tunerStatusPill.className = "tuner-status-pill in-tune";
      tunerStatusPill.textContent = "✨ 合致！ チューニングOK";
    } else {
      tunerNoteBadge.classList.remove("in-tune");
      tunerNeedle.classList.remove("in-tune");
      tunerStatusPill.className = "tuner-status-pill";
      if (res.cents > 0) {
        tunerStatusPill.textContent = `+${Math.round(res.cents)} ¢ 高い (ペグを少し緩める)`;
      } else {
        tunerStatusPill.textContent = `${Math.round(res.cents)} ¢ 低い (ペグを少し巻く)`;
      }
    }
  };

  window.guitarTuner.onError = (err) => {
    alert("マイクの使用が許可されなかったか、お使いのブラウザで利用できません。\nブラウザの設定でマイクアクセスを許可してください。");
    updateTunerMicBtnUI(false);
  };

  // 基準音（音叉）ボタン
  refToneButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const stringNum = parseInt(btn.getAttribute("data-string"), 10);
      window.guitarTuner.playReferenceTone(stringNum);
    });
  });

  /* ==========================================================================
     6. モバイルフレーム切り替え（PCプレビュー用）
     ========================================================================== */
  const toggleFrameBtn = document.getElementById("btn-toggle-device-frame");
  const appWrapper = document.getElementById("app-device-wrapper");
  if (toggleFrameBtn && appWrapper) {
    toggleFrameBtn.addEventListener("click", () => {
      appWrapper.classList.toggle("device-iphone-mode");
      toggleFrameBtn.textContent = appWrapper.classList.contains("device-iphone-mode")
        ? "📱 iPhoneフレーム: ON"
        : "📱 iPhoneフレーム: OFF";
    });
  }

  // 初期ロード完了時の描画
  renderProgressionList();
  renderCurrentSong();
});
