let celestialData = { transit: {}, transitAspects: [], natal: null, overlayAspects: [] };
let mode = 'planet';
let audioMode = 'binaural';
let soundPlaybackMode = 'fusion'; 
let selectedTarget = '';
let activeNatalDate = null;
let masterTuning = 432;
let breathPattern = 'balanced';
let droneType = 'pandrum';
let selectedSignIndex = null;
let selectedNatalKey = null;

let audioCtx = null;
let oscLeft = null;
let oscRight = null;
let freqGain = null;
let instrumentGain = null;
let isPlaying = false;
let lastCycleMinute = -1;

let melodyStartTime = 0;
let melodySchedulerTimer = null;

const CYCLE_DURATION_MS = 14 * 60 * 1000;

const ZODIAC_DATA = [
    { name: 'Aries', symbol: '♈', abbr: 'Ari', element: 'Fire', defense: 'Mars Pillar: Sovereign ignition, cutting through static friction with direct energetic clarity.' },
    { name: 'Taurus', symbol: '♉', abbr: 'Tau', element: 'Earth', defense: 'Earth Anchor: Deep tectonic grounding, stabilizing frequency against external fluctuation.' },
    { name: 'Gemini', symbol: '♊', abbr: 'Gem', element: 'Air', defense: 'Mercury Prism: Fluid cognitive agility, filtering coherence across multi-channel streams.' },
    { name: 'Cancer', symbol: '♋', abbr: 'Can', element: 'Water', defense: 'Lunar Sanctuary: Emotional boundary fortress, holding psychic resonance securely.' },
    { name: 'Leo', symbol: '♌', abbr: 'Leo', element: 'Fire', defense: 'Solar Radiance: Unyielding core luminosity, radiating sovereign creative expression.' },
    { name: 'Virgo', symbol: '♍', abbr: 'Vir', element: 'Earth', defense: 'Alchemical Net: Precise structural calibration, refining details into systemic harmony.' },
    { name: 'Libra', symbol: '♎', abbr: 'Lib', element: 'Air', defense: 'Equinox Balance: Dynamic equilibrium, holding exact tension between opposing poles.' },
    { name: 'Scorpio', symbol: '♏', abbr: 'Sco', element: 'Water', defense: 'Abyssal Shield: Regenerative transmutation vault, transforming pressure into pure power.' },
    { name: 'Sagittarius', symbol: '♐', abbr: 'Sag', element: 'Fire', defense: 'Celestial Arrow: Visionary trajectory, projecting intent straight toward absolute truth.' },
    { name: 'Capricorn', symbol: '♑', abbr: 'Cap', element: 'Earth', defense: 'Monolith Fortress: Structural mastery, building unshakeable foundations over long arcs.' },
    { name: 'Aquarius', symbol: '♒', abbr: 'Aqu', element: 'Air', defense: 'Etheric Lattice: High-frequency circuit, connecting individual will to collective futures.' },
    { name: 'Pisces', symbol: '♓', abbr: 'Pis', element: 'Water', defense: 'Oceanic Horizon: Infinite dissolution filter, dissolving temporal boundaries into peace.' }
];

const FIXED_STARS = [
    { name: 'Algol', longitude: 56.5, nature: 'Deep Transformation', freq: 174 },
    { name: 'Aldebaran', longitude: 69.4, nature: 'Unflinching Integrity', freq: 432 },
    { name: 'Sirius', longitude: 104.5, nature: 'Abundant Radiance', freq: 528 },
    { name: 'Regulus', longitude: 149.9, nature: 'Sovereign Command', freq: 639 },
    { name: 'Spica', longitude: 204.0, nature: 'Protected Mastery', freq: 741 },
    { name: 'Antares', longitude: 249.7, nature: 'Strategic Precision', freq: 852 },
    { name: 'Fomalhaut', longitude: 333.9, nature: 'Visionary Synthesis', freq: 963 }
];

const CONSTELLATIONS = [
    { name: 'Orion Belt', longitude: 85.0, type: 'Star Group' },
    { name: 'Ursa Major', longitude: 160.0, type: 'Star Group' },
    { name: 'Hydra', longitude: 135.0, type: 'Star Group' },
    { name: 'Cygnus', longitude: 310.0, type: 'Star Group' },
    { name: 'Cetus', longitude: 22.0, type: 'Star Group' },
    { name: 'Pleiades', longitude: 59.0, type: 'Star Cluster' }
];

const ASTEROID_DATA = [
    { name: 'Ceres', longitude: 45.2, baseFrequency: 285, isRetrograde: false, zodiac: { formatted: 'Taurus' } },
    { name: 'Pallas', longitude: 110.5, baseFrequency: 396, isRetrograde: true, zodiac: { formatted: 'Gemini' } },
    { name: 'Juno', longitude: 285.0, baseFrequency: 417, isRetrograde: false, zodiac: { formatted: 'Capricorn' } },
    { name: 'Vesta', longitude: 180.2, baseFrequency: 639, isRetrograde: false, zodiac: { formatted: 'Virgo' } },
    { name: 'Chiron', longitude: 220.8, baseFrequency: 528, isRetrograde: true, zodiac: { formatted: 'Scorpio' } },
    { name: 'Lilith', longitude: 250.4, baseFrequency: 174, isRetrograde: false, zodiac: { formatted: 'Sagittarius' } },
    { name: 'North Node', longitude: 340.1, baseFrequency: 741, isRetrograde: true, zodiac: { formatted: 'Pisces' } }
];

const INSTRUMENT_MELODIES = {
    pandrum: [
        { time: 0.0, interval: 1.0, dur: 3.5, vol: 0.9 },
        { time: 3.2, interval: 1.5, dur: 3.0, vol: 0.85 },
        { time: 6.5, interval: 1.333, dur: 4.0, vol: 0.9 },
        { time: 10.8, interval: 2.0, dur: 3.5, vol: 0.95 }
    ],
    tibetan: [
        { time: 0.0, interval: 1.0, dur: 7.0, vol: 1.0 },
        { time: 7.5, interval: 1.333, dur: 7.5, vol: 0.95 }
    ]
};

