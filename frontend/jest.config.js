const nextJest = require("next/jest");
const createJestConfig = nextJest({
  dir: "./",
});
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
};

module.exports = createJestConfig(customJestConfig);

// v2

// import "@testing-library/jest-dom";
// const nextJest = require("next/jest");

// const createJestConfig = nextJest({
//   dir: "./",
// });

// const customJestConfig = {
//   setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
//   moduleNameMapper: {
//     "^@/components/(.*)$": "<rootDir>/components/$1",
//     ".(css|less|scss|sass)$": "identity-obj-proxy",
//   },
//   testEnvironment: "jsdom",
// };

// module.exports = createJestConfig(customJestConfig);
