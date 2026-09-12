// ============================================================================
// OUTPOST OMEGA: REFERENCE-MATCHED 3D BOSS ENGINE (60+ FPS GUARANTEED)
// ============================================================================

// Core Three.js Variables
let scene, camera, renderer;
let turretBase, turretPivot, leftBarrelGroup, rightBarrelGroup;
let leftMuzzlePoint, rightMuzzlePoint;
let leftBarrelMesh, rightBarrelMesh;
let sunLight;
let ambientLight;
let searchlights = [];
let ambientParticles = [];

// Recoil, Casings & Steam
let leftBarrelRecoil = 0;
let rightBarrelRecoil = 0;
let nextBarrel = 'left';
let shellCasings = [];
let steamParticles = [];

// Turret Heat & Overheat Cooldown
let turretHeat = 0;
let isTurretJammed = false;
let jamCooldownTimer = 0;
const HEAT_PER_SHOT = 3.8;
const HEAT_COOL_RATE = 22.0;
const JAM_COOLDOWN = 2.8;

// Power-Up State (Quad Overdrive with Overheat Jam Risk)
let isOverdriveActive = false;
let overdriveTimer = 0;
const OVERDRIVE_DURATION = 12.0;

// Game Collections
let zombies = [];
let bullets = [];
let bossProjectiles = []; // Shootable Valkyrie needles & Abomination boulders
let debrisChunks = [];
let obstacles = [];
let pickups = [];
let activeBoss = null;

// Raycasting & Aiming (Plane at Y = 0.85 for zombie chest height)
let targetPoint = new THREE.Vector3(0, 0.85, 20);
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let planeXZ = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.85);

// Gameplay Configuration & State
let score = 0;
let health = 100;
let currentWave = 1;
let zombiesRemainingToSpawn = 0;
let zombiesAliveCount = 0;
let spawnTimer = 0;
let spawnInterval = 1000;
let baseSpawnInterval = 1000;
let isWaveIntermission = false;
let waveIntermissionTimer = 0;
let spawnsSinceLastCarrier = 0;
const MAX_CONCURRENT_ZOMBIES = 9;

let gameState = 'START';
let clock = new THREE.Clock();

// 10-Second Unique Boss Intro Cinematic State
let isCinematicActive = false;
let cinematicTimer = 0;
const CINEMATIC_DURATION = 10.0;
let cinematicBoss = null;

// Defeat Outro & Turret Destruction State
let isDefeatOutroActive = false;
let defeatOutroTimer = 0;
const DEFEAT_OUTRO_DURATION = 4.2;
let defeatExplosionStage = 0;

// Camera Shake
let shakeDuration = 0;
let shakeIntensity = 0.18;
let originalCameraPos = new THREE.Vector3(0, 20, 22);

// DOM Throttling Cache
let lastRenderedHeat = -1;
let lastRenderedHealth = -1;
let lastRenderedBossHp = -1;
let lastRenderedScore = -1;
let lastRenderedWave = -1;
let lastRenderedEnemies = -1;

// DOM Elements (Dynamically bound)
let hudElement, scoreValue, waveValue, enemiesLeftValue, healthValue, healthBarFill;
let heatVal, heatBarFill, jammedAlert, overdriveCard, overdriveTimerEl, overdriveBarFill;
let powerupNotify, powerupNotifyText, bossHud, bossName, bossSubtitle, bossHpVal, bossBarFill;
let bossAnnounce, bossAnnounceTitle, bossAnnounceDesc, bossTelegraph, bossTelegraphText, diveAlert;
let cinematicOverlay, cinematicTitle, cinematicSubtitle, cinematicIntel, cinematicProgressFill, cinematicSkipHint;
let startOverlay, startBtn, pauseOverlay, pauseBtn, resumeBtn, gameOverOverlay, restartBtn, finalScore, finalWave, gameContainer;
let leaderboardModal, leaderboardTbody, clearLeaderboardBtn, closeLeaderboardBtn, leaderboardHudBtn, startLeaderboardBtn, pauseLeaderboardBtn, gameOverLeaderboardBtn;
let guideModal, closeGuideBtn, guideHudBtn, startGuideBtn, pauseGuideBtn, gameOverGuideBtn, threatCardsContainer;
let playerCallsignInput, submitScoreBtn, saveStatusMsg;

function fetchDOMElements() {
    hudElement = document.getElementById('hud');
    scoreValue = document.getElementById('score-value');
    waveValue = document.getElementById('wave-value');
    enemiesLeftValue = document.getElementById('enemies-left');
    healthValue = document.getElementById('health-value');
    healthBarFill = document.getElementById('health-bar-fill');
    heatVal = document.getElementById('heat-val');
    heatBarFill = document.getElementById('heat-bar-fill');
    jammedAlert = document.getElementById('jammed-alert');
    overdriveCard = document.getElementById('overdrive-card');
    overdriveTimerEl = document.getElementById('overdrive-timer');
    overdriveBarFill = document.getElementById('overdrive-bar-fill');
    powerupNotify = document.getElementById('powerup-notify');
    powerupNotifyText = document.getElementById('powerup-notify-text');
    bossHud = document.getElementById('boss-hud');
    bossName = document.getElementById('boss-name');
    bossSubtitle = document.getElementById('boss-subtitle');
    bossHpVal = document.getElementById('boss-hp-val');
    bossBarFill = document.getElementById('boss-bar-fill');
    bossAnnounce = document.getElementById('boss-announce');
    bossAnnounceTitle = document.getElementById('boss-announce-title');
    bossAnnounceDesc = document.getElementById('boss-announce-desc');
    bossTelegraph = document.getElementById('boss-telegraph');
    bossTelegraphText = document.getElementById('boss-telegraph-text');
    diveAlert = document.getElementById('dive-alert');
    cinematicOverlay = document.getElementById('cinematic-overlay');
    cinematicTitle = document.getElementById('cinematic-title');
    cinematicSubtitle = document.getElementById('cinematic-subtitle');
    cinematicIntel = document.getElementById('cinematic-intel');
    cinematicProgressFill = document.getElementById('cinematic-progress-fill');
    cinematicSkipHint = document.getElementById('cinematic-skip-hint');
    startOverlay = document.getElementById('start-overlay');
    startBtn = document.getElementById('start-btn');
    pauseOverlay = document.getElementById('pause-overlay');
    pauseBtn = document.getElementById('pause-btn');
    resumeBtn = document.getElementById('resume-btn');
    gameOverOverlay = document.getElementById('game-over-overlay');
    restartBtn = document.getElementById('restart-btn');
    finalScore = document.getElementById('final-score');
    finalWave = document.getElementById('final-wave');
    gameContainer = document.getElementById('game-container');

    leaderboardModal = document.getElementById('leaderboard-modal');
    leaderboardTbody = document.getElementById('leaderboard-tbody');
    clearLeaderboardBtn = document.getElementById('clear-leaderboard-btn');
    closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    leaderboardHudBtn = document.getElementById('leaderboard-hud-btn');
    startLeaderboardBtn = document.getElementById('start-leaderboard-btn');
    pauseLeaderboardBtn = document.getElementById('pause-leaderboard-btn');
    gameOverLeaderboardBtn = document.getElementById('game-over-leaderboard-btn');

    guideModal = document.getElementById('guide-modal');
    closeGuideBtn = document.getElementById('close-guide-btn');
    guideHudBtn = document.getElementById('guide-hud-btn');
    startGuideBtn = document.getElementById('start-guide-btn');
    pauseGuideBtn = document.getElementById('pause-guide-btn');
    gameOverGuideBtn = document.getElementById('game-over-guide-btn');
    threatCardsContainer = document.getElementById('threat-cards-container');

    playerCallsignInput = document.getElementById('player-callsign-input');
    submitScoreBtn = document.getElementById('submit-score-btn');
    saveStatusMsg = document.getElementById('save-status-msg');
}

// Initial fetch attempt
fetchDOMElements();

// ============================================================================
// SHARED STATIC GEOMETRIES & MATERIALS POOL
// ============================================================================
const GEO_DEBRIS = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const GEO_SPARK = new THREE.BoxGeometry(0.12, 0.12, 0.12);
const GEO_CASING = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 5);
const GEO_STEAM = new THREE.SphereGeometry(0.2, 5, 5);
const GEO_BULLET = new THREE.CylinderGeometry(0.12, 0.12, 1.0, 5);
GEO_BULLET.rotateX(Math.PI / 2);

const GEO_TORSO = new THREE.BoxGeometry(0.62, 0.7, 0.38);
const GEO_HEAD = new THREE.BoxGeometry(0.4, 0.42, 0.4);
const GEO_JAW = new THREE.BoxGeometry(0.32, 0.16, 0.25);
const GEO_ARM = new THREE.BoxGeometry(0.18, 0.65, 0.18);
const GEO_HAND = new THREE.BoxGeometry(0.16, 0.2, 0.24);
const GEO_LEG = new THREE.BoxGeometry(0.22, 0.65, 0.22);
const GEO_BOOT = new THREE.BoxGeometry(0.24, 0.18, 0.35);
const GEO_EYE = new THREE.BoxGeometry(0.08, 0.08, 0.05);

const GEO_TANK_ARMOR = new THREE.BoxGeometry(0.72, 0.6, 0.46);
const GEO_PACK = new THREE.BoxGeometry(0.44, 0.48, 0.28);
const GEO_PACK_CORE = new THREE.SphereGeometry(0.12, 5, 5);

const MAT_CASING = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3 });
const MAT_SPARK = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
const MAT_BULLET_CYAN = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
const MAT_BULLET_GOLD = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

const MAT_WALKER_FLESH = new THREE.MeshLambertMaterial({ color: 0x4d6b4f });
const MAT_WALKER_SHIRT = new THREE.MeshLambertMaterial({ color: 0x3d4b60 });
const MAT_WALKER_PANTS = new THREE.MeshLambertMaterial({ color: 0x22262e });

const MAT_RUNNER_FLESH = new THREE.MeshLambertMaterial({ color: 0x8a2434 });
const MAT_RUNNER_SHIRT = new THREE.MeshLambertMaterial({ color: 0x21232a });
const MAT_RUNNER_PANTS = new THREE.MeshLambertMaterial({ color: 0x15161b });

const MAT_TANK_FLESH = new THREE.MeshLambertMaterial({ color: 0x3c4943 });
const MAT_TANK_SHIRT = new THREE.MeshLambertMaterial({ color: 0x181c23 });
const MAT_TANK_PANTS = new THREE.MeshLambertMaterial({ color: 0x111317 });
const MAT_TANK_ARMOR = new THREE.MeshLambertMaterial({ color: 0x11161d });

const MAT_BOOT = new THREE.MeshLambertMaterial({ color: 0x0f1115 });
const MAT_EYE_RED = new THREE.MeshBasicMaterial({ color: 0xff2222 });
const MAT_EYE_YELLOW = new THREE.MeshBasicMaterial({ color: 0xffd700 });
const MAT_EYE_PINK = new THREE.MeshBasicMaterial({ color: 0xff0044 });
const MAT_EYE_CYAN = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

// New Zombie Units Materials
const MAT_HOUND_FUR = new THREE.MeshLambertMaterial({ color: 0x27272a });
const MAT_HOUND_FLESH = new THREE.MeshLambertMaterial({ color: 0x7f1d1d, emissive: 0x450a0a, emissiveIntensity: 0.3 });
const MAT_HOUND_BONE = new THREE.MeshLambertMaterial({ color: 0xd1d5db });
const MAT_HOUND_TEETH = new THREE.MeshBasicMaterial({ color: 0xfef08a });

const MAT_SEEKER_FLESH = new THREE.MeshLambertMaterial({ color: 0x334155, emissive: 0x1e293b, emissiveIntensity: 0.25 });
const MAT_SEEKER_WING = new THREE.MeshLambertMaterial({ color: 0x0f172a, emissive: 0x090d16, emissiveIntensity: 0.3 });
const MAT_SEEKER_SONAR = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

const MAT_SPITTER_FLESH = new THREE.MeshLambertMaterial({ color: 0x365314, emissive: 0x14532d, emissiveIntensity: 0.3 });
const MAT_SPITTER_PUSTULE = new THREE.MeshLambertMaterial({ color: 0xa3e635, emissive: 0x65a30d, emissiveIntensity: 0.7 });

const MAT_PHANTOM_CLOAK = new THREE.MeshLambertMaterial({ color: 0x0f172a, transparent: true, opacity: 0.65 });
const MAT_PHANTOM_FLESH = new THREE.MeshLambertMaterial({ color: 0x1e293b });

const MAT_CRAWLER_FLESH = new THREE.MeshLambertMaterial({ color: 0x451a03 });
const MAT_CRAWLER_SHIRT = new THREE.MeshLambertMaterial({ color: 0x18181b });

const MAT_BRUTE_FLESH = new THREE.MeshLambertMaterial({ color: 0x831843, emissive: 0x500724, emissiveIntensity: 0.3 });
const MAT_BRUTE_ARMOR = new THREE.MeshLambertMaterial({ color: 0x1e1b4b });
const MAT_SHIELD_SLAB = new THREE.MeshLambertMaterial({ color: 0x475569, emissive: 0x1e293b, emissiveIntensity: 0.3 });

const MAT_SCREAMER_FLESH = new THREE.MeshLambertMaterial({ color: 0x581c87, emissive: 0x3b0764, emissiveIntensity: 0.4 });
const MAT_SCREAMER_ROBE = new THREE.MeshLambertMaterial({ color: 0x2e1065 });
const MAT_SCREAMER_AURA = new THREE.MeshBasicMaterial({ color: 0xd946ef });

// Zombie Animal Materials (Stag, Horse, Bear)
const MAT_STAG_HIDE = new THREE.MeshLambertMaterial({ color: 0x5a3825, emissive: 0x29150c, emissiveIntensity: 0.2 });
const MAT_STAG_BONE = new THREE.MeshLambertMaterial({ color: 0xd6d3d1 });
const MAT_STAG_ANTLER = new THREE.MeshLambertMaterial({ color: 0x78716c });
const MAT_HORSE_HIDE = new THREE.MeshLambertMaterial({ color: 0x3d352e, emissive: 0x1c1917, emissiveIntensity: 0.2 });
const MAT_HORSE_MANE = new THREE.MeshLambertMaterial({ color: 0x18181b });
const MAT_HORSE_HOOF = new THREE.MeshLambertMaterial({ color: 0x09090b });
const MAT_BEAR_PELT = new THREE.MeshLambertMaterial({ color: 0x2e1c14, emissive: 0x1a0f0a, emissiveIntensity: 0.2 });
const MAT_BEAR_FLESH = new THREE.MeshLambertMaterial({ color: 0x7f1d1d, emissive: 0x450a0a, emissiveIntensity: 0.3 });
const MAT_BEAR_CLAW = new THREE.MeshLambertMaterial({ color: 0x09090b });

// New Boss Materials (The Omega & The Salamander)
const MAT_OMEGA_SCALE = new THREE.MeshLambertMaterial({ color: 0x1c3a27, emissive: 0x0d1f14, emissiveIntensity: 0.3 });
const MAT_OMEGA_BELLY = new THREE.MeshLambertMaterial({ color: 0x2d4a36 });
const MAT_OMEGA_ROT = new THREE.MeshLambertMaterial({ color: 0x450a0a, emissive: 0x240404, emissiveIntensity: 0.2 });
const MAT_OMEGA_FANG = new THREE.MeshBasicMaterial({ color: 0xfef08a });
const MAT_SALAMANDER_CARAPACE = new THREE.MeshLambertMaterial({ color: 0x18181b, emissive: 0x09090b, emissiveIntensity: 0.2 });
const MAT_SALAMANDER_BELLY = new THREE.MeshLambertMaterial({ color: 0x3f3f46 });
const MAT_SALAMANDER_SPINE = new THREE.MeshLambertMaterial({ color: 0xd6d3d1, emissive: 0x78350f, emissiveIntensity: 0.2 });
const MAT_SALAMANDER_WEAKPOINT = new THREE.MeshLambertMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.85 });

const MAT_PACK_GREEN = new THREE.MeshLambertMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.6 });
const MAT_PACK_GOLD = new THREE.MeshLambertMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.6 });
const MAT_CORE_GREEN = new THREE.MeshBasicMaterial({ color: 0x34d399 });
const MAT_CORE_GOLD = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

const MAT_DEBRIS_FLESH = new THREE.MeshLambertMaterial({ color: 0x4d6b4f });
const MAT_DEBRIS_FIRE = new THREE.MeshBasicMaterial({ color: 0xff4400 });
const MAT_ACID_SPLAT = new THREE.MeshBasicMaterial({ color: 0xa3e635 });

function attachCarrierBackpack(group, carrierType, offset = { x: 0, y: 0.38, z: -0.26 }, scale = 1.0) {
    if (!carrierType || !group) return null;
    const packMat = (carrierType === 'REPAIR') ? MAT_PACK_GREEN : MAT_PACK_GOLD;
    const coreMat = (carrierType === 'REPAIR') ? MAT_CORE_GREEN : MAT_CORE_GOLD;
    const lightColor = (carrierType === 'REPAIR') ? 0x34d399 : 0xfbbf24;

    const packGroup = new THREE.Group();
    packGroup.name = 'carrierBackpack';
    packGroup.position.set(offset.x || 0, offset.y || 0, offset.z || 0);
    packGroup.scale.setScalar(scale);

    const backpack = new THREE.Mesh(GEO_PACK, packMat);
    packGroup.add(backpack);

    const core = new THREE.Mesh(GEO_PACK_CORE, coreMat);
    core.position.set(0, 0, -0.16);
    packGroup.add(core);

    const ringGeo = new THREE.TorusGeometry(0.35, 0.04, 4, 10);
    const ringMat = new THREE.MeshBasicMaterial({ color: lightColor });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.22, 0);
    packGroup.add(ring);

    group.add(packGroup);
    return packGroup;
}

// ============================================================================
// 0. PROCEDURAL WEB AUDIO ENGINE, DYNAMIC SOUNDTRACK & SOUND EFFECTS
// ============================================================================
let audioCtx = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;
let isMuted = false;
let audioInitialized = false;

// Turret Servo Audio
let servoOsc = null;
let servoGain = null;
let lastTurretRotY = 0;

// Soundtrack Engine State
let soundtrackInterval = null;
let musicStep = 0;
let soundtrackMode = 'DEFENSE'; // 'DEFENSE', 'BOSS', 'CINEMATIC', 'VICTORY', 'GAMEOVER'
let isMusicDucked = false;

function initAudio() {
    if (audioInitialized && audioCtx) {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return;
    }
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        audioCtx = new AudioContextClass();

        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.75, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);

        musicGain = audioCtx.createGain();
        musicGain.gain.setValueAtTime(0.35, audioCtx.currentTime);
        musicGain.connect(masterGain);

        sfxGain = audioCtx.createGain();
        sfxGain.gain.setValueAtTime(0.75, audioCtx.currentTime);
        sfxGain.connect(masterGain);

        audioInitialized = true;
        initTurretServoAudio();
        startSoundtrack();
    } catch (e) {
        console.warn('Web Audio initialization error:', e);
    }
}

function toggleAudioMute() {
    initAudio();
    isMuted = !isMuted;
    if (masterGain && audioCtx) {
        masterGain.gain.setValueAtTime(isMuted ? 0 : 0.75, audioCtx.currentTime);
    }
    const soundBtn = document.getElementById('sound-btn');
    const pauseSoundBtn = document.getElementById('pause-sound-btn');
    const text = isMuted ? '🔇 MUTED [M]' : '🔊 AUDIO [M]';
    const pauseText = isMuted ? '🔇 AUDIO OFF' : '🔊 AUDIO ON';
    if (soundBtn) {
        soundBtn.textContent = text;
        soundBtn.style.color = isMuted ? '#ef4444' : '#00f0ff';
    }
    if (pauseSoundBtn) {
        pauseSoundBtn.textContent = pauseText;
        pauseSoundBtn.style.color = isMuted ? '#ef4444' : '#00f0ff';
    }
}

function createNoiseBuffer(duration = 0.5) {
    if (!audioCtx) return null;
    const bufferSize = Math.floor(audioCtx.sampleRate * duration);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
}

function calcDistanceGain(x, z, maxDist = 40.0) {
    const dist = Math.hypot(x, z);
    if (dist <= 4.0) return 1.0;
    return Math.max(0.15, 1.0 - (dist - 4.0) / (maxDist - 4.0));
}

// ----------------------------------------------------------------------------
// Core Audio Synthesis Helpers
// ----------------------------------------------------------------------------
function playSynthTone(freq, duration, type = 'sine', gainVal = 0.5, dest = null) {
    if (!audioCtx || isMuted) return;
    try {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);

        g.gain.setValueAtTime(gainVal, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(g);
        g.connect(dest || sfxGain);

        osc.start(now);
        osc.stop(now + duration);
    } catch (e) {}
}

function playPitchSlide(startFreq, endFreq, duration, type = 'sine', gainVal = 0.5, dest = null) {
    if (!audioCtx || isMuted) return;
    try {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), now + duration);

        g.gain.setValueAtTime(gainVal, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(g);
        g.connect(dest || sfxGain);

        osc.start(now);
        osc.stop(now + duration);
    } catch (e) {}
}

function playNoiseBurst(duration, filterFreq = 800, filterType = 'lowpass', gainVal = 0.5, dest = null) {
    if (!audioCtx || isMuted) return;
    try {
        const now = audioCtx.currentTime;
        const buffer = createNoiseBuffer(duration);
        if (!buffer) return;

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.setValueAtTime(filterFreq, now);

        const g = audioCtx.createGain();
        g.gain.setValueAtTime(gainVal, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        noise.connect(filter);
        filter.connect(g);
        g.connect(dest || sfxGain);

        noise.start(now);
        noise.stop(now + duration);
    } catch (e) {}
}

function playFMChirp(carrierFreq, modFreq, modIndex, duration, gainVal = 0.5) {
    if (!audioCtx || isMuted) return;
    try {
        const now = audioCtx.currentTime;
        const carrier = audioCtx.createOscillator();
        const modulator = audioCtx.createOscillator();
        const modGain = audioCtx.createGain();
        const mainGain = audioCtx.createGain();

        carrier.type = 'sine';
        carrier.frequency.setValueAtTime(carrierFreq, now);

        modulator.type = 'sawtooth';
        modulator.frequency.setValueAtTime(modFreq, now);

        modGain.gain.setValueAtTime(modIndex, now);
        modulator.connect(carrier.frequency);

        mainGain.gain.setValueAtTime(gainVal, now);
        mainGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        carrier.connect(mainGain);
        mainGain.connect(sfxGain);

        modulator.start(now);
        carrier.start(now);
        modulator.stop(now + duration);
        carrier.stop(now + duration);
    } catch (e) {}
}

// ----------------------------------------------------------------------------
// Turret Servo Audio System
// ----------------------------------------------------------------------------
function initTurretServoAudio() {
    if (!audioCtx) return;
    try {
        const now = audioCtx.currentTime;
        servoOsc = audioCtx.createOscillator();
        servoGain = audioCtx.createGain();

        servoOsc.type = 'triangle';
        servoOsc.frequency.setValueAtTime(120, now);

        servoGain.gain.setValueAtTime(0, now);

        servoOsc.connect(servoGain);
        servoGain.connect(sfxGain);
        servoOsc.start(now);
    } catch (e) {}
}

function updateTurretServoAudio(angularSpeed) {
    if (!audioCtx || !servoGain || !servoOsc || isMuted) return;
    try {
        const now = audioCtx.currentTime;
        const speed = Math.min(6.0, angularSpeed || 0);
        if (speed > 0.08) {
            const targetGain = Math.min(0.22, speed * 0.05);
            const targetFreq = Math.min(280, 110 + speed * 35);
            servoGain.gain.setTargetAtTime(targetGain, now, 0.04);
            servoOsc.frequency.setTargetAtTime(targetFreq, now, 0.04);
        } else {
            servoGain.gain.setTargetAtTime(0.0001, now, 0.06);
        }
    } catch (e) {}
}

// ----------------------------------------------------------------------------
// Dynamic Procedural Soundtrack Engine (Defense & Boss Themes)
// ----------------------------------------------------------------------------
function startSoundtrack() {
    if (soundtrackInterval) clearInterval(soundtrackInterval);
    musicStep = 0;
    soundtrackInterval = setInterval(onSoundtrackStep, 125); // 120 BPM 16th notes
}

function setSoundtrackMode(mode) {
    soundtrackMode = mode;
}

function setSoundtrackDucked(ducked) {
    isMusicDucked = ducked;
    if (musicGain && audioCtx) {
        const now = audioCtx.currentTime;
        musicGain.gain.setTargetAtTime(isMusicDucked ? 0.08 : 0.35, now, 0.1);
    }
}

function onSoundtrackStep() {
    if (!audioCtx || isMuted || (gameState !== 'PLAYING' && gameState !== 'DEFEAT_OUTRO')) return;

    try {
        const now = audioCtx.currentTime;
        const step = musicStep % 16;
        musicStep++;

        if (soundtrackMode === 'DEFENSE') {
            // Kick on 0, 8
            if (step === 0 || step === 8) {
                playPitchSlide(110, 32, 0.12, 'sine', 0.45, musicGain);
            }
            // Snare / Clap on 4, 12
            if (step === 4 || step === 12) {
                playNoiseBurst(0.14, 1400, 'bandpass', 0.28, musicGain);
            }
            // Hi-Hat on even steps
            if (step % 2 === 0 && step !== 4 && step !== 12) {
                playNoiseBurst(0.04, 6000, 'highpass', 0.12, musicGain);
            }
            // Melodic Dark Synth Bassline (D minor progression)
            const bassNotes = [73.4, 73.4, 87.3, 98.0, 73.4, 58.3, 65.4, 73.4]; // D2, D2, F2, G2, D2, Bb1, C2, D2
            const noteIdx = Math.floor(step / 2) % bassNotes.length;
            if (step % 2 === 0) {
                playPitchSlide(bassNotes[noteIdx] * 1.05, bassNotes[noteIdx], 0.18, 'sawtooth', 0.22, musicGain);
            }
            // Synth Arp Plucks on 16th notes
            const arpNotes = [293.7, 349.2, 440.0, 587.3, 523.3, 440.0, 349.2, 329.6]; // D4, F4, A4, D5, C5, A4, F4, E4
            const arpNote = arpNotes[step % arpNotes.length];
            if (step % 4 === 1 || step % 4 === 3) {
                playSynthTone(arpNote, 0.08, 'sine', 0.14, musicGain);
            }
        } else if (soundtrackMode === 'BOSS') {
            // Heavy driving boss kick on 0, 4, 8, 12, 14
            if (step === 0 || step === 4 || step === 8 || step === 12 || step === 14) {
                playPitchSlide(160, 28, 0.15, 'sine', 0.65, musicGain);
                playNoiseBurst(0.05, 120, 'lowpass', 0.4, musicGain);
            }
            // Heavy Snare on 4, 12
            if (step === 4 || step === 12) {
                playNoiseBurst(0.18, 1800, 'bandpass', 0.45, musicGain);
                playPitchSlide(220, 90, 0.08, 'triangle', 0.3, musicGain);
            }
            // Rapid Hi-Hats every step
            playNoiseBurst(0.03, 7500, 'highpass', 0.16, musicGain);

            // Distorted Heavy Boss Sub-Bass
            const bossBassNotes = [36.7, 38.9, 43.6, 51.9, 36.7, 34.6, 49.0, 36.7]; // D1, D#1, F1, G#1...
            const bIdx = Math.floor(step / 2) % bossBassNotes.length;
            if (step % 2 === 0) {
                playPitchSlide(bossBassNotes[bIdx] * 1.5, bossBassNotes[bIdx], 0.22, 'sawtooth', 0.38, musicGain);
            }
            // Aggressive Saw Arpeggio
            const bossArp = [440.0, 466.2, 523.3, 622.3, 587.3, 523.3, 466.2, 440.0];
            playSynthTone(bossArp[step % bossArp.length], 0.09, 'sawtooth', 0.18, musicGain);
        } else if (soundtrackMode === 'CINEMATIC') {
            // Low Brass Riser & Sub Drone during cinematic
            if (step === 0) {
                playPitchSlide(40, 80, 1.8, 'sawtooth', 0.45, musicGain);
                playSynthTone(146.8, 1.8, 'triangle', 0.35, musicGain);
            }
        } else if (soundtrackMode === 'GAMEOVER') {
            // Eerie low descending minor drone during defeat outro
            if (step === 0) {
                playPitchSlide(82.4, 25, 2.2, 'sawtooth', 0.45, musicGain);
                playSynthTone(41.2, 2.2, 'sine', 0.4, musicGain);
            }
        }
    } catch (e) {}
}

// ----------------------------------------------------------------------------
// Firepower & Combat SFX
// ----------------------------------------------------------------------------
function playShootSound(isOverdrive) {
    if (!audioCtx || isMuted) return;
    try {
        if (isOverdrive) {
            // Heavy Quad Overdrive blast with sub-bass distortion & laser plasma ring
            playPitchSlide(180, 24, 0.14, 'sine', 0.65);
            playNoiseBurst(0.12, 1200, 'lowpass', 0.45);
            playSynthTone(680, 0.08, 'sawtooth', 0.3);
            playSynthTone(1360, 0.05, 'triangle', 0.25);
        } else {
            // Normal punchy dual autocannon blast
            playPitchSlide(150, 38, 0.09, 'sine', 0.45);
            playNoiseBurst(0.07, 2400, 'bandpass', 0.35);
            playSynthTone(850, 0.03, 'sine', 0.2);
        }
    } catch (e) {}
}

function playSteamHissSound() {
    playNoiseBurst(0.65, 3200, 'highpass', 0.4);
    playPitchSlide(800, 2000, 0.5, 'sine', 0.15);
}

function playExplosionSound(type, size = 1.0) {
    if (!audioCtx || isMuted) return;
    try {
        const intensity = Math.min(2.0, size);
        playPitchSlide(90 * intensity, 22, 0.35 * intensity, 'sine', 0.6 * intensity);
        playNoiseBurst(0.45 * intensity, 550, 'lowpass', 0.65 * intensity);
    } catch (e) {}
}

function playObstacleImpactSound(type) {
    if (!audioCtx || isMuted) return;
    try {
        if (type === 'steel') {
            playSynthTone(2200, 0.12, 'sine', 0.35);
            playNoiseBurst(0.06, 1800, 'bandpass', 0.25);
        } else if (type === 'rock') {
            playPitchSlide(320, 90, 0.1, 'triangle', 0.35);
            playNoiseBurst(0.08, 700, 'lowpass', 0.3);
        } else {
            playPitchSlide(240, 60, 0.12, 'sine', 0.3);
            playNoiseBurst(0.1, 900, 'lowpass', 0.25);
        }
    } catch (e) {}
}

function playBunkerHitSound() {
    if (!audioCtx || isMuted) return;
    try {
        playPitchSlide(140, 25, 0.25, 'sine', 0.7);
        playNoiseBurst(0.2, 400, 'lowpass', 0.5);
        playSynthTone(880, 0.15, 'triangle', 0.3);
    } catch (e) {}
}

function playPickupSound(type) {
    if (!audioCtx || isMuted) return;
    try {
        if (type === 'REPAIR') {
            // Rising restorative major arpeggio
            [523.3, 659.3, 783.9, 1046.5].forEach((freq, i) => {
                setTimeout(() => playSynthTone(freq, 0.18, 'sine', 0.35), i * 55);
            });
        } else {
            // Overdrive powerup high-voltage electric surge
            [440.0, 554.4, 659.3, 880.0].forEach((freq, i) => {
                setTimeout(() => playSynthTone(freq, 0.22, 'sawtooth', 0.3), i * 45);
            });
            playPitchSlide(300, 1600, 0.3, 'sine', 0.35);
        }
    } catch (e) {}
}

// ----------------------------------------------------------------------------
// 3-Phase Unique Audio Profiles for ALL 10 Regular Zombie Types
// ----------------------------------------------------------------------------
// 3-Phase Unique Audio Profiles for ALL 10 Regular Zombie Types
// ----------------------------------------------------------------------------
function playZombieApproachSound(type, x, z) {
    if (!audioCtx || isMuted) return;
    const distGain = calcDistanceGain(x, z);
    if (distGain < 0.05) return;

    try {
        switch (type) {
            case 'WALKER':
                playPitchSlide(95, 68, 0.45, 'sawtooth', 0.22 * distGain);
                playNoiseBurst(0.35, 380, 'lowpass', 0.18 * distGain);
                break;
            case 'RUNNER':
                playNoiseBurst(0.18, 1200, 'bandpass', 0.28 * distGain);
                playPitchSlide(220, 160, 0.2, 'sawtooth', 0.2 * distGain);
                break;
            case 'SEEKER':
                playFMChirp(3200, 180, 400, 0.15, 0.25 * distGain);
                playNoiseBurst(0.12, 450, 'lowpass', 0.2 * distGain);
                break;
            case 'HOUND':
                playPitchSlide(140, 90, 0.35, 'sawtooth', 0.3 * distGain);
                playNoiseBurst(0.2, 850, 'bandpass', 0.22 * distGain);
                break;
            case 'SPITTER':
                playPitchSlide(180, 320, 0.25, 'sine', 0.25 * distGain);
                playNoiseBurst(0.25, 600, 'bandpass', 0.2 * distGain);
                break;
            case 'PHANTOM':
                playSynthTone(220, 0.4, 'sine', 0.18 * distGain);
                playSynthTone(224, 0.4, 'triangle', 0.18 * distGain);
                break;
            case 'CRAWLER':
                playNoiseBurst(0.35, 1400, 'bandpass', 0.22 * distGain);
                playPitchSlide(85, 45, 0.3, 'sawtooth', 0.18 * distGain);
                break;
            case 'BRUTE':
                playPitchSlide(75, 30, 0.28, 'triangle', 0.35 * distGain);
                playNoiseBurst(0.22, 280, 'lowpass', 0.3 * distGain);
                break;
            case 'TANK':
                playPitchSlide(60, 26, 0.35, 'sawtooth', 0.38 * distGain);
                playNoiseBurst(0.28, 220, 'lowpass', 0.35 * distGain);
                break;
            case 'SCREAMER':
                playSynthTone(150, 0.45, 'sawtooth', 0.22 * distGain);
                playSynthTone(225, 0.45, 'sine', 0.18 * distGain);
                break;
            case 'STAG':
                playNoiseBurst(0.2, 1600, 'bandpass', 0.25 * distGain);
                playPitchSlide(260, 140, 0.22, 'sawtooth', 0.22 * distGain);
                break;
            case 'HORSE':
                playPitchSlide(480, 220, 0.35, 'sawtooth', 0.3 * distGain);
                playNoiseBurst(0.25, 450, 'lowpass', 0.32 * distGain);
                break;
            case 'BEAR':
                playPitchSlide(70, 24, 0.45, 'sawtooth', 0.38 * distGain);
                playNoiseBurst(0.3, 260, 'lowpass', 0.35 * distGain);
                break;
            default:
                playPitchSlide(90, 60, 0.3, 'sawtooth', 0.2 * distGain);
                break;
        }
    } catch (e) {}
}

function playZombieAttackSound(type) {
    if (!audioCtx || isMuted) return;
    try {
        switch (type) {
            case 'WALKER':
                playPitchSlide(210, 65, 0.12, 'sawtooth', 0.4);
                playNoiseBurst(0.08, 1600, 'bandpass', 0.35);
                break;
            case 'RUNNER':
                playPitchSlide(480, 180, 0.14, 'sawtooth', 0.45);
                playNoiseBurst(0.09, 2200, 'highpass', 0.35);
                break;
            case 'SEEKER':
                playPitchSlide(850, 280, 0.18, 'sawtooth', 0.5);
                playNoiseBurst(0.12, 1800, 'bandpass', 0.35);
                break;
            case 'HOUND':
                playPitchSlide(280, 80, 0.15, 'sawtooth', 0.55);
                playNoiseBurst(0.1, 1400, 'bandpass', 0.4);
                break;
            case 'SPITTER':
                playPitchSlide(750, 180, 0.25, 'sine', 0.45);
                playNoiseBurst(0.28, 2600, 'highpass', 0.4);
                break;
            case 'PHANTOM':
                playPitchSlide(380, 110, 0.2, 'triangle', 0.4);
                playNoiseBurst(0.15, 1600, 'bandpass', 0.3);
                break;
            case 'CRAWLER':
                playPitchSlide(180, 60, 0.12, 'sawtooth', 0.38);
                playNoiseBurst(0.1, 1100, 'bandpass', 0.35);
                break;
            case 'BRUTE':
                playPitchSlide(140, 35, 0.3, 'sine', 0.6);
                playSynthTone(380, 0.25, 'triangle', 0.45);
                playNoiseBurst(0.18, 800, 'lowpass', 0.45);
                break;
            case 'TANK':
                playPitchSlide(120, 25, 0.32, 'sawtooth', 0.65);
                playSynthTone(240, 0.2, 'triangle', 0.5);
                playNoiseBurst(0.22, 600, 'lowpass', 0.5);
                break;
            case 'SCREAMER':
                playPitchSlide(1400, 350, 0.38, 'sawtooth', 0.6);
                playFMChirp(1200, 95, 350, 0.35, 0.5);
                break;
            case 'STAG':
                playPitchSlide(540, 160, 0.15, 'sawtooth', 0.45);
                playNoiseBurst(0.1, 1900, 'bandpass', 0.35);
                break;
            case 'HORSE':
                playPitchSlide(360, 70, 0.25, 'sawtooth', 0.55);
                playNoiseBurst(0.18, 550, 'lowpass', 0.5);
                break;
            case 'BEAR':
                playPitchSlide(110, 22, 0.38, 'sawtooth', 0.7);
                playNoiseBurst(0.28, 480, 'lowpass', 0.6);
                break;
            default:
                playPitchSlide(180, 60, 0.15, 'sawtooth', 0.4);
                break;
        }
    } catch (e) {}
}

function playZombieDeathSound(type) {
    if (!audioCtx || isMuted) return;
    try {
        switch (type) {
            case 'WALKER':
                playPitchSlide(130, 35, 0.35, 'sawtooth', 0.35);
                playNoiseBurst(0.25, 400, 'lowpass', 0.3);
                break;
            case 'RUNNER':
                playPitchSlide(420, 80, 0.28, 'sawtooth', 0.4);
                playNoiseBurst(0.2, 900, 'lowpass', 0.3);
                break;
            case 'SEEKER':
                playFMChirp(2400, 80, 300, 0.18, 0.35);
                playPitchSlide(180, 40, 0.2, 'triangle', 0.35);
                break;
            case 'HOUND':
                playPitchSlide(620, 220, 0.22, 'sawtooth', 0.45);
                playSynthTone(180, 0.2, 'sine', 0.25);
                break;
            case 'SPITTER':
                playPitchSlide(340, 80, 0.18, 'sine', 0.4);
                playNoiseBurst(0.35, 3200, 'highpass', 0.35);
                break;
            case 'PHANTOM':
                playNoiseBurst(0.4, 2200, 'bandpass', 0.35);
                playPitchSlide(280, 40, 0.35, 'sine', 0.25);
                break;
            case 'CRAWLER':
                playPitchSlide(150, 35, 0.22, 'sawtooth', 0.35);
                playNoiseBurst(0.18, 600, 'lowpass', 0.35);
                break;
            case 'BRUTE':
                playPitchSlide(110, 25, 0.45, 'sawtooth', 0.5);
                playSynthTone(420, 0.3, 'triangle', 0.4);
                playNoiseBurst(0.3, 500, 'lowpass', 0.4);
                break;
            case 'TANK':
                playPitchSlide(95, 20, 0.5, 'sawtooth', 0.55);
                playSynthTone(180, 0.35, 'triangle', 0.45);
                playNoiseBurst(0.35, 350, 'lowpass', 0.45);
                break;
            case 'SCREAMER':
                playPitchSlide(850, 90, 0.45, 'sine', 0.45);
                playNoiseBurst(0.3, 1400, 'bandpass', 0.35);
                break;
            case 'STAG':
                playPitchSlide(480, 110, 0.28, 'sawtooth', 0.4);
                playNoiseBurst(0.22, 800, 'lowpass', 0.3);
                break;
            case 'HORSE':
                playPitchSlide(650, 95, 0.42, 'sawtooth', 0.5);
                playNoiseBurst(0.3, 400, 'lowpass', 0.4);
                break;
            case 'BEAR':
                playPitchSlide(90, 18, 0.55, 'sawtooth', 0.6);
                playNoiseBurst(0.4, 300, 'lowpass', 0.55);
                break;
            default:
                playPitchSlide(120, 40, 0.25, 'sawtooth', 0.35);
                break;
        }
    } catch (e) {}
}

// ----------------------------------------------------------------------------
// 3-Phase Unique Audio Profiles for ALL 6 Bosses
// ----------------------------------------------------------------------------
function playBossShowcaseSound(bossType) {
    if (!audioCtx || isMuted) return;
    try {
        if (bossType === 'HUNTER') {
            playNoiseBurst(0.6, 2200, 'highpass', 0.45);
            playPitchSlide(800, 220, 0.25, 'sawtooth', 0.5);
            setTimeout(() => playPitchSlide(950, 240, 0.25, 'sawtooth', 0.5), 180);
        } else if (bossType === 'OMEGA') {
            playPitchSlide(140, 30, 0.65, 'sawtooth', 0.75);
            playNoiseBurst(0.5, 900, 'bandpass', 0.65);
            playFMChirp(350, 45, 200, 0.45, 0.55);
        } else if (bossType === 'JUGGERNAUT') {
            playPitchSlide(90, 20, 0.5, 'sawtooth', 0.7);
            playNoiseBurst(0.4, 250, 'lowpass', 0.6);
            playPitchSlide(140, 40, 0.3, 'triangle', 0.6);
        } else if (bossType === 'VALKYRIE') {
            playPitchSlide(1200, 450, 0.55, 'sawtooth', 0.65);
            playPitchSlide(900, 380, 0.4, 'sine', 0.5);
            playNoiseBurst(0.45, 1400, 'bandpass', 0.4);
        } else if (bossType === 'SALAMANDER') {
            playPitchSlide(180, 40, 0.55, 'triangle', 0.7);
            playNoiseBurst(0.45, 450, 'lowpass', 0.6);
            playSynthTone(120, 0.4, 'sine', 0.65);
        } else if (bossType === 'ABOMINATION') {
            playPitchSlide(65, 18, 0.6, 'sine', 0.8);
            playNoiseBurst(0.5, 200, 'lowpass', 0.7);
            playFMChirp(180, 45, 180, 0.5, 0.5);
        }
    } catch (e) {}
}

function playBossAttackSound(bossType, attackState) {
    if (!audioCtx || isMuted) return;
    try {
        if (bossType === 'HUNTER') {
            playPitchSlide(450, 95, 0.3, 'sawtooth', 0.65);
            playNoiseBurst(0.2, 1800, 'bandpass', 0.5);
        } else if (bossType === 'OMEGA') {
            if (attackState === 'ROAR') {
                playPitchSlide(650, 60, 0.75, 'sawtooth', 0.9);
                playNoiseBurst(0.65, 800, 'bandpass', 0.8);
                playSynthTone(55, 0.6, 'sine', 0.85);
            } else if (attackState === 'TAIL') {
                playPitchSlide(220, 35, 0.35, 'sawtooth', 0.7);
                playNoiseBurst(0.3, 1100, 'lowpass', 0.6);
            } else {
                playPitchSlide(320, 75, 0.25, 'sawtooth', 0.7);
                playNoiseBurst(0.2, 1600, 'bandpass', 0.55);
            }
        } else if (bossType === 'JUGGERNAUT') {
            playPitchSlide(120, 20, 0.45, 'sine', 0.8);
            playNoiseBurst(0.35, 450, 'lowpass', 0.7);
            playSynthTone(320, 0.25, 'triangle', 0.55);
        } else if (bossType === 'VALKYRIE') {
            if (attackState === 'NEEDLE') {
                playPitchSlide(1400, 600, 0.12, 'sine', 0.4);
            } else {
                playPitchSlide(950, 180, 0.4, 'sawtooth', 0.75);
                playNoiseBurst(0.35, 1200, 'lowpass', 0.6);
            }
        } else if (bossType === 'SALAMANDER') {
            if (attackState === 'STOMP') {
                playPitchSlide(95, 18, 0.55, 'sine', 0.9);
                playNoiseBurst(0.55, 320, 'lowpass', 0.8);
                playSynthTone(40, 0.5, 'triangle', 0.75);
            } else if (attackState === 'TAIL') {
                playPitchSlide(180, 30, 0.35, 'sawtooth', 0.65);
                playNoiseBurst(0.25, 750, 'lowpass', 0.55);
            } else {
                playPitchSlide(260, 50, 0.22, 'sawtooth', 0.65);
                playNoiseBurst(0.18, 1200, 'bandpass', 0.5);
            }
        } else if (bossType === 'ABOMINATION') {
            playPitchSlide(80, 16, 0.55, 'sine', 0.85);
            playNoiseBurst(0.5, 300, 'lowpass', 0.75);
            playPitchSlide(220, 50, 0.35, 'sawtooth', 0.6);
        }
    } catch (e) {}
}

function playBossDeathSound(bossType, deathPhase) {
    if (!audioCtx || isMuted) return;
    try {
        if (bossType === 'HUNTER') {
            playPitchSlide(580, 90, 0.6, 'sawtooth', 0.7);
            playNoiseBurst(0.45, 1200, 'bandpass', 0.5);
        } else if (bossType === 'OMEGA') {
            playPitchSlide(280, 25, 0.8, 'sawtooth', 0.85);
            playNoiseBurst(0.65, 550, 'lowpass', 0.8);
            playSynthTone(60, 0.6, 'sine', 0.7);
        } else if (bossType === 'JUGGERNAUT') {
            playPitchSlide(110, 18, 0.75, 'sawtooth', 0.85);
            playNoiseBurst(0.6, 280, 'lowpass', 0.8);
            playSynthTone(220, 0.35, 'sine', 0.5);
        } else if (bossType === 'VALKYRIE') {
            playPitchSlide(1100, 120, 0.7, 'sawtooth', 0.8);
            playNoiseBurst(0.6, 600, 'lowpass', 0.85);
        } else if (bossType === 'SALAMANDER') {
            playPitchSlide(220, 30, 0.7, 'sawtooth', 0.8);
            playNoiseBurst(0.6, 400, 'lowpass', 0.75);
            playFMChirp(880, 50, 220, 0.4, 0.5);
        } else if (bossType === 'ABOMINATION') {
            playPitchSlide(300, 1200, 0.4, 'sawtooth', 0.7);
            playNoiseBurst(0.7, 350, 'lowpass', 0.9);
            playPitchSlide(75, 16, 0.8, 'sine', 0.85);
        }
    } catch (e) {}
}

// ============================================================================
// 1. TERRAIN HEIGHT FUNCTION
// ============================================================================
function getTerrainHeight(x, z) {
    const dist = Math.hypot(x, z);
    if (dist <= 6.8) return 0;
    
    const blend = Math.min(1.0, (dist - 6.8) / 3.5);
    const height = (Math.sin(x * 0.14) * Math.cos(z * 0.14) * 0.75) +
                   (Math.sin(x * 0.28 + z * 0.18) * 0.35);
    return height * blend;
}

function isPositionInCameraView(x, z, margin = 0.84) {
    if (!camera) return true;
    const p = new THREE.Vector3(x, getTerrainHeight(x, z) + 0.8, z);
    p.project(camera);
    return (p.x >= -margin && p.x <= margin && p.y >= -margin && p.y <= margin && p.z >= 0 && p.z <= 1);
}

function getVisibleSpitterStandoff(spawnAngle) {
    const sinA = Math.sin(spawnAngle); // Positive = South (closer to camera Z=22), Negative = North (far Z=-20)
    let minRange, maxRange;
    if (sinA > 0.25) {
        // South quadrant (closer to camera bottom viewport): range ~10.5m - 13.0m
        minRange = 10.5;
        maxRange = 13.0;
    } else if (sinA < -0.25) {
        // North quadrant (deep top viewport): range ~14.0m - 19.5m
        minRange = 14.0;
        maxRange = 19.5;
    } else {
        // East / West sides: range ~13.0m - 17.5m
        minRange = 13.0;
        maxRange = 17.5;
    }
    return minRange + Math.random() * (maxRange - minRange);
}

// ============================================================================
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    fetchDOMElements();

    try { setupThreeJS(); } catch (e) { console.error("[INIT] setupThreeJS failed:", e); }
    try { createLowPolyEnvironment(); } catch (e) { console.error("[INIT] createLowPolyEnvironment failed:", e); }
    try { createLowPolyTurret(); } catch (e) { console.error("[INIT] createLowPolyTurret failed:", e); }
    try { createAmbientParticles(); } catch (e) { console.error("[INIT] createAmbientParticles failed:", e); }

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKeyDown);

    // Audio context initialization on first user interaction
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });

    if (startBtn) startBtn.addEventListener('click', startGame);
    if (restartBtn) restartBtn.addEventListener('click', restartGame);
    if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
    if (resumeBtn) resumeBtn.addEventListener('click', togglePause);
    if (cinematicOverlay) cinematicOverlay.addEventListener('click', endBossCinematic);

    const soundBtn = document.getElementById('sound-btn');
    const pauseSoundBtn = document.getElementById('pause-sound-btn');
    if (soundBtn) soundBtn.addEventListener('click', toggleAudioMute);
    if (pauseSoundBtn) pauseSoundBtn.addEventListener('click', toggleAudioMute);

    // Leaderboard Event Listeners
    if (leaderboardHudBtn) leaderboardHudBtn.addEventListener('click', openLeaderboard);
    if (startLeaderboardBtn) startLeaderboardBtn.addEventListener('click', openLeaderboard);
    if (pauseLeaderboardBtn) pauseLeaderboardBtn.addEventListener('click', openLeaderboard);
    if (gameOverLeaderboardBtn) gameOverLeaderboardBtn.addEventListener('click', openLeaderboard);
    if (closeLeaderboardBtn) closeLeaderboardBtn.addEventListener('click', closeLeaderboard);
    if (clearLeaderboardBtn) clearLeaderboardBtn.addEventListener('click', clearLeaderboard);

    // Field Guide Event Listeners
    if (guideHudBtn) guideHudBtn.addEventListener('click', () => openFieldGuide('tab-turret'));
    if (startGuideBtn) startGuideBtn.addEventListener('click', () => openFieldGuide('tab-turret'));
    if (pauseGuideBtn) pauseGuideBtn.addEventListener('click', () => openFieldGuide('tab-turret'));
    if (gameOverGuideBtn) gameOverGuideBtn.addEventListener('click', () => openFieldGuide('tab-turret'));
    if (closeGuideBtn) closeGuideBtn.addEventListener('click', closeFieldGuide);

    // Field Guide Tabs
    document.querySelectorAll('.guide-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            switchGuideTab(tab);
        });
    });

    // Field Guide Threat Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            filterGuideThreats(filter);
        });
    });

    // High Score Submission
    if (submitScoreBtn) {
        submitScoreBtn.addEventListener('click', () => {
            const val = playerCallsignInput ? playerCallsignInput.value : 'COMMANDER';
            saveLeaderboardRecord(val, score, currentWave);
        });
    }
    if (playerCallsignInput) {
        playerCallsignInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveLeaderboardRecord(playerCallsignInput.value, score, currentWave);
            }
        });
    }

    // Pre-populate Threat Roster
    try { renderThreatRoster('all'); } catch (e) { console.error("[INIT] renderThreatRoster failed:", e); }

    animate();
}

function onKeyDown(event) {
    if (isCinematicActive && (event.code === 'Space' || event.key === ' ' || event.key === 'Escape' || event.code === 'Escape')) {
        endBossCinematic();
        return;
    }
    if (event.key === 'm' || event.key === 'M') {
        toggleAudioMute();
        return;
    }
    if (event.key === 'l' || event.key === 'L') {
        if (leaderboardModal && !leaderboardModal.classList.contains('hidden')) {
            closeLeaderboard();
        } else {
            openLeaderboard();
        }
        return;
    }
    if (event.key === 'g' || event.key === 'G') {
        if (guideModal && !guideModal.classList.contains('hidden')) {
            closeFieldGuide();
        } else {
            openFieldGuide('tab-turret');
        }
        return;
    }
    if (event.key === 'Escape' || event.code === 'Escape' || event.key === 'p' || event.key === 'P') {
        if (leaderboardModal && !leaderboardModal.classList.contains('hidden')) {
            closeLeaderboard();
            return;
        }
        if (guideModal && !guideModal.classList.contains('hidden')) {
            closeFieldGuide();
            return;
        }
        togglePause();
    }
}

function togglePause() {
    if (gameState === 'START' || gameState === 'GAMEOVER' || gameState === 'DEFEAT_OUTRO') return;
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        pauseOverlay.classList.remove('hidden');
    } else if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
        pauseOverlay.classList.add('hidden');
        clock.getDelta(); // Reset clock delta so no huge time jump occurs
    }
}

// ============================================================================
// 1.1 LEADERBOARD & CLASSIFIED HIGH SCORES SYSTEM
// ============================================================================
const DEFAULT_LEADERBOARD = [
    { rank: 1, name: "ALPHA-01", score: 18450, wave: 28, date: "2026-09-08" },
    { rank: 2, name: "SENTINEL", score: 14200, wave: 25, date: "2026-09-08" },
    { rank: 3, name: "VANGUARD", score: 9800, wave: 20, date: "2026-09-07" },
    { rank: 4, name: "OMEGA-DEF", score: 6500, wave: 15, date: "2026-09-07" },
    { rank: 5, name: "RECON-9", score: 3800, wave: 10, date: "2026-09-06" },
    { rank: 6, name: "GUARDIAN", score: 1900, wave: 5, date: "2026-09-05" }
];

// Persistent Leaderboard Key
const LEADERBOARD_STORAGE_KEY = 'outpost_omega_defense_leaderboard_v1';

// Helper to safely test if localStorage is supported and writable (handles incognito mode & iframe sandboxes)
function isLocalStorageAvailable() {
    try {
        if (typeof window === 'undefined' || !window.localStorage) return false;
        const testKey = '__omega_storage_test__';
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
}

// Load saved leaderboard records from localStorage, or return default classified records
function loadSavedLeaderboard() {
    if (isLocalStorageAvailable()) {
        try {
            const raw = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn("[Leaderboard] Stored data could not be parsed, using defaults.", e);
        }
    }
    return JSON.parse(JSON.stringify(DEFAULT_LEADERBOARD));
}

// Safely persist leaderboard records to localStorage (no-op in incognito mode if storage is restricted)
function persistLeaderboard(data) {
    if (isLocalStorageAvailable()) {
        try {
            window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn("[Leaderboard] Unable to persist to localStorage (Incognito / QuotaExceeded / Restricted sandbox):", e);
        }
    }
}

// Active leaderboard data (initialized from localStorage with in-memory fallback)
let sessionLeaderboard = loadSavedLeaderboard();

function getLeaderboard() {
    return sessionLeaderboard;
}

function saveLeaderboardRecord(name, scoreVal, waveVal) {
    const cleanName = (name || 'COMMANDER').trim().toUpperCase().slice(0, 12) || 'COMMANDER';
    const today = new Date().toISOString().split('T')[0];
    sessionLeaderboard.push({
        rank: 0,
        name: cleanName,
        score: Math.max(0, parseInt(scoreVal) || 0),
        wave: Math.max(1, parseInt(waveVal) || 1),
        date: today
    });

    // Sort descending by score, then wave
    sessionLeaderboard.sort((a, b) => b.score - a.score || b.wave - a.wave);

    // Re-rank and cap at top 10
    sessionLeaderboard = sessionLeaderboard.slice(0, 10).map((entry, idx) => {
        entry.rank = idx + 1;
        return entry;
    });

    // Persist to local storage
    persistLeaderboard(sessionLeaderboard);

    renderLeaderboard();
    if (saveStatusMsg) {
        saveStatusMsg.textContent = `✓ RECORD SAVED FOR ${cleanName}!`;
        setTimeout(() => { if (saveStatusMsg) saveStatusMsg.textContent = ''; }, 3000);
    }
}

function renderLeaderboard() {
    if (!leaderboardTbody) return;
    const list = getLeaderboard();
    leaderboardTbody.innerHTML = '';

    list.forEach(entry => {
        const tr = document.createElement('tr');
        let badgeClass = 'rank-default';
        if (entry.rank === 1) badgeClass = 'rank-gold';
        else if (entry.rank === 2) badgeClass = 'rank-silver';
        else if (entry.rank === 3) badgeClass = 'rank-bronze';

        tr.innerHTML = `
            <td><span class="rank-badge ${badgeClass}">${entry.rank}</span></td>
            <td><span class="callsign-text">${escapeHTML(entry.name)}</span></td>
            <td><span class="score-text">${entry.score.toLocaleString()}</span></td>
            <td><strong style="color: #38bdf8;">Wave ${entry.wave}</strong></td>
            <td style="color: #94a3b8; font-size: 12px;">${entry.date || '---'}</td>
        `;
        leaderboardTbody.appendChild(tr);
    });
}

function clearLeaderboard() {
    if (confirm("Reset all leaderboard defense records to classified defaults?")) {
        sessionLeaderboard = JSON.parse(JSON.stringify(DEFAULT_LEADERBOARD));
        if (isLocalStorageAvailable()) {
            try {
                window.localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
            } catch (e) {
                console.warn("[Leaderboard] Failed to clear localStorage:", e);
            }
        }
        renderLeaderboard();
    }
}

let leaderboardPreviousState = null;

function openLeaderboard() {
    if (gameState === 'PLAYING') {
        leaderboardPreviousState = 'PLAYING';
        gameState = 'PAUSED';
    } else {
        leaderboardPreviousState = gameState;
    }
    renderLeaderboard();
    if (leaderboardModal) leaderboardModal.classList.remove('hidden');
}

function closeLeaderboard() {
    if (leaderboardModal) leaderboardModal.classList.add('hidden');
    if (leaderboardPreviousState === 'PAUSED' || gameState === 'PAUSED') {
        if (pauseOverlay) pauseOverlay.classList.remove('hidden');
    } else if (leaderboardPreviousState === 'PLAYING') {
        gameState = 'PLAYING';
        clock.getDelta();
    }
}

function escapeHTML(str) {
    return String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

// ============================================================================
// 1.2 TACTICAL FIELD GUIDE & THREAT ROSTER DISCOVERY SYSTEM
// ============================================================================
const THREAT_DATABASE = [
    // Standard Zombies (10)
    {
        id: 'walker',
        name: 'INFECTED WALKER',
        subtitle: 'Standard Biped Swarm',
        category: 'standard',
        tag: 'tag-cyan',
        tier: 'LOW',
        hp: '2 HP',
        speed: '2.8 m/s',
        damage: '5 Dmg',
        desc: 'Shambling baseline infected. Moves in loose clusters toward bunker defenses. Low threat individually, dangerous in swarms.',
        weakness: 'Controlled bursts to chest / head. Frequently carries Nanite Repair packs.'
    },
    {
        id: 'runner',
        name: 'FERAL RUNNER',
        subtitle: 'High-Velocity Sprinter',
        category: 'standard',
        tag: 'tag-amber',
        tier: 'MODERATE',
        hp: '1 HP',
        speed: '5.2 m/s',
        damage: '3 Dmg',
        desc: 'Hyperactive feral mutant sprint-charging at extreme velocity. Closes perimeter distance rapidly to overwhelm defenses.',
        weakness: '1 bullet to eliminate. Keep leading your aim ahead of their sprint trajectory.'
    },
    {
        id: 'tank',
        name: 'GORE TANK',
        subtitle: 'Bloated Siege Biped',
        category: 'standard',
        tag: 'tag-purple',
        tier: 'HIGH',
        hp: '8 HP',
        speed: '1.6 m/s',
        damage: '14 Dmg',
        desc: 'Massive bloated bio-mass with immense sponge durability. Smashes obstacles in its path and pushes other zombies aside.',
        weakness: 'Heavy bullet sponge. Focus sustained fire or Quad Overdrive to clear.'
    },
    {
        id: 'hound',
        name: 'MUTANT HOUND',
        subtitle: 'Quadruped Flanker',
        category: 'standard',
        tag: 'tag-red',
        tier: 'MODERATE',
        hp: '2 HP',
        speed: '5.8 m/s',
        damage: '4 Dmg',
        desc: 'Rabid quadruped canine predator. Extremely fast perimeter rusher with low profile agility.',
        weakness: 'Aim low at ground level. Dies in 2 direct hits.'
    },
    {
        id: 'seeker',
        name: 'SEEKER ASSASSIN',
        subtitle: 'Heavy Striker',
        category: 'standard',
        tag: 'tag-purple',
        tier: 'HIGH',
        hp: '2 HP',
        speed: '4.8 m/s',
        damage: '10 Dmg',
        desc: 'Relentless assassin infected charging at high speed. Deals double lethal strike damage on bunker contact (10 dmg).',
        weakness: 'High priority target! Eliminate before it reaches bunker radius.'
    },
    {
        id: 'spitter',
        name: 'ACID SPITTER',
        subtitle: 'Long-Range Bio-Artillery',
        category: 'standard',
        tag: 'tag-green',
        tier: 'HIGH',
        hp: '3 HP',
        speed: '2.2 m/s',
        damage: '8 Dmg',
        desc: 'Mutated caustic artillery infected. Halts at perimeter and fires glowing green acidic globes at the bunker.',
        weakness: 'Intercept its acid projectiles in mid-air or take it down before it spits.'
    },
    {
        id: 'phantom',
        name: 'PHANTOM WEAVER',
        subtitle: 'Evasive Shadow Biped',
        category: 'standard',
        tag: 'tag-cyan',
        tier: 'HIGH',
        hp: '2 HP',
        speed: '4.6 m/s',
        damage: '7 Dmg',
        desc: 'Cloaked dark entity weaving laterally in serpentine patterns to dodge incoming turret fire.',
        weakness: 'Track lateral bobbing movements or use Quad Overdrive spread to sweep.'
    },
    {
        id: 'crawler',
        name: 'GROUND CRAWLER',
        subtitle: 'Low-Profile Ambusher',
        category: 'standard',
        tag: 'tag-amber',
        tier: 'LOW',
        hp: '1 HP',
        speed: '4.4 m/s',
        damage: '3 Dmg',
        desc: 'Legless low mutant scuttling along the terrain beneath main line of fire.',
        weakness: 'Aim turret downward. 1 direct hit destroys it.'
    },
    {
        id: 'brute',
        name: 'GORE BRUTE',
        subtitle: 'Reinforced Bone Shield',
        category: 'standard',
        tag: 'tag-purple',
        tier: 'EXTREME',
        hp: '12 HP',
        speed: '2.0 m/s',
        damage: '12 Dmg',
        desc: 'Heavy mutant bruiser wielding an armored bone shield slab. Reduces incoming frontal damage by 70%.',
        weakness: 'Flank its unprotected right side or break its guard with Quad Overdrive!'
    },
    {
        id: 'screamer',
        name: 'BLIGHT SCREAMER',
        subtitle: 'Psychic Acoustic Shockwave',
        category: 'standard',
        tag: 'tag-purple',
        tier: 'EXTREME',
        hp: '4 HP',
        speed: '3.0 m/s',
        damage: '6 Dmg',
        desc: 'Unstable psychic mutation emitting expanding purple sonic shockwaves that pass through normal bullets.',
        weakness: 'Quad Overdrive bullets can intercept & destroy sonic screech rings!'
    },

    // Zombie Animals (3)
    {
        id: 'stag',
        name: 'ZOMBIE STAG / DEER',
        subtitle: 'Bounding Cervid Predator (Wave 11+)',
        category: 'animal',
        tag: 'tag-amber',
        tier: 'HIGH',
        hp: '2 HP',
        speed: '5.4 m/s',
        damage: '5 Dmg',
        desc: 'Skeletal stag with jagged bone antlers. Performs high dynamic bounding leaps over perimeter obstacles.',
        weakness: 'Anticipate jump trajectory and time shots during apex of bounding leaps.'
    },
    {
        id: 'horse',
        name: 'ZOMBIE HORSE / STALLION',
        subtitle: 'Trampling Heavy Beast (Wave 14+)',
        category: 'animal',
        tag: 'tag-gold',
        tier: 'HIGH',
        hp: '4 HP',
        speed: '5.0 m/s',
        damage: '9 Dmg',
        desc: 'Massive mutated steed possessing immense charge momentum. Smashes obstacles in its path without deflection.',
        weakness: 'Concentrate steady fire along its straight charge path before it reaches ramming speed.'
    },
    {
        id: 'bear',
        name: 'ZOMBIE BEAR / URSINE',
        subtitle: 'Armored Grizzled Colossus (Wave 16+)',
        category: 'animal',
        tag: 'tag-red',
        tier: 'EXTREME',
        hp: '12 HP',
        speed: '2.4 m/s (4.45 Enraged)',
        damage: '15 Dmg',
        desc: 'Massive apex predator with thick grizzled pelt absorbing 55% frontal damage. Instantly enrages and charges at high speed when shot.',
        weakness: 'Heavy threat! Requires 3-4 Quad Overdrive volleys. Keep distance and prioritize targeting.'
    },

    // Apex Bosses (6)
    {
        id: 'hunter',
        name: 'THE HUNTER (WAVE 5)',
        subtitle: 'Shadow Camouflage Predator',
        category: 'boss',
        tag: 'tag-purple',
        tier: 'APEX BOSS',
        hp: '75+ HP',
        speed: '3.8 m/s',
        damage: '22 Dmg',
        desc: 'Feral camouflaged predator blending into wasteland fog. Circles the perimeter before acrobatically leaping over bunker defenses.',
        weakness: 'Track dust trails while it circles, then fire burst salvos as it lands its leap.'
    },
    {
        id: 'omega',
        name: 'THE OMEGA (WAVE 10)',
        subtitle: 'Giant Terrestrial Lizard Colossus',
        category: 'boss',
        tag: 'tag-green',
        tier: 'APEX BOSS',
        hp: '220+ HP',
        speed: '3.4 m/s',
        damage: '24 Dmg',
        desc: 'Massive terrestrial reptilian colossus with razor-sharp snapping jaws, sweeping tail whip, and devastating Primal Roar ultimate.',
        weakness: 'STAGGER MECHANIC: When it rears up to roar, land 5 firepower hits to stagger it for 2.2s and drop resource crates!'
    },
    {
        id: 'juggernaut',
        name: 'JUGGERNAUT (WAVE 15)',
        subtitle: 'Armored Gore Bull Colossus',
        category: 'boss',
        tag: 'tag-purple',
        tier: 'APEX BOSS',
        hp: '250+ HP',
        speed: '2.2 m/s',
        damage: '25 Dmg',
        desc: 'Heavy armored gore bull with reinforced frontal bone horn shield. Smashes through obstacles and deflects 60% frontal fire.',
        weakness: '2x CRITICAL DAMAGE: Aim for its unprotected sides and rear flanks for 2x critical damage.'
    },
    {
        id: 'valkyrie',
        name: 'VALKYRIE (WAVE 20)',
        subtitle: 'Obsidian Shadow Aerial Empress',
        category: 'boss',
        tag: 'tag-gold',
        tier: 'APEX BOSS',
        hp: '235+ HP',
        speed: 'High Aerial',
        damage: '28 Dmg',
        desc: 'Winged aerial predator armed with amber energy needles. Circles high in the fog before executing lethal dive-bomb assaults.',
        weakness: 'DIVE-BOMB STAGGER: Shoot down incoming feather needles and concentrate fire during dive-bomb to stagger!'
    },
    {
        id: 'salamander',
        name: 'THE SALAMANDER (WAVE 25)',
        subtitle: 'Spined Carapace Armored Colossus',
        category: 'boss',
        tag: 'tag-red',
        tier: 'APEX BOSS',
        hp: '350+ HP',
        speed: '2.6 m/s',
        damage: '16 Dmg',
        desc: 'Armored colossus with a hardened 60% damage-resistant carapace. Performs tail swipes, fanged bite, and Seismic Stomp.',
        weakness: 'STOMP STAGGER: Land 5 firepower hits (or 2 weakpoint crits) during Seismic Stomp rearing to stagger it for 2.2s and drop crates!'
    },
    {
        id: 'abomination',
        name: 'THE ABOMINATION (WAVE 30+)',
        subtitle: 'Titanic Bio-Plasma Colossus',
        category: 'boss',
        tag: 'tag-purple',
        tier: 'APEX COLOSSUS',
        hp: '540+ HP',
        speed: '1.8 m/s',
        damage: '30 Dmg',
        desc: 'Titanic mutated titan. Pounding footsteps cause tremors, lobs explosive boulders, and ruptures with unstable plasma energy.',
        weakness: 'Shoot down incoming boulders in flight. Target exposed chest core for critical damage.'
    }
];

// Threat discovery set: Walker is unlocked by default, all others discovered upon combat encounter
let discoveredThreats = new Set(['walker']);

function unlockThreat(id) {
    if (!id) return;
    const cleanId = id.toLowerCase();
    if (!discoveredThreats.has(cleanId)) {
        discoveredThreats.add(cleanId);
        const threatData = THREAT_DATABASE.find(t => t.id === cleanId);
        const name = threatData ? threatData.name : cleanId.toUpperCase();
        showDeclassifyToast(name);
        if (guideModal && !guideModal.classList.contains('hidden')) {
            const activeFilterBtn = document.querySelector('.filter-btn.active');
            const currentFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
            renderThreatRoster(currentFilter);
        }
    }
}

function showDeclassifyToast(threatName) {
    const toast = document.createElement('div');
    toast.className = 'declassify-toast';
    toast.innerHTML = `<span>📡</span><span>NEW THREAT DECLASSIFIED: <strong>${threatName}</strong></span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
    }, 4000);
}

function getThreatArtworkSVG(id, isDiscovered) {
    if (!isDiscovered) {
        return `
            <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                <circle cx="100" cy="55" r="40" fill="none" stroke="#ef4444" stroke-width="1.2" stroke-dasharray="4,4" opacity="0.6"/>
                <line x1="100" y1="10" x2="100" y2="100" stroke="#ef4444" stroke-width="0.8" opacity="0.4"/>
                <line x1="50" y1="55" x2="150" y2="55" stroke="#ef4444" stroke-width="0.8" opacity="0.4"/>
                <path d="M 85 85 L 90 55 L 82 45 L 88 40 L 95 48 L 98 32 L 102 32 L 105 48 L 112 40 L 118 45 L 110 55 L 115 85 Z" fill="#1e1520" stroke="#37202b" stroke-width="1"/>
                <rect x="91" y="48" width="18" height="15" rx="3" fill="#ef4444" />
                <path d="M 94 48 L 94 41 A 6 6 0 0 1 106 41 L 106 48" fill="none" stroke="#ef4444" stroke-width="2.5" />
                <circle cx="100" cy="54" r="2" fill="#000"/>
                <text x="100" y="95" fill="#fca5a5" font-family="monospace" font-weight="bold" font-size="9" text-anchor="middle" letter-spacing="1.5">CLASSIFIED INTEL</text>
            </svg>
        `;
    }

    switch (id) {
        case 'walker':
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <defs>
                        <linearGradient id="wGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="#10b981"/>
                            <stop offset="100%" stop-color="#047857"/>
                        </linearGradient>
                    </defs>
                    <ellipse cx="100" cy="98" rx="35" ry="8" fill="#000" opacity="0.4"/>
                    <line x1="92" y1="70" x2="88" y2="95" stroke="#334155" stroke-width="5" stroke-linecap="round"/>
                    <line x1="108" y1="70" x2="114" y2="95" stroke="#334155" stroke-width="5" stroke-linecap="round"/>
                    <polygon points="86,40 114,40 110,72 90,72" fill="#475569" stroke="#64748b" stroke-width="1.5"/>
                    <circle cx="94" cy="55" r="4" fill="url(#wGrad)"/>
                    <circle cx="106" cy="62" r="3" fill="url(#wGrad)"/>
                    <line x1="88" y1="45" x2="68" y2="52" stroke="url(#wGrad)" stroke-width="4.5" stroke-linecap="round"/>
                    <line x1="112" y1="45" x2="132" y2="50" stroke="url(#wGrad)" stroke-width="4.5" stroke-linecap="round"/>
                    <circle cx="100" cy="28" r="12" fill="url(#wGrad)" stroke="#34d399" stroke-width="1"/>
                    <circle cx="96" cy="27" r="1.8" fill="#ef4444"/>
                    <circle cx="104" cy="27" r="1.8" fill="#ef4444"/>
                    <line x1="97" y1="34" x2="103" y2="34" stroke="#1e293b" stroke-width="1.5"/>
                </svg>
            `;
        case 'runner':
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <defs>
                        <linearGradient id="rGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#fbbf24"/>
                            <stop offset="100%" stop-color="#ea580c"/>
                        </linearGradient>
                    </defs>
                    <line x1="35" y1="40" x2="70" y2="40" stroke="#f59e0b" stroke-width="2" stroke-dasharray="8,5" opacity="0.6"/>
                    <line x1="45" y1="65" x2="85" y2="65" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="10,6" opacity="0.7"/>
                    <line x1="25" y1="85" x2="75" y2="85" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6,4" opacity="0.5"/>
                    <line x1="90" y1="65" x2="60" y2="88" stroke="#9a3412" stroke-width="4.5" stroke-linecap="round"/>
                    <line x1="110" y1="60" x2="145" y2="82" stroke="#ea580c" stroke-width="4.5" stroke-linecap="round"/>
                    <polygon points="90,38 120,44 110,68 82,62" fill="url(#rGrad)" stroke="#fed7aa" stroke-width="1.5"/>
                    <line x1="92" y1="42" x2="65" y2="30" stroke="#f97316" stroke-width="3.5" stroke-linecap="round"/>
                    <line x1="118" y1="46" x2="152" y2="38" stroke="#f97316" stroke-width="3.5" stroke-linecap="round"/>
                    <circle cx="126" cy="34" r="10" fill="url(#rGrad)" stroke="#fde047" stroke-width="1"/>
                    <circle cx="130" cy="32" r="2" fill="#fff"/>
                    <circle cx="130" cy="32" r="1" fill="#f59e0b"/>
                </svg>
            `;
        case 'tank':
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <defs>
                        <linearGradient id="tGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="#a855f7"/>
                            <stop offset="100%" stop-color="#4c1d95"/>
                        </linearGradient>
                    </defs>
                    <ellipse cx="100" cy="100" rx="42" ry="7" fill="#000" opacity="0.5"/>
                    <rect x="76" y="68" width="18" height="30" rx="4" fill="#3b0764" stroke="#7e22ce" stroke-width="1.5"/>
                    <rect x="106" y="68" width="18" height="30" rx="4" fill="#3b0764" stroke="#7e22ce" stroke-width="1.5"/>
                    <polygon points="62,35 138,35 125,75 75,75" fill="url(#tGrad)" stroke="#c084fc" stroke-width="2"/>
                    <polygon points="62,35 50,22 68,28" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
                    <polygon points="138,35 150,22 132,28" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
                    <rect x="48" y="38" width="18" height="38" rx="5" fill="#581c87" stroke="#9333ea" stroke-width="1.5"/>
                    <rect x="134" y="38" width="18" height="38" rx="5" fill="#581c87" stroke="#9333ea" stroke-width="1.5"/>
                    <circle cx="100" cy="30" r="11" fill="#6b21a8" stroke="#c084fc" stroke-width="1.5"/>
                    <circle cx="96" cy="29" r="1.5" fill="#ef4444"/>
                    <circle cx="104" cy="29" r="1.5" fill="#ef4444"/>
                </svg>
            `;
        case 'hound':
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <defs>
                        <linearGradient id="hGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#b91c1c"/>
                            <stop offset="100%" stop-color="#ef4444"/>
                        </linearGradient>
                    </defs>
                    <ellipse cx="100" cy="96" rx="45" ry="6" fill="#000" opacity="0.4"/>
                    <polygon points="65,55 135,48 145,66 75,72" fill="url(#hGrad)" stroke="#fca5a5" stroke-width="1.5"/>
                    <polygon points="80,53 85,42 90,52" fill="#fee2e2"/>
                    <polygon points="95,51 100,40 105,50" fill="#fee2e2"/>
                    <polygon points="110,49 115,38 120,48" fill="#fee2e2"/>
                    <polygon points="135,48 162,38 152,58 135,58" fill="#991b1b" stroke="#ef4444" stroke-width="1.5"/>
                    <polygon points="152,47 156,53 150,53" fill="#ffffff"/>
                    <circle cx="145" cy="45" r="2" fill="#fde047"/>
                    <line x1="72" y1="70" x2="60" y2="92" stroke="#7f1d1d" stroke-width="4" stroke-linecap="round"/>
                    <line x1="82" y1="70" x2="78" y2="92" stroke="#991b1b" stroke-width="4" stroke-linecap="round"/>
                    <line x1="125" y1="62" x2="132" y2="92" stroke="#991b1b" stroke-width="4" stroke-linecap="round"/>
                    <line x1="140" y1="62" x2="155" y2="88" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/>
                </svg>
            `;
        case 'seeker':
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <defs>
                        <linearGradient id="sGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="#00f0ff"/>
                            <stop offset="100%" stop-color="#8b5cf6"/>
                        </linearGradient>
                    </defs>
                    <path d="M 60 20 L 75 10 L 90 20" fill="none" stroke="#00f0ff" stroke-width="1.5" opacity="0.7"/>
                    <path d="M 110 20 L 125 10 L 140 20" fill="none" stroke="#00f0ff" stroke-width="1.5" opacity="0.7"/>
                    <polygon points="100,18 112,55 100,85 88,55" fill="#1e1b4b" stroke="#00f0ff" stroke-width="1.5"/>
                    <polygon points="100,35 45,30 75,55 94,48" fill="url(#sGrad)" stroke="#a5f3fc" stroke-width="1.5"/>
                    <polygon points="100,35 155,30 125,55 106,48" fill="url(#sGrad)" stroke="#a5f3fc" stroke-width="1.5"/>
                    <circle cx="100" cy="28" r="4" fill="#00f0ff"/>
                    <circle cx="100" cy="28" r="2" fill="#fff"/>
                    <line x1="100" y1="85" x2="100" y2="102" stroke="#00f0ff" stroke-width="2" stroke-dasharray="3,3"/>
                </svg>
            `;
        case 'spitter':
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <defs>
                        <linearGradient id="spitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#86efac"/>
                            <stop offset="50%" stop-color="#22c55e"/>
                            <stop offset="100%" stop-color="#15803d"/>
                        </linearGradient>
                    </defs>
                    <ellipse cx="90" cy="98" rx="36" ry="6" fill="#000" opacity="0.4"/>
                    <polygon points="68,52 105,48 115,75 75,78" fill="#1e3a29" stroke="#22c55e" stroke-width="1.5"/>
                    <line x1="72" y1="76" x2="65" y2="95" stroke="#14532d" stroke-width="4.5" stroke-linecap="round"/>
                    <line x1="105" y1="74" x2="112" y2="95" stroke="#14532d" stroke-width="4.5" stroke-linecap="round"/>
                    <ellipse cx="120" cy="38" rx="16" ry="14" fill="url(#spitGrad)" stroke="#bbf7d0" stroke-width="2"/>
                    <circle cx="116" cy="35" r="3" fill="#ffffff" opacity="0.6"/>
                    <circle cx="148" cy="26" r="4.5" fill="#4ade80" stroke="#bbf7d0" stroke-width="1"/>
                    <circle cx="165" cy="20" r="3.5" fill="#4ade80"/>
                    <circle cx="132" cy="55" r="2.5" fill="#22c55e"/>
                    <circle cx="138" cy="68" r="2" fill="#22c55e"/>
                    <circle cx="125" cy="28" r="1.5" fill="#ef4444"/>
                </svg>
            `;
        case 'phantom':
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <defs>
                        <linearGradient id="phGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#06b6d4"/>
                            <stop offset="50%" stop-color="#8b5cf6"/>
                            <stop offset="100%" stop-color="#06b6d4"/>
                        </linearGradient>
                    </defs>
                    <path d="M 60 30 Q 75 55 65 85 Q 85 55 75 30 Z" fill="#06b6d4" opacity="0.2"/>
                    <path d="M 135 30 Q 120 55 130 85 Q 110 55 120 30 Z" fill="#8b5cf6" opacity="0.2"/>
                    <path d="M 45 60 L 75 40 L 125 70 L 155 50" fill="none" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.7"/>
                    <path d="M 100 20 Q 118 45 110 82 Q 100 70 90 82 Q 82 45 100 20 Z" fill="#0f172a" stroke="url(#phGrad)" stroke-width="2"/>
                    <circle cx="96" cy="30" r="2" fill="#c084fc"/>
                    <circle cx="104" cy="30" r="2" fill="#c084fc"/>
                </svg>
            `;
        case 'crawler':
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <defs>
                        <linearGradient id="crawGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#f59e0b"/>
                            <stop offset="100%" stop-color="#b45309"/>
                        </linearGradient>
                    </defs>
                    <ellipse cx="100" cy="90" rx="55" ry="7" fill="#000" opacity="0.5"/>
                    <circle cx="50" cy="85" r="4" fill="#64748b" opacity="0.4"/>
                    <circle cx="65" cy="82" r="6" fill="#64748b" opacity="0.3"/>
                    <polygon points="65,72 130,62 135,82 70,85" fill="url(#crawGrad)" stroke="#fcd34d" stroke-width="1.5"/>
                    <path d="M 120 66 L 150 68 L 165 85" fill="none" stroke="#d97706" stroke-width="4.5" stroke-linecap="round"/>
                    <path d="M 100 68 L 130 75 L 142 88" fill="none" stroke="#b45309" stroke-width="4.5" stroke-linecap="round"/>
                    <circle cx="138" cy="58" r="10" fill="#92400e" stroke="#f59e0b" stroke-width="1.5"/>
                    <circle cx="142" cy="56" r="1.8" fill="#ef4444"/>
                </svg>
            `;
        case 'brute':
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <defs>
                        <linearGradient id="bruteShield" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#f1f5f9"/>
                            <stop offset="50%" stop-color="#94a3b8"/>
                            <stop offset="100%" stop-color="#475569"/>
                        </linearGradient>
                    </defs>
                    <ellipse cx="100" cy="98" rx="42" ry="7" fill="#000" opacity="0.5"/>
                    <polygon points="75,32 135,35 125,75 80,75" fill="#581c87" stroke="#a855f7" stroke-width="2"/>
                    <rect x="78" y="74" width="16" height="24" rx="3" fill="#3b0764"/>
                    <rect x="110" y="74" width="16" height="24" rx="3" fill="#3b0764"/>
                    <polygon points="50,20 85,25 78,85 45,78" fill="url(#bruteShield)" stroke="#cbd5e1" stroke-width="2"/>
                    <line x1="52" y1="40" x2="80" y2="44" stroke="#334155" stroke-width="1.5"/>
                    <line x1="48" y1="60" x2="76" y2="64" stroke="#334155" stroke-width="1.5"/>
                    <rect x="130" y="40" width="15" height="35" rx="4" fill="#3b0764" stroke="#a855f7" stroke-width="1.5"/>
                    <polygon points="138,75 133,90 148,85" fill="#f87171"/>
                    <circle cx="105" cy="26" r="11" fill="#7e22ce" stroke="#c084fc" stroke-width="1.5"/>
                    <circle cx="108" cy="25" r="1.8" fill="#ef4444"/>
                </svg>
            `;
        case 'screamer':
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <circle cx="135" cy="40" r="18" fill="none" stroke="#d946ef" stroke-width="2" opacity="0.8"/>
                    <circle cx="135" cy="40" r="32" fill="none" stroke="#c084fc" stroke-width="2" stroke-dasharray="6,4" opacity="0.6"/>
                    <circle cx="135" cy="40" r="48" fill="none" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.4"/>
                    <polygon points="80,45 105,42 98,85 85,85" fill="#4c1d95" stroke="#c084fc" stroke-width="1.5"/>
                    <line x1="86" y1="85" x2="82" y2="98" stroke="#3b0764" stroke-width="4"/>
                    <line x1="96" y1="85" x2="102" y2="98" stroke="#3b0764" stroke-width="4"/>
                    <circle cx="105" cy="30" r="12" fill="#6b21a8" stroke="#e879f9" stroke-width="1.5"/>
                    <ellipse cx="114" cy="35" rx="8" ry="6" fill="#1e1b4b" stroke="#f43f5e" stroke-width="1.5"/>
                    <polygon points="102,18 105,8 108,18" fill="#e879f9"/>
                    <polygon points="95,20 93,12 99,19" fill="#e879f9"/>
                </svg>
            `;
        case 'stag':
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <defs>
                        <linearGradient id="stagGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#b45309"/>
                            <stop offset="100%" stop-color="#f59e0b"/>
                        </linearGradient>
                    </defs>
                    <path d="M 40 90 Q 100 25 160 85" fill="none" stroke="#fbbf24" stroke-width="1" stroke-dasharray="4,4" opacity="0.4"/>
                    <polygon points="75,55 125,45 135,62 82,68" fill="url(#stagGrad)" stroke="#fde68a" stroke-width="1.5"/>
                    <line x1="82" y1="65" x2="60" y2="82" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
                    <line x1="88" y1="65" x2="70" y2="88" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
                    <line x1="120" y1="58" x2="145" y2="78" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
                    <line x1="128" y1="58" x2="152" y2="72" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
                    <polygon points="125,45 142,32 135,48" fill="#92400e" stroke="#fbbf24" stroke-width="1"/>
                    <circle cx="136" cy="38" r="1.5" fill="#ef4444"/>
                    <path d="M 132 32 L 126 12 L 120 18 M 126 12 L 132 8 M 128 22 L 120 22" fill="none" stroke="#fef08a" stroke-width="2" stroke-linecap="round"/>
                    <path d="M 136 30 L 145 12 L 152 18 M 145 12 L 142 6 M 140 20 L 148 20" fill="none" stroke="#fef08a" stroke-width="2" stroke-linecap="round"/>
                </svg>
            `;
        case 'horse':
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <defs>
                        <linearGradient id="horseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#334155"/>
                            <stop offset="100%" stop-color="#1e293b"/>
                        </linearGradient>
                    </defs>
                    <ellipse cx="100" cy="98" rx="50" ry="7" fill="#000" opacity="0.4"/>
                    <polygon points="60,50 135,42 142,70 70,75" fill="url(#horseGrad)" stroke="#64748b" stroke-width="2"/>
                    <line x1="68" y1="72" x2="55" y2="95" stroke="#0f172a" stroke-width="5" stroke-linecap="round"/>
                    <line x1="82" y1="72" x2="75" y2="95" stroke="#334155" stroke-width="5" stroke-linecap="round"/>
                    <line x1="125" y1="65" x2="135" y2="95" stroke="#334155" stroke-width="5" stroke-linecap="round"/>
                    <line x1="138" y1="65" x2="155" y2="92" stroke="#0f172a" stroke-width="5" stroke-linecap="round"/>
                    <polygon points="125,45 152,25 165,42 138,55" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
                    <path d="M 124 42 L 128 30 L 135 44 L 140 28 L 148 40" fill="none" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="152" cy="32" r="2" fill="#ef4444"/>
                    <circle cx="162" cy="38" r="1.8" fill="#f59e0b"/>
                </svg>
            `;
        case 'bear':
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <defs>
                        <linearGradient id="bearPelt" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#78350f"/>
                            <stop offset="60%" stop-color="#451a03"/>
                            <stop offset="100%" stop-color="#1c1917"/>
                        </linearGradient>
                    </defs>
                    <ellipse cx="100" cy="100" rx="46" ry="7" fill="#000" opacity="0.5"/>
                    <polygon points="60,45 130,35 142,80 65,82" fill="url(#bearPelt)" stroke="#b45309" stroke-width="2"/>
                    <rect x="68" y="75" width="20" height="22" rx="4" fill="#292524" stroke="#78350f" stroke-width="1.5"/>
                    <rect x="115" y="75" width="20" height="22" rx="4" fill="#292524" stroke="#78350f" stroke-width="1.5"/>
                    <polygon points="135,45 162,28 155,55" fill="#451a03" stroke="#b45309" stroke-width="1.5"/>
                    <line x1="162" y1="28" x2="170" y2="24" stroke="#fca5a5" stroke-width="2"/>
                    <line x1="164" y1="32" x2="172" y2="30" stroke="#fca5a5" stroke-width="2"/>
                    <circle cx="138" cy="40" r="15" fill="#451a03" stroke="#d97706" stroke-width="1.5"/>
                    <polygon points="144,38 158,44 146,50" fill="#1c1917" stroke="#ef4444" stroke-width="1.5"/>
                    <polygon points="147,40 151,43 147,44" fill="#fff"/>
                    <circle cx="140" cy="35" r="2" fill="#ef4444"/>
                </svg>
            `;
        case 'hunter':
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <defs>
                        <radialGradient id="fogAura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#a855f7" stop-opacity="0.3"/>
                            <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
                        </radialGradient>
                    </defs>
                    <ellipse cx="100" cy="60" rx="60" ry="35" fill="url(#fogAura)"/>
                    <polygon points="80,50 120,45 115,75 85,75" fill="#2e1065" stroke="#a855f7" stroke-width="2"/>
                    <path d="M 85 70 L 68 85 L 80 96" fill="none" stroke="#581c87" stroke-width="4" stroke-linecap="round"/>
                    <path d="M 115 70 L 132 85 L 120 96" fill="none" stroke="#581c87" stroke-width="4" stroke-linecap="round"/>
                    <circle cx="100" cy="34" r="12" fill="#3b0764" stroke="#c084fc" stroke-width="1.5"/>
                    <line x1="92" y1="34" x2="98" y2="34" stroke="#a855f7" stroke-width="2.5" stroke-linecap="round"/>
                    <line x1="102" y1="34" x2="108" y2="34" stroke="#a855f7" stroke-width="2.5" stroke-linecap="round"/>
                    <path d="M 50 45 Q 100 15 150 45" fill="none" stroke="#c084fc" stroke-width="1.2" stroke-dasharray="4,4"/>
                </svg>
            `;
        case 'omega':
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <defs>
                        <linearGradient id="omegaScales" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#047857"/>
                            <stop offset="50%" stop-color="#065f46"/>
                            <stop offset="100%" stop-color="#064e3b"/>
                        </linearGradient>
                    </defs>
                    <ellipse cx="100" cy="98" rx="55" ry="7" fill="#000" opacity="0.5"/>
                    <polygon points="50,55 130,42 145,78 60,82" fill="url(#omegaScales)" stroke="#34d399" stroke-width="2"/>
                    <polygon points="65,53 72,38 78,52" fill="#10b981"/>
                    <polygon points="85,49 92,34 98,48" fill="#10b981"/>
                    <polygon points="105,45 112,30 118,44" fill="#10b981"/>
                    <path d="M 50 60 Q 25 65 15 80" fill="none" stroke="#047857" stroke-width="7" stroke-linecap="round"/>
                    <polygon points="130,44 172,32 158,58 135,56" fill="#064e3b" stroke="#34d399" stroke-width="2"/>
                    <polygon points="145,40 148,46 152,40" fill="#fff"/>
                    <polygon points="156,36 159,43 163,37" fill="#fff"/>
                    <circle cx="140" cy="38" r="2.5" fill="#fde047"/>
                </svg>
            `;
        case 'juggernaut':
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <defs>
                        <linearGradient id="jugHorns" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#ffffff"/>
                            <stop offset="50%" stop-color="#cbd5e1"/>
                            <stop offset="100%" stop-color="#64748b"/>
                        </linearGradient>
                    </defs>
                    <ellipse cx="100" cy="98" rx="50" ry="8" fill="#000" opacity="0.5"/>
                    <polygon points="60,42 135,38 140,80 65,82" fill="#3b0764" stroke="#a855f7" stroke-width="2"/>
                    <rect x="70" y="75" width="20" height="22" rx="3" fill="#2e1065" stroke="#7e22ce" stroke-width="1.5"/>
                    <rect x="115" y="75" width="20" height="22" rx="3" fill="#2e1065" stroke="#7e22ce" stroke-width="1.5"/>
                    <path d="M 130 38 Q 165 20 175 10 Q 155 35 145 48" fill="url(#jugHorns)" stroke="#e2e8f0" stroke-width="1.5"/>
                    <path d="M 120 38 Q 155 10 165 2 Q 145 28 135 45" fill="url(#jugHorns)" stroke="#e2e8f0" stroke-width="1.5"/>
                    <polygon points="125,35 145,28 148,55 130,58" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
                    <circle cx="132" cy="42" r="2" fill="#ef4444"/>
                </svg>
            `;
        case 'valkyrie':
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <defs>
                        <linearGradient id="valkFeathers" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="#fbbf24"/>
                            <stop offset="100%" stop-color="#78350f"/>
                        </linearGradient>
                    </defs>
                    <polygon points="100,45 35,15 50,55 85,55" fill="#0f172a" stroke="#fbbf24" stroke-width="1.5"/>
                    <polygon points="100,45 165,15 150,55 115,55" fill="#0f172a" stroke="#fbbf24" stroke-width="1.5"/>
                    <line x1="45" y1="28" x2="30" y2="40" stroke="#fde047" stroke-width="2"/>
                    <line x1="58" y1="36" x2="45" y2="48" stroke="#fde047" stroke-width="2"/>
                    <line x1="155" y1="28" x2="170" y2="40" stroke="#fde047" stroke-width="2"/>
                    <line x1="142" y1="36" x2="155" y2="48" stroke="#fde047" stroke-width="2"/>
                    <polygon points="100,28 108,65 100,85 92,65" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.5"/>
                    <polygon points="100,28 104,18 96,18" fill="#fbbf24"/>
                    <circle cx="100" cy="24" r="2.5" fill="#fde047"/>
                </svg>
            `;
        case 'salamander':
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <defs>
                        <radialGradient id="bioNodule" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#fde047"/>
                            <stop offset="50%" stop-color="#f59e0b"/>
                            <stop offset="100%" stop-color="#dc2626"/>
                        </radialGradient>
                    </defs>
                    <ellipse cx="100" cy="95" rx="55" ry="10" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.7"/>
                    <polygon points="55,55 135,42 145,78 65,82" fill="#7f1d1d" stroke="#ef4444" stroke-width="2"/>
                    <circle cx="75" cy="54" r="5" fill="url(#bioNodule)" stroke="#fef08a" stroke-width="1.5"/>
                    <circle cx="95" cy="50" r="5" fill="url(#bioNodule)" stroke="#fef08a" stroke-width="1.5"/>
                    <circle cx="115" cy="46" r="5" fill="url(#bioNodule)" stroke="#fef08a" stroke-width="1.5"/>
                    <circle cx="132" cy="44" r="4.5" fill="url(#bioNodule)" stroke="#fef08a" stroke-width="1.5"/>
                    <polygon points="135,45 165,40 158,62 138,62" fill="#991b1b" stroke="#fca5a5" stroke-width="1.5"/>
                    <circle cx="148" cy="46" r="2" fill="#fde047"/>
                    <rect x="75" y="76" width="18" height="18" rx="3" fill="#450a0a" stroke="#dc2626" stroke-width="1.5"/>
                    <rect x="120" y="74" width="18" height="18" rx="3" fill="#450a0a" stroke="#dc2626" stroke-width="1.5"/>
                </svg>
            `;
        case 'abomination':
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <defs>
                        <radialGradient id="plasmaCore" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#ffffff"/>
                            <stop offset="40%" stop-color="#d946ef"/>
                            <stop offset="100%" stop-color="#581c87"/>
                        </radialGradient>
                    </defs>
                    <ellipse cx="100" cy="100" rx="50" ry="7" fill="#000" opacity="0.6"/>
                    <polygon points="85,8 115,6 126,24 100,28 74,22" fill="#3b0764" stroke="#d946ef" stroke-width="2"/>
                    <circle cx="100" cy="16" r="6" fill="#f472b6" opacity="0.8"/>
                    <polygon points="65,38 135,38 122,80 78,80" fill="#2e1065" stroke="#a855f7" stroke-width="2"/>
                    <circle cx="100" cy="52" r="10" fill="url(#plasmaCore)" stroke="#f472b6" stroke-width="2"/>
                    <line x1="90" y1="52" x2="82" y2="60" stroke="#d946ef" stroke-width="1.5"/>
                    <line x1="110" y1="52" x2="118" y2="60" stroke="#d946ef" stroke-width="1.5"/>
                    <rect x="75" y="78" width="20" height="22" rx="4" fill="#1e1b4b" stroke="#7e22ce" stroke-width="1.5"/>
                    <rect x="105" y="78" width="20" height="22" rx="4" fill="#1e1b4b" stroke="#7e22ce" stroke-width="1.5"/>
                </svg>
            `;
        default:
            return `
                <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" class="threat-card-svg">
                    <circle cx="100" cy="55" r="28" fill="#334155" stroke="#64748b" stroke-width="2"/>
                    <text x="100" y="60" fill="#f8fafc" font-size="20" text-anchor="middle">🧟</text>
                </svg>
            `;
    }
}

// ============================================================================
// 1.3 THREAT ROSTER 3D MODEL SNAPSHOT GENERATOR & CACHE
// ============================================================================
const threatSnapshotCache = {};

function getThreat3DModelSnapshot(id) {
    if (!id) return '';
    const cleanId = id.toLowerCase();
    if (threatSnapshotCache[cleanId]) {
        return threatSnapshotCache[cleanId];
    }
    if (!renderer) {
        return '';
    }

    try {
        const width = 320;
        const height = 200;
        const renderTarget = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
        });

        const snapScene = new THREE.Scene();
        snapScene.background = new THREE.Color(0x0a0f18);

        const ambient = new THREE.AmbientLight(0xffffff, 1.35);
        snapScene.add(ambient);

        const keyLight = new THREE.DirectionalLight(0xffeedd, 1.8);
        keyLight.position.set(6, 9, 8);
        snapScene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0x00f0ff, 1.5);
        rimLight.position.set(-7, -4, -6);
        snapScene.add(rimLight);

        const fillLight = new THREE.DirectionalLight(0xff88ff, 0.7);
        fillLight.position.set(0, -5, 6);
        snapScene.add(fillLight);

        // Tactical holographic display pedestal
        const pedestalGeo = new THREE.CylinderGeometry(2.0, 2.1, 0.08, 20);
        const pedestalMat = new THREE.MeshLambertMaterial({ color: 0x182234, emissive: 0x0c1322 });
        const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
        pedestal.position.y = -0.04;
        snapScene.add(pedestal);

        const ringGeo = new THREE.RingGeometry(1.9, 1.98, 24);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = 0.01;
        snapScene.add(ring);

        const gridGeo = new THREE.RingGeometry(0.8, 0.85, 16);
        gridGeo.rotateX(-Math.PI / 2);
        const gridMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
        const gridRing = new THREE.Mesh(gridGeo, gridMat);
        gridRing.position.y = 0.01;
        snapScene.add(gridRing);

        let zombieObj = null;
        switch (cleanId) {
            case 'walker': zombieObj = createLowPolyZombie('WALKER'); break;
            case 'runner': zombieObj = createLowPolyZombie('RUNNER'); break;
            case 'tank': zombieObj = createLowPolyZombie('TANK'); break;
            case 'hound': zombieObj = createHoundZombie(); break;
            case 'seeker': zombieObj = createSeekerZombie(); break;
            case 'spitter': zombieObj = createSpitterZombie(); break;
            case 'phantom': zombieObj = createPhantomZombie(); break;
            case 'crawler': zombieObj = createCrawlerZombie(); break;
            case 'brute': zombieObj = createBruteZombie(); break;
            case 'screamer': zombieObj = createScreamerZombie(); break;
            case 'stag': zombieObj = createStagZombie(); break;
            case 'horse': zombieObj = createHorseZombie(); break;
            case 'bear': zombieObj = createBearZombie(); break;
            case 'hunter': zombieObj = createHunterBoss(); break;
            case 'omega': zombieObj = createOmegaBoss(); break;
            case 'juggernaut': zombieObj = createJuggernautBoss(); break;
            case 'valkyrie': zombieObj = createValkyrieBoss(); break;
            case 'salamander': zombieObj = createSalamanderBoss(); break;
            case 'abomination': zombieObj = createAbominationBoss(); break;
            default: zombieObj = createLowPolyZombie('WALKER'); break;
        }

        if (!zombieObj || !zombieObj.mesh) {
            renderTarget.dispose();
            return '';
        }

        const modelMesh = zombieObj.mesh;
        modelMesh.position.set(0, 0, 0);

        const bbox = new THREE.Box3().setFromObject(modelMesh);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const center = new THREE.Vector3();
        bbox.getCenter(center);

        modelMesh.position.x = -center.x;
        modelMesh.position.y = -bbox.min.y;
        modelMesh.position.z = -center.z;
        modelMesh.rotation.y = Math.PI / 5.5;

        snapScene.add(modelMesh);

        const maxDim = Math.max(size.x, size.y, size.z, 1.2);
        const snapCamera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
        const dist = maxDim * 1.95;
        const targetY = size.y * 0.48;
        snapCamera.position.set(dist * 0.72, targetY + dist * 0.42, dist * 1.15);
        snapCamera.lookAt(0, targetY, 0);

        renderer.setRenderTarget(renderTarget);
        renderer.render(snapScene, snapCamera);

        const pixelBuffer = new Uint8Array(width * height * 4);
        renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, pixelBuffer);
        renderer.setRenderTarget(null);

        const canvas2d = document.createElement('canvas');
        canvas2d.width = width;
        canvas2d.height = height;
        const ctx2d = canvas2d.getContext('2d');
        const imgData = ctx2d.createImageData(width, height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const srcIdx = ((height - 1 - y) * width + x) * 4;
                const dstIdx = (y * width + x) * 4;
                imgData.data[dstIdx] = pixelBuffer[srcIdx];
                imgData.data[dstIdx + 1] = pixelBuffer[srcIdx + 1];
                imgData.data[dstIdx + 2] = pixelBuffer[srcIdx + 2];
                imgData.data[dstIdx + 3] = pixelBuffer[srcIdx + 3];
            }
        }
        ctx2d.putImageData(imgData, 0, 0);
        const dataUrl = canvas2d.toDataURL('image/png');
        threatSnapshotCache[cleanId] = dataUrl;

        renderTarget.dispose();
        return dataUrl;
    } catch (err) {
        console.warn("[Snapshot Generator] Failed to render 3D snapshot for " + id + ":", err);
        return '';
    }
}

function renderThreatRoster(category = 'all') {
    if (!threatCardsContainer) return;
    threatCardsContainer.innerHTML = '';

    const filtered = THREAT_DATABASE.filter(item => {
        if (category === 'all') return true;
        return item.category === category;
    });

    filtered.forEach(threat => {
        const isDiscovered = discoveredThreats.has(threat.id);
        const card = document.createElement('div');
        const snapUrl = getThreat3DModelSnapshot(threat.id);

        if (isDiscovered) {
            let cardClass = 'threat-card';
            if (threat.category === 'boss') cardClass += ' threat-boss';
            else if (threat.category === 'animal') cardClass += ' threat-animal';

            card.className = cardClass;
            const imgHtml = snapUrl 
                ? `<img src="${snapUrl}" alt="${threat.name}" class="threat-model-img" />`
                : getThreatArtworkSVG(threat.id, true);

            card.innerHTML = `
                <div class="threat-img-box">
                    ${imgHtml}
                </div>
                <div class="threat-header">
                    <div>
                        <h4 class="threat-name">${threat.name}</h4>
                        <span class="threat-subtitle">${threat.subtitle}</span>
                    </div>
                    <span class="guide-card-tag ${threat.tag}">${threat.tier}</span>
                </div>
                <div class="threat-rating-bar">
                    <span>HP: <strong>${threat.hp}</strong></span>
                    <span>Speed: <strong>${threat.speed}</strong></span>
                    <span>Atk: <strong>${threat.damage}</strong></span>
                </div>
                <p class="threat-intel-text">${threat.desc}</p>
                <div class="threat-weakpoint-box">
                    <strong>🎯 TACTICAL INTEL:</strong> ${threat.weakness}
                </div>
            `;
        } else {
            card.className = 'threat-card threat-locked';
            const lockedImgHtml = snapUrl 
                ? `<img src="${snapUrl}" alt="Classified Threat" class="threat-model-img threat-model-silhouette" />`
                : getThreatArtworkSVG(threat.id, false);

            card.innerHTML = `
                <div class="threat-img-box threat-img-locked">
                    ${lockedImgHtml}
                    <div class="threat-lock-badge">
                        <span class="threat-lock-icon">🔒</span>
                        <span>CLASSIFIED BIOMETRICS</span>
                    </div>
                </div>
                <div class="threat-header">
                    <div>
                        <h4 class="threat-name">🔒 [CLASSIFIED THREAT]</h4>
                        <span class="threat-subtitle">UNDISCOVERED MUTATION</span>
                    </div>
                    <span class="guide-card-tag tag-locked">LOCKED</span>
                </div>
                <div class="threat-rating-bar">
                    <span>HP: <strong>???</strong></span>
                    <span>Speed: <strong>???</strong></span>
                    <span>Atk: <strong>???</strong></span>
                </div>
                <p class="threat-intel-text">Classified mutation signature detected. Engage this threat in combat to declassify biometric and tactical specifications.</p>
                <div class="threat-weakpoint-box">
                    <strong>🔒 CLASSIFIED:</strong> Engage in field combat to analyze weak points.
                </div>
            `;
        }
        threatCardsContainer.appendChild(card);
    });
}

let guidePreviousState = null;

function openFieldGuide(tabId = 'tab-turret') {
    if (gameState === 'PLAYING') {
        guidePreviousState = 'PLAYING';
        gameState = 'PAUSED';
    } else {
        guidePreviousState = gameState;
    }
    switchGuideTab(tabId);
    if (guideModal) guideModal.classList.remove('hidden');
}

function closeFieldGuide() {
    if (guideModal) guideModal.classList.add('hidden');
    if (guidePreviousState === 'PAUSED' || gameState === 'PAUSED') {
        if (pauseOverlay) pauseOverlay.classList.remove('hidden');
    } else if (guidePreviousState === 'PLAYING') {
        gameState = 'PLAYING';
        clock.getDelta();
    }
}

function switchGuideTab(tabId) {
    document.querySelectorAll('.guide-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    document.querySelectorAll('.guide-tab-pane').forEach(pane => {
        if (pane.id === tabId) pane.classList.add('active');
        else pane.classList.remove('active');
    });
}

function filterGuideThreats(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.getAttribute('data-filter') === category) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    renderThreatRoster(category);
}

function setupThreeJS() {
    const container = document.getElementById('game-container') || gameContainer || document.body;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f18);
    // Linear fog: Crystal-clear in central base area (≤48m), smooth atmospheric falloff towards deep perimeter (48m-110m)
    scene.fog = new THREE.Fog(0x0a0f18, 48, 110);

    const w = window.innerWidth || 1200;
    const h = window.innerHeight || 750;

    camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000);
    camera.position.copy(originalCameraPos);
    camera.lookAt(0, 1.2, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);
}

// ============================================================================
// 2. LOW-POLY ENVIRONMENT & PROPS
// ============================================================================
function createLowPolyEnvironment() {
    const terrainGeo = new THREE.PlaneGeometry(120, 120, 32, 32);
    terrainGeo.rotateX(-Math.PI / 2);

    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        pos.setY(i, getTerrainHeight(x, z));
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshLambertMaterial({ color: 0x222a36 });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.receiveShadow = true;
    scene.add(terrain);

    const padGeo = new THREE.CylinderGeometry(5.2, 5.4, 0.1, 14);
    const padMat = new THREE.MeshLambertMaterial({ color: 0x181d26 });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.y = 0.05;
    pad.receiveShadow = true;
    scene.add(pad);

    const ringGeo = new THREE.RingGeometry(4.7, 5.0, 14);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xe67e22, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.11;
    scene.add(ring);

    createPerimeterMist();

    sunLight = new THREE.DirectionalLight(0xfff2df, 1.6);
    sunLight.position.set(25, 35, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 80;
    sunLight.shadow.camera.left = -28;
    sunLight.shadow.camera.right = 28;
    sunLight.shadow.camera.top = 28;
    sunLight.shadow.camera.bottom = -28;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    ambientLight = new THREE.AmbientLight(0x526580, 1.25);
    scene.add(ambientLight);

    createSearchlight(-18, 14, 0x00f0ff);
    createSearchlight(18, -14, 0xffaa44);

    resetObstacles();
}

function resetObstacles() {
    obstacles.forEach(obs => {
        if (obs && obs.mesh) scene.remove(obs.mesh);
    });
    obstacles = [];

    createSandbagBarricades();
    createCzechHedgehogs();
    createPropsAndCrates();
    createDeadTrees();
    createBoulders();
}

function createPerimeterMist() {
    const mistCount = 55;
    const mistGroup = new THREE.Group();
    const mistGeo = new THREE.DodecahedronGeometry(2.4, 0);
    const mistMat = new THREE.MeshBasicMaterial({
        color: 0x0a0f18,
        transparent: true,
        opacity: 0.32,
        depthWrite: false
    });

    for (let i = 0; i < mistCount; i++) {
        const angle = (i / mistCount) * Math.PI * 2 + (Math.random() * 0.2);
        const radius = 32 + Math.random() * 15;
        const mx = Math.cos(angle) * radius;
        const mz = Math.sin(angle) * radius;
        const my = getTerrainHeight(mx, mz) + 0.9 + Math.random() * 2.2;

        const mistMesh = new THREE.Mesh(mistGeo, mistMat);
        mistMesh.position.set(mx, my, mz);
        mistMesh.scale.set(1.6 + Math.random(), 0.6 + Math.random() * 0.4, 1.6 + Math.random());
        mistMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        mistGroup.add(mistMesh);
    }
    scene.add(mistGroup);
}

function createSandbagBarricades() {
    const sandbagMat = new THREE.MeshLambertMaterial({ color: 0x9c8558 });
    const arcs = [
        { startAngle: 0.3, endAngle: 1.2, radius: 6.2 },
        { startAngle: 1.8, endAngle: 2.7, radius: 6.2 },
        { startAngle: 3.4, endAngle: 4.3, radius: 6.2 },
        { startAngle: 4.9, endAngle: 5.8, radius: 6.2 }
    ];

    arcs.forEach(arc => {
        const step = 0.28;
        for (let a = arc.startAngle; a <= arc.endAngle; a += step) {
            const x = Math.cos(a) * arc.radius;
            const z = Math.sin(a) * arc.radius;
            const groundY = getTerrainHeight(x, z);
            const rotY = -a + Math.PI / 2;

            const group = new THREE.Group();
            const bag1 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.28, 0.42), sandbagMat);
            bag1.position.set(0, 0.14, 0);
            group.add(bag1);

            const bag2 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.28, 0.42), sandbagMat);
            bag2.position.set(0.05, 0.42, 0.05);
            group.add(bag2);

            group.position.set(x, groundY, z);
            group.rotation.y = rotY;
            scene.add(group);

            obstacles.push({
                mesh: group,
                x: x,
                z: z,
                radius: 0.55,
                height: 0.8,
                hp: 4,
                maxHp: 4,
                isLow: true,
                isDestructible: true,
                type: 'sandbag'
            });
        }
    });
}

function createCzechHedgehogs() {
    const steelMat = new THREE.MeshLambertMaterial({ color: 0x3d4754 });
    const positions = [
        { x: -11, z: 8, rot: 0.4 },
        { x: -13, z: 6, rot: 1.1 },
        { x: 12, z: 10, rot: 0.8 },
        { x: 10, z: -12, rot: 2.1 },
        { x: -10, z: -10, rot: 1.6 }
    ];

    positions.forEach(p => {
        const group = new THREE.Group();
        const beamGeo = new THREE.BoxGeometry(0.12, 0.12, 1.7);
        const b1 = new THREE.Mesh(beamGeo, steelMat);
        b1.rotation.x = Math.PI / 4;
        group.add(b1);
        const b2 = new THREE.Mesh(beamGeo, steelMat);
        b2.rotation.y = Math.PI / 4;
        group.add(b2);

        const groundY = getTerrainHeight(p.x, p.z);
        group.position.set(p.x, groundY + 0.6, p.z);
        group.rotation.y = p.rot;
        scene.add(group);

        obstacles.push({
            mesh: group,
            x: p.x,
            z: p.z,
            radius: 0.9,
            height: 1.3,
            hp: 5,
            maxHp: 5,
            isLow: true,
            isDestructible: true,
            type: 'steel'
        });
    });
}

function createPropsAndCrates() {
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x6e4a2f });
    const barrelRedMat = new THREE.MeshLambertMaterial({ color: 0xcc2218 });
    const clusters = [
        { x: 5.5, z: 3.5, type: 'crates' },
        { x: -5.2, z: -4.0, type: 'barrels' },
        { x: -4.8, z: 4.8, type: 'mixed' },
        { x: 16, z: -8, type: 'crates' },
        { x: -15, z: 12, type: 'barrels' }
    ];

    clusters.forEach(c => {
        const groundY = getTerrainHeight(c.x, c.z);

        if (c.type === 'crates' || c.type === 'mixed') {
            const group = new THREE.Group();
            const crate = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), woodMat);
            crate.position.set(0, 0.45, 0);
            group.add(crate);
            group.position.set(c.x, groundY, c.z);
            scene.add(group);

            obstacles.push({
                mesh: group,
                x: c.x,
                z: c.z,
                radius: 0.8,
                height: 1.2,
                hp: 3,
                maxHp: 3,
                isLow: true,
                isDestructible: true,
                type: 'wood'
            });
        }

        if (c.type === 'barrels' || c.type === 'mixed') {
            const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.05, 7), barrelRedMat);
            const bx = c.x + 0.9;
            const bz = c.z - 0.4;
            const bGroundY = getTerrainHeight(bx, bz);
            barrel.position.set(bx, bGroundY + 0.52, bz);
            scene.add(barrel);

            obstacles.push({
                mesh: barrel,
                x: bx,
                z: bz,
                radius: 0.5,
                height: 1.2,
                hp: 2,
                maxHp: 2,
                isLow: true,
                isExplosive: true,
                isDestructible: true,
                type: 'barrel'
            });
        }
    });
}

function createDeadTrees() {
    const barkMat = new THREE.MeshLambertMaterial({ color: 0x2b2420 });
    const treePositions = [
        { x: -22, z: 14, scale: 1.2 },
        { x: 24, z: 18, scale: 1.0 },
        { x: 20, z: -20, scale: 1.3 },
        { x: -19, z: -18, scale: 0.9 }
    ];

    treePositions.forEach(t => {
        const treeGroup = new THREE.Group();
        const trunkGeo = new THREE.CylinderGeometry(0.25, 0.5, 3.8, 5);
        const trunk = new THREE.Mesh(trunkGeo, barkMat);
        trunk.position.y = 1.9;
        treeGroup.add(trunk);

        const branchGeo = new THREE.CylinderGeometry(0.1, 0.2, 1.8, 4);
        const b1 = new THREE.Mesh(branchGeo, barkMat);
        b1.position.set(0.3, 2.5, 0);
        b1.rotation.z = -Math.PI / 4;
        treeGroup.add(b1);

        const groundY = getTerrainHeight(t.x, t.z);
        treeGroup.position.set(t.x, groundY, t.z);
        treeGroup.scale.setScalar(t.scale);
        scene.add(treeGroup);

        obstacles.push({
            mesh: treeGroup,
            x: t.x,
            z: t.z,
            radius: 0.7 * t.scale,
            height: 4.0 * t.scale,
            hp: 8,
            maxHp: 8,
            isLow: false,
            isDestructible: true,
            requiresOverdrive: true,
            type: 'tree'
        });
    });
}

function createBoulders() {
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x3d4452 });
    const boulderSpots = [
        { x: -16, z: -4, s: 1.5, hp: 6, isLow: true },
        { x: 15, z: 2, s: 1.9, hp: 8, isLow: false },
        { x: -8, z: 22, s: 2.2, hp: 10, isLow: false },
        { x: 9, z: -22, s: 1.6, hp: 6, isLow: true }
    ];

    boulderSpots.forEach(b => {
        const rockGeo = new THREE.DodecahedronGeometry(b.s, 0);
        const rock = new THREE.Mesh(rockGeo, rockMat);
        const groundY = getTerrainHeight(b.x, b.z);
        rock.position.set(b.x, groundY + b.s * 0.65, b.z);
        rock.scale.set(1.0, 0.75, 1.0);
        scene.add(rock);

        obstacles.push({
            mesh: rock,
            x: b.x,
            z: b.z,
            radius: b.s * 0.95,
            height: b.s * 1.5,
            hp: b.hp,
            maxHp: b.hp,
            isLow: b.isLow,
            isDestructible: true,
            requiresOverdrive: true, // Trees and large rocks require Quad Overdrive to damage & destroy
            type: 'rock'
        });
    });
}

function createSearchlight(x, z, colorHex) {
    const spot = new THREE.SpotLight(colorHex, 2.5, 45, Math.PI / 7, 0.4, 1.2);
    spot.position.set(x, 10, z);
    scene.add(spot);

    const targetObj = new THREE.Object3D();
    targetObj.position.set(x * 0.4, 0, z * 0.4);
    scene.add(targetObj);
    spot.target = targetObj;

    searchlights.push({ spot, target: targetObj, originX: x, originZ: z, angle: Math.random() * Math.PI * 2 });
}

function createAmbientParticles() {
    const count = 35;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 60;
        positions[i * 3 + 1] = Math.random() * 12 + 0.5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 0.18,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
    });

    const pSystem = new THREE.Points(geom, mat);
    scene.add(pSystem);
    ambientParticles.push({ system: pSystem, geom: geom, count: count });
}

// ============================================================================
// 3. LOW-POLY ARMORED TURRET & DUAL AUTOCANNONS
// ============================================================================
function createLowPolyTurret() {
    const bunkerGroup = new THREE.Group();

    const baseSlabGeo = new THREE.CylinderGeometry(3.4, 3.9, 0.8, 8);
    const concreteMat = new THREE.MeshLambertMaterial({ color: 0x1b202a });
    const baseSlab = new THREE.Mesh(baseSlabGeo, concreteMat);
    baseSlab.position.y = 0.4;
    baseSlab.receiveShadow = true;
    bunkerGroup.add(baseSlab);

    const armorRingGeo = new THREE.CylinderGeometry(2.5, 2.9, 0.5, 8);
    const armorPlateMat = new THREE.MeshLambertMaterial({ color: 0x2e3846 });
    const armorRing = new THREE.Mesh(armorRingGeo, armorPlateMat);
    armorRing.position.y = 0.95;
    bunkerGroup.add(armorRing);

    turretBase = bunkerGroup;
    scene.add(turretBase);

    turretPivot = new THREE.Group();
    turretPivot.position.set(0, 1.2, 0);
    scene.add(turretPivot);

    const turntableGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.3, 10);
    const turntable = new THREE.Mesh(turntableGeo, new THREE.MeshLambertMaterial({ color: 0x181e26 }));
    turntable.position.y = 0.15;
    turretPivot.add(turntable);

    const hullMat = new THREE.MeshLambertMaterial({ color: 0x2d3748 });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.95, 2.0), hullMat);
    cabin.position.set(0, 0.75, 0.1);
    cabin.castShadow = true;
    turretPivot.add(cabin);

    const frontArmor = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.8), hullMat);
    frontArmor.position.set(0, 0.6, 1.1);
    frontArmor.rotation.x = -Math.PI / 8;
    turretPivot.add(frontArmor);

    const sensorPod = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.5, 6), new THREE.MeshLambertMaterial({ color: 0x1a202c }));
    sensorPod.position.set(0, 1.4, 0.2);
    turretPivot.add(sensorPod);

    const lens = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    lens.position.set(0, 1.4, 0.5);
    turretPivot.add(lens);

    const leftData = createAutocannonBarrel();
    leftBarrelGroup = leftData.group;
    leftBarrelMesh = leftData.barrelMesh;
    leftBarrelGroup.position.set(-0.52, 0.65, 1.0);
    turretPivot.add(leftBarrelGroup);

    const rightData = createAutocannonBarrel();
    rightBarrelGroup = rightData.group;
    rightBarrelMesh = rightData.barrelMesh;
    rightBarrelGroup.position.set(0.52, 0.65, 1.0);
    turretPivot.add(rightBarrelGroup);

    leftMuzzlePoint = new THREE.Vector3(0, 0, 2.45);
    rightMuzzlePoint = new THREE.Vector3(0, 0, 2.45);
}

function createAutocannonBarrel() {
    const group = new THREE.Group();
    const gunMetalMat = new THREE.MeshLambertMaterial({ color: 0x151921, emissive: 0x000000 });
    const muzzleMat = new THREE.MeshLambertMaterial({ color: 0x333b47 });

    const sleeveGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.8, 6);
    sleeveGeo.rotateX(Math.PI / 2);
    sleeveGeo.translate(0, 0, 0.4);
    const sleeve = new THREE.Mesh(sleeveGeo, muzzleMat);
    group.add(sleeve);

    const barrelGeo = new THREE.CylinderGeometry(0.1, 0.12, 2.0, 6);
    barrelGeo.rotateX(Math.PI / 2);
    barrelGeo.translate(0, 0, 1.4);
    const barrel = new THREE.Mesh(barrelGeo, gunMetalMat);
    barrel.castShadow = true;
    group.add(barrel);

    const brakeGeo = new THREE.CylinderGeometry(0.16, 0.14, 0.35, 6);
    brakeGeo.rotateX(Math.PI / 2);
    brakeGeo.translate(0, 0, 2.3);
    const brake = new THREE.Mesh(brakeGeo, muzzleMat);
    group.add(brake);

    return { group: group, barrelMesh: barrel };
}

// ============================================================================
// 4. LOW-POLY ZOMBIES & REFERENCE-MATCHED BOSS MODELS
// ============================================================================

const ZOMBIE_TYPES = {
    WALKER: {
        hp: 2,
        speed: 2.8,
        scale: 1.0,
        animSpeed: 7.0,
        fleshMat: MAT_WALKER_FLESH,
        shirtMat: MAT_WALKER_SHIRT,
        pantsMat: MAT_WALKER_PANTS,
        eyeMat: MAT_EYE_RED,
        scoreVal: 10,
        attackDamage: 5,
        attackInterval: 0.9,
        fleshColor: 0x4d6b4f
    },
    RUNNER: {
        hp: 1,
        speed: 5.2,
        scale: 0.86,
        animSpeed: 14.0,
        fleshMat: MAT_RUNNER_FLESH,
        shirtMat: MAT_RUNNER_SHIRT,
        pantsMat: MAT_RUNNER_PANTS,
        eyeMat: MAT_EYE_YELLOW,
        scoreVal: 15,
        attackDamage: 3,
        attackInterval: 0.6,
        fleshColor: 0x8a2434
    },
    TANK: {
        hp: 8,
        speed: 1.6,
        scale: 1.52,
        animSpeed: 4.5,
        fleshMat: MAT_TANK_FLESH,
        shirtMat: MAT_TANK_SHIRT,
        pantsMat: MAT_TANK_PANTS,
        eyeMat: MAT_EYE_PINK,
        scoreVal: 35,
        attackDamage: 14,
        attackInterval: 1.2,
        fleshColor: 0x3c4943
    },
    HOUND: {
        hp: 2,
        speed: 5.8,
        scale: 0.82,
        animSpeed: 16.0,
        scoreVal: 12,
        attackDamage: 4,
        attackInterval: 0.5,
        fleshColor: 0x7f1d1d
    },
    SEEKER: {
        hp: 2,
        speed: 4.8,
        scale: 0.95,
        animSpeed: 12.0,
        scoreVal: 25,
        attackDamage: 10, // 2x normal walker damage!
        attackInterval: 0.8,
        fleshColor: 0x334155
    },
    SPITTER: {
        hp: 3,
        speed: 2.2,
        scale: 1.1,
        animSpeed: 6.0,
        scoreVal: 30,
        attackDamage: 8,
        attackInterval: 3.5,
        fleshColor: 0x365314
    },
    PHANTOM: {
        hp: 2,
        speed: 4.6,
        scale: 1.0,
        animSpeed: 8.0,
        scoreVal: 30,
        attackDamage: 7,
        attackInterval: 0.7,
        fleshColor: 0x1e293b
    },
    CRAWLER: {
        hp: 1,
        speed: 4.4,
        scale: 0.85,
        animSpeed: 14.0,
        scoreVal: 15,
        attackDamage: 3,
        attackInterval: 0.5,
        fleshColor: 0x451a03
    },
    BRUTE: {
        hp: 12,
        speed: 2.0,
        scale: 1.35,
        animSpeed: 5.0,
        scoreVal: 50,
        attackDamage: 12,
        attackInterval: 1.1,
        fleshColor: 0x831843
    },
    SCREAMER: {
        hp: 4,
        speed: 3.0,
        scale: 1.05,
        animSpeed: 8.0,
        scoreVal: 50,
        attackDamage: 6,
        attackInterval: 0.9,
        fleshColor: 0x581c87
    },
    STAG: {
        hp: 2,
        speed: 5.4,
        scale: 1.0,
        animSpeed: 14.0,
        scoreVal: 20,
        attackDamage: 5,
        attackInterval: 0.6,
        fleshColor: 0x5a3825
    },
    HORSE: {
        hp: 4,
        speed: 5.0,
        scale: 1.25,
        animSpeed: 12.0,
        scoreVal: 35,
        attackDamage: 9,
        attackInterval: 0.8,
        fleshColor: 0x3d352e
    },
    BEAR: {
        hp: 12,
        speed: 2.4,
        scale: 1.4,
        animSpeed: 6.0,
        scoreVal: 65,
        attackDamage: 15,
        attackInterval: 1.0,
        fleshColor: 0x2e1c14
    }
};

function createHoundZombie(carrierType = null) {
    const config = ZOMBIE_TYPES.HOUND;
    const root = new THREE.Group();

    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.45, 0);
    root.add(bodyGroup);

    // Quadruped Ribbed Hound Body
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.45, 1.05), MAT_HOUND_FUR);
    bodyGroup.add(torso);

    for (let r = 0; r < 3; r++) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.08, 0.12), MAT_HOUND_BONE);
        rib.position.set(0, 0.12, 0.25 - r * 0.25);
        bodyGroup.add(rib);
    }

    if (carrierType) {
        attachCarrierBackpack(bodyGroup, carrierType, { x: 0, y: 0.28, z: -0.15 }, 0.85);
    }

    // Lowered Fanged Canine Skull
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.25, 0.65);
    bodyGroup.add(headGroup);

    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.45), MAT_HOUND_FUR);
    headGroup.add(skull);

    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.42), MAT_HOUND_FLESH);
    snout.position.set(0, -0.05, 0.35);
    headGroup.add(snout);

    const lowerJaw = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.38), MAT_HOUND_FLESH);
    lowerJaw.position.set(0, -0.16, 0.32);
    lowerJaw.rotation.x = 0.25;
    headGroup.add(lowerJaw);

    const teeth = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.3), MAT_HOUND_TEETH);
    teeth.position.set(0, -0.09, 0.36);
    headGroup.add(teeth);

    const eyeL = new THREE.Mesh(GEO_EYE, MAT_EYE_RED);
    eyeL.position.set(-0.14, 0.1, 0.2);
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(GEO_EYE, MAT_EYE_RED);
    eyeR.position.set(0.14, 0.1, 0.2);
    headGroup.add(eyeR);

    // 4 Articulated Running Legs
    const flLegGroup = new THREE.Group();
    flLegGroup.position.set(-0.26, 0.45, 0.38);
    root.add(flLegGroup);
    const flThigh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.35, 0.18), MAT_HOUND_FUR);
    flThigh.position.y = -0.16;
    flLegGroup.add(flThigh);
    const flShin = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 0.14), MAT_HOUND_FLESH);
    flShin.position.set(0, -0.38, 0.04);
    flLegGroup.add(flShin);

    const frLegGroup = new THREE.Group();
    frLegGroup.position.set(0.26, 0.45, 0.38);
    root.add(frLegGroup);
    const frThigh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.35, 0.18), MAT_HOUND_FUR);
    frThigh.position.y = -0.16;
    frLegGroup.add(frThigh);
    const frShin = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 0.14), MAT_HOUND_FLESH);
    frShin.position.set(0, -0.38, 0.04);
    frLegGroup.add(frShin);

    const blLegGroup = new THREE.Group();
    blLegGroup.position.set(-0.24, 0.45, -0.38);
    root.add(blLegGroup);
    const blThigh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.38, 0.2), MAT_HOUND_FUR);
    blThigh.position.y = -0.16;
    blLegGroup.add(blThigh);
    const blShin = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 0.14), MAT_HOUND_FLESH);
    blShin.position.set(0, -0.38, -0.04);
    blLegGroup.add(blShin);

    const brLegGroup = new THREE.Group();
    brLegGroup.position.set(0.24, 0.45, -0.38);
    root.add(brLegGroup);
    const brThigh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.38, 0.2), MAT_HOUND_FUR);
    brThigh.position.y = -0.16;
    brLegGroup.add(brThigh);
    const brShin = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 0.14), MAT_HOUND_FLESH);
    brShin.position.set(0, -0.38, -0.04);
    brLegGroup.add(brShin);

    root.scale.setScalar(config.scale);

    return {
        mesh: root,
        type: 'HOUND',
        carrierType: carrierType,
        config: config,
        health: config.hp,
        maxHealth: config.hp,
        speed: config.speed + (Math.random() * 0.4 - 0.2),
        radius: 0.65,
        animTime: Math.random() * 10,
        isAttacking: false,
        attackTimer: 0,
        isJumping: false,
        jumpTimer: 0,
        jumpDuration: 0.55,
        flLeg: flLegGroup,
        frLeg: frLegGroup,
        blLeg: blLegGroup,
        brLeg: brLegGroup,
        headGroup: headGroup,
        bodyGroup: bodyGroup,
        meshes: [torso, skull, snout, lowerJaw, flThigh, frThigh, blThigh, brThigh]
    };
}

function createSeekerZombie(carrierType = null) {
    const config = ZOMBIE_TYPES.SEEKER;
    const root = new THREE.Group();

    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0, 0);
    root.add(bodyGroup);

    // Slender Eyeless Flying Humanoid Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.35), MAT_SEEKER_FLESH);
    bodyGroup.add(torso);

    if (carrierType) {
        attachCarrierBackpack(bodyGroup, carrierType, { x: 0, y: -0.15, z: -0.22 }, 0.85);
    }

    // Eyeless Head with Acoustic Echolocation Dishes
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.52, 0.08);
    bodyGroup.add(headGroup);

    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), MAT_SEEKER_FLESH);
    headGroup.add(skull);

    // Echolocation Sonar Brow Ridge
    const sonarDish = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.42), MAT_SEEKER_SONAR);
    sonarDish.position.set(0, 0.12, 0.05);
    headGroup.add(sonarDish);

    // Fanged Gaping Screech Maw
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.28), MAT_SEEKER_FLESH);
    jaw.position.set(0, -0.12, 0.15);
    jaw.rotation.x = 0.35;
    headGroup.add(jaw);

    // 2 Articulated Leathery Bat Wings
    const leftWing = new THREE.Group();
    leftWing.position.set(-0.35, 0.25, -0.05);
    bodyGroup.add(leftWing);
    const lWingMain = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.08, 0.85), MAT_SEEKER_WING);
    lWingMain.position.set(-0.8, 0, 0);
    leftWing.add(lWingMain);

    const rightWing = new THREE.Group();
    rightWing.position.set(0.35, 0.25, -0.05);
    bodyGroup.add(rightWing);
    const rWingMain = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.08, 0.85), MAT_SEEKER_WING);
    rWingMain.position.set(0.8, 0, 0);
    rightWing.add(rWingMain);

    // Dangling Talon Legs
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.16, -0.4, 0);
    bodyGroup.add(leftLegGroup);
    const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.16), MAT_SEEKER_FLESH);
    lLeg.position.y = -0.22;
    leftLegGroup.add(lLeg);

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.16, -0.4, 0);
    bodyGroup.add(rightLegGroup);
    const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.16), MAT_SEEKER_FLESH);
    rLeg.position.y = -0.22;
    rightLegGroup.add(rLeg);

    root.scale.setScalar(config.scale);

    return {
        mesh: root,
        type: 'SEEKER',
        isAerial: true,
        carrierType: carrierType,
        config: config,
        health: config.hp,
        maxHealth: config.hp,
        speed: config.speed + (Math.random() * 0.3 - 0.15),
        radius: 0.85,
        altitude: 4.2,
        animTime: Math.random() * 10,
        isAttacking: false,
        attackTimer: 0,
        bodyGroup: bodyGroup,
        headGroup: headGroup,
        leftWing: leftWing,
        rightWing: rightWing,
        leftLeg: leftLegGroup,
        rightLeg: rightLegGroup,
        meshes: [torso, skull, jaw, lWingMain, rWingMain, lLeg, rLeg]
    };
}

function createSpitterZombie(carrierType = null) {
    const config = ZOMBIE_TYPES.SPITTER;
    const root = new THREE.Group();

    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.75, 0);
    root.add(bodyGroup);

    // Bloated Acid Pustule Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.82, 0.62), MAT_SPITTER_FLESH);
    torso.position.y = 0.38;
    bodyGroup.add(torso);

    for (let p = 0; p < 4; p++) {
        const pustule = new THREE.Mesh(new THREE.SphereGeometry(0.16, 5, 5), MAT_SPITTER_PUSTULE);
        pustule.position.set((p % 2 === 0 ? -0.32 : 0.32), 0.28 + Math.floor(p / 2) * 0.3, 0.28);
        bodyGroup.add(pustule);
    }

    if (carrierType) {
        attachCarrierBackpack(bodyGroup, carrierType, { x: 0, y: 0.38, z: -0.36 }, 1.1);
    }

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.88, 0.08);
    bodyGroup.add(headGroup);

    const head = new THREE.Mesh(GEO_HEAD, MAT_SPITTER_FLESH);
    head.position.y = 0.22;
    headGroup.add(head);

    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.24, 0.32), MAT_SPITTER_PUSTULE);
    jaw.position.set(0, 0.04, 0.16);
    jaw.rotation.x = 0.4;
    headGroup.add(jaw);

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.52, 0.65, 0);
    bodyGroup.add(leftArmGroup);
    const lArm = new THREE.Mesh(GEO_ARM, MAT_SPITTER_FLESH);
    lArm.position.y = -0.28;
    leftArmGroup.add(lArm);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.52, 0.65, 0);
    bodyGroup.add(rightArmGroup);
    const rArm = new THREE.Mesh(GEO_ARM, MAT_SPITTER_FLESH);
    rArm.position.y = -0.28;
    rightArmGroup.add(rArm);

    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.25, 0.75, 0);
    root.add(leftLegGroup);
    const lLeg = new THREE.Mesh(GEO_LEG, MAT_WALKER_PANTS);
    lLeg.position.y = -0.32;
    leftLegGroup.add(lLeg);

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.25, 0.75, 0);
    root.add(rightLegGroup);
    const rLeg = new THREE.Mesh(GEO_LEG, MAT_WALKER_PANTS);
    rLeg.position.y = -0.32;
    rightLegGroup.add(rLeg);

    root.scale.setScalar(config.scale);

    return {
        mesh: root,
        type: 'SPITTER',
        carrierType: carrierType,
        config: config,
        health: config.hp,
        maxHealth: config.hp,
        speed: config.speed + (Math.random() * 0.2 - 0.1),
        radius: 0.85,
        standoffDistance: 13.0 + Math.random() * 7.0, // Stops randomly from 13m to 20m from player
        spitTimer: Math.random() * 1.5,
        spitInterval: 3.5,
        animTime: Math.random() * 10,
        isAttacking: false,
        attackTimer: 0,
        bodyGroup: bodyGroup,
        headGroup: headGroup,
        leftLeg: leftLegGroup,
        rightLeg: rightLegGroup,
        leftArm: leftArmGroup,
        rightArm: rightArmGroup,
        meshes: [torso, head, jaw, lArm, rArm, lLeg, rLeg]
    };
}

function createPhantomZombie(carrierType = null) {
    const config = ZOMBIE_TYPES.PHANTOM;
    const root = new THREE.Group();

    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.75, 0);
    root.add(bodyGroup);

    const torso = new THREE.Mesh(GEO_TORSO, MAT_PHANTOM_CLOAK);
    torso.position.y = 0.35;
    bodyGroup.add(torso);

    if (carrierType) {
        attachCarrierBackpack(bodyGroup, carrierType, { x: 0, y: 0.38, z: -0.26 }, 0.95);
    }

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.78, 0);
    bodyGroup.add(headGroup);

    const head = new THREE.Mesh(GEO_HEAD, MAT_PHANTOM_FLESH);
    head.position.y = 0.22;
    headGroup.add(head);

    const eyeL = new THREE.Mesh(GEO_EYE, MAT_EYE_CYAN);
    eyeL.position.set(-0.11, 0.26, 0.21);
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(GEO_EYE, MAT_EYE_CYAN);
    eyeR.position.set(0.11, 0.26, 0.21);
    headGroup.add(eyeR);

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.42, 0.62, 0);
    bodyGroup.add(leftArmGroup);
    const lArm = new THREE.Mesh(GEO_ARM, MAT_PHANTOM_CLOAK);
    lArm.position.y = -0.28;
    leftArmGroup.add(lArm);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.42, 0.62, 0);
    bodyGroup.add(rightArmGroup);
    const rArm = new THREE.Mesh(GEO_ARM, MAT_PHANTOM_CLOAK);
    rArm.position.y = -0.28;
    rightArmGroup.add(rArm);

    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.18, 0.75, 0);
    root.add(leftLegGroup);
    const lLeg = new THREE.Mesh(GEO_LEG, MAT_PHANTOM_CLOAK);
    lLeg.position.y = -0.32;
    leftLegGroup.add(lLeg);

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.18, 0.75, 0);
    root.add(rightLegGroup);
    const rLeg = new THREE.Mesh(GEO_LEG, MAT_PHANTOM_CLOAK);
    rLeg.position.y = -0.32;
    rightLegGroup.add(rLeg);

    root.scale.setScalar(config.scale);

    return {
        mesh: root,
        type: 'PHANTOM',
        carrierType: carrierType,
        config: config,
        health: config.hp,
        maxHealth: config.hp,
        speed: config.speed + (Math.random() * 0.3 - 0.15),
        radius: 0.75,
        shadowPhase: 0,
        animTime: Math.random() * 10,
        isAttacking: false,
        attackTimer: 0,
        bodyGroup: bodyGroup,
        headGroup: headGroup,
        leftLeg: leftLegGroup,
        rightLeg: rightLegGroup,
        leftArm: leftArmGroup,
        rightArm: rightArmGroup,
        meshes: [torso, head, lArm, rArm, lLeg, rLeg]
    };
}

function createCrawlerZombie(carrierType = null) {
    const config = ZOMBIE_TYPES.CRAWLER;
    const root = new THREE.Group();

    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.25, 0);
    root.add(bodyGroup);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.65), MAT_CRAWLER_FLESH);
    bodyGroup.add(torso);

    if (carrierType) {
        attachCarrierBackpack(bodyGroup, carrierType, { x: 0, y: 0.22, z: -0.22 }, 0.8);
    }

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.22, 0.38);
    bodyGroup.add(headGroup);

    const head = new THREE.Mesh(GEO_HEAD, MAT_CRAWLER_FLESH);
    head.scale.setScalar(0.9);
    headGroup.add(head);

    const eyeL = new THREE.Mesh(GEO_EYE, MAT_EYE_RED);
    eyeL.position.set(-0.1, 0.18, 0.2);
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(GEO_EYE, MAT_EYE_RED);
    eyeR.position.set(0.1, 0.18, 0.2);
    headGroup.add(eyeR);

    // Crawling Arms
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.38, 0.1, 0.15);
    bodyGroup.add(leftArmGroup);
    const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.55, 0.16), MAT_CRAWLER_FLESH);
    lArm.position.set(0, 0, 0.22);
    lArm.rotation.x = Math.PI / 2.5;
    leftArmGroup.add(lArm);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.38, 0.1, 0.15);
    bodyGroup.add(rightArmGroup);
    const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.55, 0.16), MAT_CRAWLER_FLESH);
    rArm.position.set(0, 0, 0.22);
    rArm.rotation.x = Math.PI / 2.5;
    rightArmGroup.add(rArm);

    root.scale.setScalar(config.scale);

    return {
        mesh: root,
        type: 'CRAWLER',
        carrierType: carrierType,
        config: config,
        health: config.hp,
        maxHealth: config.hp,
        speed: config.speed + (Math.random() * 0.3 - 0.15),
        radius: 0.6,
        animTime: Math.random() * 10,
        isAttacking: false,
        attackTimer: 0,
        bodyGroup: bodyGroup,
        headGroup: headGroup,
        leftArm: leftArmGroup,
        rightArm: rightArmGroup,
        meshes: [torso, head, lArm, rArm]
    };
}

function createBruteZombie(carrierType = null) {
    const config = ZOMBIE_TYPES.BRUTE;
    const root = new THREE.Group();

    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.9, 0);
    root.add(bodyGroup);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.95, 0.65), MAT_BRUTE_FLESH);
    torso.position.y = 0.45;
    bodyGroup.add(torso);

    if (carrierType) {
        attachCarrierBackpack(bodyGroup, carrierType, { x: 0, y: 0.45, z: -0.36 }, 1.25);
    }

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.0, 0.1);
    bodyGroup.add(headGroup);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), MAT_BRUTE_FLESH);
    headGroup.add(head);

    const eyeL = new THREE.Mesh(GEO_EYE, MAT_EYE_RED);
    eyeL.position.set(-0.14, 0.1, 0.26);
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(GEO_EYE, MAT_EYE_RED);
    eyeR.position.set(0.14, 0.1, 0.26);
    headGroup.add(eyeR);

    // Left Arm with Heavy Shield Slab
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.65, 0.75, 0.1);
    bodyGroup.add(leftArmGroup);
    const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.3), MAT_BRUTE_FLESH);
    lArm.position.y = -0.35;
    leftArmGroup.add(lArm);

    const shieldMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.4, 0.95), MAT_SHIELD_SLAB);
    shieldMesh.position.set(-0.15, -0.4, 0.35);
    shieldMesh.rotation.y = 0.15;
    leftArmGroup.add(shieldMesh);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.65, 0.75, 0);
    bodyGroup.add(rightArmGroup);
    const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.3), MAT_BRUTE_FLESH);
    rArm.position.y = -0.35;
    rightArmGroup.add(rArm);

    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.28, 0.9, 0);
    root.add(leftLegGroup);
    const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.8, 0.32), MAT_BRUTE_ARMOR);
    lLeg.position.y = -0.4;
    leftLegGroup.add(lLeg);

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.28, 0.9, 0);
    root.add(rightLegGroup);
    const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.8, 0.32), MAT_BRUTE_ARMOR);
    rLeg.position.y = -0.4;
    rightLegGroup.add(rLeg);

    root.scale.setScalar(config.scale);

    return {
        mesh: root,
        type: 'BRUTE',
        carrierType: carrierType,
        config: config,
        health: config.hp,
        maxHealth: config.hp,
        speed: config.speed + (Math.random() * 0.2 - 0.1),
        radius: 1.1,
        animTime: Math.random() * 10,
        isAttacking: false,
        attackTimer: 0,
        bodyGroup: bodyGroup,
        headGroup: headGroup,
        leftLeg: leftLegGroup,
        rightLeg: rightLegGroup,
        leftArm: leftArmGroup,
        rightArm: rightArmGroup,
        shieldMesh: shieldMesh,
        meshes: [torso, head, lArm, rArm, lLeg, rLeg, shieldMesh]
    };
}

function createScreamerZombie(carrierType = null) {
    const config = ZOMBIE_TYPES.SCREAMER;
    const root = new THREE.Group();

    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.75, 0);
    root.add(bodyGroup);

    const torso = new THREE.Mesh(GEO_TORSO, MAT_SCREAMER_ROBE);
    torso.position.y = 0.35;
    bodyGroup.add(torso);

    if (carrierType) {
        attachCarrierBackpack(bodyGroup, carrierType, { x: 0, y: 0.38, z: -0.26 }, 1.0);
    }

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.8, 0);
    bodyGroup.add(headGroup);

    const head = new THREE.Mesh(GEO_HEAD, MAT_SCREAMER_FLESH);
    head.position.y = 0.22;
    headGroup.add(head);

    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.28, 0.3), MAT_SCREAMER_FLESH);
    jaw.position.set(0, -0.05, 0.18);
    jaw.rotation.x = 0.55;
    headGroup.add(jaw);

    const auraRing = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.04, 5, 10), MAT_SCREAMER_AURA);
    auraRing.position.set(0, 0.5, 0);
    auraRing.rotation.x = Math.PI / 2;
    headGroup.add(auraRing);

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.45, 0.62, 0);
    bodyGroup.add(leftArmGroup);
    const lArm = new THREE.Mesh(GEO_ARM, MAT_SCREAMER_ROBE);
    lArm.position.y = -0.28;
    leftArmGroup.add(lArm);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.45, 0.62, 0);
    bodyGroup.add(rightArmGroup);
    const rArm = new THREE.Mesh(GEO_ARM, MAT_SCREAMER_ROBE);
    rArm.position.y = -0.28;
    rightArmGroup.add(rArm);

    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.18, 0.75, 0);
    root.add(leftLegGroup);
    const lLeg = new THREE.Mesh(GEO_LEG, MAT_SCREAMER_ROBE);
    lLeg.position.y = -0.32;
    leftLegGroup.add(lLeg);

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.18, 0.75, 0);
    root.add(rightLegGroup);
    const rLeg = new THREE.Mesh(GEO_LEG, MAT_SCREAMER_ROBE);
    rLeg.position.y = -0.32;
    rightLegGroup.add(rLeg);

    root.scale.setScalar(config.scale);

    return {
        mesh: root,
        type: 'SCREAMER',
        carrierType: carrierType,
        config: config,
        health: config.hp,
        maxHealth: config.hp,
        speed: config.speed + (Math.random() * 0.3 - 0.15),
        radius: 0.8,
        screechTimer: 0,
        screechInterval: 3.2,
        animTime: Math.random() * 10,
        isAttacking: false,
        attackTimer: 0,
        bodyGroup: bodyGroup,
        headGroup: headGroup,
        leftLeg: leftLegGroup,
        rightLeg: rightLegGroup,
        leftArm: leftArmGroup,
        rightArm: rightArmGroup,
        auraRing: auraRing,
        meshes: [torso, head, jaw, lArm, rArm, lLeg, rLeg]
    };
}

function createStagZombie(carrierType = null) {
    const config = ZOMBIE_TYPES.STAG;
    const root = new THREE.Group();

    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.65, 0);
    root.add(bodyGroup);

    // Lean athletic deer torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 1.1), MAT_STAG_HIDE);
    bodyGroup.add(torso);

    // Exposed ribcage
    for (let r = 0; r < 4; r++) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.07, 0.1), MAT_STAG_BONE);
        rib.position.set(0, 0.1, 0.3 - r * 0.2);
        bodyGroup.add(rib);
    }

    if (carrierType) {
        attachCarrierBackpack(bodyGroup, carrierType, { x: 0, y: 0.32, z: -0.15 }, 0.85);
    }

    // Arched neck & horned skull
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.55, 0.65);
    bodyGroup.add(headGroup);

    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.45, 0.3), MAT_STAG_HIDE);
    neck.position.set(0, -0.15, -0.08);
    neck.rotation.x = Math.PI / 6;
    headGroup.add(neck);

    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.26, 0.45), MAT_STAG_HIDE);
    headGroup.add(skull);

    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.3), MAT_STAG_BONE);
    snout.position.set(0, -0.05, 0.32);
    headGroup.add(snout);

    // Skeletal branching antlers
    const antlerL = new THREE.Group();
    antlerL.position.set(-0.16, 0.22, 0);
    headGroup.add(antlerL);
    const mainBeamL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 0.06), MAT_STAG_ANTLER);
    mainBeamL.position.set(-0.12, 0.25, -0.05);
    mainBeamL.rotation.z = -0.35;
    mainBeamL.rotation.x = -0.2;
    antlerL.add(mainBeamL);
    const tineL1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.25, 0.05), MAT_STAG_ANTLER);
    tineL1.position.set(-0.18, 0.3, 0.08);
    tineL1.rotation.x = 0.5;
    antlerL.add(tineL1);

    const antlerR = new THREE.Group();
    antlerR.position.set(0.16, 0.22, 0);
    headGroup.add(antlerR);
    const mainBeamR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 0.06), MAT_STAG_ANTLER);
    mainBeamR.position.set(0.12, 0.25, -0.05);
    mainBeamR.rotation.z = 0.35;
    mainBeamR.rotation.x = -0.2;
    antlerR.add(mainBeamR);
    const tineR1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.25, 0.05), MAT_STAG_ANTLER);
    tineR1.position.set(0.18, 0.3, 0.08);
    tineR1.rotation.x = 0.5;
    antlerR.add(tineR1);

    const eyeL = new THREE.Mesh(GEO_EYE, MAT_EYE_RED);
    eyeL.position.set(-0.15, 0.08, 0.16);
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(GEO_EYE, MAT_EYE_RED);
    eyeR.position.set(0.15, 0.08, 0.16);
    headGroup.add(eyeR);

    // 4 Articulated Slender Legs
    const flLeg = new THREE.Group();
    flLeg.position.set(-0.18, 0.65, 0.4);
    root.add(flLeg);
    const flMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.7, 0.14), MAT_STAG_HIDE);
    flMesh.position.y = -0.35;
    flLeg.add(flMesh);

    const frLeg = new THREE.Group();
    frLeg.position.set(0.18, 0.65, 0.4);
    root.add(frLeg);
    const frMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.7, 0.14), MAT_STAG_HIDE);
    frMesh.position.y = -0.35;
    frLeg.add(frMesh);

    const blLeg = new THREE.Group();
    blLeg.position.set(-0.18, 0.65, -0.4);
    root.add(blLeg);
    const blMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.16), MAT_STAG_HIDE);
    blMesh.position.y = -0.35;
    blLeg.add(blMesh);

    const brLeg = new THREE.Group();
    brLeg.position.set(0.18, 0.65, -0.4);
    root.add(brLeg);
    const brMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.16), MAT_STAG_HIDE);
    brMesh.position.y = -0.35;
    brLeg.add(brMesh);

    root.scale.setScalar(config.scale);

    return {
        mesh: root,
        type: 'STAG',
        carrierType: carrierType,
        config: config,
        health: config.hp,
        maxHealth: config.hp,
        speed: config.speed + (Math.random() * 0.4 - 0.2),
        radius: 0.8,
        animTime: Math.random() * 10,
        isAttacking: false,
        attackTimer: 0,
        isJumping: false,
        jumpTimer: 0,
        jumpDuration: 0.55,
        jumpHeight: 2.0,
        bodyGroup: bodyGroup,
        headGroup: headGroup,
        flLeg: flLeg,
        frLeg: frLeg,
        blLeg: blLeg,
        brLeg: brLeg,
        meshes: [torso, skull, snout, flMesh, frMesh, blMesh, brMesh]
    };
}

function createHorseZombie(carrierType = null) {
    const config = ZOMBIE_TYPES.HORSE;
    const root = new THREE.Group();

    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.85, 0);
    root.add(bodyGroup);

    // Powerful equine muscular torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.7, 1.45), MAT_HORSE_HIDE);
    bodyGroup.add(torso);

    const mane = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.45, 0.8), MAT_HORSE_MANE);
    mane.position.set(0, 0.45, 0.1);
    bodyGroup.add(mane);

    if (carrierType) {
        attachCarrierBackpack(bodyGroup, carrierType, { x: 0, y: 0.45, z: -0.25 }, 1.1);
    }

    // Long arched neck & rotting horse skull
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.75, 0.85);
    bodyGroup.add(headGroup);

    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.65, 0.45), MAT_HORSE_HIDE);
    neck.position.set(0, -0.2, -0.1);
    neck.rotation.x = Math.PI / 5;
    headGroup.add(neck);

    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.65), MAT_HORSE_HIDE);
    skull.position.set(0, 0.1, 0.2);
    headGroup.add(skull);

    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.26, 0.4), MAT_HORSE_HIDE);
    snout.position.set(0, -0.02, 0.65);
    headGroup.add(snout);

    const eyeL = new THREE.Mesh(GEO_EYE, MAT_EYE_YELLOW);
    eyeL.position.set(-0.2, 0.22, 0.25);
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(GEO_EYE, MAT_EYE_YELLOW);
    eyeR.position.set(0.2, 0.22, 0.25);
    headGroup.add(eyeR);

    // 4 Articulated Galloping Horse Legs with Hooves
    const flLeg = new THREE.Group();
    flLeg.position.set(-0.26, 0.85, 0.55);
    root.add(flLeg);
    const flMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.9, 0.2), MAT_HORSE_HIDE);
    flMesh.position.y = -0.45;
    flLeg.add(flMesh);
    const flHoof = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.24), MAT_HORSE_HOOF);
    flHoof.position.set(0, -0.85, 0.02);
    flLeg.add(flHoof);

    const frLeg = new THREE.Group();
    frLeg.position.set(0.26, 0.85, 0.55);
    root.add(frLeg);
    const frMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.9, 0.2), MAT_HORSE_HIDE);
    frMesh.position.y = -0.45;
    frLeg.add(frMesh);
    const frHoof = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.24), MAT_HORSE_HOOF);
    frHoof.position.set(0, -0.85, 0.02);
    frLeg.add(frHoof);

    const blLeg = new THREE.Group();
    blLeg.position.set(-0.26, 0.85, -0.55);
    root.add(blLeg);
    const blMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.9, 0.22), MAT_HORSE_HIDE);
    blMesh.position.y = -0.45;
    blLeg.add(blMesh);
    const blHoof = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.26), MAT_HORSE_HOOF);
    blHoof.position.set(0, -0.85, 0.02);
    blLeg.add(blHoof);

    const brLeg = new THREE.Group();
    brLeg.position.set(0.26, 0.85, -0.55);
    root.add(brLeg);
    const brMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.9, 0.22), MAT_HORSE_HIDE);
    brMesh.position.y = -0.45;
    brLeg.add(brMesh);
    const brHoof = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.26), MAT_HORSE_HOOF);
    brHoof.position.set(0, -0.85, 0.02);
    brLeg.add(brHoof);

    root.scale.setScalar(config.scale);

    return {
        mesh: root,
        type: 'HORSE',
        carrierType: carrierType,
        config: config,
        health: config.hp,
        maxHealth: config.hp,
        speed: config.speed + (Math.random() * 0.3 - 0.15),
        radius: 1.0,
        animTime: Math.random() * 10,
        isAttacking: false,
        attackTimer: 0,
        isJumping: false,
        bodyGroup: bodyGroup,
        headGroup: headGroup,
        flLeg: flLeg,
        frLeg: frLeg,
        blLeg: blLeg,
        brLeg: brLeg,
        meshes: [torso, mane, skull, snout, flMesh, frMesh, blMesh, brMesh]
    };
}

function createBearZombie(carrierType = null) {
    const config = ZOMBIE_TYPES.BEAR;
    const root = new THREE.Group();

    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.9, 0);
    root.add(bodyGroup);

    // Massive hulking bear torso with hump shoulders
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.85, 1.5), MAT_BEAR_PELT);
    bodyGroup.add(torso);

    const shoulderHump = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.55, 0.7), MAT_BEAR_PELT);
    shoulderHump.position.set(0, 0.45, 0.3);
    bodyGroup.add(shoulderHump);

    const chestSlash = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.1), MAT_BEAR_FLESH);
    chestSlash.position.set(0, 0.1, 0.76);
    bodyGroup.add(chestSlash);

    if (carrierType) {
        attachCarrierBackpack(bodyGroup, carrierType, { x: 0, y: 0.55, z: -0.35 }, 1.2);
    }

    // Wide massive skull with fangs
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.45, 0.95);
    bodyGroup.add(headGroup);

    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), MAT_BEAR_PELT);
    headGroup.add(skull);

    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.45), MAT_BEAR_FLESH);
    snout.position.set(0, -0.1, 0.45);
    headGroup.add(snout);

    const teeth = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.35), MAT_HOUND_TEETH);
    teeth.position.set(0, -0.22, 0.48);
    headGroup.add(teeth);

    const eyeL = new THREE.Mesh(GEO_EYE, MAT_EYE_RED);
    eyeL.position.set(-0.25, 0.15, 0.32);
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(GEO_EYE, MAT_EYE_RED);
    eyeR.position.set(0.25, 0.15, 0.32);
    headGroup.add(eyeR);

    // Heavy clawed forelegs and stout hind legs
    const flLeg = new THREE.Group();
    flLeg.position.set(-0.4, 0.9, 0.55);
    root.add(flLeg);
    const flMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.95, 0.32), MAT_BEAR_PELT);
    flMesh.position.y = -0.45;
    flLeg.add(flMesh);
    const flClaw = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.25), MAT_BEAR_CLAW);
    flClaw.position.set(0, -0.9, 0.15);
    flLeg.add(flClaw);

    const frLeg = new THREE.Group();
    frLeg.position.set(0.4, 0.9, 0.55);
    root.add(frLeg);
    const frMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.95, 0.32), MAT_BEAR_PELT);
    frMesh.position.y = -0.45;
    frLeg.add(frMesh);
    const frClaw = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.25), MAT_BEAR_CLAW);
    frClaw.position.set(0, -0.9, 0.15);
    frLeg.add(frClaw);

    const blLeg = new THREE.Group();
    blLeg.position.set(-0.38, 0.9, -0.55);
    root.add(blLeg);
    const blMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.95, 0.34), MAT_BEAR_PELT);
    blMesh.position.y = -0.45;
    blLeg.add(blMesh);

    const brLeg = new THREE.Group();
    brLeg.position.set(0.38, 0.9, -0.55);
    root.add(brLeg);
    const brMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.95, 0.34), MAT_BEAR_PELT);
    brMesh.position.y = -0.45;
    brLeg.add(brMesh);

    root.scale.setScalar(config.scale);

    return {
        mesh: root,
        type: 'BEAR',
        carrierType: carrierType,
        config: config,
        health: config.hp,
        maxHealth: config.hp,
        speed: config.speed + (Math.random() * 0.2 - 0.1),
        radius: 1.15,
        animTime: Math.random() * 10,
        isAttacking: false,
        attackTimer: 0,
        isEnraged: false,
        frenzyTimer: 0,
        isJumping: false,
        bodyGroup: bodyGroup,
        headGroup: headGroup,
        flLeg: flLeg,
        frLeg: frLeg,
        blLeg: blLeg,
        brLeg: brLeg,
        eyeL: eyeL,
        eyeR: eyeR,
        meshes: [torso, shoulderHump, skull, snout, flMesh, frMesh, blMesh, brMesh]
    };
}

function createLowPolyZombie(typeKey = 'WALKER', carrierType = null) {
    let zombieObj;
    if (typeKey === 'HOUND') zombieObj = createHoundZombie(carrierType);
    else if (typeKey === 'SEEKER') zombieObj = createSeekerZombie(carrierType);
    else if (typeKey === 'SPITTER') zombieObj = createSpitterZombie(carrierType);
    else if (typeKey === 'PHANTOM') zombieObj = createPhantomZombie(carrierType);
    else if (typeKey === 'CRAWLER') zombieObj = createCrawlerZombie(carrierType);
    else if (typeKey === 'BRUTE') zombieObj = createBruteZombie(carrierType);
    else if (typeKey === 'SCREAMER') zombieObj = createScreamerZombie(carrierType);
    else if (typeKey === 'STAG') zombieObj = createStagZombie(carrierType);
    else if (typeKey === 'HORSE') zombieObj = createHorseZombie(carrierType);
    else if (typeKey === 'BEAR') zombieObj = createBearZombie(carrierType);
    else {
        const config = ZOMBIE_TYPES[typeKey] || ZOMBIE_TYPES.WALKER;
        const root = new THREE.Group();

        const bodyGroup = new THREE.Group();
        bodyGroup.position.set(0, 0.75, 0);
        root.add(bodyGroup);

        const torso = new THREE.Mesh(GEO_TORSO, config.shirtMat);
        torso.position.y = 0.35;
        bodyGroup.add(torso);

        if (typeKey === 'TANK') {
            const armorPlate = new THREE.Mesh(GEO_TANK_ARMOR, MAT_TANK_ARMOR);
            armorPlate.position.y = 0.36;
            bodyGroup.add(armorPlate);
        }

        if (carrierType) {
            attachCarrierBackpack(bodyGroup, carrierType, { x: 0, y: 0.38, z: -0.26 }, 1.0);
        }

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.78, 0);
        bodyGroup.add(headGroup);

        const head = new THREE.Mesh(GEO_HEAD, config.fleshMat);
        head.position.y = 0.22;
        headGroup.add(head);

        const jaw = new THREE.Mesh(GEO_JAW, config.fleshMat);
        jaw.position.set(0, 0.06, 0.12);
        headGroup.add(jaw);

        const eyeL = new THREE.Mesh(GEO_EYE, config.eyeMat);
        eyeL.position.set(-0.11, 0.26, 0.21);
        headGroup.add(eyeL);

        const eyeR = new THREE.Mesh(GEO_EYE, config.eyeMat);
        eyeR.position.set(0.11, 0.26, 0.21);
        headGroup.add(eyeR);

        // Arms
        const leftArmGroup = new THREE.Group();
        leftArmGroup.position.set(-0.42, 0.62, 0);
        bodyGroup.add(leftArmGroup);
        const lArmMesh = new THREE.Mesh(GEO_ARM, config.shirtMat);
        lArmMesh.position.y = -0.28;
        leftArmGroup.add(lArmMesh);
        const lHandMesh = new THREE.Mesh(GEO_HAND, config.fleshMat);
        lHandMesh.position.set(0, -0.65, 0.04);
        leftArmGroup.add(lHandMesh);

        const rightArmGroup = new THREE.Group();
        rightArmGroup.position.set(0.42, 0.62, 0);
        bodyGroup.add(rightArmGroup);
        const rArmMesh = new THREE.Mesh(GEO_ARM, config.shirtMat);
        rArmMesh.position.y = -0.28;
        rightArmGroup.add(rArmMesh);
        const rHandMesh = new THREE.Mesh(GEO_HAND, config.fleshMat);
        rHandMesh.position.set(0, -0.65, 0.04);
        rightArmGroup.add(rHandMesh);

        leftArmGroup.rotation.x = -Math.PI / 2.2;
        rightArmGroup.rotation.x = -Math.PI / 2.2;

        // Legs
        const leftLegGroup = new THREE.Group();
        leftLegGroup.position.set(-0.18, 0.75, 0);
        root.add(leftLegGroup);
        const lLegMesh = new THREE.Mesh(GEO_LEG, config.pantsMat);
        lLegMesh.position.y = -0.32;
        leftLegGroup.add(lLegMesh);

        const rightLegGroup = new THREE.Group();
        rightLegGroup.position.set(0.18, 0.75, 0);
        root.add(rightLegGroup);
        const rLegMesh = new THREE.Mesh(GEO_LEG, config.pantsMat);
        rLegMesh.position.y = -0.32;
        rightLegGroup.add(rLegMesh);

        root.scale.setScalar(config.scale);

        zombieObj = {
            mesh: root,
            type: typeKey,
            carrierType: carrierType,
            config: config,
            health: config.hp,
            maxHealth: config.hp,
            speed: config.speed + (Math.random() * 0.3 - 0.15),
            radius: 0.75 * config.scale,
            animTime: Math.random() * 10,
            isAttacking: false,
            attackTimer: 0,
            isJumping: false,
            jumpTimer: 0,
            jumpDuration: 0.6,
            bodyGroup: bodyGroup,
            headGroup: headGroup,
            leftLeg: leftLegGroup,
            rightLeg: rightLegGroup,
            leftArm: leftArmGroup,
            rightArm: rightArmGroup,
            meshes: [torso, head, jaw, lArmMesh, lHandMesh, rArmMesh, rHandMesh, lLegMesh, rLegMesh]
        };
    }
    initZombieMaterials(zombieObj);
    return zombieObj;
}

// ============================================================================
// 4.1 REFERENCE-MATCHED 3D BOSS FACTORIES
// ============================================================================

// BOSS 1: THE HUNTER (WAVE 5) - REFERENCE: Feral camouflaged predator in dark weathered hooded vest, decayed olive-grey flesh, muted wraps, blending into the wasteland terrain
function createHunterBoss() {
    const maxHp = 35 + currentWave * 8;
    const root = new THREE.Group();

    // Camouflage materials that blend seamlessly into dark slate soil, rock shadows, and night environment
    const fleshMat = new THREE.MeshLambertMaterial({ color: 0x3d4a3e, emissive: 0x1f2920, emissiveIntensity: 0.15 }); // Muted decayed olive-grey flesh
    const camoHoodieMat = new THREE.MeshLambertMaterial({ color: 0x222933, emissive: 0x11161d, emissiveIntensity: 0.1 }); // Faded dark slate-charcoal hooded vest
    const bloodSlashMat = new THREE.MeshLambertMaterial({ color: 0x450a0a, emissive: 0x200404, emissiveIntensity: 0.1 }); // Dark clotted dried blood
    const darkShortsMat = new THREE.MeshLambertMaterial({ color: 0x18181b }); // Muddy dark charcoal shorts
    const camoTapeMat = new THREE.MeshLambertMaterial({ color: 0x475569, emissive: 0x27272a, emissiveIntensity: 0.1 }); // Weathered grimy slate wrap tape
    const clawMat = new THREE.MeshLambertMaterial({ color: 0x09090b }); // Jet black claws
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xb91c1c }); // Faint blood-red eyes
    const teethMat = new THREE.MeshBasicMaterial({ color: 0xa8a29e }); // Dull stained predator fangs
    const bootMat = new THREE.MeshLambertMaterial({ color: 0x0f172a }); // Dark combat boots

    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.75, 0);
    root.add(bodyGroup);

    // 1. Torso: Athletic upper torso with dark camouflage sleeveless hoodie & bloodied chest slash
    const vestChest = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.68, 0.42), camoHoodieMat);
    vestChest.position.y = 0.42;
    bodyGroup.add(vestChest);

    const bloodSlash = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.04), bloodSlashMat);
    bloodSlash.position.set(0, 0.42, 0.22);
    bodyGroup.add(bloodSlash);

    // Athletic waistband / pelvis
    const waist = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.24, 0.38), darkShortsMat);
    waist.position.y = 0.04;
    bodyGroup.add(waist);

    // 2. Head: Decaying olive head, dark cowl, glinting eyes & snarling fangs
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.82, 0.08);
    bodyGroup.add(headGroup);

    // Dark hood cowl covering top and back of head
    const hoodCowl = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.44, 0.46), camoHoodieMat);
    hoodCowl.position.set(0, 0.18, -0.04);
    headGroup.add(hoodCowl);

    // Exposed decaying zombie face in front
    const face = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.36, 0.36), fleshMat);
    face.position.set(0, 0.16, 0.08);
    headGroup.add(face);

    // Snarling jaw
    const snarlingJaw = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.24), fleshMat);
    snarlingJaw.position.set(0, 0.02, 0.22);
    snarlingJaw.rotation.x = 0.2;
    headGroup.add(snarlingJaw);

    // Fangs
    const fangs = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.18), teethMat);
    fangs.position.set(0, 0.05, 0.24);
    headGroup.add(fangs);

    // Faint glinting red eyes
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.06), eyeMat);
    eyeL.position.set(-0.12, 0.22, 0.27);
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.06), eyeMat);
    eyeR.position.set(0.12, 0.22, 0.27);
    headGroup.add(eyeR);

    // 3. Articulated Arms: Reaching forward, olive flesh, weathered slate wraps & black claws
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.46, 0.62, 0.04);
    bodyGroup.add(leftArmGroup);

    const lUpperArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.48, 0.2), fleshMat);
    lUpperArm.position.y = -0.22;
    leftArmGroup.add(lUpperArm);

    const lForearm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.46, 0.18), fleshMat);
    lForearm.position.set(0, -0.58, 0.08);
    lForearm.rotation.x = Math.PI / 4.5;
    leftArmGroup.add(lForearm);

    // Weathered slate forearm bandage wrap
    const lTape = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.24), camoTapeMat);
    lTape.position.set(0, -0.54, 0.08);
    lTape.rotation.x = Math.PI / 4.5;
    leftArmGroup.add(lTape);

    // Extended sharp black claws
    const lClaw = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.55, 4), clawMat);
    lClaw.position.set(0, -0.88, 0.24);
    lClaw.rotation.x = Math.PI / 2.2;
    leftArmGroup.add(lClaw);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.46, 0.62, 0.04);
    bodyGroup.add(rightArmGroup);

    const rUpperArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.48, 0.2), fleshMat);
    rUpperArm.position.y = -0.22;
    rightArmGroup.add(rUpperArm);

    const rForearm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.46, 0.18), fleshMat);
    rForearm.position.set(0, -0.58, 0.08);
    rForearm.rotation.x = Math.PI / 4.5;
    rightArmGroup.add(rForearm);

    const rTape = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.24), camoTapeMat);
    rTape.position.set(0, -0.54, 0.08);
    rTape.rotation.x = Math.PI / 4.5;
    rightArmGroup.add(rTape);

    const rClaw = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.55, 4), clawMat);
    rClaw.position.set(0, -0.88, 0.24);
    rClaw.rotation.x = Math.PI / 2.2;
    rightArmGroup.add(rClaw);

    leftArmGroup.rotation.x = -Math.PI / 2.2;
    rightArmGroup.rotation.x = -Math.PI / 2.2;

    // 4. Articulated Legs: Dark athletic shorts, slate knee tape, olive shins & running boots
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.22, 0.75, 0);
    root.add(leftLegGroup);

    const lThigh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.45, 0.25), darkShortsMat);
    lThigh.position.y = -0.2;
    leftLegGroup.add(lThigh);

    const lKneeTape = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.18, 0.29), camoTapeMat);
    lKneeTape.position.set(0, -0.4, 0.02);
    leftLegGroup.add(lKneeTape);

    const lShin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.42, 0.2), fleshMat);
    lShin.position.set(0, -0.6, 0.02);
    leftLegGroup.add(lShin);

    const lFoot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.36), bootMat);
    lFoot.position.set(0, -0.78, 0.08);
    leftLegGroup.add(lFoot);

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.22, 0.75, 0);
    root.add(rightLegGroup);

    const rThigh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.45, 0.25), darkShortsMat);
    rThigh.position.y = -0.2;
    rightLegGroup.add(rThigh);

    const rKneeTape = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.18, 0.29), camoTapeMat);
    rKneeTape.position.set(0, -0.4, 0.02);
    rightLegGroup.add(rKneeTape);

    const rShin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.42, 0.2), fleshMat);
    rShin.position.set(0, -0.6, 0.02);
    rightLegGroup.add(rShin);

    const rFoot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.36), bootMat);
    rFoot.position.set(0, -0.78, 0.08);
    rightLegGroup.add(rFoot);

    root.scale.setScalar(1.0);

    const spawnAngle = Math.random() * Math.PI * 2;
    const sx = Math.cos(spawnAngle) * 23.0;
    const sz = Math.sin(spawnAngle) * 23.0;
    const groundY = getTerrainHeight(sx, sz);
    root.position.set(sx, groundY, sz);
    scene.add(root);

    return {
        mesh: root,
        isBoss: true,
        bossType: 'HUNTER',
        name: 'THE HUNTER',
        subtitle: 'SHADOW CAMOUFLAGE PREDATOR',
        config: {
            fleshColor: 0x3d4a3e,
            scoreVal: 250,
            attackDamage: 22,
            attackInterval: 0.1,
            speed: 6.2,
            scale: 1.0,
            animSpeed: 16.0
        },
        health: maxHp,
        maxHealth: maxHp,
        speed: 6.2,
        radius: 0.75,
        animTime: 0,
        state: 'CIRCLING',
        stateTimer: 0,
        circleAngle: spawnAngle,
        circleRadius: 23.0,
        circleTimer: 0,
        circleDuration: 3.5,
        isJumping: false,
        jumpTimer: 0,
        jumpDuration: 0.65,
        jumpHeight: 2.2,
        isScaling: false,
        scaleTimer: 0,
        scaleDuration: 0.85,
        scaleHeight: 3.5,
        zigZagPhase: Math.random() * 10,
        leapStartX: 0,
        leapStartZ: 0,
        leapTargetX: 0,
        leapTargetZ: 0,
        bodyGroup: bodyGroup,
        headGroup: headGroup,
        leftLeg: leftLegGroup,
        rightLeg: rightLegGroup,
        leftArm: leftArmGroup,
        rightArm: rightArmGroup,
        meshes: [vestChest, waist, hoodCowl, face, snarlingJaw, lUpperArm, lForearm, rUpperArm, rForearm, lThigh, rThigh, lShin, rShin]
    };
}

// BOSS 2: THE JUGGERNAUT (WAVE 10) - REFERENCE: Purple Mutant Gore Bull with 4 Wide Articulated Galloping Legs, Dorsal Spine Spikes & Front Horns
function createJuggernautBoss() {
    const maxHp = 60 + currentWave * 10;
    const root = new THREE.Group();

    // High-contrast mutant purple gore and bone materials
    const goreMuscleMat = new THREE.MeshLambertMaterial({ color: 0x9333ea, emissive: 0x581c87, emissiveIntensity: 0.35 }); // Vibrant purple gore
    const darkTendonMat = new THREE.MeshLambertMaterial({ color: 0x4c0519 }); // Dark crimson tendon
    const flankWeakMat = new THREE.MeshLambertMaterial({ color: 0xc084fc, emissive: 0x9333ea, emissiveIntensity: 0.5 }); // Neon purple exposed flank (weakness)
    const boneSpikeMat = new THREE.MeshLambertMaterial({ color: 0xfde047, emissive: 0xf59e0b, emissiveIntensity: 0.55 }); // Glowing amber bone
    const hornMat = new THREE.MeshLambertMaterial({ color: 0x09090b }); // Jet black horn
    const redEyeMat = new THREE.MeshBasicMaterial({ color: 0xff0022 }); // Demonic red eyes
    const teethMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // Predator yellow teeth
    const hoofMat = new THREE.MeshLambertMaterial({ color: 0x18181b }); // Heavy black hooves

    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 1.15, 0);
    root.add(bodyGroup);

    // 1. Sculpted Muscular Bull Torso: Shoulder withers hump, tapered waist, haunches rump
    const withersHump = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.4, 1.3), goreMuscleMat);
    withersHump.position.set(0, 0.48, 0.5);
    bodyGroup.add(withersHump);

    const waistMid = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.0, 0.95), darkTendonMat);
    waistMid.position.set(0, 0.35, -0.15);
    bodyGroup.add(waistMid);

    const pelvisRump = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.2, 1.05), goreMuscleMat);
    pelvisRump.position.set(0, 0.42, -0.85);
    bodyGroup.add(pelvisRump);

    // Exposed Flank Rib Striations (Visual cue for Side Weakpoint 2x Crit!)
    const leftRibs = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.75, 1.5), flankWeakMat);
    leftRibs.position.set(-0.7, 0.38, 0);
    bodyGroup.add(leftRibs);

    const rightRibs = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.75, 1.5), flankWeakMat);
    rightRibs.position.set(0.7, 0.38, 0);
    bodyGroup.add(rightRibs);

    // Raised mutant tail
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 1.2), darkTendonMat);
    tail.position.set(0, 0.75, -1.6);
    tail.rotation.x = -0.35;
    bodyGroup.add(tail);

    const tailTuft = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 4), goreMuscleMat);
    tailTuft.position.set(0, 0.95, -2.1);
    tailTuft.rotation.x = -Math.PI / 2.5;
    bodyGroup.add(tailTuft);

    // 2. 7 Serrated Dorsal Bone Spine Spikes (Rising along spine)
    for (let i = 0; i < 7; i++) {
        const spikeHeight = (i === 2 || i === 3) ? 1.05 : (i === 1 || i === 4 ? 0.85 : 0.65);
        const spineSpike = new THREE.Mesh(new THREE.ConeGeometry(0.18, spikeHeight, 4), boneSpikeMat);
        spineSpike.position.set(0, 1.22 + spikeHeight * 0.45, 1.15 - i * 0.38);
        spineSpike.rotation.x = -0.18;
        bodyGroup.add(spineSpike);
    }

    // 3. Lowered Demonic Bull Head, Armored Brow Plate & Forward Black Horns
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.45, 1.65);
    bodyGroup.add(headGroup);

    const skull = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.92, 1.15), goreMuscleMat);
    headGroup.add(skull);

    // Heavy Armored Forehead Brow Plate (Visual cue for armored front/reduced damage)
    const browPlate = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.28, 0.7), darkTendonMat);
    browPlate.position.set(0, 0.42, 0.15);
    headGroup.add(browPlate);

    const upperSnout = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.48, 0.8), darkTendonMat);
    upperSnout.position.set(0, 0.05, 0.75);
    headGroup.add(upperSnout);

    // Gaping Lower Jaw
    const lowerJaw = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.32, 0.8), darkTendonMat);
    lowerJaw.position.set(0, -0.35, 0.7);
    lowerJaw.rotation.x = 0.28;
    headGroup.add(lowerJaw);

    // Yellow Predator Teeth
    const teethTop = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 0.7), teethMat);
    teethTop.position.set(0, -0.1, 0.75);
    headGroup.add(teethTop);

    const teethBottom = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.08, 0.7), teethMat);
    teethBottom.position.set(0, -0.22, 0.7);
    headGroup.add(teethBottom);

    // Glowing Demonic Red Eyes
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.08), redEyeMat);
    eyeL.position.set(-0.44, 0.24, 0.55);
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.08), redEyeMat);
    eyeR.position.set(0.44, 0.24, 0.55);
    headGroup.add(eyeR);

    // Massive Swept Forward & Outward Black Horns
    const leftHorn = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.7, 5), hornMat);
    leftHorn.position.set(-0.8, 0.58, 0.35);
    leftHorn.rotation.set(Math.PI / 3.6, 0, -Math.PI / 3.2);
    headGroup.add(leftHorn);

    const rightHorn = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.7, 5), hornMat);
    rightHorn.position.set(0.8, 0.58, 0.35);
    rightHorn.rotation.set(Math.PI / 3.6, 0, Math.PI / 3.2);
    headGroup.add(rightHorn);

    // 4. Wide-Mounted Articulated 4 Galloping Legs (Mounted at X = ±1.25, fully outside torso)
    // Front-Left Leg
    const flLegGroup = new THREE.Group();
    flLegGroup.position.set(-1.25, 1.15, 0.85);
    root.add(flLegGroup);
    const flThigh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.72, 0.5), goreMuscleMat);
    flThigh.position.y = -0.32;
    flLegGroup.add(flThigh);
    const flShin = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.65, 0.38), darkTendonMat);
    flShin.position.set(0, -0.76, 0.04);
    flLegGroup.add(flShin);
    const flHoof = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.28, 0.62), hoofMat);
    flHoof.position.set(0, -1.06, 0.08);
    flLegGroup.add(flHoof);

    // Front-Right Leg
    const frLegGroup = new THREE.Group();
    frLegGroup.position.set(1.25, 1.15, 0.85);
    root.add(frLegGroup);
    const frThigh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.72, 0.5), goreMuscleMat);
    frThigh.position.y = -0.32;
    frLegGroup.add(frThigh);
    const frShin = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.65, 0.38), darkTendonMat);
    frShin.position.set(0, -0.76, 0.04);
    frLegGroup.add(frShin);
    const frHoof = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.28, 0.62), hoofMat);
    frHoof.position.set(0, -1.06, 0.08);
    frLegGroup.add(frHoof);

    // Back-Left Leg
    const blLegGroup = new THREE.Group();
    blLegGroup.position.set(-1.2, 1.15, -0.85);
    root.add(blLegGroup);
    const blThigh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.72, 0.5), goreMuscleMat);
    blThigh.position.y = -0.32;
    blLegGroup.add(blThigh);
    const blShin = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.65, 0.38), darkTendonMat);
    blShin.position.set(0, -0.76, -0.04);
    blLegGroup.add(blShin);
    const blHoof = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.28, 0.62), hoofMat);
    blHoof.position.set(0, -1.06, 0.04);
    blLegGroup.add(blHoof);

    // Back-Right Leg
    const brLegGroup = new THREE.Group();
    brLegGroup.position.set(1.2, 1.15, -0.85);
    root.add(brLegGroup);
    const brThigh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.72, 0.5), goreMuscleMat);
    brThigh.position.y = -0.32;
    brLegGroup.add(brThigh);
    const brShin = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.65, 0.38), darkTendonMat);
    brShin.position.set(0, -0.76, -0.04);
    brLegGroup.add(brShin);
    const brHoof = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.28, 0.62), hoofMat);
    brHoof.position.set(0, -1.06, 0.04);
    brLegGroup.add(brHoof);

    root.scale.setScalar(1.5);

    const spawnAngle = Math.random() * Math.PI * 2;
    const sx = Math.cos(spawnAngle) * 36;
    const sz = Math.sin(spawnAngle) * 36;
    const groundY = getTerrainHeight(sx, sz);
    root.position.set(sx, groundY, sz);
    scene.add(root);

    return {
        mesh: root,
        isBoss: true,
        bossType: 'JUGGERNAUT',
        name: 'THE JUGGERNAUT',
        subtitle: 'MUTANT GORE BULL',
        config: {
            fleshColor: 0x9333ea,
            scoreVal: 350,
            attackDamage: 25,
            attackInterval: 1.0,
            speed: 2.2,
            scale: 1.5,
            animSpeed: 9.0
        },
        health: maxHp,
        maxHealth: maxHp,
        speed: 2.2,
        radius: 1.9,
        animTime: 0,
        state: 'WINDUP',
        stateTimer: 0,
        bodyGroup: bodyGroup,
        headGroup: headGroup,
        flLeg: flLegGroup,
        frLeg: frLegGroup,
        blLeg: blLegGroup,
        brLeg: brLegGroup,
        leftLeg: flLegGroup,
        rightLeg: frLegGroup,
        meshes: [withersHump, waistMid, pelvisRump, skull, browPlate, upperSnout, lowerJaw, flThigh, frThigh, blThigh, brThigh]
    };
}

// BOSS 3: THE VALKYRIE (WAVE 15) - SCULPTED OBSIDIAN SHADOW EAGLE WITH DARKENED AMBER ENERGY FEATHERS & GROUND TARGETING BEACON
function createValkyrieBoss() {
    const maxHp = 50 + currentWave * 9;
    const root = new THREE.Group();

    // Darkened ominous color palette: midnight obsidian-violet, deep charcoal, muted burning amber accents
    const obsidianFeatherMat = new THREE.MeshLambertMaterial({ color: 0x241538, emissive: 0x130a20, emissiveIntensity: 0.35 });
    const darkShadowMat = new THREE.MeshLambertMaterial({ color: 0x120a1c });
    const darkAmberTrimMat = new THREE.MeshBasicMaterial({ color: 0xb45309 });
    const darkAmberFeatherMat = new THREE.MeshLambertMaterial({ color: 0xd97706, emissive: 0x92400e, emissiveIntensity: 0.55 });
    const darkBeakMat = new THREE.MeshLambertMaterial({ color: 0x292524, emissive: 0x1c1917, emissiveIntensity: 0.3 });
    const darkTalonMat = new THREE.MeshLambertMaterial({ color: 0x3f3f46, emissive: 0x27272a, emissiveIntensity: 0.3 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });

    const bodyGroup = new THREE.Group();
    root.add(bodyGroup);

    // 1. Sleek Sculpted Avian Obsidian Body
    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 1.8), obsidianFeatherMat);
    chest.position.set(0, 0, 0.2);
    bodyGroup.add(chest);

    const belly = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.75, 1.6), darkShadowMat);
    belly.position.set(0, -0.22, -0.5);
    bodyGroup.add(belly);

    // Fanned Tail Feathers with Darkened Amber Energy Trim
    const tail = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 1.6), obsidianFeatherMat);
    tail.position.set(0, 0.1, -1.8);
    tail.rotation.x = -0.15;
    bodyGroup.add(tail);

    const tailTip = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.6), darkAmberTrimMat);
    tailTip.position.set(0, 0.22, -2.6);
    tailTip.rotation.x = -0.15;
    bodyGroup.add(tailTip);

    // 2. Articulated Eagle Head & Dark Iron Hooked Beak
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.45, 1.4);
    bodyGroup.add(headGroup);

    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.75, 0.95), obsidianFeatherMat);
    headGroup.add(skull);

    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.1, 4), darkBeakMat);
    beak.position.set(0, -0.15, 0.85);
    beak.rotation.x = Math.PI / 2.2;
    headGroup.add(beak);

    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), eyeMat);
    eyeL.position.set(-0.35, 0.18, 0.45);
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), eyeMat);
    eyeR.position.set(0.35, 0.18, 0.45);
    headGroup.add(eyeR);

    // 3. Massive Articulated Wings with Dark Amber Energy Feathers (Wingspan ~ 9.0 units)
    const leftWing = new THREE.Group();
    leftWing.position.set(-0.7, 0.2, 0.2);
    bodyGroup.add(leftWing);
    const lWingMain = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.14, 1.6), obsidianFeatherMat);
    lWingMain.position.set(-1.4, 0, 0);
    leftWing.add(lWingMain);
    const lEnergyFeathers = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 2.0), darkAmberFeatherMat);
    lEnergyFeathers.position.set(-3.2, 0, -0.1);
    leftWing.add(lEnergyFeathers);

    const rightWing = new THREE.Group();
    rightWing.position.set(0.7, 0.2, 0.2);
    bodyGroup.add(rightWing);
    const rWingMain = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.14, 1.6), obsidianFeatherMat);
    rWingMain.position.set(1.4, 0, 0);
    rightWing.add(rWingMain);
    const rEnergyFeathers = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 2.0), darkAmberFeatherMat);
    rEnergyFeathers.position.set(3.2, 0, -0.1);
    rightWing.add(rEnergyFeathers);

    // 4. Articulated Legs & Extended Razor Talons
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.45, -0.4, 0.4);
    bodyGroup.add(leftLegGroup);
    const lThigh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.35), darkShadowMat);
    leftLegGroup.add(lThigh);
    const lTalon = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.85, 4), darkTalonMat);
    lTalon.position.set(0, -0.4, 0.2);
    lTalon.rotation.x = Math.PI / 3;
    leftLegGroup.add(lTalon);

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.45, -0.4, 0.4);
    bodyGroup.add(rightLegGroup);
    const rThigh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.35), darkShadowMat);
    rightLegGroup.add(rThigh);
    const rTalon = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.85, 4), darkTalonMat);
    rTalon.position.set(0, -0.4, 0.2);
    rTalon.rotation.x = Math.PI / 3;
    rightLegGroup.add(rTalon);

    // 5. Dynamic Ground Shadow & Targeting Beacon Ring
    const beaconGeo = new THREE.RingGeometry(1.5, 2.0, 16);
    beaconGeo.rotateX(-Math.PI / 2);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xb45309, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    const groundBeacon = new THREE.Mesh(beaconGeo, beaconMat);
    scene.add(groundBeacon);

    root.scale.setScalar(1.65);

    // Spawn far off in the distant sky (R = 48m, Y = 9.5m) then glide majestically into view
    const spawnAngle = Math.random() * Math.PI * 2;
    const sx = Math.cos(spawnAngle) * 48.0;
    const sz = Math.sin(spawnAngle) * 48.0;
    root.position.set(sx, 9.5, sz);
    groundBeacon.position.set(sx, getTerrainHeight(sx, sz) + 0.08, sz);
    scene.add(root);

    return {
        mesh: root,
        groundBeacon: groundBeacon,
        isBoss: true,
        isAerial: true,
        bossType: 'VALKYRIE',
        name: 'THE VALKYRIE',
        subtitle: 'OBSIDIAN SHADOW EAGLE',
        config: {
            fleshColor: 0x241538,
            scoreVal: 400,
            attackDamage: 28,
            attackInterval: 0.8,
            speed: 5.5,
            scale: 1.65,
            animSpeed: 10.0
        },
        health: maxHp,
        maxHealth: maxHp,
        speed: 5.5,
        radius: 2.2,
        animTime: 0,
        state: 'APPROACH_PERIMETER',
        stateTimer: 0,
        volleyTimer: 0,
        circleAngle: spawnAngle,
        hitsDuringDive: 0,
        bodyGroup: bodyGroup,
        headGroup: headGroup,
        leftWing: leftWing,
        rightWing: rightWing,
        leftLeg: leftLegGroup,
        rightLeg: rightLegGroup,
        meshes: [chest, belly, tail, skull, lWingMain, rWingMain]
    };
}

// BOSS 4: THE ABOMINATION (WAVE 20) - MUTANT GORE COLOSSUS
function createAbominationBoss() {
    const maxHp = 70 + currentWave * 12;
    const root = new THREE.Group();

    const skinMat = new THREE.MeshLambertMaterial({ color: 0x5b21b6, emissive: 0x4c1d95, emissiveIntensity: 0.3 });
    const boneMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    const coreMat = new THREE.MeshLambertMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.9 });

    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 1.2, 0);
    root.add(bodyGroup);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.6, 1.1), skinMat);
    torso.position.y = 0.8;
    bodyGroup.add(torso);

    const coreMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 0), coreMat);
    coreMesh.position.set(0, 0.85, 0.58);
    bodyGroup.add(coreMesh);

    for (let i = 0; i < 4; i++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.8, 5), boneMat);
        spike.position.set((i % 2 === 0 ? -0.4 : 0.4), 0.7 + Math.floor(i / 2) * 0.5, -0.6);
        spike.rotation.x = -Math.PI / 3;
        bodyGroup.add(spike);
    }

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.7, 0.2);
    bodyGroup.add(headGroup);

    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.75), skinMat);
    headGroup.add(skull);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const eyeL = new THREE.Mesh(GEO_EYE, eyeMat);
    eyeL.position.set(-0.22, 0.05, 0.4);
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(GEO_EYE, eyeMat);
    eyeR.position.set(0.22, 0.05, 0.4);
    headGroup.add(eyeR);

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-1.0, 1.3, 0);
    bodyGroup.add(leftArmGroup);
    const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.2, 0.45), skinMat);
    lArm.position.y = -0.5;
    leftArmGroup.add(lArm);
    const lFist = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), boneMat);
    lFist.position.set(0, -1.2, 0.1);
    leftArmGroup.add(lFist);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(1.0, 1.3, 0);
    bodyGroup.add(rightArmGroup);
    const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.2, 0.45), skinMat);
    rArm.position.y = -0.5;
    rightArmGroup.add(rArm);
    const rFist = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), boneMat);
    rFist.position.set(0, -1.2, 0.1);
    rightArmGroup.add(rFist);

    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.45, 1.2, 0);
    root.add(leftLegGroup);
    const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.1, 0.5), skinMat);
    lLeg.position.y = -0.55;
    leftLegGroup.add(lLeg);

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.45, 1.2, 0);
    root.add(rightLegGroup);
    const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.1, 0.5), skinMat);
    rLeg.position.y = -0.55;
    rightLegGroup.add(rLeg);

    root.scale.setScalar(1.6);

    const spawnAngle = Math.random() * Math.PI * 2;
    const sx = Math.cos(spawnAngle) * 38;
    const sz = Math.sin(spawnAngle) * 38;
    const groundY = getTerrainHeight(sx, sz);
    root.position.set(sx, groundY, sz);
    scene.add(root);

    return {
        mesh: root,
        isBoss: true,
        bossType: 'ABOMINATION',
        name: 'THE ABOMINATION',
        subtitle: 'MUTANT GORE COLOSSUS',
        config: {
            fleshColor: 0x5b21b6,
            scoreVal: 500,
            attackDamage: 25,
            attackInterval: 1.4,
            speed: 1.8,
            scale: 1.6,
            animSpeed: 4.5
        },
        health: maxHp,
        maxHealth: maxHp,
        speed: 1.8,
        radius: 1.8,
        animTime: 0,
        slamTimer: 0,
        slamInterval: 4.0,
        throwTimer: 0,
        throwInterval: 7.0,
        isEnraged: false,
        bodyGroup: bodyGroup,
        headGroup: headGroup,
        leftLeg: leftLegGroup,
        rightLeg: rightLegGroup,
        leftArm: leftArmGroup,
        rightArm: rightArmGroup,
        coreMesh: coreMesh,
        meshes: [torso, skull, lArm, rArm, lLeg, rLeg]
    };
}

// BOSS 2: THE OMEGA (WAVE 10) - GIANT TERRESTRIAL ZOMBIE LIZARD (Sharp Snapping Jaws, Sweeping Tail Whip, Primal Roar)
function createOmegaBoss() {
    const maxHp = 100 + currentWave * 12;
    const root = new THREE.Group();

    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.75, 0);
    root.add(bodyGroup);

    // Segmented reptilian torso with dark moss-green scales and rot patches
    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.8, 1.4), MAT_OMEGA_SCALE);
    chest.position.set(0, 0.2, 0.35);
    bodyGroup.add(chest);

    const rotPatch = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.1), MAT_OMEGA_ROT);
    rotPatch.position.set(0.35, 0.35, 0.35);
    bodyGroup.add(rotPatch);

    const belly = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.65, 1.3), MAT_OMEGA_BELLY);
    belly.position.set(0, -0.15, -0.4);
    bodyGroup.add(belly);

    // Articulated Head & Snapping Fanged Jaws
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.35, 1.15);
    bodyGroup.add(headGroup);

    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.5, 0.95), MAT_OMEGA_SCALE);
    headGroup.add(skull);

    const snoutUpper = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.32, 0.8), MAT_OMEGA_SCALE);
    snoutUpper.position.set(0, 0.08, 0.75);
    headGroup.add(snoutUpper);

    // Articulated Lower Mandible
    const lowerJawGroup = new THREE.Group();
    lowerJawGroup.position.set(0, -0.16, 0.35);
    headGroup.add(lowerJawGroup);

    const lowerJaw = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.2, 0.85), MAT_OMEGA_BELLY);
    lowerJaw.position.set(0, 0, 0.4);
    lowerJawGroup.add(lowerJaw);

    // Sharp Predator Teeth Rows
    const fangsUpper = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.75), MAT_OMEGA_FANG);
    fangsUpper.position.set(0, -0.09, 0.75);
    headGroup.add(fangsUpper);

    const fangsLower = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.1, 0.75), MAT_OMEGA_FANG);
    fangsLower.position.set(0, 0.11, 0.4);
    lowerJawGroup.add(fangsLower);

    // Glowing reptilian eyes
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), MAT_EYE_RED);
    eyeL.position.set(-0.4, 0.2, 0.45);
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), MAT_EYE_RED);
    eyeR.position.set(0.4, 0.2, 0.45);
    headGroup.add(eyeR);

    // Articulated Multi-Segmented Spiked Tail
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.05, -1.05);
    bodyGroup.add(tailGroup);

    const tailSeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.55, 1.1), MAT_OMEGA_SCALE);
    tailSeg1.position.set(0, 0, -0.55);
    tailGroup.add(tailSeg1);

    const tailSeg2Group = new THREE.Group();
    tailSeg2Group.position.set(0, 0, -1.1);
    tailGroup.add(tailSeg2Group);

    const tailSeg2 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 1.2), MAT_OMEGA_SCALE);
    tailSeg2.position.set(0, 0, -0.6);
    tailSeg2Group.add(tailSeg2);

    const tailSeg3Group = new THREE.Group();
    tailSeg3Group.position.set(0, 0, -1.2);
    tailSeg2Group.add(tailSeg3Group);

    const tailSeg3 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.35, 1.3), MAT_OMEGA_SCALE);
    tailSeg3.position.set(0, 0, -0.65);
    tailSeg3Group.add(tailSeg3);

    // Spikes on tail
    for (let s = 0; s < 4; s++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 4), MAT_STAG_BONE);
        spike.position.set(0, 0.28, -0.3 - s * 0.55);
        spike.rotation.x = -Math.PI / 4;
        tailGroup.add(spike);
    }

    // 4 Sprawling Articulated Lizard Legs
    const flLeg = new THREE.Group();
    flLeg.position.set(-0.68, 0.2, 0.65);
    bodyGroup.add(flLeg);
    const flThigh = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.3, 0.35), MAT_OMEGA_SCALE);
    flThigh.position.set(-0.25, 0, 0);
    flLeg.add(flThigh);
    const flShin = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.7, 0.28), MAT_OMEGA_SCALE);
    flShin.position.set(-0.45, -0.35, 0.1);
    flLeg.add(flShin);

    const frLeg = new THREE.Group();
    frLeg.position.set(0.68, 0.2, 0.65);
    bodyGroup.add(frLeg);
    const frThigh = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.3, 0.35), MAT_OMEGA_SCALE);
    frThigh.position.set(0.25, 0, 0);
    frLeg.add(frThigh);
    const frShin = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.7, 0.28), MAT_OMEGA_SCALE);
    frShin.position.set(0.45, -0.35, 0.1);
    frLeg.add(frShin);

    const blLeg = new THREE.Group();
    blLeg.position.set(-0.68, 0.2, -0.65);
    bodyGroup.add(blLeg);
    const blThigh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.38), MAT_OMEGA_SCALE);
    blThigh.position.set(-0.28, 0, 0);
    blLeg.add(blThigh);
    const blShin = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.7, 0.32), MAT_OMEGA_SCALE);
    blShin.position.set(-0.5, -0.35, -0.1);
    blLeg.add(blShin);

    const brLeg = new THREE.Group();
    brLeg.position.set(0.68, 0.2, -0.65);
    bodyGroup.add(brLeg);
    const brThigh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.38), MAT_OMEGA_SCALE);
    brThigh.position.set(0.28, 0, 0);
    brLeg.add(brThigh);
    const brShin = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.7, 0.32), MAT_OMEGA_SCALE);
    brShin.position.set(0.5, -0.35, -0.1);
    brLeg.add(brShin);

    root.scale.setScalar(1.55);

    const spawnAngle = Math.random() * Math.PI * 2;
    const sx = Math.cos(spawnAngle) * 36.0;
    const sz = Math.sin(spawnAngle) * 36.0;
    const groundY = getTerrainHeight(sx, sz);
    root.position.set(sx, groundY, sz);
    scene.add(root);

    return {
        mesh: root,
        isBoss: true,
        bossType: 'OMEGA',
        name: 'THE OMEGA',
        subtitle: 'GIANT TERRESTRIAL ZOMBIE LIZARD',
        config: {
            fleshColor: 0x1c3a27,
            scoreVal: 350,
            attackDamage: 24,
            attackInterval: 1.1,
            speed: 3.4,
            scale: 1.55,
            animSpeed: 8.0
        },
        health: maxHp,
        maxHealth: maxHp,
        speed: 3.4,
        radius: 1.6,
        animTime: 0,
        state: 'APPROACH',
        stateTimer: 0,
        tailSwipeTimer: 0,
        roarTimer: 0,
        roarInterval: 8.0,
        hasArmor: true,
        armorReduction: 0.35,
        roarInterruptedHits: 0,
        bodyGroup: bodyGroup,
        headGroup: headGroup,
        lowerJaw: lowerJawGroup,
        tailGroup: tailGroup,
        tailSeg2Group: tailSeg2Group,
        tailSeg3Group: tailSeg3Group,
        flLeg: flLeg,
        frLeg: frLeg,
        blLeg: blLeg,
        brLeg: brLeg,
        meshes: [chest, belly, skull, snoutUpper, lowerJaw, tailSeg1, tailSeg2, tailSeg3]
    };
}

// BOSS 5: THE SALAMANDER (WAVE 25) - SPINED COLOSSUS WITH ARMORED CARAPACE & 4 EXPOSED WEAK POINT NODES
function createSalamanderBoss() {
    const maxHp = 100 + currentWave * 10;
    const root = new THREE.Group();

    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.7, 0);
    root.add(bodyGroup);

    // Heavy squat armored carapace
    const carapace = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.75, 1.7), MAT_SALAMANDER_CARAPACE);
    carapace.position.set(0, 0.15, 0);
    bodyGroup.add(carapace);

    const belly = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.55, 1.5), MAT_SALAMANDER_BELLY);
    belly.position.set(0, -0.22, 0);
    bodyGroup.add(belly);

    // Dorsal spine ridge with 6 triangular bone plates
    for (let sp = 0; sp < 6; sp++) {
        const spinePlate = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.75, 4), MAT_SALAMANDER_SPINE);
        spinePlate.position.set(0, 0.65, 0.7 - sp * 0.28);
        spinePlate.rotation.x = -Math.PI / 6;
        bodyGroup.add(spinePlate);
    }

    // 4 EXPOSED GLOWING WEAK POINT NODES (Target for 3x Critical Damage & Stomp Interruption!)
    const weakPointNodes = [];

    // Node 1: Dorsal Center Bio-Glow Core
    const wp1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.26, 0), MAT_SALAMANDER_WEAKPOINT);
    wp1.position.set(0, 0.68, 0.05);
    bodyGroup.add(wp1);
    weakPointNodes.push({ mesh: wp1, radius: 0.65 });

    // Node 2: Left Flank Exposed Gland
    const wp2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), MAT_SALAMANDER_WEAKPOINT);
    wp2.position.set(-0.8, 0.25, 0.15);
    bodyGroup.add(wp2);
    weakPointNodes.push({ mesh: wp2, radius: 0.60 });

    // Node 3: Right Flank Exposed Gland
    const wp3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), MAT_SALAMANDER_WEAKPOINT);
    wp3.position.set(0.8, 0.25, 0.15);
    bodyGroup.add(wp3);
    weakPointNodes.push({ mesh: wp3, radius: 0.60 });

    // Broad Articulated Salamander Head & Jaws
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.2, 1.1);
    bodyGroup.add(headGroup);

    const skull = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.45, 0.8), MAT_SALAMANDER_CARAPACE);
    headGroup.add(skull);

    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.24, 0.6), MAT_SALAMANDER_BELLY);
    mouth.position.set(0, -0.12, 0.35);
    headGroup.add(mouth);

    // Node 4: Throat / Open Mouth Bio-Glow Core (Direct Frontal Weak Point)
    const wpMouth = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), MAT_SALAMANDER_WEAKPOINT);
    wpMouth.position.set(0, -0.04, 0.38);
    headGroup.add(wpMouth);
    weakPointNodes.push({ mesh: wpMouth, radius: 0.60 });

    const teeth = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.08, 0.55), MAT_HOUND_TEETH);
    teeth.position.set(0, -0.02, 0.36);
    headGroup.add(teeth);

    const eyeL = new THREE.Mesh(GEO_EYE, MAT_EYE_YELLOW);
    eyeL.position.set(-0.42, 0.16, 0.3);
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(GEO_EYE, MAT_EYE_YELLOW);
    eyeR.position.set(0.42, 0.16, 0.3);
    headGroup.add(eyeR);

    // Thick Flat Salamander Tail
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.05, -0.9);
    bodyGroup.add(tailGroup);

    const tailMain = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 1.4), MAT_SALAMANDER_CARAPACE);
    tailMain.position.set(0, 0, -0.7);
    tailGroup.add(tailMain);

    const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 1.2), MAT_SALAMANDER_SPINE);
    tailFin.position.set(0, 0.2, -0.7);
    tailGroup.add(tailFin);

    // 4 Stout Muscular Legs
    const flLeg = new THREE.Group();
    flLeg.position.set(-0.75, 0.1, 0.6);
    bodyGroup.add(flLeg);
    const flMesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.65, 0.45), MAT_SALAMANDER_CARAPACE);
    flMesh.position.set(-0.15, -0.28, 0);
    flLeg.add(flMesh);

    const frLeg = new THREE.Group();
    frLeg.position.set(0.75, 0.1, 0.6);
    bodyGroup.add(frLeg);
    const frMesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.65, 0.45), MAT_SALAMANDER_CARAPACE);
    frMesh.position.set(0.15, -0.28, 0);
    frLeg.add(frMesh);

    const blLeg = new THREE.Group();
    blLeg.position.set(-0.75, 0.1, -0.6);
    bodyGroup.add(blLeg);
    const blMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.65, 0.48), MAT_SALAMANDER_CARAPACE);
    blMesh.position.set(-0.15, -0.28, 0);
    blLeg.add(blMesh);

    const brLeg = new THREE.Group();
    brLeg.position.set(0.75, 0.1, -0.6);
    bodyGroup.add(brLeg);
    const brMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.65, 0.48), MAT_SALAMANDER_CARAPACE);
    brMesh.position.set(0.15, -0.28, 0);
    brLeg.add(brMesh);

    root.scale.setScalar(1.6);

    const spawnAngle = Math.random() * Math.PI * 2;
    const sx = Math.cos(spawnAngle) * 38.0;
    const sz = Math.sin(spawnAngle) * 38.0;
    const groundY = getTerrainHeight(sx, sz);
    root.position.set(sx, groundY, sz);
    scene.add(root);

    return {
        mesh: root,
        isBoss: true,
        bossType: 'SALAMANDER',
        name: 'THE SALAMANDER',
        subtitle: 'SPINED CARAPACE COLOSSUS',
        config: {
            fleshColor: 0x18181b,
            scoreVal: 450,
            attackDamage: 12,
            attackInterval: 1.3,
            speed: 2.6,
            scale: 1.6,
            animSpeed: 6.0
        },
        health: maxHp,
        maxHealth: maxHp,
        speed: 2.6,
        radius: 1.7,
        animTime: 0,
        state: 'APPROACH',
        stateTimer: 0,
        seismicTimer: 0,
        seismicInterval: 7.0,
        tailSwipeTimer: 0,
        hasArmor: true,
        armorReduction: 0.60,
        weakPointMultiplier: 3.0,
        weakPointNodes: weakPointNodes,
        stompInterruptedHits: 0,
        bodyGroup: bodyGroup,
        headGroup: headGroup,
        tailGroup: tailGroup,
        flLeg: flLeg,
        frLeg: frLeg,
        blLeg: blLeg,
        brLeg: brLeg,
        wp1: wp1,
        wp2: wp2,
        wp3: wp3,
        wpMouth: wpMouth,
        meshes: [carapace, belly, skull, mouth, tailMain, flMesh, frMesh, blMesh, brMesh]
    };
}

function createBossForWave(wave) {
    const bossIndex = Math.floor((wave - 1) / 5) % 6;
    let boss;
    if (bossIndex === 0) boss = createHunterBoss();
    else if (bossIndex === 1) boss = createOmegaBoss();
    else if (bossIndex === 2) boss = createJuggernautBoss();
    else if (bossIndex === 3) boss = createValkyrieBoss();
    else if (bossIndex === 4) boss = createSalamanderBoss();
    else boss = createAbominationBoss();
    initZombieMaterials(boss);
    if (boss && boss.bossType) unlockThreat(boss.bossType);
    return boss;
}

function updateZombieAnimation(zombie, dt) {
    if (typeof zombie.animTime !== 'number' || isNaN(zombie.animTime)) {
        zombie.animTime = Math.random() * 10;
    }

    if (zombie.bossType === 'HUNTER') {
        zombie.animTime += dt * 16.0;
        const t = zombie.animTime;
        if (zombie.state === 'LEAP_OVER' || zombie.isJumping) {
            // Forward acrobatic leap/vault pose
            if (zombie.leftArm) {
                zombie.leftArm.rotation.x = -Math.PI / 1.2;
                zombie.leftArm.rotation.z = -0.3;
            }
            if (zombie.rightArm) {
                zombie.rightArm.rotation.x = -Math.PI / 1.2;
                zombie.rightArm.rotation.z = 0.3;
            }
            if (zombie.leftLeg) zombie.leftLeg.rotation.x = 0.8;
            if (zombie.rightLeg) zombie.rightLeg.rotation.x = -0.6;
            if (zombie.bodyGroup) zombie.bodyGroup.rotation.x = 0.25;
        } else if (zombie.isScaling) {
            // Vertical obstacle climbing pose with reaching claws and forward torso pitch
            if (zombie.leftArm) {
                zombie.leftArm.rotation.x = -Math.PI * 0.82 + Math.sin(t * 1.3) * 0.35;
                zombie.leftArm.rotation.z = -0.25;
            }
            if (zombie.rightArm) {
                zombie.rightArm.rotation.x = -Math.PI * 0.82 - Math.sin(t * 1.3) * 0.35;
                zombie.rightArm.rotation.z = 0.25;
            }
            if (zombie.leftLeg) zombie.leftLeg.rotation.x = Math.sin(t * 1.3) * 0.9;
            if (zombie.rightLeg) zombie.rightLeg.rotation.x = -Math.sin(t * 1.3) * 0.9;
            if (zombie.bodyGroup) zombie.bodyGroup.rotation.x = 0.45;
        } else {
            // High-step aggressive running animation with swinging arms and claw swipes
            if (zombie.bodyGroup) zombie.bodyGroup.rotation.x = 0.12;
            if (zombie.leftLeg) zombie.leftLeg.rotation.x = Math.sin(t) * 1.05;
            if (zombie.rightLeg) zombie.rightLeg.rotation.x = -Math.sin(t) * 1.05;
            if (zombie.leftArm) {
                zombie.leftArm.rotation.x = -Math.PI / 2.2 + Math.sin(t + Math.PI) * 0.5;
                zombie.leftArm.rotation.z = -0.1 + Math.sin(t) * 0.08;
            }
            if (zombie.rightArm) {
                zombie.rightArm.rotation.x = -Math.PI / 2.2 + Math.sin(t) * 0.5;
                zombie.rightArm.rotation.z = 0.1 - Math.sin(t) * 0.08;
            }
            if (zombie.headGroup) zombie.headGroup.rotation.y = Math.sin(t * 0.5) * 0.18;
            if (zombie.bodyGroup) zombie.bodyGroup.rotation.z = Math.sin(t) * 0.05;
        }
    } else if (zombie.bossType === 'JUGGERNAUT') {
        zombie.animTime += dt * (zombie.config ? zombie.config.animSpeed : 9.0);
        const t = zombie.animTime;
        // Diagonal 4-beat gallop cycle
        if (zombie.flLeg) zombie.flLeg.rotation.x = Math.sin(t) * 0.85;
        if (zombie.brLeg) zombie.brLeg.rotation.x = Math.sin(t) * 0.85;
        if (zombie.frLeg) zombie.frLeg.rotation.x = -Math.sin(t) * 0.85;
        if (zombie.blLeg) zombie.blLeg.rotation.x = -Math.sin(t) * 0.85;
        if (zombie.headGroup) zombie.headGroup.rotation.x = 0.1 + Math.sin(t * 2.0) * 0.15;
        if (zombie.bodyGroup) {
            zombie.bodyGroup.position.y = 1.15 + Math.abs(Math.sin(t * 2.0)) * 0.12;
            zombie.bodyGroup.rotation.z = Math.sin(t) * 0.05;
        }
    } else if (zombie.bossType === 'VALKYRIE') {
        zombie.animTime += dt * 10.0;
        const t = zombie.animTime;
        if (zombie.leftWing) zombie.leftWing.rotation.z = Math.sin(t * 1.5) * 0.75;
        if (zombie.rightWing) zombie.rightWing.rotation.z = -Math.sin(t * 1.5) * 0.75;
        if (zombie.headGroup) zombie.headGroup.rotation.x = Math.sin(t * 0.5) * 0.18;
        if (zombie.leftLeg) zombie.leftLeg.rotation.x = Math.PI / 6 + Math.sin(t * 0.8) * 0.15;
        if (zombie.rightLeg) zombie.rightLeg.rotation.x = Math.PI / 6 + Math.sin(t * 0.8 + Math.PI) * 0.15;
    } else if (zombie.bossType === 'ABOMINATION') {
        zombie.animTime += dt * (zombie.config ? zombie.config.animSpeed : 4.5);
        const t = zombie.animTime;
        if (zombie.leftLeg) zombie.leftLeg.rotation.x = Math.sin(t) * 0.65;
        if (zombie.rightLeg) zombie.rightLeg.rotation.x = -Math.sin(t) * 0.65;
        if (zombie.leftArm) zombie.leftArm.rotation.x = -Math.PI / 2.5 + Math.sin(t + Math.PI) * 0.35;
        if (zombie.rightArm) zombie.rightArm.rotation.x = -Math.PI / 2.5 + Math.sin(t) * 0.35;
        if (zombie.headGroup) zombie.headGroup.rotation.x = Math.sin(t * 0.8) * 0.12;
    } else if (zombie.bossType === 'OMEGA') {
        zombie.animTime += dt * (zombie.config ? zombie.config.animSpeed : 8.0);
        const t = zombie.animTime;
        // Sprawling 4-leg lizard gait
        if (zombie.flLeg) zombie.flLeg.rotation.y = Math.sin(t) * 0.45;
        if (zombie.brLeg) zombie.brLeg.rotation.y = Math.sin(t) * 0.45;
        if (zombie.frLeg) zombie.frLeg.rotation.y = -Math.sin(t) * 0.45;
        if (zombie.blLeg) zombie.blLeg.rotation.y = -Math.sin(t) * 0.45;
        // Multi-segment tail sway
        if (zombie.tailGroup) zombie.tailGroup.rotation.y = Math.sin(t * 0.8) * 0.35;
        if (zombie.tailSeg2Group) zombie.tailSeg2Group.rotation.y = Math.sin(t * 0.8 - 0.4) * 0.4;
        if (zombie.tailSeg3Group) zombie.tailSeg3Group.rotation.y = Math.sin(t * 0.8 - 0.8) * 0.45;
        // Snapping fanged jaw
        if (zombie.lowerJaw && !zombie.isRoaring) {
            zombie.lowerJaw.rotation.x = 0.08 + Math.abs(Math.sin(t * 1.5)) * 0.22;
        }
        if (zombie.headGroup) zombie.headGroup.rotation.y = Math.sin(t * 0.5) * 0.15;
    } else if (zombie.bossType === 'SALAMANDER') {
        zombie.animTime += dt * (zombie.config ? zombie.config.animSpeed : 6.0);
        const t = zombie.animTime;
        // Heavy squat crawling gait
        if (zombie.flLeg) zombie.flLeg.rotation.y = Math.sin(t) * 0.4;
        if (zombie.brLeg) zombie.brLeg.rotation.y = Math.sin(t) * 0.4;
        if (zombie.frLeg) zombie.frLeg.rotation.y = -Math.sin(t) * 0.4;
        if (zombie.blLeg) zombie.blLeg.rotation.y = -Math.sin(t) * 0.4;
        if (zombie.tailGroup) zombie.tailGroup.rotation.y = Math.sin(t * 0.7) * 0.3;
        if (zombie.headGroup) zombie.headGroup.rotation.y = Math.sin(t * 0.6) * 0.12;
        // Weakpoint node pulsation
        const pulse = 0.6 + Math.abs(Math.sin(t * 3.0)) * 0.4;
        if (zombie.wp1 && zombie.wp1.material) zombie.wp1.material.emissiveIntensity = pulse;
        if (zombie.wp2 && zombie.wp2.material) zombie.wp2.material.emissiveIntensity = pulse;
        if (zombie.wp3 && zombie.wp3.material) zombie.wp3.material.emissiveIntensity = pulse;
        if (zombie.wpMouth && zombie.wpMouth.material) zombie.wpMouth.material.emissiveIntensity = pulse;
    } else if (zombie.type === 'STAG') {
        if (zombie.isJumping) {
            if (zombie.flLeg) zombie.flLeg.rotation.x = -Math.PI / 3.0;
            if (zombie.frLeg) zombie.frLeg.rotation.x = -Math.PI / 3.0;
            if (zombie.blLeg) zombie.blLeg.rotation.x = Math.PI / 3.0;
            if (zombie.brLeg) zombie.brLeg.rotation.x = Math.PI / 3.0;
            if (zombie.headGroup) zombie.headGroup.rotation.x = 0.2;
        } else {
            zombie.animTime += dt * 14.0;
            const t = zombie.animTime;
            if (zombie.flLeg) zombie.flLeg.rotation.x = Math.sin(t) * 0.9;
            if (zombie.frLeg) zombie.frLeg.rotation.x = -Math.sin(t) * 0.9;
            if (zombie.blLeg) zombie.blLeg.rotation.x = -Math.sin(t) * 0.9;
            if (zombie.brLeg) zombie.brLeg.rotation.x = Math.sin(t) * 0.9;
            if (zombie.headGroup) zombie.headGroup.rotation.x = Math.sin(t * 2.0) * 0.15;
            if (zombie.bodyGroup) zombie.bodyGroup.position.y = 0.65 + Math.abs(Math.sin(t * 2.0)) * 0.1;
        }
    } else if (zombie.type === 'HORSE') {
        zombie.animTime += dt * 12.0;
        const t = zombie.animTime;
        if (zombie.flLeg) zombie.flLeg.rotation.x = Math.sin(t) * 0.85;
        if (zombie.brLeg) zombie.brLeg.rotation.x = Math.sin(t) * 0.85;
        if (zombie.frLeg) zombie.frLeg.rotation.x = -Math.sin(t) * 0.85;
        if (zombie.blLeg) zombie.blLeg.rotation.x = -Math.sin(t) * 0.85;
        if (zombie.headGroup) zombie.headGroup.rotation.x = Math.sin(t * 1.5) * 0.18;
        if (zombie.bodyGroup) zombie.bodyGroup.position.y = 0.85 + Math.abs(Math.sin(t * 2.0)) * 0.12;
    } else if (zombie.type === 'BEAR') {
        if (zombie.isAttacking) {
            zombie.animTime += dt * 8.0;
            const t = zombie.animTime;
            const attackCycle = ((zombie.attackTimer || 0) / (zombie.config ? (zombie.config.attackInterval || 1.0) : 1.0));

            if (attackCycle < 0.65) {
                // Phase 1: Rising up onto hind legs, raising front paws high in the air
                const rearProgress = Math.min(1.0, attackCycle / 0.65);
                if (zombie.bodyGroup) {
                    zombie.bodyGroup.rotation.x = -0.75 * rearProgress;
                    zombie.bodyGroup.position.y = 0.9 + 0.55 * rearProgress;
                }
                if (zombie.headGroup) zombie.headGroup.rotation.x = 0.45 * rearProgress;
                if (zombie.flLeg) {
                    zombie.flLeg.rotation.x = -1.35 * rearProgress;
                    zombie.flLeg.position.y = 0.9 + 0.35 * rearProgress;
                }
                if (zombie.frLeg) {
                    zombie.frLeg.rotation.x = -1.35 * rearProgress;
                    zombie.frLeg.position.y = 0.9 + 0.35 * rearProgress;
                }
                if (zombie.blLeg) zombie.blLeg.rotation.x = 0.25 * rearProgress;
                if (zombie.brLeg) zombie.brLeg.rotation.x = 0.25 * rearProgress;
            } else {
                // Phase 2: Smashing massive front paws down on the player with crushing force
                const smashProgress = (attackCycle - 0.65) / 0.35;
                if (zombie.bodyGroup) {
                    zombie.bodyGroup.rotation.x = -0.75 * (1.0 - smashProgress) + 0.25 * Math.sin(smashProgress * Math.PI);
                    zombie.bodyGroup.position.y = 1.45 - 0.55 * smashProgress;
                }
                if (zombie.headGroup) zombie.headGroup.rotation.x = 0.2 * (1.0 - smashProgress);
                if (zombie.flLeg) {
                    zombie.flLeg.rotation.x = 0.55;
                    zombie.flLeg.position.y = 0.9;
                }
                if (zombie.frLeg) {
                    zombie.frLeg.rotation.x = 0.55;
                    zombie.frLeg.position.y = 0.9;
                }
                if (zombie.blLeg) zombie.blLeg.rotation.x = 0;
                if (zombie.brLeg) zombie.brLeg.rotation.x = 0;
            }
        } else {
            // Running / Charging locomotion
            const animSpeed = zombie.isEnraged ? 15.0 : 6.5;
            zombie.animTime += dt * animSpeed;
            const t = zombie.animTime;
            if (zombie.flLeg) {
                zombie.flLeg.rotation.x = Math.sin(t) * (zombie.isEnraged ? 0.95 : 0.65);
                zombie.flLeg.position.y = 0.9;
            }
            if (zombie.brLeg) zombie.brLeg.rotation.x = Math.sin(t) * (zombie.isEnraged ? 0.95 : 0.65);
            if (zombie.frLeg) {
                zombie.frLeg.rotation.x = -Math.sin(t) * (zombie.isEnraged ? 0.95 : 0.65);
                zombie.frLeg.position.y = 0.9;
            }
            if (zombie.blLeg) zombie.blLeg.rotation.x = -Math.sin(t) * (zombie.isEnraged ? 0.95 : 0.65);
            if (zombie.headGroup) zombie.headGroup.rotation.x = Math.sin(t * (zombie.isEnraged ? 2.0 : 1.2)) * 0.18;
            if (zombie.bodyGroup) {
                zombie.bodyGroup.rotation.x = zombie.isEnraged ? 0.22 : 0;
                zombie.bodyGroup.rotation.z = Math.sin(t) * 0.08;
                zombie.bodyGroup.position.y = 0.9 + Math.abs(Math.sin(t * (zombie.isEnraged ? 2.0 : 1.5))) * (zombie.isEnraged ? 0.15 : 0.08);
            }
        }
    } else if (zombie.type === 'HOUND') {
        if (zombie.isJumping) {
            if (zombie.flLeg) zombie.flLeg.rotation.x = -Math.PI / 3.0;
            if (zombie.frLeg) zombie.frLeg.rotation.x = -Math.PI / 3.0;
            if (zombie.blLeg) zombie.blLeg.rotation.x = Math.PI / 3.0;
            if (zombie.brLeg) zombie.brLeg.rotation.x = Math.PI / 3.0;
            if (zombie.headGroup) zombie.headGroup.rotation.x = -0.2;
        } else {
            zombie.animTime += dt * 18.0;
            const t = zombie.animTime;
            if (zombie.flLeg) zombie.flLeg.rotation.x = Math.sin(t) * 0.95;
            if (zombie.frLeg) zombie.frLeg.rotation.x = -Math.sin(t) * 0.95;
            if (zombie.blLeg) zombie.blLeg.rotation.x = -Math.sin(t) * 0.95;
            if (zombie.brLeg) zombie.brLeg.rotation.x = Math.sin(t) * 0.95;
            if (zombie.headGroup) zombie.headGroup.rotation.x = Math.sin(t * 2.0) * 0.18;
            if (zombie.bodyGroup) zombie.bodyGroup.position.y = 0.45 + Math.abs(Math.sin(t * 2.0)) * 0.08;
        }
    } else if (zombie.type === 'SEEKER') {
        zombie.animTime += dt * 14.0;
        const t = zombie.animTime;
        if (zombie.leftWing) zombie.leftWing.rotation.z = Math.sin(t) * 0.75;
        if (zombie.rightWing) zombie.rightWing.rotation.z = -Math.sin(t) * 0.75;
        if (zombie.headGroup) zombie.headGroup.rotation.y = Math.sin(t * 0.5) * 0.25;
        if (zombie.leftLeg) zombie.leftLeg.rotation.x = Math.PI / 5 + Math.sin(t * 0.6) * 0.15;
        if (zombie.rightLeg) zombie.rightLeg.rotation.x = Math.PI / 5 + Math.sin(t * 0.6 + Math.PI) * 0.15;
        if (zombie.bodyGroup) zombie.bodyGroup.position.y = Math.sin(t * 0.7) * 0.12;
    } else if (zombie.type === 'SPITTER') {
        zombie.animTime += dt * 7.0;
        const t = zombie.animTime;
        if (zombie.leftLeg) zombie.leftLeg.rotation.x = Math.sin(t) * 0.6;
        if (zombie.rightLeg) zombie.rightLeg.rotation.x = -Math.sin(t) * 0.6;
        if (zombie.leftArm) zombie.leftArm.rotation.x = -Math.PI / 2.5 + Math.sin(t + Math.PI) * 0.2;
        if (zombie.rightArm) zombie.rightArm.rotation.x = -Math.PI / 2.5 + Math.sin(t) * 0.2;
        if (zombie.headGroup) zombie.headGroup.position.y = 0.88 + Math.sin(t * 2.0) * 0.06;
    } else if (zombie.type === 'PHANTOM') {
        zombie.animTime += dt * 9.0;
        const t = zombie.animTime;
        if (zombie.leftLeg) zombie.leftLeg.rotation.x = Math.sin(t) * 0.7;
        if (zombie.rightLeg) zombie.rightLeg.rotation.x = -Math.sin(t) * 0.7;
        if (zombie.leftArm) zombie.leftArm.rotation.x = -Math.PI / 2.1 + Math.sin(t + Math.PI) * 0.2;
        if (zombie.rightArm) zombie.rightArm.rotation.x = -Math.PI / 2.1 + Math.sin(t) * 0.2;
        if (zombie.bodyGroup) zombie.bodyGroup.position.y = 0.75 + Math.sin(t * 1.5) * 0.08;
    } else if (zombie.type === 'CRAWLER') {
        zombie.animTime += dt * 14.0;
        const t = zombie.animTime;
        if (zombie.leftArm) zombie.leftArm.rotation.x = Math.PI / 2.5 + Math.sin(t) * 0.65;
        if (zombie.rightArm) zombie.rightArm.rotation.x = Math.PI / 2.5 + Math.sin(t + Math.PI) * 0.65;
        if (zombie.bodyGroup) zombie.bodyGroup.rotation.z = Math.sin(t) * 0.14;
        if (zombie.headGroup) zombie.headGroup.rotation.x = -0.15 + Math.sin(t * 2.0) * 0.1;
    } else if (zombie.type === 'BRUTE') {
        zombie.animTime += dt * 6.0;
        const t = zombie.animTime;
        if (zombie.leftLeg) zombie.leftLeg.rotation.x = Math.sin(t) * 0.55;
        if (zombie.rightLeg) zombie.rightLeg.rotation.x = -Math.sin(t) * 0.55;
        if (zombie.leftArm) zombie.leftArm.rotation.x = -Math.PI / 3.0; // Bracing shield forward
        if (zombie.rightArm) zombie.rightArm.rotation.x = -Math.PI / 2.2 + Math.sin(t) * 0.3;
        if (zombie.headGroup) zombie.headGroup.rotation.x = Math.sin(t * 0.8) * 0.08;
    } else if (zombie.type === 'SCREAMER') {
        zombie.animTime += dt * 9.0;
        const t = zombie.animTime;
        if (zombie.leftLeg) zombie.leftLeg.rotation.x = Math.sin(t) * 0.65;
        if (zombie.rightLeg) zombie.rightLeg.rotation.x = -Math.sin(t) * 0.65;
        if (zombie.leftArm) zombie.leftArm.rotation.x = -Math.PI / 1.8 + Math.sin(t) * 0.3;
        if (zombie.rightArm) zombie.rightArm.rotation.x = -Math.PI / 1.8 + Math.sin(t + Math.PI) * 0.3;
        if (zombie.auraRing) zombie.auraRing.rotation.z += dt * 3.5;
    } else if (zombie.isAttacking) {
        zombie.animTime += dt * 12.0;
        const t = zombie.animTime;
        if (zombie.leftArm) zombie.leftArm.rotation.x = -Math.PI / 3.0 + Math.sin(t) * 0.6;
        if (zombie.rightArm) zombie.rightArm.rotation.x = -Math.PI / 3.0 + Math.sin(t + Math.PI * 0.6) * 0.6;
    } else if (zombie.isJumping) {
        if (zombie.leftArm) zombie.leftArm.rotation.x = -Math.PI / 1.6;
        if (zombie.rightArm) zombie.rightArm.rotation.x = -Math.PI / 1.6;
    } else {
        zombie.animTime += dt * (zombie.config ? (zombie.config.animSpeed || 8.0) : 8.0);
        const t = zombie.animTime;
        if (zombie.leftLeg) zombie.leftLeg.rotation.x = Math.sin(t) * 0.75;
        if (zombie.rightLeg) zombie.rightLeg.rotation.x = -Math.sin(t) * 0.75;
        if (zombie.leftArm) zombie.leftArm.rotation.x = -Math.PI / 2.2 + Math.sin(t + Math.PI) * 0.25;
        if (zombie.rightArm) zombie.rightArm.rotation.x = -Math.PI / 2.2 + Math.sin(t) * 0.25;
    }
}

function selectZombieTypeForWave(wave) {
    const rand = Math.random();
    if (wave === 1) {
        return 'WALKER';
    } else if (wave === 2) {
        return rand < 0.55 ? 'WALKER' : 'RUNNER';
    } else if (wave === 3) {
        if (rand < 0.40) return 'WALKER';
        if (rand < 0.70) return 'RUNNER';
        return 'SEEKER'; // Wave 3+: Seekers fly in!
    } else if (wave === 4) {
        if (rand < 0.30) return 'WALKER';
        if (rand < 0.55) return 'RUNNER';
        if (rand < 0.75) return 'SEEKER';
        return 'HOUND'; // Wave 4+: Hounds spawn in packs of 4!
    } else if (wave === 5) {
        // Wave 5 Boss Wave escorts: Walkers, Runners, Seekers, Hounds
        if (rand < 0.25) return 'WALKER';
        if (rand < 0.50) return 'RUNNER';
        if (rand < 0.75) return 'SEEKER';
        return 'HOUND';
    } else if (wave === 6) {
        // Wave 6+: Tanks spawn!
        if (rand < 0.20) return 'WALKER';
        if (rand < 0.40) return 'RUNNER';
        if (rand < 0.60) return 'SEEKER';
        if (rand < 0.80) return 'HOUND';
        return 'TANK';
    } else if (wave === 7) {
        // Wave 7+: Spitter
        if (rand < 0.15) return 'WALKER';
        if (rand < 0.32) return 'RUNNER';
        if (rand < 0.48) return 'SEEKER';
        if (rand < 0.65) return 'HOUND';
        if (rand < 0.82) return 'TANK';
        return 'SPITTER';
    } else if (wave === 8) {
        // Wave 8+: Phantom
        if (rand < 0.12) return 'WALKER';
        if (rand < 0.26) return 'RUNNER';
        if (rand < 0.40) return 'SEEKER';
        if (rand < 0.54) return 'HOUND';
        if (rand < 0.68) return 'TANK';
        if (rand < 0.82) return 'SPITTER';
        return 'PHANTOM';
    } else if (wave === 9 || wave === 10) {
        // Wave 9+: Crawler (Wave 10 Boss: Omega)
        if (rand < 0.10) return 'WALKER';
        if (rand < 0.22) return 'RUNNER';
        if (rand < 0.34) return 'SEEKER';
        if (rand < 0.46) return 'HOUND';
        if (rand < 0.58) return 'TANK';
        if (rand < 0.70) return 'SPITTER';
        if (rand < 0.84) return 'PHANTOM';
        return 'CRAWLER';
    } else if (wave === 11) {
        // Wave 11+: Zombie Stag / Deer (53% Carrier Ratio)
        if (rand < 0.10) return 'WALKER';    // Carrier
        if (rand < 0.21) return 'RUNNER';    // Carrier
        if (rand < 0.32) return 'SEEKER';    // Carrier
        if (rand < 0.42) return 'HOUND';
        if (rand < 0.52) return 'TANK';      // Carrier
        if (rand < 0.63) return 'SPITTER';   // Carrier
        if (rand < 0.75) return 'PHANTOM';
        if (rand < 0.87) return 'CRAWLER';
        return 'STAG';
    } else if (wave === 12) {
        // Wave 12+: Gore Brute (52% Carrier Ratio)
        if (rand < 0.10) return 'WALKER';    // Carrier
        if (rand < 0.21) return 'RUNNER';    // Carrier
        if (rand < 0.31) return 'SEEKER';    // Carrier
        if (rand < 0.39) return 'HOUND';
        if (rand < 0.49) return 'TANK';      // Carrier
        if (rand < 0.60) return 'SPITTER';   // Carrier
        if (rand < 0.70) return 'PHANTOM';
        if (rand < 0.80) return 'CRAWLER';
        if (rand < 0.90) return 'STAG';
        return 'BRUTE';
    } else if (wave === 13) {
        // Wave 13+: Blight Screamer (52% Carrier Ratio)
        if (rand < 0.10) return 'WALKER';    // Carrier
        if (rand < 0.21) return 'RUNNER';    // Carrier
        if (rand < 0.31) return 'SEEKER';    // Carrier
        if (rand < 0.38) return 'HOUND';
        if (rand < 0.48) return 'TANK';      // Carrier
        if (rand < 0.59) return 'SPITTER';   // Carrier
        if (rand < 0.68) return 'PHANTOM';
        if (rand < 0.77) return 'CRAWLER';
        if (rand < 0.85) return 'STAG';
        if (rand < 0.93) return 'BRUTE';
        return 'SCREAMER';
    } else if (wave === 14 || wave === 15) {
        // Wave 14+: Zombie Horse / Stallion (Wave 15 Boss: Juggernaut - 51% Carrier Ratio)
        if (rand < 0.09) return 'WALKER';    // Carrier
        if (rand < 0.20) return 'RUNNER';    // Carrier
        if (rand < 0.30) return 'SEEKER';    // Carrier
        if (rand < 0.37) return 'HOUND';
        if (rand < 0.47) return 'TANK';      // Carrier
        if (rand < 0.58) return 'SPITTER';   // Carrier
        if (rand < 0.66) return 'PHANTOM';
        if (rand < 0.74) return 'CRAWLER';
        if (rand < 0.82) return 'STAG';
        if (rand < 0.89) return 'BRUTE';
        if (rand < 0.95) return 'SCREAMER';
        return 'HORSE';
    } else {
        // Wave 16+: Zombie Bear / Ursine + Full Apex Horde Pool (52% Carrier Ratio)
        if (rand < 0.09) return 'WALKER';    // Carrier
        if (rand < 0.20) return 'RUNNER';    // Carrier
        if (rand < 0.31) return 'SEEKER';    // Carrier
        if (rand < 0.37) return 'HOUND';
        if (rand < 0.47) return 'TANK';      // Carrier
        if (rand < 0.58) return 'SPITTER';   // Carrier
        if (rand < 0.65) return 'PHANTOM';
        if (rand < 0.72) return 'CRAWLER';
        if (rand < 0.79) return 'STAG';
        if (rand < 0.86) return 'BRUTE';
        if (rand < 0.91) return 'SCREAMER';
        if (rand < 0.96) return 'HORSE';
        return 'BEAR';
    }
}

const ALLOWED_CARRIER_TYPES = ['WALKER', 'RUNNER', 'SEEKER', 'SPITTER', 'TANK'];

function spawnZombie() {
    if (zombiesRemainingToSpawn <= 0) return;
    if (zombiesAliveCount >= MAX_CONCURRENT_ZOMBIES) return;

    const typeKey = selectZombieTypeForWave(currentWave);
    unlockThreat(typeKey);
    const isBossWave = (currentWave % 5 === 0);
    const isWave11Plus = (currentWave >= 11);

    // Resource carriers appear from Wave 3 onwards (plentiful from Wave 11 onwards with high carrier rate & pity fallback)
    let carrierType = null;
    if (currentWave >= 3 && ALLOWED_CARRIER_TYPES.includes(typeKey)) {
        const baseCarrierRate = isWave11Plus 
            ? Math.min(0.85, 0.72 + (currentWave - 11) * 0.015) 
            : Math.min(0.50, 0.25 + (currentWave - 3) * 0.035);
        const carrierRate = isBossWave ? (isWave11Plus ? 0.88 : 0.65) : baseCarrierRate;

        // Guaranteed carrier fallback: If 2+ zombies spawned without a carrier in Wave 11+, guarantee a drop on this unit!
        const forceCarrier = isWave11Plus && (spawnsSinceLastCarrier >= 2);

        if (forceCarrier || Math.random() < carrierRate) {
            carrierType = (Math.random() < 0.5) ? 'REPAIR' : 'OVERDRIVE';
            spawnsSinceLastCarrier = 0;
        } else {
            spawnsSinceLastCarrier++;
        }
    } else {
        spawnsSinceLastCarrier++;
    }

    const angle = Math.random() * Math.PI * 2;

    // HOUND SPECIAL: Always spawns in a pack of 4! (Hounds never carry resources)
    if (typeKey === 'HOUND') {
        const packCount = Math.min(4, Math.max(1, zombiesRemainingToSpawn));
        for (let k = 0; k < packCount; k++) {
            if (zombiesAliveCount >= MAX_CONCURRENT_ZOMBIES) break;
            const houndAngle = angle + (k - (packCount - 1) / 2) * 0.14;
            const spawnRadius = 36 + (Math.random() * 2 - 1);
            const sx = Math.cos(houndAngle) * spawnRadius;
            const sz = Math.sin(houndAngle) * spawnRadius;
            const groundY = getTerrainHeight(sx, sz);

            const houndObj = createLowPolyZombie('HOUND', null);
            houndObj.mesh.position.set(sx, groundY, sz);
            houndObj.mesh.lookAt(0, groundY, 0);

            scene.add(houndObj.mesh);
            zombies.push(houndObj);
            zombiesRemainingToSpawn--;
            zombiesAliveCount++;
        }
        updateHUDCounters();
        return;
    }

    // SEEKER SPECIAL: Spawns in distant fog at altitude Y = 4.5m and flies into center of view
    if (typeKey === 'SEEKER') {
        const spawnRadius = 44;
        const sx = Math.cos(angle) * spawnRadius;
        const sz = Math.sin(angle) * spawnRadius;
        const seekerObj = createLowPolyZombie('SEEKER', carrierType);
        seekerObj.mesh.position.set(sx, 4.5, sz);
        seekerObj.mesh.lookAt(0, 1.2, 0);

        scene.add(seekerObj.mesh);
        zombies.push(seekerObj);
        zombiesRemainingToSpawn--;
        zombiesAliveCount++;
        updateHUDCounters();
        return;
    }

    // STANDARD GROUND ZOMBIES
    const spawnRadius = 36;
    const sx = Math.cos(angle) * spawnRadius;
    const sz = Math.sin(angle) * spawnRadius;
    const groundY = getTerrainHeight(sx, sz);

    const zombieObj = createLowPolyZombie(typeKey, carrierType);
    if (typeKey === 'SPITTER') {
        zombieObj.standoffDistance = getVisibleSpitterStandoff(angle);
    }
    zombieObj.mesh.position.set(sx, groundY, sz);
    zombieObj.mesh.lookAt(0, groundY, 0);

    scene.add(zombieObj.mesh);
    zombies.push(zombieObj);

    zombiesRemainingToSpawn--;
    zombiesAliveCount++;
    updateHUDCounters();
}

// ============================================================================
// 5. RESOURCE DROPS & POWER-UP PICKUPS (FIXED HEALTH BAR RESTORATION)
// ============================================================================
function spawnPickupDrop(pos, type) {
    const group = new THREE.Group();
    const isRepair = (type === 'REPAIR');
    const colorHex = isRepair ? 0x10b981 : 0xf59e0b;
    const lightColor = isRepair ? 0x34d399 : 0xfbbf24;

    const geo = isRepair ? new THREE.BoxGeometry(0.55, 0.55, 0.55) : new THREE.OctahedronGeometry(0.45, 0);
    const mat = new THREE.MeshLambertMaterial({ color: colorHex, emissive: colorHex, emissiveIntensity: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);

    const ringGeo = new THREE.TorusGeometry(0.5, 0.05, 5, 12);
    const ringMat = new THREE.MeshBasicMaterial({ color: lightColor });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    const groundY = getTerrainHeight(pos.x, pos.z);
    group.position.set(pos.x, groundY + 0.8, pos.z);
    scene.add(group);

    pickups.push({
        group: group,
        mesh: mesh,
        ring: ring,
        type: type,
        x: pos.x,
        z: pos.z,
        baseY: groundY + 0.8,
        radius: 1.1,
        life: 30.0,
        bobTime: Math.random() * 10
    });
}

function updatePickups(dt) {
    for (let i = pickups.length - 1; i >= 0; i--) {
        const p = pickups[i];
        p.bobTime += dt * 3.5;
        p.group.position.y = p.baseY + Math.sin(p.bobTime) * 0.18;
        p.mesh.rotation.y += dt * 2.0;

        p.life -= dt;
        if (p.life <= 0) {
            scene.remove(p.group);
            pickups.splice(i, 1);
        }
    }
}

// Fixed Centralized Health Recovery Function
function applyHeal(amount) {
    health = Math.min(100, health + amount);
    healthValue.textContent = `${health}%`;
    healthBarFill.style.width = `${health}%`;
    lastRenderedHealth = health;
    showPowerupNotification(`NANO-REPAIR: +${amount}% INTEGRITY RESTORED!`, 'repair');
    triggerHealPulse();
}

function collectPickup(pickup, index) {
    playPickupSound(pickup.type);
    if (pickup.type === 'REPAIR') {
        const healAmount = Math.min(50, 35 + Math.floor((currentWave - 1) / 5) * 5);
        applyHeal(healAmount);
    } else if (pickup.type === 'OVERDRIVE') {
        isOverdriveActive = true;
        overdriveTimer = OVERDRIVE_DURATION;
        isTurretJammed = false;
        jammedAlert.classList.add('hidden');
        overdriveCard.classList.remove('hidden');
        showPowerupNotification('QUAD OVERDRIVE: 12s QUAD FIRE (WATCH OVERHEAT)!', 'overdrive');
    }

    spawnLowPolyExplosion(pickup.group.position, (pickup.type === 'REPAIR') ? 0x34d399 : 0xfbbf24, 10);
    scene.remove(pickup.group);
    pickups.splice(index, 1);
}

function triggerHealPulse() {
    healthBarFill.style.background = '#34d399';
    setTimeout(() => {
        healthBarFill.style.background = 'linear-gradient(90deg, #ff3366, #ff6b6b)';
    }, 350);
}

function showPowerupNotification(text, typeClass) {
    powerupNotifyText.textContent = text;
    powerupNotify.className = `powerup-notify ${typeClass}`;
    powerupNotify.classList.remove('hidden');
    setTimeout(() => powerupNotify.classList.add('hidden'), 2400);
}

function showBossTelegraph(text, duration = 2200) {
    bossTelegraphText.textContent = text;
    bossTelegraph.classList.remove('hidden');
    setTimeout(() => bossTelegraph.classList.add('hidden'), duration);
}

// ============================================================================
// 6. WEAPON FIRING & OVERHEAT (OVERDRIVE NOW HAS OVERHEAT JAM RISK)
// ============================================================================
function fireBullet() {
    if (isTurretJammed) return;

    playShootSound(isOverdriveActive);

    if (isOverdriveActive) {
        fireSingleBarrel(leftBarrelGroup, leftMuzzlePoint, -0.06, 0xfbbf24);
        fireSingleBarrel(leftBarrelGroup, leftMuzzlePoint, 0.06, 0xfbbf24);
        fireSingleBarrel(rightBarrelGroup, rightMuzzlePoint, -0.06, 0xfbbf24);
        fireSingleBarrel(rightBarrelGroup, rightMuzzlePoint, 0.06, 0xfbbf24);

        leftBarrelRecoil = 0.4;
        rightBarrelRecoil = 0.4;

        // Quad Fire builds heat with Overheat Jam Risk!
        turretHeat = Math.min(100, turretHeat + 4.2);
        if (turretHeat >= 100) {
            isTurretJammed = true;
            jamCooldownTimer = 2.2;
            jammedAlert.classList.remove('hidden');
            triggerSteamBurst();
            showBossTelegraph('⚠️ OVERDRIVE WEAPONS OVERHEATED - COOLING DOWN!', 2200);
        }
    } else {
        let activeBarrelGroup, activeMuzzlePoint;
        if (nextBarrel === 'left') {
            activeBarrelGroup = leftBarrelGroup;
            activeMuzzlePoint = leftMuzzlePoint;
            leftBarrelRecoil = 0.35;
            nextBarrel = 'right';
        } else {
            activeBarrelGroup = rightBarrelGroup;
            activeMuzzlePoint = rightMuzzlePoint;
            rightBarrelRecoil = 0.35;
            nextBarrel = 'left';
        }
        fireSingleBarrel(activeBarrelGroup, activeMuzzlePoint, 0, 0x00f0ff);

        turretHeat = Math.min(100, turretHeat + HEAT_PER_SHOT);
        if (turretHeat >= 100) {
            isTurretJammed = true;
            jamCooldownTimer = JAM_COOLDOWN;
            jammedAlert.classList.remove('hidden');
            triggerSteamBurst();
        }
    }
}

function fireSingleBarrel(barrelGroup, muzzlePoint, spreadAngle = 0, colorHex = 0x00f0ff) {
    const tipWorld = muzzlePoint.clone().applyMatrix4(barrelGroup.matrixWorld);

    let direction;
    if (targetPoint) {
        direction = targetPoint.clone().sub(tipWorld).normalize();
    } else {
        direction = new THREE.Vector3();
        turretPivot.getWorldDirection(direction).normalize();
    }

    if (spreadAngle !== 0) {
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), spreadAngle);
    }

    const bulletMat = (colorHex === 0xfbbf24) ? MAT_BULLET_GOLD : MAT_BULLET_CYAN;
    const bulletMesh = new THREE.Mesh(GEO_BULLET, bulletMat);
    bulletMesh.position.copy(tipWorld);
    bulletMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
    scene.add(bulletMesh);

    bullets.push({
        mesh: bulletMesh,
        direction: direction,
        speed: 38.0,
        prevPos: tipWorld.clone(),
        colorHex: colorHex,
        damage: isOverdriveActive ? 2 : 1,
        isOverdrive: isOverdriveActive,
        birthTime: Date.now()
    });

    ejectShellCasing(barrelGroup);
}

function triggerSteamBurst() {
    playSteamHissSound();
    const tipL = leftMuzzlePoint.clone().applyMatrix4(leftBarrelGroup.matrixWorld);
    const tipR = rightMuzzlePoint.clone().applyMatrix4(rightBarrelGroup.matrixWorld);

    [tipL, tipR].forEach(tip => {
        for (let i = 0; i < 3; i++) {
            const steam = new THREE.Mesh(
                GEO_STEAM,
                new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
            );
            steam.position.copy(tip);
            scene.add(steam);

            steamParticles.push({
                mesh: steam,
                velocity: new THREE.Vector3((Math.random() - 0.5) * 1.5, Math.random() * 2.5 + 1.0, (Math.random() - 0.5) * 1.5),
                life: 0.7,
                decay: 1.5
            });
        }
    });
}

function ejectShellCasing(barrelGroup) {
    if (shellCasings.length > 15) {
        const old = shellCasings.shift();
        scene.remove(old.mesh);
    }

    const casing = new THREE.Mesh(GEO_CASING, MAT_CASING);
    const pos = new THREE.Vector3(0, 0, 0.4).applyMatrix4(barrelGroup.matrixWorld);
    casing.position.copy(pos);
    scene.add(casing);

    const sideDir = (Math.random() < 0.5) ? -1 : 1;
    shellCasings.push({
        mesh: casing,
        velocity: new THREE.Vector3(
            (Math.random() * 2 + 2) * sideDir,
            Math.random() * 2 + 2.5,
            (Math.random() - 0.5) * 2
        ),
        rotVelocity: new THREE.Vector3(Math.random() * 15, Math.random() * 15, Math.random() * 15),
        life: 0.7
    });
}

function spawnLowPolyExplosion(pos, colorHex, count = 8) {
    playExplosionSound(colorHex === 0xff4400 ? 'fire' : 'normal', count > 8 ? 1.4 : 1.0);
    while (debrisChunks.length + count > 30) {
        const old = debrisChunks.shift();
        scene.remove(old.mesh);
    }

    const mat = (colorHex === 0xff4400) ? MAT_DEBRIS_FIRE : (colorHex === 0x34d399 ? MAT_CORE_GREEN : MAT_DEBRIS_FLESH);

    for (let i = 0; i < count; i++) {
        const chunk = new THREE.Mesh(GEO_DEBRIS, mat);
        chunk.position.copy(pos);
        scene.add(chunk);

        debrisChunks.push({
            mesh: chunk,
            velocity: new THREE.Vector3((Math.random() - 0.5) * 7, Math.random() * 4 + 2, (Math.random() - 0.5) * 7),
            rotVelocity: new THREE.Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10),
            life: 0.8,
            decay: 1.4
        });
    }
}

function spawnFireExplosion(x, y, z) {
    const pos = new THREE.Vector3(x, y, z);
    spawnLowPolyExplosion(pos, 0xff4400, 12);
}

function spawnObstacleImpact(pos, colorHex = 0x8892a0) {
    playObstacleImpactSound(colorHex === 0x475569 ? 'steel' : 'rock');
    spawnLowPolyExplosion(pos, colorHex, 4);
}

function spawnBunkerHitSparks(pos) {
    while (debrisChunks.length > 25) {
        const old = debrisChunks.shift();
        scene.remove(old.mesh);
    }

    for (let i = 0; i < 3; i++) {
        const spark = new THREE.Mesh(GEO_SPARK, MAT_SPARK);
        spark.position.copy(pos);
        scene.add(spark);

        debrisChunks.push({
            mesh: spark,
            velocity: new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 3 + 1.5, (Math.random() - 0.5) * 4),
            rotVelocity: new THREE.Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10),
            life: 0.35,
            decay: 3.0
        });
    }
}

function initZombieMaterials(zombie) {
    if (!zombie) return;
    if (zombie.meshes && Array.isArray(zombie.meshes)) {
        zombie.meshes.forEach(m => {
            if (m && m.material) {
                m.userData.origMaterial = m.material;
                m.userData.flashTimeout = null;
            }
        });
    }
}

function flashZombieHit(zombie) {
    if (!zombie || zombie.state === 'DYING') return;

    if (zombie.meshes) {
        zombie.meshes.forEach(m => {
            if (m && m.material) {
                if (!m.userData.origMaterial) {
                    m.userData.origMaterial = m.material;
                }
                m.material = MAT_SPARK;
                if (m.userData.flashTimeout) {
                    clearTimeout(m.userData.flashTimeout);
                    m.userData.flashTimeout = null;
                }
                m.userData.flashTimeout = setTimeout(() => {
                    if (m && m.userData && m.userData.origMaterial) {
                        m.material = m.userData.origMaterial;
                        m.userData.flashTimeout = null;
                    }
                }, 60);
            }
        });
    }

    if (!zombie.isAttacking && !zombie.isBoss) {
        const knockback = new THREE.Vector3().copy(zombie.mesh.position).normalize().multiplyScalar(0.2);
        zombie.mesh.position.add(knockback);
    }
}

// ============================================================================
// 6.1 SHOOTABLE BOSS & SPECIAL PROJECTILES (VALKYRIE NEEDLES, BOULDERS & ACID BILE)
// ============================================================================
function spawnValkyrieNeedle(originPos, targetPos) {
    playBossAttackSound('VALKYRIE', 'NEEDLE');
    const geo = new THREE.CylinderGeometry(0.12, 0.12, 1.4, 5);
    geo.rotateX(Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0xd97706 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(originPos);

    const dir = new THREE.Vector3().subVectors(targetPos, originPos).normalize();
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    scene.add(mesh);

    bossProjectiles.push({
        mesh: mesh,
        direction: dir,
        speed: 18.0,
        type: 'NEEDLE',
        radius: 0.6,
        hp: 1,
        damage: 8,
        birthTime: Date.now()
    });
}

function spawnAbominationBoulder(originPos) {
    playBossAttackSound('ABOMINATION', 'BOULDER');
    const geo = new THREE.DodecahedronGeometry(0.8, 0);
    const mat = new THREE.MeshLambertMaterial({ color: 0xef4444, emissive: 0x991b1b, emissiveIntensity: 0.5 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(originPos.x, originPos.y + 2.5, originPos.z);
    scene.add(mesh);

    const toBase = new THREE.Vector3(-originPos.x, 0, -originPos.z).normalize();
    const velocity = new THREE.Vector3(toBase.x * 12.0, 10.0, toBase.z * 12.0);

    bossProjectiles.push({
        mesh: mesh,
        velocity: velocity,
        type: 'BOULDER',
        radius: 1.0,
        hp: 3,
        damage: 22,
        birthTime: Date.now()
    });

    showBossTelegraph('⚠️ INCOMING BOULDER - SHOOT IT DOWN!');
}

function spawnAcidBile(originPos) {
    playZombieAttackSound('SPITTER');
    const geo = new THREE.SphereGeometry(0.35, 6, 6);
    const mat = new THREE.MeshLambertMaterial({ color: 0xa3e635, emissive: 0x65a30d, emissiveIntensity: 0.9 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(originPos.x, originPos.y + 0.8, originPos.z);
    scene.add(mesh);

    const targetPos = new THREE.Vector3(0, 1.0, 0);
    const dir = new THREE.Vector3().subVectors(targetPos, mesh.position).normalize();

    bossProjectiles.push({
        mesh: mesh,
        direction: dir,
        speed: 13.0,
        type: 'ACID_BILE',
        radius: 0.7,
        hp: 1,
        damage: 6,
        birthTime: Date.now()
    });
}

function spawnSonicScreech(originPos) {
    playZombieAttackSound('SCREAMER');
    // 1. Expanding radial frenzy aura buff for nearby zombies in Screamer's vicinity (12m radius)
    const ringGeo = new THREE.RingGeometry(0.6, 1.4, 20);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xd946ef, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    const groundY = getTerrainHeight(originPos.x, originPos.z);
    ring.position.set(originPos.x, groundY + 0.25, originPos.z);
    scene.add(ring);

    // Buff nearby zombies with +40% speed frenzy for 4.0s
    for (let i = 0; i < zombies.length; i++) {
        const otherZ = zombies[i];
        if (otherZ.mesh) {
            const dist = otherZ.mesh.position.distanceTo(originPos);
            if (dist <= 12.0) {
                otherZ.frenzyTimer = 4.0;
            }
        }
    }

    let expandTimer = 0;
    const expandAnim = () => {
        expandTimer += 0.04;
        ring.scale.setScalar(1 + expandTimer * 8.0);
        ringMat.opacity = Math.max(0, 0.85 - expandTimer * 1.6);
        if (expandTimer < 0.55) {
            requestAnimationFrame(expandAnim);
        } else {
            scene.remove(ring);
        }
    };
    expandAnim();

    // 2. Focused Sonic Sound Wave Projectile launched toward the outpost!
    const soundWaveGroup = new THREE.Group();
    const waveMat = new THREE.MeshBasicMaterial({ color: 0xe879f9, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    
    // 3 expanding concentric acoustic arc rings
    for (let w = 0; w < 3; w++) {
        const arcGeo = new THREE.TorusGeometry(0.45 + w * 0.35, 0.06, 6, 16, Math.PI * 0.85);
        const arcMesh = new THREE.Mesh(arcGeo, waveMat);
        arcMesh.position.set(0, 0, -w * 0.3);
        arcMesh.rotation.z = Math.PI * 0.075;
        soundWaveGroup.add(arcMesh);
    }

    soundWaveGroup.position.set(originPos.x, groundY + 1.1, originPos.z);
    
    const targetPos = new THREE.Vector3(0, 1.1, 0);
    const dir = new THREE.Vector3().subVectors(targetPos, soundWaveGroup.position).normalize();
    soundWaveGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), dir);
    scene.add(soundWaveGroup);

    bossProjectiles.push({
        mesh: soundWaveGroup,
        direction: dir,
        speed: 14.5,
        type: 'SOUND_WAVE',
        radius: 1.1,
        hp: 1,
        damage: 6,
        birthTime: Date.now()
    });

    showBossTelegraph('⚠️ BLIGHT SCREAMER EMITTED SONIC SOUND WAVE & BUFFED NEARBY ZOMBIES!', 1800);
}

function spawnSeismicShockwave(originPos) {
    const groundY = getTerrainHeight(originPos.x, originPos.z);
    const shockGroup = new THREE.Group();
    shockGroup.position.set(originPos.x, groundY + 0.12, originPos.z);

    // 1. Primary glowing amber expanding shockwave ring
    const ring1Geo = new THREE.RingGeometry(0.8, 1.8, 28);
    ring1Geo.rotateX(-Math.PI / 2);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    shockGroup.add(ring1);

    // 2. Secondary fiery volcanic fracture ring
    const ring2Geo = new THREE.RingGeometry(0.3, 1.0, 20);
    ring2Geo.rotateX(-Math.PI / 2);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    shockGroup.add(ring2);

    // 3. Glowing gold ground fissure crest
    const crestGeo = new THREE.TorusGeometry(1.3, 0.09, 4, 20);
    crestGeo.rotateX(Math.PI / 2);
    const crestMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.9 });
    const crest = new THREE.Mesh(crestGeo, crestMat);
    shockGroup.add(crest);

    scene.add(shockGroup);

    // 4. Erupting rocky earth debris & sparks
    for (let d = 0; d < 12; d++) {
        const dGeo = new THREE.BoxGeometry(0.25 + Math.random() * 0.25, 0.25 + Math.random() * 0.25, 0.25 + Math.random() * 0.25);
        const dMat = new THREE.MeshLambertMaterial({ color: (Math.random() < 0.6) ? 0x78350f : 0xf59e0b });
        const dMesh = new THREE.Mesh(dGeo, dMat);
        dMesh.position.set(
            originPos.x + (Math.random() - 0.5) * 1.5,
            groundY + 0.3,
            originPos.z + (Math.random() - 0.5) * 1.5
        );
        scene.add(dMesh);

        const angle = Math.random() * Math.PI * 2;
        const spd = 3.0 + Math.random() * 6.0;
        debrisChunks.push({
            mesh: dMesh,
            velocity: new THREE.Vector3(Math.cos(angle) * spd, 6.0 + Math.random() * 5.0, Math.sin(angle) * spd),
            rotVelocity: new THREE.Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10),
            life: 0.9,
            decay: 1.1
        });
    }

    // Expanding animation loop
    let progress = 0;
    const animateShockwave = () => {
        progress += 0.035;
        const currentScale = 1.0 + progress * 14.0;
        shockGroup.scale.set(currentScale, 1.0, currentScale);
        ring1Mat.opacity = Math.max(0, 0.95 - progress * 1.1);
        ring2Mat.opacity = Math.max(0, 0.9 - progress * 1.2);
        crestMat.opacity = Math.max(0, 0.9 - progress * 1.15);

        if (progress < 0.85) {
            requestAnimationFrame(animateShockwave);
        } else {
            scene.remove(shockGroup);
            ring1Geo.dispose();
            ring1Mat.dispose();
            ring2Geo.dispose();
            ring2Mat.dispose();
            crestGeo.dispose();
            crestMat.dispose();
        }
    };
    animateShockwave();
}

function updateBossProjectiles(dt) {
    for (let i = bossProjectiles.length - 1; i >= 0; i--) {
        const p = bossProjectiles[i];

        if (p.type === 'NEEDLE') {
            p.mesh.position.addScaledVector(p.direction, p.speed * dt);

            if (p.mesh.position.length() <= 3.4) {
                takeDamage(p.damage);
                spawnBunkerHitSparks(p.mesh.position);
                scene.remove(p.mesh);
                bossProjectiles.splice(i, 1);
                continue;
            }
        } else if (p.type === 'BOULDER') {
            p.mesh.position.addScaledVector(p.velocity, dt);
            p.velocity.y -= 18.0 * dt;
            p.mesh.rotation.x += dt * 4.0;
            p.mesh.rotation.y += dt * 4.0;

            if (p.mesh.position.y <= 0.4 || p.mesh.position.length() <= 3.6) {
                takeDamage(p.damage);
                spawnFireExplosion(p.mesh.position.x, 0.5, p.mesh.position.z);
                scene.remove(p.mesh);
                bossProjectiles.splice(i, 1);
                continue;
            }
        } else if (p.type === 'ACID_BILE') {
            p.mesh.position.addScaledVector(p.direction, p.speed * dt);
            p.mesh.rotation.x += dt * 5.0;
            p.mesh.rotation.y += dt * 5.0;

            if (p.mesh.position.length() <= 3.4) {
                takeDamage(p.damage);
                spawnObstacleImpact(p.mesh.position, 0xa3e635);
                scene.remove(p.mesh);
                bossProjectiles.splice(i, 1);
                continue;
            }
        } else if (p.type === 'SOUND_WAVE') {
            p.mesh.position.addScaledVector(p.direction, p.speed * dt);
            p.mesh.scale.addScalar(dt * 0.45);

            // Sonic wave constantly boosts any zombies it flies past
            for (let zIdx = 0; zIdx < zombies.length; zIdx++) {
                const zObj = zombies[zIdx];
                if (zObj.mesh && zObj.mesh.position.distanceTo(p.mesh.position) <= 5.0) {
                    zObj.frenzyTimer = 3.5;
                }
            }

            if (p.mesh.position.length() <= 3.4) {
                takeDamage(p.damage);
                spawnBunkerHitSparks(p.mesh.position);
                triggerCameraShake(0.35);
                scene.remove(p.mesh);
                bossProjectiles.splice(i, 1);
                continue;
            }
        }

        if ((Date.now() - p.birthTime) > 4000) {
            scene.remove(p.mesh);
            bossProjectiles.splice(i, 1);
        }
    }
}

// ============================================================================
// 7. GAME FLOW, DAMAGE & WAVE MANAGEMENT
// ============================================================================
function startGame() {
    initAudio();
    isDefeatOutroActive = false;
    defeatOutroTimer = 0;
    defeatExplosionStage = 0;

    if (turretPivot) {
        turretPivot.position.set(0, 1.2, 0);
        turretPivot.rotation.set(0, 0, 0);
    }
    if (leftBarrelGroup) {
        leftBarrelGroup.position.set(-0.52, 0.65, 1.0);
        leftBarrelGroup.rotation.set(0, 0, 0);
    }
    if (rightBarrelGroup) {
        rightBarrelGroup.position.set(0.52, 0.65, 1.0);
        rightBarrelGroup.rotation.set(0, 0, 0);
    }

    startOverlay.classList.add('hidden');
    hudElement.classList.remove('hidden');
    gameState = 'PLAYING';
    health = 100;
    healthValue.textContent = '100%';
    healthBarFill.style.width = '100%';
    healthBarFill.style.background = 'linear-gradient(90deg, #ff3366, #ff6b6b)';
    lastRenderedHealth = 100;
    clock.getDelta();
    startNextWave();
}

function startNextWave() {
    isWaveIntermission = false;
    const isBossWave = (currentWave % 5 === 0);
    setSoundtrackMode(isBossWave ? 'BOSS' : 'DEFENSE');

    zombiesRemainingToSpawn = isBossWave ? 8 : 6 + currentWave * 3;
    zombiesAliveCount = 0;

    spawnInterval = Math.max(450, baseSpawnInterval - (currentWave * 70));
    spawnTimer = 0;
    spawnsSinceLastCarrier = 0;

    updateHUDCounters();

    if (isBossWave) {
        activeBoss = createBossForWave(currentWave);
        zombies.push(activeBoss);
        zombiesAliveCount++;
        updateHUDCounters();

        // WAVE 5 COOPERATION: Hunter Boss and 4-Hound pack dynamic tag-team synergy
        if (currentWave === 5 && activeBoss.bossType === 'HUNTER') {
            activeBoss.state = 'STALK_STANDBY';
            const spawnAngle = Math.atan2(activeBoss.mesh.position.z, activeBoss.mesh.position.x);
            activeBoss.circleAngle = spawnAngle;
            activeBoss.circleRadius = 23.0;
            activeBoss.circleTimer = 0;
            activeBoss.mesh.position.x = Math.cos(spawnAngle) * 23.0;
            activeBoss.mesh.position.z = Math.sin(spawnAngle) * 23.0;
            activeBoss.mesh.position.y = getTerrainHeight(activeBoss.mesh.position.x, activeBoss.mesh.position.z);

            for (let h = 0; h < 4; h++) {
                const houndAngle = spawnAngle + (h - 1.5) * 0.16;
                const hx = Math.cos(houndAngle) * 36;
                const hz = Math.sin(houndAngle) * 36;
                const hy = getTerrainHeight(hx, hz);
                const hound = createLowPolyZombie('HOUND', null);
                hound.mesh.position.set(hx, hy, hz);
                hound.mesh.lookAt(0, hy, 0);
                scene.add(hound.mesh);
                zombies.push(hound);
                zombiesAliveCount++;
            }
            updateHUDCounters();
        }

        // Trigger 10-second cinematic camera intro showcasing the unique boss
        startBossCinematic(activeBoss);
    } else {
        bossHud.classList.add('hidden');
        activeBoss = null;
        diveAlert.classList.add('hidden');
        bossTelegraph.classList.add('hidden');
    }
}

// ============================================================================
// 7.1 UNIQUE BOSS 10-SECOND CINEMATIC INTRO SYSTEM
// ============================================================================
function getBossIntel(bossType) {
    switch (bossType) {
        case 'HUNTER':
            return 'Feral camouflaged predator blending into wasteland shadows. Stalks the perimeter before acrobatically leaping over defenses.';
        case 'OMEGA':
            return 'Giant terrestrial reptilian colossus with razor-sharp snapping jaws and sweeping tail whip. Concentrate firepower (5 hits) when it rears up to roar to STAGGER it and cancel base damage!';
        case 'JUGGERNAUT':
            return 'Mutant purple gore bull with reinforced frontal bone horn shield. Smashes obstacles. Highly vulnerable to flank critical hits (2x Crit).';
        case 'VALKYRIE':
            return 'Obsidian shadow eagle armed with amber energy feathers. Circles from high altitude before dive-bombing. Concentrate fire to stagger.';
        case 'SALAMANDER':
            return 'Armored spined colossus with a hardened 60% damage-resistant carapace. Aim for the 4 glowing bio-nodules for 3x Critical Damage, or land 5 firepower hits during Seismic Stomp rearing to STAGGER it and drop crates!';
        case 'ABOMINATION':
            return 'Titanic bio-plasma colossus. Pounding footsteps cause ground tremors and lobs explosive boulders. Ruptures with unstable plasma energy.';
        default:
            return 'High-threat apex mutation detected breaching the defensive perimeter.';
    }
}

function startBossCinematic(boss) {
    if (!boss || !boss.mesh) return;
    if (boss.bossType) unlockThreat(boss.bossType);
    isCinematicActive = true;
    cinematicTimer = 0;
    cinematicBoss = boss;

    setSoundtrackMode('CINEMATIC');
    playBossShowcaseSound(boss.bossType);

    if (cinematicOverlay) cinematicOverlay.classList.remove('hidden');
    if (cinematicTitle) cinematicTitle.textContent = boss.name;
    if (cinematicSubtitle) cinematicSubtitle.textContent = boss.subtitle;
    if (cinematicIntel) cinematicIntel.textContent = getBossIntel(boss.bossType);
    if (cinematicProgressFill) cinematicProgressFill.style.width = '0%';

    bossHud.classList.add('hidden');
    bossAnnounce.classList.add('hidden');
    diveAlert.classList.add('hidden');
    bossTelegraph.classList.add('hidden');
}

function updateBossCinematic(dt) {
    if (!cinematicBoss || !cinematicBoss.mesh) {
        endBossCinematic();
        return;
    }

    cinematicTimer += dt;
    const progress = Math.min(1.0, cinematicTimer / CINEMATIC_DURATION);
    if (cinematicProgressFill) {
        cinematicProgressFill.style.width = `${(progress * 100).toFixed(1)}%`;
    }

    const b = cinematicBoss;
    const bPos = b.mesh.position;
    const bType = b.bossType;

    // Boss showcase animation & stance
    b.animTime = (b.animTime || 0) + dt * 10.0;
    const t = b.animTime;

    if (bType === 'HUNTER') {
        if (cinematicTimer < 3.0) {
            if (b.bodyGroup) b.bodyGroup.position.y = 0.45;
            if (b.bodyGroup) b.bodyGroup.rotation.x = 0.45;
            if (b.leftLeg) b.leftLeg.rotation.x = 0.8;
            if (b.rightLeg) b.rightLeg.rotation.x = -0.6;
            if (b.leftArm) b.leftArm.rotation.x = -Math.PI / 3;
            if (b.rightArm) b.rightArm.rotation.x = -Math.PI / 3;
        } else if (cinematicTimer < 7.5) {
            if (b.bodyGroup) b.bodyGroup.position.y = 0.75 + Math.sin(t * 3.0) * 0.1;
            if (b.bodyGroup) b.bodyGroup.rotation.x = 0.1;
            if (b.leftArm) {
                b.leftArm.rotation.x = -Math.PI / 1.3 + Math.sin(t * 6.0) * 0.65;
                b.leftArm.rotation.z = -0.3 + Math.cos(t * 6.0) * 0.2;
            }
            if (b.rightArm) {
                b.rightArm.rotation.x = -Math.PI / 1.3 + Math.cos(t * 6.0) * 0.65;
                b.rightArm.rotation.z = 0.3 - Math.sin(t * 6.0) * 0.2;
            }
            if (b.headGroup) b.headGroup.rotation.y = Math.sin(t * 4.0) * 0.35;
        } else {
            b.mesh.lookAt(0, bPos.y, 0);
        }
    } else if (bType === 'JUGGERNAUT') {
        if (cinematicTimer < 3.0) {
            if (b.flLeg) b.flLeg.rotation.x = Math.sin(t * 3.0) * 0.5;
            if (b.frLeg) b.frLeg.rotation.x = -Math.sin(t * 3.0) * 0.5;
            if (b.blLeg) b.blLeg.rotation.x = -Math.sin(t * 3.0) * 0.5;
            if (b.brLeg) b.brLeg.rotation.x = Math.sin(t * 3.0) * 0.5;
        } else if (cinematicTimer < 7.5) {
            if (b.flLeg) b.flLeg.rotation.x = Math.sin(t * 8.0) * 0.9;
            if (b.headGroup) {
                b.headGroup.rotation.x = -0.3 + Math.sin(t * 4.0) * 0.25;
                b.headGroup.position.y = 0.45 + Math.sin(t * 4.0) * 0.15;
            }
            if (b.bodyGroup) b.bodyGroup.position.y = 1.15 + Math.abs(Math.sin(t * 4.0)) * 0.15;
        } else {
            b.mesh.lookAt(0, bPos.y, 0);
        }
    } else if (bType === 'VALKYRIE') {
        if (cinematicTimer < 3.0) {
            if (b.leftWing) b.leftWing.rotation.z = Math.sin(t * 2.0) * 0.4;
            if (b.rightWing) b.rightWing.rotation.z = -Math.sin(t * 2.0) * 0.4;
        } else if (cinematicTimer < 7.5) {
            if (b.leftWing) b.leftWing.rotation.z = Math.sin(t * 7.0) * 1.15;
            if (b.rightWing) b.rightWing.rotation.z = -Math.sin(t * 7.0) * 1.15;
            if (b.headGroup) b.headGroup.rotation.x = -0.35 + Math.sin(t * 3.5) * 0.2;
            if (b.groundBeacon) {
                b.groundBeacon.position.set(bPos.x, getTerrainHeight(bPos.x, bPos.z) + 0.08, bPos.z);
            }
        } else {
            b.mesh.lookAt(0, 1.2, 0);
        }
    } else if (bType === 'OMEGA') {
        if (cinematicTimer < 3.0) {
            if (b.flLeg) b.flLeg.rotation.y = Math.sin(t * 3.0) * 0.4;
            if (b.frLeg) b.frLeg.rotation.y = -Math.sin(t * 3.0) * 0.4;
            if (b.tailGroup) b.tailGroup.rotation.y = Math.sin(t * 2.0) * 0.3;
        } else if (cinematicTimer < 7.5) {
            // Threatening reared-up pose
            if (b.bodyGroup) b.bodyGroup.rotation.x = -0.3 + Math.sin(t * 2.0) * 0.1;
            if (b.headGroup) b.headGroup.rotation.x = -0.25 + Math.sin(t * 3.0) * 0.15;
            if (b.lowerJaw) b.lowerJaw.rotation.x = 0.45 + Math.abs(Math.sin(t * 4.0)) * 0.3;
            if (b.tailGroup) b.tailGroup.rotation.y = Math.sin(t * 5.0) * 0.6;
        } else {
            if (b.bodyGroup) b.bodyGroup.rotation.x = 0;
            b.mesh.lookAt(0, bPos.y, 0);
        }
    } else if (bType === 'SALAMANDER') {
        if (cinematicTimer < 3.0) {
            if (b.flLeg) b.flLeg.rotation.y = Math.sin(t * 2.5) * 0.35;
            if (b.frLeg) b.frLeg.rotation.y = -Math.sin(t * 2.5) * 0.35;
            if (b.tailGroup) b.tailGroup.rotation.y = Math.sin(t * 2.0) * 0.25;
        } else if (cinematicTimer < 7.5) {
            // Ground stomp vibration showcase & glowing spines
            if (b.bodyGroup) b.bodyGroup.position.y = 0.7 + Math.abs(Math.sin(t * 4.0)) * 0.15;
            if (b.headGroup) b.headGroup.rotation.x = 0.1 + Math.sin(t * 3.0) * 0.2;
            const pulse = 0.8 + Math.abs(Math.sin(t * 6.0)) * 0.5;
            if (b.wp1 && b.wp1.material) b.wp1.material.emissiveIntensity = pulse;
            if (b.wp2 && b.wp2.material) b.wp2.material.emissiveIntensity = pulse;
            if (b.wp3 && b.wp3.material) b.wp3.material.emissiveIntensity = pulse;
            if (b.wpMouth && b.wpMouth.material) b.wpMouth.material.emissiveIntensity = pulse;
        } else {
            b.mesh.lookAt(0, bPos.y, 0);
        }
    } else if (bType === 'ABOMINATION') {
        if (cinematicTimer < 3.0) {
            if (b.leftLeg) b.leftLeg.rotation.x = Math.sin(t * 3.0) * 0.5;
            if (b.rightLeg) b.rightLeg.rotation.x = -Math.sin(t * 3.0) * 0.5;
        } else if (cinematicTimer < 7.5) {
            if (b.leftArm) b.leftArm.rotation.x = -Math.PI * 0.75 + Math.sin(t * 6.0) * 0.5;
            if (b.rightArm) b.rightArm.rotation.x = -Math.PI * 0.75 - Math.sin(t * 6.0) * 0.5;
            if (b.headGroup) b.headGroup.rotation.x = -0.3 + Math.sin(t * 3.0) * 0.2;
            if (b.coreMesh) b.coreMesh.scale.setScalar(1.0 + Math.abs(Math.sin(t * 5.0)) * 0.4);
        } else {
            b.mesh.lookAt(0, bPos.y, 0);
        }
    }

    // Camera Choreography
    const bossEyeY = b.isAerial ? bPos.y : (bPos.y + (bType === 'JUGGERNAUT' || bType === 'OMEGA' ? 1.6 : (bType === 'ABOMINATION' ? 2.2 : (bType === 'SALAMANDER' ? 1.2 : 1.3))));
    const targetLookAt = new THREE.Vector3(bPos.x, bossEyeY, bPos.z);
    
    // Smooth Orbit angle
    const orbitRadius = b.isAerial ? 12.0 : (bType === 'JUGGERNAUT' || bType === 'ABOMINATION' || bType === 'OMEGA' || bType === 'SALAMANDER' ? 7.5 : 5.5);
    const orbitSpeed = 0.35;
    const baseAngle = Math.atan2(bPos.z, bPos.x) + Math.PI;
    const currentAngle = baseAngle + cinematicTimer * orbitSpeed;
    const camTargetX = bPos.x + Math.cos(currentAngle) * orbitRadius;
    const camTargetZ = bPos.z + Math.sin(currentAngle) * orbitRadius;
    const camTargetY = b.isAerial ? (bPos.y + 1.6) : (getTerrainHeight(camTargetX, camTargetZ) + (bType === 'JUGGERNAUT' || bType === 'OMEGA' || bType === 'SALAMANDER' ? 2.6 : 2.0));

    const closeCamPos = new THREE.Vector3(camTargetX, camTargetY, camTargetZ);

    if (cinematicTimer < 3.0) {
        const p = cinematicTimer / 3.0;
        const ease = p * p * (3 - 2 * p);
        camera.position.lerpVectors(originalCameraPos, closeCamPos, ease);
        const look = new THREE.Vector3().lerpVectors(new THREE.Vector3(0, 1.2, 0), targetLookAt, ease);
        camera.lookAt(look);
    } else if (cinematicTimer < 7.5) {
        camera.position.copy(closeCamPos);
        camera.lookAt(targetLookAt);
    } else {
        const p = (cinematicTimer - 7.5) / 2.5;
        const ease = p * p * (3 - 2 * p);
        camera.position.lerpVectors(closeCamPos, originalCameraPos, ease);
        const look = new THREE.Vector3().lerpVectors(targetLookAt, new THREE.Vector3(0, 1.2, 0), ease);
        camera.lookAt(look);
    }

    if (cinematicTimer >= CINEMATIC_DURATION) {
        endBossCinematic();
    }
}

function endBossCinematic() {
    if (!isCinematicActive) return;
    isCinematicActive = false;
    setSoundtrackMode('BOSS');
    if (cinematicOverlay) cinematicOverlay.classList.add('hidden');
    camera.position.copy(originalCameraPos);
    camera.lookAt(0, 1.2, 0);

    // Show Boss HUD & telegraph
    if (activeBoss) {
        bossName.textContent = activeBoss.name;
        bossSubtitle.textContent = activeBoss.subtitle;
        bossBarFill.style.width = '100%';
        bossHpVal.textContent = '100%';
        bossHud.classList.remove('hidden');

        bossAnnounceTitle.textContent = `${activeBoss.name} ENGAGED`;
        bossAnnounceDesc.textContent = `Tactical Intel: ${activeBoss.subtitle}!`;
        bossAnnounce.classList.remove('hidden');
        setTimeout(() => bossAnnounce.classList.add('hidden'), 3000);
    }
}

function updateHUDCounters() {
    const totalRemaining = zombiesRemainingToSpawn + zombiesAliveCount;
    if (totalRemaining !== lastRenderedEnemies) {
        enemiesLeftValue.textContent = totalRemaining;
        lastRenderedEnemies = totalRemaining;
    }
    if (currentWave !== lastRenderedWave) {
        waveValue.textContent = currentWave;
        lastRenderedWave = currentWave;
    }
    if (score !== lastRenderedScore) {
        scoreValue.textContent = score;
        lastRenderedScore = score;
    }
    if (health !== lastRenderedHealth) {
        healthValue.textContent = `${health}%`;
        healthBarFill.style.width = `${health}%`;
        lastRenderedHealth = health;
    }
}

function flashTurretDamage() {
    if (turretPivot) {
        turretPivot.traverse(child => {
            if (child.isMesh && child.material && child.material.emissive) {
                child.material.emissive.setHex(0xff1111);
                child.material.emissiveIntensity = 0.95;
            }
        });
    }
    if (turretBase) {
        turretBase.traverse(child => {
            if (child.isMesh && child.material && child.material.emissive) {
                child.material.emissive.setHex(0xff1111);
                child.material.emissiveIntensity = 0.85;
            }
        });
    }
    setTimeout(() => {
        if (turretPivot) {
            turretPivot.traverse(child => {
                if (child.isMesh && child.material && child.material.emissive) {
                    if (child === leftBarrelMesh || child === rightBarrelMesh) {
                        const glowIntensity = Math.min(1.5, (turretHeat / 100) * 1.5);
                        child.material.emissive.setHex(0xff3300);
                        child.material.emissiveIntensity = glowIntensity;
                    } else {
                        child.material.emissive.setHex(0x000000);
                        child.material.emissiveIntensity = 0;
                    }
                }
            });
        }
        if (turretBase) {
            turretBase.traverse(child => {
                if (child.isMesh && child.material && child.material.emissive) {
                    child.material.emissive.setHex(0x000000);
                    child.material.emissiveIntensity = 0;
                }
            });
        }
    }, 180);
}

function takeDamage(amount) {
    if (gameState === 'DEFEAT_OUTRO' || gameState === 'GAMEOVER') return;
    if (amount > 0) {
        playBunkerHitSound();
        flashTurretDamage();
    }
    health = Math.max(0, health - amount);
    if (health !== lastRenderedHealth) {
        healthValue.textContent = `${health}%`;
        healthBarFill.style.width = `${health}%`;
        lastRenderedHealth = health;
    }

    triggerCameraShake();
    if (health <= 0) {
        startDefeatOutro();
    }
}

function triggerCameraShake(intensity = 0.35) {
    shakeDuration = intensity;
    document.body.classList.add('shake');
    setTimeout(() => {
        document.body.classList.remove('shake');
    }, Math.floor(intensity * 1000));
}

function startDefeatOutro() {
    gameState = 'DEFEAT_OUTRO';
    isDefeatOutroActive = true;
    defeatOutroTimer = 0;
    defeatExplosionStage = 0;

    setSoundtrackMode('GAMEOVER');

    if (diveAlert) diveAlert.classList.add('hidden');
    if (bossTelegraph) bossTelegraph.classList.add('hidden');
    if (jammedAlert) jammedAlert.classList.add('hidden');
    if (powerupNotify) powerupNotify.classList.add('hidden');
    if (overdriveCard) overdriveCard.classList.add('hidden');
    if (bossHud) bossHud.classList.add('hidden');
    if (bossAnnounce) bossAnnounce.classList.add('hidden');

    // Catastrophic initial central explosion
    spawnFireExplosion(0, 1.2, 0);
    spawnBunkerHitSparks(new THREE.Vector3(0, 1.4, 0));
    playExplosionSound('fire', 2.0);
    triggerCameraShake(0.7);

    // Stop active turret servo sound
    updateTurretServoAudio(0);
}

function updateDefeatOutro(dt) {
    defeatOutroTimer += dt;

    // 1. STAGED EXPLOSIONS & TURRET STRUCTURAL COLLAPSE
    if (defeatOutroTimer >= 0.4 && defeatExplosionStage === 0) {
        defeatExplosionStage = 1;
        if (leftBarrelGroup && leftMuzzlePoint) {
            const leftTip = leftMuzzlePoint.clone().applyMatrix4(leftBarrelGroup.matrixWorld);
            spawnFireExplosion(leftTip.x, leftTip.y, leftTip.z);
        }
        playExplosionSound('fire', 1.3);
        triggerCameraShake(0.4);
    }

    if (defeatOutroTimer >= 0.85 && defeatExplosionStage === 1) {
        defeatExplosionStage = 2;
        if (rightBarrelGroup && rightMuzzlePoint) {
            const rightTip = rightMuzzlePoint.clone().applyMatrix4(rightBarrelGroup.matrixWorld);
            spawnFireExplosion(rightTip.x, rightTip.y, rightTip.z);
        }
        playExplosionSound('fire', 1.3);
        triggerCameraShake(0.4);
    }

    if (defeatOutroTimer >= 1.4 && defeatExplosionStage === 2) {
        defeatExplosionStage = 3;
        spawnFireExplosion(0, 0.8, 0);
        spawnLowPolyExplosion(new THREE.Vector3(0, 0.9, 0), 0xff4400, 18);
        playExplosionSound('fire', 1.8);
        triggerCameraShake(0.6);
    }

    // Barrels sagging and drooping down
    if (leftBarrelGroup) {
        leftBarrelGroup.rotation.x = Math.min(0.85, leftBarrelGroup.rotation.x + dt * 1.8);
        leftBarrelGroup.position.y = Math.max(0.3, 0.65 - defeatOutroTimer * 0.15);
    }
    if (rightBarrelGroup) {
        rightBarrelGroup.rotation.x = Math.min(0.85, rightBarrelGroup.rotation.x + dt * 1.8);
        rightBarrelGroup.position.y = Math.max(0.3, 0.65 - defeatOutroTimer * 0.15);
    }

    // Turret chassis tilting and buckling into the base
    if (defeatOutroTimer >= 1.2 && turretPivot) {
        turretPivot.rotation.z = THREE.MathUtils.lerp(turretPivot.rotation.z, 0.42, dt * 2.2);
        turretPivot.rotation.x = THREE.MathUtils.lerp(turretPivot.rotation.x, -0.32, dt * 2.0);
        turretPivot.position.y = THREE.MathUtils.lerp(turretPivot.position.y, 0.62, dt * 2.0);
    }

    // Secondary smoke and burning sparks erupting from rubble
    if (Math.random() < 0.35) {
        const rx = (Math.random() - 0.5) * 2.2;
        const rz = (Math.random() - 0.5) * 2.2;
        spawnBunkerHitSparks(new THREE.Vector3(rx, 0.8 + Math.random() * 0.6, rz));
    }

    // 2. CAMERA CHOREOGRAPHY - Dramatic slow pull-back and tilt framing the overrun outpost
    const camProgress = Math.min(1.0, defeatOutroTimer / DEFEAT_OUTRO_DURATION);
    const easeCam = camProgress * camProgress * (3 - 2 * camProgress);
    const targetDefeatCamPos = new THREE.Vector3(0, 24, 26);
    camera.position.lerpVectors(originalCameraPos, targetDefeatCamPos, easeCam);
    camera.lookAt(0, 0.8, 0);

    // 3. SURVIVING ZOMBIES & BOSSES AGGRESSIVELY ADVANCE & SURROUND THE DESTROYED BASE
    for (let i = 0; i < zombies.length; i++) {
        const z = zombies[i];
        if (!z || !z.mesh || z.state === 'DYING') continue;

        const pos = z.mesh.position;
        const toCenterX = -pos.x;
        const toCenterZ = -pos.z;
        const distToCenter = Math.hypot(toCenterX, toCenterZ);
        const normX = toCenterX / (distToCenter || 1);
        const normZ = toCenterZ / (distToCenter || 1);

        // Desired surround radius around destroyed bunker
        let targetRadius = 2.4;
        if (z.isBoss) {
            targetRadius = (z.bossType === 'ABOMINATION' || z.bossType === 'JUGGERNAUT') ? 3.4 : 2.6;
        } else if (z.type === 'TANK' || z.type === 'BRUTE') {
            targetRadius = 2.8;
        } else if (z.type === 'SEEKER') {
            targetRadius = 2.2;
        }

        if (z.isAerial || z.type === 'SEEKER' || z.bossType === 'VALKYRIE') {
            // Aerial units descend to hover directly over the ruins
            if (distToCenter > targetRadius) {
                pos.x += normX * 10.0 * dt;
                pos.z += normZ * 10.0 * dt;
            }
            const hoverAlt = (z.bossType === 'VALKYRIE') ? 3.6 : 2.4;
            pos.y += (hoverAlt - pos.y) * 2.0 * dt;
            z.mesh.lookAt(0, 0.8, 0);
        } else {
            // Ground units march directly into the ruins and circle the fallen turret
            if (distToCenter > targetRadius) {
                const marchSpeed = Math.max(4.0, (z.speed || 3.0) * 1.35);
                pos.x += normX * marchSpeed * dt;
                pos.z += normZ * marchSpeed * dt;
                pos.y = getTerrainHeight(pos.x, pos.z);
                z.mesh.lookAt(0, pos.y, 0);
            } else {
                // At perimeter: face the center and crowd the rubble
                z.mesh.lookAt(0, getTerrainHeight(0, 0) + 0.5, 0);
            }
        }

        // Keep walking / flapping animations active
        updateZombieAnimation(z, dt);

        // Periodic menacing horde sounds
        z.defeatSoundTimer = (z.defeatSoundTimer || (Math.random() * 1.5)) + dt;
        if (z.defeatSoundTimer >= 2.0 + Math.random() * 2.0) {
            z.defeatSoundTimer = 0;
            if (z.isBoss) {
                playBossAttackSound(z.bossType, 'VICTORY');
            } else {
                playZombieApproachSound(z.type, pos.x, pos.z);
            }
        }
    }

    // 4. TRANSITION TO GAME OVER MODAL AT END OF OUTRO
    if (defeatOutroTimer >= DEFEAT_OUTRO_DURATION) {
        endGame();
    }
}

function endGame() {
    gameState = 'GAMEOVER';
    setSoundtrackMode('GAMEOVER');
    isCinematicActive = false;
    isDefeatOutroActive = false;
    if (cinematicOverlay) cinematicOverlay.classList.add('hidden');
    hudElement.classList.add('hidden');
    overdriveCard.classList.add('hidden');
    bossHud.classList.add('hidden');
    bossAnnounce.classList.add('hidden');
    bossTelegraph.classList.add('hidden');
    diveAlert.classList.add('hidden');
    jammedAlert.classList.add('hidden');
    powerupNotify.classList.add('hidden');
    pauseOverlay.classList.add('hidden');

    finalScore.textContent = score;
    finalWave.textContent = currentWave;

    // Prefill saved callsign for leaderboard recording
    if (playerCallsignInput) {
        playerCallsignInput.value = localStorage.getItem('outpost_omega_callsign') || 'COMMANDER';
    }
    if (saveStatusMsg) saveStatusMsg.textContent = '';

    gameOverOverlay.classList.remove('hidden');
}

function restartGame() {
    initAudio();
    isCinematicActive = false;
    isDefeatOutroActive = false;
    defeatOutroTimer = 0;
    defeatExplosionStage = 0;

    if (cinematicOverlay) cinematicOverlay.classList.add('hidden');
    camera.position.copy(originalCameraPos);
    camera.lookAt(0, 1.2, 0);

    // Reset turret transform & barrel angles and clear any damage emissives
    if (turretPivot) {
        turretPivot.position.set(0, 1.2, 0);
        turretPivot.rotation.set(0, 0, 0);
        turretPivot.traverse(child => {
            if (child.isMesh && child.material && child.material.emissive) {
                child.material.emissive.setHex(0x000000);
                child.material.emissiveIntensity = 0;
            }
        });
    }
    if (turretBase) {
        turretBase.traverse(child => {
            if (child.isMesh && child.material && child.material.emissive) {
                child.material.emissive.setHex(0x000000);
                child.material.emissiveIntensity = 0;
            }
        });
    }
    if (leftBarrelGroup) {
        leftBarrelGroup.position.set(-0.52, 0.65, 1.0);
        leftBarrelGroup.rotation.set(0, 0, 0);
    }
    if (rightBarrelGroup) {
        rightBarrelGroup.position.set(0.52, 0.65, 1.0);
        rightBarrelGroup.rotation.set(0, 0, 0);
    }
    if (leftBarrelMesh && leftBarrelMesh.material && leftBarrelMesh.material.emissive) {
        leftBarrelMesh.material.emissive.setHex(0x000000);
        leftBarrelMesh.material.emissiveIntensity = 0;
    }
    if (rightBarrelMesh && rightBarrelMesh.material && rightBarrelMesh.material.emissive) {
        rightBarrelMesh.material.emissive.setHex(0x000000);
        rightBarrelMesh.material.emissiveIntensity = 0;
    }

    // Reset Environment Lighting & Atmospheric Fog to exact original conditions
    if (sunLight) {
        sunLight.color.setHex(0xfff2df);
        sunLight.intensity = 1.6;
        sunLight.position.set(25, 35, 20);
    }
    if (ambientLight) {
        ambientLight.color.setHex(0x526580);
        ambientLight.intensity = 1.25;
    }
    if (scene && scene.fog) {
        scene.fog.color.setHex(0x0a0f18);
        scene.fog.near = 48;
        scene.fog.far = 110;
    }
    if (scene && scene.background) {
        scene.background.setHex(0x0a0f18);
    }

    zombies.forEach(z => {
        if (z.mesh) scene.remove(z.mesh);
        if (z.groundBeacon) scene.remove(z.groundBeacon);
    });
    bullets.forEach(b => { if (b.mesh) scene.remove(b.mesh); });
    bossProjectiles.forEach(p => { if (p.mesh) scene.remove(p.mesh); });
    debrisChunks.forEach(d => { if (d.mesh) scene.remove(d.mesh); });
    shellCasings.forEach(s => { if (s.mesh) scene.remove(s.mesh); });
    pickups.forEach(p => { if (p.group) scene.remove(p.group); });

    zombies = [];
    bullets = [];
    bossProjectiles = [];
    debrisChunks = [];
    shellCasings = [];
    pickups = [];
    activeBoss = null;

    gameState = 'PLAYING';
    score = 0;
    health = 100;
    currentWave = 1;
    turretHeat = 0;
    isTurretJammed = false;
    isOverdriveActive = false;
    overdriveTimer = 0;
    spawnsSinceLastCarrier = 0;

    lastRenderedHeat = -1;
    lastRenderedHealth = -1;
    lastRenderedScore = -1;
    lastRenderedWave = -1;
    lastRenderedEnemies = -1;

    updateHUDCounters();

    healthValue.textContent = '100%';
    healthBarFill.style.width = '100%';
    healthBarFill.style.background = 'linear-gradient(90deg, #ff3366, #ff6b6b)';
    lastRenderedHealth = 100;

    heatVal.textContent = '0%';
    heatBarFill.style.width = '0%';
    heatBarFill.style.background = 'linear-gradient(90deg, #38bdf8, #f59e0b, #ef4444)';
    overdriveCard.classList.add('hidden');
    bossHud.classList.add('hidden');
    bossTelegraph.classList.add('hidden');
    diveAlert.classList.add('hidden');
    jammedAlert.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    if (leaderboardModal) leaderboardModal.classList.add('hidden');
    if (guideModal) guideModal.classList.add('hidden');

    camera.position.copy(originalCameraPos);
    camera.lookAt(0, 1.2, 0);

    resetObstacles();

    gameOverOverlay.classList.add('hidden');
    hudElement.classList.remove('hidden');
    clock.getDelta();
    startNextWave();
}

function displayWaveCompletedBanner() {
    setSoundtrackMode('VICTORY');
    const banner = document.createElement('div');
    banner.style.position = 'absolute';
    banner.style.top = '38%';
    banner.style.left = '50%';
    banner.style.transform = 'translate(-50%, -50%)';
    banner.style.color = '#00f0ff';
    banner.style.fontSize = '30px';
    banner.style.fontWeight = '900';
    banner.style.letterSpacing = '3px';
    banner.style.textShadow = '0 0 20px rgba(0, 240, 255, 0.8)';
    banner.style.fontFamily = 'inherit';
    banner.style.zIndex = '12';
    banner.style.background = 'rgba(18, 24, 38, 0.9)';
    banner.style.border = '2px solid #00f0ff';
    banner.style.padding = '12px 30px';
    banner.style.borderRadius = '8px';
    banner.textContent = `WAVE ${currentWave} SECURED`;
    document.body.appendChild(banner);

    setTimeout(() => {
        banner.style.transition = 'all 0.6s ease';
        banner.style.opacity = '0';
        banner.style.transform = 'translate(-50%, -60%)';
        setTimeout(() => {
            if (document.body.contains(banner)) document.body.removeChild(banner);
        }, 600);
    }, 1200);
}

// ============================================================================
// 8. MAIN GAME UPDATE LOOP & SYSTEMS
// ============================================================================
function animate() {
    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.1);

    try {
        if (gameState === 'PLAYING') {
            if (isCinematicActive) {
                updateBossCinematic(dt);
                updateDebrisAndCasings(dt);
                updateEnvironmentDynamics(dt);
                updateCameraShake(dt);
            } else {
                updateAiming();
                updateRecoilAnimation(dt);
                updateHeatAndOverdrive(dt);
                updateZombies(dt);
                updateBullets(dt);
                updateBossProjectiles(dt);
                updatePickups(dt);
                updateCollisions();
                updateWaveSpawner(dt);
                updateDebrisAndCasings(dt);
                updateEnvironmentDynamics(dt);
                updateCameraShake(dt);
            }
        } else if (gameState === 'DEFEAT_OUTRO') {
            updateDefeatOutro(dt);
            updateDebrisAndCasings(dt);
            updateEnvironmentDynamics(dt);
            updateCameraShake(dt);
        }
    } catch (err) {
        console.error("[ANIMATE UPDATE ERROR]", err);
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Dynamic Crosshair Raycasting (Locks onto aerial boss, flying Seekers, and missiles when mouse hovers over sky)
function updateAiming() {
    raycaster.setFromCamera(mouse, camera);

    let foundAirTarget = false;
    if (activeBoss && activeBoss.isAerial && activeBoss.mesh) {
        const airPos = activeBoss.mesh.position;
        const toAir = new THREE.Vector3().subVectors(airPos, camera.position);
        const projLen = raycaster.ray.direction.dot(toAir);
        if (projLen > 0) {
            const closestPoint = camera.position.clone().addScaledVector(raycaster.ray.direction, projLen);
            if (closestPoint.distanceTo(airPos) < (activeBoss.radius + 1.8)) {
                targetPoint.copy(airPos);
                foundAirTarget = true;
            }
        }
    }

    if (!foundAirTarget) {
        for (let i = 0; i < zombies.length; i++) {
            const z = zombies[i];
            if (z.isAerial && z.mesh && z.state !== 'DYING') {
                const airPos = z.mesh.position;
                const toAir = new THREE.Vector3().subVectors(airPos, camera.position);
                const projLen = raycaster.ray.direction.dot(toAir);
                if (projLen > 0) {
                    const closestPoint = camera.position.clone().addScaledVector(raycaster.ray.direction, projLen);
                    if (closestPoint.distanceTo(airPos) < (z.radius + 1.4)) {
                        targetPoint.copy(airPos);
                        foundAirTarget = true;
                        break;
                    }
                }
            }
        }
    }

    if (!foundAirTarget) {
        for (let i = 0; i < bossProjectiles.length; i++) {
            const pPos = bossProjectiles[i].mesh.position;
            const toP = new THREE.Vector3().subVectors(pPos, camera.position);
            const projLen = raycaster.ray.direction.dot(toP);
            if (projLen > 0) {
                const closestPoint = camera.position.clone().addScaledVector(raycaster.ray.direction, projLen);
                if (closestPoint.distanceTo(pPos) < (bossProjectiles[i].radius + 1.4)) {
                    targetPoint.copy(pPos);
                    foundAirTarget = true;
                    break;
                }
            }
        }
    }

    if (!foundAirTarget) {
        raycaster.ray.intersectPlane(planeXZ, targetPoint);
    }

    if (targetPoint) {
        const aimHorizon = targetPoint.clone();
        aimHorizon.y = turretPivot.position.y;
        turretPivot.lookAt(aimHorizon);

        const currentRotY = turretPivot.rotation.y;
        let deltaAngle = Math.abs(currentRotY - lastTurretRotY);
        if (deltaAngle > Math.PI) deltaAngle = Math.PI * 2 - deltaAngle;
        const angularSpeed = deltaAngle / 0.016;
        updateTurretServoAudio(angularSpeed);
        lastTurretRotY = currentRotY;
    }
}

function updateRecoilAnimation(dt) {
    if (leftBarrelRecoil > 0) {
        leftBarrelRecoil = Math.max(0, leftBarrelRecoil - dt * 2.8);
        leftBarrelGroup.position.z = 1.0 - leftBarrelRecoil;
    }
    if (rightBarrelRecoil > 0) {
        rightBarrelRecoil = Math.max(0, rightBarrelRecoil - dt * 2.8);
        rightBarrelGroup.position.z = 1.0 - rightBarrelRecoil;
    }
}

function updateHeatAndOverdrive(dt) {
    if (isOverdriveActive) {
        overdriveTimer -= dt;
        overdriveTimerEl.textContent = `${Math.max(0, overdriveTimer).toFixed(1)}s`;
        const pct = (overdriveTimer / OVERDRIVE_DURATION) * 100;
        overdriveBarFill.style.width = `${pct}%`;

        if (overdriveTimer <= 0) {
            isOverdriveActive = false;
            overdriveCard.classList.add('hidden');
            heatBarFill.style.background = 'linear-gradient(90deg, #38bdf8, #f59e0b, #ef4444)';
            lastRenderedHeat = -1;
        }
    }

    // Heat & Cooldown Handling (Runs during both normal and Overdrive modes!)
    if (isTurretJammed) {
        jamCooldownTimer -= dt;
        turretHeat = (jamCooldownTimer / (isOverdriveActive ? 2.2 : JAM_COOLDOWN)) * 100;
        heatVal.textContent = `JAMMED (${Math.max(0, jamCooldownTimer).toFixed(1)}s)`;
        heatBarFill.style.width = `${turretHeat}%`;
        heatBarFill.style.background = '#ef4444';

        if (jamCooldownTimer <= 0) {
            isTurretJammed = false;
            turretHeat = 0;
            jammedAlert.classList.add('hidden');
            if (isOverdriveActive) {
                heatBarFill.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
            } else {
                heatBarFill.style.background = 'linear-gradient(90deg, #38bdf8, #f59e0b, #ef4444)';
            }
        }
    } else {
        turretHeat = Math.max(0, turretHeat - dt * HEAT_COOL_RATE);
        const roundedHeat = Math.round(turretHeat);
        if (roundedHeat !== lastRenderedHeat) {
            heatVal.textContent = isOverdriveActive ? `QUAD (${roundedHeat}%)` : `${roundedHeat}%`;
            heatBarFill.style.width = `${turretHeat}%`;
            heatBarFill.style.background = isOverdriveActive ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #38bdf8, #f59e0b, #ef4444)';
            lastRenderedHeat = roundedHeat;
        }
    }

    const glowIntensity = Math.min(1.5, (turretHeat / 100) * 1.5);
    if (leftBarrelMesh && rightBarrelMesh) {
        leftBarrelMesh.material.emissive.setHex(0xff3300);
        leftBarrelMesh.material.emissiveIntensity = glowIntensity;
        rightBarrelMesh.material.emissive.setHex(0xff3300);
        rightBarrelMesh.material.emissiveIntensity = glowIntensity;
    }
}

// Update Zombies & Redesigned Boss State Machines
function updateZombies(dt) {
    const bunkerRadius = 3.3;

    for (let i = zombies.length - 1; i >= 0; i--) {
        const z = zombies[i];
        const currentPos = z.mesh.position;

        const toBaseX = -currentPos.x;
        const toBaseZ = -currentPos.z;
        const distanceToBase = Math.hypot(toBaseX, toBaseZ);
        const normBaseX = toBaseX / (distanceToBase || 1);
        const normBaseZ = toBaseZ / (distanceToBase || 1);

        // ====================================================================
        // UNIVERSAL DEATH ANIMATION HANDLER (FOR BOTH BOSSES & REGULAR ZOMBIES)
        // ====================================================================
        if (z.state === 'DYING') {
            z.deathTimer = (z.deathTimer || 0) + dt;
            if (z.meshes) {
                z.meshes.forEach(m => {
                    if (m && m.userData && m.userData.origMaterial && m.material !== m.userData.origMaterial) {
                        m.material = m.userData.origMaterial;
                    }
                });
            }

            if (z.isBoss) {
                const bossPct = Math.max(0, (z.health / z.maxHealth) * 100);
                const roundPct = Math.round(bossPct);
                if (roundPct !== lastRenderedBossHp) {
                    bossBarFill.style.width = `${bossPct}%`;
                    bossHpVal.textContent = `${roundPct}%`;
                    lastRenderedBossHp = roundPct;
                }

                if (z.bossType === 'HUNTER') {
                    if (z.deathTimer < 1.4) {
                        if (z.bodyGroup) z.bodyGroup.position.y = Math.max(0.3, 0.75 - z.deathTimer * 0.35);
                        if (z.leftArm) z.leftArm.rotation.x = -Math.PI * 0.75;
                        if (z.rightArm) z.rightArm.rotation.x = -Math.PI * 0.75;
                        if (z.headGroup) z.headGroup.rotation.x = -0.5;
                        currentPos.x -= normBaseX * 0.8 * dt;
                        currentPos.z -= normBaseZ * 0.8 * dt;
                    } else if (z.deathTimer < 2.6) {
                        if (z.leftLeg) z.leftLeg.rotation.x = -1.1;
                        if (z.rightLeg) z.rightLeg.rotation.x = -1.1;
                        if (z.bodyGroup) z.bodyGroup.position.y = 0.25;
                        if (z.headGroup) z.headGroup.rotation.x = -0.8;
                    } else {
                        if (z.bodyGroup) {
                            z.bodyGroup.rotation.x = 1.35;
                            z.bodyGroup.position.y = 0.12;
                        }
                    }
                    currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                    if (Math.random() < 0.3) {
                        spawnObstacleImpact(new THREE.Vector3(currentPos.x, currentPos.y + 0.3, currentPos.z), 0x3d4a3e);
                    }
                } else if (z.bossType === 'OMEGA') {
                    if (z.deathTimer < 1.6) {
                        // Thrashing jaws & tail convulsions
                        if (z.lowerJaw) z.lowerJaw.rotation.x = 0.6 + Math.abs(Math.sin(z.deathTimer * 12.0)) * 0.4;
                        if (z.tailGroup) z.tailGroup.rotation.y = Math.sin(z.deathTimer * 10.0) * 1.2;
                        if (z.bodyGroup) z.bodyGroup.rotation.z = Math.sin(z.deathTimer * 6.0) * 0.3;
                    } else if (z.deathTimer < 2.8) {
                        // Roll over onto side in defeat
                        if (z.bodyGroup) {
                            z.bodyGroup.rotation.z = Math.min(Math.PI / 2.1, (z.deathTimer - 1.6) * 1.5);
                            z.bodyGroup.position.y = Math.max(0.2, 0.75 - (z.deathTimer - 1.6) * 0.4);
                        }
                    } else {
                        if (z.bodyGroup) z.bodyGroup.rotation.z = Math.PI / 2.1;
                    }
                    currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                    if (Math.random() < 0.35) {
                        spawnObstacleImpact(new THREE.Vector3(currentPos.x, currentPos.y + 0.4, currentPos.z), 0x1c3a27);
                    }
                } else if (z.bossType === 'JUGGERNAUT') {
                    if (z.deathTimer < 1.4) {
                        if (z.flLeg) z.flLeg.rotation.z = Math.sin(z.deathTimer * 8.0) * 0.4;
                        if (z.frLeg) z.frLeg.rotation.z = -Math.sin(z.deathTimer * 8.0) * 0.4;
                        if (z.headGroup) z.headGroup.position.y = Math.max(-0.4, 0.45 - z.deathTimer * 0.6);
                    } else if (z.deathTimer < 2.6) {
                        if (z.headGroup) {
                            z.headGroup.position.y = -0.6;
                            z.headGroup.rotation.x = 0.5;
                        }
                        if (z.mesh) {
                            z.mesh.rotation.z = Math.min(Math.PI / 2.2, (z.deathTimer - 1.4) * 1.4);
                        }
                    } else {
                        if (z.mesh) z.mesh.rotation.z = Math.PI / 2.2;
                    }
                    currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                    if (Math.random() < 0.35) {
                        spawnObstacleImpact(new THREE.Vector3(currentPos.x, currentPos.y + 0.5, currentPos.z), 0x9333ea);
                    }
                } else if (z.bossType === 'VALKYRIE') {
                    currentPos.y = Math.max(getTerrainHeight(currentPos.x, currentPos.z) + 0.3, currentPos.y - dt * 4.5);
                    z.mesh.rotation.y += dt * 8.0;
                    z.mesh.rotation.z += dt * 4.0;
                    if (z.leftWing) z.leftWing.rotation.z = 1.2;
                    if (z.rightWing) z.rightWing.rotation.z = 1.2;
                    if (z.groundBeacon) {
                        scene.remove(z.groundBeacon);
                        z.groundBeacon = null;
                    }

                    if (currentPos.y <= getTerrainHeight(currentPos.x, currentPos.z) + 0.6 && !z.hasHitGround) {
                        z.hasHitGround = true;
                        spawnFireExplosion(currentPos.x, currentPos.y, currentPos.z);
                    }
                } else if (z.bossType === 'SALAMANDER') {
                    if (z.deathTimer < 1.6) {
                        // Spine nodules flickering out
                        const fizzle = Math.max(0, 1.0 - z.deathTimer / 1.6);
                        if (z.wp1 && z.wp1.material) z.wp1.material.emissiveIntensity = fizzle;
                        if (z.wp2 && z.wp2.material) z.wp2.material.emissiveIntensity = fizzle;
                        if (z.wp3 && z.wp3.material) z.wp3.material.emissiveIntensity = fizzle;
                        if (z.wpMouth && z.wpMouth.material) z.wpMouth.material.emissiveIntensity = fizzle;
                        if (z.headGroup) z.headGroup.position.y = Math.max(-0.2, 0.2 - z.deathTimer * 0.3);
                    } else if (z.deathTimer < 2.8) {
                        // Legs buckling and carcass splaying flat
                        if (z.bodyGroup) z.bodyGroup.position.y = Math.max(0.15, 0.7 - (z.deathTimer - 1.6) * 0.45);
                        if (z.flLeg) z.flLeg.rotation.z = -0.8;
                        if (z.frLeg) z.frLeg.rotation.z = 0.8;
                        if (z.blLeg) z.blLeg.rotation.z = -0.8;
                        if (z.brLeg) z.brLeg.rotation.z = 0.8;
                    } else {
                        if (z.bodyGroup) z.bodyGroup.position.y = 0.15;
                    }
                    currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                    if (Math.random() < 0.35) {
                        spawnObstacleImpact(new THREE.Vector3(currentPos.x, currentPos.y + 0.4, currentPos.z), 0xf59e0b);
                    }
                } else if (z.bossType === 'ABOMINATION') {
                    if (z.coreMesh) {
                        z.coreMesh.scale.setScalar(1.0 + Math.abs(Math.sin(z.deathTimer * 16.0)) * 0.8);
                    }
                    if (z.deathTimer < 1.6) {
                        if (z.leftArm) z.leftArm.rotation.x = 0.9;
                        if (z.rightArm) z.rightArm.rotation.x = 0.9;
                        if (z.bodyGroup) z.bodyGroup.position.y = Math.max(0.4, 1.2 - z.deathTimer * 0.5);
                    } else {
                        if (z.bodyGroup) z.bodyGroup.rotation.x = -1.2;
                        if (Math.random() < 0.4) {
                            spawnLowPolyExplosion(new THREE.Vector3(currentPos.x, currentPos.y + 1.2, currentPos.z), 0xef4444, 4);
                        }
                    }
                    currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                }

                if (z.deathTimer >= (z.deathDuration || 3.8)) {
                    spawnPickupDrop(new THREE.Vector3(currentPos.x - 1.2, 0, currentPos.z), 'REPAIR');
                    spawnPickupDrop(new THREE.Vector3(currentPos.x + 1.2, 0, currentPos.z), 'OVERDRIVE');
                    spawnLowPolyExplosion(new THREE.Vector3(currentPos.x, currentPos.y + 1.0, currentPos.z), z.config ? z.config.fleshColor : 0xff0000, 25);
                    if (z.groundBeacon) scene.remove(z.groundBeacon);
                    scene.remove(z.mesh);
                    zombies.splice(i, 1);
                    activeBoss = null;
                    updateHUDCounters();
                }

                continue;
            } else {
                // REGULAR ZOMBIES PROCEDURAL DEATH ANIMATIONS
                const dur = z.deathDuration || 0.85;
                const progress = Math.min(1.0, z.deathTimer / dur);

                if (z.type === 'SEEKER') {
                    if (z.leftWing) z.leftWing.rotation.z = 1.3;
                    if (z.rightWing) z.rightWing.rotation.z = 1.3;
                    z.mesh.rotation.y += dt * 8.5;
                    z.mesh.rotation.z += dt * 4.5;
                    currentPos.y = Math.max(getTerrainHeight(currentPos.x, currentPos.z) + 0.15, currentPos.y - dt * 6.5);

                    if (currentPos.y <= getTerrainHeight(currentPos.x, currentPos.z) + 0.35 && !z.hasCrashed) {
                        z.hasCrashed = true;
                        spawnFireExplosion(currentPos.x, currentPos.y, currentPos.z);
                    }
                } else if (z.type === 'CRAWLER') {
                    if (z.bodyGroup) z.bodyGroup.position.y = Math.max(0.08, 0.2 - progress * 0.15);
                    if (z.headGroup) z.headGroup.rotation.x = -0.7 * progress;
                    if (z.leftArm) z.leftArm.rotation.z = -1.2 * progress;
                    if (z.rightArm) z.rightArm.rotation.z = 1.2 * progress;
                } else if (z.type === 'HOUND' || z.type === 'STAG' || z.type === 'HORSE' || z.type === 'BEAR') {
                    if (progress < 0.5) {
                        const p = progress / 0.5;
                        if (z.flLeg) z.flLeg.rotation.z = -0.75 * p;
                        if (z.frLeg) z.frLeg.rotation.z = 0.75 * p;
                        if (z.blLeg) z.blLeg.rotation.z = -0.75 * p;
                        if (z.brLeg) z.brLeg.rotation.z = 0.75 * p;
                        if (z.bodyGroup) {
                            z.bodyGroup.rotation.z = Math.min(Math.PI / 2.15, p * 1.2);
                            z.bodyGroup.position.y = Math.max(0.2, (z.type === 'BEAR' ? 0.9 : (z.type === 'HORSE' ? 0.85 : 0.5)) - p * 0.4);
                        }
                    } else {
                        if (z.bodyGroup) {
                            z.bodyGroup.rotation.z = Math.PI / 2.15;
                            z.bodyGroup.position.y = Math.max(0.12, (z.type === 'BEAR' ? 0.5 : 0.3) - (progress - 0.5) * 0.3);
                        }
                    }
                    currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                } else {
                    // Humanoid Bipeds (WALKER, RUNNER, SPITTER, PHANTOM, BRUTE, SCREAMER, TANK)
                    if (progress < 0.5) {
                        const p = progress / 0.5;
                        if (z.bodyGroup) {
                            z.bodyGroup.rotation.x = -1.35 * p;
                            z.bodyGroup.position.y = Math.max(0.25, 0.75 - p * 0.5);
                        }
                        if (z.leftArm) z.leftArm.rotation.x = -Math.PI * 0.75 * p;
                        if (z.rightArm) z.rightArm.rotation.x = -Math.PI * 0.75 * p;
                        if (z.headGroup) z.headGroup.rotation.x = -0.6 * p;
                        if (z.leftLeg) z.leftLeg.rotation.x = 0.4 * p;
                        if (z.rightLeg) z.rightLeg.rotation.x = 0.4 * p;
                    } else {
                        if (z.bodyGroup) {
                            z.bodyGroup.rotation.x = -1.45;
                            z.bodyGroup.position.y = 0.15;
                        }
                    }
                    currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                }

                if (Math.random() < 0.2) {
                    spawnObstacleImpact(new THREE.Vector3(currentPos.x, currentPos.y + 0.25, currentPos.z), z.config ? z.config.fleshColor : 0x475569);
                }

                if (z.deathTimer >= dur) {
                    spawnLowPolyExplosion(new THREE.Vector3(currentPos.x, currentPos.y + 0.5, currentPos.z), z.config ? z.config.fleshColor : 0x475569, (z.type === 'BEAR' || z.type === 'TANK' || z.type === 'HORSE') ? 14 : 8);
                    if (z.groundBeacon) scene.remove(z.groundBeacon);
                    scene.remove(z.mesh);
                    zombies.splice(i, 1);
                    updateHUDCounters();
                }

                continue;
            }
        }

        // ====================================================================
        // REFERENCE-MATCHED BOSS STATE MACHINES
        // ====================================================================
        if (z.isBoss) {
            const bossPct = (z.health / z.maxHealth) * 100;
            const roundPct = Math.max(0, Math.round(bossPct));
            if (roundPct !== lastRenderedBossHp) {
                bossBarFill.style.width = `${bossPct}%`;
                bossHpVal.textContent = `${roundPct}%`;
                lastRenderedBossHp = roundPct;
            }

            // 1. THE HUNTER (WAVE 5) - HOODED FERAL ZOMBIE: PERIMETER CIRCLING, OBSTACLE LEAPING & SCALING, HOUND SYNERGY
            if (z.bossType === 'HUNTER') {
                z.zigZagPhase += dt * 6.5;

                const houndsAlive = zombies.some(other => other.type === 'HOUND' && other.health > 0);
                const houndsActivelyAttacking = zombies.some(other => other.type === 'HOUND' && other.health > 0 && (other.isAttacking || Math.hypot(other.mesh.position.x, other.mesh.position.z) <= (bunkerRadius + 0.4)));

                if (z.state === 'CIRCLING' || z.state === 'STALK_STANDBY') {
                    // Hunter orbits around perimeter radius (~23m)
                    z.circleAngle = (z.circleAngle || Math.atan2(currentPos.z, currentPos.x)) + dt * 0.75;
                    const r = z.circleRadius || 23.0;
                    currentPos.x = Math.cos(z.circleAngle) * r;
                    currentPos.z = Math.sin(z.circleAngle) * r;
                    currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                    z.mesh.lookAt(0, currentPos.y, 0);

                    if (houndsActivelyAttacking) {
                        // Hunter stays circling in standby as long as Hounds are actively biting the base
                        z.circleTimer = 0;
                    } else {
                        z.circleTimer = (z.circleTimer || 0) + dt;
                        if (z.circleTimer >= (z.circleDuration || 3.5)) {
                            z.state = 'APPROACH';
                            z.stateTimer = 0;
                            z.circleTimer = 0;
                            z.isJumping = false;
                            z.isScaling = false;
                            if (!houndsAlive && currentWave === 5) {
                                showBossTelegraph('⚠️ HOUND PACK ELIMINATED - THE HUNTER SPRINT-STRIKES!', 2500);
                            } else {
                                showBossTelegraph('⚠️ THE HUNTER BREAKS PERIMETER ORBIT AND CHARGES!', 2000);
                            }
                        }
                    }
                } else if (z.state === 'APPROACH') {
                    // If Hounds reach base and actively attack while Hunter is still far (>11m), Hunter falls back to standby orbit
                    if (houndsActivelyAttacking && distanceToBase > 11.0) {
                        z.state = 'STALK_STANDBY';
                        z.circleAngle = Math.atan2(currentPos.z, currentPos.x);
                        z.isJumping = false;
                        z.isScaling = false;
                        showBossTelegraph('⚠️ HOUNDS ATTACKING - HUNTER WAITS ON PERIMETER!', 1800);
                    } else {
                        // Obstacle detection for Leaping over low obstacles and Scaling up large obstacles
                        if (!z.isJumping && !z.isScaling) {
                            for (let obsIdx = obstacles.length - 1; obsIdx >= 0; obsIdx--) {
                                const obs = obstacles[obsIdx];
                                const dx = obs.x - currentPos.x;
                                const dz = obs.z - currentPos.z;
                                if (Math.abs(dx) > 3.0 || Math.abs(dz) > 3.0) continue;
                                const distToObs = Math.hypot(dx, dz);
                                const triggerDist = obs.radius + z.radius + 1.2;

                                if (distToObs <= triggerDist) {
                                    if (obs.isLow) {
                                        // Leap over small obstacle (sandbags, crates, low hedgehogs, low rocks)
                                        z.isJumping = true;
                                        z.jumpTimer = 0;
                                        z.jumpDuration = 0.65;
                                        z.jumpHeight = Math.max(obs.height + 0.6, 2.2);
                                    } else {
                                        // Scale up and climb over large obstacle (trees, tall boulders)
                                        z.isScaling = true;
                                        z.scaleTimer = 0;
                                        z.scaleDuration = 0.85;
                                        z.scaleHeight = Math.max(obs.height + 0.5, 3.5);
                                    }
                                    break;
                                }
                            }
                        }

                        let heightOffset = 0;
                        if (z.isJumping) {
                            z.jumpTimer += dt;
                            const progress = Math.min(1.0, z.jumpTimer / (z.jumpDuration || 0.65));
                            heightOffset = Math.sin(progress * Math.PI) * (z.jumpHeight || 2.2);
                            if (z.jumpTimer >= z.jumpDuration) z.isJumping = false;
                        } else if (z.isScaling) {
                            z.scaleTimer += dt;
                            const progress = Math.min(1.0, z.scaleTimer / (z.scaleDuration || 0.85));
                            if (progress < 0.45) {
                                // Phase 1: Ascent up face of obstacle
                                heightOffset = (progress / 0.45) * z.scaleHeight;
                            } else if (progress < 0.75) {
                                // Phase 2: Crest over top peak
                                const crestP = (progress - 0.45) / 0.30;
                                heightOffset = z.scaleHeight + Math.sin(crestP * Math.PI) * 0.4;
                            } else {
                                // Phase 3: Descent to ground
                                const descP = (progress - 0.75) / 0.25;
                                heightOffset = z.scaleHeight * (1.0 - descP);
                            }
                            if (z.scaleTimer >= z.scaleDuration) z.isScaling = false;
                        }

                        const perpX = -normBaseZ;
                        const perpZ = normBaseX;
                        const zigZagScale = (z.isScaling || z.isJumping) ? 0 : Math.sin(z.zigZagPhase) * 2.2;

                        currentPos.x += (normBaseX * z.speed + perpX * zigZagScale) * dt;
                        currentPos.z += (normBaseZ * z.speed + perpZ * zigZagScale) * dt;
                        currentPos.y = getTerrainHeight(currentPos.x, currentPos.z) + heightOffset;
                        z.mesh.lookAt(0, getTerrainHeight(0, 0), 0);

                        if (distanceToBase <= bunkerRadius + 0.2) {
                            // Deliver one single heavy strike!
                            playBossAttackSound('HUNTER', 'LEAP');
                            takeDamage(z.config.attackDamage);
                            spawnBunkerHitSparks(new THREE.Vector3(currentPos.x, currentPos.y + 1.0, currentPos.z));
                            triggerCameraShake();
                            showBossTelegraph('⚠️ HUNTER DELIVERED HEAVY CLAW STRIKE & LEAPED OVER!');

                            // Set up leap trajectory cleanly landing on opposite side (radius ~14)
                            const currentAngle = Math.atan2(currentPos.z, currentPos.x);
                            const targetAngle = currentAngle + Math.PI + (Math.random() * 0.4 - 0.2);
                            z.state = 'LEAP_OVER';
                            z.stateTimer = 0;
                            z.leapDuration = 1.1;
                            z.leapStartX = currentPos.x;
                            z.leapStartZ = currentPos.z;
                            z.leapTargetX = Math.cos(targetAngle) * 14.0;
                            z.leapTargetZ = Math.sin(targetAngle) * 14.0;
                            z.retreatAngle = targetAngle;
                            z.isJumping = false;
                            z.isScaling = false;
                        }
                    }
                } else if (z.state === 'LEAP_OVER') {
                    z.stateTimer += dt;
                    const leapProgress = Math.min(1.0, z.stateTimer / (z.leapDuration || 1.1));

                    currentPos.x = z.leapStartX + (z.leapTargetX - z.leapStartX) * leapProgress;
                    currentPos.z = z.leapStartZ + (z.leapTargetZ - z.leapStartZ) * leapProgress;
                    const groundY = getTerrainHeight(currentPos.x, currentPos.z);
                    currentPos.y = groundY + Math.sin(leapProgress * Math.PI) * 4.2;

                    z.mesh.lookAt(z.leapTargetX, groundY, z.leapTargetZ);

                    if (leapProgress >= 1.0) {
                        currentPos.x = z.leapTargetX;
                        currentPos.z = z.leapTargetZ;
                        currentPos.y = groundY;
                        z.state = 'RETREAT';
                        z.stateTimer = 0;
                    }
                } else if (z.state === 'RETREAT') {
                    const awayDirX = Math.cos(z.retreatAngle || 0);
                    const awayDirZ = Math.sin(z.retreatAngle || 0);

                    currentPos.x += awayDirX * (z.speed * 1.1) * dt;
                    currentPos.z += awayDirZ * (z.speed * 1.1) * dt;
                    currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                    z.mesh.lookAt(currentPos.x + awayDirX, currentPos.y, currentPos.z + awayDirZ);

                    const currentDist = Math.hypot(currentPos.x, currentPos.z);
                    if (currentDist >= 24.0) {
                        z.state = 'CIRCLING';
                        z.circleAngle = Math.atan2(currentPos.z, currentPos.x);
                        z.circleRadius = 23.0;
                        z.circleTimer = 0;
                        z.circleDuration = 3.5;
                        showBossTelegraph('⚠️ HUNTER ORBITS IN THE PERIMETER SHADOWS!');
                    }
                }
            }

            // 2. THE OMEGA (WAVE 10) - GIANT TERRESTRIAL ZOMBIE LIZARD: JAW BITE, TAIL WHIP, PRIMAL ROAR
            else if (z.bossType === 'OMEGA') {
                z.roarTimer = (z.roarTimer || 0) + dt;
                
                if (z.state === 'STAGGERED') {
                    z.stateTimer += dt;
                    if (z.bodyGroup) {
                        z.bodyGroup.position.y = 0.5 + Math.sin(z.stateTimer * 25.0) * 0.05;
                        z.bodyGroup.rotation.x = -0.2;
                    }
                    if (z.headGroup) z.headGroup.rotation.x = -0.3 + Math.sin(z.stateTimer * 20.0) * 0.1;
                    if (z.lowerJaw) z.lowerJaw.rotation.x = 0.45;
                    if (z.tailGroup) z.tailGroup.rotation.y = Math.sin(z.stateTimer * 10.0) * 0.3;

                    if (z.stateTimer >= 2.2) {
                        z.state = 'APPROACH';
                        z.stateTimer = 0;
                        z.roarInterruptedHits = 0;
                        if (z.bodyGroup) {
                            z.bodyGroup.position.y = 0.75;
                            z.bodyGroup.rotation.x = 0;
                        }
                        if (z.headGroup) z.headGroup.rotation.x = 0;
                        if (z.lowerJaw) z.lowerJaw.rotation.x = 0.08;
                        showBossTelegraph('⚠️ OMEGA RECOVERS FROM STAGGER AND CHARGES!', 1800);
                    }
                } else if (z.state === 'PRIMAL_ROAR') {
                    z.stateTimer += dt;
                    z.isRoaring = true;
                    // Rearing up on hind legs & wide gaping jaws
                    if (z.bodyGroup) z.bodyGroup.rotation.x = -0.45;
                    if (z.headGroup) z.headGroup.rotation.x = -0.35;
                    if (z.lowerJaw) z.lowerJaw.rotation.x = 0.65;
                    if (z.tailGroup) z.tailGroup.rotation.y = Math.sin(z.stateTimer * 8.0) * 0.8;

                    if (z.stateTimer >= 0.85 && !z.hasRoared) {
                        z.hasRoared = true;
                        playBossAttackSound('OMEGA', 'ROAR');
                        triggerCameraShake(0.55);
                        takeDamage(12);
                        showBossTelegraph('⚠️ OMEGA PRIMAL ACOUSTIC ROAR! BUNKER INTEGRITY DAMAGED!', 2200);
                        spawnSonicScreech(new THREE.Vector3(currentPos.x, currentPos.y + 1.2, currentPos.z));
                    }

                    if (z.stateTimer >= 2.0) {
                        z.state = 'APPROACH';
                        z.stateTimer = 0;
                        z.isRoaring = false;
                        z.hasRoared = false;
                        z.roarInterruptedHits = 0;
                        if (z.bodyGroup) z.bodyGroup.rotation.x = 0;
                        if (z.headGroup) z.headGroup.rotation.x = 0;
                        if (z.lowerJaw) z.lowerJaw.rotation.x = 0.08;
                    }
                } else if (z.state === 'TAIL_SWIPE') {
                    z.stateTimer += dt;
                    const swipeProgress = Math.min(1.0, z.stateTimer / 0.85);
                    if (z.tailGroup) {
                        z.tailGroup.rotation.y = Math.sin(swipeProgress * Math.PI) * 1.8;
                    }
                    if (z.stateTimer >= 0.4 && !z.hasTailStruck) {
                        z.hasTailStruck = true;
                        playBossAttackSound('OMEGA', 'TAIL');
                        takeDamage(20);
                        spawnBunkerHitSparks(new THREE.Vector3(currentPos.x, currentPos.y + 1.0, currentPos.z));
                        triggerCameraShake(0.35);
                    }
                    if (z.stateTimer >= 0.85) {
                        z.state = 'APPROACH';
                        z.stateTimer = 0;
                        z.hasTailStruck = false;
                    }
                } else if (distanceToBase <= bunkerRadius + 0.6) {
                    z.isAttacking = true;
                    currentPos.x = (-normBaseX) * (bunkerRadius + 0.5);
                    currentPos.z = (-normBaseZ) * (bunkerRadius + 0.5);
                    currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                    z.mesh.lookAt(0, currentPos.y, 0);

                    z.tailSwipeTimer = (z.tailSwipeTimer || 0) + dt;
                    if (z.tailSwipeTimer >= 4.0) {
                        z.tailSwipeTimer = 0;
                        z.state = 'TAIL_SWIPE';
                        z.stateTimer = 0;
                        z.hasTailStruck = false;
                        showBossTelegraph('⚠️ OMEGA LASHES OUT WITH SWEEPING TAIL WHIP!');
                    } else {
                        z.attackTimer = (z.attackTimer || 0) + dt;
                        if (z.attackTimer >= z.config.attackInterval) {
                            z.attackTimer = 0;
                            playBossAttackSound('OMEGA', 'BITE');
                            takeDamage(z.config.attackDamage);
                            spawnBunkerHitSparks(new THREE.Vector3(currentPos.x, currentPos.y + 1.0, currentPos.z));
                            if (z.lowerJaw) {
                                z.lowerJaw.rotation.x = 0.55;
                                setTimeout(() => { if (z.lowerJaw) z.lowerJaw.rotation.x = 0.08; }, 200);
                            }
                        }
                    }
                } else {
                    if (z.roarTimer >= (z.roarInterval || 8.0) && distanceToBase >= 8.0) {
                        z.state = 'PRIMAL_ROAR';
                        z.stateTimer = 0;
                        z.roarTimer = 0;
                        z.hasRoared = false;
                        z.roarInterruptedHits = 0;
                        showBossTelegraph('⚠️ OMEGA CHARGING PRIMAL ROAR! CONCENTRATE FIREPOWER TO STAGGER! (0/5)', 2200);
                    } else {
                        currentPos.x += normBaseX * z.speed * dt;
                        currentPos.z += normBaseZ * z.speed * dt;
                        currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                        z.mesh.lookAt(0, currentPos.y, 0);
                    }
                }
            }

            // 3. THE JUGGERNAUT (WAVE 15) - MUTANT GORE BULL: CHARGE -> STEP BACK -> LATERAL SIDESTEP (EXPOSING FLANKS)
            else if (z.bossType === 'JUGGERNAUT') {
                if (z.state === 'WINDUP') {
                    z.stateTimer += dt;
                    z.mesh.lookAt(0, currentPos.y, 0);

                    if (Math.random() < 0.3) {
                        spawnObstacleImpact(new THREE.Vector3(currentPos.x, currentPos.y + 0.2, currentPos.z), 0x991b1b);
                    }

                    if (z.stateTimer >= 1.2) {
                        z.state = 'CHARGE';
                        z.stateTimer = 0;
                        playBossAttackSound('JUGGERNAUT', 'CHARGE');
                        showBossTelegraph('⚠️ JUGGERNAUT CHARGING! AIM FOR FLANKS AS IT TURNS!');
                    }
                } else if (z.state === 'CHARGE') {
                    currentPos.x += normBaseX * (z.speed * 2.6) * dt;
                    currentPos.z += normBaseZ * (z.speed * 2.6) * dt;
                    currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                    z.mesh.lookAt(0, currentPos.y, 0);

                    if (distanceToBase <= bunkerRadius) {
                        playBossAttackSound('JUGGERNAUT', 'IMPACT');
                        takeDamage(z.config.attackDamage);
                        spawnBunkerHitSparks(new THREE.Vector3(currentPos.x, currentPos.y + 1.2, currentPos.z));
                        triggerCameraShake();
                        z.state = 'STEPBACK';
                        z.stateTimer = 0;
                    }
                } else if (z.state === 'STEPBACK') {
                    currentPos.x -= normBaseX * 3.5 * dt;
                    currentPos.z -= normBaseZ * 3.5 * dt;
                    currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                    z.mesh.lookAt(0, currentPos.y, 0);

                    z.stateTimer += dt;
                    if (z.stateTimer >= 1.3) {
                        z.state = 'SIDESTEP';
                        z.stateTimer = 0;
                        showBossTelegraph('⚠️ JUGGERNAUT SIDESTEPPING - SIDES ARE EXPOSED (2x CRIT)!');
                    }
                } else if (z.state === 'SIDESTEP') {
                    const perpX = -normBaseZ;
                    const perpZ = normBaseX;
                    currentPos.x += perpX * 4.8 * dt;
                    currentPos.z += perpZ * 4.8 * dt;
                    currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                    z.mesh.lookAt(currentPos.x + perpX, currentPos.y, currentPos.z + perpZ);

                    z.stateTimer += dt;
                    if (z.stateTimer >= 1.8) {
                        z.state = 'WINDUP';
                        z.stateTimer = 0;
                    }
                }

                // JUGGERNAUT BATTERING RAM: Obliterates barriers and obstacles in its path!
                for (let obsIdx = obstacles.length - 1; obsIdx >= 0; obsIdx--) {
                    const obs = obstacles[obsIdx];
                    const dx = obs.x - currentPos.x;
                    if (Math.abs(dx) > 3.5) continue;
                    const dz = obs.z - currentPos.z;
                    if (Math.abs(dz) > 3.5) continue;

                    const distToObs = Math.hypot(dx, dz);
                    const smashRadius = obs.radius + z.radius + 0.85;

                    if (distToObs < smashRadius && obs.isDestructible) {
                        destroyObstacle(obs, obsIdx);
                        spawnBunkerHitSparks(new THREE.Vector3(obs.x, getTerrainHeight(obs.x, obs.z) + 0.5, obs.z));
                        triggerCameraShake();
                        showPowerupNotification('💥 JUGGERNAUT SMASHED BARRIER IN ITS PATH!', 'repair');
                        break;
                    }
                }

                // JUGGERNAUT TRAMPLE: Push lesser zombies out of the way
                for (let otherIdx = 0; otherIdx < zombies.length; otherIdx++) {
                    if (otherIdx === i) continue;
                    const otherZ = zombies[otherIdx];
                    if (otherZ.isBoss) continue;

                    const ox = otherZ.mesh.position.x - currentPos.x;
                    const oz = otherZ.mesh.position.z - currentPos.z;
                    if (Math.abs(ox) > 2.5 || Math.abs(oz) > 2.5) continue;

                    const otherDist = Math.hypot(ox, oz);
                    if (otherDist < (z.radius + otherZ.radius + 0.5)) {
                        const shoveX = (ox / (otherDist || 1)) * 5.0 * dt;
                        const shoveZ = (oz / (otherDist || 1)) * 5.0 * dt;
                        otherZ.mesh.position.x += shoveX;
                        otherZ.mesh.position.z += shoveZ;
                    }
                }
            }

            // 3. THE VALKYRIE (WAVE 15) - OBSIDIAN SHADOW EAGLE (LONG-DISTANCE APPROACH, WIDE CIRCLING & DIVE-BOMB)
            else if (z.bossType === 'VALKYRIE') {
                const beaconY = getTerrainHeight(currentPos.x, currentPos.z) + 0.08;
                if (z.groundBeacon) {
                    z.groundBeacon.position.set(currentPos.x, beaconY, currentPos.z);
                    z.groundBeacon.rotation.z += dt * 2.0;
                }

                if (z.state === 'APPROACH_PERIMETER') {
                    diveAlert.classList.add('hidden');
                    const targetX = Math.cos(z.circleAngle) * 15.5;
                    const targetZ = Math.sin(z.circleAngle) * 15.5;
                    const targetY = 5.8;
                    const toTargetX = targetX - currentPos.x;
                    const toTargetZ = targetZ - currentPos.z;
                    const toTargetY = targetY - currentPos.y;
                    const targetDist = Math.hypot(toTargetX, toTargetZ);

                    if (targetDist > 1.2) {
                        currentPos.x += (toTargetX / targetDist) * 16.0 * dt;
                        currentPos.z += (toTargetZ / targetDist) * 16.0 * dt;
                        currentPos.y += toTargetY * 2.5 * dt;
                        z.mesh.lookAt(targetX, targetY, targetZ);
                    } else {
                        currentPos.x = targetX;
                        currentPos.z = targetZ;
                        currentPos.y = targetY;
                        z.state = 'CIRCLING';
                        z.stateTimer = 0;
                        showBossTelegraph('⚠️ VALKYRIE IS CIRCLING OVERHEAD - PREPARE FOR AIR STRIKE!');
                    }
                } else if (z.state === 'CIRCLING') {
                    diveAlert.classList.add('hidden');
                    z.circleAngle += dt * 0.52;
                    currentPos.x = Math.cos(z.circleAngle) * 15.5;
                    currentPos.z = Math.sin(z.circleAngle) * 15.5;
                    currentPos.y = 5.8 + Math.sin(z.animTime * 0.8) * 0.6;

                    const nextX = Math.cos(z.circleAngle + 0.25) * 15.5;
                    const nextZ = Math.sin(z.circleAngle + 0.25) * 15.5;
                    z.mesh.lookAt(nextX, currentPos.y, nextZ);
                    z.mesh.rotation.z = -0.32;

                    // 3-Needle Dark Energy Barrage every 5.5s (reduced frequency to prevent spam)
                    z.volleyTimer += dt;
                    if (z.volleyTimer >= 5.5) {
                        z.volleyTimer = 0;
                        spawnValkyrieNeedle(currentPos, new THREE.Vector3(0, 1.2, 0));
                        setTimeout(() => {
                            if (z && z.health > 0) spawnValkyrieNeedle(z.mesh.position, new THREE.Vector3(0.6, 1.2, 0.6));
                        }, 220);
                        setTimeout(() => {
                            if (z && z.health > 0) spawnValkyrieNeedle(z.mesh.position, new THREE.Vector3(-0.6, 1.2, -0.6));
                        }, 440);
                        showBossTelegraph('⚠️ VALKYRIE LAUNCHED DARK ENERGY NEEDLE BARRAGE!');
                    }

                    z.stateTimer += dt;
                    if (z.stateTimer >= 7.0) {
                        z.state = 'DIVE';
                        z.stateTimer = 0;
                        z.hitsDuringDive = 0;
                        playBossAttackSound('VALKYRIE', 'DIVE');
                        diveAlert.classList.remove('hidden');
                        showBossTelegraph('⚠️ VALKYRIE SWOOPING IN FOR AIR STRIKE! SHOOT TO INTERCEPT!');
                    }
                } else if (z.state === 'DIVE') {
                    diveAlert.classList.remove('hidden');
                    currentPos.x += normBaseX * 17.5 * dt;
                    currentPos.z += normBaseZ * 17.5 * dt;
                    currentPos.y = Math.max(1.3, currentPos.y - 6.0 * dt);
                    z.mesh.lookAt(0, 1.3, 0);

                    if (distanceToBase <= bunkerRadius || currentPos.y <= 1.4) {
                        takeDamage(z.config.attackDamage);
                        spawnBunkerHitSparks(new THREE.Vector3(currentPos.x, 1.4, currentPos.z));
                        triggerCameraShake();
                        diveAlert.classList.add('hidden');
                        z.state = 'RECOVER';
                        z.stateTimer = 0;
                    }
                } else if (z.state === 'STAGGERED') {
                    diveAlert.classList.add('hidden');
                    currentPos.y += 8.5 * dt;
                    currentPos.x -= normBaseX * 6.5 * dt;
                    currentPos.z -= normBaseZ * 6.5 * dt;

                    z.stateTimer += dt;
                    if (currentPos.y >= 5.8 || z.stateTimer >= 1.2) {
                        z.circleAngle = Math.atan2(currentPos.z, currentPos.x);
                        z.state = 'CIRCLING';
                        z.stateTimer = 0;
                    }
                } else if (z.state === 'RECOVER') {
                    currentPos.x -= normBaseX * 10.0 * dt;
                    currentPos.z -= normBaseZ * 10.0 * dt;
                    currentPos.y += 6.5 * dt;
                    z.mesh.lookAt(currentPos.x - normBaseX * 5, currentPos.y + 2, currentPos.z - normBaseZ * 5);

                    if (currentPos.y >= 5.8 && distanceToBase >= 14.5) {
                        z.circleAngle = Math.atan2(currentPos.z, currentPos.x);
                        z.state = 'CIRCLING';
                        z.stateTimer = 0;
                    }
                }
            }

            // 5. THE SALAMANDER (WAVE 25) - SPINED CARAPACE COLOSSUS (5-STEP COMBO: TAIL #1 -> TAIL #2 -> BITE -> STEPBACK -> SEISMIC STOMP)
            else if (z.bossType === 'SALAMANDER') {
                if (z.state === 'STAGGERED') {
                    z.stateTimer += dt;
                    if (z.bodyGroup) {
                        z.bodyGroup.position.y = 0.45 + Math.sin(z.stateTimer * 25.0) * 0.05;
                        z.bodyGroup.rotation.x = -0.15;
                    }
                    if (z.headGroup) z.headGroup.position.y = -0.05;
                    if (z.flLeg) z.flLeg.rotation.x = -0.4;
                    if (z.frLeg) z.frLeg.rotation.x = -0.4;
                    const staggerFlicker = (Math.sin(z.stateTimer * 30.0) > 0) ? 0.2 : 1.2;
                    if (z.wp1 && z.wp1.material) z.wp1.material.emissiveIntensity = staggerFlicker;
                    if (z.wp2 && z.wp2.material) z.wp2.material.emissiveIntensity = staggerFlicker;
                    if (z.wp3 && z.wp3.material) z.wp3.material.emissiveIntensity = staggerFlicker;
                    if (z.wpMouth && z.wpMouth.material) z.wpMouth.material.emissiveIntensity = staggerFlicker;

                    if (z.stateTimer >= 2.2) {
                        z.state = 'APPROACH';
                        z.stateTimer = 0;
                        z.stompInterruptedHits = 0;
                        if (z.bodyGroup) {
                            z.bodyGroup.position.y = 0.7;
                            z.bodyGroup.rotation.x = 0;
                        }
                        if (z.headGroup) z.headGroup.position.y = 0.2;
                        if (z.flLeg) z.flLeg.rotation.x = 0;
                        if (z.frLeg) z.frLeg.rotation.x = 0;
                        showBossTelegraph('⚠️ SALAMANDER RECOVERS FROM STAGGER AND CHARGES!', 1800);
                    }
                } else if (z.state === 'TAIL_SWIPE_1') {
                    z.stateTimer += dt;
                    const p = Math.min(1.0, z.stateTimer / 0.85);
                    if (z.tailGroup) {
                        z.tailGroup.rotation.y = Math.sin(p * Math.PI) * 1.8;
                    }
                    if (z.stateTimer >= 0.42 && !z.hasTailStruck) {
                        z.hasTailStruck = true;
                        playBossAttackSound('SALAMANDER', 'TAIL');
                        takeDamage(9);
                        spawnBunkerHitSparks(new THREE.Vector3(currentPos.x, currentPos.y + 1.0, currentPos.z));
                        triggerCameraShake(0.25);
                    }
                    if (z.stateTimer >= 0.85) {
                        z.state = 'TAIL_SWIPE_2';
                        z.stateTimer = 0;
                        z.hasTailStruck = false;
                        showBossTelegraph('⚠️ SALAMANDER REVERSE TAIL WHIP #2!', 1500);
                    }
                } else if (z.state === 'TAIL_SWIPE_2') {
                    z.stateTimer += dt;
                    const p = Math.min(1.0, z.stateTimer / 0.85);
                    if (z.tailGroup) {
                        z.tailGroup.rotation.y = -Math.sin(p * Math.PI) * 1.8;
                    }
                    if (z.stateTimer >= 0.42 && !z.hasTailStruck) {
                        z.hasTailStruck = true;
                        playBossAttackSound('SALAMANDER', 'TAIL');
                        takeDamage(9);
                        spawnBunkerHitSparks(new THREE.Vector3(currentPos.x, currentPos.y + 1.0, currentPos.z));
                        triggerCameraShake(0.25);
                    }
                    if (z.stateTimer >= 0.85) {
                        z.state = 'BITE';
                        z.stateTimer = 0;
                        z.hasBitten = false;
                        showBossTelegraph('⚠️ SALAMANDER LUNGES FOR FANGED BITE!', 1500);
                    }
                } else if (z.state === 'BITE') {
                    z.stateTimer += dt;
                    const p = Math.min(1.0, z.stateTimer / 0.85);
                    if (z.headGroup) {
                        z.headGroup.rotation.x = Math.sin(p * Math.PI) * 0.45;
                    }
                    if (z.mouth) {
                        z.mouth.position.y = -0.12 - Math.sin(p * Math.PI) * 0.15;
                    }
                    if (z.stateTimer >= 0.40 && !z.hasBitten) {
                        z.hasBitten = true;
                        playBossAttackSound('SALAMANDER', 'BITE');
                        takeDamage(12);
                        spawnBunkerHitSparks(new THREE.Vector3(currentPos.x, currentPos.y + 1.0, currentPos.z));
                        triggerCameraShake(0.3);
                    }
                    if (z.stateTimer >= 0.85) {
                        z.state = 'STEPBACK';
                        z.stateTimer = 0;
                        if (z.headGroup) z.headGroup.rotation.x = 0;
                        if (z.mouth) z.mouth.position.y = -0.12;
                        showBossTelegraph('⚠️ SALAMANDER STEPS BACK TO PREPARE SEISMIC STOMP!', 1800);
                    }
                } else if (z.state === 'STEPBACK') {
                    z.stateTimer += dt;
                    currentPos.x -= normBaseX * 6.5 * dt;
                    currentPos.z -= normBaseZ * 6.5 * dt;
                    currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                    z.mesh.lookAt(0, currentPos.y, 0);

                    if (z.flLeg) z.flLeg.rotation.y = -Math.sin(z.stateTimer * 8.0) * 0.4;
                    if (z.frLeg) z.frLeg.rotation.y = Math.sin(z.stateTimer * 8.0) * 0.4;

                    if (distanceToBase >= 12.0 || z.stateTimer >= 1.6) {
                        z.state = 'SEISMIC_STOMP';
                        z.stateTimer = 0;
                        z.hasStomped = false;
                        z.stompInterruptedHits = 0;
                        showBossTelegraph('⚠️ SALAMANDER REARING UP FOR SEISMIC STOMP ULTIMATE! SHOOT WEAKPOINTS TO INTERRUPT!', 2400);
                    }
                } else if (z.state === 'SEISMIC_STOMP') {
                    z.stateTimer += dt;
                    if (z.stateTimer < 0.85) {
                        const rearProgress = z.stateTimer / 0.85;
                        if (z.bodyGroup) z.bodyGroup.rotation.x = -0.52 * rearProgress;
                        if (z.headGroup) z.headGroup.rotation.x = 0.40 * rearProgress;
                        if (z.flLeg) z.flLeg.rotation.x = -0.75 * rearProgress;
                        if (z.frLeg) z.frLeg.rotation.x = -0.75 * rearProgress;
                        const pulse = 1.0 + rearProgress * 1.8;
                        if (z.wp1 && z.wp1.material) z.wp1.material.emissiveIntensity = pulse;
                        if (z.wp2 && z.wp2.material) z.wp2.material.emissiveIntensity = pulse;
                        if (z.wp3 && z.wp3.material) z.wp3.material.emissiveIntensity = pulse;
                        if (z.wpMouth && z.wpMouth.material) z.wpMouth.material.emissiveIntensity = pulse;
                    }

                    if (z.stateTimer >= 0.85 && !z.hasStomped) {
                        z.hasStomped = true;
                        playBossAttackSound('SALAMANDER', 'STOMP');
                        spawnSeismicShockwave(currentPos);
                        triggerCameraShake(0.6);
                        takeDamage(10);
                        showBossTelegraph('⚠️ SALAMANDER SEISMIC STOMP! EARTHQUAKE SHOCKWAVE HIT BASE!', 2400);
                        if (z.bodyGroup) z.bodyGroup.rotation.x = 0.15;
                        if (z.flLeg) z.flLeg.rotation.x = 0.3;
                        if (z.frLeg) z.frLeg.rotation.x = 0.3;
                    }

                    if (z.stateTimer >= 1.9) {
                        z.state = 'APPROACH';
                        z.stateTimer = 0;
                        z.hasStomped = false;
                        z.stompInterruptedHits = 0;
                        if (z.bodyGroup) z.bodyGroup.rotation.x = 0;
                        if (z.headGroup) z.headGroup.rotation.x = 0;
                        if (z.flLeg) z.flLeg.rotation.x = 0;
                        if (z.frLeg) z.frLeg.rotation.x = 0;
                        showBossTelegraph('⚠️ SALAMANDER CHARGES BASE TO COMMENCE ASSAULT!', 1800);
                    }
                } else if (distanceToBase <= bunkerRadius + 0.6) {
                    z.isAttacking = true;
                    z.state = 'TAIL_SWIPE_1';
                    z.stateTimer = 0;
                    z.hasTailStruck = false;
                    currentPos.x = (-normBaseX) * (bunkerRadius + 0.5);
                    currentPos.z = (-normBaseZ) * (bunkerRadius + 0.5);
                    currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                    z.mesh.lookAt(0, currentPos.y, 0);
                    showBossTelegraph('⚠️ SALAMANDER REACHES BASE - HEAVY SPINED TAIL WHIP #1!', 1600);
                } else {
                    currentPos.x += normBaseX * z.speed * dt;
                    currentPos.z += normBaseZ * z.speed * dt;
                    currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                    z.mesh.lookAt(0, currentPos.y, 0);
                }

                // SALAMANDER OBSTACLE SMASH: Heavy colossus destroys obstacles in path!
                for (let obsIdx = obstacles.length - 1; obsIdx >= 0; obsIdx--) {
                    const obs = obstacles[obsIdx];
                    const dx = obs.x - currentPos.x;
                    if (Math.abs(dx) > 3.5) continue;
                    const dz = obs.z - currentPos.z;
                    if (Math.abs(dz) > 3.5) continue;

                    const distToObs = Math.hypot(dx, dz);
                    const smashRadius = obs.radius + z.radius + 0.85;

                    if (distToObs < smashRadius && obs.isDestructible) {
                        destroyObstacle(obs, obsIdx);
                        spawnBunkerHitSparks(new THREE.Vector3(obs.x, getTerrainHeight(obs.x, obs.z) + 0.5, obs.z));
                        triggerCameraShake();
                        showPowerupNotification('💥 SALAMANDER CRUSHED BARRIER IN ITS PATH!', 'repair');
                        break;
                    }
                }

                // Push lesser zombies aside
                for (let otherIdx = 0; otherIdx < zombies.length; otherIdx++) {
                    if (otherIdx === i) continue;
                    const otherZ = zombies[otherIdx];
                    if (otherZ.isBoss) continue;

                    const ox = otherZ.mesh.position.x - currentPos.x;
                    const oz = otherZ.mesh.position.z - currentPos.z;
                    if (Math.abs(ox) > 2.2 || Math.abs(oz) > 2.2) continue;

                    const otherDist = Math.hypot(ox, oz);
                    if (otherDist < (z.radius + otherZ.radius + 0.4)) {
                        const shoveX = (ox / (otherDist || 1)) * 4.5 * dt;
                        const shoveZ = (oz / (otherDist || 1)) * 4.5 * dt;
                        otherZ.mesh.position.x += shoveX;
                        otherZ.mesh.position.z += shoveZ;
                    }
                }
            }

            // 6. THE ABOMINATION (WAVE 30) - BOULDER THROW, FISSURE STOMP, MAGMA BERSERK
            else if (z.bossType === 'ABOMINATION') {
                if (z.health <= z.maxHealth * 0.5 && !z.isEnraged) {
                    z.isEnraged = true;
                    z.speed = z.config.speed * 1.5;
                    z.coreMesh.material.color.setHex(0xff0000);
                    showPowerupNotification('🌋 ABOMINATION ERUPTED IN MAGMA BERSERK!', 'overdrive');
                }

                z.throwTimer += dt;
                if (z.throwTimer >= z.throwInterval && distanceToBase >= 12.0) {
                    z.throwTimer = 0;
                    spawnAbominationBoulder(currentPos);
                }

                z.slamTimer += dt;
                if (z.slamTimer >= z.slamInterval) {
                    z.slamTimer = 0;
                    playBossAttackSound('ABOMINATION', 'SLAM');
                    spawnFireExplosion(currentPos.x, getTerrainHeight(currentPos.x, currentPos.z) + 0.4, currentPos.z);
                    triggerCameraShake();
                    showBossTelegraph('⚠️ EARTHQUAKE FISSURE STOMP!');
                    if (distanceToBase <= 11.0) takeDamage(8);
                }

                if (distanceToBase <= bunkerRadius) {
                    z.isAttacking = true;
                    currentPos.x = (-normBaseX) * bunkerRadius;
                    currentPos.z = (-normBaseZ) * bunkerRadius;
                    currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                    z.mesh.lookAt(0, currentPos.y, 0);

                    z.attackTimer += dt;
                    if (z.attackTimer >= z.config.attackInterval) {
                        z.attackTimer = 0;
                        playBossAttackSound('ABOMINATION', 'SLAM');
                        takeDamage(z.config.attackDamage);
                        spawnBunkerHitSparks(new THREE.Vector3(currentPos.x, currentPos.y + 1.0, currentPos.z));
                    }
                } else {
                    currentPos.x += normBaseX * z.speed * dt;
                    currentPos.z += normBaseZ * z.speed * dt;
                    currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                    z.mesh.lookAt(0, currentPos.y, 0);
                }
            }
        }

        // REGULAR ZOMBIES
        else {
            if (z.frenzyTimer > 0) z.frenzyTimer -= dt;
            const speedBoost = (z.frenzyTimer > 0 ? 1.4 : 1.0);
            const unitSpeed = (z.speed || z.config.speed) * speedBoost;

            // Approaching audio throttle for regular zombies
            z.soundTimer = (z.soundTimer || (Math.random() * 2.5)) + dt;
            if (z.soundTimer >= (z.soundInterval || (3.5 + Math.random() * 2.5))) {
                z.soundTimer = 0;
                z.soundInterval = 3.5 + Math.random() * 2.5;
                if (!z.isAttacking && z.state !== 'DYING') {
                    playZombieApproachSound(z.type, currentPos.x, currentPos.z);
                }
            }

            // 1. SEEKER (FLYING AERIAL COMMON UNIT)
            if (z.type === 'SEEKER') {
                if (distanceToBase <= bunkerRadius + 0.3) {
                    z.isAttacking = true;
                    currentPos.x = (-normBaseX) * bunkerRadius;
                    currentPos.z = (-normBaseZ) * bunkerRadius;
                    currentPos.y = 1.6;
                    z.mesh.lookAt(0, 1.2, 0);

                    z.attackTimer += dt;
                    if (z.attackTimer >= z.config.attackInterval) {
                        z.attackTimer = 0;
                        playZombieAttackSound('SEEKER');
                        takeDamage(z.config.attackDamage); // 10 damage! (2x normal walker damage)
                        spawnBunkerHitSparks(new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z));
                    }
                } else {
                    currentPos.x += normBaseX * unitSpeed * dt;
                    currentPos.z += normBaseZ * unitSpeed * dt;
                    const targetAlt = Math.max(1.8, 4.5 - (1.0 - (distanceToBase / 44.0)) * 2.7);
                    currentPos.y += (targetAlt - currentPos.y) * 2.0 * dt;
                    z.mesh.lookAt(0, 1.2, 0);
                }
            }

            // 2. SPITTER (MID-RANGE ACID BILE LOBBER): Stops walking around 13m to 20m from player within camera view!
            else if (z.type === 'SPITTER' && distanceToBase <= (z.standoffDistance || 15.0) && isPositionInCameraView(currentPos.x, currentPos.z, 0.84)) {
                z.spitTimer = (z.spitTimer || 0) + dt;
                if (z.spitTimer >= (z.spitInterval || 3.5)) {
                    z.spitTimer = 0;
                    spawnAcidBile(currentPos);
                    showBossTelegraph('⚠️ SPITTER LOBBED ACID BILE!', 1600);
                }
                currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                z.mesh.lookAt(0, currentPos.y, 0);
            }

            // 3. GROUND ZOMBIES (WALKER, RUNNER, TANK, HOUND, PHANTOM, CRAWLER, BRUTE, SCREAMER)
            else if (distanceToBase <= bunkerRadius) {
                z.isAttacking = true;
                z.isJumping = false;
                currentPos.x = (-normBaseX) * bunkerRadius;
                currentPos.z = (-normBaseZ) * bunkerRadius;
                currentPos.y = getTerrainHeight(currentPos.x, currentPos.z);
                z.mesh.lookAt(0, currentPos.y, 0);

                z.attackTimer += dt;
                if (z.attackTimer >= z.config.attackInterval) {
                    z.attackTimer = 0;
                    playZombieAttackSound(z.type);
                    takeDamage(z.config.attackDamage);
                    spawnBunkerHitSparks(new THREE.Vector3(currentPos.x, currentPos.y + 1.0, currentPos.z));
                    if (z.type === 'BEAR') {
                        triggerCameraShake(0.45);
                    }
                }
            } else {
                // SCREAMER AURA HOWL
                if (z.type === 'SCREAMER') {
                    z.screechTimer = (z.screechTimer || 0) + dt;
                    if (z.screechTimer >= (z.screechInterval || 3.5)) {
                        z.screechTimer = 0;
                        spawnSonicScreech(currentPos);
                    }
                }

                // PHANTOM STEALTH PHASE
                let phantomSpeedMul = 1.0;
                if (z.type === 'PHANTOM') {
                    z.shadowPhase = (z.shadowPhase || 0) + dt * 2.5;
                    const phaseAlpha = 0.2 + Math.abs(Math.sin(z.shadowPhase)) * 0.6;
                    z.isCloaked = (phaseAlpha < 0.55);
                    if (z.meshes) {
                        z.meshes.forEach(m => {
                            if (m && m.material && m.material.transparent) m.material.opacity = phaseAlpha;
                        });
                    }
                    if (phaseAlpha < 0.4) phantomSpeedMul = 1.35;
                }

                let moveDirX = normBaseX;
                let moveDirZ = normBaseZ;

                // TANK, BRUTE, HORSE & BEAR BATTERING RAM: Smashes obstacles in their way without being deflected!
                if (z.type === 'TANK' || z.type === 'BRUTE' || z.type === 'BEAR' || z.type === 'HORSE') {
                    for (let obsIdx = obstacles.length - 1; obsIdx >= 0; obsIdx--) {
                        const obs = obstacles[obsIdx];
                        const dx = obs.x - currentPos.x;
                        if (dx > 3.0 || dx < -3.0) continue;
                        const dz = obs.z - currentPos.z;
                        if (dz > 3.0 || dz < -3.0) continue;

                        const distToObs = Math.hypot(dx, dz);
                        const smashRadius = obs.radius + z.radius + 0.85;

                        if (distToObs < smashRadius) {
                            if (obs.isDestructible) {
                                destroyObstacle(obs, obsIdx);
                                spawnBunkerHitSparks(new THREE.Vector3(obs.x, getTerrainHeight(obs.x, obs.z) + 0.5, obs.z));
                                triggerCameraShake();
                                showPowerupNotification(`💥 ${z.type} CRUSHED BARRIER IN ITS PATH!`, 'repair');
                                break;
                            }
                        }
                    }

                    // TANK / BRUTE / BEAR / HORSE SHOVE: Push normal Walkers and Runners aside
                    for (let otherIdx = 0; otherIdx < zombies.length; otherIdx++) {
                        if (otherIdx === i) continue;
                        const otherZ = zombies[otherIdx];
                        if (otherZ.isBoss || otherZ.type === 'TANK' || otherZ.type === 'BRUTE' || otherZ.type === 'BEAR' || otherZ.type === 'HORSE') continue;

                        const ox = otherZ.mesh.position.x - currentPos.x;
                        const oz = otherZ.mesh.position.z - currentPos.z;
                        if (Math.abs(ox) > 1.8 || Math.abs(oz) > 1.8) continue;

                        const otherDist = Math.hypot(ox, oz);
                        if (otherDist < 1.6) {
                            const shoveX = (ox / (otherDist || 1)) * 2.5 * dt;
                            const shoveZ = (oz / (otherDist || 1)) * 2.5 * dt;
                            otherZ.mesh.position.x += shoveX;
                            otherZ.mesh.position.z += shoveZ;
                        }
                    }
                } else if (!(z.type === 'PHANTOM' && z.isCloaked)) {
                    // Non-heavy zombies navigate around obstacles (Cloaked phantoms phase directly through)
                    for (let obsIdx = obstacles.length - 1; obsIdx >= 0; obsIdx--) {
                        const obs = obstacles[obsIdx];
                        const dx = obs.x - currentPos.x;
                        if (dx > 2.5 || dx < -2.5) continue;
                        const dz = obs.z - currentPos.z;
                        if (dz > 2.5 || dz < -2.5) continue;

                        const distToObs = Math.hypot(dx, dz);
                        const minDistance = obs.radius + z.radius;

                        // Runner, Hound or Stag leaping over low obstacles
                        if ((z.type === 'RUNNER' || z.type === 'HOUND' || z.type === 'STAG') && obs.isLow && distToObs < minDistance + 0.8 && !z.isJumping) {
                            z.isJumping = true;
                            z.jumpTimer = 0;
                            z.jumpDuration = 0.55;
                        }

                        // Crawler crawls under low barriers
                        if (z.type === 'CRAWLER' && obs.isLow) {
                            continue;
                        }

                        if (distToObs < minDistance + 1.0 && !z.isJumping) {
                            const pushX = (currentPos.x - obs.x) / (distToObs || 1);
                            const pushZ = (currentPos.z - obs.z) / (distToObs || 1);
                            if (distToObs < minDistance) {
                                currentPos.x = obs.x + pushX * minDistance;
                                currentPos.z = obs.z + pushZ * minDistance;
                            } else {
                                const steerWeight = (minDistance + 1.0 - distToObs) / 1.0;
                                moveDirX += pushX * steerWeight * 1.5;
                                moveDirZ += pushZ * steerWeight * 1.5;
                            }
                        }
                    }
                }

                const moveLen = Math.hypot(moveDirX, moveDirZ) || 1;
                moveDirX /= moveLen;
                moveDirZ /= moveLen;

                let jumpHeightOffset = 0;
                if (z.isJumping) {
                    z.jumpTimer += dt;
                    const progress = Math.min(1.0, z.jumpTimer / z.jumpDuration);
                    jumpHeightOffset = Math.sin(progress * Math.PI) * 1.6;
                    if (z.jumpTimer >= z.jumpDuration) z.isJumping = false;
                }

                const finalSpeed = unitSpeed * phantomSpeedMul;
                currentPos.x += moveDirX * finalSpeed * dt;
                currentPos.z += moveDirZ * finalSpeed * dt;
                currentPos.y = getTerrainHeight(currentPos.x, currentPos.z) + jumpHeightOffset;
                z.mesh.lookAt(0, currentPos.y, 0);
            }
        }

        updateZombieAnimation(z, dt);
    }

    // Resolve all hard obstacle, crowd separation, and bunker perimeter collisions
    resolveZombieCollisions(dt);
}

// ============================================================================
// COMPREHENSIVE HARD COLLISION SOLVER (NO PHASING)
// ============================================================================
function resolveZombieCollisions(dt) {
    const bunkerRadius = 3.3;

    // 1. ZOMBIES VS OBSTACLES (HARD RADIUS CONSTRAINT FOR ALL UNITS)
    for (let i = 0; i < zombies.length; i++) {
        const z = zombies[i];
        if (z.isAerial || z.state === 'DYING' || (z.type === 'PHANTOM' && z.isCloaked) || (z.bossType === 'HUNTER' && (z.state === 'LEAP_OVER' || z.isJumping || z.isScaling || z.state === 'CIRCLING' || z.state === 'STALK_STANDBY'))) continue;

        const zPos = z.mesh.position;

        for (let obsIdx = obstacles.length - 1; obsIdx >= 0; obsIdx--) {
            const obs = obstacles[obsIdx];
            const dx = zPos.x - obs.x;
            const dz = zPos.z - obs.z;
            if (Math.abs(dx) > 4.0 || Math.abs(dz) > 4.0) continue;

            const dist = Math.hypot(dx, dz);
            const minDistance = obs.radius + z.radius;

            // Tank, Brute, Bear, Horse, Juggernaut, Omega, Salamander & Abomination crush destructible barriers
            const isHeavyCrusher = (z.type === 'TANK' || z.type === 'BRUTE' || z.type === 'BEAR' || z.type === 'HORSE' || z.bossType === 'JUGGERNAUT' || z.bossType === 'ABOMINATION' || z.bossType === 'OMEGA' || z.bossType === 'SALAMANDER');
            if (isHeavyCrusher && obs.isDestructible && dist < minDistance + 0.85) {
                destroyObstacle(obs, obsIdx);
                spawnBunkerHitSparks(new THREE.Vector3(obs.x, getTerrainHeight(obs.x, obs.z) + 0.5, obs.z));
                triggerCameraShake();
                const name = z.bossType || z.type;
                showPowerupNotification(`💥 ${name} SMASHED BARRIER IN ITS PATH!`, 'repair');
                continue;
            }

            // Hunter leaping or scaling over obstacle
            if (z.bossType === 'HUNTER' && (z.isJumping || z.isScaling || z.state === 'LEAP_OVER')) {
                continue;
            }

            // Runner, Hound and Stag leaping over low obstacles
            if ((z.type === 'RUNNER' || z.type === 'HOUND' || z.type === 'STAG') && obs.isLow && z.isJumping && zPos.y > (getTerrainHeight(obs.x, obs.z) + obs.height * 0.5)) {
                continue; // Clears low obstacle during jump
            }

            // Crawler slithering under low obstacles
            if (z.type === 'CRAWLER' && obs.isLow) {
                continue;
            }

            // Hard push-out constraint
            if (dist < minDistance && dist > 0.0001) {
                const overlap = minDistance - dist;
                const pushX = dx / dist;
                const pushZ = dz / dist;
                zPos.x += pushX * overlap;
                zPos.z += pushZ * overlap;
            }
        }
    }

    // 2. GROUND ZOMBIE VS GROUND ZOMBIE (CROWD SEPARATION REPULSION)
    for (let i = 0; i < zombies.length; i++) {
        const z1 = zombies[i];
        if (z1.isAerial || z1.state === 'DYING' || (z1.bossType === 'HUNTER' && (z1.state === 'LEAP_OVER' || z1.isJumping || z1.isScaling || z1.state === 'CIRCLING' || z1.state === 'STALK_STANDBY'))) continue;
        const p1 = z1.mesh.position;

        for (let j = i + 1; j < zombies.length; j++) {
            const z2 = zombies[j];
            if (z2.isAerial || z2.state === 'DYING' || (z2.bossType === 'HUNTER' && (z2.state === 'LEAP_OVER' || z2.isJumping || z2.isScaling || z2.state === 'CIRCLING' || z2.state === 'STALK_STANDBY'))) continue;
            const p2 = z2.mesh.position;

            const dx = p1.x - p2.x;
            const dz = p1.z - p2.z;
            if (Math.abs(dx) > 3.5 || Math.abs(dz) > 3.5) continue;

            const dist = Math.hypot(dx, dz);
            const minSeparation = (z1.radius + z2.radius) * 0.88;

            if (dist < minSeparation && dist > 0.0001) {
                const overlap = minSeparation - dist;
                const normX = dx / dist;
                const normZ = dz / dist;

                // Weight based on boss/tank/bear vs regular zombie
                const weight1 = (z1.isBoss || z1.type === 'TANK' || z1.type === 'BEAR' || z1.type === 'BRUTE') ? 0.9 : 0.5;
                const weight2 = (z2.isBoss || z2.type === 'TANK' || z2.type === 'BEAR' || z2.type === 'BRUTE') ? 0.9 : 0.5;
                const totalWeight = weight1 + weight2;

                const push1 = overlap * (weight2 / totalWeight);
                const push2 = overlap * (weight1 / totalWeight);

                p1.x += normX * push1;
                p1.z += normZ * push1;
                p2.x -= normX * push2;
                p2.z -= normZ * push2;
            }
        }
    }

    // 3. BUNKER PERIMETER CLAMP (NO PHASING INTO BASE)
    for (let i = 0; i < zombies.length; i++) {
        const z = zombies[i];
        if (z.isAerial || z.state === 'DYING' || (z.bossType === 'HUNTER' && z.state === 'LEAP_OVER')) continue;

        const zPos = z.mesh.position;
        const distFromCenter = Math.hypot(zPos.x, zPos.z);

        if (distFromCenter < bunkerRadius) {
            if (distFromCenter > 0.05) {
                zPos.x = (zPos.x / distFromCenter) * bunkerRadius;
                zPos.z = (zPos.z / distFromCenter) * bunkerRadius;
            } else {
                zPos.x = bunkerRadius;
                zPos.z = 0;
            }
        }

        // Clamp terrain height
        if (!z.isAerial && !z.isJumping) {
            zPos.y = getTerrainHeight(zPos.x, zPos.z);
        }
    }
}

function destroyObstacle(obs, index) {
    const groundY = getTerrainHeight(obs.x, obs.z);

    if (obs.isExplosive) {
        spawnFireExplosion(obs.x, groundY + 0.5, obs.z);

        for (let i = zombies.length - 1; i >= 0; i--) {
            const z = zombies[i];
            if (!z || !z.mesh || z.state === 'DYING') continue;
            const dx = z.mesh.position.x - obs.x;
            const dz = z.mesh.position.z - obs.z;
            if (Math.abs(dx) > 5.0 || Math.abs(dz) > 5.0) continue;

            const dist = Math.hypot(dx, dz);
            if (dist <= 5.0) {
                z.health -= 6;
                flashZombieHit(z);
                if (z.health <= 0) {
                    eliminateZombie(z, i);
                }
            }
        }
    } else {
        spawnObstacleImpact(new THREE.Vector3(obs.x, groundY + 0.6, obs.z), (obs.type === 'rock') ? 0x8892a0 : (obs.type === 'wood' ? 0x6e4a2f : 0x9c8558));
    }

    if (obs.mesh) scene.remove(obs.mesh);
    obstacles.splice(index, 1);
}

function updateBullets(dt) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.prevPos.copy(b.mesh.position);
        b.mesh.position.addScaledVector(b.direction, b.speed * dt);

        const bx = b.mesh.position.x;
        const bz = b.mesh.position.z;
        const by = b.mesh.position.y;

        if (Math.abs(bx) > 55 || Math.abs(bz) > 55 || by < -1 || by > 25 || (Date.now() - b.birthTime) > 2500) {
            scene.remove(b.mesh);
            bullets.splice(i, 1);
            continue;
        }

        let hitObstacle = false;
        for (let obsIdx = obstacles.length - 1; obsIdx >= 0; obsIdx--) {
            const obs = obstacles[obsIdx];
            const dx = bx - obs.x;
            if (dx > 1.8 || dx < -1.8) continue;
            const dz = bz - obs.z;
            if (dz > 1.8 || dz < -1.8) continue;

            const hDist = Math.hypot(dx, dz);
            const obsGroundY = getTerrainHeight(obs.x, obs.z);

            if (hDist < (obs.radius + 0.18) &&
                by >= obsGroundY - 0.2 &&
                by <= obsGroundY + obs.height) {
                
                const impactColor = (obs.type === 'rock') ? 0x8892a0 : (obs.type === 'wood' ? 0x6e4a2f : (obs.type === 'tree' ? 0x2b2420 : 0x9c8558));
                spawnObstacleImpact(b.mesh.position, impactColor);
                scene.remove(b.mesh);
                bullets.splice(i, 1);
                hitObstacle = true;

                if (obs.isDestructible) {
                    if (obs.requiresOverdrive) {
                        // Trees and large rocks only take damage when player's Quad Overdrive is activated
                        if (b.isOverdrive || isOverdriveActive) {
                            obs.hp -= (b.damage || 2);
                            spawnLowPolyExplosion(b.mesh.position, 0xfbbf24, 4);
                            if (obs.hp <= 0) {
                                destroyObstacle(obs, obsIdx);
                            }
                        }
                    } else {
                        obs.hp -= (b.damage || 1);
                        if (obs.hp <= 0) {
                            destroyObstacle(obs, obsIdx);
                        }
                    }
                }
                break;
            }
        }
        if (hitObstacle) continue;
    }
}

// Continuous Swept Collision Detection (Pickups, Boss Projectiles, Aerial Valkyrie, Juggernaut Flanks)
function updateCollisions() {
    // 1. Bullets vs Resource Pickups
    for (let pIdx = pickups.length - 1; pIdx >= 0; pIdx--) {
        const p = pickups[pIdx];
        const px = p.x;
        const pz = p.z;

        for (let bIdx = bullets.length - 1; bIdx >= 0; bIdx--) {
            const b = bullets[bIdx];
            const bx = b.mesh.position.x;
            const bz = b.mesh.position.z;
            if (Math.abs(bx - px) > 1.5 || Math.abs(bz - pz) > 1.5) continue;

            if (b.mesh.position.distanceTo(p.group.position) < (p.radius + 0.4)) {
                scene.remove(b.mesh);
                bullets.splice(bIdx, 1);
                collectPickup(p, pIdx);
                break;
            }
        }
    }

    // 2. Bullets vs Shootable Boss Projectiles (Yellow Needles, Thrown Boulders, Acid Bile & Sound Waves)
    for (let pIdx = bossProjectiles.length - 1; pIdx >= 0; pIdx--) {
        const proj = bossProjectiles[pIdx];
        const pPos = proj.mesh.position;

        for (let bIdx = bullets.length - 1; bIdx >= 0; bIdx--) {
            const b = bullets[bIdx];
            if (b.mesh.position.distanceTo(pPos) < (proj.radius + 0.6)) {
                // Blight Screamer sound waves can ONLY be intercepted & destroyed when Quad Overdrive is active; normal firepower passes straight through
                if (proj.type === 'SOUND_WAVE' && !(b.isOverdrive || isOverdriveActive)) {
                    continue; // Normal bullets pass through sound waves rendering them harmless to the wave
                }

                scene.remove(b.mesh);
                bullets.splice(bIdx, 1);

                proj.hp -= (b.damage || 1);
                if (proj.hp <= 0) {
                    if (proj.type === 'BOULDER') {
                        spawnFireExplosion(pPos.x, pPos.y, pPos.z);
                        showPowerupNotification('💥 AIRBORNE BOULDER INTERCEPTED & DESTROYED!', 'repair');
                    } else if (proj.type === 'ACID_BILE') {
                        spawnLowPolyExplosion(pPos, 0xa3e635, 8);
                        showPowerupNotification('💥 ACID BILE INTERCEPTED & POPPED!', 'repair');
                    } else if (proj.type === 'SOUND_WAVE') {
                        spawnLowPolyExplosion(pPos, 0xd946ef, 8);
                        showPowerupNotification('💥 SONIC SOUND WAVE DISRUPTED & INTERCEPTED!', 'repair');
                    } else {
                        spawnObstacleImpact(pPos, 0xfacc15);
                    }
                    scene.remove(proj.mesh);
                    bossProjectiles.splice(pIdx, 1);
                }
                break;
            }
        }
    }

    // 3. Bullets vs Zombies / Bosses
    for (let zIdx = zombies.length - 1; zIdx >= 0; zIdx--) {
        const z = zombies[zIdx];
        if (z.state === 'DYING' || z.health <= 0) continue;
        const zPos = z.mesh.position;
        const zx = zPos.x;
        const zz = zPos.z;
        if (!Number.isFinite(zx) || !Number.isFinite(zz)) continue;
        const zy = (z.isAerial || (z.bossType === 'HUNTER' && z.state === 'LEAP_OVER')) ? zPos.y : (zPos.y + 0.85 * (z.config.scale || 1.0));
        if (!Number.isFinite(zy)) continue;
        const zCenter = new THREE.Vector3(zx, zy, zz);
        const hitRadius = z.radius + 0.65;

        for (let bIdx = bullets.length - 1; bIdx >= 0; bIdx--) {
            const b = bullets[bIdx];
            const bx = b.mesh.position.x;
            const bz = b.mesh.position.z;

            if (Math.abs(bx - zx) > 3.8 || Math.abs(bz - zz) > 3.8) continue;

            const p0 = b.prevPos;
            const p1 = b.mesh.position;
            const segX = p1.x - p0.x;
            const segY = p1.y - p0.y;
            const segZ = p1.z - p0.z;
            const lenSq = segX * segX + segY * segY + segZ * segZ;

            let dist;
            if (lenSq < 0.0001) {
                dist = zCenter.distanceTo(p1);
            } else {
                const toX = zCenter.x - p0.x;
                const toY = zCenter.y - p0.y;
                const toZ = zCenter.z - p0.z;
                const t = Math.max(0, Math.min(1, (toX * segX + toY * segY + toZ * segZ) / lenSq));
                const cx = p0.x + segX * t;
                const cy = p0.y + segY * t;
                const cz = p0.z + segZ * t;
                dist = Math.hypot(zCenter.x - cx, zCenter.y - cy, zCenter.z - cz);
            }

            if (dist < hitRadius) {
                scene.remove(b.mesh);
                let dmg = b.damage || 1;
                bullets.splice(bIdx, 1);

                // JUGGERNAUT DIRECTIONAL ARMOR & FLANK WEAKNESS CALCULATION
                if (z.bossType === 'JUGGERNAUT') {
                    const bullForward = new THREE.Vector3(0, 0, 1).applyQuaternion(z.mesh.quaternion).normalize();
                    const dot = bullForward.dot(b.direction);

                    if (dot < -0.65) {
                        dmg = Math.max(0.4, dmg * 0.4);
                        spawnObstacleImpact(b.mesh.position, 0xd8b4fe);
                    } else if (Math.abs(dot) <= 0.65) {
                        dmg *= 2.0;
                        showPowerupNotification('🎯 FLANK WEAKPOINT HIT (2x CRIT)!', 'overdrive');
                        spawnLowPolyExplosion(b.mesh.position, 0xfbbf24, 6);
                    }
                }

                // THE OMEGA DERMAL PLATING & PRIMAL ROAR FIREPOWER INTERRUPT
                if (z.bossType === 'OMEGA') {
                    dmg = Math.max(0.4, dmg * (1.0 - (z.armorReduction || 0.35)));
                    spawnObstacleImpact(b.mesh.position, 0x1c3a27);

                    // Primal Roar Interrupt: Concentrate firepower when rearing up to stagger!
                    if (z.state === 'PRIMAL_ROAR' && !z.hasRoared) {
                        const firepowerPoints = (b.isOverdrive ? 2 : 1);
                        z.roarInterruptedHits = (z.roarInterruptedHits || 0) + firepowerPoints;
                        if (z.roarInterruptedHits >= 5) {
                            z.state = 'STAGGERED';
                            z.stateTimer = 0;
                            z.isRoaring = false;
                            z.hasRoared = false;
                            z.roarInterruptedHits = 0;
                            if (z.bodyGroup) {
                                z.bodyGroup.position.y = 0.5;
                                z.bodyGroup.rotation.x = -0.2;
                            }
                            if (z.headGroup) z.headGroup.rotation.x = -0.3;
                            if (z.lowerJaw) z.lowerJaw.rotation.x = 0.45;

                            showBossTelegraph('💥 OMEGA ROAR INTERRUPTED! CRITICAL STAGGER!', 2500);
                            showPowerupNotification('⭐ BOSS STAGGERED! CRATES DROPPED!', 'repair');
                            spawnLowPolyExplosion(new THREE.Vector3(z.mesh.position.x, z.mesh.position.y + 1.2, z.mesh.position.z), 0x22c55e, 16);
                            triggerCameraShake(0.35);

                            // Drop tactical crates
                            spawnPickupDrop(new THREE.Vector3(z.mesh.position.x - 1.5, z.mesh.position.y, z.mesh.position.z), 'REPAIR');
                            spawnPickupDrop(new THREE.Vector3(z.mesh.position.x + 1.5, z.mesh.position.y, z.mesh.position.z), 'OVERDRIVE');
                        } else {
                            showBossTelegraph(`⚡ OMEGA ROAR INTERRUPT: ${z.roarInterruptedHits}/5 FIREPOWER!`, 1000);
                        }
                    }
                }

                // SALAMANDER WEAK POINT DETECTION (4 GLOWING BIO-NODES FOR 3x CRIT VS 60% ARMOR REDUCTION ON CARAPACE + FIREPOWER STOMP INTERRUPT)
                if (z.bossType === 'SALAMANDER') {
                    let hitWeakpoint = false;
                    if (z.weakPointNodes && z.weakPointNodes.length > 0) {
                        for (let wp of z.weakPointNodes) {
                            const nodeWorldPos = new THREE.Vector3();
                            wp.mesh.getWorldPosition(nodeWorldPos);
                            if (b.mesh.position.distanceTo(nodeWorldPos) < wp.radius) {
                                hitWeakpoint = true;
                                break;
                            }
                        }
                    }

                    if (hitWeakpoint) {
                        dmg *= (z.weakPointMultiplier || 3.0);
                        showPowerupNotification('🎯 SALAMANDER WEAKPOINT HIT (3x CRIT)!', 'overdrive');
                        spawnLowPolyExplosion(b.mesh.position, 0xf59e0b, 10);
                    } else {
                        dmg = Math.max(0.4, dmg * (1.0 - (z.armorReduction || 0.60)));
                        spawnObstacleImpact(b.mesh.position, 0x18181b);
                    }

                    // Seismic Stomp Firepower Interrupt: ANY concentrated firepower hits during rearing stagger the boss!
                    if (z.state === 'SEISMIC_STOMP' && !z.hasStomped) {
                        const firepowerPoints = hitWeakpoint ? 2 : (b.isOverdrive ? 2 : 1);
                        z.stompInterruptedHits = (z.stompInterruptedHits || 0) + firepowerPoints;
                        if (z.stompInterruptedHits >= 5) {
                            z.state = 'STAGGERED';
                            z.stateTimer = 0;
                            z.hasStomped = false;
                            z.stompInterruptedHits = 0;
                            if (z.bodyGroup) {
                                z.bodyGroup.position.y = 0.45;
                                z.bodyGroup.rotation.x = -0.15;
                            }
                            if (z.headGroup) {
                                z.headGroup.position.y = -0.05;
                                z.headGroup.rotation.x = 0;
                            }
                            if (z.flLeg) z.flLeg.rotation.x = -0.4;
                            if (z.frLeg) z.frLeg.rotation.x = -0.4;

                            showBossTelegraph('💥 SALAMANDER STOMP INTERRUPTED! CRITICAL STAGGER!', 2500);
                            showPowerupNotification('⭐ BOSS STAGGERED! CRATES DROPPED!', 'repair');
                            spawnLowPolyExplosion(new THREE.Vector3(z.mesh.position.x, z.mesh.position.y + 1.2, z.mesh.position.z), 0x38bdf8, 18);
                            triggerCameraShake(0.35);

                            // Tactical resource drops reward precise shooting!
                            spawnPickupDrop(new THREE.Vector3(z.mesh.position.x - 1.5, z.mesh.position.y, z.mesh.position.z), 'REPAIR');
                            spawnPickupDrop(new THREE.Vector3(z.mesh.position.x + 1.5, z.mesh.position.y, z.mesh.position.z), 'OVERDRIVE');
                        } else {
                            showBossTelegraph(`⚡ SEISMIC STOMP INTERRUPT: ${z.stompInterruptedHits}/5 FIREPOWER!`, 1000);
                        }
                    }
                }

                // GORE BRUTE DIRECTIONAL SHIELD BLOCK (70% DAMAGE REDUCTION FROM FRONT)
                if (z.type === 'BRUTE') {
                    const bruteForward = new THREE.Vector3(0, 0, 1).applyQuaternion(z.mesh.quaternion).normalize();
                    const dot = bruteForward.dot(b.direction);
                    if (dot < -0.25) {
                        dmg = Math.max(0.3, dmg * 0.3);
                        spawnObstacleImpact(b.mesh.position, 0x475569);
                    }
                }

                // ZOMBIE BEAR THICK PELT ARMOR & INSTANT ENRAGE CHARGE (55% FRONTAL DAMAGE ABSORPTION)
                if (z.type === 'BEAR') {
                    const bearForward = new THREE.Vector3(0, 0, 1).applyQuaternion(z.mesh.quaternion).normalize();
                    const dot = bearForward.dot(b.direction);
                    if (dot < -0.15) {
                        dmg = Math.max(0.3, dmg * 0.45); // Heavy frontal damage resistance
                        spawnObstacleImpact(b.mesh.position, 0x2e1c14);
                    } else {
                        dmg = Math.max(0.3, dmg * 0.70); // Flank resistance from dense muscle
                    }

                    if (!z.isEnraged) {
                        z.isEnraged = true;
                        z.speed = (z.config.speed || 2.4) * 1.85; // Speed boost to 4.45 (high-speed charge)
                        showBossTelegraph('⚠️ ZOMBIE BEAR ENRAGED & CHARGING!', 2000);
                        playZombieApproachSound('BEAR', zx, zz);
                        if (z.eyeL && z.eyeL.material) z.eyeL.material.color.setHex(0xff0000);
                        if (z.eyeR && z.eyeR.material) z.eyeR.material.color.setHex(0xff0000);
                    }
                    z.frenzyTimer = 4.0;
                }

                z.health -= dmg;
                flashZombieHit(z);

                // Valkyrie Stagger
                if (z.bossType === 'VALKYRIE' && z.state === 'DIVE') {
                    z.hitsDuringDive = (z.hitsDuringDive || 0) + 1;
                    if (z.hitsDuringDive >= 4) {
                        z.state = 'STAGGERED';
                        z.stateTimer = 0;
                        spawnPickupDrop(new THREE.Vector3(zx, 1.0, zz), 'OVERDRIVE');
                        showPowerupNotification('💥 VALKYRIE STAGGERED! OVERDRIVE DROPPED!', 'repair');
                    }
                }

                if (z.health <= 0) {
                    eliminateZombie(z, zIdx);
                }
                break;
            }
        }
    }
}

function eliminateZombie(z, index) {
    if (!z || z.state === 'DYING') return;

    // Instantly restore original materials and clear any pending hit flash timeouts
    if (z.meshes) {
        z.meshes.forEach(m => {
            if (m && m.userData) {
                if (m.userData.flashTimeout) {
                    clearTimeout(m.userData.flashTimeout);
                    m.userData.flashTimeout = null;
                }
                if (m.userData.origMaterial) {
                    m.material = m.userData.origMaterial;
                }
            }
        });
    }

    const zPos = z.mesh.position;

    if (z.isBoss) {
        z.state = 'DYING';
        z.deathTimer = 0;
        z.deathDuration = 3.8;
        playBossDeathSound(z.bossType, 0);
        bossHud.classList.add('hidden');
        bossTelegraph.classList.add('hidden');
        diveAlert.classList.add('hidden');
        showPowerupNotification(`🏆 ${z.name} HAS BEEN DEFEATED!`, 'overdrive');
        score += (z.config ? z.config.scoreVal : 500);
        zombiesAliveCount--;
        updateHUDCounters();
        return; // Retain mesh to animate articulated death collapse in updateZombies
    }

    // REGULAR ZOMBIE DEATH
    z.state = 'DYING';
    z.deathTimer = 0;
    z.deathDuration = (z.type === 'BEAR' || z.type === 'TANK' || z.type === 'HORSE') ? 1.15 : 0.85;

    // INSTANT RESOURCE CARRIER DROP (ZERO DELAY)
    if (z.carrierType) {
        spawnPickupDrop(new THREE.Vector3(zPos.x, 0, zPos.z), z.carrierType);
        if (z.mesh) {
            const foundPack = z.mesh.getObjectByName('carrierBackpack');
            if (foundPack && foundPack.parent) {
                foundPack.parent.remove(foundPack);
            }
        }
        z.carrierType = null;
    }

    playZombieDeathSound(z.type);
    score += (z.config ? z.config.scoreVal : 10);
    zombiesAliveCount--;
    updateHUDCounters();

    if (z.groundBeacon) {
        scene.remove(z.groundBeacon);
        z.groundBeacon = null;
    }
}

function updateWaveSpawner(dt) {
    if (isWaveIntermission) {
        waveIntermissionTimer -= dt * 1000;
        if (waveIntermissionTimer <= 0) {
            currentWave++;
            startNextWave();
        }
        return;
    }

    if (zombiesRemainingToSpawn > 0) {
        spawnTimer += dt * 1000;
        if (spawnTimer >= spawnInterval) {
            spawnZombie();
            spawnTimer = 0;
        }
    } else if (zombiesAliveCount <= 0) {
        isWaveIntermission = true;
        waveIntermissionTimer = 2200;
        displayWaveCompletedBanner();
    }
}

function updateDebrisAndCasings(dt) {
    for (let i = debrisChunks.length - 1; i >= 0; i--) {
        const d = debrisChunks[i];
        d.mesh.position.addScaledVector(d.velocity, dt);
        d.velocity.y -= 14.0 * dt;

        d.mesh.rotation.x += d.rotVelocity.x * dt;
        d.mesh.rotation.y += d.rotVelocity.y * dt;

        const groundY = getTerrainHeight(d.mesh.position.x, d.mesh.position.z);
        if (d.mesh.position.y < groundY + 0.1) {
            d.mesh.position.y = groundY + 0.1;
            d.velocity.set(0, 0, 0);
        }

        d.life -= d.decay * dt;
        if (d.life <= 0) {
            scene.remove(d.mesh);
            debrisChunks.splice(i, 1);
        }
    }

    for (let i = shellCasings.length - 1; i >= 0; i--) {
        const s = shellCasings[i];
        s.mesh.position.addScaledVector(s.velocity, dt);
        s.velocity.y -= 16.0 * dt;

        if (s.mesh.position.y < 0.05) {
            s.mesh.position.y = 0.05;
            s.velocity.set(0, 0, 0);
        }

        s.life -= dt;
        if (s.life <= 0) {
            scene.remove(s.mesh);
            shellCasings.splice(i, 1);
        }
    }

    for (let i = steamParticles.length - 1; i >= 0; i--) {
        const p = steamParticles[i];
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.life -= p.decay * dt;

        if (p.life <= 0) {
            scene.remove(p.mesh);
            steamParticles.splice(i, 1);
        }
    }
}

function updateEnvironmentDynamics(dt) {
    searchlights.forEach(sl => {
        sl.angle += dt * 0.4;
        sl.target.position.x = sl.originX * 0.4 + Math.cos(sl.angle) * 14;
        sl.target.position.z = sl.originZ * 0.4 + Math.sin(sl.angle) * 14;
    });

    ambientParticles.forEach(p => {
        const positions = p.geom.attributes.position.array;
        for (let i = 0; i < p.count; i++) {
            positions[i * 3 + 1] += Math.sin(clock.getElapsedTime() + i) * 0.005;
        }
        p.geom.attributes.position.needsUpdate = true;
    });
}

function updateCameraShake(dt) {
    if (shakeDuration > 0) {
        shakeDuration -= dt;
        if (shakeDuration <= 0) {
            camera.position.copy(originalCameraPos);
        } else {
            camera.position.x = originalCameraPos.x + (Math.random() - 0.5) * shakeIntensity * 12;
            camera.position.y = originalCameraPos.y + (Math.random() - 0.5) * shakeIntensity * 12;
            camera.position.z = originalCameraPos.z + (Math.random() - 0.5) * shakeIntensity * 12;
        }
    }
}

// ============================================================================
// 9. INPUT HANDLERS
// ============================================================================
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function updateTouchCoordinates(event) {
    if (event.touches.length > 0) {
        const touch = event.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    }
}

function onTouchStart(event) {
    if (gameState === 'PLAYING') {
        event.preventDefault();
        updateTouchCoordinates(event);
        if (isCinematicActive) {
            endBossCinematic();
            return;
        }
        fireBullet();
    }
}

function onTouchMove(event) {
    if (gameState === 'PLAYING') {
        event.preventDefault();
        updateTouchCoordinates(event);
    }
}

function onMouseDown(event) {
    if (gameState === 'PLAYING') {
        if (isCinematicActive) {
            endBossCinematic();
            return;
        }
        fireBullet();
    }
}
