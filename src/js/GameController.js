import Swordsman from './characters/Swordsman';
import Bowman from './characters/Bowman';
import Magician from './characters/Magician';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import { generateTeam } from './generators';
import GamePlay from './GamePlay';
import cursors from './cursors';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.level = 1;
    this.teamUser = [];
    this.teamComputer = [];
    this.teamLocationUser = [];
    this.characterTypeUser = ['bowman', 'swordsman', 'magician'];
    this.activeCharacte = null;
    this.activeCharacteComputer = null;
    this.activeCell = null;
    this.userTypes = [Bowman, Swordsman, Magician];
    this.computerTypes = [Vampire, Daemon, Undead];
  }

  init() {
    // Отрисовка поля
    this.gamePlay.drawUi(themes[this.level]);
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    // создание команды игрока
    this.teamUser = generateTeam(this.userTypes, this.level, 2);
    // создание команды компьютера
    this.teamComputer = generateTeam(this.computerTypes, this.level, 2);
    // растановка команды игрока
    this.teamLocationUser = this.locationTeams(this.teamUser);
    // растановка команды компьютера
    this.teamLocationComputer = this.locationTeams(this.teamComputer);
    // Массив всех персонажей на поле
    this.allCharactersOnField = [...this.teamLocationUser, ...this.teamLocationComputer];
    // Координаты всех персонажей в массиве координат
    this.charactersPositions = this.allCharactersOnField.map((character) => character.position);
    // Размещение персонажей на поле
    this.gamePlay.redrawPositions(this.allCharactersOnField);
    // Вход указателя мыши в ячейку поля.
    // bind - вызывает новую функцию которая превязала себе новый контекст выполнения
    // т.е. привязала функцию this.onCellEnter и первое в скопках это аргументы либо this либо что-то вместо this
    // привязывается контекст
    // В качестве аргумента передавая callback. Callback принимает всего один аргумент - индекс ячейки поля, на которой происходит событие.
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    // Выход указателя мыши из ячейки поля
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    // Клик мышью по ячейке поля
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  // Отрисовка команд персонажей
  // позиция игрока
  positionUser(max) {
    const indexPosition = Math.round(Math.random() * max);
    const generateUserPosition = 8 * (indexPosition % 8) + Math.floor(indexPosition / 8);
    return generateUserPosition;
  }

  // позиция компьютера
  positionComputer(max) {
    const indexPosition = Math.round(Math.random() * max);
    const generateComputerPosition = 8 * (indexPosition % 8) + Math.ceil(8 - 1 - indexPosition / 8);
    return generateComputerPosition;
  }

  // раставление и отрисова команды
  locationTeams(team) {
    const positionTime = [];
    const positionL = [];
    let position;
    // const characterTypeUser = ['bowman', 'swordsman', 'magician'];

    do {
      for (const item of team) {
        if (this.characterTypeUser.includes(item.type)) {
          position = this.positionUser(15);
        } else {
          position = this.positionComputer(15);
        }
        if (positionL.includes(position)) {
          break;
        } else {
          positionL.push(position);
          positionTime.push(new PositionedCharacter(item, position));
        }
      }
    }
    while (team.length !== positionTime.length);

    return positionTime;
  }

  onCellClick(index) {
    // TODO: react to click
    // делает желтую обводку и выкидывает ошибку если выбрали персонажа противника
    const characterInCell = this.allCharactersOnField.find((el) => el.position === index);
    if (characterInCell) {
      if (!this.characterTypeUser.includes(characterInCell.character.type)) {
        GamePlay.showError('Вы не можите выбрать данного персонажа. Это персонаж противника!');
        return;
      }

      if (this.activeCharacte !== null) {
        if (this.activeCharacte.position !== characterInCell.position) {
          this.gamePlay.deselectCell(this.activeCharacte.position);
        }
      }
      this.activeCharacte = characterInCell;
      this.gamePlay.selectCell(index);
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    // проверка есть ли персанаж в этой клетке
    const characterInCell = this.allCharactersOnField.find((el) => el.position === index);
    // Вывод информации о персонаже
    if (characterInCell) {
      const message = `\u{1F396}${characterInCell.character.level}\u{2694}${characterInCell.character.attack}\u{1F6E1}${characterInCell.character.defence}\u{2764}${characterInCell.character.health}`;
      this.gamePlay.showCellTooltip(message, index);
      // Наведение на своего персонажа
      if (this.characterTypeUser.includes(characterInCell.character.type)) {
        this.gamePlay.setCursor(cursors.pointer);
        return;
      }
      // Наведение на врага
      if (this.activeCharacte !== null && this.activeCharacteComputer !== null && !this.characterTypeUser.includes(characterInCell.character.type)) {
        this.gamePlay.deselectCell(this.activeCharacteComputer.position);
      }

      if (this.activeCharacte !== null) {
        this.activeCharacteComputer = characterInCell;
        this.gamePlay.deselectCell(this.activeCell);
        this.gamePlay.selectCell(index, 'red');
        this.gamePlay.setCursor(cursors.crosshair);
        return;
      }
    }
    // Активное поле. Куда можно ходить.
    if (this.activeCharacte !== null && this.allCharactersOnField.find((el) => el.position !== index && this.activeCharacteComputer === null)) {
      if (this.activeCell !== null && this.activeCell !== index && this.activeCharacteComputer !== index) {
        this.gamePlay.deselectCell(this.activeCell);
      }
      this.activeCell = index;
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.selectCell(index, 'green');
      return;
    }
    this.gamePlay.setCursor(cursors.auto);
  }

  onCellLeave(index) {
  // TODO: react to mouse leave
    // Убираем инфу о персонаже. Почему оно работает и без этого кода?(нужно будет узнать у учителя)
    const characterInCell = this.allCharactersOnField.find((el) => el.position === index);
    if (characterInCell) {
      this.gamePlay.hideCellTooltip(index);
    }
  }
}