const FOCUS_PROFILES = [
    { 
        type: 'Phase I: Deep Grounding & Somatic Calibration', 
        part: 'Root & Structural Core', 
        mudra: 'Root Foundation Mudra',
        mudraDesc: 'Interlock lower fingers and press thumbs firmly down.',
        yoga: 'Mountain Root Stand',
        yogaDesc: 'Distribute body weight evenly across both soles.',
        instruction: 'Anchor your energetic frequency downward into absolute physical stability.',
        psychLove: [
            '1. Maintain firm relational boundaries without absorbing outside emotional turbulence.',
            '2. Recognize that security is cultivated from within your own sovereign baseline.',
            '3. Release compulsive hyper-vigilance by trusting your immediate environment.',
            '4. Establish predictable, grounded rhythms in shared domestic spaces.',
            '5. Honor your need for quiet solitude to recharge vital battery reserves.',
            '6. It is completely okay to take a step back and just breathe today.',
            '7. You do not have to fix everyone else’s problems right now.',
            '8. Let yourself feel safe and supported exactly where you are.',
            '9. Share your feelings using simple, honest, and gentle words.',
            '10. Remember that you are worthy of a calm, steady, and drama-free love.'
        ],
        psychHealth: [
            '1. Regulate nervous system firing through prolonged, diaphragmatic exhalations.',
            '2. Release muscular guarding held tightly across the shoulders and jaw line.',
            '3. Ground excess mental static by walking barefoot on natural soil or stone.',
            '4. Prioritize consistent circadian alignment through early morning light exposure.',
            '5. Maintain adequate cellular hydration to support electrical conductivity.',
            '6. If you feel tense, sigh out loud and drop your shoulders.',
            '7. Give yourself full permission to rest without feeling guilty.',
            '8. Step outside for just five minutes to feel the air on your skin.',
            '9. Notice where your body hurts and send warmth to that exact spot.',
            '10. Drink a cool glass of water and remind your body it is safe.'
        ],
        psychCareer: [
            '1. Tackle complex professional milestones through methodical, step-by-step execution.',
            '2. Refuse to rush foundational planning under external artificial deadlines.',
            '3. Secure your workspace physical ergonomics to eliminate micro-distractions.',
            '4. Document standard operating procedures to reduce cognitive overhead.',
            '5. Anchor your professional self-worth in tangible, completed deliverables.',
            '6. Pick just one easy task to finish first so you feel accomplished.',
            '7. Do not let other people’s urgency ruin your inner peace.',
            '8. Make your desk a cozy, comfortable place that feels good to sit at.',
            '9. It is okay to say "I need more time" if you feel overwhelmed.',
            '10. Be proud of the hard work you have already done today.'
        ],
        psychWealth: [
            '1. Audit recurring expenditures to reinforce baseline financial security.',
            '2. Build conservative cash reserves as an unshakeable psychological buffer.',
            '3. Avoid impulsive financial commitments driven by transient market FOMO.',
            '4. Treat capital allocation with calm, disciplined, long-term stewardship.',
            '5. Recognize that true wealth encompasses sustainable energetic reserves.',
            '6. Look at your money situation with kindness, not fear or shame.',
            '7. Remind yourself that having a little bit saved is a great start.',
            '8. Pause before buying things; ask if it truly brings you joy.',
            '9. Forgive yourself for past money mistakes—you are learning.',
            '10. Trust that you have enough right now to be fundamentally okay.'
        ],
        creativeLove: 'Design a physical altar or sanctuary zone representing relational stability.',
        creativeHealth: 'Engage in slow, rhythmic somatic movement to re-pattern physical trauma.',
        creativeCareer: 'Construct a comprehensive master project blueprint before writing code or copy.',
        creativeWealth: 'Draft a visual net-worth trajectory chart mapping out the next five years.'
    },
    { 
        type: 'Phase II: Cognitive Clarity & Field Alignment', 
        part: 'Crown & Mental Aura', 
        mudra: 'Aura Synthesis Mudra',
        mudraDesc: 'Touch fingertips lightly above the crown of the head.',
        yoga: 'Extended Spine Extension',
        yogaDesc: 'Elongate the cervical spine while keeping shoulders dropped.',
        instruction: 'Expand your mental horizon into high-frequency clarity and unclouded focus.',
        psychLove: [
            '1. Cut through relational ambiguity with clean, transparent communication.',
            '2. Refuse to engage in circular intellectual debates that drain vitality.',
            '3. Cultivate intellectual parity and shared curiosity in partnerships.',
            '4. Give loved ones the mental space to process their own conclusions.',
            '5. Filter out external social noise to hear your authentic inner voice.',
            '6. Speak your mind gently without fear of being judged.',
            '7. Listen to your partner with an open, soft heart, not a defensive one.',
            '8. It’s okay to say "I need a minute to think before I respond."',
            '9. Don’t let rumors or outside chatter upset your peace of mind.',
            '10. Keep your conversations simple, kind, and fully present today.'
        ],
        psychHealth: [
            '1. Purge mental fatigue by stepping away from blue-light screens regularly.',
            '2. Practice alternate nostril breathing to balance cerebral hemisphere activity.',
            '3. Engage in quiet contemplative walks without acoustic stimulation.',
            '4. Rest your eyes using the 20-20-20 rule during intensive focus work.',
            '5. Clear mental loops by journaling unstructured thoughts onto paper.',
            '6. Give your brain a break from scrolling and notifications.',
            '7. Take a slow walk outside and just look at the sky for a moment.',
            '8. Close your eyes and enjoy the darkness when you feel overwhelmed.',
            '9. Write down your messy thoughts to get them out of your head.',
            '10. Drink a glass of water and breathe softly to clear the fog.'
        ],
        psychCareer: [
            '1. Prioritize your single most high-leverage intellectual task each morning.',
            '2. Eliminate redundant communication channels to protect deep work states.',
            '3. Synthesize complex data sets into clean, executive-level summaries.',
            '4. Delegate tactical execution to focus purely on strategic vision.',
            '5. Keep your digital workspace meticulously organized and archived.',
            '6. Do the one most important thing and let the rest wait for later.',
            '7. It is completely fine to put your status on "Do Not Disturb".',
            '8. Break big, scary projects down into tiny, easy-to-do steps.',
            '9. Ask for help if you feel like you are carrying too much.',
            '10. Clean your desk and desktop so your mind feels fresh and ready.'
        ],
        psychWealth: [
            '1. Analyze financial strategies with cold, objective mathematical logic.',
            '2. Educate yourself continuously on macroeconomic trends and monetary theory.',
            '3. Eliminate speculative micro-trades in favor of disciplined compounding.',
            '4. Align every financial outlay with your core long-term strategic vision.',
            '5. Maintain clear, audit-ready records of all revenue streams.',
            '6. Look at your bank account without guilt, anxiety, or judgment.',
            '7. You don’t have to follow financial trends or panic about the news.',
            '8. Only buy things today that truly make your daily life feel better.',
            '9. Trust that you have enough insight to keep yourself safe.',
            '10. Take a deep breath and know your money is meant to serve your peace.'
        ],
        creativeLove: 'Write a detailed manifesto clarifying your exact relational values and boundaries.',
        creativeHealth: 'Map out a personal mental hygiene protocol outlining your digital boundaries.',
        creativeCareer: 'Architect an automated workflow or script to eliminate repetitive administrative toil.',
        creativeWealth: 'Design a clean, data-driven financial dashboard tracking your core assets.'
    },
    { 
        type: 'Phase III: Heart Coherence & Generative Flow', 
        part: 'Thoracic Center & Heart', 
        mudra: 'Anahata Bridge Mudra',
        mudraDesc: 'Press palms flat at the center of the chest with soft elbows.',
        yoga: 'Open Chest Expansion',
        yogaDesc: 'Roll shoulders back and lift the sternum toward the sky.',
        instruction: 'Radiate unconditional warmth and compassionate resonance outward from the heart.',
        psychLove: [
            '1. Practice radical self-compassion to dissolve internalized self-criticism.',
            '2. Allow yourself to receive affection without suspicion or emotional armor.',
            '3. Offer forgiveness as a mechanism of personal liberation rather than obligation.',
            '4. Nurture reciprocal bonds built on mutual emotional safety and respect.',
            '5. Lead all interactions with authentic empathy and active, deep listening.',
            '6. Speak to yourself the way you would speak to your best friend.',
            '7. Let someone do something nice for you today without pushing it away.',
            '8. Let go of old grudges; they only hurt your own heart.',
            '9. Give a genuine, warm hug to someone you trust.',
            '10. Tell someone exactly why you appreciate having them in your life.'
        ],
        psychHealth: [
            '1. Breathe rhythmically into the chest cavity to stimulate vagal nerve tone.',
            '2. Release emotional armoring holding tension across the pectoral girdle.',
            '3. Cultivate feelings of genuine gratitude to lower systemic cortisol output.',
            '4. Engage in heart-opening aerobic exercise to boost cardiovascular vitality.',
            '5. Surround yourself with aesthetically uplifting, harmonious environments.',
            '6. Take a huge, deep breath into your chest and let it all out loudly.',
            '7. Stretch your arms wide open to physically open up your heart space.',
            '8. Think of one thing you are really happy about and smile.',
            '9. Go for a brisk walk to feel your heart beating strong and healthy.',
            '10. Put on your favorite soothing music and just feel the rhythm.'
        ],
        psychCareer: [
            '1. Foster a collaborative, supportive team culture built on mutual trust.',
            '2. Align your professional endeavors with a deep sense of personal purpose.',
            '3. Handle professional setbacks with grace and resilient emotional composure.',
            '4. Mentor junior colleagues with patience, encouragement, and clarity.',
            '5. Negotiate contracts with fairness, transparency, and integrity.',
            '6. Be the person at work who makes everyone else feel seen and valued.',
            '7. Remind yourself why you chose this work in the first place.',
            '8. If you make a mistake, forgive yourself instantly and keep going.',
            '9. Offer to help a coworker who looks like they are struggling.',
            '10. Stay honest and kind in every email and meeting you have today.'
        ],
        psychWealth: [
            '1. View financial resources as a tool to uplift your community and loved ones.',
            '2. Practice conscious, intentional spending that reflects your core values.',
            '3. Release scarcity mindsets by recognizing the abundance of opportunity.',
            '4. Support ethical enterprises and creators whose mission aligns with yours.',
            '5. Cultivate generosity without compromising your own baseline stability.',
            '6. Treat your money as a tool to bring happiness to you and your family.',
            '7. Buy a small, thoughtful gift for someone just to make them smile.',
            '8. Stop worrying that there isn’t enough; the universe is abundant.',
            '9. Tip a little extra today if you are able to.',
            '10. Be deeply thankful for every single dollar you currently have.'
        ],
        creativeLove: 'Write an appreciation journal documenting the profound gifts in your life.',
        creativeHealth: 'Engage in heart-opening restorative yoga poses supported by bolsters.',
        creativeCareer: 'Organize a collaborative brainstorming session centered on shared purpose.',
        creativeWealth: 'Establish a recurring monthly contribution to a cause or creator you love.'
    },
    { 
        type: 'Phase IV: Visionary Perception & Truth', 
        part: 'Brow & Sensory Perception', 
        mudra: 'Third Eye Focus Mudra',
        mudraDesc: 'Bring index fingertips together lightly between the eyebrows.',
        yoga: 'Seated Forward Folding Rest',
        yogaDesc: 'Fold gently forward to rest the forehead on a soft surface.',
        instruction: 'Perceive the underlying pattern beneath surface chaos with utter clarity.',
        psychLove: [
            '1. See past surface behaviors to understand the deeper motivations of others.',
            '2. Speak your authentic truth with uncompromising kindness and tact.',
            '3. Refuse to participate in triangulated gossip or social manipulation.',
            '4. Trust your intuitive instincts regarding relational compatibility.',
            '5. Honor your inner vision even when others fail to see the path.',
            '6. Try to understand why someone is hurting, even if they act out.',
            '7. Always tell the truth, but say it softly so it can be heard.',
            '8. Walk away from drama and people who want to talk badly about others.',
            '9. If your gut says something is wrong with a relationship, trust it.',
            '10. Believe in your own dreams for love, even if they seem far away.'
        ],
        psychHealth: [
            '1. Rest your ocular nerves by practicing dark-room palming exercises.',
            '2. Guard your sleep sanctuary against ambient light pollution.',
            '3. Cultivate mental silence through daily sensory withdrawal practice.',
            '4. Balance pineal gland circadian rhythms with natural morning sunlight.',
            '5. Listen to high-frequency binaural audio to induce calm theta states.',
            '6. Cup your hands over your eyes for a minute and enjoy the darkness.',
            '7. Make your bedroom as dark and cozy as a cave before sleeping.',
            '8. Turn off the radio or TV and just sit in total quiet for a while.',
            '9. Stand in the sunshine first thing in the morning to wake up your body.',
            '10. Put on some gentle chimes or soothing sounds to calm your brain.'
        ],
        psychCareer: [
            '1. Anticipate industry shifts before they become mainstream consensus.',
            '2. Trust your strategic intuition when navigating ambiguous decisions.',
            '3. Cut through bureaucratic complexity with razor-sharp analytical focus.',
            '4. Communicate complex concepts with stark, elegant simplicity.',
            '5. Maintain absolute fidelity to your professional code of ethics.',
            '6. Trust that little voice that gives you a great idea at work.',
            '7. If a project feels confusing, take a step back until it makes sense.',
            '8. Keep your emails short, sweet, and straight to the point.',
            '9. Explain things so simply that a five-year-old could understand.',
            '10. Never compromise what you know is right, even if it is the harder choice.'
        ],
        psychWealth: [
            '1. Spot structural inefficiencies in your financial portfolio instantly.',
            '2. Avoid chasing speculative hype by maintaining long-range perspective.',
            '3. Recognize emerging economic opportunities through deep observation.',
            '4. Plan your capital allocation with visionary, multi-year foresight.',
            '5. Keep your financial tracking transparent, clean, and unambiguous.',
            '6. Notice where your money slips away on things you don’t really care about.',
            '7. Don’t rush to buy something just because everyone else is.',
            '8. Look for simple, quiet ways to save a little extra this month.',
            '9. Imagine exactly how you want your bank account to look in a year.',
            '10. Be totally honest with yourself about what you owe and what you have.'
        ],
        creativeLove: 'Draw or paint an abstract visual representation of your inner intuition.',
        creativeHealth: 'Spend 20 minutes in absolute silence observing your breath in a dim room.',
        creativeCareer: 'Map out a visionary 3-year roadmap detailing your core milestones.',
        creativeWealth: 'Write an objective analysis of your current financial strengths and blind spots.'
    },
    { 
        type: 'Phase V: Solar Sovereignty & Willpower', 
        part: 'Solar Plexus & Core Center', 
        mudra: 'Power Fire Mudra',
        mudraDesc: 'Interlock fingers with straight index fingers pointing forward.',
        yoga: 'Core Stabilization Boat Pose',
        yogaDesc: 'Engage abdominal muscles while maintaining a lifted chest.',
        instruction: 'Ignite your sovereign inner sun, taking full command of your energetic output.',
        psychLove: [
            '1. Stand sovereign and unshakeable in your personal identity and values.',
            '2. Refuse to shrink your presence to accommodate the discomfort of others.',
            '3. Establish firm, loving boundaries that protect your vital energy.',
            '4. Take absolute accountability for your emotional reactions and choices.',
            '5. Celebrate your personal achievements with quiet, confident pride.',
            '6. Be completely proud of who you are and don’t hide your quirks.',
            '7. You don’t have to make yourself small just to make someone else comfortable.',
            '8. It is a beautiful thing to say "No, thank you" to protect your peace.',
            '9. Own your mistakes quickly and move on without beating yourself up.',
            '10. Pat yourself on the back today; you are doing a great job.'
        ],
        psychHealth: [
            '1. Breathe deeply into the solar plexus to stimulate digestive fire.',
            '2. Engage in strength training to build physical resilience and posture.',
            '3. Release internalized pressure by vocalizing tension through exhales.',
            '4. Consume clean, nutrient-dense foods that stabilize metabolic energy.',
            '5. Protect your daily recovery time with unwavering personal discipline.',
            '6. Take a deep breath right into your tummy to feel strong and centered.',
            '7. Stand up tall, put your hands on your hips, and feel your own strength.',
            '8. If you feel stressed, blow the air out of your mouth like blowing out a candle.',
            '9. Eat something fresh and healthy to give your body real fuel.',
            '10. Guard your bedtime fiercely so you wake up feeling powerful.'
        ],
        psychCareer: [
            '1. Take decisive leadership ownership during complex project phases.',
            '2. Execute tasks with unyielding momentum and disciplined drive.',
            '3. Say no to misaligned professional requests without guilt or hesitation.',
            '4. Protect your professional boundaries from scope creep and burnout.',
            '5. Deliver high-caliber work that reflects your highest professional standards.',
            '6. Step up and take charge if you see a team falling behind.',
            '7. Keep pushing forward even when the work gets a little boring.',
            '8. Do not feel bad for turning down extra work when you are at capacity.',
            '9. Leave work at work; protect your personal evening time.',
            '10. Do your absolute best today so you can log off feeling proud.'
        ],
        psychWealth: [
            '1. Command your financial destiny through proactive planning and control.',
            '2. Invest in income-generating assets that compound over time.',
            '3. Negotiate fearlessly for compensation that honors your expertise.',
            '4. Eliminate wasteful spending drains that dilute your capital power.',
            '5. Build multiple resilient pillars of financial independence.',
            '6. Take charge of your money today instead of avoiding looking at it.',
            '7. Put a little money somewhere it can grow quietly in the background.',
            '8. Know your worth and don’t be afraid to ask for what you deserve.',
            '9. Cut out one silly expense this week and put it in a jar.',
            '10. Build a safety net so you never have to feel stuck or scared.'
        ],
        creativeLove: 'Write a powerful declaration of personal sovereignty and healthy boundaries.',
        creativeHealth: 'Perform a dynamic, high-energy workout to channel excess adrenaline.',
        creativeCareer: 'Initiate and launch a key project milestone you have been postponing.',
        creativeWealth: 'Create an aggressive yet sustainable debt-elimination or savings plan.'
    },
    { 
        type: 'Phase VI: Holographic Integration & Mastery', 
        part: 'Full Body Circuit & Field', 
        mudra: 'Cosmic Seal Mudra',
        mudraDesc: 'Rest hands open and upright upon your thighs in receiving posture.',
        yoga: 'Savasana Integration Rest',
        yogaDesc: 'Lie completely flat, releasing all muscular tension into the floor.',
        instruction: 'Integrate all energetic strata into a unified, coherent field of mastery.',
        psychLove: [
            '1. Embody complete wholeness, recognizing you are already entirely complete.',
            '2. Cultivate deep, unconditional appreciation for your unique life path.',
            '3. Share your realized wisdom generously with those seeking guidance.',
            '4. Maintain effortless harmony across all your personal and social circles.',
            '5. Rest secure in the profound interconnectedness of all living things.',
            '6. Know in your heart that you are enough exactly as you are right now.',
            '7. Look back at how far you have come and be so incredibly grateful.',
            '8. Share your softest, kindest advice with a friend who is struggling.',
            '9. Let go of the need to control others; just let love flow naturally.',
            '10. Feel connected to everyone around you in a quiet, peaceful way.'
        ],
        psychHealth: [
            '1. Honor your body as a sacred instrument of consciousness and expression.',
            '2. Maintain a balanced lifestyle encompassing movement, rest, and nutrition.',
            '3. Integrate lessons from past challenges into pillars of inner strength.',
            '4. Practice daily deep relaxation to keep your nervous system pristine.',
            '5. Express gratitude for your physical vessel and its incredible resilience.',
            '6. Treat your body with the respect and gentleness it deserves today.',
            '7. Balance your day: move a little, eat well, and rest deeply.',
            '8. Remember that every time you were sick or hurt, your body healed you.',
            '9. Lie down, close your eyes, and just let everything melt away.',
            '10. Say thank you to your legs, arms, and heart for carrying you.'
        ],
        psychCareer: [
            '1. Integrate all your diverse skills into a unique, irreplaceable mastery.',
            '2. Mentor others while continuing your own lifelong learning journey.',
            '3. Build sustainable, long-term systems that outlast daily fluctuations.',
            '4. Approach professional challenges with calm, centered mastery.',
            '5. Leave every project and team significantly better than you found them.',
            '6. Bring all the weird, unique things you know and use them in your work.',
            '7. Help someone newer than you learn the ropes with a smile.',
            '8. Do things right the first time so you don’t have to stress later.',
            '9. Face today’s hurdles with a deep breath and a calm attitude.',
            '10. Make sure your team smiles a little more because you were there.'
        ],
        psychWealth: [
            '1. Manage your financial ecosystem with holistic wisdom and stewardship.',
            '2. Align your wealth strategy with long-term generational security.',
            '3. Appreciate the freedom and peace that disciplined stewardship brings.',
            '4. Keep your financial life orderly, transparent, and effortlessly managed.',
            '5. Trust in the steady, compounding growth of your well-laid plans.',
            '6. Look at your whole life and realize true wealth is peace of mind.',
            '7. Save not just for you, but so your future family feels safe.',
            '8. Enjoy the quiet relief of knowing your bills are paid on time.',
            '9. Keep your finances so simple that they never cause you a headache.',
            '10. Trust that the seeds you plant today will grow into a beautiful tree.'
        ],
        creativeLove: 'Write a heartfelt letter of gratitude to your past, present, and future self.',
        creativeHealth: 'Spend an hour in deep restorative meditation or quiet nature immersion.',
        creativeCareer: 'Synthesize your life experience into a master guide, art piece, or system.',
        creativeWealth: 'Establish your ultimate long-term legacy and asset protection plan.'
    }
];

