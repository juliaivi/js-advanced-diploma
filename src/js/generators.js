/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  const randomTypeIndex = Math.floor(Math.random() * allowedTypes.length);
  const randomLevel = Math.floor(Math.random() * maxLevel + 1);

  yield new allowedTypes[randomTypeIndex](randomLevel); // создается персанаж определенного типа и уровня
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = [];

  while (team.length < characterCount) {
    const character = characterGenerator(allowedTypes, maxLevel);
    team.push(character.next().value);
  }

  return team;
}
