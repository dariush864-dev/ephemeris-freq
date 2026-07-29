
// ============================================================================
// MASTER CLOCK: CRYSTAL-CLEAR TYPOGRAPHY & OVERLAP PREVENTION
// ============================================================================
(function() {
  function initMasterClock() {
    const baseCanvas = document.querySelector('canvas:not(#sanctuary-wheel-overlay)');
    if (!baseCanvas) return;
    const parent = baseCanvas.parentElement;
    if (!parent) return;

    if (window.getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    let overlay = document.getElementById('sanctuary-wheel-overlay');
    if (!overlay) {
      overlay = document.createElement('canvas');
      overlay.id = 'sanctuary-wheel-overlay';
      overlay.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 20;';
      parent.appendChild(overlay);
    }

    const zodiacSigns = ['♈ Aries', '♉ Taurus', '♊ Gemini', '♋ Cancer', '♌ Leo', '♍ Virgo', '♎ Libra', '♏ Scorpio', '♐ Sagittarius', '♑ Capricorn', '♒ Aquarius', '♓ Pisces'];

    const rings = [
      { name: 'Sun ☉ • 963 Hz', time: '14:00', color: '#a855f7', speed: 0.0004, radiusPct: 0.85, phaseOffset: 0.0 },
      { name: 'Moon ☽ • 852 Hz', time: '09:31', color: '#38bdf8', speed: -0.0016, radiusPct: 0.73, phaseOffset: 1.0 },
      { name: 'Mercury ☿ • 741 Hz', time: '08:00', color: '#06b6d4', speed: 0.0009, radiusPct: 0.61, phaseOffset: 2.1 },
      { name: 'Venus ♀ • 639 Hz', time: '05:28', color: '#10b981', speed: -0.0007, radiusPct: 0.49, phaseOffset: 3.2 },
      { name: 'Mars ♂ • 528 Hz', time: '04:17', color: '#f59e0b', speed: 0.0012, radiusPct: 0.37, phaseOffset: 4.2 },
      { name: 'Saturn ♄ • 432 Hz', time: '03:33', color: '#ef4444', speed: -0.0003, radiusPct: 0.25, phaseOffset: 5.3 }
    ];

    const asteroids = [
      { name: 'Chiron ⚷', color: '#f43f5e', speed: 0.0009, radiusPct: 0.55, phaseOffset: 0.8 },
      { name: 'Pallas ⚴', color: '#fb7185', speed: -0.0007, radiusPct: 0.55, phaseOffset: 2.4 },
      { name: 'Juno ⚵', color: '#fda4af', speed: 0.0010, radiusPct: 0.55, phaseOffset: 4.0 },
      { name: 'Vesta ⚶', color: '#fecdd3', speed: -0.0008, radiusPct: 0.55, phaseOffset: 5.5 }
    ];

    const fixedStars = [
      { name: 'Aldebaran ✦', color: '#fbbf24', speed: 0.0002, radiusPct: 0.67, phaseOffset: 0.5 },
      { name: 'Regulus ✦', color: '#f59e0b', speed: -0.0002, radiusPct: 0.67, phaseOffset: 2.0 },
      { name: 'Antares ✦', color: '#d97706', speed: 0.0002, radiusPct: 0.67, phaseOffset: 3.5 },
      { name: 'Fomalhaut ✦', color: '#b45309', speed: -0.0002, radiusPct: 0.67, phaseOffset: 5.0 }
    ];

    let rot = 0;
    let radarAngle = 0;

    function resizeOverlay() {
      const rect = baseCanvas.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height, 600);
      overlay.width = size;
      overlay.height = size;
      overlay.style.width = '100%';
      overlay.style.height = '100%';
    }
    window.addEventListener('resize', resizeOverlay);
    resizeOverlay();

    function renderMasterClock() {
      const ctx = overlay.getContext('2d');
      if (!ctx) return;

      const w = overlay.width;
      const h = overlay.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(cx, cy) * 0.92;

      ctx.clearRect(0, 0, w, h);

      // 1. Ephemeris 360° Degree Ticks & Numerals
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot * 0.05);

      for (let deg = 0; deg < 360; deg += 5) {
        const rad = (deg * Math.PI) / 180;
        const isMajor = deg % 10 === 0;
        const innerR = maxR - (isMajor ? 14 : 7);
        
        ctx.beginPath();
        ctx.moveTo(Math.cos(rad) * innerR, Math.sin(rad) * innerR);
        ctx.lineTo(Math.cos(rad) * maxR, Math.sin(rad) * maxR);
        ctx.strokeStyle = isMajor ? 'rgba(56, 189, 248, 0.7)' : 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = isMajor ? 1.5 : 1;
        ctx.stroke();

        if (deg % 30 === 0) {
          ctx.font = '11px monospace';
          ctx.fillStyle = '#38bdf8';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const textR = maxR - 30;
          ctx.fillText(`${deg}°`, Math.cos(rad) * textR, Math.sin(rad) * textR);
        }
      }

      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#e2e8f0';
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI / 6) - Math.PI / 2 + (Math.PI / 12);
        const x = Math.cos(angle) * (maxR - 52);
        const y = Math.sin(angle) * (maxR - 52);
        ctx.fillText(zodiacSigns[i], x, y);
      }
      ctx.restore();

      const normalizedRadarAngle = (radarAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const nodeCoords = [];

      function drawRingDegrees(r, ringSpeed, phase, ringColor) {
        ctx.save();
        ctx.translate(cx, cy);
        for (let d = 0; d < 360; d += 90) {
          const dRad = (d * Math.PI) / 180 + (phase + rot * (ringSpeed * 200));
          const tickX = Math.cos(dRad) * r;
          const tickY = Math.sin(dRad) * r;

          ctx.beginPath();
          ctx.arc(tickX, tickY, 2, 0, Math.PI * 2);
          ctx.fillStyle = ringColor;
          ctx.fill();

          ctx.font = '9px monospace';
          ctx.fillStyle = ringColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const numX = Math.cos(dRad) * (r + 15);
          const numY = Math.sin(dRad) * (r + 15);
          ctx.fillText(`${d}°`, numX, numY);
        }
        ctx.restore();
      }

      // 2. Render Planetary Rings, Degree Markers & Nodes
      rings.forEach((ring) => {
        const r = maxR * ring.radiusPct;
        ctx.save();
        ctx.translate(cx, cy);

        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const nodeAngle = (ring.phaseOffset + rot * (ring.speed * 200)) % (Math.PI * 2);
        const normalizedNodeAngle = (nodeAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const nx = Math.cos(nodeAngle) * r;
        const ny = Math.sin(nodeAngle) * r;

        nodeCoords.push({ x: cx + nx, y: cy + ny, color: ring.color });

        const angleDiff = Math.abs(normalizedRadarAngle - normalizedNodeAngle);
        const isPinged = angleDiff < 0.12 || angleDiff > (Math.PI * 2 - 0.12);

        if (isPinged) {
          ctx.beginPath();
          ctx.arc(nx, ny, 16, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(nx, ny, isPinged ? 9 : 7, 0, Math.PI * 2);
        ctx.fillStyle = isPinged ? '#ffffff' : ring.color;
        ctx.shadowColor = ring.color;
        ctx.shadowBlur = isPinged ? 20 : 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Dark background pill for crisp label readability over background lines
        const labelText = ring.name.split('•')[0].trim();
        ctx.font = 'bold 11px monospace';
        const textMetrics = ctx.measureText(labelText);
        const textW = textMetrics.width;
        const offsetX = nx >= 0 ? 12 : -12 - textW;
        
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(nx + offsetX - 4, ny - 8, textW + 8, 16);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(nx + offsetX - 4, ny - 8, textW + 8, 16);

        ctx.fillStyle = ring.color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, nx + offsetX, ny);

        // Ring Header label at top dead center with background pill
        const headerText = `${ring.name} [${ring.time}]`;
        ctx.font = 'bold 11px monospace';
        const headerMetrics = ctx.measureText(headerText);
        const headerW = headerMetrics.width;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(-headerW / 2 - 6, -r - 15, headerW + 12, 18);
        ctx.strokeStyle = ring.color;
        ctx.strokeRect(-headerW / 2 - 6, -r - 15, headerW + 12, 18);

        ctx.fillStyle = ring.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(headerText, 0, -r - 6);

        ctx.restore();

        drawRingDegrees(r, ring.speed, ring.phaseOffset, ring.color);
      });

      // 3. Render Asteroids with Clean Labels
      asteroids.forEach((ast) => {
        const r = maxR * ast.radiusPct;
        ctx.save();
        ctx.translate(cx, cy);

        const angle = (ast.phaseOffset + rot * (ast.speed * 180)) % (Math.PI * 2);
        const ax = Math.cos(angle) * r;
        const ay = Math.sin(angle) * r;

        ctx.beginPath();
        ctx.moveTo(ax, ay - 4);
        ctx.lineTo(ax + 4, ay);
        ctx.lineTo(ax, ay + 4);
        ctx.lineTo(ax - 4, ay);
        ctx.closePath();
        ctx.fillStyle = ast.color;
        ctx.fill();

        ctx.font = '10px monospace';
        const tM = ctx.measureText(ast.name);
        const aOffsetX = ax >= 0 ? 10 : -10 - tM.width;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(ax + aOffsetX - 3, ay - 7, tM.width + 6, 14);
        
        ctx.fillStyle = ast.color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(ast.name, ax + aOffsetX, ay);

        ctx.restore();
        drawRingDegrees(r, ast.speed, ast.phaseOffset, 'rgba(244, 63, 94, 0.4)');
      });

      // 4. Render Fixed Stars with Clean Labels
      fixedStars.forEach((star) => {
        const r = maxR * star.radiusPct;
        ctx.save();
        ctx.translate(cx, cy);

        const angle = (star.phaseOffset + rot * (star.speed * 120)) % (Math.PI * 2);
        const sx = Math.cos(angle) * r;
        const sy = Math.sin(angle) * r;

        ctx.font = '11px sans-serif';
        ctx.fillStyle = star.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✦', sx, sy);

        ctx.font = '10px monospace';
        const sTM = ctx.measureText(star.name);
        const sOffsetX = sx >= 0 ? 10 : -10 - sTM.width;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(sx + sOffsetX - 3, sy - 7, sTM.width + 6, 14);

        ctx.fillStyle = star.color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(star.name, sx + sOffsetX, sy);

        ctx.restore();
        drawRingDegrees(r, star.speed, star.phaseOffset, 'rgba(251, 191, 36, 0.4)');
      });

      // 5. Render Balanced Aspect Chords
      ctx.save();
      for (let i = 0; i < nodeCoords.length; i++) {
        for (let j = i + 1; j < nodeCoords.length; j++) {
          if ((i + j) % 2 === 0) {
            ctx.beginPath();
            ctx.moveTo(nodeCoords[i].x - cx, nodeCoords[i].y - cy);
            ctx.lineTo(nodeCoords[j].x - cx, nodeCoords[j].y - cy);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }
      ctx.restore();

      // 6. Sonar Radar Sweep
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(radarAngle);

      const sweepGrad = ctx.createConicGradient(0, 0, 0);
      sweepGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      sweepGrad.addColorStop(0.12, 'rgba(56, 189, 248, 0.08)');
      sweepGrad.addColorStop(0.25, 'rgba(56, 189, 248, 0)');
      sweepGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, maxR, 0, Math.PI * 2);
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(maxR, 0);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();

      rot += 0.0015;
      radarAngle += 0.0035;
      requestAnimationFrame(renderMasterClock);
    }

    renderMasterClock();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMasterClock);
  } else {
    setTimeout(initMasterClock, 150);
  }
})();
