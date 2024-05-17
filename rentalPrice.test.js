const { price } = require('./rentalPrice');

describe('price', () => {
    test('should return "Driver too young - cannot quote the price" if age is less than 18', () => {
        expect(price('2022-01-01', '2022-01-07', 'Compact', 17, 2)).toBe('Driver too young - cannot quote the price');
    });

    test('should return "Driver has to have a license for at least a year to rent a car" if license is less than 1', () => {
        expect(price('2022-01-01', '2022-01-07', 'Compact', 19, 0)).toBe('Driver has to have a license for at least a year to rent a car');
    });

    test('should return "Drivers 21 y/o or less can only rent Compact vehicles" if age is less than or equal to 21 and type is not "Compact"', () => {
        expect(price('2022-01-01', '2022-01-07', 'Electric', 21, 2)).toBe('Drivers 21 y/o or less can only rent Compact vehicles');
    });

    test('should calculate the correct price for a 7-day rental for a 25-year-old driver with 2 years of license', () => {
        // This is a simple test case, you may need to adjust the expected price based on your pricing rules
        expect(price('2022-01-01', '2022-01-07', 'Compact', 25, 2)).toBe('$' + (25 * 5 + 25 * 1.05 * 2));
    });
    test('Is the car on the list', () => {
        // This is a simple test case, you may need to adjust the expected price based on your pricing rules
        expect(price('2022-01-01', '2022-01-07', 'spaceship', 25, 2)).toBe('car is not on the list of available cars');
    });
    test('License less than 2 years old', () => {
        // This is a simple test case, you may need to adjust the expected price based on your pricing rules
        expect(price('2022-01-01', '2022-01-07', 'Compact', 25, 1)).toBe('$' + ((25 * 5 + 25 * 1.05 * 2)*1.3));
    });
    test('Racer exception', () => {
        // This is a simple test case, you may need to adjust the expected price based on your pricing rules
        expect(price('2022-01-01', '2022-01-07', 'Racer', 25, 1)).toBe('$' + ((25 * 5 + 25 * 1.05 * 2)*1.3));
    });
    test('Racer in high season and 25 or less', () => {
        // This is a simple test case, you may need to adjust the expected price based on your pricing rules
        expect(price('2022-05-01', '2022-05-07', 'Racer', 25, 4)).toBe('$' + ((25 * 5 + 25 * 1.05 * 2)*1.50 *1.15));
    });
    test('additional 15 euros for license less than 3 years in high season', () => {
        // This is a simple test case, you may need to adjust the expected price based on your pricing rules
        expect(price('2022-05-01', '2022-05-07', 'Compact', 25, 2)).toBe('$' + ((40 * 5  + 40 * 1.05 * 2)*1.15).toFixed(1));
    });
    test('10 day discount in low', () => {
        // This is a simple test case, you may need to adjust the expected price based on your pricing rules
        expect(price('2022-01-01', '2022-01-11', 'Compact', 25, 4)).toBe('$' + ((25 * 7  + 25 * 1.05 * 4)*0.9));
    });
});