const {
  price,
  validateRentalEligibility,
  isHighSeason,
  isWeekend,
  calculateRentalDays,
  applyRacerYoungDriverSurcharge,
  applyHighSeasonSurcharge,
  applyLongRentalDiscount,
  applyInexperiencedDriverSurcharge,
  applyInexperiencedDriverHighSeasonSurcharge,
  calculateDailyPrice
} = require("./rentalPrice");

describe("validateRentalEligibility", () => {
  test("returns error if driver is under 18", () => {
    expect(validateRentalEligibility(17, "Compact", 2)).toBe(
      "Driver too young - cannot quote the price"
    );
  });

  test("returns null if driver is exactly 18", () => {
    expect(validateRentalEligibility(18, "Compact", 2)).toBeNull();
  });

  test("returns error if driver aged 18-21 tries to rent non-Compact", () => {
    expect(validateRentalEligibility(20, "Racer", 2)).toBe(
      "Drivers 21 y/o or less can only rent Compact vehicles"
    );
  });

  test("returns null if driver aged 21 rents Compact", () => {
    expect(validateRentalEligibility(21, "Compact", 2)).toBeNull();
  });

  test("returns null if driver aged 22 rents Racer", () => {
    expect(validateRentalEligibility(22, "Racer", 2)).toBeNull();
  });

  test("returns error for unknown car class", () => {
    expect(validateRentalEligibility(30, "Helicopter", 2)).toBe("Unknown car class");
  });

  test("returns error if license held for less than 1 year", () => {
    expect(validateRentalEligibility(25, "Compact", 0.5)).toBe(
      "Driver license held for less than a year - cannot rent"
    );
  });

  test("returns null if license held for exactly 1 year", () => {
    expect(validateRentalEligibility(25, "Compact", 1)).toBeNull();
  });
});

describe("isHighSeason", () => {
  test("April is high season", () => {
    expect(isHighSeason("2024-04-01")).toBe(true);
  });

  test("October is high season", () => {
    expect(isHighSeason("2024-10-31")).toBe(true);
  });

  test("July is high season", () => {
    expect(isHighSeason("2024-07-15")).toBe(true);
  });

  test("March is low season", () => {
    expect(isHighSeason("2024-03-31")).toBe(false);
  });

  test("November is low season", () => {
    expect(isHighSeason("2024-11-01")).toBe(false);
  });

  test("January is low season", () => {
    expect(isHighSeason("2024-01-10")).toBe(false);
  });
});

describe("isWeekend", () => {
  test("Saturday is a weekend", () => {
    expect(isWeekend("2024-01-06")).toBe(true);
  });

  test("Sunday is a weekend", () => {
    expect(isWeekend("2024-01-07")).toBe(true);
  });

  test("Monday is not a weekend", () => {
    expect(isWeekend("2024-01-08")).toBe(false);
  });

  test("Friday is not a weekend", () => {
    expect(isWeekend("2024-01-05")).toBe(false);
  });
});

describe("calculateRentalDays", () => {
  test("same day rental = 1 day", () => {
    expect(calculateRentalDays("2024-06-01", "2024-06-01")).toBe(1);
  });

  test("two consecutive days = 2 days", () => {
    expect(calculateRentalDays("2024-06-01", "2024-06-02")).toBe(2);
  });

  test("10-day rental", () => {
    expect(calculateRentalDays("2024-06-01", "2024-06-10")).toBe(10);
  });

  test("11-day rental", () => {
    expect(calculateRentalDays("2024-06-01", "2024-06-11")).toBe(11);
  });
});

describe("calculateDailyPrice", () => {
  test("weekday returns base price", () => {
    expect(calculateDailyPrice(50, "2024-01-08")).toBe(50);
  });

  test("weekend returns base price + 5%", () => {
    expect(calculateDailyPrice(50, "2024-01-06")).toBeCloseTo(52.5);
  });
});

describe("applyRacerYoungDriverSurcharge", () => {
  test("Racer + age 25 + high season adds 50%", () => {
    expect(applyRacerYoungDriverSurcharge(100, "Racer", 25, true)).toBe(150);
  });

  test("Racer + age 25 + low season has no surcharge", () => {
    expect(applyRacerYoungDriverSurcharge(100, "Racer", 25, false)).toBe(100);
  });

  test("Racer + age 26 + high season has no surcharge", () => {
    expect(applyRacerYoungDriverSurcharge(100, "Racer", 26, true)).toBe(100);
  });

  test("Compact + age 25 + high season has no surcharge", () => {
    expect(applyRacerYoungDriverSurcharge(100, "Compact", 25, true)).toBe(100);
  });
});

