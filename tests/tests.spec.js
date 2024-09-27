const { price, getWeekendPrice } = require('../rentalPrice.js');

describe('Business Requirements', () => {
    test('Individuals under the age of 18 are ineligible to rent a car.', () => {
    const result = price(
        "aaaaaaaaaaaaa",
        "bbbbbbbbbbbbbb",
        "Compact",
        17,
        "2016-08-21"
    );
      expect(result).toBe("Driver too young - cannot quote the price");
    });

    test('Those aged 18-21 can only rent Compact cars.', () => {
      const result = price(
          "aaaaaaaaaaaaa",
          "bbbbbbbbbbbbbb",
          "Racer",
          20,
          "2016-08-21"
      );
        expect(result).toBe("Drivers 21 y/o or less can only rent Compact vehicles");
      });

      test('For Racers, the price is increased by 50% if the driver is 25 years old or younger (except during the low season).', () => {
         const result = price(
            "2020-05-09",
            "2020-05-09",
            "Racer",
            23,
            "2016-08-21"
        );
          expect(result).toBe(((23*1.5)*1.15).toFixed(2));
        });


      test('Individuals holding a drivers license for less than a year are ineligible to rent', () => {
        const result = price(
            "aaaaaaaaaaaaa",
            "bbbbbbbbbbbbbb",
            "Compact",
            22,
            "2024-01-01"
        );  
          expect(result).toBe("Drivers holding a driver's license for less than a year are ineligible to rent");
        });

        test('The minimum rental price per day is equivalent to the age of the driver', () => {
          const result = price(
              "2023-12-01",
              "2023-12-01",
              "Compact",
              22,
              "2016-08-21"
          );  
            expect(result).toBe((22*1).toFixed(2));
          });
  
  });


  describe('Wekday/Weekend Pricing', () => {
    test('Ensure that pricing is different for weekdays and weekends', () => {

        expect(getWeekendPrice('2024-10-02',50,3)).toBe((50*3));
      });

      test('Ensure that pricing is different for weekdays and weekends', () => {

        expect(getWeekendPrice('2024-09-05',50,3)).toBe((50*2)+((50*1.05)*1));
      })
});