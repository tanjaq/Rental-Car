const { price } = require("./rentalPrice");

describe("Rental Price Calculator", () => {
  test("invalid date input", () => {
    expect(price("invalid", "2027-01-01", "Compact", 30, 5)).toBe(
      "Invalid date specified"
    );
  });

  test("dropoff before pickup", () => {
    expect(price("2027-01-02", "2027-01-01", "Compact", 30, 5)).toBe(
      "Dropoff date must be after pickup date"
    );
  });

  test("invalid car type", () => {
    expect(price("2027-01-01", "2027-01-02", "Truck", 30, 5)).toBe(
      "Invalid car type selected"
    );
  });

  test("missing car type returns error", () => {
    expect(price("2027-01-01", "2027-01-02", "", 30, 5)).toBe(
      "Invalid car type selected"
    );
  });

  test("invalid age", () => {
    expect(price("2027-01-01", "2027-01-02", "Compact", NaN, 5)).toBe(
      "Invalid driver age"
    );
  });

  test("under 18 cannot rent", () => {
    expect(price("2027-01-01", "2027-01-02", "Compact", 17, 5)).toBe(
      "Driver too young"
    );
  });

  test("age 18-21 can only rent compact", () => {
    expect(price("2027-01-01", "2027-01-02", "Electric", 20, 5)).toBe(
      "Drivers 21 y/o or less can only rent Compact vehicles"
    );
  });

  test("license less than 1 year cannot rent", () => {
    expect(price("2027-01-01", "2027-01-02", "Cabrio", 25, 0)).toBe(
      "Driver license held for less than a year - cannot rent"
    );
  });

  test("array type hits default branch", () => {
    expect(price("2027-01-01", "2027-01-02", [], 30, 5)).toBe(
      "Invalid car type selected"
    );
  });

  test("base price = age * days", () => {
    expect(price("2027-01-01", "2027-01-02", "Compact", 20, 5)).toBe("$41");
  });

  test("low season", () => {
    expect(price("2027-03-01", "2027-03-02", "Compact", 20, 5)).toBe("$40");
  });

  test("high season is counted with a single date", () => {
    expect(price("2027-03-15", "2027-04-15", "Compact", 30, 5)).toBe("$1117.8");
  });

  test("high season adds 15%", () => {
    expect(price("2027-06-01", "2027-06-02", "Compact", 20, 5)).toBe("$46");
  });

  test("more than 10 days in low season gets 10% discount", () => {
    expect(price("2027-01-01", "2027-01-11", "Compact", 20, 5)).toBe("$201.6");
  });

  test("more than 10 days in high season does not get discount", () => {
    expect(price("2027-06-01", "2027-06-11", "Compact", 20, 5)).toBe("$255.3");
  });

  test("racer + age <= 25 + high season adds +50%", () => {
    expect(price("2027-06-01", "2027-06-02", "Racer", 24, 5)).toBe("$82.8");
  });

  test("racer + low season does not add 50%", () => {
    expect(price("2027-01-01", "2027-01-02", "Racer", 26, 5)).toBe("$53.3");
  });

  test("license < 2 years adds 30%", () => {
    expect(price("2027-01-01", "2027-01-02", "Compact", 20, 1.5)).toBe("$53.3");
  });

  test("license < 3 years + high season adds $15 per day", () => {
    expect(price("2027-06-01", "2027-06-02", "Compact", 20, 2.5)).toBe("$76");
  });

  test("license less than 2 years and less than 3 years both rules apply", () => {
    expect(price("2027-06-01", "2027-06-02", "Compact", 20, 1.5)).toBe("$89.8");
  });

  test("10 days no discount", () => {
    expect(price("2027-01-01", "2027-01-10", "Compact", 20, 5)).toBe("$204");
  });

  test("age 21 allows compact", () => {
    expect(price("2027-01-01", "2027-01-02", "Compact", 21, 5)).toBe("$43.05");
  });

  test("age 25 respects racer rule", () => {
    // 25*2*1.5*1.15=86.25
    expect(price("2027-06-01", "2027-06-02", "Racer", 25, 5)).toBe("$86.25");
  });

  describe("weekday/weekend pricing", () => {
    test("only weekdays mon-wed", () => {
      expect(price("2027-06-07", "2027-06-09", "Compact", 50, 10)).toBe(
        "$172.5"
      );
    });

    test("only weekends sat-sun", () => {
      expect(price("2027-06-12", "2027-06-13", "Compact", 40, 5)).toBe("$96.6");
    });

    test("weekend adds 5% thu-sat", () => {
      expect(price("2027-06-10", "2027-06-12", "Compact", 50, 10)).toBe(
        "$175.38"
      );
    });

    test("each weekend days adds 5% fri-sun", () => {
      expect(price("2027-06-11", "2027-06-13", "Cabrio", 40, 5)).toBe("$142.6");
    });
  });
});
