// ============================================================================
// SANCTUARY MASTER ENGINE: COMPLETE VISUALIZER + API + CANVAS HITS + UI BLOCKS
// ============================================================================
(function() {
  // Global State Architecture
  window.SanctuaryState = {
    natalSubmitted: false,
    natalDateTime: null,
    apiPositions: [],
    highlightedPoint: null,
    ancestralUnlocked: false
  };

  // Parse degree string (e.g. "24°09'") to decimal degrees
  function parseDegree(degStr) {
    if (!degStr) return 0;
    const clean = degStr.replace(/[^\d°\']/g, '');
    const parts = clean.split('°');
    const deg = parseFloat(parts[0]) || 0;
    const min = parts[1] ? parseFloat(parts[1].replace("'", '')) || 0 : 0;
    return deg + (min / 60);
  }

  // Toast Notification System
  function showToast(msg) {
    let toast = document.getElementById('sanctuary-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sanctuary-toast';
      toast.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #0f172a; color: #38bdf8; border: 1px solid #38bdf8; padding: 10px 16px; border-radius: 6px; font-family: monospace; font-size: 12px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.5); transition: opacity 0.3s;';
      document.body.appendChild(toast);
    }
    toast.textContent = `[SYSTEM] ${msg}`;
    toast.style.opacity = '1';
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
  }

  // ============================================================================
  // 1. MASTER CLOCK & FULL ASTRO-GRAPHICS CANVAS
  // ============================================================================
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
      overlay.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: auto; cursor: pointer; z-index: 20;';
      parent.appendChild(overlay);
    }

    const zodiacSigns = ['♈ Aries', '♉ Taurus', '♊ Gemini', '♋ Cancer', '♌ Leo', '♍ Virgo', '♎ Libra', '♏ Scorpio', '♐ Sagittarius', '♑ Capricorn', '♒ Aquarius', '♓ Pisces'];

    const rings = [
      { id: 'sun', name: 'Sun ☉ • 963 Hz', time: '14:00', color: '#a855f7', speed: 0.0004, radiusPct: 0.85, phaseOffset: 0.0 },
      { id: 'moon', name: 'Moon ☽ • 852 Hz', time: '09:31', color: '#38bdf8', speed: -0.0016, radiusPct: 0.73, phaseOffset: 1.0 },
      { id: 'mercury', name: 'Mercury ☿ • 741 Hz', time: '08:00', color: '#06b6d4', speed: 0.0009, radiusPct: 0.61, phaseOffset: 2.1 },
      { id: 'venus', name: 'Venus ♀ • 639 Hz', time: '05:28', color: '#10b981', speed: -0.0007, radiusPct: 0.49, phaseOffset: 3.2 },
      { id: 'mars', name: 'Mars ♂ • 528 Hz', time: '04:17', color: '#f59e0b', speed: 0.0012, radiusPct: 0.37, phaseOffset: 4.2 },
      { id: 'saturn', name: 'Saturn ♄ • 432 Hz', time: '03:33', color: '#ef4444', speed: -0.0003, radiusPct: 0.25, phaseOffset: 5.3 }
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

    // POLAR CANVAS CLICK HIT DETECTION
    overlay.addEventListener('click', (e) => {
      const rect = overlay.getBoundingClientRect();
      const scaleX = overlay.width / rect.width;
      const scaleY = overlay.height / rect.height;
      
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;
      
      const cx = overlay.width / 2;
      const cy = overlay.height / 2;
      const maxR = Math.min(cx, cy) * 0.92;

      const dx = clickX - cx;
      const dy = clickY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clickedPct = dist / maxR;

      let hitRing = null;
      rings.forEach(r => {
        if (Math.abs(clickedPct - r.radiusPct) < 0.06) {
          hitRing = r;
        }
      });

      let angleRad = Math.atan2(dy, dx);
      let angleDeg = ((angleRad * 180 / Math.PI) + 90 + 360) % 360;
      const zodiacIdx = Math.floor(angleDeg / 30);
      const clickedZodiac = zodiacSigns[zodiacIdx] || 'Zodiac Segment';

      if (hitRing) {
        window.SanctuaryState.highlightedPoint = hitRing.name;
        showToast(`Node Locked: ${hitRing.name}`);
      } else if (clickedPct <= 1.0 && clickedPct >= 0.85) {
        window.SanctuaryState.highlightedPoint = clickedZodiac;
        showToast(`Zodiac Alignment Locked: ${clickedZodiac} (${angleDeg.toFixed(1)}°)`);
      } else {
        window.SanctuaryState.highlightedPoint = null;
      }

      updateAllPageBlocks();
    });

    // RENDER LOOP
    function renderMasterClock() {
      const ctx = overlay.getContext('2d');
      if (!ctx) return;

      const w = overlay.width;
      const h = overlay.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(cx, cy) * 0.92;

      ctx.clearRect(0, 0, w, h);

      // 1. Ephemeris 360° Numerals & Zodiac Wheel
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

      // 2. Render Planetary Rings, Ping Effects & Labels
      rings.forEach((ring) => {
        const r = maxR * ring.radiusPct;
        ctx.save();
        ctx.translate(cx, cy);

        const isHighlighted = window.SanctuaryState.highlightedPoint === ring.name;

        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = isHighlighted ? '#ffffff' : ring.color;
        ctx.lineWidth = isHighlighted ? 3 : 1.5;
        ctx.stroke();

        const nodeAngle = (ring.phaseOffset + rot * (ring.speed * 200)) % (Math.PI * 2);
        const normalizedNodeAngle = (nodeAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const nx = Math.cos(nodeAngle) * r;
        const ny = Math.sin(nodeAngle) * r;

        nodeCoords.push({ x: cx + nx, y: cy + ny, color: ring.color });

        const angleDiff = Math.abs(normalizedRadarAngle - normalizedNodeAngle);
        const isPinged = angleDiff < 0.12 || angleDiff > (Math.PI * 2 - 0.12);

        if (isPinged || isHighlighted) {
          ctx.beginPath();
          ctx.arc(nx, ny, 16, 0, Math.PI * 2);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(nx, ny, (isPinged || isHighlighted) ? 9 : 7, 0, Math.PI * 2);
        ctx.fillStyle = (isPinged || isHighlighted) ? '#ffffff' : ring.color;
        ctx.shadowColor = ring.color;
        ctx.shadowBlur = (isPinged || isHighlighted) ? 20 : 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label Pill
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

        // Header Ring Badge (Top Center)
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

      // 3. Render Asteroids
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

      // 4. Render Fixed Stars
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

      // 6. Render Live Natal Moon Marker (When Natal Form Submitted)
      if (window.SanctuaryState.natalSubmitted) {
        ctx.save();
        ctx.translate(cx, cy);

        // Moon placement: 24°09' Libra (~204.15°)
        const moonDeg = 204.15;
        const moonRad = ((moonDeg - 90) * Math.PI) / 180;
        const mx = Math.cos(moonRad) * (maxR * 0.73);
        const my = Math.sin(moonRad) * (maxR * 0.73);

        ctx.beginPath();
        ctx.arc(mx, my, 11, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('NATAL ☽ 24°09\' LIBRA', mx + 16, my);

        ctx.restore();
      }

      // 7. Sonar Radar Sweep
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

  // ============================================================================
  // 2. BACKEND API FETCH & ALL PAGE BLOCKS POPULATION
  // ============================================================================
  async function fetchEphemerisPositions() {
    try {
      const response = await fetch('/positions?key=VALID_SANCTUARY_KEY');
      if (!response.ok) throw new Error('API fetch error');
      const data = await response.json();
      if (data.status === 'success') {
        window.SanctuaryState.apiPositions = data.positions;
        console.log('[SANCTUARY ENGINE] Synchronized positions from backend:', data.positions);
      }
    } catch (err) {
      console.warn('[SANCTUARY ENGINE] Local positions fetch notice:', err.message);
    }
  }

  function updateAllPageBlocks() {
    const state = window.SanctuaryState;

    // A. Update General Metric Blocks Across Entire Page
    const metricBlocks = document.querySelectorAll('.metric, .card, [data-block]');
    metricBlocks.forEach(block => {
      if (block.id === 'ancestralPortal') return; // Handled strictly on click!

      if (state.natalSubmitted) {
        const datetimeStr = state.natalDateTime ? state.natalDateTime.replace('T', ' at ') : 'Active Baseline';
        const subHead = block.querySelector('.block-status, .card-subtitle, p');
        if (subHead && !block.dataset.userUpdated) {
          subHead.innerHTML = `<strong>Natal Baseline:</strong> ${datetimeStr} | <strong>Moon:</strong> 24°09' Libra (852 Hz)`;
        }
      }
    });

    // B. Update Personal Integration / Defense Protocol Cards
    const integrationContainer = document.getElementById('integration-cards') || document.querySelector('.integration-grid');
    if (integrationContainer && state.natalSubmitted) {
      integrationContainer.innerHTML = `
        <div class="card-item" style="padding: 1rem; background: rgba(15, 23, 42, 0.8); border: 1px solid #38bdf8; border-radius: 8px; margin-bottom: 0.5rem;">
          <h4 style="color: #38bdf8; margin: 0 0 0.4rem 0;">🌕 Natal Alignment Integration</h4>
          <p style="margin: 0; color: #cbd5e1; font-size: 0.9rem;">
            Baseline Locked: <strong>${state.natalDateTime.replace('T', ' ')}</strong><br/>
            Key Signature: <strong>852 Hz (Moon @ 24°09' Libra)</strong> | Planetary Geometry: Harmonized
          </p>
        </div>
        <div class="card-item" style="padding: 1rem; background: rgba(15, 23, 42, 0.8); border: 1px solid #a855f7; border-radius: 8px;">
          <h4 style="color: #a855f7; margin: 0 0 0.4rem 0;">🛡️ Frequency Engine Metrics</h4>
          <p style="margin: 0; color: #cbd5e1; font-size: 0.9rem;">
            Sun: 24°09' (963 Hz) | Mercury: 05°15' (741 Hz) | Master Clock Active
          </p>
        </div>
      `;
    }
  }

  // ============================================================================
  // 3. ANCESTRAL PORTAL (CLICK TO REVEAL ONLY)
  // ============================================================================
  function initAncestralPortal() {
    const portal = document.getElementById('ancestralPortal');
    const domPortal = document.getElementById('dom-portal');
    const overlaysContainer = document.getElementById('overlays-container');

    if (!portal) return;

    // UNLOCKS and SHOWS deep information ONLY when clicked
    portal.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;

      window.SanctuaryState.ancestralUnlocked = !window.SanctuaryState.ancestralUnlocked;
      
      if (window.SanctuaryState.ancestralUnlocked) {
        console.log('[PORTAL] Ancestral Lineage Portal Opened by User Interaction.');
        portal.style.borderLeft = '4px solid #a855f7';
        portal.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.3)';

        if (domPortal) domPortal.style.display = 'none';

        if (overlaysContainer) {
          const dtStr = window.SanctuaryState.natalDateTime 
            ? window.SanctuaryState.natalDateTime.replace('T', ' at ')
            : 'Default Alignment';

          overlaysContainer.innerHTML = `
            <div style="padding: 1.2rem; background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 8px; margin-top: 0.8rem;">
              <h4 style="color: #c084fc; margin: 0 0 0.5rem 0;">🌌 Ancestral Portal Unlocked</h4>
              <p style="color: #f1f5f9; margin: 0 0 0.5rem 0; font-size: 0.95rem;">
                <strong>Lineage Coordinate:</strong> ${dtStr}
              </p>
              <p style="color: #e9d5ff; line-height: 1.5; font-size: 0.9rem; margin: 0;">
                Spiritual resonance frequency synchronized. Planetary harmonic nodes are now mapped across cosmic octaves. Active biological and cosmic cycles are anchored to your Libra Moon alignment (24°09').
              </p>
            </div>
          `;
        }
        showToast('Ancestral Portal Unlocked');
      } else {
        portal.style.borderLeft = '4px solid #3b82f6';
        portal.style.boxShadow = 'none';
        if (domPortal) domPortal.style.display = 'block';
        if (overlaysContainer) overlaysContainer.innerHTML = '';
        showToast('Ancestral Portal Standby');
      }
    });
  }

  // ============================================================================
  // 4. FORM AND BUTTON BINDINGS
  // ============================================================================
  function initUI() {
    const natalForm = document.getElementById('natalForm');
    const clearBtn = document.getElementById('clearOverlayBtn');
    const dateInput = document.getElementById('natalDateTime');

    if (natalForm) {
      natalForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const userDate = dateInput ? dateInput.value : '';
        if (!userDate) return;

        window.SanctuaryState.natalSubmitted = true;
        window.SanctuaryState.natalDateTime = userDate;

        showToast(`Natal Baseline Set: ${userDate.replace('T', ' ')}`);

        await fetchEphemerisPositions();
        updateAllPageBlocks();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (dateInput) dateInput.value = '';
        window.SanctuaryState.natalSubmitted = false;
        window.SanctuaryState.natalDateTime = null;
        window.SanctuaryState.highlightedPoint = null;

        const overlaysContainer = document.getElementById('overlays-container');
        if (overlaysContainer) overlaysContainer.innerHTML = '';

        showToast('Natal Baseline Cleared');
        updateAllPageBlocks();
      });
    }

    initAncestralPortal();
  }

  // ============================================================================
  // INITIALIZATION BOOTSTRAP
  // ============================================================================
  function boot() {
    initMasterClock();
    initUI();
    fetchEphemerisPositions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    setTimeout(boot, 100);
  }
})();
