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
import getCoordinates from './getCoordinates';
import definitionSteps from './definitionSteps';
import definitionAttack from './definitionAttack';

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
    this.number = null;

    this.a = this.gamePlay.deselectCell;

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
    // если по нему нажали
    if (characterInCell) {
      // проверяем персонажа, если это персонаж противника, то выбрасываем ошибку
      if (!this.characterTypeUser.includes(characterInCell.character.type)) {
        GamePlay.showError('Вы не можите выбрать данного персонажа. Это персонаж противника!');
        return;
      }
      // если персонаж выбран
      if (this.activeCharacte !== null) {
        // выбранный персонаж не совпадает с сохранненым (смена одного персонажа на  другого)
        if (this.activeCharacte.position !== characterInCell.position && this.characterTypeUser.includes(characterInCell.character.type)) {
          // удаляем старого активного игрока
          this.gamePlay.deselectCell(this.activeCharacte.position);
        }
      }
      // добавляем нового активного игрока
      this.activeCharacte = characterInCell;
      // делаем обводку активного игрока
      this.gamePlay.selectCell(index);
    }

    // Делаем шаг. Клик в пустое поле
    // если выбран активный персонаж
    if (this.activeCharacte) {
      // Если поле есть в допустимых значениях и в нем нет героя
      // если там нет игрока, оно не пустое и можно ходить
      if (this.number !== null && !characterInCell && this.number === 1) {
        // снимаем обводку у активного игрока
        this.gamePlay.deselectCell(this.activeCharacte.position);
        // записываем новую позицию игрока
        this.activeCharacte.position = index;
        // удаляем зеленую обводку куда можно походить
        this.gamePlay.deselectCell(index);
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }
      // перерисовываем заново персонажей на поле
      this.gamePlay.redrawPositions(this.allCharactersOnField);
    }

    //Делаем атаку.
    //showDamage, redrawPositions
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
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
      // Атака. Определяем можно ли атаковать.
      // Наведение на врага, если это другой враг, то выделение снимается
      if (this.activeCharacte !== null && this.activeCharacteComputer !== null && !this.characterTypeUser.includes(characterInCell.character.type)) {
        this.gamePlay.deselectCell(this.activeCharacteComputer.position);
      }
      // получаем координаты персонажа
      const [coordinatesCharacterX, coordinatesCharacterY] = getCoordinates(this.activeCharacte.position, this.gamePlay.boardSize);
      // проверка индекса
      if (this.activeCell !== null && this.activeCell !== index && this.activeCharacteComputer !== index) {
        this.gamePlay.deselectCell(this.activeCell);
      }
      // получаем индекс ячейки
      this.activeCell = index;
      // // получаем координаты ячейки
      const [coordinatesIndexX, coordinatesIndexY] = getCoordinates(this.activeCell, this.gamePlay.boardSize);
      // опеределяем атаку
      const attack = this.activeCharacte.character.radiusAttack;
      //
      if (this.activeCharacte !== null) {
        this.activeCharacteComputer = characterInCell;
      }
      const getAttack = definitionAttack(coordinatesCharacterX, coordinatesCharacterY, coordinatesIndexX, coordinatesIndexY, attack);
      // проверка на радиус поражения
      if (getAttack === true) {
        this.gamePlay.deselectCell(this.activeCell);
        this.gamePlay.selectCell(index, 'red');
        this.gamePlay.setCursor(cursors.crosshair);
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }
      return;
    }
    // Доступные шаги.Активное поле. Куда можно ходить. - окрашивание
    if (this.activeCharacte !== null && this.activeCharacteComputer === null && this.allCharactersOnField.find((el) => el.position !== index)) {
      // получаем шаг персонажа
      const step = this.activeCharacte.character.radiusMovement;
      // получаем координаты персонажа
      const [coordinatesCharacterX, coordinatesCharacterY] = getCoordinates(this.activeCharacte.position, this.gamePlay.boardSize);
      // проверка индекса
      if (this.activeCell !== null && this.activeCell !== index && this.activeCharacteComputer !== index) {
        this.gamePlay.deselectCell(this.activeCell);
      }
      // получаем индекс ячейки
      this.activeCell = index;
      // получаем координаты ячейки
      const [coordinatesIndexX, coordinatesIndexY] = getCoordinates(this.activeCell, this.gamePlay.boardSize);
      // определям может ли персонаж ходить
      this.number = definitionSteps(coordinatesCharacterX, coordinatesCharacterY, coordinatesIndexX, coordinatesIndexY, step);
      if (this.number === 1) {
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.selectCell(index, 'green');
      } else if (this.number === 0) {
        this.gamePlay.setCursor(cursors.notallowed);
      } else {
        this.gamePlay.setCursor(cursors.auto);
      }
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
