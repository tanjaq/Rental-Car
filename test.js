const { price } = require('./rentalPrice');

describe('price function', () => {
  test('should return a string with the calculated price', () => {
    const result = price('2024-02-09', '2024-02-11', '2024-02-09', '2024-02-11', 'Compact', 25, '2023-02-09');
    expect(typeof result).toBe('string');
    expect(result).toMatch(/^\$\d+(\.\d{1,2})?$/);
  });

  test('should return a message for drivers under 18', () => {
    const result = price('2024-02-09', '2024-02-11', '2024-02-09', '2024-02-11', 'Compact', 16, '2023-02-09');
    expect(result).toBe("Driver too young - cannot quote the price");
  });

  test('should return a message for drivers aged 21 or less renting non-Compact vehicles', () => {
    const result = price('2024-02-09', '2024-02-11', '2024-02-09', '2024-02-11', 'Electric', 21, '2023-02-09');
    expect(result).toBe("Drivers 21 y/o or less can only rent Compact vehicles");
  });

  test('should return a message for individuals with a driver\'s license held for less than a year', () => {
    const result = price('2024-02-09', '2024-02-11', '2024-02-09', '2024-02-11', 'Compact', 30, '2024-02-09');
    expect(result).toBe("Individuals holding a driver's license for less than a year are ineligible to rent");
  });

});
