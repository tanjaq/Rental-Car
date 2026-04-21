const rentalPrice = require("../rentalPrice.js");

test("Rejects drivers under 18 years old", () => {
    const result = rentalPrice.price("2026-03-10", "2026-03-12", "Compact", 17, 3);
    expect(result).toBe("Driver too young - cannot quote the price");
});

test("Rejects drivers under 22 from renting other cars besides compacts", () => {
    const result = rentalPrice.price("2026-03-10", "2026-03-12", "Racer", 19, 3);
    expect(result).toBe("Drivers 21 y/o or less can only rent Compact vehicles");
});

test("Rejects drivers holding drivers licence less than a year", () => {
    const result = rentalPrice.price("2026-03-10", "2026-03-12", "Compact", 19, 0.5);
    expect(result).toBe("Individuals holding a driver's license for less than a year are ineligible to rent.");
});

test("Applies new license 30% increase for holding licence less than 2 years", () => {
    const result = rentalPrice.price("2026-03-10", "2026-03-12", "Compact", 19, 1.5);
    expect(result).toBe("$74.10");
});

test("Adds high-season daily surcharge for holding licence less than 3 years", () => {
    const result = rentalPrice.price("2026-06-01", "2026-06-03", "Compact", 19, 2.5);
    expect(result).toBe("$110.55");
});

test("Applies Racer high-season multiplier for eligible driver age", () => {
    const result = rentalPrice.price("2026-06-01", "2026-06-03", "Racer", 25, 3);
    expect(result).toBe("$129.38");
});

test("Applies standard high-season multiplier for non-Racer vehicles", () => {
    const result = rentalPrice.price("2026-06-01", "2026-06-03", "Compact", 21, 3);
    expect(result).toBe("$72.45");
});

test("Does not apply Racer high-season multiplier when driver is older than racer limit", () => {
    const result = rentalPrice.price("2026-06-01", "2026-06-03", "Racer", 26, 3);
    expect(result).toBe("$89.70");
});

test("Applies low-season discount for rentals longer than 10 days", () => {
    const result = rentalPrice.price("2026-01-01", "2026-01-12", "Compact", 21, 3);
    expect(result).toBe("$230.58");
});

test("Does not apply low-season discount when rental duration is exactly 10 days", () => {
    const result = rentalPrice.price("2026-01-01", "2026-01-10", "Compact", 21, 3);
    expect(result).toBe("$213.15");
});

test("Does not apply new-license increase at exactly 2 years", () => {
    const result = rentalPrice.price("2026-03-10", "2026-03-12", "Compact", 20, 2);
    expect(result).toBe("$60.00");
});

test("Does not add high-season daily surcharge at exactly 3 years", () => {
    const result = rentalPrice.price("2026-06-01", "2026-06-03", "Compact", 21, 3);
    expect(result).toBe("$72.45");
});

test("Treats rentals spanning before and after high season as high season", () => {
    const result = rentalPrice.price("2026-02-01", "2026-11-01", "Compact", 21, 3);
    expect(result).toBe("$6712.49");
});

// Weekday/Weekend Pricing
test("Applies regular pricing for only weekday rentals", () => {
    const result = rentalPrice.price("2026-03-09", "2026-03-13", "Compact", 50, 3);
    expect(result).toBe("$250.00");
});

test("Applies 5% price increase for only weekday rentals", () => {
    const result = rentalPrice.price("2026-03-14", "2026-03-15", "Compact", 50, 3);
    expect(result).toBe("$105.00");
});

test("Week-long rental with weekdays and weekends", () => {
    const result = rentalPrice.price("2026-03-09", "2026-03-15", "Compact", 50, 3);
    expect(result).toBe("$355.00");
});

test("2 Week-long rental with weekdays and weekends", () => {
    const result = rentalPrice.price("2026-03-09", "2026-03-22", "Compact", 50, 3);
    expect(result).toBe("$639.00");
});

test("Weekend surcharge applies independently with license surcharge", () => {
    const result = rentalPrice.price("2026-03-13", "2026-03-14", "Compact", 50, 1.5);
    expect(result).toBe("$133.25");
});