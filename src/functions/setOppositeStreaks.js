import { Streak } from "../Classes/Streak";

/**
 * @param {Streak} streak - streak's oppositeStreak property will be set to opposite direction streak reference in the oppositeStreakObject
 */
export function setOppositeStreaks(streak, oppositeStreaks) {
  /**
   * @type {Streak}
   */
  let oppositeStreak = oppositeStreaks[streak.getOppositeDirection()];

  if (oppositeStreak instanceof Streak) {
    streak.oppositeDirectionStreak = oppositeStreak;
    oppositeStreak.oppositeDirectionStreak = streak;
  }
}