describe("applyHighSeasonSurcharge", () => {
  test("high season adds 15%", () => {
    expect(applyHighSeasonSurcharge(100, true)).toBeCloseTo(115);
  });

  test("low season has no change", () => {
    expect(applyHighSeasonSurcharge(100, false)).toBe(100);
  });
});

describe("applyLongRentalDiscount", () => {
  test("11 days in low season gets 10% discount", () => {
    expect(applyLongRentalDiscount(100, 11, false)).toBeCloseTo(90);
  });

  test("exactly 10 days in low season gets no discount", () => {
    expect(applyLongRentalDiscount(100, 10, false)).toBe(100);
  });

  test("11 days in high season gets no discount", () => {
    expect(applyLongRentalDiscount(100, 11, true)).toBe(100);
  });

  test("5 days in low season gets no discount", () => {
    expect(applyLongRentalDiscount(100, 5, false)).toBe(100);
  });
});

describe("applyInexperiencedDriverSurcharge", () => {
  test("license under 2 years adds 30%", () => {
    expect(applyInexperiencedDriverSurcharge(100, 1)).toBeCloseTo(130);
  });

  test("license of exactly 2 years has no surcharge", () => {
    expect(applyInexperiencedDriverSurcharge(100, 2)).toBe(100);
  });

  test("license of 3 years has no surcharge", () => {
    expect(applyInexperiencedDriverSurcharge(100, 3)).toBe(100);
  });
});

describe("applyInexperiencedDriverHighSeasonSurcharge", () => {
  test("license under 3 years in high season adds 15 per day", () => {
    expect(applyInexperiencedDriverHighSeasonSurcharge(100, 2, 3, true)).toBeCloseTo(145);
  });

  test("license of 3 years in high season has no surcharge", () => {
    expect(applyInexperiencedDriverHighSeasonSurcharge(100, 3, 3, true)).toBe(100);
  });

  test("license under 3 years in low season has no surcharge", () => {
    expect(applyInexperiencedDriverHighSeasonSurcharge(100, 2, 3, false)).toBe(100);
  });
});

describe("price - integration", () => {
  test("driver under 18 returns error", () => {
    expect(price("A", "B", "2024-06-01", "2024-06-01", "Compact", 17, 2)).toBe(
      "Driver too young - cannot quote the price"
    );
  });

  test("driver 20 renting Racer returns error", () => {
    expect(price("A", "B", "2024-06-01", "2024-06-01", "Racer", 20, 2)).toBe(
      "Drivers 21 y/o or less can only rent Compact vehicles"
    );
  });

  test("license under 1 year returns error", () => {
    expect(price("A", "B", "2024-06-01", "2024-06-01", "Compact", 25, 0.5)).toBe(
      "Driver license held for less than a year - cannot rent"
    );
  });

  test("30 y/o, 1 day, low season, license 5 years returns base price", () => {
    expect(price("A", "B", "2024-01-01", "2024-01-01", "Compact", 30, 5)).toBe("$30");
  });

  test("30 y/o, 1 day, high season adds 15%", () => {
    expect(price("A", "B", "2024-06-03", "2024-06-03", "Compact", 30, 5)).toBe("$34.5");
  });

  test("30 y/o, 11 days, low season gets 10% discount", () => {
    expect(price("A", "B", "2024-01-01", "2024-01-11", "Compact", 30, 5)).toBe("$299.7");
  });

  test("25 y/o, Racer, 1 day, high season gets Racer surcharge", () => {
    expect(price("A", "B", "2024-06-03", "2024-06-03", "Racer", 25, 5)).toBe("$43.13");
  });

  test("25 y/o, Racer, 1 day, low season has no Racer surcharge", () => {
    expect(price("A", "B", "2024-01-01", "2024-01-01", "Racer", 25, 5)).toBe("$25");
  });

  test("weekday Mon-Wed 50 y/o totals 150", () => {
    expect(price("A", "B", "2024-01-08", "2024-01-10", "Compact", 50, 10)).toBe("$150");
  });

  test("Thu-Fri-Sat 50 y/o totals 152.5", () => {
    expect(price("A", "B", "2024-01-11", "2024-01-13", "Compact", 50, 10)).toBe("$152.5");
  });
});
