import { Move } from "./Move";

export class Streak {
  rootMove; //First move of the streak;
  nextMove; //array of moves:moves
  cellsPointersInTheLine; //next cells pointers to fill for continuing the streak
  direction; //string identifying direction of the streak
  oppositeDirectionStreak; //opposite direction streak reference
  streakCount; //streak counter
  player; //owner of the streak

  constructor({
    rootMove = null,
    nextMove = null,
    cellsPointersInTheLine = null,
    direction = "",
    oppositeDirectionStreak = null,
    streakCount = 0,
    player = null,
  }) {
    this.rootMove = rootMove;
    this.nextMove = nextMove;
    this.cellsPointersInTheLine = cellsPointersInTheLine;
    this.direction = direction;
    this.oppositeDirectionStreak = oppositeDirectionStreak;
    this.streakCount = streakCount;
    this.player = player;
  }

  /**
   * @param {Move} move - move will be pushed in nextMove array
   */
  addNextMove(move) {
    if (!this.nextMove) {
      this.nextMove = [];
    }
    this.nextMove.push(move);
  }

  addCellPointer(pointer) {
    if (!Array.isArray(this.cellsPointersInTheLine)) {
      this.cellsPointersInTheLine = [pointer];
    } else {
      this.cellsPointersInTheLine.push(pointer);
    }
  }

  hasNextMove() {
    return Boolean(Array.isArray(this.nextMove) && this.nextMove.length);
  }
}
