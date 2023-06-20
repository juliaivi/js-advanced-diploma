export default class GameState {
  constructor() {
    this.userPoints = 0; // счет игрока
    this.enemyPoints = 0;// счет противника
    this.level = 1; // уровень игры
    this.allCharactersOnField = [];
    this.teamUser = null;// команда игрока
    this.teamEnemy = null; // команда противника
    this.activeField = null;
    this.activeTeam = null; // активная команда
    this.charactersPositions = null; // позиции персонажей
  }

  static from(object) {
    // TODO: create object
    this.queue = object; // храниение хода
    return null;
  }
}
