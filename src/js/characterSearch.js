import GameState from './GameState';

export default function characterSearch(x, y, attack, obj) { // obj this.activeCharacte[coordinatesCharacterX][coordinatesCharacterY]
  let maxX;
  let minX;
  let maxY;
  let minY;
  let position;
  let characterFound = false;
  // условие для атаки
  minX = x - attack;
  minY = y - attack;
  if (minX < 0) {
    minX = 0;
  }
  if (minY < 0) {
    minY = 0;
  }
  maxX = x + attack;
  maxY = y + attack;
  if (maxX > 8) {
    maxX = 8;
  }
  if (maxY > 8) {
    maxY = 8;
  }
  // проверка на радиус поражения для противника
  // если игрок найден, атакуем. В противном случае ходим

  if (GameState.queue.gamer === 'enemy') {
    for (let i = minX; minX <= maxY; minX++) {
      for (let j = minY; minY <= maxY; minY++) {
        if (position[i][j] === obj) {
          // персонаж найден
          characterFound = true;
        }
      }
    }
    return characterFound;
  }
}
