# Coding Guidelines

This document describes how we write code in this project and the quality principles behind it. The project is a JavaScript monorepo (React frontend, Express backend, npm workspaces), and the standards below follow widely accepted software engineering practices, with the extra rigor expected in banking and other regulated environments: code must be correct, readable, auditable, secure, and easy to change safely.

The guiding idea is simple: **code is read far more often than it is written**. Every rule here exists to make the next reader's job easier, and that reader is often you, six months later.

## 1. General Formatting

Consistent formatting removes noise from code reviews and lets people focus on logic instead of style.

- **Indentation**: 2 spaces, never tabs. Files use UTF-8 encoding, LF line endings, and end with a single newline. No trailing whitespace.
- **Line length**: keep lines to about 100 characters. Break long expressions, argument lists, and chains across lines.
- **Quotes and semicolons**: single quotes for strings (template literals when interpolating) and semicolons at the end of statements.
- **Trailing commas**: use them in multi-line arrays, objects, and argument lists. They make diffs smaller.
- **Braces and spacing**: always use braces for `if`, `else`, `for`, and `while` blocks, even for one-line bodies. Put spaces around operators and after commas. Use one blank line to separate logical blocks, and never more than one in a row.
- **Modern JavaScript**: use `const` by default, `let` only when reassignment is needed, and never `var`. Prefer arrow functions for callbacks, destructuring, optional chaining (`?.`), nullish coalescing (`??`), and `async`/`await` over promise chains. Always use strict equality (`===` / `!==`).
- **Formatter**: formatting is enforced by tooling, not by hand. Use Prettier with the settings above, run it on save and in CI, and never debate style in code reviews that a formatter can settle.

## 2. Naming

Good names make comments unnecessary. A name should say what something is or does, in the vocabulary of the problem domain.

| Kind | Convention | Example |
|------|-----------|---------|
| Variables and functions | `camelCase`, verbs for functions | `dueDate`, `sortTasksByPriority()` |
| Booleans | Prefixed with `is`, `has`, `can`, `should` | `isOverdue`, `hasDueDate` |
| React components | `PascalCase`, file named the same | `TaskItem.js` |
| Constants | `UPPER_SNAKE_CASE` for true constants | `DEFAULT_PORT`, `MAX_TITLE_LENGTH` |
| Files (non-component) | `kebab-case` or `camelCase`, used consistently within a package | `todos-api.js` |
| Event handlers | `handle` + event in the component, `on` + event as a prop | `handleSave`, `onSave` |
| Custom hooks | `use` prefix | `useTasks` |

Avoid abbreviations, single-letter names (except short loop indexes or tiny lambdas), and vague names like `data`, `info`, `temp`, or `handleStuff`. Use the same word for the same concept everywhere (always "task", not "task", "item", and "todo" interchangeably in new code).

## 3. Import Organization

Imports are grouped, in this order, with one blank line between groups:

1. Node.js built-in modules (`path`, `fs`)
2. Third-party packages (`express`, `react`)
3. Internal modules from other parts of the project (absolute or cross-package paths)
4. Relative imports from the same feature (`./TaskItem`, `../utils/dates`)
5. Styles and static assets (`./App.css`)

Within each group, sort alphabetically by module path. Additional rules:

- Import only what you use, and remove unused imports (the linter flags them).
- Prefer named imports and exports over default exports where practical, since they are easier to search, refactor, and auto-import.
- Avoid deep relative paths like `../../../utils`; if that happens, the structure probably needs rethinking.
- Avoid circular dependencies. If two modules need each other, extract the shared piece into a third module.
- Keep one primary export per file for components, and keep `index` files for re-exports minimal.
- Do not use wildcard imports (`import * as`) unless a library is designed for it.

## 4. Linting and Static Analysis

A linter is the first and cheapest reviewer, and it runs in the editor, locally before commit, and in CI.

- **Tool**: ESLint. The frontend already extends `react-app` and `react-app/jest` (via Create React App). The backend should adopt ESLint with `eslint:recommended` plus Node rules, and both packages should add Prettier (via `eslint-config-prettier`) so formatting and linting never conflict.
- **Zero warnings policy**: the main branch has no lint errors and no lint warnings. If a rule produces false positives, change the rule in the shared config with a team decision, not with scattered exceptions.
- **Disabling rules** (`// eslint-disable-next-line`) is a last resort. It must be as narrow as possible and include a short reason on the same line.
- **Rules we rely on**: no unused variables or imports, no `console.log` in committed code (use a logger), no `var`, `eqeqeq`, `no-shadow`, `prefer-const`, `no-return-await`, React Hooks rules (`rules-of-hooks`, `exhaustive-deps`), and accessibility rules (`jsx-a11y`).
- **Automation**: a pre-commit hook (e.g. Husky + lint-staged) runs the formatter and linter on changed files, and CI fails the build on any lint error. Running lint locally should be a single command at the repo root.
- **Dependencies**: keep them minimal and current, and review `npm audit` results regularly. Never add a library for something small that the language can already do.

## 5. Core Quality Principles

### DRY (Don't Repeat Yourself)

Every piece of knowledge should have a single, authoritative home. When the same logic, constant, or validation rule appears in several places, a fix in one place silently leaves the others broken. Extract shared logic into well-named functions, hooks, components, or constants. Two cautions: wait for the **third** occurrence before abstracting (a wrong abstraction is more expensive than a little duplication), and only merge code that is the same for the same reason, not code that merely looks alike.

### KISS and YAGNI

Choose the simplest solution that meets today's requirement. Do not build features, options, or extension points "just in case". Unused flexibility is still code that has to be read, tested, and maintained.

### Single Responsibility and Small Units

