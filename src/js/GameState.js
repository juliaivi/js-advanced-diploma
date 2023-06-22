import themes from './themes';

export default class GameState {
  constructor(userPoints) {
    this.userPoints = userPoints; // счет игрока
    this.level = 1; // уровень игры
    this.allCharactersOnField = [];
    this.activeThemes = themes[this.level];
    this.activeTeame = null; // активная команда
    this.numberPlayers = 2;
    this.oldPoints = 0;
    // this.teamLocationComputer = [];
  }

  static from(object) {
    // TODO: create object
    this.queue = object; // храниение хода
    return null;
  }

  // TODO только незнаю правильно ли сохраняю очки для переноса из старой игры в новую игру
  savingPoints(el) {
    if (el > this.oldPoints) {
      this.oldPoints = el;
    }
  }
}
