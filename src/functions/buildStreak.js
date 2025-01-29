import { Move } from "../Classes/Move";
import { Streak } from "../Classes/Streak";
import { Item } from "../Data Structures/linked-list";

export function buildStreak(
  Table,
  Streaks,
  x,
  y,
  direction,
  player,
  playerNames
) {
  let streak = new Streak({
    rootMove: new Move(y, x),
    direction: direction,
    player: player,
  });

  let winner;

  let item = new Item(streak);
  let deltaX = direction[0],
    deltaY = direction[1];

  for (let i = 0; i < 4; i++) {
    let nextCell = Table[y + i * deltaY][x + i * deltaX];

    if (nextCell === player) {
      streak.streakCount++;

      if (streak.streakCount === 4) {
        winner = playerNames[streak.player - 1];
        return winner;
      }
    } else {
      if (!nextCell) {
        Table[y + i * deltaY][x + i * deltaX] = [];
      }
      Table[y + i * deltaY][x + i * deltaX].push(item);
      streak.addCellPointer(Table[y + i * deltaY][x + i * deltaX]);
    }

    if (i == 3) {
      if (streak.streakCount == 3) {
        Streaks[player - 1][0].prepend(item);
      } else if (streak.streakCount == 2) {
        Streaks[player - 1][0].append(item);
      } else {
        Streaks[player - 1][1].append(item);
      }
    }
  }
}
