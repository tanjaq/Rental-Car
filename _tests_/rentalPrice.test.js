const { price } = require("../rentalPrice");

const WEEKEND_SURCHARGE_RATE = 0.05;

function countWeekendDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return 0;
    }
    const from = end < start ? end : start;
    const to = end < start ? start : end;
    let days = 0;
    for (let current = new Date(from); current <= to; current = new Date(current.getTime() + 24 * 60 * 60 * 1000)) {
        const day = current.getDay();
        if (day === 0 || day === 6) {
            days += 1;
        }
    }
    return days;
}

describe("rentalPrice", () => {
    test("rejects drivers younger than 18", () => {
        const quote = price("Berlin", "Berlin", "2024-06-01", "2024-06-02", "compact", 17, 5);
        expect(quote).toBe("Driver too young - cannot quote the price");
    });

    test("rejects non-Compact cars for drivers 21 or younger", () => {
        const quote = price("Berlin", "Berlin", "2024-06-01", "2024-06-02", "electric", 20, 3);
        expect(quote).toBe("Drivers 21 y/o or less can only rent Compact vehicles");
    });

    test("requires at least one year of driving license", () => {
        const quote = price("Berlin", "Berlin", "2024-05-01", "2024-05-02", "compact", 30, undefined);
        expect(quote).toBe("Driver must hold a license for at least 1 year");
    });

    test("applies racer high-season surcharge for young drivers", () => {
        const quote = price("Berlin", "Berlin", "2024-07-01", "2024-07-03", "racer", 24, 5);
        expect(quote).toBe("$124.20");
    });

    test("adds high-season fee for licenses under three years", () => {
        const quote = price("Paris", "Paris", "2024-08-10", "2024-08-11", "compact", 30, 2.5);
        expect(quote).toBe("$102.45");
    });

    test("multiplies price for licenses under two years in low season", () => {
        const quote = price("Paris", "Paris", "2024-01-01", "2024-01-05", "electric", 30, 1.5);
        expect(quote).toBe("$195.00");
    });

    test("applies long-rental discount only in low season", () => {
        const quote = price("Rome", "Rome", "2024-01-01", "2024-01-11", "cabrio", 30, 5);
        expect(quote).toBe("$299.70");
    });

    test("falls back to Compact class for unknown car types", () => {
        const quote = price("Madrid", "Madrid", "invalid", "still invalid", "spaceship", 30, 5);
        expect(quote).toBe("$30.00");
    });

    test("returns $0.00 when calculated price is not finite", () => {
        const quote = price("Vienna", "Vienna", "2024-06-01", "2024-06-01", "compact", NaN, 5);
        expect(quote).toBe("$0.00");
    });

    test("treats cross-year low-to-high season rentals as high season", () => {
        const pickup = "2024-02-28";
        const dropoff = "2024-11-01";
        const age = 40;
        const licenseYears = 5;
        const msPerDay = 24 * 60 * 60 * 1000;
        const days = Math.round((new Date(dropoff) - new Date(pickup)) / msPerDay) + 1;
        const weekendDays = countWeekendDays(pickup, dropoff);
        const expectedBase = age * days + age * WEEKEND_SURCHARGE_RATE * weekendDays;
        const expected = (expectedBase * 1.15).toFixed(2);

        const quote = price("Tallinn", "Tallinn", pickup, dropoff, "compact", age, licenseYears);
        expect(quote).toBe(`$${expected}`);
    });

    test("marks rentals high season when dropoff is in high season", () => {
        const pickup = "2024-02-28";
        const dropoff = "2024-04-02";
        const age = 40;
        const licenseYears = 10;
        const msPerDay = 24 * 60 * 60 * 1000;
        const days = Math.round((new Date(dropoff) - new Date(pickup)) / msPerDay) + 1;
        const weekendDays = countWeekendDays(pickup, dropoff);
        const expectedBase = age * days + age * WEEKEND_SURCHARGE_RATE * weekendDays;
        const expected = (expectedBase * 1.15).toFixed(2);

        const quote = price("Helsinki", "Helsinki", pickup, dropoff, "compact", age, licenseYears);
        expect(quote).toBe(`$${expected}`);
    });

    test("defaults to Compact when type is omitted", () => {
        const quote = price("Oslo", "Oslo", "2024-01-10", "2024-01-10", undefined, 30, 5);
        expect(quote).toBe("$30.00");
    });

    test("caps rental days at a minimum of one when dropoff precedes pickup", () => {
        const quote = price("Lisbon", "Lisbon", "2024-07-10", "2024-07-08", "compact", 30, 3);
        expect(quote).toBe("$34.50");
    });

    test("charges regular price for weekday-only rentals", () => {
        const quote = price("Tallinn", "Tallinn", "2024-02-05", "2024-02-07", "compact", 50, 30);
        expect(quote).toBe("$150.00");
    });

    test("adds a 5% surcharge for weekend days", () => {
        const quote = price("Tallinn", "Tallinn", "2024-02-08", "2024-02-10", "compact", 50, 30);
        expect(quote).toBe("$152.50");
    });
});