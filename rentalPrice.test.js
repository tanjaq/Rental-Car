const { calculatePrice, getWeekandDays, getWeekDays, getWeekWeekendDays } = require("./rentalPrice");


describe("calculatePrice – validation rules", () => {

    //если < 18, то машина не дается
    test("Driver under 18 cannot rent", () => {
        const result = calculatePrice(
            "Compact",
            17,
            "2020-01-01",
            "2024-05-01",
            "2024-05-05"
        );

        expect(result).toBe("Driver too young - cannot quote the price");
    });

    //водители младше 18 могут брать тольео компакт
    test("Drivers 21 or less can only rent Compact", () => {
        const result = calculatePrice(
            "Electric",
            21,
            "2020-01-01",
            "2024-05-01",
            "2024-05-05"
        );

        expect(result).toBe("Drivers 21 y/o or less can only rent Compact vehicles");
    });

    test("Drivers with license less than 1 year cannot rent", () => {
        const result = calculatePrice(
            "Compact",
            25,
            "2026-01-01",
            "2026-05-01",
            "2026-05-05"
        );

        expect(result).toBe("Individuals holding a driver's license for less than a year are ineligible to rent");
    });


});

describe("calculatePrice – season logic", () => {

    // начиная с апреля =) сезон с большим спросом
    test("High season detected correctly (April)", () => {
        const result = calculatePrice(
            "Compact",
            30,
            "2015-01-01",
            "2024-04-10",
            "2024-04-12"
        );

        expect(result.startsWith("$")).toBe(true);
    });

    // если аренда > 10 дней, то применяется скидка 10 процентов
    test("Low season discount for long rental (>10 days)", () => {
        const result = calculatePrice(
            "Compact",
            30,
            "2015-01-01",
            "2024-01-01",
            "2024-01-15"
        );

        const price = Number(result.replace("$", ""));
        expect(price).toBeLessThan(30 * 15);
    });

    test("High season spans across months", () => {
        const result = calculatePrice(
            "Compact",
            30,
            "2015-01-01",
            "2024-02-15",
            "2024-05-15"
        );

        expect(result.startsWith("$")).toBe(true);
    });

});

describe("calculatePrice – pricing rules", () => {

    //Для класса Racer, если водитель ≤ 25 лет и сезон High — итоговая цена увеличивается на 50%.
    test("Racer + age <=25 + High Season → 50% increase", () => {
        const result = calculatePrice(
            "Racer",
            25,
            "2015-01-01",
            "2024-07-01",
            "2024-07-03"
        );

        const price = Number(result.replace("$", ""));
        const base = 25 * 3 * 1.15;

        expect(price).toBeGreaterThan(base);
    });

    test("Weekday pricing only for Mon-Tue-Wed rentals", () => {
        const result = calculatePrice(
            "Compact",
            50,
            "2010-01-01",
            "2025-01-06",
            "2025-01-08"
        );

        expect(result).toBe("$150.00");
    });

    test("Weekend premium applies only to weekend days", () => {
        const result = calculatePrice(
            "Compact",
            50,
            "2010-01-01",
            "2025-01-09",
            "2025-01-11"
        );

        expect(result).toBe("$152.50");
    });

    test("License less than 2 years increases price by 30%", () => {
        const result = calculatePrice(
            "Compact",
            25,
            "2025-01-01",
            "2026-01-06",
            "2026-01-08"
        );

        const price = Number(result.replace("$", ""));
        // Base: 25 * 3 = 75, then *1.3 = 97.5
        expect(price).toBe(97.5);
    });

    test("License less than 3 years in high season adds 15€ daily", () => {
        const result = calculatePrice(
            "Compact",
            25,
            "2024-01-01",
            "2026-05-05",
            "2026-05-07"
        );

        const price = Number(result.replace("$", ""));
        // Daily: 25 + 15 = 40, *3 = 120, high season *1.15 = 138
        expect(price).toBe(138);
    });

});

describe("calculatePrice – rental days calculation", () => {

    test("Same pickup and dropoff date counts as 1 day", () => {
        const result = calculatePrice(
            "Compact",
            30,
            "2010-01-01",
            "2024-05-01",
            "2024-05-01"
        );

        const price = Number(result.replace("$", ""));
        expect(price).toBeGreaterThan(0);
    });

    test('Calculate weekends', () => {
        const result = getWeekandDays("2026-02-14", "2026-02-16");
        expect(result).toBe(2);// тест для выходных
    })

    test('Calculate weekdays', () => {
        const result = getWeekDays("2026-02-14", "2026-02-16");
        expect(result).toBe(1);// тест для будних
    })
    
    test('Calculate weekweekenddays', () => {
        const result = getWeekWeekendDays("2026-02-14", "2026-02-16");
        expect(result).toBe(3);// тест для будних и выходных
    })
});



