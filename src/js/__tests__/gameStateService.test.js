import GameStateService from '../GameStateService';
// выдержка по мокам
// const mockFunction = jest.fn();//фиктивная функция(функция без кода)
// mockFunction.mockReturnValue(obj);//эмитация функции то что мы хотим вернуть, эмитация определенного значения
// mockFunction.mockResolvedValue(obj); // разрешонное значение
// const result = mockFunction(); // результат будет obj
// //ожидание в будущем
// mockFunction.mockResolvedValue(obj); // разрешонное значение
// const result = await mockFunction();// мы ждем что получим obj
// // эмитация ошибки
// mockFunction.mockRejectedValue(new Error("Error"));// отклонение значения
// db.getCustomerSync = jest.fn().mockReturnValue({email: "a"})

// сброс всех моков
beforeEach(() => {
  jest.resetAllMocks();
});
// ...............ЭТО ВСЕ НЕ ТО
// test('error loading data', () => {
//   const stateService = new GameStateService(null);
//   expect(() => stateService.load()).toThrowError(new Error('Invalid state'));
// });

// test('data loading', () => {
//   const stateService = new GameStateService();
//   stateService.load = jest.fn().mockReturnValue({ activeTeame: 'player' });
// });

// test('error loading data', () => {
//   const stateService = new GameStateService(null);
//   stateService.load = jest.fn().mockRejectedValue(new Error('Invalid state'));
// });
// TODO что-то делаю не так ((( ошибка
test('error loading data', async () => {
  const stateService = new GameStateService();
  stateService.load = jest.fn().mockRejectedValue(new Error('Invalid state'));
  try {
    await stateService.load();
  } catch (e) {
    expect(stateService.load()).toMatch('Invalid state');
  }
});
