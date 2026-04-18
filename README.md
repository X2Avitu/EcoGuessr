# 🌊 EcoSim — Live Ecosystem Collapse Simulator

An interactive real-time simulation of a marine food web built on **Lotka-Volterra population dynamics**. Drag climate sliders, watch species cascade to extinction, and see the chain reactions ripple through the ecosystem.

## What It Does

- **Manipulate Climate Variables** — CO₂ concentration (280–900 ppm), temperature rise (0–5°C), and rainfall (0.2–2.0×)
- **Watch Food Webs Collapse** — 6 interconnected marine species driven by real-world ODE math
- **Extinction Cascade Alerts** — Species hitting zero triggers cascades up and down the trophic chain
- **Live Population Chart** — Real-time Lotka-Volterra line chart updating at 10 fps
- **3D Ecosystem View** — WebGL glowing orbs representing each species, sized by population

## The Math

Generalized Lotka-Volterra system:

```
dNᵢ/dt = Nᵢ · (rᵢ(climate) + Σⱼ αᵢⱼ · Nⱼ)
```

Where `rᵢ(climate)` is the climate-modified intrinsic growth rate, and `αᵢⱼ` encodes the interaction matrix (predation, competition, mutualism).

### Climate Effects
| Variable | Phytoplankton | Zooplankton | Fish | Seabird | Coral |
|----------|:---:|:---:|:---:|:---:|:---:|
| CO₂ ↑   | hump-shaped bloom | shell dissolution ↓↓ | mild ↓ | — | **bleaching ↓↓↓** |
| Temp ↑  | mild ↓ | metabolic stress ↓ | habitat loss ↓↓ | fish scarcity ↓↓ | **thermal bleach ↓↓↓** |
| Rain ↑  | nutrient bloom ↑ | mild ↑ | hypoxia ↓ | nesting disruption ↓ | turbidity ↓ |

## Species

| # | Species | Trophic Level | Role |
|---|---------|:---:|---|
| 🌿 | Phytoplankton | 1 | Primary producer |
| 🦐 | Zooplankton | 2 | Herbivore |
| 🐟 | Forage Fish | 3 | Mid-chain omnivore |
| 🐠 | Apex Fish | 4 | Predator |
| 🦅 | Seabird | 5 | Apex aerial predator |
| 🪸 | Coral Reef | 0 | Habitat engineer |

## Tech Stack

- **Next.js 15** + React 19
- **Three.js / @react-three/fiber** — 3D WebGL ecosystem canvas
- **Pure SVG** — Real-time population dynamics chart
- **Euler ODE Integration** — dt=0.02, 5 micro-steps per 100ms frame
- **Vanilla CSS** — Ocean-dark glassmorphism design system

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Interesting Scenarios to Try

1. **Coral Collapse** — Push CO₂ to 900 ppm and watch coral bleach → fish habitat shrinks → apex chain collapses
2. **Temperature Shock** — Set temp to +5°C → seabirds collapse first, then tuna, then cascades down
3. **Algal Bloom Crash** — Push rainfall to 2.0×, watch phytoplankton overshoot then crash, taking everything with it
4. **Recovery** — After collapse, lower all sliders back to baseline and watch which species recover and which stay extinct
