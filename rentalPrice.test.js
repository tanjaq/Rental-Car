const assert = require("node:assert/strict");
const registerTest = typeof test === "function" ? test : require("node:test");
const { price } = require("./rentalPrice");

const cases = [
  [
    "under 18",
    17,
    3,
    "compact",
    "2026-01-05",
    "2026-01-05",
    "Driver too young - cannot quote the price"
  ],
  [
    "18 can rent compact",
    18,
    3,
    "compact",
    "2026-01-05",
    "2026-01-05",
    "$18.00"
  ],
  [
    "21 cannot rent electric",
    21,
    3,
    "electric",
    "2026-01-05",
    "2026-01-05",
    "Drivers 21 y/o or less can only rent Compact vehicles"
  ],
  [
    "22 can rent electric",
    22,
    3,
    "Electric",
    "2026-01-05",
    "2026-01-05",
    "$22.00"
  ],
  [
    "cabrio accepted",
    30,
    3,
    "cabrio",
    "2026-01-05",
    "2026-01-05",
    "$30.00"
  ],
  [
    "case insensitive",
    30,
    3,
    "COMPACT",
    "2026-01-05",
    "2026-01-05",
    "$30.00"
  ],
  [
    "unknown category",
    30,
    3,
    "van",
    "2026-01-05",
    "2026-01-05",
    "Unknown car type"
  ],
  [
    "under one year",
    30,
    0.9,
    "compact",
    "2026-01-05",
    "2026-01-05",
    "Driver must hold a licence for at least one year"
  ],
  [
    "exactly one year",
    30,
    1,
    "compact",
    "2026-01-05",
    "2026-01-05",
    "$39.00"
  ],
  [
    "below two years",
    30,
    1.9,
    "compact",
    "2026-01-05",
    "2026-01-05",
    "$39.00"
  ],
  [
    "exactly two years",
    30,
    2,
    "compact",
    "2026-01-05",
    "2026-01-05",
    "$30.00"
  ],
  [
    "March is low season",
    30,
    3,
    "compact",
    "2026-03-31",
    "2026-03-31",
    "$30.00"
  ],
  [
    "April is high season",
    30,
    3,
    "compact",
    "2026-04-01",
    "2026-04-01",
    "$34.50"
  ],
  [
    "October is high season",
    30,
    3,
    "compact",
    "2026-10-30",
    "2026-10-30",
    "$34.50"
  ],
  [
    "November is low season",
    30,
    3,
    "compact",
    "2026-11-02",
    "2026-11-02",
    "$30.00"
  ],
  [
    "25 year old racer in high season",
    25,
    3,
    "Racer",
    "2026-04-01",
    "2026-04-01",
    "$43.13"
  ],
  [
    "26 year old racer in high season",
    26,
    3,
    "racer",
    "2026-04-01",
    "2026-04-01",
    "$29.90"
  ],
  [
    "young racer low season",
    25,
    3,
    "racer",
    "2026-01-05",
    "2026-01-05",
    "$25.00"
  ],
  [
    "three years no daily fee",
    30,
    3,
    "compact",
    "2026-04-01",
    "2026-04-01",
    "$34.50"
  ],
  [
    "below three years high season fee",
    30,
    2.9,
    "compact",
    "2026-04-01",
    "2026-04-01",
    "$49.50"
  ],
  [
    "multipliers before fixed licence fee",
    30,
    1,
    "compact",
    "2026-04-01",
    "2026-04-01",
    "$59.85"
  ],
  [
    "invalid age",
    "abc",
    3,
    "compact",
    "2026-01-05",
    "2026-01-05",
    "Age and licence years must be numbers"
  ],
  [
    "invalid experience",
    30,
    "abc",
    "compact",
    "2026-01-05",
    "2026-01-05",
    "Age and licence years must be numbers"
  ],
  [
    "invalid pickup date",
    30,
    3,
    "compact",
    "invalid",
    "2026-01-05",
    "Invalid rental dates"
  ],
  [
    "invalid return date",
    30,
    3,
    "compact",
    "2026-01-05",
    "invalid",
    "Invalid rental dates"
  ],
  [
    "reversed dates rejected",
    30,
    3,
    "compact",
    "2026-01-06",
    "2026-01-05",
    "Invalid rental dates"
  ],
  [
    "both dates included",
    50,
    3,
    "compact",
    "2026-01-05",
    "2026-01-07",
    "$150.00"
  ],
  [
    "ten days receive no long rental discount",
    30,
    3,
    "compact",
    "2026-01-05",
    "2026-01-14",
    "$303.00"
  ],
  [
    "eleven low season days receive discount",
    30,
    3,
    "compact",
    "2026-01-05",
    "2026-01-15",
    "$299.70"
  ],
  [
    "eleven high season days receive no discount",
    30,
    3,
    "compact",
    "2026-04-06",
    "2026-04-16",
    "$382.95"
  ],
  [
    "rental spanning high season",
    30,
    3,
    "compact",
    "2026-03-31",
    "2026-04-01",
    "$69.00"
  ],
  [
    "TDD Monday-Wednesday",
    50,
    3,
    "compact",
    "2026-01-05",
    "2026-01-07",
    "$150.00"
  ],
  [
    "TDD Thursday-Saturday",
    50,
    3,
    "compact",
    "2026-01-08",
    "2026-01-10",
    "$152.50"
  ],
  [
    "TDD Sunday",
    50,
    3,
    "compact",
    "2026-01-11",
    "2026-01-11",
    "$52.50"
  ],
  [
    "TDD Friday-Monday",
    50,
    3,
    "compact",
    "2026-01-09",
    "2026-01-12",
    "$205.00"
  ]
];

cases.forEach(([name, age, experience, type, first, last, expected]) => {
  registerTest(name, () => {
    assert.equal(price("Tallinn", "Tallinn", first, last, type, age, experience), expected);
  });
});

registerTest("one way fee applies once per booking", () => {
  const same = price("Tallinn", "Tallinn", "2026-01-05", "2026-01-07", "compact", 50, 3);
  const other = price("Tallinn", "Tartu", "2026-01-05", "2026-01-07", "compact", 50, 3);
  assert.equal(same, "$150.00");
  assert.equal(other, "$175.00");
});
