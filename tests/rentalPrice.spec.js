const { getRentalPrice } = require("../rentalPrice");

describe("getRentalPrice", () => {
  it("should reject drivers under 18", () => {
    const result = getRentalPrice(
      "2024-02-01",
      "2024-02-05",
      "Compact",
      17,
      "2023-01-01",
      "2025-01-01"
    );
    expect(result).toBe("Driver too young - cannot quote the price");
  });

  it("should only allow drivers 21 or less to rent Compact vehicles", () => {
    const result = getRentalPrice(
      "2024-02-01",
      "2024-02-05",
      "Racer",
      21,
      "2023-01-01",
      "2025-01-01"
    );
    expect(result).toBe(
      "Drivers 21 y/o or less can only rent Compact vehicles"
    );
  });

  it("should calculate rental price correctly for eligible drivers", () => {
    const result = getRentalPrice(
      "2024-01-01",
      "2024-01-05",
      "Compact",
      25,
      "2020-01-01",
      "2025-01-01"
    );
    expect(result).toMatch(/^\$\d+/);
  });

  it("should reject rental for drivers with less than a year of license issuance", () => {
    const result = getRentalPrice(
      "2024-02-01",
      "2024-02-05",
      "Compact",
      22,
      "2023-12-01",
      "2024-01-01"
    );
    expect(result).toBe(
      "Individuals holding a driver's license for less than a year are ineligible to rent."
    );
  });

  it("should apply high season rate correctly", () => {
    const result = getRentalPrice(
      "2024-06-01",
      "2024-06-05",
      "Compact",
      30,
      "2019-01-01",
      "2025-01-01"
    );
    expect(result).toMatch(/^\$\d+/);
  });

  it("should apply discounts for long rentals in low season", () => {
    const result = getRentalPrice(
      "2024-01-01",
      "2024-01-12",
      "Electric",
      30,
      "2019-01-01",
      "2025-01-01"
    );
    expect(result).toMatch(/^\$\d+/);
  });
});
