import GameStateService from '../GameStateService';
// сброс всех моков
beforeEach(() => {
  jest.resetAllMocks();
});

test('error loading data', async () => {
  const stateService = new GameStateService();
  const result = [{ activeTeame: 'player' }];
  stateService.load = jest.fn().mockReturnValue(result);
});
// или так
test('data loading', () => {
  const stateService = new GameStateService();
  stateService.load = jest.fn().mockReturnValue({ activeTeame: 'player' });
});

// ОБЫЧНЫЕ ТЕСТЫ ДЕЛАЮТСЯ В ОТДЕЛЬНОМ ФАЙЛЕ ОТ МОКОВ

// выдержка по мокам для себя
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
