const fs = require('node:fs');
fs.mkdirSync('reports', { recursive: true });
module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['support/world.ts', 'support/hooks.ts', 'steps/**/*.ts'],
    format: ['progress', 'html:reports/cucumber.html', 'json:reports/cucumber.json'],
    parallel: 1,
    retry: 0,
  },
};
