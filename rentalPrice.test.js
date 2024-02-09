const rental = require ('./rentalPrice.js')

describe('Testing if driver even elligble to rent',() => {

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
        .toBe('697.5$')
    });
    
    test('Checking if during high season the additional 15% is added ', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-05-01', '2024-06-01', 'Compact', 25, 2015))
        .toBe('891.2499999999999$')
    });
    
    test('Drivers with a license that is less than 2 years have to pay 30% more', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-01-01', '2024-02-01', 'Compact', 25, 2023))
        .toBe('1007.5$')
    });
    
    test('Drivers under 25 with a Racer in low season', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-01-01', '2024-02-01', 'Racer', 24, 2015))
        .toBe('669.6$')
    });
    
    test('Drivers under 25 with a Racer in high season', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-06-01', '2024-07-01', 'Racer', 24, 2015))
        .toBe('1080$')
    });

    test('Drivers with a license that is less than 3 years and its high season', () => {
        expect(rental.calculateTotalPriceAndCheckIfValid('2024-06-01', '2024-07-01', 'Compact', 25, 2022))
        .toBe('1200$')
    });

});