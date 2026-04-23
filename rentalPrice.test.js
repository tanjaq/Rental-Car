const {
  price,
  getCarClass,
  getRentalDays,
  getSeason,
  countWeekendDays
} = require("./rentalPrice");

describe("getCarClass", () => {
  test("returns known car class names", () => {
    expect(getCarClass("Compact")).toBe("Compact");
    expect(getCarClass("Electric")).toBe("Electric");
    expect(getCarClass("Cabrio")).toBe("Cabrio");
    expect(getCarClass("Racer")).toBe("Racer");
  });

  test("returns Unknown for unsupported car types", () => {
    expect(getCarClass("Truck")).toBe("Unknown");
  });
});

describe("getRentalDays", () => {
  test("counts rental days inclusively", () => {
    const pickupDate = Date.parse("2026-04-13");
    const dropoffDate = Date.parse("2026-04-15");

    expect(getRentalDays(pickupDate, dropoffDate)).toBe(3);
  });

  test("handles dates that are passed in reverse order", () => {
    const pickupDate = Date.parse("2026-04-15");
    const dropoffDate = Date.parse("2026-04-13");

    expect(getRentalDays(pickupDate, dropoffDate)).toBe(3);
  });

  test("returns one day for same-day rentals", () => {
    const pickupDate = Date.parse("2026-04-13");
    const dropoffDate = Date.parse("2026-04-13");

    expect(getRentalDays(pickupDate, dropoffDate)).toBe(1);
  });
});

describe("getSeason", () => {
  test("returns High for dates inside the high season", () => {
    expect(
      getSeason(Date.parse("2026-07-01"), Date.parse("2026-07-03"))
    ).toBe("High");
  });

  test("returns High when rental crosses from low to high season", () => {
    expect(
      getSeason(Date.parse("2026-03-30"), Date.parse("2026-04-02"))
    ).toBe("High");
  });

  test("returns Low for dates fully inside the low season", () => {
    expect(
      getSeason(Date.parse("2026-11-10"), Date.parse("2026-11-12"))
    ).toBe("Low");
  });
});

describe("countWeekendDays", () => {
  test("counts Saturday and Sunday inside the rental period", () => {
    const pickupDate = Date.parse("2026-04-16");
    const dropoffDate = Date.parse("2026-04-20");

    expect(countWeekendDays(pickupDate, dropoffDate)).toBe(2);
  });

  test("returns zero when the rental period has no weekend days", () => {
    const pickupDate = Date.parse("2026-04-13");
    const dropoffDate = Date.parse("2026-04-15");

    expect(countWeekendDays(pickupDate, dropoffDate)).toBe(0);
  });
});

describe("price", () => {
  test("rejects drivers younger than 18", () => {
    const result = price(
      "Tallinn",
      "Tartu",
      Date.parse("2026-04-13"),
      Date.parse("2026-04-13"),
      "Compact",
      17,
      5
    );

    expect(result).toBe("Driver too young - cannot quote the price");
  });

  test("rejects young drivers who request a non-compact car", () => {
    const result = price(
      "Tallinn",
      "Tartu",
      Date.parse("2026-04-13"),
      Date.parse("2026-04-13"),
      "Electric",
      21,
      5
    );

    expect(result).toBe("Drivers 21 y/o or less can only rent Compact vehicles");
  });

  test("rejects drivers who have held a license for less than one year", () => {
    const result = price(
      "Tallinn",
      "Tartu",
      Date.parse("2026-04-13"),
      Date.parse("2026-04-13"),
      "Compact",
      30,
      0
    );

    expect(result).toBe("Driver must hold a license for at least 1 year");
  });

  test("adds 30 percent when the license is younger than two years", () => {
    const result = price(
      "Tallinn",
      "Tartu",
      Date.parse("2026-11-10"),
      Date.parse("2026-11-10"),
      "Compact",
      30,
      1
    );

    expect(result).toBe("$39.00");
  });

  test("adds 15 euros per day in high season when the license is younger than three years", () => {
    const result = price(
      "Tallinn",
      "Tartu",
      Date.parse("2026-07-01"),
      Date.parse("2026-07-03"),
      "Compact",
      30,
      2
    );

    expect(result).toBe("$155.25");
  });

  test("adds the racer surcharge only in high season for drivers aged 25 or less", () => {
    const result = price(
      "Tallinn",
      "Tartu",
      Date.parse("2026-07-01"),
      Date.parse("2026-07-03"),
      "Racer",
      25,
      5
    );

    expect(result).toBe("$129.38");
  });

  test("applies a low-season discount for rentals longer than 10 days", () => {
    const result = price(
      "Tallinn",
      "Tartu",
      Date.parse("2026-11-01"),
      Date.parse("2026-11-11"),
      "Compact",
      40,
      5
    );

    expect(result).toBe("$401.40");
  });

  test("keeps weekday pricing unchanged in the TDD scenario", () => {
    const result = price(
      "Tallinn",
      "Tartu",
      Date.parse("2026-01-12"),
      Date.parse("2026-01-14"),
      "Compact",
      50,
      5
    );

    expect(result).toBe("$150.00");
  });

  test("increases the total when the rental includes one weekend day in the TDD scenario", () => {
    const result = price(
      "Tallinn",
      "Tartu",
      Date.parse("2026-01-15"),
      Date.parse("2026-01-17"),
      "Compact",
      50,
      5
    );

    expect(result).toBe("$152.50");
  });

  test("uses the default license years when the argument is omitted", () => {
    const result = price(
      "Tallinn",
      "Tartu",
      Date.parse("2026-01-12"),
      Date.parse("2026-01-14"),
      "Compact",
      50
    );

    expect(result).toBe("$150.00");
  });
});
