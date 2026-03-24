const { price } = require("./rentalPrice");

describe("validation errors", () => {
  test("rejects drivers younger than 18", () => {
    expect(() => price("2025-01-01", "2025-01-02", "Compact", 17, 2))
      .toThrow("Driver too young - cannot quote the price");
  });

  test("rejects non-compact rentals for 18-21 year olds", () => {
    expect(() => price("2025-01-01", "2025-01-02", "Racer", 19, 2))
      .toThrow("Drivers 21 y/o or less can only rent Compact vehicles");
    expect(() => price("2025-01-01", "2025-01-02", "Electric", 20, 2))
      .toThrow("Drivers 21 y/o or less can only rent Compact vehicles");
  });

  test("rejects drivers with license under 1 year", () => {
    expect(() => price("2025-01-01", "2025-01-02", "Compact", 30, 0.5))
      .toThrow("Driver must have a license for at least 1 year");
  });

  test("rejects unknown vehicle class", () => {
    expect(() => price("2025-01-01", "2025-01-02", "Spaceship", 30, 5))
      .toThrow("Unknown vehicle class");
    expect(() => price("2025-01-01", "2025-01-02", undefined, 30, 5))
      .toThrow("Unknown vehicle class");
  });

  test("rejects invalid age or license values", () => {
    expect(() => price("2025-01-01", "2025-01-02", "Compact", "abc", "def"))
      .toThrow("Invalid age or license duration");
  });

  test("rejects invalid dates and dropoff before pickup", () => {
    expect(() => price("not-a-date", "2025-01-02", "Compact", 30, 2))
      .toThrow("Invalid date");
    expect(() => price("2025-01-10", "2025-01-01", "Compact", 30, 2))
      .toThrow("Dropoff date cannot be before pickup date");
  });

  test("removes .00 for rentals in 2026 or later", () => {
    const result = price("2026-01-01", "2026-01-02", "Compact", 30, 10);
    expect(result).toBe("$60"); // assuming the total calculates to 60.00
  });
});

describe("pricing rules", () => {
  test("base price in low season uses driver's age per day", () => {
    expect(price("2025-01-01", "2025-01-03", "Compact", 30, 5)).toBe("$90.00");
  });

  test("adds 15% surcharge in high season", () => {
    expect(price("2025-07-01", "2025-07-01", "Compact", 30, 5)).toBe("$34.50");
  });

  test("detects high season when rental crosses March to April boundary", () => {
    expect(price("2025-03-30", "2025-04-02", "Compact", 30, 5)).toBe("$139.72");
  });

  test("adds 50% for young Racer drivers in high season only", () => {
    expect(price("2025-07-01", "2025-07-01", "Racer", 23, 5)).toBe("$39.67");
    expect(price("2025-01-01", "2025-01-01", "Racer", 23, 5)).toBe("$23.00");
  });

  test("applies license surcharges when under 2 or 3 years", () => {
    expect(price("2025-06-01", "2025-06-01", "Compact", 30, 1.5)).toBe("$70.64");
  });

  test("extra 15 EUR for <3y license only in high season", () => {
    expect(price("2025-07-01", "2025-07-01", "Compact", 30, 2.5)).toBe("$51.75");
    expect(price("2025-02-01", "2025-02-01", "Compact", 30, 2.5)).toBe("$31.50");
  });

  test("accepts Electric and Cabrio classes", () => {
    expect(price("2025-05-01", "2025-05-01", "Electric", 40, 10)).toBe("$46.00");
    expect(price("2025-02-01", "2025-02-01", "Cabrio", 40, 10)).toBe("$42.00");
  });

  test("long rentals get 10% discount only in low season", () => {
    expect(price("2025-01-01", "2025-01-12", "Compact", 25, 1)).toBe("$356.85");
    expect(price("2025-07-01", "2025-07-12", "Compact", 25, 5)).toBe("$349.31");
  });

  test("minimum daily price matches driver's age even after discounts", () => {
    expect(price("2025-01-01", "2025-01-11", "Compact", 20, 5)).toBe("$220.00");
  });

  test("2-day weekend rental counts as 3 billable days", () => {
    const result = price("2025-01-04", "2025-01-05", "Compact", 30, 5);
    expect(result).toBe("$94.50");
  });
});
