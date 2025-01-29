import { Move } from "./Move";

export class Round {
  firstMove;
  secondMove;

  constructor(firstMove = null, secondMove = new Move("X", "X")) {
    this.firstMove = firstMove;
    this.secondMove = secondMove;
  }
}
