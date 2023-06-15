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

    // this.boardSize = this.boardSize;
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
    const generateUserPosition = this.gamePlay.boardSize * (indexPosition % this.gamePlay.boardSize) + Math.floor(indexPosition / this.gamePlay.boardSize);
    return generateUserPosition;
  }

  // позиция компьютера
  positionComputer(max) {
    const indexPosition = Math.round(Math.random() * max);
    const generateComputerPosition = this.gamePlay.boardSize * (indexPosition % this.gamePlay.boardSize) + Math.ceil(this.gamePlay.boardSize - 1 - indexPosition / this.gamePlay.boardSize);
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
    // границы поля для хотьбы
    let maxX;
    let minX;
    let maxY;
    let minY;
    // проверка есть ли персанаж в этой клетке
    const characterInCell = this.allCharactersOnField.find((el) => el.position === index);
    // Вывод информации о персонажах
    if (characterInCell) {
      const message = `\u{1F396}${characterInCell.character.level}\u{2694}${characterInCell.character.attack}\u{1F6E1}${characterInCell.character.defence}\u{2764}${characterInCell.character.health}`;
      this.gamePlay.showCellTooltip(message, index);
      // Наведение на своего персонажа
      if (this.characterTypeUser.includes(characterInCell.character.type)) {
        this.gamePlay.setCursor(cursors.pointer);
        return;
      } if (this.activeCharacte === null) {
        this.gamePlay.setCursor(cursors.auto);
        return;
      }
      // Наведение на врага, если это другой враг, то выделение снимается
      if (this.activeCharacte !== null && this.activeCharacteComputer !== null && !this.characterTypeUser.includes(characterInCell.character.type)) {
        this.gamePlay.deselectCell(this.activeCharacteComputer.position);
        // получаем координаты персонажа...........................вернуться и подумать где лучше это прописать и сократить код (номер 5)
        this.coordinatesCharacterX = this.activeCharacte.position % this.gamePlay.boardSize;
        this.coordinatesCharacterY = Math.floor(this.activeCharacte.position / this.gamePlay.boardSize);
      }
      // получаем координаты персонажа
      // this.coordinatesCharacterX = this.activeCharacte.position % this.gamePlay.boardSize;
      // this.coordinatesCharacterY = Math.floor(this.activeCharacte.position / this.gamePlay.boardSize);

      // проверка индекса
      if (this.activeCell !== null && this.activeCell !== index && this.activeCharacteComputer !== index) {
        this.gamePlay.deselectCell(this.activeCell);
      }
      // получаем индекс ячейки
      this.activeCell = index;
      // получаем координаты ячейки
      this.coordinatesIndexX = this.activeCell % this.gamePlay.boardSize;
      this.coordinatesIndexY = Math.floor(this.activeCell / this.gamePlay.boardSize);
      // опеределяем атаку
      const attack = this.activeCharacte.character.radiusAttack;
      // условие для атаки
      minX = this.coordinatesCharacterX - attack;
      minY = this.coordinatesCharacterY - attack;
      if (minX < 0) {
        minX = 0;
      }
      if (minY < 0) {
        minY = 0;
      }
      maxX = this.coordinatesCharacterX + attack;
      maxY = this.coordinatesCharacterY + attack;
      if (maxX > 8) {
        maxX = 8;
      }
      if (maxY > 8) {
        maxY = 8;
      }
      if (this.activeCharacte !== null) {
        this.activeCharacteComputer = characterInCell;
      }
      // проверка на радиус поражения
      if (maxX >= this.coordinatesIndexX && this.coordinatesIndexX >= minX && maxY >= this.coordinatesIndexY && this.coordinatesIndexY >= minY && this.activeCharacte !== null) {
        this.gamePlay.deselectCell(this.activeCell);
        this.gamePlay.selectCell(index, 'red');
        this.gamePlay.setCursor(cursors.crosshair);
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }
      return;
    }
    // Активное поле. Куда можно ходить. - окрашивание
    if (this.activeCharacte !== null && this.activeCharacteComputer === null && this.allCharactersOnField.find((el) => el.position !== index)) {
      const displacementField = [
        [1, 0, 0, 0, 1, 0, 0, 0, 1],
        [0, 1, 0, 0, 1, 0, 0, 1, 0],
        [0, 0, 1, 0, 1, 0, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 0, 1, 0, 1, 0, 0],
        [0, 1, 0, 0, 1, 0, 0, 1, 0],
        [1, 0, 0, 0, 1, 0, 0, 0, 1],
      ];

      // получаем координаты персонажа
      this.coordinatesCharacterX = this.activeCharacte.position % this.gamePlay.boardSize;
      this.coordinatesCharacterY = Math.floor(this.activeCharacte.position / this.gamePlay.boardSize);
      // проверка индекса
      if (this.activeCell !== null && this.activeCell !== index && this.activeCharacteComputer !== index) {
        this.gamePlay.deselectCell(this.activeCell);
      }
      // получаем шаг персонажа
      const step = this.activeCharacte.character.radiusMovement;
      // получаем индекс ячейки
      this.activeCell = index;
      // получаем координаты ячейки
      this.coordinatesIndexX = this.activeCell % this.gamePlay.boardSize;
      this.coordinatesIndexY = Math.floor(this.activeCell / this.gamePlay.boardSize);
      // условие для шага
      if (step === 1) {
        minX = 3;
        maxX = 5;
        minY = 3;
        maxY = 5;
      }
      if (step === 2) {
        minX = 2;
        maxX = 6;
        minY = 2;
        maxY = 6;
      }
      if (step === 4) {
        minX = 0;
        maxX = 8;
        minY = 0;
        maxY = 8;
      }
      // расчеты сдвига координт для хотьбы
      const coordinateShiftX = 4 - (this.coordinatesCharacterX - this.coordinatesIndexX);
      const coordinateShiftY = 4 - (this.coordinatesCharacterY - this.coordinatesIndexY);
      if (maxX >= coordinateShiftX && coordinateShiftX >= minX && maxY >= coordinateShiftY && coordinateShiftY >= minY) {
        if (displacementField[coordinateShiftX][coordinateShiftY] === 1) {
          this.gamePlay.setCursor(cursors.pointer);
          this.gamePlay.selectCell(index, 'green');
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
        return;
      }
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