const canvas = document.getElementById('visualizer');
const ctx = canvas ? canvas.getContext('2d') : null;

if (canvas) {
    canvas.width = 1200;
    canvas.height = 1200;
}

const mudraCanvas = document.getElementById('mudraCanvas');
const mudraCtx = mudraCanvas ? mudraCanvas.getContext('2d') : null;
const yogaCanvas = document.getElementById('yogaCanvas');
const yogaCtx = yogaCanvas ? yogaCanvas.getContext('2d') : null;

const tooltip = document.getElementById('planetTooltip');
const modeSelect = document.getElementById('modeSelect');
const audioModeSelect = document.getElementById('audioMode');
const targetSelect = document.getElementById('targetSelect');
const tuningSelect = document.getElementById('tuningSelect');
const breathPatternSelect = document.getElementById('breathPatternSelect');
const droneTypeSelect = document.getElementById('droneTypeSelect');
const droneVolInput = document.getElementById('droneVol');
const toggleAudioBtn = document.getElementById('toggleAudio');
const breathStatus = document.getElementById('breathStatus');
const focusTypeEl = document.getElementById('focusType');
const somaticBodyPartEl = document.getElementById('somaticBodyPart');
const hudMudra = document.getElementById('hudMudra');
const hudYoga = document.getElementById('hudYoga');
const guideMudraName = document.getElementById('guideMudraName');
const guideMudraDesc = document.getElementById('guideMudraDesc');
const guideYogaName = document.getElementById('guideYogaName');
const guideYogaDesc = document.getElementById('guideYogaDesc');

const psychLove = document.getElementById('psychLove');
const psychHealth = document.getElementById('psychHealth');
const psychCareer = document.getElementById('psychCareer');
const psychWealth = document.getElementById('psychWealth');

const personalLove = document.getElementById('personalLove');
const personalHealth = document.getElementById('personalHealth');
const personalCareer = document.getElementById('personalCareer');
const personalWealth = document.getElementById('personalWealth');

const creativeLove = document.getElementById('creativeLove');
const creativeHealth = document.getElementById('creativeHealth');
const creativeCareer = document.getElementById('creativeCareer');
const creativeWealth = document.getElementById('creativeWealth');

const defenseBox = document.getElementById('defenseBox');
const defenseText = document.getElementById('defenseText');
const cycleTimerEl = document.getElementById('cycleTimer');
const recBanner = document.getElementById('recBanner');
const natalForm = document.getElementById('natalForm');
const natalDateTime = document.getElementById('natalDateTime');
const clearOverlayBtn = document.getElementById('clearOverlayBtn');

const textBlockContainers = [
    psychLove, psychHealth, psychCareer, psychWealth,
    personalLove, personalHealth, personalCareer, personalWealth
];

textBlockContainers.forEach(el => {
    if (el) {
        el.style.maxHeight = '180px';
        el.style.overflowY = 'auto';
        el.style.paddingRight = '6px';
    }
});

let soundModeSelect = document.getElementById('soundModeSelect');
if (!soundModeSelect && audioModeSelect && audioModeSelect.parentNode) {
    const container = document.createElement('div');
    container.style.display = 'inline-block';
    container.style.marginLeft = '10px';
    container.innerHTML = `
        <label for="soundModeSelect" style="font-size:12px; color:#94a3b8; display:block; margin-bottom:2px;">Audio Mode:</label>
        <select id="soundModeSelect" style="background:#0f172a; color:#f8fafc; border:1px solid #334155; padding:8px 12px; border-radius:6px; font-size:13px;">
            <option value="fusion">Harmonic Fusion (Sound + Chimes)</option>
            <option value="frequency">Pure Tone Only</option>
            <option value="instruments">Chimes Only</option>
        </select>
    `;
    audioModeSelect.parentNode.insertBefore(container, audioModeSelect.nextSibling);
    soundModeSelect = document.getElementById('soundModeSelect');
}

if (soundModeSelect) {
    soundModeSelect.addEventListener('change', (e) => {
        soundPlaybackMode = e.target.value;
        updateAudioRouting();
    });
}

let hoverNodes = [];
let zodiacSectors = [];
let natalNodes = [];

// New Structural Placement: Document-flow container below the chart
let legendDOM = document.getElementById('dom-legend');
let portalDOM = document.getElementById('dom-portal');
let overlaysContainer = document.getElementById('overlays-container');

function initOverlays() {
    if (!overlaysContainer && canvas && canvas.parentNode) {
        overlaysContainer = document.createElement('div');
        overlaysContainer.id = 'overlays-container';
        overlaysContainer.style.display = 'flex';
        overlaysContainer.style.flexDirection = 'row';
        overlaysContainer.style.justifyContent = 'space-between';
        overlaysContainer.style.gap = '24px';
        overlaysContainer.style.marginTop = '24px';
        overlaysContainer.style.marginBottom = '24px';
        overlaysContainer.style.width = '100%';
        overlaysContainer.style.maxWidth = canvas.style.width || '100%';
        
        // Insert right after the canvas in the document flow
        canvas.parentNode.insertBefore(overlaysContainer, canvas.nextSibling);
    }

    if (!legendDOM && overlaysContainer) {
        legendDOM = document.createElement('div');
        legendDOM.id = 'dom-legend';
        legendDOM.style.background = 'rgba(15, 23, 42, 0.9)';
        legendDOM.style.border = '2px solid #334155';
        legendDOM.style.borderRadius = '12px';
        legendDOM.style.padding = '16px';
        legendDOM.style.boxSizing = 'border-box';
        legendDOM.style.flex = '1';
        legendDOM.style.minHeight = '180px';
        overlaysContainer.appendChild(legendDOM);
    }
    
    if (!portalDOM && overlaysContainer) {
        portalDOM = document.createElement('div');
        portalDOM.id = 'dom-portal';
        portalDOM.style.background = 'rgba(15, 23, 42, 0.9)';
        portalDOM.style.border = '2px solid #fbbf24';
        portalDOM.style.borderRadius = '12px';
        portalDOM.style.padding = '16px';
        portalDOM.style.boxSizing = 'border-box';
        portalDOM.style.flex = '1';
        portalDOM.style.minHeight = '180px';
        overlaysContainer.appendChild(portalDOM);
    }
}

async function fetchCelestialData() {
    try {
        let url = '/api/celestial/positions';
        if (activeNatalDate) {
            url += `?natalDate=${encodeURIComponent(activeNatalDate)}`;
        }
        const res = await fetch(url);
        const json = await res.json();
        if (json.success) {
            celestialData = json.data;
            updateSelectorOptions();
        }
    } catch (err) {
        console.error('Failed to fetch celestial positions:', err);
    }
}

