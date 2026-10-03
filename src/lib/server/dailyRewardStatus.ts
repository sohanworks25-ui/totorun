// Shared, server-authoritative daily-reward cycle logic (GET status + POST
// claim both call this so the rules can never diverge/be spoofed).

export interface DailyRewardState {
  lastDailyRewardDay: number;
  lastDailyRewardAt: Date | null;
}

export interface DailyRewardStatus {
  claimable: boolean;
  nextDay: number; // 1-7
  hoursSinceLastClaim: number | null;
}

const MIN_HOURS_BETWEEN_CLAIMS = 20;
const STREAK_RESET_HOURS = 48;

export function computeDailyRewardStatus(state: DailyRewardState, now = new Date()): DailyRewardStatus {
  if (!state.lastDailyRewardAt) {
    return { claimable: true, nextDay: 1, hoursSinceLastClaim: null };
  }

  const hoursSince = (now.getTime() - state.lastDailyRewardAt.getTime()) / 3_600_000;

  if (hoursSince < MIN_HOURS_BETWEEN_CLAIMS) {
    return { claimable: false, nextDay: (state.lastDailyRewardDay % 7) + 1, hoursSinceLastClaim: hoursSince };
  }

  if (hoursSince <= STREAK_RESET_HOURS) {
    return { claimable: true, nextDay: (state.lastDailyRewardDay % 7) + 1, hoursSinceLastClaim: hoursSince };
  }

  // Missed the window — streak resets back to day 1.
  return { claimable: true, nextDay: 1, hoursSinceLastClaim: hoursSince };
}
