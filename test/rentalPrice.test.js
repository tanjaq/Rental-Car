const rental = require("../main/rentalPrice");

test("Driver under 18 cannot rent a car", () => {
  expect(
    rental.calculateRentalPrice("2024-01-01", "2024-02-02", "Compact", 15)
  ).toBe("Driver too young - cannot quote the price");
});

test("Drivers 21 y/o or less can only rent Compact vehicles", () => {
  expect(
    rental.calculateRentalPrice("2024-01-01", "2024-02-02", "Electir", 19)
  ).toBe("Drivers 21 y/o or less can only rent Compact vehicles");
});

test("Drivers that are 22 y.o can get a Compact car for 2 days for 44 bucks during a low season", () => {
  expect(
    rental.calculateRentalPrice("2024-01-01", "2024-01-02", "Compact", 22)
  ).toBe("Price: $44.00");
});

test("A 21 y.o driver can get a car for 2 days for 42 eurs", () => {
  expect(rental.calculateBaseRentalPrice(21, 2)).toBe(42);
});

test("A price for a racer driver that is under 25 during high season will be 1.5 times higher", () => {
  expect(rental.calculateSurcharge(42, 24, "Racer", 2, true)).toBe(63);
});

test("A price for a racer driver that over 25 during high season will be 1.15 times higher", () => {
  expect(rental.calculateSurcharge(42, 26, "Racer", 2, true)).toBe(48.3);
});

test("For a rental over 10 days, driver gets a 10% discound, if it is not a high season", () => {
  expect(rental.calculateSurcharge(40, 26, "Compact", 11, false)).toBe(36);
});
test("High season is from april to october", () => {
  expect(rental.isHighSeason("2024-04-12", "2024-07-00")).toBe(true);
});
test("High season is if car is taken from april up to october", () => {
  expect(rental.isHighSeason("2024-04-12", "2024-07-00")).toBe(true);
});
test("It is not high season is if car is taken from oktober and returned before april", () => {
  expect(rental.isHighSeason("2024-11-12", "2025-03-00")).toBe(false);
});
test("A price is being rounded to the second integer", () => {
  expect(rental.formatRentalPrice(2.33)).toBe("Price: $2.33");
});
