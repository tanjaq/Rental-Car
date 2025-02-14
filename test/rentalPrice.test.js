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
  expect(rental.calculateSurcharge(42, 24, "Racer", 2, true, 0)).toBe(63);
});

test("A price for a racer driver that over 25 during high season will be 1.15 times higher", () => {
  expect(rental.calculateSurcharge(42, 26, "Racer", 2, true, 0)).toBe(48.3);
});

test("For a rental over 10 days, driver gets a 10% discound, if it is not a high season", () => {
  expect(rental.calculateSurcharge(40, 26, "Compact", 11, false, 0)).toBe(36);
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
test("14.02.2025 is not a weekend", () => {
  expect(rental.isWeekend("2025-02-14")).toBe(false);
});
test("15.02.2025 is a weekend", () => {
  expect(rental.isWeekend("2025-02-15")).toBe(true);
});
test("16.02.2025 is a weekend", () => {
  expect(rental.isWeekend("2025-02-16")).toBe(true);
});
test("During weekends price is increased by 5% for each weekend day", () => {
  expect(rental.calculateSurcharge(150, 50, "Compact", 3, false, 1)).toBe(
    152.5
  );
});
test("During weekends price is increased by 5% for each weekend day", () => {
  expect(rental.calculateSurcharge(150, 50, "Compact", 3, false, 2)).toBe(
    155
  );
});
test("During weekends price is increased by 5% for each weekend day", () => {
  expect(rental.calculateSurcharge(150, 50, "Compact", 3, false, 3)).toBe(
    157.5
  );
});
test("During normal days price is not increased", () => {
  expect(rental.calculateSurcharge(40, 26, "Compact", 2, false, 0)).toBe(40);
});
test("During normal days price is not increased", () => {
  expect(rental.calculateSurcharge(40, 26, "Compact", 2, false, 0)).toBe(40);
});
test("A 50 y.o driver can rent a car for 3 days where 1 day is a weekend for 152.5 dollars", () => {
  expect(
    rental.calculateRentalPrice("2025-02-13", "2025-02-15", "Compact", 50)
  ).toBe("Price: $152.50");
});
test("During a period of time from 13.02.2025 to 15.02.2025 there is a 1 weekend ", () => {
  expect(rental.getWeekendDays("2025-02-13", "2025-02-15")).toBe(1);
})