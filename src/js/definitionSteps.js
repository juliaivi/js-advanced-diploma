import getCoordinates from './getCoordinates';

export default function definitionSteps(obj, obj1, elem, step) {
  const displacementField = [
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [0, 1, 0, 0, 1, 0, 0, 1, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 0],
    [0, 1, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
  ];

  const [coordinatesCharacterX, coordinatesCharacterY] = getCoordinates(obj, elem);
  const [coordinatesIndexX, coordinatesIndexY] = getCoordinates(obj1, elem);
  const coordinateShiftX = 4 - (coordinatesCharacterX - coordinatesIndexX);
  const coordinateShiftY = 4 - (coordinatesCharacterY - coordinatesIndexY);

  const differenceX = Math.abs(coordinatesCharacterX - coordinatesIndexX);
  const differenceY = Math.abs(coordinatesCharacterY - coordinatesIndexY);
  if (differenceX <= step && differenceY <= step) {
    if (displacementField[coordinateShiftX][coordinateShiftY] === 1) {
      return 1;
    }
    return 0;
  }
}

// условие для шага старое
// export default function definitionSteps(el, el2, el3, el4, step) {
//   let minX;
//   let maxX;
//   let minY;
//   let maxY;
//   const displacementField = [
//     [1, 0, 0, 0, 1, 0, 0, 0, 1],
//     [0, 1, 0, 0, 1, 0, 0, 1, 0],
//     [0, 0, 1, 0, 1, 0, 1, 0, 0],
//     [0, 0, 0, 1, 1, 1, 0, 0, 0],
//     [1, 1, 1, 1, 1, 1, 1, 1, 1],
//     [0, 0, 0, 1, 1, 1, 0, 0, 0],
//     [0, 0, 1, 0, 1, 0, 1, 0, 0],
//     [0, 1, 0, 0, 1, 0, 0, 1, 0],
//     [1, 0, 0, 0, 1, 0, 0, 0, 1],
//   ];

//   // условие для шага
//   if (step === 1) {
//     minX = 3;
//     maxX = 5;
//     minY = 3;
//     maxY = 5;
//   }
//   if (step === 2) {
//     minX = 2;
//     maxX = 6;
//     minY = 2;
//     maxY = 6;
//   }
//   if (step === 4) {
//     minX = 0;
//     maxX = 8;
//     minY = 0;
//     maxY = 8;
//   }
//   const coordinateShiftX = 4 - (el - el3);
//   const coordinateShiftY = 4 - (el2 - el4);
//   if (maxX >= coordinateShiftX && coordinateShiftX >= minX && maxY >= coordinateShiftY && coordinateShiftY >= minY) {
//     if (displacementField[coordinateShiftX][coordinateShiftY] === 1) {
//       return 1;
//     }
//     return 0;
//   }
// }
