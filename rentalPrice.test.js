const rental = require ('./rentalPrice.js')

describe('Testing if driver even eligible to rent',() => {

    test('Driver under the age of 21 can only rent a compact', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-01-01', '2024-02-02', 'Racer', 20, 2020))
        .toBe('Drivers 21 y/o or less can only rent Compact vehicles');
    });

    test('Driver under 18 cannot rent a car', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-01-01', '2024-02-02', 'Compact', 15, 2020))
        .toBe('Driver too young - cannot quote the price');
    });
    
    test('Drivers with a license that is less than a year cant rent', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-01-01', '2024-02-02', 'Compact', 25, 2024))
        .toBe('Individuals holding a drivers license for less than a year are ineligible to rent.')
    });

});

describe('Testing rental pricing logic',() => {

    test('Checking if the price is calculated correctly during low season', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-01-01', '2024-02-01', 'Compact', 25, 2015))
        .toBe('738.11$')
    });
    
    test('Checking if during high season the additional 15% is added ', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-05-01', '2024-06-01', 'Compact', 25, 2015))
        .toBe('946.06$')
    });
    
    test('Drivers with a license that is less than 2 years have to pay 30% more', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-01-01', '2024-02-01', 'Compact', 25, 2023))
        .toBe('959.55$')
    });
    
    test('Drivers under 25 with a Racer in low season', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-01-01', '2024-02-01', 'Racer', 24, 2015))
        .toBe('708.59$')
    });
    
    test('Drivers under 25 with a Racer in high season', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-06-01', '2024-07-01', 'Racer', 24, 2015))
        .toBe('1325.13$')
    });

    test('Drivers with a license that is less than 3 years and its high season', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-06-01', '2024-07-01', 'Compact', 25, 2022))
        .toBe('1392.73$')
    });

});

describe('Testing rental pricing logic with weekdays and weekends',() => {

    test('Renting for 5 weekdays and 2 weekends', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-01-01', '2024-01-08', 'Compact', 25, 2015))
        .toBe('205.03$');
    });

    test('Renting for 5 weekdays and 2 weekends during high season', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-05-01', '2024-05-08', 'Compact', 25, 2015))
        .toBe('235.79$');
    });

    test('Renting for 7 weekdays', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-01-01', '2024-01-09', 'Compact', 25, 2015))
        .toBe('230.03$');
    });

    test('Renting for 7 weekdays during high season', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-05-01', '2024-05-09', 'Compact', 25, 2015))
        .toBe('264.53$');
    });

    test('Renting for 2 weekends', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-01-06', '2024-01-09', 'Compact', 25, 2015))
        .toBe('105.06$');
    });

    test('Renting for 2 weekends during high season', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-05-06', '2024-05-09', 'Compact', 25, 2015))
        .toBe('115.00$');
    });
    test('Renting for 3 weekdays only', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-01-01', '2024-01-04', 'Compact', 50, 2015))
        .toBe('200.00$');
    });

    test('Renting for 3 days including a weekend', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-01-03', '2024-01-06', 'Compact', 50, 2015))
        .toBe('205.03$');
    });

    test('Renting for 3 weekends only', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-01-05', '2024-01-08', 'Compact', 50, 2015))
        .toBe('210.13$');
    });

    test('Renting for 7 days including 5 weekdays and 2 weekends', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-01-01', '2024-01-08', 'Compact', 50, 2015))
        .toBe('410.06$');
    });

    test('Renting for 7 days including 2 weekdays and 5 weekends', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-01-05', '2024-01-12', 'Compact', 50, 2015))
        .toBe('410.06$');
    });
});