const { calculatePrice } = require('../rentalPrice');

describe('Car rental pricing', () => {

    const APRIL_1 = Date.parse('2024-04-01');
    const APRIL_5 = Date.parse('2024-04-05');
    const JAN_1 = Date.parse('2024-01-01');
    const JAN_15 = Date.parse('2024-01-15');

    // ===== Validation tests =====

    test('Rejects drivers under 18', () => {
        expect(() =>
            calculatePrice(APRIL_1, APRIL_5, 'Compact', 17, 5)
        ).toThrow('Driver too young');
    });

    test('Rejects drivers with license less than 1 year', () => {
        expect(() =>
            calculatePrice(APRIL_1, APRIL_5, 'Compact', 25, 0)
        ).toThrow("Driver's license held for less than one year");
    });

    test('Drivers aged 18–21 can only rent Compact cars', () => {
        expect(() =>
            calculatePrice(APRIL_1, APRIL_5, 'Racer', 20, 3)
        ).toThrow('Drivers aged 18–21 can only rent Compact cars');
    });

    // ===== Base pricing =====

    test('Minimum daily price equals driver age', () => {
        const result = calculatePrice(JAN_1, JAN_1, 'Compact', 30, 5);
        expect(result).toBe('$30.00');
    });

    // ===== License rules =====

    test('License < 2 years increases price by 30%', () => {
        const result = calculatePrice(JAN_1, JAN_1, 'Compact', 20, 1);
        // 20 * 1.3 = 26
        expect(result).toBe('$26.00');
    });

    test('License < 3 years adds €15/day during high season', () => {
        const result = calculatePrice(APRIL_1, APRIL_1, 'Compact', 30, 2);
        // 30 + 15 = 45 → high season +15%
        // 45 * 1.15 = 51.75
        expect(result).toBe('$51.75');
    });

    // ===== Racer rules =====

    test('Racer with young driver gets 50% increase in high season', () => {
        const result = calculatePrice(APRIL_1, APRIL_1, 'Racer', 25, 5);
        // 25 * 1.5 = 37.5 → *1.15 = 43.125
        expect(result).toBe('$43.13');
    });

    test('Racer does NOT get 50% increase in low season', () => {
        const result = calculatePrice(JAN_1, JAN_1, 'Racer', 25, 5);
        expect(result).toBe('$25.00');
    });

    // ===== Season rules =====

    test('High season increases total price by 15%', () => {
        const result = calculatePrice(APRIL_1, APRIL_5, 'Compact', 20, 5);
        // 5 days * 20 = 100 → *1.15 = 115
        expect(result).toBe('$115.00');
    });

    test('Low season discount applies for rentals over 10 days', () => {
        const start = Date.parse('2024-01-01');
        const end = Date.parse('2024-01-19');

        const result = calculatePrice(start, end, 'Compact', 30, 5);

        // Includes weekends + 10% low-season discount
        expect(result).toBe('$518.40');
    });


    test('No low-season discount if rental is 10 days or less', () => {
        const start = Date.parse('2024-01-01');
        const end = Date.parse('2024-01-10');

        const result = calculatePrice(start, end, 'Compact', 30, 5);

        expect(result).toBe('$303.00');
    });


});