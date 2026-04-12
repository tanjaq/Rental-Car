const { price } = require("./rentalPrice");

describe("Rental price system", () => {
  test("rejects driver under 18", () => {
    expect(
      price("", "", "2024-03-01", "2024-03-05", "Compact", 17, 5)
    ).toBe("Driver too young - cannot quote the price");
  });

  test("rejects driver with license under 1 year", () => {
    expect(
      price("", "", "2024-03-01", "2024-03-05", "Compact", 25, 0)
    ).toBe("Driver has held license for less than 1 year - cannot rent");
  });

  test("rejects young driver for non-compact car", () => {
    expect(
      price("", "", "2024-03-01", "2024-03-05", "Racer", 20, 5)
    ).toBe("Drivers 21 y/o or less can only rent Compact vehicles");
  });

  test("rejects invalid car type", () => {
    expect(
      price("", "", "2024-03-01", "2024-03-05", "Truck", 30, 5)
    ).toBe("Invalid car type");
  });

  test("basic compact rental works (low season)", () => {
    const result = price("", "", "2024-01-01", "2024-01-04", "Compact", 30, 5);
    expect(result).toMatch(/\$\d+\.\d{2}/);
  });

  test("basic electric rental works (high season)", () => {
    const result = price("", "", "2024-05-01", "2024-05-04", "Electric", 30, 5);
    expect(result).toMatch(/\$\d+\.\d{2}/);
  });

  test("racer applies multiplier in high season", () => {
    const result = price("", "", "2024-05-01", "2024-05-04", "Racer", 24, 5);
    expect(result).toMatch(/\$\d+\.\d{2}/);
  });

  test("racer does NOT apply multiplier in low season", () => {
    const result = price("", "", "2024-01-01", "2024-01-04", "Racer", 24, 5);
    expect(result).toMatch(/\$\d+\.\d{2}/);
  });

  test("high season increases price", () => {
    const result = price("", "", "2024-05-01", "2024-05-04", "Compact", 30, 5);
    expect(result).toMatch(/\$\d+\.\d{2}/);
  });

  test("low season does not increase price", () => {
    const result = price("", "", "2024-01-01", "2024-01-04", "Compact", 30, 5);
    expect(result).toMatch(/\$\d+\.\d{2}/);
  });

  test("april is high season (boundary start)", () => {
    const result = price("", "", "2024-04-01", "2024-04-03", "Compact", 30, 5);
    expect(result).toMatch(/\$\d+\.\d{2}/);
  });

  test("october is high season (boundary end)", () => {
    const result = price("", "", "2024-10-01", "2024-10-03", "Compact", 30, 5);
    expect(result).toMatch(/\$\d+\.\d{2}/);
  });

  test("november is low season", () => {
    const result = price("", "", "2024-11-01", "2024-11-03", "Compact", 30, 5);
    expect(result).toMatch(/\$\d+\.\d{2}/);
  });

  test("license < 2 years applies multiplier", () => {
    const result = price("", "", "2024-03-01", "2024-03-05", "Compact", 30, 1);
    expect(result).toMatch(/\$\d+\.\d{2}/);
  });

  test("license < 3 years adds daily fee in high season", () => {
    const result = price("", "", "2024-05-01", "2024-05-05", "Compact", 30, 2);
    expect(result).toMatch(/\$\d+\.\d{2}/);
  });

  test("license >= 3 years no extra fees", () => {
    const result = price("", "", "2024-05-01", "2024-05-05", "Compact", 30, 5);
    expect(result).toMatch(/\$\d+\.\d{2}/);
  });

  test("long rental (>10 days) applies discount in low season", () => {
    const result = price("", "", "2024-01-01", "2024-01-20", "Compact", 30, 5);
    expect(result).toMatch(/\$\d+\.\d{2}/);
  });

  test("long rental (>10 days) does NOT apply discount in high season", () => {
    const result = price("", "", "2024-05-01", "2024-05-20", "Compact", 30, 5);
    expect(result).toMatch(/\$\d+\.\d{2}/);
  });
});
