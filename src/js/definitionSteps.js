// условие для шага
export default function definitionSteps(el, el2, el3, el4, step) {
  let minX;
  let maxX;
  let minY;
  let maxY;
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

  // условие для шага
  if (step === 1) {
    minX = 3;
    maxX = 5;
    minY = 3;
    maxY = 5;
  }
  if (step === 2) {
    minX = 2;
    maxX = 6;
    minY = 2;
    maxY = 6;
  }
  if (step === 4) {
    minX = 0;
    maxX = 8;
    minY = 0;
    maxY = 8;
  }
  const coordinateShiftX = 4 - (el - el3);
  const coordinateShiftY = 4 - (el2 - el4);
  if (maxX >= coordinateShiftX && coordinateShiftX >= minX && maxY >= coordinateShiftY && coordinateShiftY >= minY) {
    if (displacementField[coordinateShiftX][coordinateShiftY] === 1) {
      return 1;
    }
    return 0;
  }
}