A function does one thing, a component renders one concern, and a module has one reason to change. As a rule of thumb, functions stay under about 30 lines, take no more than 3 or 4 parameters (use an options object otherwise), and nest no deeper than 2 or 3 levels. Prefer early returns (guard clauses) over deeply nested `if` statements.

### Separation of Concerns

Keep layers distinct:

- **Backend**: routes handle HTTP concerns only, services hold business rules, and the data layer owns storage. Business logic never lives inside route handlers or in the database layer.
- **Frontend**: presentational components render UI, hooks and services handle state and API calls, and pure utility functions hold logic like date and sort helpers. Components do not call `fetch` directly.

### Pure Functions and Immutability

Prefer pure functions (same input, same output, no side effects) for logic such as sorting, filtering, and date calculations, because they are trivial to test. Never mutate function arguments or React state; return new arrays and objects (`map`, `filter`, spread) instead.

### Fail Fast, Fail Clearly

Validate inputs at the system boundary (API request bodies, form input) and reject bad data early with a precise message. Inside the system, trust validated data rather than re-checking it everywhere. Never swallow errors with an empty `catch`.

### Boy Scout Rule

Leave the code a little cleaner than you found it, but keep unrelated cleanups in separate commits so reviews stay focused.

## 6. Comments and Documentation

- Write code that explains itself; comment on **why**, not **what**. Good comments record a business rule, a non-obvious constraint, a workaround, or a trade-off.
- Do not leave commented-out code (version control remembers it) or stale TODOs. A TODO must reference an issue.
- Use JSDoc for public functions, shared utilities, and API handlers whose contract is not obvious from their name and types.
- Update documentation in `docs/` in the same change that alters the behavior it describes.

## 7. Error Handling and Logging

- **Backend**: use a central Express error-handling middleware. Return consistent JSON error responses with the right HTTP status codes (400 validation, 404 not found, 500 unexpected) and never leak stack traces or internals to clients.
- **Frontend**: surface errors to the user in plain language with a way to recover (see [ui-guidelines.md](ui-guidelines.md)), and handle loading and error states for every async operation. Use error boundaries for unexpected render failures.
- **Async code**: always handle rejected promises, and use `try`/`catch` with `async`/`await` at the boundary where the error can actually be handled.
- **Logging**: use a logger with levels (`error`, `warn`, `info`, `debug`) instead of `console.log`. Log enough context to diagnose a problem, and never log sensitive data (credentials, tokens, personal information).

## 8. Security and Data Handling

Because this guideline follows banking-grade discipline, security is part of normal coding, not a final review step.

- **Treat all input as untrusted**: validate type, length, format, and range on the server, even if the UI already validated it.
- **Prevent injection and XSS**: use parameterized queries if a database is added, rely on React's default escaping, and never use `dangerouslySetInnerHTML` or build HTML from user input.
- **Secrets and configuration**: never commit secrets. Read configuration (ports, URLs, keys) from environment variables with safe defaults (see the port rules in [testing-guidelines.md](testing-guidelines.md)).
- **Least privilege and minimal data**: collect, store, and return only what is needed.
- **Dependencies**: keep them updated, pin versions through the lockfile, and review advisories.
- **HTTP hardening**: set secure headers (e.g. `helmet`), configure CORS explicitly instead of allowing every origin, and limit request body size.

## 9. React Conventions

- Use function components and hooks only. Follow the Rules of Hooks and keep dependency arrays complete.
- Keep components small and focused. Extract a child component or custom hook when a component grows past roughly 150 lines or mixes concerns.
- Derive values from state instead of duplicating them in more state. Keep state as local as possible and lift it only when needed.
- Use stable, unique `key` props (the task ID, never the array index for dynamic lists).
- Use semantic HTML elements and accessible labels first, ARIA second.
- Define styles using the design tokens from [ui-guidelines.md](ui-guidelines.md) rather than hard-coded colors, spacing, or radii.

## 10. API Conventions (Backend)

- RESTful, resource-oriented routes with plural nouns (`/api/todos`, `/api/todos/:id`) and correct HTTP verbs (`GET`, `POST`, `PUT`/`PATCH`, `DELETE`).
- JSON request and response bodies with consistent field naming (`camelCase`), ISO 8601 for dates (`2026-01-31T09:00:00Z`).
- Return appropriate status codes (`200`, `201`, `204`, `400`, `404`, `500`) and a predictable error shape, e.g. `{ "error": "Title is required" }`.
- Keep route handlers thin: parse and validate the request, call a service, and return the response.

## 11. Version Control and Code Review

- **Small, focused commits and pull requests**: one logical change at a time, so it can be reviewed and reverted safely.
- **Commit messages**: short imperative summary line (under about 72 characters), such as `Add due date to task form`, with a body explaining why when it is not obvious.
- **Branches**: short-lived feature branches (e.g. `feature/due-dates`) merged into `main` through pull requests. No direct commits to `main`.
- **Pull requests** must pass lint, formatting, and all tests ([testing-guidelines.md](testing-guidelines.md)) before review, and need at least one approving review.
- **Reviewers check** correctness, readability, test quality, security implications, and adherence to these guidelines. Be specific and kind in feedback, and treat reviews as shared ownership of quality, not gatekeeping.

## 12. Definition of Done for Code

Before a change is ready to merge:

- [ ] It satisfies the relevant requirements in [functional-requirements.md](functional-requirements.md).
- [ ] Formatting and lint checks pass with zero warnings.
- [ ] Names are clear, there is no duplicated logic, and functions and components are small and focused.
- [ ] Inputs are validated, errors are handled, and nothing sensitive is logged or committed.
- [ ] Tests are added or updated and the full suite passes.
- [ ] Documentation is updated where behavior changed.
- [ ] The change has been reviewed and approved.
