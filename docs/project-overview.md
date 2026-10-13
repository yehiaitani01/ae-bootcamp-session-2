# Project Overview

## Introduction

This project is a full-stack JavaScript application designed as a starter template for the Copilot Bootcamp by Slalom. It consists of a React frontend and a Node.js/Express backend, organized in a monorepo structure using npm workspaces.

## Architecture

The project follows a monorepo architecture with the following structure:

- `packages/frontend/`: React-based web application
- `packages/backend/`: Express.js API server

## Technology Stack

### Frontend
- React 18 (Create React App)
- MUI (Material UI) with a custom Frutiger Aero theme (`src/theme.js`); light and dark modes follow the system setting
- `fetch`-based API client (`src/api`), custom hooks (`src/hooks`), pure helpers (`src/utils`)
- User preferences (view, sort, filters, theme) persisted in `localStorage`

### Backend
- Node.js
- Express.js
- SQLite via better-sqlite3 (file at `DB_PATH`, default `packages/backend/data/todo.db`; `:memory:` for tests and E2E)
- Layered structure: `routes` -> `services` -> `db`, with `validation` and `middleware` (central error handler)

## Features

Tasks have a name, notes, due date (optional time), priority (none/low/medium/high), color, and completed state. The UI offers quick add, edit, duplicate, delete with undo, complete, clear completed, search, filters, sorting, and List / Day / Calendar views with keyboard shortcuts (press `?` in the app). Requirements are in `functional-requirements.md`.

### API (`/api/items`)

| Method and path | Purpose |
|-----------------|---------|
| `GET /api/items` | List; query: `status`, `priority`, `color`, `q`, `sort` (`due_date`, `priority`, `created_at`, `name`, `color`, `position`), `order` |
| `POST /api/items` | Create |
| `GET /api/items/:id` | Read one |
| `PATCH /api/items/:id` | Partial update (also used for completing) |
| `DELETE /api/items/:id` | Delete |
| `POST /api/items/:id/duplicate` | Duplicate |
| `DELETE /api/items/completed` | Delete all completed |
| `POST /api/items/reorder` | Manual order; used by drag-and-drop in the list view. Only the given items swap among their existing slots, so reordering a filtered list leaves other tasks in place |

Default order: incomplete first, then due date (undated last), priority, creation time.

### Configuration

| Variable | Default | Used by |
|----------|---------|---------|
| `PORT` | `3030` (backend), `3000` (frontend) | each server |
| `DB_PATH` | `packages/backend/data/todo.db` | backend |
| `BACKEND_PORT` | `3030` | frontend dev proxy (`src/setupProxy.js`) |
| `FRONTEND_PORT` | `3000` | Playwright |

### Testing
- **Unit Tests**: Test individual functions and React components in isolation using Jest
  - **File Extensions**: `*.test.js` or `*.test.ts`
  - **Backend Location**: `packages/backend/__tests__/`
  - **Frontend Location**: `packages/frontend/src/__tests__/`
  - Name test files to match what they're testing (e.g., `app.test.js` for testing `app.js`)

- **Integration Tests**: Test backend API endpoints with real HTTP requests using Jest + Supertest
  - **File Extensions**: `*.test.js` or `*.test.ts`
  - **Location**: `packages/backend/__tests__/integration/`
  - Name integration test files intelligently based on what they test (e.g., `items-api.test.js` for the items API)

- **End-to-End (E2E) Tests**: Test complete UI workflows through browser automation using Playwright
  - **File Extensions**: `*.spec.js` or `*.spec.ts`
  - **Location**: `tests/e2e/`
  - Use Playwright only, and only test with one browser
  - Tests must use Page Object Model (POM) pattern
  - Limit to 5-8 E2E tests covering critical user journeys (focus on quality over quantity) that are isolated and independent from one another
  - Name E2E test files based on the user journey they test (e.g., `add-task.spec.js`); page objects live in `tests/e2e/pages/` and shared fixtures in `tests/e2e/support/`

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)
- Playwright Chromium browser (run `npm run test:e2e:install` once)

### Installation
1. Clone the repository
2. Run `npm install` at the root of the project to install all dependencies
3. Start the development environment using `npm run start`

## Development Workflow

The project uses npm workspaces to manage the monorepo structure. You can:

- Run `npm run start` from the root to start both frontend and backend in development mode
- Run `npm test` from the root to run unit and integration tests for all packages
- Run `npm run lint` and `npm run format:check` before committing (`npm run format` fixes formatting)
- Run `npm run test:e2e` to run Playwright end-to-end (UI) tests
- Run `npm run test:all` to run all tests (unit, integration, and E2E)
- Work on individual packages by navigating to their directories and using their specific scripts

## Deployment

General Guidelines, Code Style and Testing Practices will be covered in the bootcamp sessions.
