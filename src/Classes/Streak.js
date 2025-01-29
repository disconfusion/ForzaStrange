import { Move } from "./Move";
import { Item } from "../Data Structures/linked-list";

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

  /**
   * @param {Item[]} pointer - The reference has to be pushed in cellsPointersInTheLine property
   */
  addCellPointer(pointer) {
    if (!Array.isArray(this.cellsPointersInTheLine)) {
      this.cellsPointersInTheLine = [pointer];
    } else {
      this.cellsPointersInTheLine.push(pointer);
    }
  }

  /**
   * @returns {boolean} True if nextMove not empty, otherwise returns False
   */
  hasNextMove() {
    return Boolean(Array.isArray(this.nextMove) && this.nextMove.length);
  }

  /**
   * @returns {number} Y direction offset
   */
  getDeltaY() {
    let deltaY = 0; //direction: "c"
    if (this.direction[0] == "u") {
      deltaY = -1;
    } else if (this.direction[0] == "d") {
      deltaY = +1;
    }
    return deltaY;
  }

  /**
   * @returns {number} X direction offset
   */
  getDeltaX() {
    let deltaX = 0; //direction: "cc"
    if (this.direction[1] == "l") {
      deltaX = -1;
    } else if (this.direction[1] == "r") {
      deltaX = +1;
    }
    return deltaX;
  }

  getOppositeDirection() {
    let oppositeDirection = "";

    if (this.direction[0] == "u") {
      oppositeDirection += "d";
    } else {
      oppositeDirection += "u";
    }

    if (this.direction[1] == "l") {
      oppositeDirection += "r";
    } else {
      oppositeDirection += "l";
    }

    return oppositeDirection;
  }
}
