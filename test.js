// Test file to verify all requirements work correctly
const rental = require('./rentalPrice');

console.log('=== TESTING RENTAL PRICE CALCULATION ===\n');

// Test 1: Driver with license < 1 year - should be ineligible
console.log('Test 1: License < 1 year (should be ineligible)');
const result1 = rental.price('Tallinn', 'Tartu', new Date('2026-02-01'), new Date('2026-02-03'), 'compact', 25, 0.5);
console.log('Result:', result1);
console.log('Expected: Ineligible message\n');

// Test 2: Driver age < 18 - should be too young
console.log('Test 2: Driver age < 18 (should be too young)');
const result2 = rental.price('Tallinn', 'Tartu', new Date('2026-02-01'), new Date('2026-02-03'), 'compact', 16, 2);
console.log('Result:', result2);
console.log('Expected: Too young message\n');

// Test 3: Young driver (21) with non-compact car - should fail
console.log('Test 3: Driver age 21 with Racer (should fail)');
const result3 = rental.price('Tallinn', 'Tartu', new Date('2026-02-01'), new Date('2026-02-03'), 'racer', 21, 2);
console.log('Result:', result3);
console.log('Expected: Young driver restriction message\n');

// Test 4: License 1.5 years (< 2 years) - should apply 30% increase
console.log('Test 4: License 1.5 years - should apply 30% price increase');
const result4 = rental.price('Tallinn', 'Tartu', new Date('2026-06-01'), new Date('2026-06-03'), 'compact', 25, 1.5);
console.log('Result:', result4);
console.log('Expected: Price with 30% increase (base: 25*3*1.15 = 86.25, +30% = 112.125)\n');

// Test 5: License 2.5 years (< 3 years) + high season - should add 15€/day surcharge
console.log('Test 5: License 2.5 years in high season - should add 15€/day surcharge');
const result5 = rental.price('Tallinn', 'Tartu', new Date('2026-06-01'), new Date('2026-06-03'), 'compact', 25, 2.5);
console.log('Result:', result5);
console.log('Expected: Base price + 15€/day surcharge for 3 days\n');

// Test 6: License >= 3 years in high season - should have normal high season price
console.log('Test 6: License 3+ years in high season (no special surcharge)');
const result6 = rental.price('Tallinn', 'Tartu', new Date('2026-06-01'), new Date('2026-06-03'), 'compact', 25, 3);
console.log('Result:', result6);
console.log('Expected: Base price with only high season multiplier\n');

// Test 7: Low season, long rental (>10 days), license < 2 years
console.log('Test 7: Low season, 11 days, license 1.5 years');
const result7 = rental.price('Tallinn', 'Tartu', new Date('2026-01-01'), new Date('2026-01-12'), 'compact', 25, 1.5);
console.log('Result:', result7);
console.log('Expected: (25*11*0.9) with 30% license increase\n');

// Test 8: Valid rental with good driver (license >= 3 years, age > 21, high season)
console.log('Test 8: Valid rental - good driver profile');
const result8 = rental.price('Tallinn', 'Tartu', new Date('2026-06-01'), new Date('2026-06-03'), 'compact', 30, 5);
console.log('Result:', result8);
console.log('Expected: 30*3*1.15 = 103.5\n');

console.log('=== ALL TESTS COMPLETED ===');
