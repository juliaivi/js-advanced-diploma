import definitionAttack from '../definitionAttack';

test('if the enemy is in range', () => {
  expect(definitionAttack(1, 1, 2, 2, 4)).toBeTruthy();
});

test('if the enemy is out of range', () => {
  expect(definitionAttack(1, 1, 4, 4, 1)).toBeFalsy();
});
