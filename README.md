# Refactoring - car rental company price calculator

The client's request is to improve the program code to meet clean code standards while ensuring that all specified business requirements are met. This includes addressing bugs in the current code and incorporating any missing pieces of code to fulfill new requirements.

# Current business requirements

- Rental cars are categorized into 4 classes: Compact, Electric, Cabrio, Racer.

- Individuals under the age of 18 are ineligible to rent a car.
- Those aged 18-21 can only rent Compact cars.
- For Racers, the price is increased by 50% if the driver is 25 years old or younger (except during the low season).

- Low season is from November until end of March. 
- High season is from April until end of October.
- If renting in High season, price is increased by 15%.

- If renting for more than 10 days, price is decresed by 10% (except during the high season).

- The minimum rental price per day is equivalent to the age of the driver.
