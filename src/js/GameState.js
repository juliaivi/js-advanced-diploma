export default class GameState {
  constructor() {
    this.userPoints = 0; // счет игрока
    this.enemyPoints = 0;// счет противника
    this.level = 1; // уровень игры
  }

  static from(object) {
    // TODO: create object
    this.queue = object; // храниение хода
    return null;
  }
}
