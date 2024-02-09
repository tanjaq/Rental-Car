const rental = require('../main/rentalPrice');

test('Driver under 18 cannot rent a car', () => {
    expect(rental.calculateRentalPrice('2024-01-01', '2024-02-02', 'Compact', 15))
    .toBe('Driver too young - cannot quote the price');
});

test('5 days is not long rental', () => {
    expect(rental.isLongRental(5))
    .toBe(false);
});
