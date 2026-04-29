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

    // License dates (assuming today is 2026-04-29)
    const LICENSE = {
        years0: d('2026-04-29'), // 0 years
        years1: d('2025-04-29'), // 1 year
        years2: d('2024-04-29'), // 2 years
        years3: d('2023-04-29'), // 3 years
        years5: d('2021-04-29'), // 5 years
    };

    describe('input constraints', () => {
        it('returns error if driver is under 18', () => {
            const result = calculatePrice('Compact', 17, LICENSE.years5, DAY.apr01, DAY.apr05);
            expect(result).toBe('Driver too young - cannot quote the price');
        });

        it('returns error if license tenure is less than 1 year', () => {
            const result = calculatePrice('Compact', 25, LICENSE.years0, DAY.apr01, DAY.apr05);
            expect(result).toBe('Driver must have at least 1 year of driving experience to rent a car');
        });

        it('restricts 18–21 to Compact only', () => {
            const result = calculatePrice('Racer', 20, LICENSE.years3, DAY.apr01, DAY.apr05);
            expect(result).toBe('Drivers 21 y/o or less can only rent Compact vehicles');
        });
    });

    describe('pricing basics', () => {
        it('uses age as the minimum daily base', () => {
            const price = calculatePrice('Compact', 30, LICENSE.years5, DAY.jan01, DAY.jan01);
            expect(price).toBe('$30.00');
        });
    });

    describe('license-based adjustments', () => {
        it('adds 30% when license tenure is under 2 years', () => {
            const price = calculatePrice('Compact', 20, LICENSE.years1, DAY.jan01, DAY.jan01);
            expect(price).toBe('$26.00'); // 20 * 1.3
        });

        it('adds +€15/day for license under 3 years during high season (then season multiplier)', () => {
            const price = calculatePrice('Compact', 30, LICENSE.years2, DAY.apr01, DAY.apr01);
            expect(price).toBe('$51.75'); // (30 + 15) * 1.15
        });
    });

    describe('car-type rules', () => {
        it('applies +50% for Racer (young-driver surcharge) in high season', () => {
            const price = calculatePrice('Racer', 25, LICENSE.years5, DAY.apr01, DAY.apr01);
            expect(price).toBe('$43.12'); // 25 * 1.5 * 1.15 = 43.125 -> 43.13
        });

        it('does not apply Racer +50% in low season', () => {
            const price = calculatePrice('Racer', 25, LICENSE.years5, DAY.jan01, DAY.jan01);
            expect(price).toBe('$25.00');
        });
    });

    describe('season / duration effects', () => {
        it('high season adds 15% to total', () => {
            const price = calculatePrice('Compact', 20, LICENSE.years5, DAY.apr01, DAY.apr05);
            expect(price).toBe('$115.00'); // 5*20*1.15
        });

        it('low-season discount applies only for rentals longer than 10 days', () => {
            const price = calculatePrice('Compact', 30, LICENSE.years5, DAY.jan01, DAY.jan19);
            expect(price).toBe('$513.00'); // 30 * 19 * 0.9 = 513
        });

        it('no low-season discount when duration is 10 days or less', () => {
            const price = calculatePrice('Compact', 30, LICENSE.years5, DAY.jan01, DAY.jan10);
            expect(price).toBe('$300.00'); // 30 * 10 = 300 (no discount, not > 10)
        });
    });
});