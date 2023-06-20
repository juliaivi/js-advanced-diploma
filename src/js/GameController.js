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
// import getCoordinates from './getCoordinates';
import definitionSteps from './definitionSteps';
import definitionAttack from './definitionAttack';
import GameState from './GameState';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.level = 1;
    // this.teamUser = [];
    // this.teamComputer = [];
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
    this.teamLocationUser = [];
    this.teamLocationComputer = [];
    this.allCharactersOnField = [...this.teamLocationUser, ...this.teamLocationComputer];
    this.charactersPositions = [];
  }

  init() {
    // Отрисовка поля
    this.gamePlay.drawUi(themes[this.level]);

    const teamUser = generateTeam(this.userTypes, this.level, 2);
    const teamComputer = generateTeam(this.computerTypes, this.level, 2);

    this.teamLocationUser = this.locationTeams(teamUser);
    this.teamLocationComputer = this.locationTeams(teamComputer);

    this.allCharactersOnField = [...this.teamLocationUser, ...this.teamLocationComputer]; // Массив всех персонажей на поле
    this.charactersPositions = this.allCharactersOnField.map((character) => character.position);// Координаты всех персонажей в массиве координат
    this.gamePlay.redrawPositions(this.allCharactersOnField);
    // Вход указателя мыши в ячейку поля.
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this)); // В качестве аргумента передавая callback. Callback принимает всего один аргумент - индекс ячейки поля, на которой происходит событие.
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this)); // Выход указателя мыши из ячейки поля
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));// Клик мышью по ячейке поля
    this.gameState = new GameState();
    // сохранила данные об игре
    GameState.from({ gamer: 'player' });
    this.gameState.activeField = themes[this.level];
    this.gameState.allCharactersOnField = this.allCharactersOnField;
    this.gameState.level = this.level;
    this.gameState.activeTeam = 'player';
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
        // if (this.activeCharacte )
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
    if (characterInCell) { // Вывод информации о персонажах
      const message = `\u{1F396}${characterInCell.character.level}\u{2694}${characterInCell.character.attack}\u{1F6E1}${characterInCell.character.defence}\u{2764}${characterInCell.character.health}`;
      this.gamePlay.showCellTooltip(message, index);
      if (this.characterTypeUser.includes(characterInCell.character.type)) { // Наведение на своего персонажа
        this.gamePlay.setCursor(cursors.pointer);
        return;
      } if (this.activeCharacte === null) {
        this.gamePlay.setCursor(cursors.auto);
        return;
      }
      this.displayAttack(index, characterInCell);
      return;
    }
    this.displayStep(index);

    this.gamePlay.setCursor(cursors.auto);
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
    //
    if (this.activeCharacte !== null) {
      this.activeCharacteComputer = obj;
    }
    this.getAttack = definitionAttack(this.activeCharacte.position, this.activeCell, this.gamePlay.boardSize, radiusattack);
    if (this.getAttack === true) { // проверка на радиус поражения
      this.gamePlay.deselectCell(this.activeCell);
      this.gamePlay.selectCell(index, 'red');
      this.gamePlay.setCursor(cursors.crosshair);
      this.activeCharacteComputer = null;
      // this.getAttack = false;
    } else {
      this.gamePlay.setCursor(cursors.notallowed);
      this.activeCharacteComputer = null;
    }
  }

  displayStep(index) {
    // Доступные шаги.Активное поле. Куда можно ходить. - окрашивание
    if (this.activeCharacte !== null && this.activeCharacteComputer === null && this.allCharactersOnField.find((el) => el.position !== index)) {
      this.step = this.activeCharacte.character.radiusMovement;// получаем шаг персонажа
      if (this.activeCell !== null && this.activeCell !== index && this.activeCharacte.position !== this.activeCell && this.activeCharacte !== null) { // && this.activeCharacteComputer !== index&& this.characterTypeUser.includes(this.activeCharacte.type) проверка индекса
        this.gamePlay.deselectCell(this.activeCell);
      }
      this.activeCell = index;// получаем индекс ячейки
      this.number = definitionSteps(this.activeCharacte.position, this.activeCell, this.gamePlay.boardSize, this.step); // определям может ли персонаж ходить
      if (this.number === 1) {
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.selectCell(index, 'green');
      } else if (this.number === 0) {
        this.gamePlay.setCursor(cursors.notallowed);
      } else {
        this.gamePlay.setCursor(cursors.auto);
      }
    }
  }

  onCellLeave(index) {
    // Убираем инфу о персонаже.
    const characterInCell = this.allCharactersOnField.find((el) => el.position === index);
    if (characterInCell) {
      this.gamePlay.hideCellTooltip(index);
    }
  }

  takeStepUser(index) {
    // Делаем шаг. Клик в пустое полеthis.clickCharterComputer === null
    if (this.activeCharacte && !this.allCharactersOnField.find((el) => el.position === index)) { // если выбран активный персонаж
      if (this.number !== null && this.number === 1) { // Если поле есть в допустимых значениях и в нем нет героя
        this.gamePlay.deselectCell(this.activeCharacte.position);// снимаем обводку у активного игрока
        this.activeCharacte.position = index; // записываем новую позицию игрока
        this.gamePlay.deselectCell(index); // удаляем зеленую обводку куда можно походить
        this.activeCharacte = null;
        this.clickCharterComputer = null;
        this.number = null;// обнулить прошлый ход
        GameState.from({ gamer: 'enemy' });
        this.gameState.activeTheme = 'enemy';
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }

      this.gamePlay.redrawPositions(this.allCharactersOnField);
      if (this.gameState.activeTheme === 'enemy') {
        this.attackEnemy();
      }
    }
  }

  attackUser(index, obj) {
    if (this.activeCharacte && this.clickCharterComputer !== null && !this.characterTypeUser.includes(obj.character.type) && this.getAttack === true) { // персонаж выделен, враг есть и это противник
      const damage = Math.max(this.activeCharacte.character.attack - this.clickCharterComputer.character.defence, this.activeCharacte.character.attack * 0.1);// расчитывания урона

      (async () => {
        await this.gamePlay.showDamage(index, damage);
        const health = this.clickCharterComputer.character.health - damage;// отнимаю от здоровья противника (наношу урон)
        this.clickCharterComputer.character.health = health;// переписываем здоровье на новое
        this.getAttack = false;
        if (this.clickCharterComputer.character.health <= 0) { // если жизней у персонажа нет - удалить
          const indexCharacter = this.teamLocationComputer.findIndex((item) => item.position === this.clickCharterComputer.position); // В общем массиве находим индекс персонажа который был повержен
          this.teamLocationComputer.splice(indexCharacter, 1);// удаляем поверженый персонаж из общего массива
        }
        this.gamePlay.deselectCell(this.activeCell);// удаляем красную обводку после атаки
        this.gamePlay.deselectCell(this.activeCharacte.position);
        this.activeCharacte = null;
        this.clickCharterComputer = null;
        this.activeCharacteComputer = null;
        this.allCharactersOnField = [...this.teamLocationUser, ...this.teamLocationComputer];
        this.gamePlay.redrawPositions(this.allCharactersOnField);
        if (this.teamLocationComputer.length > 0) { // проверка на наличие персонажей
          GameState.from({ gamer: 'enemy' });
          this.gameState.activeTheme = 'enemy';
          this.attackEnemy();
        } else {
          this.levelUp();
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
    // (this.allCharactersOnField.includes(characterInCell.character.type))
    for (const item of this.teamLocationUser) { // проверяем находится ли кто-то в области атаки, если да то атакуем
      const firstСharacterUser = item.character;
      const positionСharacterUser = item.position;
      if (definitionAttack(this.enemyPosition, positionСharacterUser, this.gamePlay.boardSize, radiusattack) === true) {
        attacked = true; // если атаковать можно

        const damage = Math.max(this.enemyСharacter.attack - firstСharacterUser.defence, this.enemyСharacter.attack * 0.1);// расчитывания урона
        (async () => {
          await this.gamePlay.showDamage(positionСharacterUser, damage); // визуализации урона......................................index
          const health = firstСharacterUser.health - damage;// отнимаю от здоровья противника (наношу урон)
          firstСharacterUser.health = health;// переписываем здоровье на новое
          // this.getAttack = false;// незнаю нужно ли тут это
          if (firstСharacterUser.health > 0) {
            this.gamePlay.redrawPositions(this.allCharactersOnField); // перерисовываем персонажей
            GameState.from({ gamer: 'user' });
            this.gameState.activeTheme = 'user';
            return;
          }
          if (firstСharacterUser.health <= 0) {
            const indexCharacter = this.teamLocationUser.findIndex((el) => el.position === positionСharacterUser); // В общем массиве находим индекс персонажа который был повержен
            this.teamLocationUser.splice(indexCharacter, 1);// удаляем поверженый персонаж из общего массива
            this.allCharactersOnField = [...this.teamLocationUser, ...this.teamLocationComputer];
            this.gamePlay.redrawPositions(this.allCharactersOnField);// перерисовываем персонажей
            if (this.teamLocationUser.length !== 0) {
              GameState.from({ gamer: 'user' });
              this.gameState.activeTheme = 'user';
              // return;
            } else {
              alert('Game over!!');
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
    this.gamePlay.redrawPositions(this.allCharactersOnField); // перерисовываем заново персонажей на поле
    this.number = null;// обнулить прошлый ход
    GameState.from({ gamer: 'user' });
    this.gameState.activeTheme = 'user';
  }

  // Поднимаем уровень и выполняем сопутствующие действия
  // levelUp() {
  //   this.gameState.userPoints += 1;
  //   this.gameState.level += 1;
  //   // увеличить жизни, защиту и урон
  //   this.teamUser = generateTeam(this.userTypes, this.gameState.level, 2); // создание команды игрока
  //   this.teamComputer = generateTeam(this.computerTypes, this.gameState.level, 2); // создание команды компьютера

  //   this.teamLocationUser = this.locationTeams(this.teamUser); // растановка команды игрока
  //   this.teamLocationComputer = this.locationTeams(this.teamComputer);// растановка команды компьютера
  //   // незнаю нужно  ли  this.allCharactersOnField и this.charactersPositions или оно само перикинится на верх
  //   this.allCharactersOnField = [...this.teamLocationUser, ...this.teamLocationComputer]; // Массив всех персонажей на поле
  //   this.charactersPositions = this.allCharactersOnField.map((character) => character.position);// Координаты всех персонажей в массиве координат
  //   this.gamePlay.redrawPositions(this.allCharactersOnField);// Размещение персонажей на поле
  //   // заново рандомно сформировать и раставить команды

  //   GameState.from({ gamer: 'user' });
  //   this.gameState.activeTheme = 'user';
  // }
}
