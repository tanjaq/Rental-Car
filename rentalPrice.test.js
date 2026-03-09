const { price } = require("./rentalPrice");

function amount(result) {
  return Number(result.slice(1));
}

describe("rentalPrice", () => {
  test("rejects drivers under 18", () => {
    expect(price("A", "B", "2024-02-10", "2024-02-10", "Compact", 17))
      .toBe("Driver too young - cannot quote the price");
  });

  test("age 18-21 can only rent compact", () => {
    expect(price("A", "B", "2024-02-10", "2024-02-10", "Electric", 21))
      .toBe("Drivers 21 y/o or less can only rent Compact vehicles");
    expect(price("A", "B", "2024-02-10", "2024-02-10", "Compact", 21)).toBe("$21");
  });

  test("supports all known car classes and unknown class fallback path", () => {
    expect(price("A", "B", "2024-02-10", "2024-02-10", "Compact", 30)).toBe("$30");
    expect(price("A", "B", "2024-02-10", "2024-02-10", "Electric", 30)).toBe("$30");
    expect(price("A", "B", "2024-02-10", "2024-02-10", "Cabrio", 30)).toBe("$30");
    expect(price("A", "B", "2024-02-10", "2024-02-10", "Racer", 30)).toBe("$30");
    expect(price("A", "B", "2024-02-10", "2024-02-10", "UnknownType", 30)).toBe("$30");
  });

  test("applies racer surcharge in high season for age 25 or less", () => {
    const result = price("A", "B", "2024-06-10", "2024-06-10", "Racer", 25);
    expect(amount(result)).toBeCloseTo(43.125, 10);
  });

  test("does not apply racer surcharge for racer age over 25", () => {
    const result = price("A", "B", "2024-06-10", "2024-06-10", "Racer", 26);
    expect(amount(result)).toBeCloseTo(29.9, 10);
  });

  test("does not apply racer surcharge in low season", () => {
    const result = price("A", "B", "2024-02-10", "2024-02-10", "Racer", 25);
    expect(result).toBe("$25");
  });

  test("applies high season multiplier for April to October", () => {
    expect(amount(price("A", "B", "2024-04-10", "2024-04-10", "Compact", 100)))
      .toBeCloseTo(115, 10);
    expect(amount(price("A", "B", "2024-10-10", "2024-10-10", "Compact", 100)))
      .toBeCloseTo(115, 10);
  });

  test("keeps low season base pricing for November to March", () => {
    expect(price("A", "B", "2024-02-10", "2024-02-10", "Compact", 100)).toBe("$100");
    expect(price("A", "B", "2024-11-10", "2024-11-10", "Compact", 100)).toBe("$100");
  });

  test("treats mixed low/high month range as high season", () => {
    const result = price("A", "B", "2024-02-10", "2024-11-10", "Compact", 30);
    expect(amount(result)).toBeCloseTo(9487.5, 10);
  });

  test("applies low season discount only when rental is longer than 10 days", () => {
    expect(price("A", "B", "2024-02-10", "2024-02-20", "Compact", 100)).toBe("$990");
    expect(price("A", "B", "2024-02-10", "2024-02-19", "Compact", 100)).toBe("$1000");
  });

  test("does not apply low season discount in high season even for long rentals", () => {
    expect(price("A", "B", "2024-06-10", "2024-06-20", "Compact", 100)).toBe("$1265");
  });

  test("counts rental days inclusively", () => {
    expect(price("A", "B", "2024-02-10", "2024-02-10", "Compact", 30)).toBe("$30");
    expect(price("A", "B", "2024-02-10", "2024-02-12", "Compact", 30)).toBe("$90");
  });
});
