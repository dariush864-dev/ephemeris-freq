const Astronomy = require('astronomy-engine');
const fs = require('fs');
const path = require('path');

const ALL_BODIES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'North Node', 'Chiron', 'Lilith'];
const SOLFEGGIO_FREQS = [174, 285, 396, 417, 528, 639, 741, 852, 963];

const ZODIAC_SIGNS = [
    { name: 'Aries', symbol: '♈', abbr: 'Ari' },
    { name: 'Taurus', symbol: '♉', abbr: 'Tau' },
    { name: 'Gemini', symbol: '♊', abbr: 'Gem' },
    { name: 'Cancer', symbol: '♋', abbr: 'Can' },
    { name: 'Leo', symbol: '♌', abbr: 'Leo' },
    { name: 'Virgo', symbol: '♍', abbr: 'Vir' },
    { name: 'Libra', symbol: '♎', abbr: 'Lib' },
    { name: 'Scorpio', symbol: '♏', abbr: 'Sco' },
    { name: 'Sagittarius', symbol: '♐', abbr: 'Sag' },
    { name: 'Capricorn', symbol: '♑', abbr: 'Cap' },
    { name: 'Aquarius', symbol: '♒', abbr: 'Aqu' },
    { name: 'Pisces', symbol: '♓', abbr: 'Pis' }
];

const RECOMMENDATIONS = {
    Sun: { state: 'Alpha (10Hz) - Solar Vitality & Centering', targetOffset: 10, defaultCarrier: 528 },
    Moon: { state: 'Theta (6Hz) - Subconscious Integration & Fluidity', targetOffset: 6, defaultCarrier: 285 },
    Mercury: { state: 'Beta (18Hz) - Cognitive Processing & Synthesis', targetOffset: 18, defaultCarrier: 852 },
    Venus: { state: 'Alpha (8Hz) - Harmonic Coherence & Resonance', targetOffset: 8, defaultCarrier: 639 },
    Mars: { state: 'Beta (14Hz) - Focused Vital Energy & Drive', targetOffset: 14, defaultCarrier: 417 },
    Jupiter: { state: 'Theta (7Hz) - Expansive Wisdom & Abundance', targetOffset: 7, defaultCarrier: 741 },
    Saturn: { state: 'Delta (3Hz) - Deep Structural Foundation & Grounding', targetOffset: 3, defaultCarrier: 174 },
    Uranus: { state: 'Gamma (40Hz) - Epiphany & Neural Synchronization', targetOffset: 40, defaultCarrier: 963 },
    Neptune: { state: 'Theta/Delta (4Hz) - Transcendental Flow & Intuition', targetOffset: 4, defaultCarrier: 396 },
    Pluto: { state: 'Deep Delta (1.5Hz) - Regeneration & Metamorphosis', targetOffset: 1.5, defaultCarrier: 174 },
    'North Node': { state: 'Theta (5.5Hz) - Karmic Direction & Destiny Alignment', targetOffset: 5.5, defaultCarrier: 741 },
    Chiron: { state: 'Schumann (7.83Hz) - Wounded Healer & Somatic Bridge', targetOffset: 7.83, defaultCarrier: 528 },
    Lilith: { state: 'Delta (2.5Hz) - Primal Intuition & Shadow Alchemy', targetOffset: 2.5, defaultCarrier: 396 }
};

function getJulianCenturies(date) {
    const jd = (date.getTime() / 86400000) + 2440587.5;
    return (jd - 2451545.0) / 36525;
}

function getMeanNorthNode(date) {
    const T = getJulianCenturies(date);
    let omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
    omega = omega % 360;
    if (omega < 0) omega += 360;
    return omega;
}

function getMeanLilith(date) {
    const T = getJulianCenturies(date);
    let lilith = 83.353243 + 4069.0137287 * T - 0.010325 * T * T - (T * T * T) / 80053;
    lilith = lilith % 360;
    if (lilith < 0) lilith += 360;
    return lilith;
}

function getChiron(date) {
    const T = getJulianCenturies(date);
    let L = 247.2 + 709.2 * T;
    let M = (L - 339.3) * Math.PI / 180;
    let eqCenter = 2 * 0.38 * Math.sin(M);
    let lon = (L + eqCenter * (180 / Math.PI)) % 360;
    if (lon < 0) lon += 360;
    return lon;
}

function getZodiacDetails(lon) {
    const normalized = (lon % 360 + 360) % 360;
    const signIndex = Math.floor(normalized / 30);
    const degInSign = Math.floor(normalized % 30);
    const sign = ZODIAC_SIGNS[signIndex];
    return {
        signName: sign.name,
        symbol: sign.symbol,
        abbr: sign.abbr,
        degInSign: degInSign,
        formatted: `${degInSign}° ${sign.abbr}`
    };
}

function computeBodyLongitude(name, date, time) {
    if (name === 'North Node') return getMeanNorthNode(date);
    if (name === 'Lilith') return getMeanLilith(date);
    if (name === 'Chiron') return getChiron(date);
    return Astronomy.EclipticLongitude(name, time);
}

