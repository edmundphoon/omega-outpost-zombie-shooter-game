# 🧟 Outpost Omega: 3D Zombie Defender (`omega-outpost-zombie-shooter-game`)

> **A fast-paced, high-octane 3D low-poly arcade zombie shooter where you command a fortified perimeter turret defending humanity's final outpost against relentless waves of the mutated undead.**

---

## 📖 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Gameplay Mechanics](#-gameplay-mechanics)
- [Threat Intel & Bestiary](#-threat-intel--bestiary)
- [Controls & Shortcuts](#-controls--shortcuts)
- [Project Architecture & File Layout](#-project-architecture--file-layout)
- [Getting Started & Local Play](#-getting-started--local-play)
- [Website & Iframe Embedding](#-website--iframe-embedding)
- [Tech Stack](#-tech-stack)

---

## 🛡️ Overview

**Outpost Omega** is a standalone, browser-based 3D turret shooter built with **Three.js** and the **Web Audio API**. Positioned at the command turret of Outpost Omega, players must track, prioritize, and eliminate diverse zombie mutations, feral animals, and apex boss titans while managing barrel overheat, bunker integrity, and power-up drops.

The game is **100% self-contained**—featuring procedural 3D environments, custom low-poly models, real-time lighting, synthesized audio tracks, interactive tactical field manuals, and persistent leaderboards without any external asset dependencies.

---

## ✨ Key Features

- **🎮 Dual Heavy Autocannons**: Alternating barrel recoil, physical shell casing ejection, muzzle flashes, and dynamic barrel overheat jam risks.
- **👾 19 Unique Enemy Types**: 10 standard swarm variants, 3 mutant wildlife beasts, and 6 apex boss titans with multi-phase mechanics and telegraph indicators.
- **💥 Boss Stagger & Weakpoint Mechanics**: Interrupt apex bosses during ultimate attacks (e.g. *The Salamander's Seismic Stomp*, *The Omega's Primal Roar*, *Valkyrie's Dive-Bomb*) with focused firepower to stagger them and force resource drops.
- **📖 In-Game Tactical Field Manual (`[G]`)**: Interactive 3D guide covering turret stats, carrier supply mechanics, and an unlocked threat roster featuring studio-lit 3D model snapshots.
- **🏆 Persistent Leaderboard (`[L]`)**: LocalStorage high-score saving with player callsigns, rank classification, and incognito-safe fallback.
- **🔊 Procedural Web Audio Engine**: Zero MP3/WAV dependencies; real-time procedural synthesizers generate all gunfire, ricochets, roars, explosions, and multi-track combat soundtracks.
- **🔒 Encrypted Distributable Bundle**: Automated PowerShell compiler (`build_encrypted_dist.ps1`) producing a tamper-resistant, single-file distribution package (`dist/index.html`) ready for website embedding.

---

## ⚙️ Gameplay Mechanics

### 1. Barrel Heat & Overheat Jam
- Firing increases **Barrel Heat**.
- Sustained automatic fire fills the gauge to 100%, causing a **WEAPON OVERHEATED** jam for 2.8 seconds.
- Controlled burst fire and nanite cooling maintain continuous fire readiness.

### 2. Supply Carrier Backpacks & Power-Ups
- Mutated zombies occasionally spawn with glowing resource packs:
  - 🟢 **Nanite Repair Crate**: Instantly restores **+30% Bunker Integrity**.
  - 🟡 **Quad Overdrive Crate**: Activates **12 seconds of 4-barrel continuous fire** (doubled fire rate, spread shots, and destructive piercing).

### 3. Boss Telegraphs & Stagger Interrupts
- Apex bosses display visual telegraph banners before launching devastating ultimates.
- Landing required firepower hits on weak points during the wind-up window staggers the boss for 2.2 seconds, cancelling the attack and dropping supply crates.

---

## 🗂️ Threat Intel & Bestiary

### 🧟 Standard Swarm (10 Types)
| Threat Name | Category | Tier | Threat Intel & Weakpoint |
| :--- | :--- | :--- | :--- |
| **Infected Walker** | Biped Swarm | Low | Shambling baseline infected. Frequently carries Nanite Repair supply packs. |
| **Feral Runner** | Sprinter | Moderate | High-velocity sprint biped. Eliminate early before they close the perimeter. |
| **Gore Tank** | Bloated Siege | High | Heavy bullet sponge with frontal armor. Smashes obstacles in its path. |
| **Mutant Hound** | Canine Flanker | Moderate | Fast quadruped runner with low ground profile. Aim low. |
| **Seeker Assassin** | Aerial Striker | High | Flying striker dealing double contact damage to bunker defenses. |
| **Acid Spitter** | Bio-Artillery | High | Halts at perimeter to lob acidic projectiles. Intercept projectiles in mid-air. |
| **Phantom Weaver** | Evasive Shadow | High | Cloaked entity weaving laterally to dodge turret fire. |
| **Ground Crawler** | Ambusher | Low | Low-profile crawler beneath normal line of sight. 1 direct hit destroys it. |
| **Gore Brute** | Bone Shield | Extreme | Carries a heavy bone shield reducing frontal damage by 70%. Flank its sides. |
| **Blight Screamer** | Acoustic Screech | Extreme | Emits expanding sonic shockwaves. Overdrive bullets can shatter screech rings. |

### 🐺 Mutated Beasts (3 Types)
| Beast Name | Wave | Threat Intel |
| :--- | :--- | :--- |
| **Zombie Stag / Deer** | Wave 11+ | Performs high bounding leaps over sandbags and obstacles. Track jump apex. |
| **Zombie War Horse** | Wave 14+ | Relentless charge beast possessing immense momentum. Smashes barricades without deflection. |
| **Zombie Bear / Ursine** | Wave 16+ | Dense pelt absorbs 55% frontal damage. Instantly enrages and charges when damaged. |

### 👑 Apex Boss Titans (6 Bosses)
| Boss | Wave | Unique Mechanics & Abilities |
| :--- | :--- | :--- |
| **The Hunter** | Wave 5 | Camouflaged stalker circling perimeter before leaping over defenses. |
| **The Omega** | Wave 10 | Massive reptilian colossus with snapping jaws and **Primal Roar**. Staggerable during roar wind-up. |
| **Juggernaut** | Wave 15 | Armored gore bull with dorsal spine crest. Deflects 60% frontal fire; takes **2x Critical Damage** from the rear. |
| **Valkyrie** | Wave 20 | Winged aerial empress launching feather needles and lethal **Dive-Bomb Assaults**. Staggerable during dive. |
| **The Salamander** | Wave 25 | Carapace lizard boss with obsidian dorsal ridge. Weak to hits during **Seismic Stomp**. |
| **The Abomination** | Wave 30+ | Titanic dual-headed colossus hurling explosive boulders and rupturing bio-plasma. |

---

## 🕹️ Controls & Shortcuts

| Action | Control / Shortcut | Description |
| :--- | :--- | :--- |
| **Aim Turret** | `Mouse Movement` / `Touch Drag` | Directs twin autocannons via raycasted targeting. |
| **Fire Cannon** | `Left Click` / `Touch Tap` | Fires active barrel with recoil & heat build-up. |
| **Tactical Field Guide** | `[G]` / UI Button | Opens 3-tab manual (Turret, Supplies, Threat Roster). |
| **Leaderboard / Ranks** | `[L]` / UI Button | Opens global hall of fame & record statistics. |
| **Audio Toggle** | `[M]` / UI Button | Mutes / unmutes synthesized sound engine. |
| **Pause Defense** | `[ESC]` / UI Button | Suspends simulation; resumes on toggle. |
| **Skip Cinematic** | `[SPACE]` / `Click` | Skips 10-second boss intro sequence. |

---

## 📁 Project Architecture & File Layout

```
zombie-defender/
├── README.md                   # Project documentation & reference manual
├── index.html                  # Source game entrypoint (uncompressed)
├── game.js                     # Core 3D engine, enemy factories, audio & UI
├── style.css                   # Cyber-defense UI, HUD gauges, and modal styles
├── three.min.js                # Offline local Three.js r128 library (603 KB)
├── pako.min.js                 # Offline local Pako 2.1.0 decompression library (46 KB)
├── embed.html                  # Root iframe preview player
├── build_encrypted_dist.ps1    # Automated compilation & rolling-key encryption tool
└── dist/
    ├── index.html              # Standalone encrypted single-file production build
    ├── three.min.js            # Bundled Three.js for standalone offline execution
    ├── pako.min.js             # Bundled Pako decompression for dist package
    ├── embed.html              # Responsive web frame container
    └── embed_snippet.html      # Copy-paste HTML iframe snippet for external sites
```

---

## 🚀 Getting Started & Local Play

### Option 1: Play Standalone Encrypted Build (Recommended)
1. Navigate to the `dist/` directory.
2. Double-click `dist/index.html` in Windows File Explorer (or open with Chrome, Edge, Firefox, Brave).
3. The secure bootloader decrypts the tactical engine in-memory in under 0.5s—no web server required.

### Option 2: Run Development Source
1. Double-click `index.html` in the root workspace.
2. Or serve via any local HTTP server:
   ```bash
   # Python 3
   python -m http.server 8080

   # Node.js npx
   npx serve .
   ```
3. Open `http://localhost:8080` in your browser.

---

## 🌐 Website & Iframe Embedding

To embed Outpost Omega on your website, blog, CMS, or portal:

```html
<!-- Outpost Omega 3D - Responsive Embed Code -->
<div style="position: relative; width: 100%; max-width: 1200px; height: 750px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 0 35px rgba(0, 240, 255, 0.35); border: 1.5px solid rgba(0, 240, 255, 0.4); background: #0a0f18;">
    <iframe 
        src="dist/index.html" 
        title="Outpost Omega 3D Defender" 
        width="100%" 
        height="100%" 
        style="border: none; width: 100%; height: 100%; display: block;" 
        allow="autoplay; fullscreen; pointer-lock" 
        allowfullscreen>
    </iframe>
</div>
```

---

## 🛠️ Tech Stack

- **Graphics Engine**: [Three.js](https://threejs.org/) (r128 WebGL Renderer, PCF Shadow Mapping, Linear Atmospheric Fog)
- **Audio Engine**: Web Audio API (Multi-channel Real-time Synthesizer)
- **Styling**: CSS3 Custom Properties, Cybernetic HUD Design, Rajdhani & Share Tech Mono Typography
- **Compression & Encryption**: Pako (zlib/deflate) + Multi-byte Rolling XOR Cryptographic Cipher
- **Packaging**: PowerShell Automated Build Pipeline