function renderBulletList(items) {
    if (!Array.isArray(items)) return items;
    let html = '<ul style="margin:0; padding-left:16px;">';
    items.forEach((item, index) => {
        if (index === 0) {
            html += `<div style="font-size:10px; color:#94a3b8; text-transform:uppercase; margin-top:4px; margin-bottom:4px; letter-spacing:1px; margin-left:-16px;">Structural Protocol</div>`;
        } else if (index === 5) {
            html += `<div style="font-size:10px; color:#f472b6; text-transform:uppercase; margin-top:12px; margin-bottom:4px; letter-spacing:1px; margin-left:-16px;">Emotional Integration (EQ)</div>`;
        }
        const color = index >= 5 ? '#fbcfe8' : '#cbd5e1'; 
        html += `<li style="margin-bottom:6px; line-height:1.4; color:${color}; font-size:13px;">${item}</li>`;
    });
    html += '</ul>';
    return html;
}

if (natalForm) {
    natalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (natalDateTime && natalDateTime.value) {
            activeNatalDate = new Date(natalDateTime.value).toISOString();
            fetchCelestialData();
        }
    });
}

if (clearOverlayBtn) {
    clearOverlayBtn.addEventListener('click', () => {
        activeNatalDate = null;
        if (natalDateTime) natalDateTime.value = '';
        celestialData.natal = null;
        celestialData.overlayAspects = [];
        selectedNatalKey = null;
        if (mode === 'overlay') mode = 'planet';
        if (modeSelect) modeSelect.value = mode;
        
        if (personalLove) personalLove.innerHTML = renderBulletList([
            '1. Input your birth details above to map your natal architecture.',
            '2. Examine how transiting planetary bodies activate your core angles.',
            '3. Review generational resonance patterns through the ancestral portal.',
            '4. Anchor your sovereign awareness in your natural elemental blueprint.',
            '5. Maintain calm, structured focus across all active timelines.',
            '6. Let the chart show you exactly how safe you truly are.',
            '7. Watch the planets move and know you are part of a bigger plan.',
            '8. Breathe easy knowing your ancestors have your back.',
            '9. Feel the calm energy of your own unique birth design.',
            '10. Trust that everything is lining up perfectly for your good.'
        ]);
        if (personalHealth) personalHealth.innerHTML = renderBulletList([
            '1. Synchronize physical routines with the 14-minute celestial breath cycle.',
            '2. Ground your nervous system through conscious diaphragmatic breathing.',
            '3. Release muscular tension in alignment with active transit aspects.',
            '4. Maintain pristine hydration to support neurological resonance.',
            '5. Honor your need for restorative rest and circadian balance.',
            '6. Move your body gently to the natural rhythm of the stars.',
            '7. Take a deep belly breath and feel your tension wash away.',
            '8. Let your shoulders drop right now and feel the relief.',
            '9. Drink some water to keep your body feeling fresh and clean.',
            '10. Give yourself full permission to sleep and rest deeply tonight.'
        ]);
        if (personalCareer) personalCareer.innerHTML = renderBulletList([
            '1. Approach professional milestones with deliberate, calm mastery.',
            '2. Align your output with high-leverage strategic priorities.',
            '3. Delegate auxiliary tasks to protect your core focus hours.',
            '4. Document workflows meticulously to reduce operational friction.',
            '5. Negotiate terms that fully respect your energetic investment.',
            '6. Take your time at work today; rushing only creates anxiety.',
            '7. Focus on the most important thing and let the little things slide.',
            '8. Ask for help if you feel like you are doing too much alone.',
            '9. Keep your workspace neat so your mind feels clear and calm.',
            '10. Know that your energy and time are deeply valuable.'
        ]);
        if (personalWealth) personalWealth.innerHTML = renderBulletList([
            '1. Reinforce financial stability through disciplined capital allocation.',
            '2. Automate asset accumulation to remove emotional friction.',
            '3. Eliminate speculative expenditures in favor of long-term compounding.',
            '4. Audit recurring overhead to maximize monthly liquidity buffers.',
            '5. View monetary stewardship as an act of sovereign self-mastery.',
            '6. Keep your money safe so your mind can feel totally relaxed.',
            '7. Let your savings grow quietly without stressing over every penny.',
            '8. Don’t buy into panic; long-term patience always wins out.',
            '9. Find joy in having a little cushion for emergencies.',
            '10. Be proud of the ways you take care of your future self.'
        ]);
        fetchCelestialData();
    });
}

function updateSelectorOptions() {
    if (!targetSelect) return;
    targetSelect.innerHTML = '';
    const transitPlanets = celestialData.transit || celestialData.planets || {};
    const transitAspects = celestialData.transitAspects || celestialData.aspects || [];

    if (mode === 'planet') {
        const planets = Object.keys(transitPlanets);
        planets.forEach(name => {
            const p = transitPlanets[name];
            const opt = document.createElement('option');
            opt.value = name;
            const rxTag = p.isRetrograde ? ' Rx' : '';
            const zTag = p.zodiac ? ` (${p.zodiac.formatted})` : '';
            opt.textContent = `${name}${rxTag}${zTag} - ${p.baseFrequency}Hz`;
            targetSelect.appendChild(opt);
        });
        if (!selectedTarget || !transitPlanets[selectedTarget]) {
            selectedTarget = planets[0] || 'Sun';
        }
    } else if (mode === 'aspect') {
        transitAspects.forEach(asp => {
            const opt = document.createElement('option');
            opt.value = asp.id;
            opt.textContent = `${asp.planet1} ${asp.aspect} ${asp.planet2} (${asp.orb}° orb)`;
            targetSelect.appendChild(opt);
        });
        if (transitAspects.length > 0 && (!selectedTarget || !transitAspects.find(a => a.id === selectedTarget))) {
            selectedTarget = transitAspects[0].id;
        }
    } else if (mode === 'overlay') {
        const overlayAspects = celestialData.overlayAspects || [];
        overlayAspects.forEach(asp => {
            const opt = document.createElement('option');
            opt.value = asp.id;
            opt.textContent = `Natal ${asp.planet1} ${asp.aspect} Transit ${asp.planet2} (${asp.orb}° orb)`;
            targetSelect.appendChild(opt);
        });
        if (overlayAspects.length > 0 && (!selectedTarget || !overlayAspects.find(a => a.id === selectedTarget))) {
            selectedTarget = overlayAspects[0].id;
        }
    }
    targetSelect.value = selectedTarget;
    updateRecommendationBanner();
    if (isPlaying) updateAudioFrequencies();
}

function updateRecommendationBanner() {
    if (!recBanner) return;
    const transitPlanets = celestialData.transit || celestialData.planets || {};
    if (mode === 'planet' && transitPlanets[selectedTarget]) {
        const p = transitPlanets[selectedTarget];
        const rec = p.recommendation || { state: 'Calm (10Hz)', defaultCarrier: 528 };
        const rxTag = p.isRetrograde ? ' [RETROGRADE]' : '';
        recBanner.textContent = `Active Sound Stream (${selectedTarget}${rxTag}): ${rec.state} | Tone: ${rec.defaultCarrier}Hz`;
    } else {
        recBanner.textContent = `Active Star Field Sync Ready (${mode.toUpperCase()} Mode)`;
    }
}

if (modeSelect) modeSelect.addEventListener('change', (e) => { mode = e.target.value; updateSelectorOptions(); });
if (audioModeSelect) audioModeSelect.addEventListener('change', (e) => { audioMode = e.target.value; if (isPlaying) updateAudioFrequencies(); });
if (targetSelect) targetSelect.addEventListener('change', (e) => { selectedTarget = e.target.value; updateRecommendationBanner(); if (isPlaying) updateAudioFrequencies(); });
if (tuningSelect) tuningSelect.addEventListener('change', (e) => { masterTuning = parseFloat(e.target.value); updateRecommendationBanner(); if (isPlaying) updateAudioFrequencies(); });
if (breathPatternSelect) breathPatternSelect.addEventListener('change', (e) => { breathPattern = e.target.value; });
if (droneTypeSelect) droneTypeSelect.addEventListener('change', (e) => {
    droneType = e.target.value;
    if (isPlaying) restartMelodyEngine();
});

if (droneVolInput) {
    droneVolInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100;
        if (audioCtx) {
            const masterVol = val * 0.25;
            updateAudioRouting(masterVol);
        }
    });
}

function getActiveBaseFrequency() {
    const tuningRatio = masterTuning / 432;
    const transitPlanets = celestialData.transit || celestialData.planets || {};
    if (mode === 'planet' && transitPlanets[selectedTarget]) {
        return (transitPlanets[selectedTarget].baseFrequency || 432) * tuningRatio;
    }
    const aspectList = mode === 'overlay' ? (celestialData.overlayAspects || []) : (celestialData.transitAspects || celestialData.aspects || []);
    const aspect = (aspectList || []).find(a => a.id === selectedTarget);
    if (aspect && transitPlanets[aspect.planet1] && transitPlanets[aspect.planet2]) {
        const f1 = transitPlanets[aspect.planet1].baseFrequency || 432;
        const f2 = transitPlanets[aspect.planet2].baseFrequency || 432;
        return ((f1 + f2) / 2) * tuningRatio;
    }
    return masterTuning;
}

function getAlignmentIntensity() {
    const aspectList = mode === 'overlay' ? (celestialData.overlayAspects || []) : (celestialData.transitAspects || celestialData.aspects || []);
    const aspect = (aspectList || []).find(a => a.id === selectedTarget);
    if (aspect && typeof aspect.orb === 'number') {
        return Math.max(0.35, 1.0 - (aspect.orb / 8.0));
    }
    return 0.8;
}

function playInstrumentNote(ctx, freq, duration = 3.5, instrumentType = 'pandrum', volume = 0.2) {
    if (!ctx || soundPlaybackMode === 'frequency') return;
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    const type = (instrumentType || 'pandrum').toLowerCase();

    let harmonics = [1, 2, 3, 4.2];
    let oscType = 'sine';
    let attackTime = 0.05;

    if (type.includes('tibetan')) {
        harmonics = [1, 2.76, 5.4];
        oscType = 'sine';
        attackTime = 0.3;
    } else {
        harmonics = [1, 2.02];
        oscType = 'sine';
        attackTime = 0.4;
    }

    const alignmentMultiplier = getAlignmentIntensity();
    const finalVol = volume * alignmentMultiplier;

    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(finalVol, now + attackTime);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, now);

    filter.connect(masterGain);
    if (instrumentGain) {
        masterGain.connect(instrumentGain);
    } else {
        masterGain.connect(ctx.destination);
    }

    harmonics.forEach((h, index) => {
        const osc = ctx.createOscillator();
        const harmGain = ctx.createGain();
        osc.type = oscType;
        const noteFreq = freq * h;
        osc.frequency.setValueAtTime(noteFreq, now);

        const harmonicWeight = Math.max(0.01, 1.0 / Math.pow(index + 1, 1.2));
        harmGain.gain.setValueAtTime(harmonicWeight, now);

        osc.connect(harmGain);
        harmGain.connect(filter);

        osc.start(now);
        osc.stop(now + duration + 0.1);
    });
}

function restartMelodyEngine() {
    if (melodySchedulerTimer) {
        clearInterval(melodySchedulerTimer);
        melodySchedulerTimer = null;
    }
    if (isPlaying && soundPlaybackMode !== 'frequency') {
        startMelodyScheduler();
    }
}