function computePositions(date) {
    const time = Astronomy.MakeTime(date);
    const prevDate = new Date(date.getTime() - (6 * 3600 * 1000));
    const prevTime = Astronomy.MakeTime(prevDate);

    const data = {};
    const rawLongitudes = {};

    ALL_BODIES.forEach(name => {
        try {
            const lon = computeBodyLongitude(name, date, time);
            const prevLon = computeBodyLongitude(name, prevDate, prevTime);

            let diff = lon - prevLon;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;
            const isRetrograde = diff < 0;

            const index = Math.floor((lon / 360) * SOLFEGGIO_FREQS.length);
            const baseFreq = SOLFEGGIO_FREQS[Math.min(index, SOLFEGGIO_FREQS.length - 1)];
            const binauralOffset = parseFloat((1 + ((lon % 1) * 11)).toFixed(2));
            const zodiac = getZodiacDetails(lon);

            rawLongitudes[name] = lon;
            data[name] = {
                longitude: parseFloat(lon.toFixed(2)),
                baseFrequency: baseFreq,
                binauralOffset: binauralOffset,
                isRetrograde: isRetrograde,
                zodiac: zodiac,
                recommendation: RECOMMENDATIONS[name] || { state: 'Alpha (10Hz)', targetOffset: 10, defaultCarrier: 528 }
            };
        } catch (err) {
            rawLongitudes[name] = 0;
            data[name] = {
                longitude: 0,
                baseFrequency: 432,
                binauralOffset: 4,
                isRetrograde: false,
                zodiac: getZodiacDetails(0),
                recommendation: RECOMMENDATIONS.Sun
            };
        }
    });

    return { data, rawLongitudes };
}

function calculateAspects(planets1, planets2 = null) {
    const isOverlay = !!planets2;
    const targetSet2 = planets2 || planets1;
    const aspects = [];
    const aspectTypes = [
        { name: 'Conjunction', angle: 0, orb: 6, color: '#f8fafc' },
        { name: 'Sextile', angle: 60, orb: 5, color: '#38bdf8' },
        { name: 'Square', angle: 90, orb: 5, color: '#f43f5e' },
        { name: 'Trine', angle: 120, orb: 5, color: '#4ade80' },
        { name: 'Opposition', angle: 180, orb: 5, color: '#fbbf24' }
    ];

    const keys1 = Object.keys(planets1);
    const keys2 = Object.keys(targetSet2);

    for (let i = 0; i < keys1.length; i++) {
        const p1 = keys1[i];
        const startJ = isOverlay ? 0 : i + 1;
        for (let j = startJ; j < keys2.length; j++) {
            const p2 = keys2[j];
            if (!isOverlay && i === j) continue;

            const lon1 = planets1[p1];
            const lon2 = targetSet2[p2];

            let diff = Math.abs(lon1 - lon2);
            if (diff > 180) diff = 360 - diff;

            aspectTypes.forEach(asp => {
                const currentOrb = Math.abs(diff - asp.angle);
                if (currentOrb <= asp.orb) {
                    aspects.push({
                        id: `${p1}-${asp.name}-${p2}`,
                        planet1: p1,
                        planet2: p2,
                        aspect: asp.name,
                        orb: parseFloat(currentOrb.toFixed(2)),
                        color: asp.color
                    });
                }
            });
        }
    }
    return aspects;
}

function saveAnalyticalData(analyticalData) {
    try {
        const dir = path.join(__dirname, '../../data');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const filePath = path.join(dir, 'natal_analytical_library.json');

        let library = [];
        if (fs.existsSync(filePath)) {
            try {
                library = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            } catch (e) { library = []; }
        }

        library.push({
            entry_id: `ana_${Date.now()}`,
            timestamp: new Date().toISOString(),
            metrics: analyticalData
        });

        fs.writeFileSync(filePath, JSON.stringify(library, null, 2));
    } catch (err) {
        console.error('Failed to write to analytical library:', err);
    }
}

function getPlanetaryPositions(natalDateStr = null) {
    const now = new Date();
    const transit = computePositions(now);
    const transitAspects = calculateAspects(transit.rawLongitudes);

    let natal = null;
    let overlayAspects = [];

    if (natalDateStr) {
        const natalDate = new Date(natalDateStr);
        if (!isNaN(natalDate.getTime())) {
            natal = computePositions(natalDate);
            overlayAspects = calculateAspects(natal.rawLongitudes, transit.rawLongitudes);

            saveAnalyticalData({
                natal_longitudes: natal.rawLongitudes,
                transit_longitudes: transit.rawLongitudes,
                active_overlay_aspects: overlayAspects.map(a => `${a.planet1}_${a.aspect}_${a.planet2}`)
            });
        }
    }

    return {
        transit: transit.data,
        transitAspects: transitAspects,
        natal: natal ? natal.data : null,
        overlayAspects: overlayAspects
    };
}

module.exports = {
    getPlanetaryPositions
};
