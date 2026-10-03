// =============================================================================
// LEVEL / XP CURVE
// =============================================================================

/** XP required to go from `level` to `level + 1`. */
export function xpToNextLevel(level: number): number {
  return Math.round(500 * Math.pow(level, 1.35) + 500);
}

/**
 * Applies gained XP to a (level, xp) pair, handling multiple level-ups.
 * Returns the new level/xp plus how many levels were gained.
 */
export function applyXpGain(
  currentLevel: number,
  currentXp: number,
  xpGained: number,
): { level: number; xp: number; levelsGained: number } {
  let level = currentLevel;
  let xp = currentXp + xpGained;
  let levelsGained = 0;

  while (xp >= xpToNextLevel(level)) {
    xp -= xpToNextLevel(level);
    level += 1;
    levelsGained += 1;
  }

  return { level, xp, levelsGained };
}
