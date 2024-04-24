const { getDays, getSeason } = require('./utils');

describe('days', () => {
  test('0 days is impossible', () => {
    expect(getDays('2024-02-10', '2024-02-10')).toBe(1);
  });

  test('Correct amount of days is returned', () => {
    expect(getDays('2024-01-10', '2024-01-25')).toBe(25-10);
  });
});

describe('season', () => {
  test('High season when rental period is between 1st of April and 1st of October', () => {
    expect(getSeason('2024-04-01', '2024-10-01')).toBe('high');
  });

  test('High season when drop-off month is between 1st of April and 1st of October', () => {
    expect(getSeason('2023-12-01', '2024-05-10')).toBe('high');
  });

  test('High season when pick-up month is between 1st of April and 1st of October', () => {
    expect(getSeason('2024-10-01', '2024-12-01')).toBe('high');
  });
});
