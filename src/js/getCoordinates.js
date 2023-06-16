export default function getCoordinates(elem, obj) {
  // получаем номер ячейки
  const indexX = elem % obj;
  const indexY = Math.floor(elem / obj);
  return [indexY, indexX];
}
