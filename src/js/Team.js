/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */
// import { generateTeam } from './generators';

// import Swordsman from './characters/Swordsman';
// import Bowman from './characters/Bowman';
// import Magician from './characters/Magician';
// import Daemon from './characters/Daemon';
// import Undead from './characters/Undead';
// import Vampire from './characters/Vampire';

export default class Team {
  // TODO: write your logic here
  constructor() {
    // this.userTeam = [];
    // this.computerTeam = [];
    this.characters = [];
    // const userTypes = [Bowman, Swordsman, Magician];
    // const computerTypes = [Vampire, Daemon, Undead];
  }
  // ко второму варианту
  // const userTypes = [Bowman, Swordsman, Magician];
  // const computerTypes = [Vampire, Daemon, Undead];

  // когда не знаешь к кой команде принадлежыт данные типы allowedTypes
  // createTeam(allowedTypes, maxLevel, characterCount) {
  //   const arrayTypes = allowedTypes.find((el) => el === 'Magician' || el === 'Swordsman' || el === 'Bowman');
  //   if (arrayTypes !== undefined) {
  //     this.userTeam.push(generateTeam(allowedTypes, maxLevel, characterCount));
  //   }
  //   this.computerTeam.push(generateTeam(allowedTypes, maxLevel, characterCount));
  // }

  // или второй метод где разбивается на два метода. Когда знаешь к какой команде относится allowedTypes. Но тогда необходимо будет сформировать где-то макет команд
  // createComputerTeam(allowedTypes, maxLevel, characterCount) {
  //   this.userTeam.push(generateTeam(allowedTypes, maxLevel, characterCount));
  // }

  // createUserTeam(allowedTypes, maxLevel, characterCount) {
  //   this.computerTeam.push(generateTeam(allowedTypes, maxLevel, characterCount));
  // }
  // либо просто саздавать и хранить команду. третий вариант
  createTeam(characters) {
    this.characters.push(characters);
    return this.characters;
  }
}
