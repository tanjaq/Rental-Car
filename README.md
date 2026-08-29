# Car rental company price calculator

The client's request is to improve the program code to meet clean code standards while ensuring
that all specified business requirements are met. This includes addressing bugs in the current
code and incorporating any missing pieces of code to fulfill new requirements.

The code in this repository **runs**. It is not obviously broken. That is the point: the bugs in
it look like working code, and several of them only show up on specific dates, at specific ages,
or in the browser rather than in a unit test.

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

* The licence length arrives as a **seventh argument** to `price(...)`, after `age`. The booking
  form does not collect it yet — wiring it through `form.html` and `index.js` is part of the task.

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

## Otsused, mida keegi sinu eest ei tee

The requirements above are the real thing: written by a client, in prose, with gaps. Nothing in
this section has an answer printed anywhere in the repository. Work these out before you write
code, and record what you decided in a comment.

**1. In what order do the adjustments apply?**

The rules list a `+50%`, a `+15%`, a `-10%`, a `+30%` and a flat `+15 €` per day. Applied in
different orders these produce different totals. The sharpest case: is the 15 €/day fresh-licence
charge part of the **daily rate** (so the high-season 15% applies on top of it), or a **flat fee**
added to the finished total? Both are honest readings of the sentence. They differ by real money.

**2. Where exactly are the boundaries?**

"April until end of October". "18-21". "25 years old or younger". "more than 10 days". Every one
of those has an edge, and the code in front of you already answers some of them — not always the
way the requirements do. Before you refactor anything, work out for each rule which single input
sits exactly on the edge, and what the current code returns for it.

**3. What is a price?**

Try a 100-year-old renting a Compact car for one day on 15 October. Look at the number you get
back. Decide what a price is allowed to look like.

**4. The tests and the users see different things.**

Unit tests only see `rentalPrice.js`. A customer only ever sees the booking form. Start the app
with `node index.js`, open http://localhost:3000/, and try to rent a **Compact car as a
20-year-old**. Then try the same thing by calling `price(...)` directly. If those two disagree,
your unit tests can be green and the product still broken — find out where the disagreement
comes from, and decide which side should change.

## Kuidas AI-d kasutada

You are expected to use AI for this task. You are not expected to get anything useful out of
"here is my code, make it clean" — try it and see. The bugs in this repository were written to
survive that prompt, because to an AI they look like decisions someone made on purpose.

What works better is separating the steps you would otherwise let it blur together.

**Diagnose before you repair.** Ask for a list, not a patch:

> Here are the business requirements and here is the code. List every place where the code
> disagrees with the requirements. Quote the line and the rule. Do not fix anything yet.

**Ask for edges by name.** AI will not test boundaries unless you make it:

> For each rule in these requirements, give me the exact input value that sits on the boundary,
> and tell me what the current code returns for that value.

**Make it compute both readings instead of choosing for you:**

> This requirement can mean A or B. Calculate the total for a 30-year-old, 3 days,
> 10-12 June 2024, licence held 2.5 years, under both readings. Show the arithmetic.

**When a test fails, work backwards from the number:**

> The test expects $148.50, my code returns $155.25. Do not change my code. Tell me what order
> of operations produces 148.50 from these inputs.

**Refactor and verify separately:**

> Restructure this function without changing any output. Then list every behaviour change you
> made, so I can check them against my tests.

Two rules of engagement:

- **Never commit a change you cannot explain in one sentence.** You will be asked.
- **A green test is evidence, an AI explanation is not.** If they disagree, find out why before
  you touch anything.

And a warning: `npx eslint . --fix` will silence most of the style complaints in about
a second. It will not rename a function, delete dead code, split a function that does too much,
or find a single one of the bugs. What is left after `--fix` is the actual assignment.

## What the CI checks

Three jobs run on every pull request, and each one leaves a comment on the PR.

| Job | Passes when |
| --- | --- |
| **Lint / Clean Code** | `eslint .` reports zero errors *and* zero warnings, with `camelcase` enforced. Covers `index.js` and your test files too. |
| **Test Coverage** | Your own Jest tests pass and reach 100% lines, statements, functions and branches. |
| **Functional Requirements Test** | A hidden test suite covering the requirements above, including the boundary cases and the booking form wiring. |

All three fail on the code as it stands today. That is the starting position, not a mistake.

The Functional Requirements job calls your `price(...)` and tolerates a few reasonable signature
changes (positional without the location arguments, a single options object, or an export named
`calculatePrice`). It does not tolerate changing what the function *returns*. Note also that CI
runs with `TZ=UTC` — if your results depend on the machine's timezone, that is a bug worth
finding.