function startMelodyScheduler() {
    if (!audioCtx || soundPlaybackMode === 'frequency') return;
    if (melodySchedulerTimer) clearInterval(melodySchedulerTimer);

    melodyStartTime = audioCtx.currentTime;
    let lastScheduledIndex = 0;
    const LOOP_DURATION = 30.0;

    melodySchedulerTimer = setInterval(() => {
        if (!isPlaying || !audioCtx || soundPlaybackMode === 'frequency') return;

        const currentTime = audioCtx.currentTime;
        const elapsedInLoop = (currentTime - melodyStartTime) % LOOP_DURATION;
        const melodyNotes = INSTRUMENT_MELODIES[droneType] || INSTRUMENT_MELODIES.pandrum;

        melodyNotes.forEach((note, idx) => {
            const isNearTime = Math.abs(elapsedInLoop - note.time) < 0.2;
            if (isNearTime && (lastScheduledIndex !== idx || elapsedInLoop < 0.3)) {
                const baseFreq = getActiveBaseFrequency();
                let noteFreq = baseFreq * note.interval;

                while (noteFreq < 110) noteFreq *= 2;
                while (noteFreq > 1500) noteFreq /= 2;

                const baseVol = droneVolInput ? (parseFloat(droneVolInput.value) / 100) * 0.3 : 0.15;
                playInstrumentNote(audioCtx, noteFreq, note.dur, droneType, baseVol * note.vol);
                lastScheduledIndex = idx;
            }
        });
    }, 1500);
}

function playDeepBreathingBell() {
    if (!audioCtx || soundPlaybackMode === 'frequency') return;
    const baseFreq = getActiveBaseFrequency();
    playInstrumentNote(audioCtx, baseFreq * 0.75, 6.0, droneType, 0.35);
}

function updateAudioRouting(customVol) {
    if (!audioCtx) return;
    const val = customVol !== undefined ? customVol : (droneVolInput ? (parseFloat(droneVolInput.value) / 100) * 0.2 : 0.05);
    
    if (freqGain) {
        const freqVol = (soundPlaybackMode === 'fusion' || soundPlaybackMode === 'frequency') ? val * 0.8 : 0;
        freqGain.gain.setTargetAtTime(freqVol, audioCtx.currentTime, 0.05);
    }

    if (instrumentGain) {
        const instVol = (soundPlaybackMode === 'fusion' || soundPlaybackMode === 'instruments') ? val * 1.4 : 0;
        instrumentGain.gain.setTargetAtTime(instVol, audioCtx.currentTime, 0.05);
    }

    if (soundPlaybackMode === 'frequency') {
        if (melodySchedulerTimer) {
            clearInterval(melodySchedulerTimer);
            melodySchedulerTimer = null;
        }
    } else {
        if (isPlaying && !melodySchedulerTimer) {
            startMelodyScheduler();
        }
    }
}

function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const merger = audioCtx.createChannelMerger(2);
    oscLeft = audioCtx.createOscillator();
    oscRight = audioCtx.createOscillator();
    
    freqGain = audioCtx.createGain();
    instrumentGain = audioCtx.createGain();

    const val = droneVolInput ? (parseFloat(droneVolInput.value) / 100) * 0.2 : 0.05;
    updateAudioRouting(val);

    applyFrequencies();

    oscLeft.connect(merger, 0, 0);
    oscRight.connect(merger, 0, 1);
    merger.connect(freqGain);
    freqGain.connect(audioCtx.destination);
    instrumentGain.connect(audioCtx.destination);

    oscLeft.start();
    oscRight.start();
    isPlaying = true;

    if (soundPlaybackMode !== 'frequency') {
        startMelodyScheduler();
    }

    if (toggleAudioBtn) toggleAudioBtn.textContent = 'Mute Sound Stream';
}

function stopAudio() {
    if (melodySchedulerTimer) {
        clearInterval(melodySchedulerTimer);
        melodySchedulerTimer = null;
    }
    if (oscLeft && oscRight) {
        oscLeft.stop();
        oscLeft.disconnect();
        oscRight.stop();
        oscRight.disconnect();
    }
    if (freqGain) freqGain.disconnect();
    if (instrumentGain) instrumentGain.disconnect();

    isPlaying = false;
    if (toggleAudioBtn) toggleAudioBtn.textContent = 'Play Sound Stream';
}

function applyFrequencies() {
    if (!oscLeft || !oscRight) return;
    let leftFreq = 432;
    let rightFreq = 436;
    const tuningRatio = masterTuning / 432;
    const transitPlanets = celestialData.transit || celestialData.planets || {};
    const alignmentIntensity = getAlignmentIntensity();

    if (mode === 'planet') {
        const planet = transitPlanets[selectedTarget];
        if (planet) {
            const base = (planet.baseFrequency || 432) * tuningRatio;
            const offset = (planet.binauralOffset || 4) * alignmentIntensity;
            leftFreq = base - (offset / 2);
            rightFreq = base + (offset / 2);
        }
    } else {
        const aspectList = mode === 'overlay' ? (celestialData.overlayAspects || []) : (celestialData.transitAspects || celestialData.aspects || []);
        const aspect = (aspectList || []).find(a => a.id === selectedTarget);
        if (aspect && transitPlanets[aspect.planet1] && transitPlanets[aspect.planet2]) {
            leftFreq = transitPlanets[aspect.planet1].baseFrequency * tuningRatio;
            rightFreq = transitPlanets[aspect.planet2].baseFrequency * tuningRatio;
        }
    }

    oscLeft.frequency.setTargetAtTime(leftFreq, audioCtx.currentTime, 0.1);
    oscRight.frequency.setTargetAtTime(rightFreq, audioCtx.currentTime, 0.1);
}

function updateAudioFrequencies() {
    if (!isPlaying) return;
    applyFrequencies();
}

if (toggleAudioBtn) {
    toggleAudioBtn.addEventListener('click', () => {
        if (isPlaying) stopAudio();
        else initAudio();
    });
}

if (canvas) {
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        let found = null;
        for (let n of natalNodes) {
            const dist = Math.hypot(n.x - mx, n.y - my);
            if (dist <= 22) {
                found = { type: 'Your Birth Point / Angle', name: n.name, data: n.data, x: n.x / scaleX, y: n.y / scaleY };
                selectedNatalKey = n.name;
                break;
            }
        }

        if (!found) {
            for (let s of zodiacSectors) {
                const dist = Math.hypot(s.x - mx, s.y - my);
                if (dist <= 30) {
                    found = { type: 'Zodiac Sign', name: `${s.zodiac.name} (${s.zodiac.symbol})`, data: { baseFrequency: s.zodiac.element, isRetrograde: false, zodiac: { formatted: s.zodiac.element + ' Element' } }, x: s.x / scaleX, y: s.y / scaleY };
                    break;
                }
            }
        }

        if (!found) {
            for (let node of hoverNodes) {
                const dist = Math.hypot(node.x - mx, node.y - my);
                if (dist <= 20) {
                    found = { ...node, x: node.x / scaleX, y: node.y / scaleY };
                    break;
                }
            }
        }

        if (found && tooltip) {
            tooltip.style.display = 'block';
            tooltip.style.left = `${found.x + 15}px`;
            tooltip.style.top = `${found.y - 15}px`;
            const rxTag = found.data.isRetrograde ? ' <span style="color:#fb7185;">[Retrograde]</span>' : '';
            const zTag = found.data.zodiac ? found.data.zodiac.formatted : `${found.data.longitude}°`;
            tooltip.innerHTML = `<strong>${found.type}: ${found.name}</strong>${rxTag}<br>Position / Sign: ${zTag}<br>Frequency: ${found.data.baseFrequency || 432}Hz`;
        } else if (tooltip) {
            tooltip.style.display = 'none';
        }
    });

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        for (let n of natalNodes) {
            const dist = Math.hypot(n.x - mx, n.y - my);
            if (dist <= 22) {
                selectedNatalKey = n.name;
                if (defenseBox && defenseText) {
                    defenseText.innerHTML = `<strong>Ancestral Alignment Target: ${n.name}</strong><br>Position: ${n.data.zodiac ? n.data.zodiac.formatted : n.data.longitude + '°'}<br><em>Lineage Resonance Note:</em> This pivotal natal anchor point bridges your personal architectural baseline with current transiting aspects. You are supported by unbroken ancestral lines of strength, clarity, and sovereign resilience.`;
                    defenseBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                break;
            }
        }
    });

    canvas.addEventListener('mouseleave', () => {
        if (tooltip) tooltip.style.display = 'none';
    });
}

function getAlignmentAspectColor(aspectName, orb, pulseAlpha) {
    const intensity = Math.max(0.3, 1.0 - (orb / 6.0)) * pulseAlpha;
    switch (aspectName) {
        case 'Trine':
        case 'Sextile':
            return { stroke: `rgba(74, 222, 128, ${intensity.toFixed(2)})`, isAligned: true };
        case 'Conjunction':
            return { stroke: `rgba(248, 250, 252, ${intensity.toFixed(2)})`, isAligned: true };
        case 'Square':
        case 'Opposition':
            return { stroke: `rgba(244, 63, 94, ${intensity.toFixed(2)})`, isAligned: false };
        default:
            return { stroke: `rgba(148, 163, 184, ${intensity.toFixed(2)})`, isAligned: true };
    }
}

function drawMudraDiagram(profileIndex) {
    if (!mudraCanvas || !mudraCtx) return;
    mudraCtx.fillStyle = '#020617';
    mudraCtx.fillRect(0, 0, mudraCanvas.width, mudraCanvas.height);
    mudraCtx.strokeStyle = '#38bdf8';
    mudraCtx.lineWidth = 3;
    const cx = mudraCanvas.width / 2;
    const cy = mudraCanvas.height / 2;
    mudraCtx.beginPath();
    mudraCtx.arc(cx, cy, 25, 0, Math.PI * 2);
    mudraCtx.stroke();
}

function drawYogaDiagram(profileIndex) {
    if (!yogaCanvas || !yogaCtx) return;
    yogaCtx.fillStyle = '#020617';
    yogaCtx.fillRect(0, 0, yogaCanvas.width, yogaCanvas.height);
    yogaCtx.strokeStyle = '#4ade80';
    yogaCtx.lineWidth = 3;
    const cx = yogaCanvas.width / 2;
    const cy = yogaCanvas.height / 2;
    yogaCtx.beginPath();
    yogaCtx.arc(cx, cy, 25, 0, Math.PI * 2);
    yogaCtx.stroke();
}

