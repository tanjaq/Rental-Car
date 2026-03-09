const { price } = require("./rentalPrice");

describe("rentalPrice", () => {
  test("returns error for drivers under 18", () => {
    const result = price("A", "B", "2024-02-10", "2024-02-10", "Compact", 17);
    expect(result).toBe("Driver too young - cannot quote the price");
  });

  test("applies racer high-season multiplier for 25-year-old", () => {
    const result = price("A", "B", "2024-06-10", "2024-06-10", "Racer", 25);
    expect(result).toBe("$43.125");
  });
});
