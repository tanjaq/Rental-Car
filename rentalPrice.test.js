const { price } = require("./rentalPrice");

test("under 18 cannot rent", () => {
  expect(price("", "", Date.now(), Date.now(), "Compact", 17, 2))
    .toBe("Driver too young - cannot quote the price");
});

test("license <1 year fails", () => {
  expect(price("", "", Date.now(), Date.now(), "Compact", 25, 0.5))
    .toBe("License less than 1 year - cannot rent");
});

test("young driver only compact", () => {
  expect(price("", "", Date.now(), Date.now(), "Racer", 20, 2))
    .toBe("Drivers 21 y/o or less can only rent Compact vehicles");
});

test("weekday pricing", () => {
  const start = new Date("2026-03-02"); // Monday
  const end = new Date("2026-03-04");   // Wed

  expect(price("", "", start, end, "Compact", 50, 5))
    .toBe("$150.00");
});

test("weekend pricing", () => {
  const start = new Date("2026-03-05"); // Thu
  const end = new Date("2026-03-07");   // Sat

  expect(price("", "", start, end, "Compact", 50, 5))
    .toBe("$152.50");
});