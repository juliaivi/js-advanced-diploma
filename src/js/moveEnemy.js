// import definitionAttack from './definitionAttack';
// import definitionSteps from './definitionSteps';
// import GameState from './GameState';
// // import GamePlay from './GamePlay';
// // логика компа
// // (this.teamComputer)this.teamLocationComputer,this.teamUser,this.gamePlay.boardSize, this.gamePlay.showDamage, this.gamePlay.redrawPositions,this.allCharactersOnField
// export default function moveEnemy(obj, obj1, el, el1, el2, obj3) {
//   // let gamePlay = gamePlay;
//   const randomIndex = Math.floor(Math.random() * obj.length); // случайный индекс
//   const enemyСharacter = obj[randomIndex].character; // получили персонаж
//   const step = enemyСharacter.radiusMovement; // получили максимального шага
//   const radiusattack = enemyСharacter.radiusAttack;// получили максимального радиуса атаки
//   // let attack = enemyСharacter.attack;
//   const enemyPosition = obj[randomIndex].position;// определили позицию персонажа

//   for (const item of obj1) { // проверяем находится ли кто-то в области атаки, если да то атакуем
//     const firstСharacter = item.character;// получиили объект
//     const positionСharacter = item.position;
//     // let positionTeamUser = obj1.map((character) => character === item)
//     // userPosition = obj1[oneItem].position;
//     if (definitionAttack(enemyPosition, positionСharacter, el, radiusattack) === true) { // если атаковать можно
//       const damage = Math.max(enemyСharacter.attack - firstСharacter.defence, enemyСharacter.attack * 0.1);// расчитывания урона
//       (async () => {
//         await el1(positionСharacter, damage); // визуализации урона......................................index
//         const health = firstСharacter.health - damage;// отнимаю от здоровья противника (наношу урон)
//         firstСharacter.health = health;// переписываем здоровье на новое
//         // this.getAttack = false;// незнаю нужно ли тут это
//         if (firstСharacter.health > 0) {
//           el2(obj3); // перерисовываем персонажей
//           GameState.from({ gamer: 'user' });
//           return;
//         }
//         if (firstСharacter.health <= 0) {
//           const indexCharacter = obj3.findIndex((el) => el.position === positionСharacter); // В общем массиве находим индекс персонажа который был повержен
//           obj3.splice(indexCharacter, 1);// удаляем поверженый персонаж из общего массива
//           el2(obj3);// перерисовываем персонажей
//           if (obj1.length !== 0) {
//             GameState.from({ gamer: 'user' });
//           }
//           alert('Game over!!');
//         }
//       })();
//     }
//   }

//   // если атаковать нельзя делаем ход
//   let randomIndexPosition = Math.floor(Math.random() * (el * el - 1));
//   if (definitionSteps(enemyPosition, randomIndexPosition, el, step) === 1) {
//     enemyСharacter.position = randomIndexPosition; // записываем новую позицию
//     el2(obj3); // перерисовываем заново персонажей на поле
//     GameState.from({ gamer: 'user' });
//   } else {
//     randomIndexPosition = Math.floor(Math.random() * el.length);
//   }
// }
