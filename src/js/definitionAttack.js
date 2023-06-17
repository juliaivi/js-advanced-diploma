import getCoordinates from './getCoordinates';

export default function definitionAttack(obj, obj1, elem, attack) {
  const [coordinatesCharacterX, coordinatesCharacterY] = getCoordinates(obj, elem);
  const [coordinatesIndexX, coordinatesIndexY] = getCoordinates(obj1, elem);

  const differenceX = coordinatesIndexX - coordinatesCharacterX;
  const differenceY = coordinatesIndexY - coordinatesCharacterY;
  if (differenceX <= attack && differenceY <= attack) {
    return true;
  }
  return false;
}
// еще один вариант (старый вариант)
// export default function definitionAttack(x, y, el, el1, attack) {
//   const differenceX = el - x;
//   const differenceY = el1 - y;
//   if (differenceX < attack && differenceY < attack) {
//     return true;
//   }
//   return false;

//   // старый вариант
//   // let maxX;
//   // let minX;
//   // let maxY;
//   // let minY;
//   // // условие для атаки
//   // minX = x - attack;
//   // minY = y - attack;
//   // if (minX < 0) {
//   //   minX = 0;
//   // }
//   // if (minY < 0) {
//   //   minY = 0;
//   // }
//   // maxX = x + attack;
//   // maxY = y + attack;
//   // if (maxX > 8) {
//   //   maxX = 8;
//   // }
//   // if (maxY > 8) {
//   //   maxY = 8;
//   // }
//   // // проверка на радиус поражения для игрока
//   // if (maxX >= el && el >= minX && maxY >= el1 && el1 >= minY && GameState.queue.gamer === 'player') {
//   //   return true;
//   // }
//   // return false;
// }
