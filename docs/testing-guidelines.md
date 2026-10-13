# Testing Guidelines

This document defines the testing principles for the TODO app. All new features must include appropriate tests, and all tests must be maintainable, isolated, and repeatable. For the project structure and commands, see [project-overview.md](project-overview.md). For the behavior being tested, see [functional-requirements.md](functional-requirements.md).

## 1. Core Principles

- **All new features must include appropriate tests.** A feature is not done until it has tests at the right level(s) (unit, integration, E2E).
- **Tests must be maintainable** and follow best practices: clear names, one behavior per test, no duplicated setup, no magic values.
- **All tests must be isolated and independent.** Each test sets up its own data and never relies on another test, on execution order, or on leftover state.
- **Setup and teardown hooks are required.** Tests must succeed on multiple consecutive runs, so they create the state they need and clean up after themselves.
- **Test behavior, not implementation.** Assert on outputs, responses, and what the user sees, not on private functions or internal state.
- **Keep tests deterministic.** No dependence on real time, randomness, or network. Fake timers and fixed dates are used for due-date logic (overdue, today, tomorrow).
- **Fix or remove flaky tests.** Never ignore or retry-until-green.

## 2. Test Types at a Glance

| Type | Tool | Scope | Location | File naming |
|------|------|-------|----------|-------------|
| Unit | Jest (+ React Testing Library for components) | Individual functions and React components in isolation | Backend: `packages/backend/__tests__/`<br>Frontend: `packages/frontend/src/__tests__/` | `*.test.js` / `*.test.ts` |
| Integration | Jest + Supertest | Backend API endpoints with real HTTP requests | `packages/backend/__tests__/integration/` | `*.test.js` / `*.test.ts` |
| End-to-end (E2E) | Playwright (required) | Complete UI workflows through browser automation | `tests/e2e/` | `*.spec.js` / `*.spec.ts` |

## 3. Unit Tests

- Use **Jest** to test individual functions and React components in isolation.
- Use the naming convention `*.test.js` or `*.test.ts`.
- Backend unit tests go in `packages/backend/__tests__/`.
- Frontend unit tests go in `packages/frontend/src/__tests__/`.
- **Name test files to match what they test**: `app.test.js` tests `app.js`; `TaskItem.test.js` tests `TaskItem.js`.
- Mock external dependencies (database, network, timers) so only the unit under test is exercised.
- For React components, test what the user sees and does (rendered text, roles, clicks, form input) rather than component internals.
- Typical unit-test targets for this app: sort-order logic, due-date helpers (overdue/today detection, friendly date formatting), priority and color validation, filter and search logic, and presentational components (task row, priority chip, color picker, view switcher).

## 4. Integration Tests

- Use **Jest + Supertest** to test **backend API endpoints** with real HTTP requests against the Express app.
- Place tests in `packages/backend/__tests__/integration/`.
- Use the naming convention `*.test.js` or `*.test.ts`.
- **Name files intelligently based on what they test**: `todos-api.test.js` for the TODO API endpoints.
- Cover, for each endpoint: the success path, validation errors (e.g. empty title, invalid priority or date), not-found cases, and the correct status codes and response bodies.
- Use an isolated data store for tests (in-memory or a dedicated test database/file), never the development data.
- Reset the data store in `beforeEach` (or create and delete the records each test needs in `beforeEach`/`afterEach`) so tests do not affect one another.

## 5. End-to-End (E2E) Tests

