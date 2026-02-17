const {calculatePrice} = require('../rentalPrice');

describe('Weekday vs Weekend pricing (TDD)', () => {

    test('Weekday rental has regular price', () => {
        const pickupDate = Date.parse('2024-01-08');
        const dropoffDate = Date.parse('2024-01-10');

        const result = calculatePrice(
            pickupDate,
            dropoffDate,
            'Compact',
            50,
            14,
        );

        expect(result).toBe('$150.00');
    });


    test('Weekend day has 5% price increase', () => {
        const pickupDate = Date.parse('2024-01-11');
        const dropoffDate = Date.parse('2024-01-13');

        const result = calculatePrice(
            pickupDate,
            dropoffDate,
            'Compact',
            50,
            14,
        );

        expect(result).toBe('$152.50');
    });

});
