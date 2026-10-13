# Functional Requirements

This document lists the core functional requirements for the TODO app. Each requirement has an ID so it can be referenced from code, tests, and issues.

## 1. Task Management

| ID | Requirement |
|----|-------------|
| FR-1.1 | The user can create a task with a title (required) and an optional description. |
| FR-1.2 | The user can edit any field of an existing task (title, description, due date, priority, color, etc.). |
| FR-1.3 | The user can mark a task as complete and revert it to incomplete. |
| FR-1.4 | The user can delete a task, with a confirmation step and an undo option. |
| FR-1.5 | Title validation: empty or whitespace-only titles are rejected with a clear error message. |

## 2. Due Dates

| ID | Requirement |
|----|-------------|
| FR-2.1 | The user can add an optional due date (and optionally a time) to a task when creating or editing it. |
| FR-2.2 | The user can change or remove a due date at any time. |
| FR-2.3 | Overdue tasks (due date in the past and not completed) are visually highlighted. |
| FR-2.4 | Tasks due today are visually distinguished from other tasks. |
| FR-2.5 | Due dates are displayed in a human-friendly format (e.g. "Today", "Tomorrow", "Mon, 12 Jan"). |

## 3. Priority

| ID | Requirement |
|----|-------------|
| FR-3.1 | The user can set a priority on a task: **High**, **Medium**, **Low**, or **None** (default). |
| FR-3.2 | The priority can be changed at any time via the edit form or a quick action on the task. |
| FR-3.3 | The priority is shown on each task with a distinct indicator (label or icon, not color alone). |

## 4. Sorting

| ID | Requirement |
|----|-------------|
| FR-4.1 | Tasks are sorted in a defined, predictable order. The default order is: incomplete before completed, then due date (earliest first, tasks without a due date last), then priority (High to Low), then creation date (oldest first). |
| FR-4.2 | The user can change the sort criterion: due date, priority, creation date, title (A-Z), or color. |
| FR-4.3 | The user can toggle the sort direction (ascending/descending). |
| FR-4.4 | The user can optionally reorder tasks manually via drag and drop; this manual order is persisted. |
| FR-4.5 | The selected sort option is remembered between sessions. |

## 5. Colors

| ID | Requirement |
|----|-------------|
| FR-5.1 | The user can assign a color to each task from a predefined palette. |
| FR-5.2 | The user can change or clear a task's color at any time. |
| FR-5.3 | A task's color is shown consistently in every view (list, day, calendar). |
| FR-5.4 | Colors must meet accessibility contrast requirements and must not be the only way information is conveyed. |
| FR-5.5 | The user can filter tasks by color. |

## 6. Views

| ID | Requirement |
|----|-------------|
| FR-6.1 | **List view**: tasks are displayed as a list, grouped by day (e.g. Overdue, Today, Tomorrow, Upcoming, No date). |
| FR-6.2 | **Day view**: the user can view all tasks for a single selected day and navigate to the previous/next day. |
| FR-6.3 | **Calendar view**: tasks are displayed on a monthly calendar grid, on the day they are due, using their assigned color. |
| FR-6.4 | The user can switch between list and calendar views at any time with a single control. |
| FR-6.5 | Selecting a day in the calendar view opens the day's task list. |
| FR-6.6 | The user can create a task directly from a calendar day, pre-filling the due date. |
| FR-6.7 | A "Today" shortcut returns the user to the current day/month from any view. |
| FR-6.8 | The last selected view is remembered between sessions. |

## 7. Filtering and Search

| ID | Requirement |
|----|-------------|
| FR-7.1 | The user can search tasks by title and description. |
| FR-7.2 | The user can filter tasks by status (all, active, completed), priority, and color. |
| FR-7.3 | Active filters are clearly visible and can be cleared with a single action. |

## 8. Ease-of-Life Features

| ID | Requirement |
|----|-------------|
| FR-8.1 | **Quick add**: a single input field lets the user add a task by typing a title and pressing Enter. |
| FR-8.2 | **Inline editing**: the user can edit a task title directly in the list (e.g. double-click). |
| FR-8.3 | **Undo/redo** for delete, complete, and edit actions. |
| FR-8.4 | **Bulk actions**: select multiple tasks to complete, delete, or change priority, color, or due date. |
| FR-8.5 | **Subtasks / checklist**: a task can contain subtasks, with progress shown on the parent task. |
| FR-8.6 | **Recurring tasks**: a task can repeat daily, weekly, monthly, or on a custom schedule. |
| FR-8.7 | **Reminders**: the user can set a reminder before a task's due date/time. |
| FR-8.8 | **Tags/labels**: the user can add tags to tasks and filter by them. |
| FR-8.9 | **Duplicate task**: the user can duplicate an existing task. |
| FR-8.10 | **Keyboard shortcuts** for common actions (new task, search, switch view, mark complete). |
| FR-8.11 | **Clear completed**: the user can remove all completed tasks in one action. |
| FR-8.12 | **Task counters**: the app shows the number of active, completed, and overdue tasks. |
| FR-8.13 | **Reschedule shortcuts**: quickly move a task to today, tomorrow, next week, or via drag and drop on the calendar. |
| FR-8.14 | **Dark mode** and a light mode, following the system preference by default. |
| FR-8.15 | **Empty states**: helpful messages and calls to action when there are no tasks or no search results. |

## 9. Data and Persistence

| ID | Requirement |
|----|-------------|
| FR-9.1 | Tasks are persisted by the backend API and survive page reloads and restarts. |
| FR-9.2 | The user's preferences (view, sort, filters, theme) are persisted. |
| FR-9.3 | The user can export tasks (JSON/CSV) and import them back. |
| FR-9.4 | The UI reflects changes immediately (optimistic updates) and shows clear error messages if a request fails. |

## 10. Non-Functional Expectations

| ID | Requirement |
|----|-------------|
| FR-10.1 | The UI is responsive and usable on desktop, tablet, and mobile screen sizes. |
| FR-10.2 | The app is accessible: keyboard navigable, screen-reader friendly, with sufficient color contrast (WCAG AA). |
| FR-10.3 | Loading and error states are displayed for all asynchronous operations. |

## Priorities

- **Must have (core)**: sections 1-6 and FR-9.1.
- **Should have**: section 7, FR-8.1, FR-8.2, FR-8.3, FR-8.9, FR-8.11, FR-8.12, FR-8.15, FR-9.2, FR-9.4.
- **Nice to have**: remaining FR-8.x items, FR-9.3.
