# Refactoring - car rental company price calculator

The client's request is to improve the program code to meet clean code standards while ensuring that all specified business requirements are met. This includes addressing bugs in the current code and incorporating any missing pieces of code to fulfill new requirements.

# How to get the project

To solve the task, proceed as follows:
1. Fork this repository on to your account
2. Clone the forked repo to your computer using `git clone URL`
3. Run `npm install` to install all dependencies
4. To run the project call `node index.js` start the app
5. Application will be available at http://localhost:3000/
6. Make all necessary changes and commit
7. Make a pull request for the original repo on GitHub
8. Grade is awarded to students who:
   -- Submits and shows a pull request with appropriately structured code.

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

# New business requirements (to be implemented)

- Individuals holding a driver's license for less than a year are ineligible to rent. 
- If the driver's license has been held for less than two years, the rental price is increased by 30%.
- If the driver's license has been held for less than three years, then an additional 15 euros will be added to the daily rental price during high season.

## Reminder/cheatsheet for refactoring

- Use meaningful names for variables, functions and classes.
- Use consistent indentation.
- Separate long functions into smaller parts. 
- Remove magic numbers - create constants. 
- Remove unused or unnecessary code. 

- Last but not least: Your code should still work after the refactoring!

## 16.02 Tunniülesanne
* Tänase tunni ülesandeks on paarisprogrammeerimine ja TDD.
* Palun jagunege paaridesse ja võtke üks versioon Car Rental refaktoreeritud ja testitud koodist
* Lisage uus funktsionaalsus kasutades TDD-d:
  
* Weekday/Weekend Pricing:

    * Write tests to ensure that pricing is different for weekdays and weekends. Write tests to verify correctly determined price based on the rental period.
    * Implement functionality to have different pricing for weekdays and weekends. Weekdays have regular price and weekend days have 5% price increase.
    * Example 1: 50 year old driver rents a car for three days: Monday, Tuesday, Wednesday - Total price $150
    * Example 2: 50 year old driver rents a car for three days: Thursday, Friday, Saturday - Total price $152.50
* Töö jaotus: 
   * Üks partneritest kirjutab testi. 
   * Teine kirjutab koodi, et test läbi läheks.
