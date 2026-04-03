const { price } = require('./rentalPrice.js'); // Replace with your actual filename

describe('Car Rental Price Engine', () => {

    // Test 1: Age Guard Clause
    test('should return error if driver is under 18', () => {
        const result = price('Tallinn', 'Tartu', '2026-04-01', '2026-04-05', 'Compact', 17, '2024-01-01');
        expect(result).toBe("Driver too young - cannot quote the price");
    });

    // Test 2: License Guard Clause
    test('should return error if license held for less than 1 year', () => {
        const result = price('Tallinn', 'Tartu', '2026-04-01', '2026-04-05', 'Compact', 25, '2025-12-01');
        expect(result).toBe("Driver license held less than one year - cannot quote the price");
    });

    // Test 3: Car Type and Age Guard Clause
    test('should return error if driver is 21 or less and car is not compact', () => {
        const result = price('Tallinn', 'Tartu', '2026-04-01', '2026-04-05', 'Electric', 20, '2025-01-01');
        expect(result).toBe("Drivers 21 y/o or less can only rent Compact vehicles");
    });

    // Test 4: Normal Low Season Calculation
    test('should calculate base price for 25yo in Low Season', () => {
        // 25yo, Low Season (March), Compact, 3 days
        // No surcharges should apply. Price should be exactly 25.00
        const result = price('Tallinn', 'Tartu', '2026-03-01', '2026-03-03', 'Compact', 25, '2020-01-01');
        expect(result).toBe("$25.00");
    });

    // Test 5: Decresed Low Season Calculation
    test('should calculate decreased price for 25yo in Low Season', () => {
        // 25yo, Low Season (March), Compact, 12 days
        // No surcharges should apply. Price should be 22.50
        const result = price('Tallinn', 'Tartu', '2026-03-01', '2026-03-12', 'Compact', 25, '2020-01-01');
        expect(result).toBe("$22.50");
    });

    // Test 6: High Season Surcharge
    test('should apply 15% surcharge in High Season', () => {
        // 40yo, High Season (June), Compact
        // 40 * 1.15 = 46.00
        const result = price('Tallinn', 'Tartu', '2026-06-01', '2026-06-05', 'Compact', 40, '2010-01-01');
        expect(result).toBe("$46.00");
    });

    // Test 7: High Season Racer Surcharge
    test('should apply additional 50% surcharge to High Season surcharge', () => {
        // 22yo, High Season (June), Racer
        // 22 * 1.15 * 1.5 = 37.95
        const result = price('Tallinn', 'Tartu', '2026-06-01', '2026-06-05', 'Racer', 22, '2023-01-01');
        expect(result).toBe("$37.95");
    });

    // Test 8: Low Season License Held Less Than 2 Years Surcharge
    test('should apply additional 30% surcharge in Low Season if driver license is held less than 2 years', () => {
        // 28yo, Low Season (February), Cabrio, licence held for 1,5 years
        // 28 * 1.3 = 36.40
        const result = price('Tallinn', 'Tartu', '2026-02-01', '2026-02-05', 'Cabrio', 28, '2024-08-01');
        expect(result).toBe("$36.40");
    });

    // Test 9: High Season License Held Less Than 3 Years Surcharge
    test('should apply additional +15$ surcharge in High Season if driver license is held less than 3 years', () => {
        // 28yo, Low Season (June), Cabrio, licence held for 2,5 years
        // 28 * 1.15 + 15 = 47.20
        const result = price('Tallinn', 'Tartu', '2026-06-01', '2026-06-05', 'Cabrio', 28, '2024-01-01');
        expect(result).toBe("$47.20");
    });

    // Test 10: High Season Surcharge if rental starts and ends in Low season
    test('should apply 15% surcharge in renting starts and ends in Low Season', () => {
        // 40yo, Low Season (June), Cabrio, licence held for 2,5 years
        // 40 * 1.15 = 46
        const result = price('Tallinn', 'Tartu', '2025-02-01', '2026-11-01', 'Cabrio', 40, '2010-01-01');
        expect(result).toBe("$46.00");
    });

    // Test 11: Exact Anniversary Branch Coverage
    test('should correctly reduce years if months are same but day has not passed', () => {
        const result = price('Tallinn', 'Tartu', '2026-04-01', '2026-04-05', 'Compact', 40, '2024-04-02');
        // Pickup: April 1st, 2026. License: April 2nd, 2024.
        // Years calculation: 2026 - 2024 = 2. 
        // Since April 2nd > April 1st, it should become 1 year.
        // 40 * 1.15 * 1.3 + 15 = 74.80
        expect(result).toBe("$74.80");
    });
});