import characterSearch from "./characterSearch";
export default function moveEnemy(this.teamComputer, this.teamUser,  this.gamePlay.boardSize) {
    // получает массив всех персонажей this.teamComputer
    if (this.teamComputer.length > 0 && this.teamUser > 0) {
        //случайный индекс
    let randomIndex = Math.floor(Math.random() * this.teamComputer.length);
    // персонаж
    let enemyСharacter = this.teamComputer[randomIndex];
    // получение максимального шага
    let step = enemyСharacter.step;
    // получение максимального радиуса атаки
    let attack = enemyСharacter.attack;
    // позиция персонажа
    let enemyPosition = enemyСharacter.position;
    // получение координт персонажа
    const [coordinatesEnemyX, coordinatesEnemyY] = getCoordinates(enemyPosition, this.gamePlay.boardSize)
    // радиус атаки 
    let attackСheck = characterSearch(coordinatesEnemyX, coordinatesEnemyY, attack, this.teamUser)
    // если ненашол кого атаковать, тогда ходит
    if (attackСheck === false) {
      // получение рандомной ячейкии куда он планирует походить
      let randomPosition = Math.floor(Math.random() *  this.gamePlay.boardSize.length);
    }
    // можно атаковать

   
    }


  
  
  }
