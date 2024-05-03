const { calculateRentalPrice } = require('./rentalPrice.js');

describe('calculateRentalPrice function tests', () => {
    test('Driver under 18 cannot rent a car', () => {
        expect(calculateRentalPrice('2024-01-01', '2024-02-02', 'Compact', 15, 2)).toBe('Driver too young - cannot rent a car.');
    });

    test('Driver must hold a license for at least one year to rent a car', () => {
        expect(calculateRentalPrice('2024-01-01', '2024-02-02', 'Compact', 20, 1)).toBe("Driver must hold a license for at least one year to rent a car.");
    });

    test('Drivers aged 18-21 can only rent Compact cars', () => {
        expect(calculateRentalPrice('2024-01-01', '2024-02-02', 'Electric', 20, 2)).toBe("Drivers aged 18-21 can only rent Compact cars.");
    });

    test('Driver under 25 renting Racer during high season', () => {
        expect(calculateRentalPrice('2024-07-01', '2024-07-15', 'Racer', 22, 3)).toBe("$569.25");
    });

    test('Driver under 25 renting Racer during low season', () => {
        expect(calculateRentalPrice('2024-01-01', '2024-01-10', 'Racer', 22, 3)).toBe("$220.00");
    });

    test('Driver above 25 renting Racer during high season', () => {
        expect(calculateRentalPrice('2024-07-01', '2024-07-15', 'Racer', 30, 3)).toBe("$517.50");
    });

    test('Driver above 25 renting Racer during low season', () => {
        expect(calculateRentalPrice('2024-01-01', '2024-01-10', 'Racer', 30, 3)).toBe("$300.00");
    });

    test('Compact car rental for 5 days during high season', () => {
        expect(calculateRentalPrice('2024-07-01', '2024-07-05', 'Compact', 25, 3)).toBe("$143.75");
    });

    test('Compact car rental for 5 days during low season', () => {
        expect(calculateRentalPrice('2024-01-01', '2024-01-05', 'Compact', 25, 3)).toBe("$125.00");
    });

    test('Electric car rental for 5 days during high season', () => {
        expect(calculateRentalPrice('2024-07-01', '2024-07-05', 'Electric', 25, 3)).toBe("$143.75");
    });

    test('Electric car rental for 5 days during low season', () => {
        expect(calculateRentalPrice('2024-01-01', '2024-01-05', 'Electric', 25, 3)).toBe("$125.00");
    });

    test('Cabrio car rental for 5 days during high season', () => {
        expect(calculateRentalPrice('2024-07-01', '2024-07-05', 'Cabrio', 25, 3)).toBe("$143.75");
    });

    test('Cabrio car rental for 5 days during low season', () => {
        expect(calculateRentalPrice('2024-01-01', '2024-01-05', 'Cabrio', 25, 3)).toBe("$125.00");
    });

    test('Racer car rental for 5 days during high season', () => {
        expect(calculateRentalPrice('2024-07-01', '2024-07-05', 'Racer', 25, 3)).toBe("$215.63");
    });

    test('Racer car rental for 5 days during low season', () => {
        expect(calculateRentalPrice('2024-01-01', '2024-01-05', 'Racer', 25, 3)).toBe("$125.00");
    });

    test('Racer car rental for 11 days during high season', () => {
        expect(calculateRentalPrice('2024-07-01', '2024-07-11', 'Racer', 25, 3)).toBe("$474.38");
    });

    test('Racer car rental for 11 days during low season', () => {
        expect(calculateRentalPrice('2024-01-01', '2024-01-11', 'Racer', 25, 3)).toBe("$247.50");
    });

    test('Electric car rental for 15 days during high season', () => {
        expect(calculateRentalPrice('2024-07-01', '2024-07-15', 'Electric', 25, 3)).toBe("$431.25");
    });

    test('Electric car rental for 15 days during low season', () => {
        expect(calculateRentalPrice('2024-01-01', '2024-01-15', 'Electric', 25, 3)).toBe("$337.50");
    });

    test('Compact car rental for 11 days during high season with license years below 2', () => {
        expect(calculateRentalPrice('2024-07-01', '2024-07-11', 'Compact', 25, 1)).toBe("Driver must hold a license for at least one year to rent a car.");
    });

    test('Compact car rental for 11 days during high season with license years below 3', () => {
        expect(calculateRentalPrice('2024-07-01', '2024-07-11', 'Compact', 25, 2)).toBe("$481.25");
    });

    test('Compact car rental for 11 days during high season with license years equal to 3', () => {
        expect(calculateRentalPrice('2024-07-01', '2024-07-11', 'Compact', 25, 3)).toBe("$316.25");
    });

    test('Compact car rental for 11 days during high season with license years above 3', () => {
        expect(calculateRentalPrice('2024-07-01', '2024-07-11', 'Compact', 25, 4)).toBe("$316.25");
    });
    test('5 days is not considered a long rental', () => {
        expect(calculateRentalPrice('2024-01-01', '2024-01-05', 'Compact', 25, 3)).toBe('$125.00');
    });

    test('Driver aged 24 renting a Racer during high season with license years below 3', () => {
        expect(calculateRentalPrice('2024-07-01', '2024-07-11', 'Racer', 24, 2)).toBe("$620.40");
    });

    test('Driver aged 24 renting a Racer during low season with license years below 3', () => {
        expect(calculateRentalPrice('2024-01-01', '2024-01-11', 'Racer', 24, 2)).toBe("$237.60");
    });

    test('Driver aged 24 renting a Racer during high season with license years equal to 3', () => {
        expect(calculateRentalPrice('2024-07-01', '2024-07-11', 'Racer', 24, 3)).toBe("$455.40");
    });

    test('Driver aged 24 renting a Racer during low season with license years equal to 3', () => {
        expect(calculateRentalPrice('2024-01-01', '2024-01-11', 'Racer', 24, 3)).toBe("$237.60");
    });
});