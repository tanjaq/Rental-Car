module.exports = {
  testEnvironment: "node",

  // Coverage is measured on every .js file in the project except the express
  // entry point and config files. If you split your code into several modules,
  // all of them have to be covered - and code you no longer use has to go.
  collectCoverageFrom: [
    "**/*.js",
    "!index.js",
    "!server.js",
    "!app.js",
    "!**/*.config.js",
    "!**/*.test.js",
    "!**/node_modules/**",
    "!**/coverage/**"
  ]
};
