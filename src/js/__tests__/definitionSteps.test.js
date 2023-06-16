import definitionSteps from '../definitionSteps';

test('you can take a step', () => {
  expect(definitionSteps(1, 1, 2, 2, 4)).toBe(1);
});

test("can't take a step", () => {
  expect(definitionSteps(1, 1, 2, 3, 4)).toBe(0);
});

test("can't take a step", () => {
  expect(definitionSteps(1, 1, 2, 6, 4)).toBeUndefined();
});

test('you can take a step', () => {
  expect(definitionSteps(1, 1, 2, 2, 2)).toBe(1);
});

test('you can take a step', () => {
  expect(definitionSteps(1, 1, 2, 2, 1)).toBe(1);
});
