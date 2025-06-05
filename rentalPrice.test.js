const { price } = require('./rentalPrice');

describe('Weekday and Weekend Pricing', () => {
    test('50-year-old driver rents a car for Monday, Tuesday, Wednesday', () => {
        const result = price("2025-02-10", "2025-02-12", "Compact", 50);
        expect(result).toBe("$150");
    });

    test('50-year-old driver rents a car for Thursday, Friday, Saturday', () => {
        const result = price("2025-02-13", "2025-02-15", "Compact", 50);
        expect(result).toBe("$152.5");
    });
});

describe('coverage', () => {
    test('underage', () => {
        const result = price('2025-06-2', '2025-06-04', 'Compact', 17);
        expect(result).toBe('Driver too young - cannot quote the price');
    });

    test('compact only', () => {
        const result = price('2025-06-2', '2025-06-04', 'Electric', 18);
        expect(result).toBe('Drivers 21 y/o or less can only rent Compact vehicles');
    });

    test('For Racers, the price is increased by 50% if the driver is 25 years old or younger (except during the low season)', () => {
        const result = price('2025-06-2', '2025-06-02', 'Racer', 24);
        expect(result).toBe('$41.4');
    });

    test('If renting for more than 10 days, price is decresed by 10% (except during the high season).', () => {
        const result = price('2025-02-10', '2025-02-21', 'Compact', 20);
        expect(result).toBe('$217.8');
    });

});