- Use **Playwright** (the required framework) to test **complete UI workflows** through browser automation.
- Place tests in `tests/e2e/`.
- Use the naming convention `*.spec.js` or `*.spec.ts`.
- **Name files based on the user journey they test**: `todo-workflow.spec.js`, `calendar-view.spec.js`.
- **Use one browser only** (Chromium). Do not configure multiple browsers or projects.
- **Use the Page Object Model (POM) pattern** for maintainability: page objects live in `tests/e2e/pages/` and encapsulate locators and actions; spec files contain only the scenario steps and assertions.
- **Limit E2E tests to 5-8 critical user journeys.** Focus on happy paths and key edge cases, not exhaustive coverage. Anything that can be tested at the unit or integration level should be tested there instead.
- Suggested journeys:
  1. Add a task and see it in the list.
  2. Edit a task (title, due date, priority, color).
  3. Complete and delete a task (with undo).
  4. Set due date and priority, and verify the sort order.
  5. Switch between list and calendar views and see tasks on the right day.
  6. Filter or search tasks.
- Locator and waiting best practices:
  - Prefer user-facing locators (`getByRole`, `getByLabel`, `getByText`) or dedicated `data-testid` attributes; avoid brittle CSS or XPath selectors.
  - Rely on Playwright's auto-waiting and web-first assertions (`expect(locator).toBeVisible()`). Never use fixed `waitForTimeout` sleeps.
- Each test creates its own data (through the UI or API) in `beforeEach`, and removes it in `afterEach`, so tests are independent and can run in any order or in parallel.

## 6. Port Configuration

Always use environment variables with sensible defaults for ports. This lets CI/CD workflows detect and override ports dynamically, and avoids hard-coded URLs in tests.

- **Backend**: `const PORT = process.env.PORT || 3030;`
- **Frontend**: React's default port is 3000, and it can be overridden with the `PORT` environment variable.
- Playwright's `baseURL` and any test URLs must be derived from these environment variables (with the same defaults), not hard-coded.

## 7. Isolation, Setup, and Teardown

- Each test must pass when run **alone**, **in any order**, and **repeatedly** (run the suite at least twice in a row locally to confirm).
- Use `beforeEach`/`afterEach` for per-test data and `beforeAll`/`afterAll` for expensive shared resources (e.g. starting and closing the server).
- Always close servers, connections, and timers after tests (`afterAll`) so Jest exits cleanly.
- Never share mutable state between tests (no module-level arrays that tests append to).
- Restore mocks, spies, and fake timers after each test (`jest.restoreAllMocks()`, `jest.useRealTimers()`).

## 8. Writing Maintainable Tests

- **Descriptive names**: describe the behavior and expected result, e.g. `it('returns 400 when the title is empty')`.
- **Arrange-Act-Assert**: structure each test in three clear steps.
- **One behavior per test**, with a small number of focused assertions.
- **Use factories/helpers** for building test data (e.g. `createTask({ priority: 'high' })`) instead of repeating object literals.
- **No logic in tests**: avoid loops and conditionals; use `it.each` for table-driven cases.
- **Don't test the framework or third-party libraries.**
- **Keep tests fast**: unit tests in milliseconds, integration tests in well under a second each, E2E tests only for what needs a real browser.
- **Test accessibility basics** in component and E2E tests by using role-based queries (a nice side effect: if a role query fails, the UI likely has an accessibility problem).

## 9. Running Tests

| Command | What it runs |
|---------|--------------|
| `npm test` | Frontend and backend unit tests |
| `npm run test:frontend` | Frontend unit tests |
| `npm run test:backend` | Backend unit tests |
| `npm run test:integration` | Backend integration tests |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test:e2e:install` | Install the Playwright browser (Chromium) |
| `npm run test:all` | Unit, integration, and E2E tests |

## 10. Definition of Done for Tests

Before a feature or fix is considered complete:

- [ ] New behavior has unit tests (and integration tests for new or changed API endpoints).
- [ ] Any new critical user journey is covered by an E2E test, while staying within the 5-8 E2E test limit.
- [ ] Tests follow the naming conventions and are in the correct directories.
- [ ] Tests are isolated, use setup/teardown, and pass on repeated runs.
- [ ] No ports, URLs, or secrets are hard-coded in tests.
- [ ] The full suite (`npm run test:all`) passes.
