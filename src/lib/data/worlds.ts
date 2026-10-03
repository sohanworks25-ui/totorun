// =============================================================================
// WORLDS — each world defines a visual theme (parallax palette), the distance
// range it appears in, and the boss that guards it. The engine picks the
// active world from distance traveled in the current run.
// =============================================================================

export interface WorldDef {
  id: string;
  name: string;
  minDistance: number; // meters at which this world starts appearing
  sky: [string, string]; // gradient stops
  clouds: string;
  mountains: string;
  ground: string;
  accent: string;
  boss: string;
  miniBosses: string[];
}

export const WORLDS: WorldDef[] = [
  { id: "forest", name: "Forest", minDistance: 0, sky: ["#1e3a2f", "#0b1f17"], clouds: "#2f5544", mountains: "#16311f", ground: "#0c1f14", accent: "#4ade80", boss: "Giant Beast", miniBosses: ["Giant Spider"] },
  { id: "city", name: "City", minDistance: 800, sky: ["#1f2a44", "#0c1222"], clouds: "#33416a", mountains: "#20283f", ground: "#10131f", accent: "#60a5fa", boss: "Mega Robot", miniBosses: ["Robot Guardian"] },
  { id: "desert", name: "Desert", minDistance: 1800, sky: ["#4a3418", "#1f1407"], clouds: "#7a5a2a", mountains: "#3a2a12", ground: "#221706", accent: "#facc15", boss: "Sand Monster", miniBosses: ["Robot Guardian"] },
  { id: "snow", name: "Snow", minDistance: 3000, sky: ["#2a3b4a", "#0e1620"], clouds: "#50697d", mountains: "#2f4250", ground: "#0c141b", accent: "#e2e8f0", boss: "Ice Titan", miniBosses: ["Flying Drone"] },
  { id: "night_city", name: "Night City", minDistance: 4500, sky: ["#1a0f33", "#060310"], clouds: "#3a1f5c", mountains: "#241240", ground: "#0a0616", accent: "#e879f9", boss: "Cyber Overlord", miniBosses: ["Flying Drone"] },
  { id: "volcano", name: "Volcano", minDistance: 6200, sky: ["#4a0f0f", "#160303"], clouds: "#6e1e1e", mountains: "#320a0a", ground: "#1a0404", accent: "#f97316", boss: "Fire Dragon", miniBosses: ["Monster"] },
  { id: "space", name: "Space", minDistance: 8200, sky: ["#0a0a2a", "#000005"], clouds: "#1c1c4a", mountains: "#121235", ground: "#05050f", accent: "#a78bfa", boss: "Alien Guardian", miniBosses: ["Flying Drone", "Monster"] },
  { id: "cyberpunk", name: "Cyberpunk", minDistance: 10500, sky: ["#1a0030", "#05000a"], clouds: "#3a0060", mountains: "#200040", ground: "#0a0014", accent: "#22d3ee", boss: "Cyber Overlord", miniBosses: ["Robot Guardian", "Flying Drone"] },
];

export function worldForDistance(distance: number): WorldDef {
  let active = WORLDS[0];
  for (const w of WORLDS) {
    if (distance >= w.minDistance) active = w;
  }
  return active;
}
