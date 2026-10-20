/**
 * SVG Guitar Fretboard / Chord Diagram Renderer
 * 美しいベクターダイアグラム描画と弦タップによる単音再生
 */

class FretboardRenderer {
  constructor(containerId) {
    this.container = typeof document !== "undefined" && containerId ? document.getElementById(containerId) : null;
    this.fingerLabels = {
      1: "1", // 人差し指
      2: "2", // 中指
      3: "3", // 薬指
      4: "4", // 小指
      'T': "T" // 親指
    };
  }

  /**
   * コードダイアグラムをSVGで描画
   */
  render(chordPos, chordName = "") {
    if (!this.container || !chordPos) return;
    this.container.innerHTML = this.buildSVG(chordPos);
    this.attachClickEvents(chordPos);
  }

  static getSVGString(chordPos) {
    if (!chordPos) return "";
    const dummy = new FretboardRenderer(null);
    return dummy.buildSVG(chordPos);
  }

  buildSVG(chordPos) {
    if (!chordPos) return "";

    const width = 280;
    const height = 295;
    const numStrings = 6;
    const numFrets = 5;

    const startX = 45;
    const startY = 55;
    const stringSpacing = 38;
    const fretSpacing = 42;
    const boardWidth = (numStrings - 1) * stringSpacing;
    const boardHeight = numFrets * fretSpacing;

    const baseFret = chordPos.baseFret || 1;
    const isNut = baseFret === 1;

    // SVGごとのユニークID（同一画面に複数カードが並んでもグラデーションや色が絶対に消えないようにする）
    const uid = 'fb_' + Math.random().toString(36).substring(2, 9);
    const dotGradId = `${uid}_dotGrad`;
    const barreGradId = `${uid}_barreGrad`;
    const glowId = `${uid}_glow`;

    let svg = `<svg viewBox="0 0 ${width} ${height}" class="chord-diagram-svg" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<defs>
      <linearGradient id="${dotGradId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>
      <linearGradient id="${barreGradId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#b45309" />
      </linearGradient>
      <filter id="${glowId}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#f59e0b" flood-opacity="0.45"/>
      </filter>
    </defs>`;

    // 背景スレート
    svg += `<rect x="${startX - 6}" y="${startY}" width="${boardWidth + 12}" height="${boardHeight}" rx="4" fill="#1e2430" stroke="#334155" stroke-width="1.5"/>`;

    // フレット番号表示（1フレット以外の場合）
    if (!isNut) {
      svg += `<text x="${startX - 18}" y="${startY + fretSpacing / 2 + 5}" class="base-fret-text" text-anchor="middle" font-size="14" font-weight="700" fill="#f59e0b">${baseFret}fr</text>`;
    }

    // ナット（1フレット時の太い上部バー）
    if (isNut) {
      svg += `<rect x="${startX - 6}" y="${startY - 4}" width="${boardWidth + 12}" height="7" rx="2" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1"/>`;
    }

    // フレット線（横線）
    for (let f = 0; f <= numFrets; f++) {
      const y = startY + f * fretSpacing;
      const strokeW = f === 0 && isNut ? 0 : 1.5;
      if (strokeW > 0) {
        svg += `<line x1="${startX}" y1="${y}" x2="${startX + boardWidth}" y2="${y}" stroke="#475569" stroke-width="${strokeW}" stroke-linecap="round"/>`;
      }
    }

    // フレットドットマーク（3, 5, 7, 9, 12フレットのポジションマーク）
    for (let f = 1; f <= numFrets; f++) {
      const actualFret = baseFret + f - 1;
      if ([3, 5, 7, 9, 15, 17].includes(actualFret)) {
        const markerY = startY + (f - 0.5) * fretSpacing;
        const markerX = startX + boardWidth / 2;
        svg += `<circle cx="${markerX}" cy="${markerY}" r="4" fill="#334155" opacity="0.6"/>`;
      } else if (actualFret === 12) {
        const markerY = startY + (f - 0.5) * fretSpacing;
        const markerX1 = startX + boardWidth / 3;
        const markerX2 = startX + (boardWidth / 3) * 2;
        svg += `<circle cx="${markerX1}" cy="${markerY}" r="3.5" fill="#334155" opacity="0.6"/>`;
        svg += `<circle cx="${markerX2}" cy="${markerY}" r="3.5" fill="#334155" opacity="0.6"/>`;
      }
    }

    // 弦（縦線：6弦が左、1弦が右）
    const stringNames = ["6E", "5A", "4D", "3G", "2B", "1E"];
    for (let s = 0; s < numStrings; s++) {
      const x = startX + s * stringSpacing;
      const strokeWidth = 2.8 - s * 0.32;
      svg += `<line x1="${x}" y1="${startY}" x2="${x}" y2="${startY + boardHeight}" stroke="#94a3b8" stroke-width="${strokeWidth}"/>`;
      svg += `<line x1="${x}" y1="${startY - 20}" x2="${x}" y2="${startY + boardHeight + 20}" stroke="transparent" stroke-width="26" class="string-tap-target" data-string-idx="${s}" style="cursor: pointer;"/>`;
      svg += `<text x="${x}" y="${startY + boardHeight + 20}" class="string-label-text" text-anchor="middle" font-size="11" font-weight="600" fill="#64748b">${stringNames[s]}</text>`;
    }

    // セーハ（Barre）描画：鮮やかなオレンジゴールドの太いバー＋弦の接点リング
    if (chordPos.barre) {
      const b = chordPos.barre;
      const relFret = b.fret - baseFret + 1;
      if (relFret >= 1 && relFret <= numFrets) {
        const barreY = startY + (relFret - 0.5) * fretSpacing;
        const fromIdx = 6 - b.toString;
        const toIdx = 6 - b.fromString;
        const x1 = startX + fromIdx * stringSpacing;
        const x2 = startX + toIdx * stringSpacing;
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const barreWidth = (maxX - minX) + 24;
        const barreX = minX - 12;

        // セーハ本体バー（鮮やかなグラデーション＆クッキリした枠線）
        svg += `<rect x="${barreX}" y="${barreY - 12}" width="${barreWidth}" height="24" rx="12" fill="url(#${barreGradId})" stroke="#fbbf24" stroke-width="1.8" filter="url(#${glowId})"/>`;

        // セーハで押さえている各弦の接点ドット（どこを押さえているか視覚的に強調）
        const startStrIdx = Math.min(fromIdx, toIdx);
        const endStrIdx = Math.max(fromIdx, toIdx);
        for (let s = startStrIdx; s <= endStrIdx; s++) {
          const dotX = startX + s * stringSpacing;
          svg += `<circle cx="${dotX}" cy="${barreY}" r="5" fill="#fef08a" opacity="0.6"/>`;
        }

        // セーハの指番号（人差し指「1」等）
        svg += `<text x="${(x1 + x2) / 2}" y="${barreY + 4}" class="finger-number-text" text-anchor="middle" font-size="12" font-weight="800" fill="#ffffff">${b.finger || 1}</text>`;
      }
    }

    // 各弦のトップマーク（× ミュート / ○ 開放弦）
    for (let s = 0; s < numStrings; s++) {
      const fret = chordPos.frets[s];
      const x = startX + s * stringSpacing;
      const markerY = startY - 18;

      if (fret === -1) {
        svg += `<g class="mute-marker" transform="translate(${x}, ${markerY})">
          <line x1="-5" y1="-5" x2="5" y2="5" stroke="#f43f5e" stroke-width="2.4" stroke-linecap="round"/>
          <line x1="5" y1="-5" x2="-5" y2="5" stroke="#f43f5e" stroke-width="2.4" stroke-linecap="round"/>
        </g>`;
      } else if (fret === 0) {
        svg += `<circle cx="${x}" cy="${markerY}" r="6.5" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="2.4" class="open-marker"/>`;
      }
    }

    // 押さえる指のドット（コード辞典と完全に同一の鮮やかなゴールドオレンジ）
    for (let s = 0; s < numStrings; s++) {
      const fret = chordPos.frets[s];
      const finger = chordPos.fingers ? chordPos.fingers[s] : 0;
      const isPartOfBarre = chordPos.barre && fret === chordPos.barre.fret && (6 - s) <= chordPos.barre.toString && (6 - s) >= chordPos.barre.fromString;

      if (fret > 0 && !isPartOfBarre) {
        const relFret = fret - baseFret + 1;
        if (relFret >= 1 && relFret <= numFrets) {
          const x = startX + s * stringSpacing;
          const y = startY + (relFret - 0.5) * fretSpacing;

          svg += `<g class="chord-dot-group" data-string-idx="${s}" data-fret="${fret}" style="cursor: pointer;">
            <circle cx="${x}" cy="${y}" r="11.5" fill="url(#${dotGradId})" stroke="#fbbf24" stroke-width="1.8" filter="url(#${glowId})"/>
            <text x="${x}" y="${y + 4.5}" class="finger-number-text" text-anchor="middle" font-size="12" font-weight="800" fill="#ffffff">${this.fingerLabels[finger] || ""}</text>
          </g>`;
        }
      }
    }

    svg += `</svg>`;
    return svg;
  }

  attachClickEvents(chordPos) {
    if (!window.audioEngine) return;

    // 弦タップエリア
    const targets = this.container.querySelectorAll('.string-tap-target, .chord-dot-group');
    targets.forEach(target => {
      target.addEventListener('click', (e) => {
        e.stopPropagation();
        const stringIdx = parseInt(target.getAttribute('data-string-idx'), 10);
        const fret = chordPos.frets[stringIdx];
        if (fret >= 0) {
          const freq = window.audioEngine.getFrequency(stringIdx, fret);
          window.audioEngine.playPluck(freq, null, 1.8, 0.9);

          // 視覚的なパルスエフェクト
          target.style.transition = 'transform 0.1s ease';
          target.style.transform = 'scale(1.15)';
          setTimeout(() => {
            target.style.transform = 'scale(1)';
          }, 150);
        }
      });
    });
  }
}
