export class PossibleDirection {
  x;
  y;
  frontier;
  #leftOk;
  #upOk;
  #rightOk;
  #downOk;

  constructor(y, x, frontier) {
    this.x = x;
    this.y = y;
    this.frontier = frontier;
    this.#leftOk = this.x > 2;
    this.#upOk = this.y > 2;
    this.#rightOk = this.x < this.frontier.length - 3;
    this.#downOk =
      y < frontier.reduce((max, num) => Math.max(max, num), -Infinity) - 2;
  }

  cl_isOk() {
    return this.#leftOk;
  }

  cr_isOk() {
    return this.#rightOk;
  }

  uc_isOk() {
    return this.#upOk;
  }

  ul_isOk() {
    return this.#leftOk && this.#upOk;
  }

  ur_isOk() {
    return this.#rightOk && this.#upOk;
  }
  dr_isOk() {
    return this.#downOk && this.#rightOk;
  }

  dl_isOk() {
    return this.#downOk && this.#leftOk;
  }
}