function drawVisualizer() {
    if (!canvas || !ctx) return;
    initOverlays();
    
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    hoverNodes = [];
    zodiacSectors = [];
    natalNodes = [];

    const now = Date.now();
    const currentCycleMs = now % CYCLE_DURATION_MS;
    const cycleProgress = currentCycleMs / CYCLE_DURATION_MS; 
    const remainingMs = CYCLE_DURATION_MS - currentCycleMs;
    const remMins = Math.floor(remainingMs / 60000);
    const remSecs = Math.floor((remainingMs % 60000) / 1000);
    if (cycleTimerEl) cycleTimerEl.textContent = `${remMins}:${remSecs < 10 ? '0' : ''}${remSecs}`;

    const currentMinTotal = Math.floor(now / 60000);
    if (currentCycleMs < 1500 && lastCycleMinute !== currentMinTotal && (remainingMs >= CYCLE_DURATION_MS - 2000)) {
        lastCycleMinute = currentMinTotal;
        playDeepBreathingBell();
    }

    const profileIndex = Math.floor(now / CYCLE_DURATION_MS) % FOCUS_PROFILES.length;
    const activeProfile = FOCUS_PROFILES[profileIndex];
    if (focusTypeEl) focusTypeEl.textContent = activeProfile.type;
    if (somaticBodyPartEl) somaticBodyPartEl.textContent = activeProfile.part;
    if (hudMudra) hudMudra.textContent = activeProfile.mudra;
    if (hudYoga) hudYoga.textContent = activeProfile.yoga;
    if (guideMudraName) guideMudraName.textContent = activeProfile.mudra;
    if (guideMudraDesc) guideMudraDesc.textContent = activeProfile.mudraDesc;
    if (guideYogaName) guideYogaName.textContent = activeProfile.yoga;
    if (guideYogaDesc) guideYogaDesc.textContent = activeProfile.yogaDesc;

    if (psychLove) psychLove.innerHTML = renderBulletList(activeProfile.psychLove);
    if (psychHealth) psychHealth.innerHTML = renderBulletList(activeProfile.psychHealth);
    if (psychCareer) psychCareer.innerHTML = renderBulletList(activeProfile.psychCareer);
    if (psychWealth) psychWealth.innerHTML = renderBulletList(activeProfile.psychWealth);

    if (!celestialData.natal) {
        if (personalLove) personalLove.innerHTML = renderBulletList([
            '1. Input your birth details above to map your natal architecture.',
            '2. Examine how transiting planetary bodies activate your core angles.',
            '3. Review generational resonance patterns through the ancestral portal.',
            '4. Anchor your sovereign awareness in your natural elemental blueprint.',
            '5. Maintain calm, structured focus across all active timelines.',
            '6. Let the chart show you exactly how safe you truly are.',
            '7. Watch the planets move and know you are part of a bigger plan.',
            '8. Breathe easy knowing your ancestors have your back.',
            '9. Feel the calm energy of your own unique birth design.',
            '10. Trust that everything is lining up perfectly for your good.'
        ]);
        if (personalHealth) personalHealth.innerHTML = renderBulletList([
            '1. Synchronize physical routines with the 14-minute celestial breath cycle.',
            '2. Ground your nervous system through conscious diaphragmatic breathing.',
            '3. Release muscular tension in alignment with active transit aspects.',
            '4. Maintain pristine hydration to support neurological resonance.',
            '5. Honor your need for restorative rest and circadian balance.',
            '6. Move your body gently to the natural rhythm of the stars.',
            '7. Take a deep belly breath and feel your tension wash away.',
            '8. Let your shoulders drop right now and feel the relief.',
            '9. Drink some water to keep your body feeling fresh and clean.',
            '10. Give yourself full permission to sleep and rest deeply tonight.'
        ]);
        if (personalCareer) personalCareer.innerHTML = renderBulletList([
            '1. Approach professional milestones with deliberate, calm mastery.',
            '2. Align your output with high-leverage strategic priorities.',
            '3. Delegate auxiliary tasks to protect your core focus hours.',
            '4. Document workflows meticulously to reduce operational friction.',
            '5. Negotiate terms that fully respect your energetic investment.',
            '6. Take your time at work today; rushing only creates anxiety.',
            '7. Focus on the most important thing and let the little things slide.',
            '8. Ask for help if you feel like you are doing too much alone.',
            '9. Keep your workspace neat so your mind feels clear and calm.',
            '10. Know that your energy and time are deeply valuable.'
        ]);
        if (personalWealth) personalWealth.innerHTML = renderBulletList([
            '1. Reinforce financial stability through disciplined capital allocation.',
            '2. Automate asset accumulation to remove emotional friction.',
            '3. Eliminate speculative expenditures in favor of long-term compounding.',
            '4. Audit recurring overhead to maximize monthly liquidity buffers.',
            '5. View monetary stewardship as an act of sovereign self-mastery.',
            '6. Keep your money safe so your mind can feel totally relaxed.',
            '7. Let your savings grow quietly without stressing over every penny.',
            '8. Don’t buy into panic; long-term patience always wins out.',
            '9. Find joy in having a little cushion for emergencies.',
            '10. Be proud of the ways you take care of your future self.'
        ]);
    } else {
        if (personalLove) personalLove.innerHTML = renderBulletList([
            '1. Your natal blueprint acts as a sovereign anchor during heavy transits.',
            '2. The active house angles (ASC, MC, DSC, IC) align directly with current focus.',
            '3. Honor your generational lineage notes by maintaining calm awareness.',
            '4. Trust the structural integrity of your internal energetic architecture.',
            '5. Rest secure in the unbroken support of your ancestral heritage.',
            '6. Your family roots give you a strong, safe place to stand.',
            '7. You are deeply protected by the generations that came before you.',
            '8. Trust your gut feelings—they are your ancestors guiding you.',
            '9. Take a deep breath and know you belong exactly where you are.',
            '10. You carry a legacy of strength, and it is okay to lean on it.'
        ]);
        if (personalHealth) personalHealth.innerHTML = renderBulletList([
            '1. Coordinate physical pacing with the active 14-minute celestial breath cycle.',
            '2. Release muscular guarding across your shoulders and abdominal core.',
            '3. Prioritize deep regenerative rest to integrate transiting aspects.',
            '4. Maintain pristine hydration levels to keep cellular frequency clear.',
            '5. Ground your awareness through mindful, steady physical presence.',
            '6. Listen to your body today; it knows exactly what you need.',
            '7. Slow down and let yourself feel completely supported by gravity.',
            '8. Close your eyes and thank your body for working so hard.',
            '9. It is okay if your energy is low today—just rest.',
            '10. Feed yourself good, warm food to feel grounded and loved.'
        ]);
        if (personalCareer) personalCareer.innerHTML = renderBulletList([
            '1. Execute professional projects with calm, structured determination.',
            '2. Avoid rushing foundational planning under external time pressure.',
            '3. Secure your digital and physical workspaces against distraction.',
            '4. Document standard operating procedures to streamline workflows.',
            '5. Anchor your career trajectory in tangible, high-quality deliverables.',
            '6. Trust that your unique talents are exactly what your job needs.',
            '7. Don’t worry if you don’t have all the answers right now.',
            '8. Be gentle with yourself if a project is taking longer than expected.',
            '9. Find one small thing about your work today that makes you smile.',
            '10. Remember that your job does not define your total worth.'
        ]);
        if (personalWealth) personalWealth.innerHTML = renderBulletList([
            '1. Review your capital allocation strategy with calm financial discipline.',
            '2. Automate savings transfers to reinforce long-term stability buffers.',
            '3. Eliminate impulsive transactions driven by short-term market noise.',
            '4. Build robust emergency reserves to ensure absolute security.',
            '5. Treat financial stewardship as an essential pillar of sovereign power.',
            '6. Look at your savings as a gift you are giving to your future self.',
            '7. You don’t need to be perfect with money to be totally okay.',
            '8. Take a deep breath and know your needs will always be met.',
            '9. Celebrate the smart, simple choices you made this week.',
            '10. Allow yourself to feel proud of the foundation you are building.'
        ]);
    }

    if (creativeLove) creativeLove.textContent = activeProfile.creativeLove;
    if (creativeHealth) creativeHealth.textContent = activeProfile.creativeHealth;
    if (creativeCareer) creativeCareer.textContent = activeProfile.creativeCareer;
    if (creativeWealth) creativeWealth.textContent = activeProfile.creativeWealth;

    drawMudraDiagram(profileIndex);
    drawYogaDiagram(profileIndex);

    const epochSec = now / 1000;
    let totalCycle = 8;
    let bProgress = 0;
    let bState = 'Breathe In';

    if (breathPattern === 'balanced') {
        const t = epochSec % totalCycle;
        if (t < 4) { bState = 'Breathe In'; bProgress = t / 4; }
        else { bState = 'Breathe Out'; bProgress = 1 - ((t - 4) / 4); }
    } else {
        const t = epochSec % totalCycle;
        if (t < 4) { bState = 'Breathe In'; bProgress = t / 4; }
        else { bState = 'Breathe Out'; bProgress = 1 - ((t - 4) / 4); }
    }

    if (breathStatus) breathStatus.textContent = `${bState} (${Math.round(bProgress * 100)}%) - ${activeProfile.instruction}`;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Sonar Radar Rings
    const maxSonarRadius = 140;
    for (let r = 1; r <= 3; r++) {
        const ringProgress = (cycleProgress + (r * 0.33)) % 1.0;
        const ringRadius = ringProgress * maxSonarRadius;
        const ringAlpha = (1.0 - ringProgress) * 0.75;
        
        ctx.strokeStyle = `rgba(234, 179, 8, ${ringAlpha.toFixed(2)})`;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Center Epicenter Zodiac Glyph
    const activeZodiacIndex = Math.floor(cycleProgress * 12) % 12;
    const activeZod = ZODIAC_DATA[activeZodiacIndex];
    const inverseBreathProgress = 1.0 - bProgress; 
    const centerGlyphScale = 1.0 + (inverseBreathProgress * 0.18);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(centerGlyphScale, centerGlyphScale);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(activeZod.symbol, 0, -8);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px system-ui';
    ctx.fillText(activeZod.name, 0, 24);
    ctx.restore();

    const rPlanetaryHours = 160;
    const rMiddleTimeWheel = 210;
    const rZodiacHours = 260;
    const rTransitPlanets = 320;
    const zodiacInnerR = 370;
    const zodiacOuterR = 420;
    const r360DegreeRing = 445; 
    const rAsteroidBelt = 475;
    const rFixedStars = 515;
    const rConstellations = 555;

    // Time Wheel
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, rMiddleTimeWheel, 0, Math.PI * 2);
    ctx.stroke();

    for (let h = 0; h < 24; h++) {
        const hAngle = (h * 15 * Math.PI) / 180;
        const hx1 = centerX + Math.cos(hAngle) * (rMiddleTimeWheel - 6);
        const hy1 = centerY + Math.sin(hAngle) * (rMiddleTimeWheel - 6);
        const hx2 = centerX + Math.cos(hAngle) * (rMiddleTimeWheel + 6);
        const hy2 = centerY + Math.sin(hAngle) * (rMiddleTimeWheel + 6);

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = h % 6 === 0 ? 2.0 : 1.0;
        ctx.beginPath();
        ctx.moveTo(hx1, hy1);
        ctx.lineTo(hx2, hy2);
        ctx.stroke();

        if (h % 2 === 0) {
            const txtAngle = hAngle;
            const tx = centerX + Math.cos(txtAngle) * (rMiddleTimeWheel - 18);
            const ty = centerY + Math.sin(txtAngle) * (rMiddleTimeWheel - 18);
            ctx.fillStyle = '#38bdf8';
            ctx.font = '10px system-ui';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${h}h`, tx, ty);
        }
    }

    // Outer 360 Degree Ring
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(centerX, centerY, r360DegreeRing, 0, Math.PI * 2);
    ctx.stroke();

    for (let deg = 0; deg < 360; deg += 5) {
        const dAngle = (deg * Math.PI) / 180;
        const isMajor = deg % 30 === 0;
        const isMedium = deg % 10 === 0;
        const tickLen = isMajor ? 12 : (isMedium ? 8 : 4);
        
        const dx1 = centerX + Math.cos(dAngle) * r360DegreeRing;
        const dy1 = centerY + Math.sin(dAngle) * r360DegreeRing;
        const dx2 = centerX + Math.cos(dAngle) * (r360DegreeRing + tickLen);
        const dy2 = centerY + Math.sin(dAngle) * (r360DegreeRing + tickLen);

        ctx.strokeStyle = isMajor ? '#fbbf24' : 'rgba(148, 163, 184, 0.6)';
        ctx.lineWidth = isMajor ? 2.0 : 1.0;
        ctx.beginPath();
        ctx.moveTo(dx1, dy1);
        ctx.lineTo(dx2, dy2);
        ctx.stroke();

        if (isMajor) {
            const dtx = centerX + Math.cos(dAngle) * (r360DegreeRing + 24);
            const dty = centerY + Math.sin(dAngle) * (r360DegreeRing + 24);
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 11px system-ui';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${deg}°`, dtx, dty);
        }
    }

    const diurnalRotationOffset = cycleProgress * Math.PI * 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(diurnalRotationOffset);
    ctx.translate(-centerX, -centerY);

    for (let h = 0; h < 12; h++) {
        const hAngle = (h * 30 * Math.PI) / 180;
        const hx1 = centerX + Math.cos(hAngle) * rPlanetaryHours;
        const hy1 = centerY + Math.sin(hAngle) * rPlanetaryHours;
        const hx2 = centerX + Math.cos(hAngle) * zodiacInnerR;
        const hy2 = centerY + Math.sin(hAngle) * zodiacInnerR;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(hx1, hy1);
        ctx.lineTo(hx2, hy2);
        ctx.stroke();
    }

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(centerX, centerY, zodiacOuterR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, zodiacInnerR, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 12; i++) {
        const angleRad = (i * 30 * Math.PI) / 180;
        const x1 = centerX + Math.cos(angleRad) * zodiacInnerR;
        const y1 = centerY + Math.sin(angleRad) * zodiacInnerR;
        const x2 = centerX + Math.cos(angleRad) * zodiacOuterR;
        const y2 = centerY + Math.sin(angleRad) * zodiacOuterR;
        
        ctx.strokeStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        const midAngleRad = ((i * 30 + 15) * Math.PI) / 180;
        const symX = centerX + Math.cos(midAngleRad) * (zodiacInnerR + 25);
        const symY = centerY + Math.sin(midAngleRad) * (zodiacInnerR + 25);

        zodiacSectors.push({ index: i, x: symX, y: symY, zodiac: ZODIAC_DATA[i] });

        const isSelectedSign = selectedSignIndex === i;
        ctx.save();
        ctx.translate(symX, symY);
        ctx.rotate(-diurnalRotationOffset); 
        ctx.fillStyle = isSelectedSign ? '#38bdf8' : '#cbd5e1';
        ctx.font = isSelectedSign ? 'bold 22px system-ui' : '18px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ZODIAC_DATA[i].symbol, 0, 0);
        ctx.restore();
    }
    ctx.restore();

    // Asteroid Belt Layer
    const asteroidRotation = -epochSec * 0.008;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(asteroidRotation);
    ctx.translate(-centerX, -centerY);

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(centerX, centerY, rAsteroidBelt, 0, Math.PI * 2);
    ctx.stroke();

    for (let p = 0; p < 45; p++) {
        const pAngle = (p * (360 / 45) * Math.PI) / 180;
        const px = centerX + Math.cos(pAngle) * (rAsteroidBelt + ((p % 3) - 1) * 3);
        const py = centerY + Math.sin(pAngle) * (rAsteroidBelt + ((p % 3) - 1) * 3);
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    const transitPlanets = celestialData.transit || celestialData.planets || {};
    const natalPlanets = celestialData.natal || {};
    const transitCoords = {};
    const natalCoords = {};

    const transitPlanetKeys = Object.keys(transitPlanets);
    transitPlanetKeys.forEach((name, i) => {
        const planet = transitPlanets[name];
        const dailySpeed = planet.dailySpeed || (0.5 + (i * 0.2));
        const direction = planet.isRetrograde ? -1 : 1;
        const liveLongitude = (planet.longitude + (epochSec * 0.001 * dailySpeed * direction)) % 360;
        planet.liveLongitude = liveLongitude >= 0 ? liveLongitude : liveLongitude + 360;

        const angle = (planet.liveLongitude * Math.PI) / 180;
        const radius = rTransitPlanets + ((i % 3) * 15);
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        transitCoords[name] = { x, y, name, data: planet, type: 'Planet' };
        hoverNodes.push({ x, y, name, data: planet, type: 'Planet' });
    });

    ASTEROID_DATA.forEach((ast, i) => {
        const liveLongitude = (ast.longitude + (epochSec * 0.0008 * (ast.isRetrograde ? -1 : 1))) % 360;
        ast.liveLongitude = liveLongitude >= 0 ? liveLongitude : liveLongitude + 360;
        const angle = (ast.liveLongitude * Math.PI) / 180;
        const x = centerX + Math.cos(angle) * rAsteroidBelt;
        const y = centerY + Math.sin(angle) * rAsteroidBelt;
        transitCoords[ast.name] = { x, y, name: ast.name, data: ast, type: 'Asteroid' };
        hoverNodes.push({ x, y, name: ast.name, data: ast, type: 'Asteroid' });
    });

    if (celestialData.natal) {
        Object.keys(natalPlanets).forEach((name, i) => {
            const planet = natalPlanets[name];
            const angle = (planet.longitude * Math.PI) / 180;
            const radius = rZodiacHours + 15 + ((i % 3) * 14);
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            natalCoords[name] = { x, y };
            natalNodes.push({ x, y, name: `Your ${name}`, data: planet });
            hoverNodes.push({ x, y, name: `Your ${name}`, data: planet, type: 'Natal Placement' });
        });

        const baseNatalLong = natalPlanets['Sun'] ? natalPlanets['Sun'].longitude : 0;
        const angles = [
            { name: 'ASC (Ascendant)', longitude: baseNatalLong, radius: zodiacInnerR - 25, color: '#38bdf8' },
            { name: 'DSC (Descendant)', longitude: (baseNatalLong + 180) % 360, radius: zodiacInnerR - 25, color: '#38bdf8' },
            { name: 'MC (Medium Coeli)', longitude: (baseNatalLong + 270) % 360, radius: zodiacInnerR - 25, color: '#fbbf24' },
            { name: 'IC (Imum Coeli)', longitude: (baseNatalLong + 90) % 360, radius: zodiacInnerR - 25, color: '#fbbf24' }
        ];

        angles.forEach(ang => {
            const rad = (ang.longitude * Math.PI) / 180;
            const ax = centerX + Math.cos(rad) * ang.radius;
            const ay = centerY + Math.sin(rad) * ang.radius;
            natalCoords[ang.name] = { x: ax, y: ay };
            natalNodes.push({ x: ax, y: ay, name: ang.name, data: { longitude: ang.longitude, baseFrequency: 528, zodiac: { formatted: `${ang.longitude.toFixed(1)}°` }, isRetrograde: false } });
            hoverNodes.push({ x: ax, y: ay, name: ang.name, data: { longitude: ang.longitude, baseFrequency: 528, zodiac: { formatted: `${ang.longitude.toFixed(1)}°` }, isRetrograde: false }, type: 'Natal Angle' });
        });
    }

    const stellarRotation = epochSec * 0.0015;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(stellarRotation);
    ctx.translate(-centerX, -centerY);

    FIXED_STARS.forEach(star => {
        const angleRad = (star.longitude * Math.PI) / 180;
        const sx = centerX + Math.cos(angleRad) * rFixedStars;
        const sy = centerY + Math.sin(angleRad) * rFixedStars;
        
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
        ctx.fill();

        hoverNodes.push({ x: sx, y: sy, name: star.name, data: { longitude: star.longitude, baseFrequency: star.freq, zodiac: { formatted: star.nature }, isRetrograde: false }, type: 'Star' });

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(-stellarRotation);
        ctx.fillStyle = '#fde68a';
        ctx.font = '12px system-ui';
        ctx.fillText(star.name, 10, 4);
        ctx.restore();
    });

    CONSTELLATIONS.forEach(con => {
        const angleRad = (con.longitude * Math.PI) / 180;
        const cxpos = centerX + Math.cos(angleRad) * rConstellations;
        const cypos = centerY + Math.sin(angleRad) * rConstellations;

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(cxpos, cypos, 3.5, 0, Math.PI * 2);
        ctx.fill();

        hoverNodes.push({ x: cxpos, y: cypos, name: con.name, data: { longitude: con.longitude, baseFrequency: 432, zodiac: { formatted: con.type }, isRetrograde: false }, type: 'Star Group' });

        ctx.save();
        ctx.translate(cxpos, cypos);
        ctx.rotate(-stellarRotation);
        ctx.fillStyle = '#7dd3fc';
        ctx.font = '11px system-ui';
        ctx.fillText(con.name, 8, 4);
        ctx.restore();
    });
    ctx.restore();

    const pulseAlpha = 0.5 + (Math.sin(epochSec * 2.5) * 0.35);
    const aspectList = mode === 'overlay' ? (celestialData.overlayAspects || []) : (celestialData.transitAspects || celestialData.aspects || []);
    
    aspectList.forEach(asp => {
        const p1 = mode === 'overlay' ? natalCoords[asp.planet1] : (transitCoords[asp.planet1] || natalCoords[asp.planet1]);
        const p2 = transitCoords[asp.planet2];
        if (p1 && p2) {
            const isSelected = selectedTarget === asp.id;
            const alignmentInfo = getAlignmentAspectColor(asp.aspect, asp.orb, pulseAlpha);
            
            ctx.strokeStyle = alignmentInfo.stroke;
            ctx.lineWidth = isSelected ? 4.5 : Math.max(1.5, 3.0 - (asp.orb / 3.0));
            
            if (!alignmentInfo.isAligned) {
                ctx.setLineDash([6, 3]);
            } else {
                ctx.setLineDash([]);
            }

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    });

    if (celestialData.natal) {
        Object.keys(natalPlanets).forEach(name => {
            const coord = natalCoords[name];
            if (!coord) return;
            const isSelectedNatal = selectedNatalKey === `Your ${name}`;

            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(coord.x, coord.y, isSelectedNatal ? 8 : 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fde68a';
            ctx.font = 'bold 12px system-ui';
            ctx.fillText(`Your ${name}`, coord.x + 12, coord.y + 4);
        });

        ['ASC (Ascendant)', 'DSC (Descendant)', 'MC (Medium Coeli)', 'IC (Imum Coeli)'].forEach(angName => {
            const coord = natalCoords[angName];
            if (!coord) return;
            const isSelectedAng = selectedNatalKey === angName;
            const isMCIC = angName.includes('MC') || angName.includes('IC');

            ctx.fillStyle = isMCIC ? '#fbbf24' : '#38bdf8';
            ctx.beginPath();
            ctx.arc(coord.x, coord.y, isSelectedAng ? 9 : 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = isMCIC ? '#fde68a' : '#7dd3fc';
            ctx.font = 'bold 11px system-ui';
            ctx.fillText(angName.split(' ')[0], coord.x + 12, coord.y + 4);
        });
    }

    const allRenderNodes = Object.values(transitCoords).sort((a, b) => {
        const distA = Math.hypot(a.x - centerX, a.y - centerY);
        const distB = Math.hypot(b.x - centerX, b.y - centerY);
        return distA - distB;
    });

    const labelOccupiedSlots = [];

    allRenderNodes.forEach(node => {
        const isSelectedPlanet = mode === 'planet' && selectedTarget === node.name;
        const planet = node.data;

        if (planet.isRetrograde) {
            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = '#fb7185';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(node.x, node.y, isSelectedPlanet ? 12 : 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.fillStyle = isSelectedPlanet ? '#818cf8' : (planet.isRetrograde ? '#fb7185' : '#64748b');
        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelectedPlanet ? 10 : 7, 0, Math.PI * 2);
        ctx.fill();

        let labelX = node.x + 14;
        let labelY = node.y + 5;
        
        for (let slot of labelOccupiedSlots) {
            if (Math.abs(labelY - slot.y) < 16 && Math.abs(labelX - slot.x) < 80) {
                labelY = slot.y + 18;
            }
        }
        labelOccupiedSlots.push({ x: labelX, y: labelY });

        if (Math.abs(labelY - (node.y + 5)) > 4) {
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(labelX - 4, labelY - 3);
            ctx.stroke();
        }

        ctx.fillStyle = isSelectedPlanet ? '#c7d2fe' : '#94a3b8';
        ctx.font = isSelectedPlanet ? 'bold 14px system-ui' : '12px system-ui';
        ctx.fillText(node.name, labelX, labelY);
    });

    // Update HTML Overlays dynamically in the document flow
    if (legendDOM) {
        legendDOM.innerHTML = `
            <div style="color: #f8fafc; font-weight: bold; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid #334155; padding-bottom: 6px;">CELESTIAL MAP LEGEND</div>
            <div style="overflow-y:auto; height: 130px; padding-right: 4px;">
                <ul style="list-style:none; padding:0; margin:0; font-size:12px; color:#cbd5e1; line-height:1.8;">
                    <li><span style="display:inline-block; width:20px; border-top:2px solid #4ade80; vertical-align:middle; margin-right:8px;"></span>Harmonic Alignment (Trine / Sextile)</li>
                    <li><span style="display:inline-block; width:20px; border-top:2px solid #f8fafc; vertical-align:middle; margin-right:8px;"></span>Direct Conjunction (Strong Sync)</li>
                    <li><span style="display:inline-block; width:20px; border-top:2px dashed #f43f5e; vertical-align:middle; margin-right:8px;"></span>Friction / Growth Aspect (Square / Opp)</li>
                    <li><span style="display:inline-block; width:10px; height:10px; border:2px solid #fb7185; border-radius:50%; vertical-align:middle; margin-right:12px; margin-left:4px;"></span>Retrograde Transit [Internalized]</li>
                    <li><span style="display:inline-block; width:10px; height:10px; background:#fbbf24; border-radius:50%; vertical-align:middle; margin-right:12px; margin-left:4px;"></span>Natal Points, MC/IC & Stars</li>
                </ul>
            </div>
        `;
    }

    if (portalDOM) {
        portalDOM.innerHTML = `
            <div style="color: #fde68a; font-weight: bold; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid #fbbf24; padding-bottom: 6px;">ANCESTRAL & LINEAGE PORTAL</div>
            <div style="font-size:12px; color:#cbd5e1; overflow-y:auto; height: 130px; padding-right:4px;">
                ${selectedNatalKey ? `
                    <div style="margin-bottom:6px;"><strong style="color:#f8fafc;">Target: ${selectedNatalKey}</strong></div>
                    <ul style="padding-left:16px; margin:0; line-height:1.6; font-size: 11px;">
                        <li style="color:#94a3b8; font-weight:bold; margin-bottom:4px; list-style-type:none; margin-left:-16px; text-transform:uppercase; font-size:9px; letter-spacing:1px;">Structural Protocol</li>
                        <li>Your natal anchor interfaces directly with current transits.</li>
                        <li>Generational resilience flows through this precise frequency.</li>
                        <li>Maintain unshakeable sovereignty and calm focus.</li>
                        <li style="color:#f472b6; font-weight:bold; margin-top:8px; margin-bottom:4px; list-style-type:none; margin-left:-16px; text-transform:uppercase; font-size:9px; letter-spacing:1px;">Emotional Integration (EQ)</li>
                        <li style="color:#fbcfe8;">You are safe, supported, and grounded by your family line.</li>
                        <li style="color:#fbcfe8;">Trust the deep feelings rising up—they are ancient wisdom.</li>
                    </ul>
                ` : `
                    <div style="color:#94a3b8; margin-top: 8px; line-height: 1.6;">
                        Click any natal point, ASC, DSC, MC, or IC on the chart to inspect lineage resonance notes!<br><br>
                        All systems secure, synchronized, and active.
                    </div>
                `}
            </div>
        `;
    }

    requestAnimationFrame(drawVisualizer);
}

fetchCelestialData();
setInterval(fetchCelestialData, 15000);
drawVisualizer();

// --- Performance Optimization: DOM Update Caching ---
let lastLegendHTML = '';
let lastPortalHTML = '';

function updateDOMIfChanged(element, newHTML, cacheKey) {
  if (cacheKey === 'legend' && newHTML !== lastLegendHTML) {
    element.innerHTML = newHTML;
    lastLegendHTML = newHTML;
  } else if (cacheKey === 'portal' && newHTML !== lastPortalHTML) {
    element.innerHTML = newHTML;
    lastPortalHTML = newHTML;
  }
}

// --- Performance Optimization: Offscreen Canvas Caching ---
let staticOffscreenCanvas = null;
let staticOffscreenCtx = null;
let isStaticLayerDirty = true;

function initOffscreenCanvas(width = 1200, height = 1200) {
  if (!staticOffscreenCanvas) {
    staticOffscreenCanvas = document.createElement('canvas');
    staticOffscreenCanvas.width = width;
    staticOffscreenCanvas.height = height;
    staticOffscreenCtx = staticOffscreenCanvas.getContext('2d');
  }
}

function renderStaticZodiacBackground(center, radius) {
  if (!staticOffscreenCtx) return;
  const ctx = staticOffscreenCtx;
  ctx.clearRect(0, 0, staticOffscreenCanvas.width, staticOffscreenCanvas.height);

  // Background Ring Base
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;

  // Render 360 Ticks
  for (let i = 0; i < 360; i++) {
    const angle = (i * Math.PI) / 180;
    const isMajor = i % 30 === 0;
    const isMid = i % 10 === 0;
    const innerR = radius - (isMajor ? 18 : isMid ? 12 : 6);

    const x1 = center.x + radius * Math.cos(angle);
    const y1 = center.y + radius * Math.sin(angle);
    const x2 = center.x + innerR * Math.cos(angle);
    const y2 = center.y + innerR * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = isMajor ? 'rgba(212, 175, 55, 0.6)' : isMid ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();
  }
  ctx.restore();
  isStaticLayerDirty = false;
}

function drawCachedStaticBackground(mainCtx, center, radius) {
  if (!staticOffscreenCanvas) {
    initOffscreenCanvas(mainCtx.canvas.width, mainCtx.canvas.height);
  }
  if (isStaticLayerDirty) {
    renderStaticZodiacBackground(center, radius);
  }
  mainCtx.drawImage(staticOffscreenCanvas, 0, 0);
}

// --- Audio Engine Enhancement: Aspect Interval Synthesis ---
const ASPECT_RATIOS = {
  conjunction: 1.0,     // 0°   Unison
  sextile: 1.25,        // 60°  Major 3rd (5:4)
  square: 1.20,         // 90°  Minor 3rd / Tritone Tension (6:5)
  trine: 1.50,          // 120° Perfect 5th (3:2)
  opposition: 2.00      // 180° Octave / Polarity (2:1)
};

function calculateAspectFrequency(baseFreq, angularDistanceDegrees, orbTolerance = 6) {
  const normAngle = Math.abs(angularDistanceDegrees) % 360;
  
  // Check within orb limits
  if (Math.abs(normAngle - 0) <= orbTolerance || Math.abs(normAngle - 360) <= orbTolerance) {
    return baseFreq * ASPECT_RATIOS.conjunction;
  }
  if (Math.abs(normAngle - 60) <= orbTolerance) {
    return baseFreq * ASPECT_RATIOS.sextile;
  }
  if (Math.abs(normAngle - 90) <= orbTolerance) {
    return baseFreq * ASPECT_RATIOS.square;
  }
  if (Math.abs(normAngle - 120) <= orbTolerance) {
    return baseFreq * ASPECT_RATIOS.trine;
  }
  if (Math.abs(normAngle - 180) <= orbTolerance) {
    return baseFreq * ASPECT_RATIOS.opposition;
  }

  // Default fallback if no major aspect is active
  return baseFreq;
}

// --- Audio Engine Enhancement: Anti-Click Smooth Parameter Ramping ---
function smoothSetGain(gainNode, targetGain, audioCtx, duration = 0.05) {
  if (!gainNode || !audioCtx) return;
  const now = audioCtx.currentTime;
  gainNode.gain.cancelScheduledValues(now);
  
  // Guard against <= 0 for exponential ramping
  const safeCurrent = Math.max(gainNode.gain.value, 0.0001);
  gainNode.gain.setValueAtTime(safeCurrent, now);
  
  if (targetGain <= 0.0001) {
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    gainNode.gain.setValueAtTime(0, now + duration + 0.001);
  } else {
    gainNode.gain.exponentialRampToValueAtTime(targetGain, now + duration);
  }
}

function smoothSetFrequency(oscNode, targetFreq, audioCtx, duration = 0.08) {
  if (!oscNode || !audioCtx || targetFreq <= 0) return;
  const now = audioCtx.currentTime;
  oscNode.frequency.cancelScheduledValues(now);
  oscNode.frequency.setValueAtTime(Math.max(oscNode.frequency.value, 1), now);
  oscNode.frequency.exponentialRampToValueAtTime(targetFreq, now + duration);
}

// --- UX Enhancement: Interactive Transit Timeline Scrubber Engine ---
let timelineOffsetDays = 0;

function setTimelineOffsetDays(days) {
  timelineOffsetDays = parseFloat(days) || 0;
  if (typeof isStaticLayerDirty !== 'undefined') {
    isStaticLayerDirty = true;
  }
}

function getTimelineAdjustedTimestamp() {
  const msOffset = timelineOffsetDays * 24 * 60 * 60 * 1000;
  return Date.now() + msOffset;
}

function getTimelineAdjustedEphemerisTime() {
  return getTimelineAdjustedTimestamp() / 1000; // Returns Unix epoch seconds
}

// --- UX Enhancement: LocalStorage Persistence for Natal Configuration ---
const STORAGE_KEY_NATAL = 'ephemeris_freq_natal_config';

function saveNatalConfig(natalData) {
  try {
    localStorage.setItem(STORAGE_KEY_NATAL, JSON.stringify(natalData));
  } catch (err) {
    console.warn('Could not save natal config to localStorage:', err);
  }
}

function loadNatalConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_NATAL);
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.warn('Could not load natal config from localStorage:', err);
    return null;
  }
}

function clearNatalConfig() {
  try {
    localStorage.removeItem(STORAGE_KEY_NATAL);
  } catch (err) {
    console.warn('Could not clear natal config from localStorage:', err);
  }
}

// --- Step 1: Active DOM Guard Hook ---
window.safeUpdateHTML = function(element, newHTML) {
  if (!element) return;
  if (element.dataset.renderedHtml !== newHTML) {
    element.innerHTML = newHTML;
    element.dataset.renderedHtml = newHTML;
  }
};

// --- Step 2: Global Safe Render Override ---
window.updateUI = function(legendElement, legendHTML, portalElement, portalHTML) {
  if (legendElement && legendHTML) {
    window.safeUpdateHTML(legendElement, legendHTML);
  }
  if (portalElement && portalHTML) {
    window.safeUpdateHTML(portalElement, portalHTML);
  }
};

// --- Step 3: Automatic DOM Interceptor Guard ---
(function() {
  function applyDOMGuard(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    let cachedHTML = '';
    const originalSet = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set;
    
    Object.defineProperty(el, 'innerHTML', {
      set: function(newHTML) {
        if (newHTML !== cachedHTML) {
          cachedHTML = newHTML;
          originalSet.call(this, newHTML);
        }
      },
      get: function() {
        return cachedHTML;
      }
    });
  }

  const initGuards = () => {
    applyDOMGuard('legend');
    applyDOMGuard('portal');
    applyDOMGuard('ancestral-portal');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGuards);
  } else {
    initGuards();
  }
})();

// --- Step 4: Canvas Background Optimization Hook ---
window.attachCanvasOptimization = function(mainCanvas, mainCtx, center, radius) {
  if (!mainCanvas || !mainCtx) return;
  if (typeof drawCachedStaticBackground === 'function') {
    const c = center || { x: mainCanvas.width / 2, y: mainCanvas.height / 2 };
    const r = radius || (mainCanvas.width * 0.416);
    drawCachedStaticBackground(mainCtx, c, r);
  }
};
