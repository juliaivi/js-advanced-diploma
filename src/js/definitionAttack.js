// определение радиуса поражения
export default function definitionAttack(x, y, el, el1, attack) {
  let maxX;
  let minX;
  let maxY;
  let minY;
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
  // проверка на радиус поражения
  if (maxX >= el && el >= minX && maxY >= el1 && el1 >= minY) {
    return true;
  }
  return false;
}
