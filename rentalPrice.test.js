const  {price}  = require('./rentalPrice');
test('Driver too young - cannot quote the price', () => {
    expect(price(2, 'Compact', 'High', 13, 2)).toBe('Driver too young - cannot quote the price');
});

test('Driver has to have a license for at least a year to rent a car', () => {
    expect(price(25, 'Compact', 'High', 7, 0)).toBe('Driver has to have a license for at least a year to rent a car');
});

test('Increase rental price by 30% if license is less than 2 years', () => {
    expect(price(25, 'Compact', 'High', 7, 1)).toBe('$' + 7 * (25+15) * 1.3);
});

test('Rental price calculation for license less than 3 years during high season', () => {
    expect(price(25, 'Compact', 'High', 7, 2)).toBe('$' + ((25 + 15) * 7));
});

test('Drivers 21 y/o or less can only rent Compact vehicles', () => {
    expect(price(25, 'Sedan', 'High', 7, 2)).toBe('Drivers 21 y/o or less can only rent Compact vehicles');
});

test('Compact vehicle rental price for drivers 21 y/o or less', () => {
    expect(price(20, 'Compact', 'High', 7, 2)).toBe('$' + 7 * (20+15));
});

test('Racer vehicle rental price for drivers 25 y/o or less during high season', () => {
    expect(price(25, 'Racer', 'High', 7, 2)).toBe('$' + (7 * (25+15) * 1.5 * 1.15));
});

test('Vehicle rental price during high season', () => {
    expect(price(25, 'Sedan', 'High', 7, 5)).toBe('$' + (7 * 25 * 1.15));
});
