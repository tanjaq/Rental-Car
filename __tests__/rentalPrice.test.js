const { calculatePrice } = require('../rentalPrice');

describe('calculatePrice()', () => {
    const d = (iso) => Date.parse(iso);

    const DAY = {
        jan01: d('2024-01-01'),
        jan10: d('2024-01-10'),
        jan15: d('2024-01-15'),
        jan19: d('2024-01-19'),
        apr01: d('2024-04-01'),
        apr05: d('2024-04-05'),
    };

    describe('input constraints', () => {
        it('throws if driver is under 18', () => {
            expect(() => calculatePrice(DAY.apr01, DAY.apr05, 'Compact', 17, 5))
                .toThrow('Driver too young');
        });

        it('throws if license tenure is less than 1 year', () => {
            expect(() => calculatePrice(DAY.apr01, DAY.apr05, 'Compact', 25, 0))
                .toThrow("Driver's license held for less than one year");
        });

        it('restricts 18–21 to Compact only', () => {
            expect(() => calculatePrice(DAY.apr01, DAY.apr05, 'Racer', 20, 3))
                .toThrow('Drivers aged 18–21 can only rent Compact cars');
        });
    });

    describe('pricing basics', () => {
        it('uses age as the minimum daily base', () => {
            const price = calculatePrice(DAY.jan01, DAY.jan01, 'Compact', 30, 5);
            expect(price).toBe('$30.00');
        });
    });

    describe('license-based adjustments', () => {
        it('adds 30% when license tenure is under 2 years', () => {
            const price = calculatePrice(DAY.jan01, DAY.jan01, 'Compact', 20, 1);
            expect(price).toBe('$26.00'); // 20 * 1.3
        });

        it('adds +€15/day for license under 3 years during high season (then season multiplier)', () => {
            const price = calculatePrice(DAY.apr01, DAY.apr01, 'Compact', 30, 2);
            expect(price).toBe('$51.75'); // (30 + 15) * 1.15
        });
    });

    describe('car-type rules', () => {
        it('applies +50% for Racer (young-driver surcharge) in high season', () => {
            const price = calculatePrice(DAY.apr01, DAY.apr01, 'Racer', 25, 5);
            expect(price).toBe('$43.13'); // 25 * 1.5 * 1.15 = 43.125 -> 43.13
        });

        it('does not apply Racer +50% in low season', () => {
            const price = calculatePrice(DAY.jan01, DAY.jan01, 'Racer', 25, 5);
            expect(price).toBe('$25.00');
        });
    });

    describe('season / duration effects', () => {
        it('high season adds 15% to total', () => {
            const price = calculatePrice(DAY.apr01, DAY.apr05, 'Compact', 20, 5);
            expect(price).toBe('$115.00'); // 5*20*1.15
        });

        it('low-season discount applies only for rentals longer than 10 days', () => {
            const price = calculatePrice(DAY.jan01, DAY.jan19, 'Compact', 30, 5);
            expect(price).toBe('$518.40');
        });

        it('no low-season discount when duration is 10 days or less', () => {
            const price = calculatePrice(DAY.jan01, DAY.jan10, 'Compact', 30, 5);
            expect(price).toBe('$303.00');
        });
    });
});
