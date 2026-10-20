# SauceDemo BDD automation

Small Playwright + TypeScript + Cucumber framework for the 24-hour take-home.
Cucumber is the runner; Playwright provides browser automation and retrying assertions.

## Quick start

Use Node.js 22 or newer, with internet access to SauceDemo and the package/browser
registries. Run commands from this folder:

```bash
npm ci
npx playwright install chromium
npm run typecheck
npm test
```

For Linux systems missing browser libraries: `npx playwright install --with-deps chromium`.
Open `reports/cucumber.html` in your browser after execution. Screenshots of failed
scenarios are embedded as attachments. JSON output is at `reports/cucumber.json`.

Optional configuration: copy `config/.env.example` to `config/.env` (using your file
manager, `cp` on macOS/Linux or `Copy-Item` in PowerShell). Change `BROWSER` to
`chromium`, `chrome`, `firefox` or `webkit`; `chrome` runs branded Google Chrome.
Install it with `npx playwright install chrome`. Change `HEADLESS=false` to see the browser.
Headed runs pause 500 ms after each Playwright action by default; set `SLOW_MO_MS` to
adjust the delay. For example: `BROWSER=chrome HEADLESS=false SLOW_MO_MS=1000 npm test`.
Install another browser with `npx playwright install firefox` or `webkit` first.
Shell/CI environment variables override the .env file. Never commit credentials.

```bash
npm run test:smoke
npm test -- --tags @negative
npm test -- --tags @purchase
npm run test:dry
```

`test:dry` checks Gherkin/step matching without opening a browser; it does not prove
that locators or application behavior work. There is no `playwright.config.ts`:
this project uses the Cucumber runner and its config plus our environment module.
Do not run these scenarios with `npx playwright test`.

## Structure and BDD flow

- `features/`: business-readable Gherkin only; purchase and negative login scenarios.
- `steps/`: maps sentences to page methods; no selectors or browser setup here.
- `pages/`: page actions, centralized locators and page-specific assertions.
- `support/`: scenario World, browser factory, hooks, logging and DB utility.
- `config/`: Cucumber config, environment parsing and safe .env example.
- `testdata/`: public demo users and fictional customer data.
- `docs/`: DB validation notes and validation status.
- `.github/workflows/`: automated smoke run and report artifact upload.

Flow: feature -> matching step -> page object -> Playwright -> browser.
Before creates a fresh browser/context/page and page objects stored on this scenario's
World. After attaches a screenshot on failure, then closes context/browser using
finally, including when setup only partially succeeded. Scenario state is not global.

## Scenario coverage

Purchase: login and Products title/URL; add Backpack; badge equals 1; correct cart
product and quantity; checkout information; overview URL; completion URL, title and
thank-you message. Negative login: full authentication error text and login URL/form.
The two scenarios are independent and can run alone or in either order.

## Locator Strategy for Adding “Sauce Labs Backpack”

Preferred (implemented in ProductsPage):

```typescript
// browserFactory configures selectors.setTestIdAttribute('data-test')
await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
```

This uses an explicit test attribute for the product's button. It survives styling
and many layout changes. It depends on the application keeping this attribute stable.
An explicit mapping supports the product names accepted by the page method.

Fallback (documented alternative, not a silent automatic retry):

```typescript
const card = page.locator('.inventory_item').filter({
  has: page.getByText('Sauce Labs Backpack', { exact: true })
});
await card.getByRole('button', { name: 'Add to cart', exact: true }).click();
```

The fallback scopes a semantic button to the correct product card, so no positional
index or long XPath is needed. It is less ideal because CSS class and visible copy
can change. Do not automatically catch primary-locator failures and switch strategy:
that can hide a broken locator contract. Update the page object deliberately.

## Database testing

`support/database.ts` supplies a config-driven PostgreSQL pool, typed parameterized
queries, safe errors and explicit teardown. The UI suite does not instantiate it or
require DATABASE_URL. See `docs/DB_VALIDATION.md` for UI-to-DB pseudocode, SQL,
isolation, cleanup and bounded eventual-consistency polling. No live DB verification
is claimed because SauceDemo supplies no DB endpoint.

