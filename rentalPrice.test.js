const {
  calculatePrice,
  validateRentalEligibility,
  isHighSeason,
  calculateRentalDays,
  applyRacerYoungDriverSurcharge,
  applyHighSeasonSurcharge,
  applyLongRentalDiscount,
  applyInexperiencedDriverSurcharge,
  applyInexperiencedDriverHighSeasonSurcharge
} = require("./rentalPrice");

// ─── validateRentalEligibility ────────────────────────────────────────────────

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
      "Driver must hold a license for at least 1 year"
    );
  });

  test("returns null if license held for exactly 1 year", () => {
    expect(validateRentalEligibility(25, "Compact", 1)).toBeNull();
  });
});

// ─── isHighSeason ─────────────────────────────────────────────────────────────

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

// ─── calculateRentalDays ──────────────────────────────────────────────────────

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

// ─── applyRacerYoungDriverSurcharge ──────────────────────────────────────────

describe("applyRacerYoungDriverSurcharge", () => {
  test("Racer + age 25 + high season → +50%", () => {
    expect(applyRacerYoungDriverSurcharge(100, "Racer", 25, true)).toBe(150);
  });

  test("Racer + age 25 + low season → no surcharge", () => {
    expect(applyRacerYoungDriverSurcharge(100, "Racer", 25, false)).toBe(100);
  });

  test("Racer + age 26 + high season → no surcharge", () => {
    expect(applyRacerYoungDriverSurcharge(100, "Racer", 26, true)).toBe(100);
  });

  test("Compact + age 25 + high season → no surcharge", () => {
    expect(applyRacerYoungDriverSurcharge(100, "Compact", 25, true)).toBe(100);
  });
});

// ─── applyHighSeasonSurcharge ─────────────────────────────────────────────────

describe("applyHighSeasonSurcharge", () => {
  test("high season → +15%", () => {
    expect(applyHighSeasonSurcharge(100, true)).toBeCloseTo(115);
  });

  test("low season → no change", () => {
    expect(applyHighSeasonSurcharge(100, false)).toBe(100);
  });
});

// ─── applyLongRentalDiscount ─────────────────────────────────────────────────

describe("applyLongRentalDiscount", () => {
  test("11 days in low season → -10%", () => {
    expect(applyLongRentalDiscount(100, 11, false)).toBeCloseTo(90);
  });

  test("10 days in low season → no discount (not MORE than 10)", () => {
    expect(applyLongRentalDiscount(100, 10, false)).toBe(100);
  });

  test("11 days in high season → no discount", () => {
    expect(applyLongRentalDiscount(100, 11, true)).toBe(100);
  });

  test("5 days in low season → no discount", () => {
    expect(applyLongRentalDiscount(100, 5, false)).toBe(100);
  });
});

// ─── applyInexperiencedDriverSurcharge ───────────────────────────────────────

describe("applyInexperiencedDriverSurcharge", () => {
  test("license < 2 years → +30%", () => {
    expect(applyInexperiencedDriverSurcharge(100, 1)).toBeCloseTo(130);
  });

  test("license exactly 2 years → no surcharge", () => {
    expect(applyInexperiencedDriverSurcharge(100, 2)).toBe(100);
  });

  test("license 3 years → no surcharge", () => {
    expect(applyInexperiencedDriverSurcharge(100, 3)).toBe(100);
  });
});

// ─── applyInexperiencedDriverHighSeasonSurcharge ─────────────────────────────

describe("applyInexperiencedDriverHighSeasonSurcharge", () => {
  test("license < 3 years + high season + 3 days → +45", () => {
    expect(applyInexperiencedDriverHighSeasonSurcharge(100, 2, 3, true)).toBeCloseTo(145);
  });

  test("license 3 years + high season → no surcharge", () => {
    expect(applyInexperiencedDriverHighSeasonSurcharge(100, 3, 3, true)).toBe(100);
  });

  test("license < 3 years + low season → no surcharge", () => {
    expect(applyInexperiencedDriverHighSeasonSurcharge(100, 2, 3, false)).toBe(100);
  });
});

// ─── calculatePrice (integration) ────────────────────────────────────────────

describe("calculatePrice - integration", () => {
  test("driver under 18 → error message", () => {
    expect(calculatePrice("2024-06-01", "2024-06-03", "Compact", 17, 2)).toBe(
      "Driver too young - cannot quote the price"
    );
  });

  test("driver 20 y/o renting Racer → error message", () => {
    expect(calculatePrice("2024-06-01", "2024-06-03", "Racer", 20, 2)).toBe(
      "Drivers 21 y/o or less can only rent Compact vehicles"
    );
  });

  test("license < 1 year → error message", () => {
    expect(calculatePrice("2024-06-01", "2024-06-03", "Compact", 25, 0.5)).toBe(
      "Driver must hold a license for at least 1 year"
    );
  });

  test("30 y/o, 3 days, low season, license 5 years → base price", () => {
    expect(calculatePrice("2024-01-01", "2024-01-03", "Compact", 30, 5)).toBe("$90.00");
  });

  test("30 y/o, 3 days, high season → +15%", () => {
    expect(calculatePrice("2024-06-01", "2024-06-03", "Compact", 30, 5)).toBe("$103.50");
  });

  test("30 y/o, 11 days, low season → -10%", () => {
    expect(calculatePrice("2024-01-01", "2024-01-11", "Compact", 30, 5)).toBe("$297.00");
  });

  test("25 y/o, Racer, 3 days, high season → base x1.5 x1.15", () => {
    expect(calculatePrice("2024-06-01", "2024-06-03", "Racer", 25, 5)).toBe("$129.38");
  });

  test("25 y/o, Racer, 3 days, low season → no Racer surcharge", () => {
    expect(calculatePrice("2024-01-01", "2024-01-03", "Racer", 25, 5)).toBe("$75.00");
  });

  test("30 y/o, 3 days, high season, license 1.5 years → +30% and +15 per day", () => {
    expect(calculatePrice("2024-06-01", "2024-06-03", "Compact", 30, 1.5)).toBe("$179.55");
  });

  test("30 y/o, 3 days, low season, license 2.5 years → no inexperienced surcharges", () => {
    expect(calculatePrice("2024-01-01", "2024-01-03", "Compact", 30, 2.5)).toBe("$90.00");
  });
});
