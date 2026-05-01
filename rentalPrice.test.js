const { calculatePrice } = require("./rentalPrice");

describe("calculatePrice()", () => {
  const d = (iso) => Date.parse(iso);

  const DAY = {
    jan01: d("2024-01-01"), // Monday
    jan02: d("2024-01-02"), // Tuesday
    jan03: d("2024-01-03"), // Wednesday
    jan04: d("2024-01-04"), // Thursday
    jan05: d("2024-01-05"), // Friday
    jan06: d("2024-01-06"), // Saturday
    jan07: d("2024-01-07"), // Sunday
    jan10: d("2024-01-10"),
    jan15: d("2024-01-15"),
    jan19: d("2024-01-19"),
    apr01: d("2024-04-01"), // Monday
    apr04: d("2024-04-04"), // Thursday
    apr05: d("2024-04-05"), // Friday
    apr06: d("2024-04-06")
  };

  // License dates (assuming today is 2026-04-29)
  const LICENSE = {
    years0: d("2026-04-29"), // 0 years
    years1: d("2025-04-29"), // 1 year
    years2: d("2024-04-29"), // 2 years
    years3: d("2023-04-29"), // 3 years
    years5: d("2021-04-29")
  };

  describe("input constraints", () => {
    it("returns error if driver is under 18", () => {
      const result = calculatePrice("Compact", 17, LICENSE.years5, DAY.apr01, DAY.apr05);
      expect(result).toBe("Driver too young - cannot quote the price");
    });

    it("returns error if license tenure is less than 1 year", () => {
      const result = calculatePrice("Compact", 25, LICENSE.years0, DAY.apr01, DAY.apr05);
      expect(result).toBe("Driver must have at least 1 year of driving experience to rent a car");
    });

    it("restricts 18–21 to Compact only", () => {
      const result = calculatePrice("Racer", 20, LICENSE.years3, DAY.apr01, DAY.apr05);
      expect(result).toBe("Drivers 21 y/o or less can only rent Compact vehicles");
    });
  });

  describe("pricing basics", () => {
    it("uses age as the minimum daily base", () => {
      const price = calculatePrice("Compact", 30, LICENSE.years5, DAY.jan01, DAY.jan01);
      expect(price).toBe("$30.00");
    });
  });

  describe("license-based adjustments", () => {
    it("adds 30% when license tenure is under 2 years", () => {
      const price = calculatePrice("Compact", 20, LICENSE.years1, DAY.jan01, DAY.jan01);
      expect(price).toBe("$26.00"); // 20 * 1.3
    });

    it("adds +€15/day for license under 3 years during high season (then season multiplier)", () => {
      const price = calculatePrice("Compact", 30, LICENSE.years2, DAY.apr01, DAY.apr01);
      expect(price).toBe("$51.75"); // (30 + 15) * 1.15
    });
  });

  describe("car-type rules", () => {
    it("applies +50% for Racer (young-driver surcharge) in high season", () => {
      const price = calculatePrice("Racer", 25, LICENSE.years5, DAY.apr01, DAY.apr01);
      expect(price).toBe("$43.12"); // 25 * 1.5 * 1.15 = 43.125 -> 43.13
    });

    it("does not apply Racer +50% in low season", () => {
      const price = calculatePrice("Racer", 25, LICENSE.years5, DAY.jan01, DAY.jan01);
      expect(price).toBe("$25.00");
    });
  });

  describe("season / duration effects", () => {
    it("high season adds 15% to total", () => {
      const price = calculatePrice("Compact", 20, LICENSE.years5, DAY.apr01, DAY.apr05);
      expect(price).toBe("$115.00"); // 5*20*1.15
    });

    it("low-season discount applies only for rentals longer than 10 days", () => {
      const price = calculatePrice("Compact", 30, LICENSE.years5, DAY.jan01, DAY.jan19);
      expect(price).toBe("$518.40"); // 15 weekdays*30 + 4 weekends*31.50 = 450 + 126 = 576; 576 * 0.9 = 518.40
    });

    it("no low-season discount when duration is 10 days or less", () => {
      const price = calculatePrice("Compact", 30, LICENSE.years5, DAY.jan01, DAY.jan10);
      expect(price).toBe("$303.00"); // 8 weekdays*30 + 2 weekends*31.50 = 240 + 63 = 303 (no discount, not > 10)
    });
  });

  describe("weekend pricing", () => {
    it("weekday rental (Mon-Tue-Wed) charges regular rate", () => {
      // 50-year-old rents Jan 1-3 (Mon, Tue, Wed) = all weekdays
      const price = calculatePrice("Compact", 50, LICENSE.years5, DAY.jan01, DAY.jan03);
      expect(price).toBe("$150.00"); // 50 * 3 = 150
    });

    it("mixed weekday/weekend rental (Thu-Fri-Sat) adds 5% for weekend days", () => {
      // 50-year-old rents Jan 4-6 (Thu, Fri, Sat) = 2 weekdays + 1 weekend
      const price = calculatePrice("Compact", 50, LICENSE.years5, DAY.jan04, DAY.jan06);
      expect(price).toBe("$152.50"); // 50 + 50 + (50 * 1.05) = 152.50
    });

    it("full weekend rental (Sat-Sun) applies 5% for both days", () => {
      // 50-year-old rents Jan 6-7 (Sat, Sun)
      const price = calculatePrice("Compact", 50, LICENSE.years5, DAY.jan06, DAY.jan06);
      expect(price).toBe("$52.50"); // 50 * 1.05 = 52.50
    });

    it("weekend pricing applies correctly with license surcharge", () => {
      // 30-year-old with <2 years license, Thu-Fri-Sat
      // Daily: (30) * 1.05 (Sat) or 30 (Thu, Fri)
      // Total before multiplier: 30 + 30 + 31.50 = 91.50
      // With 30% license surcharge: 91.50 * 1.3 = 118.95
      const price = calculatePrice("Compact", 30, LICENSE.years1, DAY.jan04, DAY.jan06);
      expect(price).toBe("$118.95");
    });

    it("weekend pricing applies correctly with season multiplier", () => {
      // 30-year-old, Thu-Fri-Sat in April (high season)
      // Daily: (30) * 1.05 (Sat) or 30 (Thu, Fri)
      // Total before season: 30 + 30 + 31.50 = 91.50
      // With 15% high season: 91.50 * 1.15 = 105.225 -> 105.22 (floats)
      const price = calculatePrice("Compact", 30, LICENSE.years5, DAY.apr04, DAY.apr06);
      expect(price).toBe("$105.22");
    });
  });
});