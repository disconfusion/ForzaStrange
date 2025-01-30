export class PossibleDirection {
  cl;
  ul;
  uc;
  ur;
  cr;
  dr;
  dl;

  constructor(y, x, frontier) {
    this.cl = x > 2; //left
    this.uc = y > 2; //up
    this.cr = x < frontier.length - 3; //right
    let dc =
      y < frontier.reduce((max, num) => Math.max(max, num), -Infinity) - 2; //down

    this.ul = this.cl && this.uc;
    this.ur = this.ur && this.uc;
    this.dr = dc && this.cr;
    this.dl = dc && this.cl;
  }

  /**
   * @returns {String[]} Returns array of valid root streaks directions
   */
  getPossibleDirections() {
    return Object.keys(this).filter((dir) => this[dir]);
  }
}
