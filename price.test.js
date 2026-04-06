const { price } = require('./rentalPrice.js');

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

    // Test 4: Weekend Surcharge Low season
    test('should apply 5% surcharge in Low Season weekend', () => {
        // 50yo, (November), Electirc, licence held for 2,5 years
        // Week days 1
        // Weekend days 2
        // 50 * 0.9 = 45
        // 50 * 0.9 * 1.05 * 2 = 94.5
        const result = price('Tallinn', 'Tartu', '2026-11-06', '2026-11-08', 'Electric', 50, '2010-01-01');
        expect(result).toBe("$139.50");
    });

    // Test 5: Weekend Surcharge High season
    test('should apply 5% surcharge in High season weekend', () => {
        // 50yo, (June), Electirc, licence held for 2,5 years
        // Week days 2
        // Weekend days 2
        // 50 * 1.15 * 2 = 115
        // 50 * 1.15 * 1.05 * 2 = 120.75
        const result = price('Tallinn', 'Tartu', '2026-06-05', '2026-06-08', 'Electric', 50, '2010-01-01');
        expect(result).toBe("$235.75");
    });

    // Test 6: Normal Low Season Calculation
    test('should calculate base price for 25yo in Low Season', () => {
        // 25yo, Low Season (March), Compact, 3 days
        // No surcharges should apply.
        // 3 * 25 = 75
        const result = price('Tallinn', 'Tartu', '2026-03-10', '2026-03-12', 'Compact', 25, '2020-01-01');
        expect(result).toBe("$75.00");
    });

    // Test 7: Decresed Low Season Calculation
    test('should calculate decreased price for 25yo in Low Season', () => {
        // 25yo, Low Season (March), Compact, 12 days
        // No surcharges should apply. Price should be 22.50
        // 25 * 0.9 * 10 =  225
        // 25 * 0.9 * 1.05 * 2 = 47.25
        const result = price('Tallinn', 'Tartu', '2026-03-02', '2026-03-13', 'Compact', 25, '2020-01-01');
        expect(result).toBe("$272.25");
    });

    // Test 8: High Season Surcharge
    test('should apply 15% surcharge in High Season', () => {
        // 40yo, High Season (June), Compact, 5 days
        // 40 * 1.15 * 5 = 230
        const result = price('Tallinn', 'Tartu', '2026-06-08', '2026-06-13', 'Compact', 40, '2010-01-01');
        expect(result).toBe("$230.00");
    });

    // Test 9: High Season Racer Surcharge
    test('should apply additional 50% surcharge to High Season surcharge', () => {
        // 22yo, High Season (June), Racer, 5 days
        // 22 * 1.15 * 1.5 * 5 = 189.75
        const result = price('Tallinn', 'Tartu', '2026-06-08', '2026-06-12', 'Racer', 22, '2023-01-01');
        expect(result).toBe("$189.75");
    });

    // Test 10: Low Season License Held Less Than 2 Years Surcharge
    test('should apply additional 30% surcharge in Low Season if driver license is held less than 2 years', () => {
        // 28yo, Low Season (February), Cabrio, 5days, licence held for 1,5 years
        // 28 * 1.3 * 5 = 182
        const result = price('Tallinn', 'Tartu', '2026-02-02', '2026-02-06', 'Cabrio', 28, '2024-08-01');
        expect(result).toBe("$182.00");
    });

    // Test 11: High Season License Held Less Than 3 Years Surcharge
    test('should apply additional +15$ surcharge in High Season if driver license is held less than 3 years', () => {
        // 28yo, Low Season (June), Cabrio, 5 days, licence held for 2,5 years
        // (28 * 1.15 + 15) * 5 = 236
        const result = price('Tallinn', 'Tartu', '2026-06-08', '2026-06-12', 'Cabrio', 28, '2024-01-01');
        expect(result).toBe("$236.00");
    });

    // Test 12: Exact Anniversary Branch Coverage
    test('should correctly reduce years if months are same but day has not passed', () => {
        const result = price('Tallinn', 'Tartu', '2026-04-01', '2026-04-05', 'Compact', 40, '2024-04-02');
        // 40yo High Season 5 days
        // Pickup: April 1st, 2026. License: April 2nd, 2024.
        // Years calculation: 2026 - 2024 = 2. 
        // Since April 2nd > April 1st, it should become 1 year.
        // week day (40 * 1.15 * 1.3 + 15) * 3 = 224.4
        // weekend (40 * 1.15 * 1.3 + 15) * 1.05  * 2 = 157.08
        expect(result).toBe("$381.48");
    });

    // Test 13: High Season Surcharge if Rental Starts in Low Season and Ends in High Season
    test('should apply 15% surcharge during high season when renting starts in Low Season', () => {
        // 40yo, Cabrio, licence held for more than 3 years
        // High season 11 Weekdays, 4 Weekends.
        // Low season 11 Weekdays, 4 Weekends.
        // 40 * 1.15 *  11 = 506
        // 40 * 1.15 * 1.05 * 4 = 193.2
        // 40 * 0.9 * 11 = 396
        // 40 * 0.9 * 1.05 * 4 = 151.2
        const result = price('Tallinn', 'Tartu', '2026-03-17', '2026-04-15', 'Cabrio', 40, '2010-01-01');
        expect(result).toBe("$1246.40");
    });

    // Test 14: High Season Surcharge if Rental Starts in High season and ends in Low season
    test('should apply 15% surcharge in renting starts in High Season and ends in Low Season', () => {
        // 40yo, Cabrio, licence held for more thasn 3 years
        // High season week days 4, weekend days 1
        // Low season week days 4, weekend days 1
        // 40 * 1.15 * 4 = 184
        // 40 * 1.15 * 1.05 = 48.3
        // 40 * 4 = 160
        // 40 * 1.05 = 42
        const result = price('Tallinn', 'Tartu', '2026-10-27', '2026-11-05', 'Cabrio', 40, '2010-01-01');
        expect(result).toBe("$434.30");
    });

    // Test 15: 24yo Racer, High season, License less than 2 years and Weekend Surcharge
    test('should apply all surcharges in High season weekend', () => {
        // 24yo, (June), Racer, licence held for 1.5 years
        // Week days 2
        // Weekend days 2
        // (24 * 1.15 * 1.5 * 1.3 + 15) * 2 = 137.64
        // (24 * 1.15 * 1.5 * 1.3 * 1.05 + 15 ) * 2 = 143.022
        const result = price('Tallinn', 'Tartu', '2025-06-05', '2026-06-08', 'Racer', 24, '2025-01-01');
        expect(result).toBe("$280.66");
    });

    // Test 16: 24yo Racer, High season, License less than 2 years and Weekend Surcharge crossing over to Low season
    test('should apply all surcharges in High season weekend', () => {
        // 24yo, (June), Racer, licence held for 1.5 years
        // High season Week days 1
        // High season Weekend days 1
        // Low season Week days 1
        // Low season Weekend days 1
        // 24 * 1.15 * 1.5 * 1.3 + 15 = 68.82
        // 24 * 1.15 * 1.5 * 1.3 * 1.05 + 15 = 71.511
        // 24 * 1.3 = 31.2
        // 24 * 1.3 * 1.05 = 32.76
        const result = price('Tallinn', 'Tartu', '2025-10-30', '2026-11-02', 'Racer', 24, '2025-04-01');
        expect(result).toBe("$204.29");
    });
});

// Test 17: High Season Surcharge if Rental Starts and Ends in Low Season
test('should apply 15% surcharge during high season when renting starts and ends in Low Season', () => {
    // 40yo, (full year), Cabrio, licence held for more than 3 years
    // High Season (Apr–Oct) 214 days: 61 Weekend days, 153 Weekdays.
    // Low Season (Jan–Mar, Nov–Dec) 151 days: 43 Weekend days, 108 Weekdays.
    // 40 * 1.15 *  153 = 7038
    // 40 * 1.15 * 1.05 * 61 = 2946.3
    // 40 * 0.9 * 108 = 3888
    // 40 * 0.9 * 1.05 * 43 = 1625.4
    // total manual calc: 15497.7; gemini: 15499.70
    const result = price('Tallinn', 'Tartu', '2026-01-01', '2026-12-31', 'Cabrio', 40, '2010-01-01');
    expect(result).toBe("$15497.70");
});
