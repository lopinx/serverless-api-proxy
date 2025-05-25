// e:\Developer\serverless-api-proxy\jest.config.cjs
module.exports = {
  // Specifies the test environment, 'node' is suitable for backend/worker logic.
  testEnvironment: 'node',

  // Automatically clear mock calls, instances, contexts, and results before every test.
  // This helps in making tests independent.
  clearMocks: true,

  // The directory where Jest should output its coverage files.
  coverageDirectory: 'coverage',

  // An array of glob patterns indicating a set of files for which coverage information should be collected.
  // Adjust the path if your source files are in a different directory (e.g., 'src/**/*.js').
  collectCoverageFrom: ['src/_worker.js'],

  // If your tests or the code being tested rely on Cloudflare Workers-specific globals or APIs
  // that are not available in a standard Node.js environment, you might need to:
  // 1. Mock these globals/APIs manually in your tests or a setup file.
  // 2. Consider using a more specialized test environment like 'miniflare'
  //    (though this adds complexity and dependencies).
  // For now, 'node' with appropriate mocking is a common approach.

  // Jest's built-in ESM support has improved significantly.
  // For a project with "type": "module" and modern Node.js versions,
  // explicit transforms for .js files are often not needed.
  // transform: {}, // Explicitly empty if no transforms are required.
};