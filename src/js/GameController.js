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
import GameState from './GameState';

import definitionSteps from './definitionSteps';
import definitionAttack from './definitionAttack';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.userTypes = [Bowman, Swordsman, Magician];
    this.computerTypes = [Vampire, Daemon, Undead];
    this.characterTypeUser = ['bowman', 'swordsman', 'magician'];
    this.level = 1;

    this.teamLocationUser = [];
    this.activeCharacte = null;
    this.activeCharacteComputer = null;
    this.activeCell = null;
    this.number = null;
    this.clickCharterComputer = null;
    this.step = null;
    this.teamUser = [];
    this.teamComputer = [];
    this.teamLocationUser = [];
    this.teamLocationComputer = [];
    // this.allCharactersOnField = [...this.teamLocationUser, ...this.teamLocationComputer];
    this.charactersPositions = [];
  }

  init() {
    this.newGame();

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this)); // В качестве аргумента передавая callback. Callback принимает всего один аргумент - индекс ячейки поля, на которой происходит событие.
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this)); // Выход указателя мыши из ячейки поля
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));// Клик мышью по ячейке поля

    // нажатие на кнопки
    this.gamePlay.addNewGameListener(this.newGame.bind(this));
    this.gamePlay.addSaveGameListener(this.saveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.loadGame.bind(this));
  }

  newGame() {
    this.getAttack = false;
    this.gameStop = false;
    // Отрисовка поля
    this.gameState = new GameState();
    this.level = 1;
    this.gamePlay.drawUi(themes[this.level]);
    const teamUser = generateTeam(this.userTypes, this.level, 2);
    const teamComputer = generateTeam(this.computerTypes, this.level, 2);

    this.teamLocationUser = this.locationTeams(teamUser);
    this.teamLocationComputer = this.locationTeams(teamComputer);

    this.allCharactersOnField = [...this.teamLocationUser, ...this.teamLocationComputer]; // Массив всех персонажей на поле
    this.charactersPositions = this.allCharactersOnField.map((character) => character.position);// Координаты всех персонажей в массиве координат
    this.gamePlay.redrawPositions(this.allCharactersOnField);

    // сохранила данные об игре
    this.gameState.activeThemes = themes[this.level];
    this.gameState.teamLocationUser = this.teamLocationUser;
    this.gameState.teamLocationComputer = this.teamLocationComputer;
    this.gameState.level = this.level;
    this.gameState.activeTeame = 'player';
  }

  // ....Отрисовка команд персонажей
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
    const beltArray = []; // временная переменныя которая не дает записать одинаковую позицию
    let position;

    do {
      for (const item of team) {
        if (this.characterTypeUser.includes(item.type)) {
          position = this.positionUser(this.gamePlay.boardSize * 2 - 1);
        } else {
          position = this.positionComputer(this.gamePlay.boardSize * 2 - 1);
        }

        if (beltArray.includes(position)) {
          break;
        } else {
          beltArray.push(position);
          positionTime.push(new PositionedCharacter(item, position));
        }
      }
    }
    while (team.length !== positionTime.length);

    return positionTime;
  }

  onCellClick(index) {
    // блокировка поля
    if (this.gameStop) {
      this.gamePlay.setCursor('auto');
      this.gamePlay.deselectCell(index);
      return;
    }
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

    this.takeStepUser(index);
    this.attackUser(index, characterInCell);
  }

  onCellEnter(index) {
    const characterInCell = this.allCharactersOnField.find((el) => el.position === index);// проверка есть ли персанаж в этой клетке
    // блокировка поля
    if (this.gameStop) {
      this.gamePlay.setCursor('auto');
      this.gamePlay.deselectCell(index);
      return;
    }

    if (characterInCell) { // Вывод информации о персонажах
      const message = `\u{1F396}${characterInCell.character.level}\u{2694}${characterInCell.character.attack}\u{1F6E1}${characterInCell.character.defence}\u{2764}${characterInCell.character.health}`;
      this.gamePlay.showCellTooltip(message, index);
      if (this.characterTypeUser.includes(characterInCell.character.type)) { // Наведение на своего персонажа
        this.gamePlay.setCursor(cursors.pointer);
        return;
      }

      if (this.activeCharacte === null) {
        this.gamePlay.setCursor(cursors.auto);
        return;
      }
      this.displayAttack(index, characterInCell);
      return;
    }
    this.displayStep(index);
  }

  displayAttack(index, obj) {
    if (this.activeCharacte !== null && this.activeCharacteComputer !== null && !this.characterTypeUser.includes(obj.character.type)) {
      this.gamePlay.deselectCell(this.activeCharacteComputer.position);
    }

    if (this.activeCell !== null && this.activeCell !== index && this.activeCharacteComputer !== index) { // проверка индекса
      this.gamePlay.deselectCell(this.activeCell);
    }
    this.activeCell = index;// получаем индекс ячейки
    const radiusattack = this.activeCharacte.character.radiusAttack;// опеределяем атаку

    if (this.activeCharacte !== null) {
      this.activeCharacteComputer = obj;
    }
    this.getAttack = definitionAttack(this.activeCharacte.position, this.activeCell, this.gamePlay.boardSize, radiusattack);

    if (this.getAttack === true && this.activeCharacte.position !== this.activeCell) { // проверка на радиус поражения
      this.gamePlay.deselectCell(this.activeCell);
      this.gamePlay.selectCell(index, 'red');
      this.gamePlay.setCursor(cursors.crosshair);
      this.activeCharacteComputer = null;
    } else {
      this.gamePlay.setCursor(cursors.notallowed);
      this.activeCharacteComputer = null;
    }
  }

  displayStep(index) {
    // Доступные шаги.Активное поле. Куда можно ходить. - окрашивание
    if (this.activeCharacte !== null && this.activeCharacteComputer === null && this.allCharactersOnField.find((el) => el.position !== index)) {
      this.step = this.activeCharacte.character.radiusMovement;// получаем шаг персонажа

      if (this.activeCell !== null && this.activeCell !== index && this.activeCharacte.position !== this.activeCell) { // проверка индекса
        this.gamePlay.deselectCell(this.activeCell);
      }

      this.activeCell = index;// получаем индекс ячейки
      this.number = definitionSteps(this.activeCharacte.position, this.activeCell, this.gamePlay.boardSize, this.step); // определям может ли персонаж ходить

      if (this.number === 1) {
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.selectCell(index, 'green');
      } else if (this.number === 0) {
        this.gamePlay.setCursor(cursors.notallowed);
        return;
      }

      this.gamePlay.setCursor(cursors.auto);
    }
  }

  onCellLeave(index) {
    // блокировка поля
    if (this.gameStop) {
      this.gamePlay.setCursor('auto');
      this.gamePlay.deselectCell(index);
      return;
    }
    // Убираем инфу о персонаже.
    const characterInCell = this.allCharactersOnField.find((el) => el.position === index);

    if (characterInCell) {
      this.gamePlay.hideCellTooltip(index);
    }
  }

  takeStepUser(index) {
    // Делаем шаг. Клик в пустое поле
    if (this.activeCharacte && !this.allCharactersOnField.find((el) => el.position === index)) { // если выбран активный персонаж
      if (this.number !== null && this.number === 1) { // Если поле есть в допустимых значениях и в нем нет героя
        this.gamePlay.deselectCell(this.activeCharacte.position);// снимаем обводку у активного игрока
        this.activeCharacte.position = index; // записываем новую позицию игрока
        this.gamePlay.deselectCell(index); // удаляем зеленую обводку куда можно походить
        this.activeCharacte = null;
        this.clickCharterComputer = null;
        this.number = null;// обнулить прошлый ход
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
        return;
      }
      this.gameState.teamLocationComputer = this.teamLocationComputer;
      this.gameState.teamLocationUser = this.teamLocationUser;
      this.gamePlay.redrawPositions(this.allCharactersOnField);
      this.gameState.activeTeame = 'enemy';

      if (this.gameState.activeTeame === 'enemy' && this.teamLocationComputer.length > 0) {
        this.attackEnemy();
      }
    }
  }

  attackUser(index) {
    if (this.activeCharacte && this.clickCharterComputer !== null && this.getAttack === true) { // персонаж выделен, враг есть и это противник
      const damage = Math.max(this.activeCharacte.character.attack - this.clickCharterComputer.character.defence, this.activeCharacte.character.attack * 0.1);

      (async () => {
        await this.gamePlay.showDamage(index, damage);
        const health = (this.clickCharterComputer.character.health - damage).toFixed(1);
        this.clickCharterComputer.character.health = health;

        if (this.clickCharterComputer.character.health <= 0) { 
          const indexCharacter = this.teamLocationComputer.findIndex((item) => item.position === this.clickCharterComputer.position); // В общем массиве находим индекс персонажа который был повержен
          this.teamLocationComputer.splice(indexCharacter, 1);
        }
        this.gamePlay.deselectCell(this.activeCell);// удаляем красную обводку после атаки
        this.gamePlay.deselectCell(this.activeCharacte.position);
        this.allCharactersOnField = [...this.teamLocationUser, ...this.teamLocationComputer];
        this.gameState.allCharactersOnField = this.allCharactersOnField;
        this.gameState.teamLocationComputer = this.teamLocationComputer;
        this.gameState.teamLocationUser = this.teamLocationUser;
        this.gamePlay.redrawPositions(this.allCharactersOnField);
        this.getAttack = false;
        this.activeCharacte = null;
        this.clickCharterComputer = null;
        this.activeCharacteComputer = null;

        if (this.teamLocationComputer.length > 0) {
          this.gameState.activeTeame = 'enemy';
          this.attackEnemy();
        }

        if (this.teamLocationComputer.length === 0) {
          await this.levelUp();
        }
      })();

      if (this.activeCharacte && this.clickCharterComputer === null) {
        this.getAttack = false;
      }
    }
  }

  attackEnemy() {
    this.randomIndex = Math.floor(Math.random() * this.teamLocationComputer.length); // случайный индекс для персонажа
    this.enemyСharacter = this.teamLocationComputer[this.randomIndex].character; // получили персонаж
    const radiusattack = this.enemyСharacter.radiusAttack;
    this.enemyPosition = this.teamLocationComputer[this.randomIndex].position;
    let attacked = false;
    for (const item of this.teamLocationUser) { // проверяем находится ли кто-то в области атаки, если да то атакуем
      const firstСharacterUser = item.character;
      const positionСharacterUser = item.position;

      if (definitionAttack(this.enemyPosition, positionСharacterUser, this.gamePlay.boardSize, radiusattack) === true) {
        attacked = true;

        const damage = Math.max(this.enemyСharacter.attack - firstСharacterUser.defence, this.enemyСharacter.attack * 0.1);
        (async () => {
          await this.gamePlay.showDamage(positionСharacterUser, damage); // визуализации урона......................................index
          const health = (firstСharacterUser.health - damage).toFixed(1);
          firstСharacterUser.health = health;

          if (firstСharacterUser.health > 0) {
            this.gameState.teamLocationComputer = this.teamLocationComputer;
            this.gameState.teamLocationUser = this.teamLocationUser;
            this.gamePlay.redrawPositions(this.allCharactersOnField);
            this.gameState.activeTeame = 'user';
            return;
          }

          if (firstСharacterUser.health <= 0) {
            const indexCharacter = this.teamLocationUser.findIndex((el) => el.position === positionСharacterUser); // В общем массиве находим индекс персонажа который был повержен
            this.teamLocationUser.splice(indexCharacter, 1);
            this.allCharactersOnField = [...this.teamLocationUser, ...this.teamLocationComputer];
            this.gameState.allCharactersOnField = this.allCharactersOnField;
            this.gameState.teamLocationComputer = this.teamLocationComputer;
            this.gameState.teamLocationUser = this.teamLocationUser;
            this.gamePlay.redrawPositions(this.allCharactersOnField);

            if (this.teamLocationUser.length !== 0) {
              this.gameState.activeTeame = 'user';
            } else {
              this.gameStop = true;
              alert('Game over!');
            }
          }
        })();
      }
      if (attacked === true) {
        break;
      }
    }
    if (attacked === false) {
      this.takeStepEnemy();
    }
    attacked = false;
  }

  takeStepEnemy() {
    let stepsEnemy;
    const step = this.enemyСharacter.radiusMovement;
    do {
      this.randomIndexPosition = Math.floor(Math.random() * (this.gamePlay.boardSize * this.gamePlay.boardSize - 1));
      if (!this.allCharactersOnField.find((el) => el.position === this.randomIndexPosition)) {
        stepsEnemy = definitionSteps(this.enemyPosition, this.randomIndexPosition, this.gamePlay.boardSize, step);
      }
    } while (stepsEnemy !== 1);
    this.enemyPosition = this.randomIndexPosition;
    this.teamLocationComputer[this.randomIndex].position = this.randomIndexPosition;
    this.gameState.teamLocationComputer = this.teamLocationComputer;
    this.gameState.teamLocationUser = this.teamLocationUser;
    this.gamePlay.redrawPositions(this.allCharactersOnField);
    this.number = null;// обнулить прошлый ход
    this.gameState.activeTeame = 'user';
  }

  // Поднимаем уровень и выполняем сопутствующие действия
  levelUp() {
    const remainingСharacters = [];
    this.newTeamUser = [];
    let newElement = [];

    // if (this.gameState.level > 4 || this.teamLocationUser.length === 0 || this.teamLocationComputer.length === 0) {
    //   this.gameStop = true;
    // }
    if (this.level > 4) {
      this.gameStop = true;
    }

    this.level += 1;

    if (this.gameState.numberPlayers < 6) {
      this.gameState.numberPlayers += 1;
    } else {
      this.gameState.numberPlayers = 6;
    }

    const characterDifference = this.gameState.numberPlayers - this.teamLocationUser.length;
    if (characterDifference < this.gameState.numberPlayers) {
      this.newTeamUser = generateTeam(this.userTypes, this.gameState.level, characterDifference);
    }

    this.teamLocationUser.forEach((el) => {
      if (!this.userTypes.includes(el.character)) {
        const {
          type, level, attack, defence, health, radiusMovement, radiusAttack,
        } = el.character;
        do {
          newElement = generateTeam(this.userTypes, this.gameState.level, 1);
        } while (newElement.type === type);
        newElement.level = level;
        newElement.attack = attack;
        newElement.defence = defence;
        newElement.health = health;
        newElement.radiusMovement = radiusMovement;
        newElement.radiusAttack = radiusAttack;
        remainingСharacters.push(...newElement);
      } else {
        remainingСharacters.push(el.character);
      }
    });
    this.teamUser = [...remainingСharacters, ...this.newTeamUser];
    this.teamComputer = generateTeam(this.computerTypes, this.gameState.level, this.gameState.numberPlayers);

    this.teamLocationUser = this.locationTeams(this.teamUser);
    this.teamLocationComputer = this.locationTeams(this.teamComputer);

    // повышение характеристик
    this.gameState.userPoints += 1;// засчитывается победа игроку
    this.gameState.level += 1;// повышение уровня игры
    this.gameState.savingPoints(this.gameState.userPoints);
    // незнаю нужно  ли  this.allCharactersOnField или оно само перикинится на верх
    this.allCharactersOnField = [...this.teamLocationUser, ...this.teamLocationComputer]; // Массив всех персонажей на поле

    // повышаю параметры и у противников
    for (const item of this.allCharactersOnField) {
      item.character.attack = Math.floor(Math.max(item.character.attack, item.character.attack * (80 + item.character.health) / 100));
      item.character.defence = Math.floor(Math.max(item.character.defence, item.character.defence * (80 + item.character.health) / 100));
      item.character.health = (item.character.health + 80 >= 100) ? 100 : item.character.health + 80;
    }

    this.charactersPositions = this.allCharactersOnField.map((character) => character.position);// Координаты всех персонажей в массиве координат
    this.gamePlay.redrawPositions(this.allCharactersOnField);

    this.gameState.activeTeame = 'user';
    this.gamePlay.drawUi(themes[this.level]);
    this.gamePlay.redrawPositions(this.allCharactersOnField);
    this.gameStop = false;
  }

  saveGame() {
    this.stateService.save(this.gameState);
  }

  // загрузка игры
  loadGame() {
    this.gameStop = false;
    const result = this.stateService.load();
    this.gameState.userPoints = result.userPoints;// очки
    this.teamLocationUser = result.teamLocationUser;
    this.teamLocationComputer = result.teamLocationComputer;
    this.allCharactersOnField = [...this.teamLocationUser, ...this.teamLocationComputer];
    this.level = result.level;
    this.activeTeame = result.activeTeame; // активная команда

    this.gamePlay.drawUi(result.activeThemes); // из результата возьмем активное поле
    this.gamePlay.redrawPositions(this.allCharactersOnField);
  }
}
