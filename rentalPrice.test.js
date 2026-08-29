const fs = require('fs');
const path = require('path');

const { price } = require('./rentalPrice');

// Normalise a price string: strips trailing decimal zeros so '$30.00' === '$30'
// and '$43.10' === '$43.1'. Non-price strings (error messages) pass through unchanged.
function norm(val) {
  if (typeof val !== 'string' || !val.startsWith('$')) return val;
  const n = parseFloat(val.slice(1));
  return isNaN(n) ? val : `$${n}`;
}

// licenseYears=10 is passed in all baseline and T3 tests so they are not
// affected by how students default a missing licenseYears argument.

describe('Rental price calculator', () => {
  describe('Current business requirements', () => {
    test('supports all four car classes', () => {
      expect(norm(price('A', 'B', '2024-02-12', '2024-02-12', 'Compact', 30, 10))).toBe('$30');
      expect(norm(price('A', 'B', '2024-02-12', '2024-02-12', 'Electric', 30, 10))).toBe('$30');
      expect(norm(price('A', 'B', '2024-02-12', '2024-02-12', 'Cabrio', 30, 10))).toBe('$30');
      expect(norm(price('A', 'B', '2024-02-12', '2024-02-12', 'Racer', 30, 10))).toBe('$30');
    });

    test('drivers under 18 cannot rent', () => {
      expect(price('A', 'B', '2024-02-12', '2024-02-12', 'Compact', 17, 10)).toBe(
        'Driver too young - cannot quote the price'
      );
    });

    test('drivers aged 18-21 can only rent Compact', () => {
      expect(norm(price('A', 'B', '2024-02-12', '2024-02-12', 'Compact', 21, 10))).toBe('$21');
      expect(price('A', 'B', '2024-02-12', '2024-02-12', 'Electric', 21, 10)).toBe(
        'Drivers 21 y/o or less can only rent Compact vehicles'
      );
    });

    test('racer surcharge: age 25 or less in high season gets +50%', () => {
      expect(norm(price('A', 'B', '2024-06-10', '2024-06-10', 'Racer', 25, 10))).toBe('$43.13');
    });

    test('racer surcharge does not apply in low season', () => {
      expect(norm(price('A', 'B', '2024-02-12', '2024-02-12', 'Racer', 25, 10))).toBe('$25');
    });

    test('high season (April-October) adds 15%', () => {
      expect(norm(price('A', 'B', '2024-04-15', '2024-04-15', 'Compact', 100, 10))).toBe('$115');
      expect(norm(price('A', 'B', '2024-10-15', '2024-10-15', 'Compact', 100, 10))).toBe('$115');
    });

    test('low season (November-March) has no 15% increase', () => {
      expect(norm(price('A', 'B', '2024-03-18', '2024-03-18', 'Compact', 100, 10))).toBe('$100');
      expect(norm(price('A', 'B', '2024-11-18', '2024-11-18', 'Compact', 100, 10))).toBe('$100');
    });

    test('more than 10 days in low season gets 10% discount', () => {
      expect(norm(price('A', 'B', '2024-02-12', '2024-02-22', 'Compact', 100, 10))).toBe('$999');
    });

    test('more than 10 days in high season does not get 10% discount', () => {
      expect(norm(price('A', 'B', '2024-06-10', '2024-06-20', 'Compact', 100, 10))).toBe('$1276.5');
    });

    test('minimum daily price equals driver age', () => {
      expect(norm(price('A', 'B', '2024-02-12', '2024-02-12', 'Compact', 37, 10))).toBe('$37');
      expect(norm(price('A', 'B', '2024-02-12', '2024-02-14', 'Compact', 37, 10))).toBe('$111');
    });
  });

  describe('Task 1 new requirements (TDD expectations)', () => {
    test('driver with less than one year license cannot rent', () => {
      expect(price('A', 'B', '2024-02-12', '2024-02-12', 'Compact', 30, 0.5)).toBe(
        'Driver license held for less than a year - cannot rent'
      );
    });

    test('driver with one year license can rent', () => {
      expect(norm(price('A', 'B', '2024-02-12', '2024-02-12', 'Compact', 30, 1))).toBe('$39');
    });

    test('driver with less than two years license gets +30%', () => {
      expect(norm(price('A', 'B', '2024-02-12', '2024-02-12', 'Compact', 30, 1.5))).toBe('$39');
    });

    test('driver with two years license does not get +30%', () => {
      expect(norm(price('A', 'B', '2024-02-12', '2024-02-12', 'Compact', 30, 2))).toBe('$30');
    });

    test('driver with less than three years license gets +15 euros/day in high season', () => {
      expect(norm(price('A', 'B', '2024-06-10', '2024-06-12', 'Compact', 30, 2.5))).toBe('$148.5');
    });
  });

  describe('Task 3 weekday/weekend pricing (TDD expectations)', () => {
    test('weekday-only rental keeps regular pricing', () => {
      expect(norm(price('A', 'B', '2024-01-08', '2024-01-10', 'Compact', 50, 10))).toBe('$150');
    });

    test('README example: Thursday-Friday-Saturday totals $152.50', () => {
      expect(norm(price('A', 'B', '2024-01-11', '2024-01-13', 'Compact', 50, 10))).toBe('$152.5');
    });

    test('Friday-Saturday-Sunday applies weekend increase for two days', () => {
      expect(norm(price('A', 'B', '2024-01-12', '2024-01-14', 'Compact', 50, 10))).toBe('$155');
    });
  });
  describe('Booking form wiring', () => {
    const LOW_SEASON_DAY = '2024-02-12';
    const HIGH_SEASON_DAY = '2024-06-10';

    // Reads the car type options straight out of the booking form, so the
    // form and the price calculator are checked against each other rather
    // than each against the test author's assumptions.
    function carTypeOptions() {
      const formPath = path.join(__dirname, 'form.html');
      if (!fs.existsSync(formPath)) {
        throw new Error('form.html not found - the booking form is part of the deliverable');
      }
      const html = fs.readFileSync(formPath, 'utf8');
      const select = html.match(/<select[^>]*name="type"[\s\S]*?<\/select>/i);
      if (select === null) {
        throw new Error('No <select name="type"> found in form.html');
      }
      return [...select[0].matchAll(/<option[^>]*value="([^"]*)"/gi)].map((m) => m[1]);
    }

    test('the booking form offers four car types', () => {
      expect(carTypeOptions()).toHaveLength(4);
    });

    test('exactly one car type offered by the form can be rented by a 20-year-old', () => {
      const rentable = carTypeOptions().filter(
        (value) =>
          !String(price('A', 'B', LOW_SEASON_DAY, LOW_SEASON_DAY, value, 20, 10)).includes(
            'only rent Compact'
          )
      );
      expect(rentable).toHaveLength(1);
    });

    test('exactly one car type offered by the form gets the racer surcharge', () => {
      const baseline = norm(price('A', 'B', HIGH_SEASON_DAY, HIGH_SEASON_DAY, 'Compact', 25, 10));
      const surcharged = carTypeOptions().filter(
        (value) =>
          norm(price('A', 'B', HIGH_SEASON_DAY, HIGH_SEASON_DAY, value, 25, 10)) !== baseline
      );
      expect(surcharged).toHaveLength(1);
    });
  });
});
