const { calculatePriceByDates } = require('./weekdayPricing');



describe('weekday/weekend pricing', () => {


  test('Monday: no weekend surcharge', () => {
    const result = calculatePriceByDates('2024-01-01', 'Compact', 50, 5); 
    expect(result).toBeCloseTo(50);
  });

  test('Saturday: +5% weekend surcharge', () => {
    const result = calculatePriceByDates('2024-01-06', 'Compact', 50, 5); 
    expect(result).toBeCloseTo(52.5);
  });

  test('Sunday: +5% weekend surcharge', () => {
    const result = calculatePriceByDates('2024-01-07', 'Compact', 50, 5); 
    expect(result).toBeCloseTo(52.5);
  });

 
  test('Example 1: 50 y/o, Mon-Tue-Wed → total $150', () => {
    const result = calculatePriceByDates('2024-01-01', 'Compact', 50, 5, 3);
    expect(result).toBeCloseTo(150);
  });

  
  test('Example 2: 50 y/o, Thu-Fri-Sat → total $152.50', () => {
    const result = calculatePriceByDates('2024-01-04', 'Compact', 50, 5, 3); 
    expect(result).toBeCloseTo(152.5);
  });

  test('Full weekend: Sat + Sun → both with +5%', () => {
    const result = calculatePriceByDates('2024-01-06', 'Compact', 50, 5, 2); 
    expect(result).toBeCloseTo(105);
  });

  test('Week: 7 days from Monday → 5 weekdays + 2 weekends', () => {
    const result = calculatePriceByDates('2024-01-01', 'Compact', 50, 5, 7);
    expect(result).toBeCloseTo(355);
  });
});
