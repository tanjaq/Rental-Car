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
  const end = new Date("2026-03-04"); // Wed

  expect(price("", "", start, end, "Compact", 50, 5))
    .toBe("$150.00");
});

test("weekend pricing", () => {
  const start = new Date("2026-03-05"); // Thu
  const end = new Date("2026-03-07"); // Sat

  expect(price("", "", start, end, "Compact", 50, 5))
    .toBe("$152.50");
});

test("license <2 years increases price", () => {
  const result = price("", "", new Date("2026-05-01"), new Date("2026-05-01"), "Compact", 30, 1);
  expect(result).not.toBe("$30.00");
});

test("license <3 years adds 15 in high season", () => {
  const result = price("", "", new Date("2026-06-01"), new Date("2026-06-01"), "Compact", 30, 2);
  expect(result).toContain("$");
});

test("unknown car type", () => {
  expect(price("", "", Date.now(), Date.now(), "Tank", 30, 5))
    .toBe("Unknown car class - cannot quote the price");
});

test("long rental discount in low season", () => {
  const start = new Date("2026-01-01");
  const end = new Date("2026-01-12");

  const result = price("", "", start, end, "Compact", 50, 5);

  expect(result).toBe("$550.00");
});

test("racer young driver surcharge", () => {
  const start = new Date("2026-06-01");

  const result = price("", "", start, start, "Racer", 24, 5);

  expect(result).not.toBe("$24.00");
});

test("no long rental discount in high season", () => {
  const start = new Date("2026-06-01");
  const end = new Date("2026-06-12");

  const result = price("", "", start, end, "Compact", 50, 5);

  expect(result).not.toBe("$540.00");
});

test("single day weekend price", () => {
  const start = new Date("2026-03-07");

  const result = price("", "", start, start, "Compact", 50, 5);

  expect(result).toBe("$52.50");
});

test("uses default license years when license years is missing", () => {
  const start = new Date("2026-03-02");
  const end = new Date("2026-03-02");

  expect(price("", "", start, end, "Compact", 50))
    .toBe("$50.00");
});

test("low season short rental has no high season increase", () => {
  const start = new Date("2026-01-05");
  const end = new Date("2026-01-07");

  expect(price("", "", start, end, "Compact", 50, 5))
    .toBe("$150.00");
});
