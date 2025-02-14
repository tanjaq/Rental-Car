const { price } = require("../rentalPrice");

test("ban for driver with less than 1 year of license", () => {
	const pickupDate = "2024-07-01";
	const dropoffDate = "2024-07-05";
	const carType = "Compact";
	const driverAge = 25;
	const licenseDuration = 0.5;
	const expectedMessage = "Driver must have held a license for at least a year";

	const result = price(pickupDate, dropoffDate, carType, driverAge, licenseDuration);

	expect(result).toBe(expectedMessage);
});

test("ban for driver under 18", () => {
	const pickupDate = "2024-07-01";
	const dropoffDate = "2024-07-05";
	const carType = "Compact";
	const driverAge = 17;
	const licenseDuration = 2;
	const expectedMessage = "Driver too young - cannot quote the price";

	const result = price(pickupDate, dropoffDate, carType, driverAge, licenseDuration);

	expect(result).toBe(expectedMessage);
});

test("ban for driver under 21 with non-compact car", () => {
	const pickupDate = "2024-07-01";
	const dropoffDate = "2024-07-05";
	const carType = "Electric";
	const driverAge = 20;
	const licenseDuration = 2;
	const expectedMessage = "Drivers 21 y/o or less can only rent Compact vehicles";

	const result = price(pickupDate, dropoffDate, carType, driverAge, licenseDuration);

	expect(result).toBe(expectedMessage);
});

test("rental price for a young driver with a compact car", () => {
	const pickupDate = "2024-07-01";
	const dropoffDate = "2024-07-05";
	const carType = "Compact";
	const driverAge = 20;
	const licenseDuration = 2;
	const expectedPrice = "$190.00";

	const result = price(pickupDate, dropoffDate, carType, driverAge, licenseDuration);

	expect(result).toBe(expectedPrice);
});

test("rental price for a driver with a racer car in high season", () => {
	const pickupDate = "2024-07-01";
	const dropoffDate = "2024-07-05";
	const carType = "Racer";
	const driverAge = 24;
	const licenseDuration = 3;
	const expectedPrice = "$207.00";

	const result = price(pickupDate, dropoffDate, carType, driverAge, licenseDuration);

	expect(result).toBe(expectedPrice);
});

test("rental price for a driver with less than 2 years of license", () => {
	const pickupDate = "2024-07-01";
	const dropoffDate = "2024-07-05";
	const carType = "Compact";
	const driverAge = 25;
	const licenseDuration = 1;
	const expectedPrice = "$261.88";

	const result = price(pickupDate, dropoffDate, carType, driverAge, licenseDuration);

	expect(result).toBe(expectedPrice);
});

test("rental price for a driver with less than 3 years of license in high season", () => {
	const pickupDate = "2024-07-01";
	const dropoffDate = "2024-07-05";
	const carType = "Compact";
	const driverAge = 25;
	const licenseDuration = 2;
	const expectedPrice = "$218.75";

	const result = price(pickupDate, dropoffDate, carType, driverAge, licenseDuration);

	expect(result).toBe(expectedPrice);
});

test("rental price for a driver with more than 10 days in low season", () => {
	const pickupDate = "2024-01-01";
	const dropoffDate = "2024-01-12";
	const carType = "Compact";
	const driverAge = 30;
	const licenseDuration = 5;
	const expectedPrice = "$324.00";

	const result = price(pickupDate, dropoffDate, carType, driverAge, licenseDuration);

	expect(result).toBe(expectedPrice);
});

test("rental price for a driver with more than 10 days in high season", () => {
	const pickupDate = "2024-07-01";
	const dropoffDate = "2024-07-12";
	const carType = "Compact";
	const driverAge = 30;
	const licenseDuration = 5;
	const expectedPrice = "$414.00";

	const result = price(pickupDate, dropoffDate, carType, driverAge, licenseDuration);

	expect(result).toBe(expectedPrice);
});

test("rental price for a driver with pickup date in low season and dropoff date in high season", () => {
	const pickupDate = "2024-03-28";
	const dropoffDate = "2024-04-04";
	const carType = "Compact";
	const driverAge = 30;
	const licenseDuration = 5;
	const expectedPrice = "$240.00";

	const result = price(pickupDate, dropoffDate, carType, driverAge, licenseDuration);

	expect(result).toBe(expectedPrice);
});

test("rental price for a driver with pickup date in high season and dropoff date in low season", () => {
	const pickupDate = "2024-10-30";
	const dropoffDate = "2024-11-02";
	const carType = "Compact";
	const driverAge = 30;
	const licenseDuration = 5;
	const expectedPrice = "$138.00";

	const result = price(pickupDate, dropoffDate, carType, driverAge, licenseDuration);

	expect(result).toBe(expectedPrice);
});

test("rental price for a driver with pickup date in high season and dropoff date in high season", () => {
	const pickupDate = "2024-05-01";
	const dropoffDate = "2024-05-10";
	const carType = "Compact";
	const driverAge = 30;
	const licenseDuration = 5;
	const expectedPrice = "$345.00";

	const result = price(pickupDate, dropoffDate, carType, driverAge, licenseDuration);

	expect(result).toBe(expectedPrice);
});
