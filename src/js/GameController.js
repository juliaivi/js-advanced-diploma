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
    this.clickCharterComputer = null;

    this.a = this.gamePlay.deselectCell;
    this.step = null;
    this.getAttack = false;

    // this.boardSize = this.boardSize;
  }

  init() {
    // Отрисовка поля
    this.gamePlay.drawUi(themes[this.level]);
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService

    this.teamUser = generateTeam(this.userTypes, this.level, 2); // создание команды игрока
    this.teamComputer = generateTeam(this.computerTypes, this.level, 2); // создание команды компьютера

    this.teamLocationUser = this.locationTeams(this.teamUser); // растановка команды игрока
    this.teamLocationComputer = this.locationTeams(this.teamComputer);// растановка команды компьютера

    this.allCharactersOnField = [...this.teamLocationUser, ...this.teamLocationComputer]; // Массив всех персонажей на поле
    this.charactersPositions = this.allCharactersOnField.map((character) => character.position);// Координаты всех персонажей в массиве координат
    this.gamePlay.redrawPositions(this.allCharactersOnField);// Размещение персонажей на поле
    // Вход указателя мыши в ячейку поля.
    // bind - вызывает новую функцию которая превязала себе новый контекст выполнения
    // т.е. привязала функцию this.onCellEnter и первое в скопках это аргументы либо this либо что-то вместо this
    // привязывается контекст
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this)); // В качестве аргумента передавая callback. Callback принимает всего один аргумент - индекс ячейки поля, на которой происходит событие.
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this)); // Выход указателя мыши из ячейки поля
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));// Клик мышью по ячейке поля
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
    const characterInCell = this.allCharactersOnField.find((el) => el.position === index);// делает желтую обводку и выкидывает ошибку если выбрали персонажа противника

    if (characterInCell) { // если по нему нажали
      if (!this.characterTypeUser.includes(characterInCell.character.type) && !this.activeCharacte) { // проверяем персонажа, если это персонаж противника, то выбрасываем ошибку
        GamePlay.showError('Вы не можите выбрать данного персонажа. Это персонаж противника!');
        return;
      }

      if (this.activeCharacte !== null) { // если персонаж выбран
        // выбранный персонаж не совпадает с сохранненым (смена одного персонажа на  другого) у своей команды
        if (this.activeCharacte.position !== characterInCell.position && this.characterTypeUser.includes(characterInCell.character.type)) {
          this.gamePlay.deselectCell(this.activeCharacte.position);// удаляем старого активного игрока
        }
      }

      if (this.characterTypeUser.includes(characterInCell.character.type)) {
        this.activeCharacteComputer = null;
        this.activeCharacte = characterInCell; // добавляем нового активного игрока
        this.gamePlay.selectCell(index);// делаем обводку активного игрока
      } else {
        this.clickCharterComputer = characterInCell;
      }
    }

    // Делаем шаг. Клик в пустое полеthis.clickCharterComputer === null
    if (this.activeCharacte && this.getAttack === false && this.allCharactersOnField.find((el) => el.position !== index)) { // если выбран активный персонаж
      // Если поле есть в допустимых значениях и в нем нет героя
      if (this.number !== null && !characterInCell && this.number === 1) { // если там нет игрока, оно не пустое и можно ходить
        this.gamePlay.deselectCell(this.activeCharacte.position);// снимаем обводку у активного игрока
        this.activeCharacte.position = index; // записываем новую позицию игрока
        this.gamePlay.deselectCell(index); // удаляем зеленую обводку куда можно походить
        this.activeCharacte = null;// обнулить активного персонажа
        this.clickCharterComputer = null;
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }

      this.gamePlay.redrawPositions(this.allCharactersOnField); // перерисовываем заново персонажей на поле

      return;
    }
    // Делаем атаку.
    if (this.activeCharacte && this.clickCharterComputer !== null && !this.characterTypeUser.includes(characterInCell.character.type) && this.getAttack === true) { // персонаж выделен, враг есть и это противник
      const damage = Math.max(this.activeCharacte.character.attack - this.clickCharterComputer.character.defence, this.activeCharacte.character.attack * 0.1);// расчитывания урона

      // this.gamePlay.showDamage(index, damage); // визуализации урона this.clickCharterComputer
      // ........... надо подумать нужно ли
      (async () => {
        await this.gamePlay.showDamage(index, damage);
        // ...............

        const health = this.clickCharterComputer.character.health - damage;// отнимаю от здоровья противника (наношу урон)
        this.clickCharterComputer.character.health = health;// переписываем здоровье на новое
        this.getAttack = false;
        if (this.clickCharterComputer.character.health > 0) { // если жизни еще остались
          this.gamePlay.deselectCell(this.activeCell);// удаляем красную обводку после атаки
          this.gamePlay.deselectCell(this.activeCharacte.position); // удаляем желтую обводку
          this.activeCharacte = null;// обнулить активного персонажа
          this.clickCharterComputer = null;
          this.activeCharacteComputer = null;
          this.gamePlay.redrawPositions(this.allCharactersOnField); // перерисовываем персонажей

          // ....................
          // GameState передаем управление компьютеру
          return;
        }
        if (this.clickCharterComputer.character.health <= 0) {
          // В общем массиве находим индекс персонажа который был повержен
          this.gamePlay.deselectCell(this.activeCell);// удаляем красную обводку после атаки
          this.gamePlay.deselectCell(this.activeCharacte.position); // удаляем желтую обводку
          const indexCharacter = this.allCharactersOnField.findIndex((item) => item.position === this.clickCharterComputer.position); // В общем массиве находим индекс персонажа который был повержен
          this.allCharactersOnField.splice(indexCharacter, 1);// удаляем поверженый персонаж из общего массива
          this.activeCharacte = null;// обнулить активного персонажа
          this.activeCharacteComputer = null;// обнулить наведение активного персонажа соперника
          this.clickCharterComputer = null;

          this.gamePlay.redrawPositions(this.allCharactersOnField);// перерисовываем персонажей
          // тут будет логика для компа ..........................
        }
      })();
    }
    if (this.activeCharacte && this.clickCharterComputer === null) {
      this.getAttack = false;
    }
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
      //const [coordinatesCharacterX, coordinatesCharacterY] = getCoordinates(this.activeCharacte.position, this.gamePlay.boardSize);
      // проверка индекса
      if (this.activeCell !== null && this.activeCell !== index && this.activeCharacteComputer !== index) {
        this.gamePlay.deselectCell(this.activeCell);
      }
      // получаем индекс ячейки
      this.activeCell = index;
      // // получаем координаты ячейки
      //const [coordinatesIndexX, coordinatesIndexY] = getCoordinates(this.activeCell, this.gamePlay.boardSize);
      // опеределяем атаку
      const attack = this.activeCharacte.character.radiusAttack;
      //
      if (this.activeCharacte !== null) {
        this.activeCharacteComputer = characterInCell;
      }
      this.getAttack = definitionAttack(this.activeCharacte.position, this.activeCell, this.gamePlay.boardSize, attack);
     // this.getAttack = definitionAttack(coordinatesCharacterX, coordinatesCharacterY, coordinatesIndexX, coordinatesIndexY, attack);
      // проверка на радиус поражения
      if (this.getAttack === true) {
        this.gamePlay.deselectCell(this.activeCell);
        this.gamePlay.selectCell(index, 'red');
        this.gamePlay.setCursor(cursors.crosshair);
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
        this.activeCharacteComputer = null;
        return;
      }
    }
    // Доступные шаги.Активное поле. Куда можно ходить. - окрашивание
    if (this.activeCharacte !== null && this.activeCharacteComputer === null && this.allCharactersOnField.find((el) => el.position !== index)) {
      // получаем шаг персонажа
      this.step = this.activeCharacte.character.radiusMovement;
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
      this.number = definitionSteps(coordinatesCharacterX, coordinatesCharacterY, coordinatesIndexX, coordinatesIndexY, this.step);
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
