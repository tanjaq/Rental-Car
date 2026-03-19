const rentalPrice = require("./rentalPrice");

describe("rental price calculator", () => {
  const pickup = "Tallinn";
  const dropoff = "Tartu";

  function createTimestamp(date) {
    return Date.parse(date);
  }

  function calculatePrice({
    pickupDate,
    dropoffDate,
    type,
    age,
    licenseYearsHeld
  }) {
    return rentalPrice.price(
      pickup,
      dropoff,
      createTimestamp(pickupDate),
      createTimestamp(dropoffDate),
      type,
      age,
      licenseYearsHeld
    );
  }

  test("rejects drivers younger than 18", () => {
    expect(
      calculatePrice({
        pickupDate: "2026-01-10",
        dropoffDate: "2026-01-10",
        type: "Compact",
        age: 17,
        licenseYearsHeld: 5
      })
    ).toBe("Driver too young - cannot quote the price");
  });

  test("rejects drivers with less than one year of license history", () => {
    expect(
      calculatePrice({
        pickupDate: "2026-01-10",
        dropoffDate: "2026-01-10",
        type: "Compact",
        age: 25,
        licenseYearsHeld: 0.9
      })
    ).toBe("Driver license held for less than a year - cannot rent");
  });

  test("drivers aged 18-21 can only rent compact cars", () => {
    expect(
      calculatePrice({
        pickupDate: "2026-01-10",
        dropoffDate: "2026-01-10",
        type: "Electric",
        age: 21,
        licenseYearsHeld: 5
      })
    ).toBe("Drivers 21 y/o or less can only rent Compact vehicles");
  });

  test("accepts lowercase compact type values after normalization", () => {
    expect(
      calculatePrice({
        pickupDate: "2026-01-05",
        dropoffDate: "2026-01-05",
        type: "compact",
        age: 20,
        licenseYearsHeld: 5
      })
    ).toBe("$20");
  });

  test("treats unknown car types as non-compact for young drivers", () => {
    expect(
      calculatePrice({
        pickupDate: "2026-01-10",
        dropoffDate: "2026-01-10",
        type: "spaceship",
        age: 20,
        licenseYearsHeld: 5
      })
    ).toBe("Drivers 21 y/o or less can only rent Compact vehicles");
  });

  test("applies high season surcharge already in april", () => {
    expect(
      calculatePrice({
        pickupDate: "2026-04-10",
        dropoffDate: "2026-04-10",
        type: "Compact",
        age: 30,
        licenseYearsHeld: 5
      })
    ).toBe("$34.5");
  });

  test("applies long rental discount during low season", () => {
    expect(
      calculatePrice({
        pickupDate: "2026-11-01",
        dropoffDate: "2026-11-11",
        type: "Compact",
        age: 30,
        licenseYearsHeld: 5
      })
    ).toBe("$301.05");
  });

  test("applies racer surcharge for young drivers during high season", () => {
    expect(
      calculatePrice({
        pickupDate: "2026-07-10",
        dropoffDate: "2026-07-10",
        type: "Racer",
        age: 25,
        licenseYearsHeld: 5
      })
    ).toBe("$43.13");
  });

  test("adds 30 percent for drivers with less than two years of license history", () => {
    expect(
      calculatePrice({
        pickupDate: "2026-01-10",
        dropoffDate: "2026-01-10",
        type: "Compact",
        age: 30,
        licenseYearsHeld: 1.5
      })
    ).toBe("$40.95");
  });

  test(
    [
      "adds 15 euros per day during high season",
      "for drivers with less than three years of license history"
    ].join(" "),
    () => {
      expect(
        calculatePrice({
          pickupDate: "2026-07-10",
          dropoffDate: "2026-07-11",
          type: "Compact",
          age: 30,
          licenseYearsHeld: 2.5
        })
      ).toBe("$100.73");
    }
  );

  test("combines the high season and short-license surcharges correctly", () => {
    expect(
      calculatePrice({
        pickupDate: "2026-07-10",
        dropoffDate: "2026-07-11",
        type: "Compact",
        age: 30,
        licenseYearsHeld: 1.5
      })
    ).toBe("$121.94");
  });

  test("keeps the old API working when license years are omitted", () => {
    expect(
      calculatePrice({
        pickupDate: "2026-01-05",
        dropoffDate: "2026-01-05",
        type: "Compact",
        age: 30
      })
    ).toBe("$30");
  });

  test("treats non-numeric license values the same as omitted input", () => {
    expect(
      calculatePrice({
        pickupDate: "2026-01-05",
        dropoffDate: "2026-01-05",
        type: "Compact",
        age: 30,
        licenseYearsHeld: Number.NaN
      })
    ).toBe("$30");
  });

  test(
    "calculates the same rental length when dates are reversed, including weekend pricing",
    () => {
      expect(
        calculatePrice({
          pickupDate: "2026-01-12",
          dropoffDate: "2026-01-10",
          type: "Compact",
          age: 30,
          licenseYearsHeld: 5
        })
      ).toBe("$93");
    }
  );

  test("uses regular pricing for weekday-only rentals", () => {
    expect(
      calculatePrice({
        pickupDate: "2026-01-05",
        dropoffDate: "2026-01-07",
        type: "Compact",
        age: 50,
        licenseYearsHeld: 5
      })
    ).toBe("$150");
  });

  test("adds a 5 percent increase for weekend days in the rental period", () => {
    expect(
      calculatePrice({
        pickupDate: "2026-01-08",
        dropoffDate: "2026-01-10",
        type: "Compact",
        age: 50,
        licenseYearsHeld: 5
      })
    ).toBe("$152.5");
  });

  test("applies the weekend increase to both saturday and sunday", () => {
    expect(
      calculatePrice({
        pickupDate: "2026-01-09",
        dropoffDate: "2026-01-11",
        type: "Compact",
        age: 50,
        licenseYearsHeld: 5
      })
    ).toBe("$155");
  });
});
