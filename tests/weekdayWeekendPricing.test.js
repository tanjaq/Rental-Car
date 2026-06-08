const { calculatePrice } = require('../rentalPrice');

describe('Weekday vs Weekend pricing (TDD)', () => {

    test('Weekday rental has regular price', () => {
        // Monday → Wednesday (LOW season)
        const start = Date.parse('2024-01-08');
        const end = Date.parse('2024-01-10');

        const result = calculatePrice(start, end, 'Compact', 50, 10);

        expect(result).toBe('$150.00');
    });


    test('Weekend day has 5% price increase', () => {
        // Thursday → Saturday (LOW season)
        const start = Date.parse('2024-01-11');
        const end = Date.parse('2024-01-13');

        const result = calculatePrice(start, end, 'Compact', 50, 10);

        expect(result).toBe('$152.50');
    });

});