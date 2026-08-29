# Car rental company price calculator

The client's request is to improve the program code to meet clean code standards while ensuring
that all specified business requirements are met. This includes addressing bugs in the current
code and incorporating any missing pieces of code to fulfill new requirements.

## How to get the project

1. Fork this repository on to your account
2. Clone the forked repo to your computer using `git clone URL`
3. Run `npm install` to install all dependencies
4. To run the project call `node index.js` to start the app
5. Application will be available at http://localhost:3000/
6. Make all necessary changes and commit
7. Make a pull request for the original repo on GitHub

Every pull request is checked automatically. See [What the CI checks](#what-the-ci-checks) below.

## Current business requirements

- Rental cars are categorized into 4 classes: Compact, Electric, Cabrio, Racer.
- Individuals under the age of 18 are ineligible to rent a car.
- Those aged 18-21 can only rent Compact cars.
- For Racers, the price is increased by 50% if the driver is 25 years old or younger
  (except during the low season).
- Low season is from November until end of March.
- High season is from April until end of October.
- If renting in High season, price is increased by 15%.
- If renting for more than 10 days, price is decreased by 10% (except during the high season).
- The minimum rental price per day is equivalent to the age of the driver.

## Ülesanne 1: Refaktoreerimine + uued nõuded

* Tänase tunni ülesanne:
   * Tutvu olemasoleva koodiga
   * Refaktoreeri kood
   * Lisa uus funktsionaalsus
   * Kontrolli, et kõik nõuded (uued ja vanad) töötavad korrektselt.

* New requirements:
  * Individuals holding a driver's license for less than a year are ineligible to rent.
  * If the driver's license has been held for less than two years, the rental price is
    increased by 30%.
  * If the driver's license has been held for less than three years, then an additional
    15 euros will be added to the daily rental price during high season.
  * A one-way rental, where the car is dropped off somewhere other than the pickup location,
    carries a flat 25 euro fee.

* The licence length arrives as a **seventh argument** to `price(...)`, after `age`. The booking
  form does not collect it yet — wiring it through `form.html` and `index.js` is part of the task.
  The one-way fee uses the `pickup` and `dropoff` arguments the function already receives.

* Reminder/cheatsheet for refactoring
   * Use meaningful names for variables, functions and classes.
   * Use consistent indentation.
   * Separate long functions into smaller parts.
   * Remove magic numbers - create constants.
   * Remove unused or unnecessary code.
   * Last but not least: Your code should still work after the refactoring!

## Ülesanne 2: Unit testimine

* Tänase tunni ülesandeks on unit testimine.
* Kata oma refaktoreeritud kood unit testidega
   * Jest on juba projektis olemas
   * Dokumentatsioon: https://jestjs.io/docs/getting-started
   * Testide jooksutamine `npx jest`
   * Testide jooksutamine analüüsiga `npx jest --coverage`
* Kata testidega 100% koodist

Coverage is measured on **every** `.js` file in the project except the express entry point —
see `jest.config.js`. If you split your code into several modules, all of them need tests. Code
you never call cannot be covered, which means dead code has to go rather than be tested.

## Ülesanne 3: TDD

* Tänase tunni ülesandeks on paarisprogrammeerimine ja TDD.
   * Palun jagunege paaridesse ja võtke üks versioon Car Rental refaktoreeritud ja testitud koodist
   * Lisage uus funktsionaalsus kasutades TDD-d.

* Weekday/Weekend Pricing:
    * Write tests to ensure that pricing is different for weekdays and weekends. Write tests to
      verify correctly determined price based on the rental period.
    * Implement functionality to have different pricing for weekdays and weekends. Weekdays have
      regular price and weekend days have 5% price increase.
    * Example 1: 50 year old driver rents a car for three days: Monday, Tuesday, Wednesday -
      Total price $150
    * Example 2: 50 year old driver rents a car for three days: Thursday, Friday, Saturday -
      Total price $152.50

* Töö jaotus:
   * Üks partneritest kirjutab testi.
   * Teine kirjutab koodi, et test läbi läheks.

## Working with AI on this task

AI is good at producing code that looks finished. It is much less good at noticing that a
requirement is ambiguous, that a comparison should have been `<=`, or that a green test suite
says nothing about the parts you did not test. Those are the parts you have to own.

What helps is separating steps you would otherwise let it blur together.

**Diagnose before you repair.** Ask for a list, not a patch:

> Here are the business requirements and here is the code. List every place where the code
> disagrees with the requirements. Quote the line and the rule. Do not fix anything yet.

**Ask for edges by name.** Boundaries do not get tested unless you ask:

> For each rule in these requirements, give me the exact input value that sits on the boundary,
> and tell me what the current code returns for that value.

**When a requirement can be read two ways, make it compute both instead of choosing for you:**

> This requirement can mean A or B. Calculate the total for a 30-year-old, 3 days,
> 10-12 June 2024, licence held 2.5 years, under both readings. Show the arithmetic.

**When a test fails, work backwards from the number:**

> The test expects $148.50, my code returns $155.25. Do not change my code. Tell me what order
> of operations produces 148.50 from these inputs.

**Refactor and verify as separate steps:**

> Restructure this function without changing any output. Then list every behaviour change you
> made, so I can check them against my tests.

Three habits that matter more than any prompt:

- **Never commit a change you cannot explain in one sentence.** You will be asked.
- **A green test is evidence, an AI explanation is not.** If they disagree, find out why before
  you touch anything.
- **Run the application, not just the tests.** A passing test suite is evidence about the code
  you tested, not about the product a customer uses.

One practical note: `npx eslint . --fix` will silence most of the style complaints in about a
second. It will not rename a function, delete unused code, split a function that does too much,
or find a single bug. What is left after `--fix` is the actual assignment.

## What the CI checks

Three jobs run on every pull request, and each one leaves a comment on the PR.

| Job | Passes when |
| --- | --- |
| **Lint / Clean Code** | `eslint .` reports zero errors *and* zero warnings, with `camelcase` enforced. Covers `index.js` and your test files too. |
| **Test Coverage** | Your own Jest tests pass and reach 100% lines, statements, functions and branches. |
| **Functional Requirements Test** | A hidden test suite covering the requirements above, including the boundary cases and the booking form wiring. |

All three fail on the code as it stands today. That is the starting position, not a mistake.

The Functional Requirements job calls
`price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears)`. It tolerates two
reasonable variations — taking a single options object instead of positional arguments, or
exporting the function as `calculatePrice` — but it does not tolerate dropping arguments or
changing what the function *returns*. Note also that CI runs with `TZ=UTC`; if your results
depend on the machine's timezone, that is a bug worth finding.