## Engineering Notes

### 1. Why this structure?

Business intent, orchestration, page behavior and infrastructure have separate homes.
A locator change stays in its page; a scenario stays readable. Page-level assertions
encapsulate what proves that page's state. For two scenarios, this avoids an elaborate
base-class hierarchy while leaving clear extension points.

### 2. How does the wait strategy prevent flakiness?

Playwright actions wait for relevant actionability checks. Web-first assertions such
as toHaveText/toHaveURL retry until the expected state appears (default assertion
budget: 5 seconds). Actions default to 10 seconds and navigation to 30 seconds via
config. Cucumber's per-step/hook timeout is 120 seconds to accommodate several awaited
actions. No fixed UI sleeps and no blanket networkidle waiting are used. Fresh
contexts prevent cookies/cart state leaking between tests. Test retries are disabled
so failures remain visible; automatic waiting is not the same as rerunning a test.

### 3. How do locators improve stability?

Stable data-test attributes identify controls independently of visual order. Exact
text and scoped product checks disambiguate repeated elements. No nth() selection
or brittle DOM chains. All locators live in page objects.

### 4. How would this scale to 50+ scenarios?

Organize features/steps by business domain, share focused page components, parameterize
useful examples and create isolated data per scenario. Avoid enormous shared step
files. Reuse one browser per Cucumber worker but retain a new context for every
scenario; the current fresh browser per scenario is simple but more expensive.
Enable a small worker count after checking shared-account/backend isolation. Use tags
to select smoke vs regression and keep fixtures immutable. Do not share mutable Worlds.

### 5. How would this run in CI/CD?

The GitHub Actions workflow checks out code, installs Node and locked dependencies,
installs Chromium/system libraries, typechecks, runs smoke tests headlessly, and
uploads reports even on failure. Download the cucumber-report artifact from the run,
unzip it and open cucumber.html locally. The workflow runs on pushes, pull requests
and manual dispatch. Real secrets belong in GitHub Actions secrets, not fixture files.

### 6. Two improvements with more time

1. Add Playwright traces on failure for richer network/DOM diagnostics.
2. Add an isolated PostgreSQL integration test environment to verify the DB utility,
   cleanup and delayed persistence against a real schema.

## Assumptions and tradeoffs

- SauceDemo's public standard_user/secret_sauce credentials are demo fixtures only.
- Checkout data is fictional. No real payments are made by this demo application.
- Chromium is the validated target if execution succeeds; other engines are configurable
  but require their own runs. See the precise status in docs/VALIDATION.md.
- Only the specified Backpack product is mapped; unsupported product names fail clearly.
- PostgreSQL is a proposed DB integration choice, not a claim about SauceDemo's backend.
- Bonus features included: @smoke selection, HTML reporting and GitHub Actions.

## AI usage disclosure

## AI Usage Disclosure

I used ChatGPT to generate the initial Playwright + TypeScript + Cucumber framework based on the assignment requirements. This included page objects, step definitions, hooks, configuration, test data, reporting, the GitHub Actions workflow, and supporting documentation.

GitHub Copilot later assisted with adding the configurable `SLOW_MO_MS` option for slower headed execution and updating the documentation.

I reviewed the generated framework, including the step definitions, page objects, hooks, locator strategy and database utility. I also ran the tests locally in headed mode with `SLOW_MO_MS=1000` to observe execution. I did not manually change the generated code.

Execution results and verification details are recorded in `docs/VALIDATION.md`.


## Submission

Submit this folder as a ZIP or upload its contents to a GitHub repository. Do not include
node_modules, real .env files or private data. Record your own 5–8-minute walkthrough
and include its accessible link below (or a video file).
Review the code so you can change a locator and add an assertion live.

Walkthrough video: https://drive.google.com/file/d/1ivfA4-9NlqSFdoPCJ7D2sOFXfftB1osS/view?usp=share_link

## References

- https://playwright.dev/docs/locators
- https://playwright.dev/docs/test-assertions
- https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md
- https://node-postgres.com/features/queries
